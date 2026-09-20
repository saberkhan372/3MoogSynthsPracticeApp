'use strict';

(function exposeCoachEngine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_COACH = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  // Adaptive coaching reducer. Design: docs/design/07-adaptive-coaching.md.
  // Pipeline per action: rack facts → interaction lens → candidate generators →
  // priority/score arbitration. The engine keeps no state between calls; everything it
  // learns about the player lives in the session model the caller threads through.
  const endpointKey = endpoint => `${endpoint.instrumentId}:${endpoint.jackId}`;
  const sameEndpoint = (left, right) => left?.instrumentId === right?.instrumentId &&
    left?.jackId === right?.jackId;
  const sameCable = (left, right) => sameEndpoint(left?.from, right?.from) &&
    sameEndpoint(left?.to, right?.to);
  const cableKey = cable => `${endpointKey(cable.from)}>${endpointKey(cable.to)}`;

  const GUIDANCE_LEVELS = ['off', 'coach', 'teach'];
  const GUIDANCE = Object.freeze({
    off: { rungTouches: Infinity, proactiveGap: Infinity, alternates: 0 },
    coach: { rungTouches: 3, proactiveGap: 3, alternates: 2 },
    teach: { rungTouches: 2, proactiveGap: 1, alternates: 4 }
  });
  const PROGRESS_SCHEMA_VERSION = 2;
  // Version 1 stored only { rung, known }, which conflated "we explained this" with
  // "the learner did something". Version 2 keeps rung as the content-selection stage
  // and records the evidence separately.
  const NO_PROGRESS = Object.freeze({
    rung: 0,
    known: false,
    // An explanation was displayed. Exposure only; never implies the learner acted.
    introduced: false,
    // A control or jack belonging to the concept was actually operated.
    tried: false
  });
  const SUPPORTED_PROGRESS_VERSIONS = new Set([1, PROGRESS_SCHEMA_VERSION]);
  const MAX_RUNG = 5;
  const RECENT_LIMIT = 32;
  const CUE_COOLDOWN = 12;
  const AUDIO_OFF_COOLDOWN = 20;
  const NOT_NOW_COOLDOWN = 24;
  const PLATEAU_ACTIONS = 10;
  const CONFIDENCE_WEIGHT = Object.freeze({
    'manual-stated': 1, measured: 1, 'spec-derived': 0.85, 'general-synthesis': 0.75
  });
  const ALTERNATE_KINDS = new Set(['teach', 'suggestion', 'completion', 'milestone', 'diagnosis']);
  // Worklet reports and hover exploration are not deliberate actions, so they neither
  // advance cooldown clocks nor count toward a plateau.
  const COUNTED_ACTIONS = new Set([
    'control-change', 'patch-created', 'patch-removed', 'output-selected',
    'input-selected', 'input-without-output', 'transport'
  ]);

  function createSessionModel(source = {}) {
    const guidanceLevel = GUIDANCE_LEVELS.includes(source.guidanceLevel)
      ? source.guidanceLevel
      : 'coach';
    return Object.freeze({
      guidanceLevel,
      activeCue: source.activeCue ?? null,
      alternates: Object.freeze([...(source.alternates ?? [])]),
      dismissedStarterIds: Object.freeze([...(source.dismissedStarterIds ?? [])]),
      completedIdeaIds: Object.freeze([...(source.completedIdeaIds ?? [])]),
      // Guided three-instrument patches: the active guide is session state; completed
      // recipes are persisted progress.
      activeRecipeId: typeof source.activeRecipeId === 'string' ? source.activeRecipeId : null,
      completedRecipeIds: Object.freeze([...(source.completedRecipeIds ?? [])]),
      conceptCounts: Object.freeze({ ...(source.conceptCounts ?? {}) }),
      // Persisted learner progress: { [conceptId]: { rung, known } }.
      concepts: Object.freeze({ ...(source.concepts ?? {}) }),
      // Session-only learning signals. Never persisted.
      conceptTouches: Object.freeze({ ...(source.conceptTouches ?? {}) }),
      recent: Object.freeze([...(source.recent ?? [])]),
      balanceHistory: Object.freeze([...(source.balanceHistory ?? [])]),
      ledger: Object.freeze({ ...(source.ledger ?? {}) }),
      snoozed: Object.freeze({ ...(source.snoozed ?? {}) }),
      actionIndex: Number.isFinite(source.actionIndex) ? source.actionIndex : 0,
      lastProactiveAt: Number.isFinite(source.lastProactiveAt) ? source.lastProactiveAt : -1000,
      lastProgressAt: Number.isFinite(source.lastProgressAt) ? source.lastProgressAt : 0
    });
  }

  function exportProgress(model) {
    const concepts = Object.fromEntries(Object.entries(model.concepts ?? {})
      .filter(([, progress]) => progress.rung > 0 || progress.known ||
        progress.introduced || progress.tried)
      .map(([id, progress]) => [id, {
        rung: progress.rung,
        known: Boolean(progress.known),
        introduced: Boolean(progress.introduced),
        tried: Boolean(progress.tried)
      }]));
    return {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      guidanceLevel: model.guidanceLevel,
      concepts,
      completedIdeaIds: [...(model.completedIdeaIds ?? [])],
      completedRecipeIds: [...(model.completedRecipeIds ?? [])],
      dismissedStarterIds: [...(model.dismissedStarterIds ?? [])]
    };
  }

  // Restores saved progress defensively: unknown concept or idea IDs (renamed or removed
  // catalog entries) are dropped, rungs are clamped, and anything malformed starts fresh.
  function importProgress(data, options = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data) ||
      !SUPPORTED_PROGRESS_VERSIONS.has(data.schemaVersion)) {
      return createSessionModel();
    }
    // A version 1 rung records only that content was shown, so it seeds exposure. It is
    // never read as evidence the learner tried or understood anything.
    const migrating = data.schemaVersion < PROGRESS_SCHEMA_VERSION;
    const conceptIds = options.conceptIds ? new Set(options.conceptIds) : null;
    const ideaIds = options.ideaIds ? new Set(options.ideaIds) : null;
    const recipeIds = options.recipeIds ? new Set(options.recipeIds) : null;
    const concepts = {};
    if (data.concepts && typeof data.concepts === 'object' && !Array.isArray(data.concepts)) {
      for (const [id, progress] of Object.entries(data.concepts)) {
        if (conceptIds && !conceptIds.has(id)) continue;
        if (!progress || typeof progress !== 'object' || !Number.isFinite(progress.rung)) continue;
        const rung = Math.max(0, Math.min(MAX_RUNG, Math.round(progress.rung)));
        concepts[id] = {
          rung,
          known: progress.known === true,
          introduced: migrating ? rung > 0 : progress.introduced === true,
          tried: migrating ? false : progress.tried === true
        };
      }
    }
    const ids = (value, allowed) => (Array.isArray(value) ? value : [])
      .filter(id => typeof id === 'string' && (!allowed || allowed.has(id)));
    return createSessionModel({
      guidanceLevel: data.guidanceLevel,
      concepts,
      completedIdeaIds: [...new Set(ids(data.completedIdeaIds, ideaIds))],
      completedRecipeIds: [...new Set(ids(data.completedRecipeIds, recipeIds))],
      dismissedStarterIds: [...new Set(ids(data.dismissedStarterIds, ideaIds))]
    });
  }

  function createCoachEngine(options = {}) {
    const ideas = options.patchIdeas?.ideas ?? [];
    const controlCues = options.coachCues?.cues ?? [];
    const jackNames = options.jackNames ?? options.jackInfo ?? {};
    const controlNames = options.controlNames ?? {};
    const instrumentNames = options.instrumentNames ?? {};
    const openEnds = options.concepts?.openEnds ?? [];
    const recipes = options.rackRecipes?.recipes ?? [];
    const recipeById = new Map(recipes.map(recipe => [recipe.id, recipe]));
    const RUN_CONTROLS = Object.freeze({
      dfam: 'seq.run-stop', mother32: 'seq.run-stop-rec', subharmonicon: 'transport.play'
    });
    const RUN_NAMES = Object.freeze({ dfam: 'RUN / STOP', mother32: 'RUN/STOP', subharmonicon: 'PLAY' });

    // Concept index. Coach cues whose concept is not in the catalog (for example in
    // isolated tests) become minimal concepts so their rung-0 and contrast content work.
    const concepts = (options.concepts?.concepts ?? []).map(concept => ({ ...concept }));
    const conceptById = new Map(concepts.map(concept => [concept.id, concept]));
    for (const cue of controlCues) {
      if (conceptById.has(cue.concept)) continue;
      const synthetic = {
        id: cue.concept, title: cue.title, confidence: cue.confidence,
        controls: cue.match.targetIds.map(targetId => ({
          instrumentId: cue.match.instrumentId, targetId
        })),
        jacks: [], ladder: {}, synthetic: true
      };
      concepts.push(synthetic);
      conceptById.set(synthetic.id, synthetic);
    }
    const conceptByControl = new Map();
    const conceptByJack = new Map();
    for (const concept of concepts) {
      for (const control of concept.controls ?? []) {
        const key = `${control.instrumentId}:${control.targetId}`;
        if (!conceptByControl.has(key)) conceptByControl.set(key, concept);
      }
      for (const jack of concept.jacks ?? []) {
        const key = endpointKey(jack);
        if (!conceptByJack.has(key)) conceptByJack.set(key, concept);
      }
    }
    const catalogConceptIds = (options.concepts?.concepts ?? []).map(concept => concept.id);

    const jackName = endpoint => jackNames[endpointKey(endpoint)]?.name ?? endpoint.jackId;
    const controlName = (instrumentId, targetId) =>
      controlNames[`${instrumentId}:${targetId}`]?.name ?? targetId;
    const instrumentName = instrumentId => instrumentNames[instrumentId] ?? instrumentId;
    const evidenceLabel = evidence => evidence
      ? `Moog source · ${evidence.file.replace(/_/g, ' ').replace(/\.pdf$/i, '')} · PDF p. ${evidence.page}`
      : '';
    const targetForEndpoint = endpoint => ({
      kind: 'jack', instrumentId: endpoint.instrumentId, targetId: endpoint.jackId
    });
    const targetForControl = target => ({
      kind: 'control', instrumentId: target.instrumentId,
      targetId: target.controlId ?? target.targetId
    });
    const withEvidence = definition => ({
      rationale: definition.rationale ?? '',
      confidence: definition.confidence ?? null,
      evidence: definition.evidence ?? null,
      evidenceQuote: definition.evidence?.quote ?? '',
      evidenceLabel: evidenceLabel(definition.evidence)
    });
    const result = (cue, model) => {
      const sessionModel = createSessionModel({ ...model, activeCue: cue });
      return Object.freeze({
        cue,
        alternates: sessionModel.alternates,
        trace: Object.freeze([...(cue?.trace ?? [])]),
        sessionModel
      });
    };
    const retain = model => result(model.activeCue ?? null, model);
    const silence = model => result(null, { ...model, activeCue: null, alternates: [] });

    // ─── Layer 1: rack facts ────────────────────────────────────────────────────────
    function deriveRackFacts(rackState) {
      const patches = Array.isArray(rackState.patches) ? rackState.patches : [];
      const instruments = rackState.instruments && typeof rackState.instruments === 'object'
        ? rackState.instruments
        : null;
      return {
        patches,
        hasParameters: Boolean(instruments),
        audio: typeof rackState.audio === 'string' ? rackState.audio : null,
        heldKeys: Boolean(rackState.heldKeys),
        value: (instrumentId, targetId, fallback = null) =>
          instruments?.[instrumentId]?.parameters?.[targetId] ?? fallback,
        // Display-unit values ({ value, unit }) the app supplies for timing comparisons.
        plain: (instrumentId, targetId) => {
          const entry = rackState.plainValues?.[`${instrumentId}:${targetId}`];
          return entry && Number.isFinite(entry.value) ? entry : null;
        },
        // Seconds between note starts, measured by the app from sequencer step reports.
        stepSeconds: instrumentId => {
          const seconds = rackState.transport?.[instrumentId]?.stepSeconds;
          return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
        },
        running: instrumentId => Boolean(rackState.transport?.[instrumentId]?.running),
        patchedInto: (instrumentId, jackId) => patches.some(patch => (
          patch.to?.instrumentId === instrumentId && patch.to?.jackId === jackId
        )),
        patchedFrom: (instrumentId, jackId) => patches.some(patch => (
          patch.from?.instrumentId === instrumentId && patch.from?.jackId === jackId
        )),
        hasCable: cable => patches.some(patch => sameCable(patch, cable)),
        occupantsOf: (instrumentId, jackId) => patches.filter(patch => (
          patch.to?.instrumentId === instrumentId && patch.to?.jackId === jackId
        ))
      };
    }

    const isZero = value => value !== null && value <= 0.001;
    const control = (instrumentId, targetId) => ({ kind: 'control', instrumentId, targetId });

    // Returns the first reason this instrument cannot currently be heard, or null.
    // Only structural, schema-backed conditions: nothing here claims how anything sounds.
    function audibleBlocker(facts, instrumentId, action) {
      if (!facts.hasParameters) return null;
      const value = targetId => facts.value(instrumentId, targetId);
      const name = instrumentName(instrumentId);
      const volumeId = { dfam: 'vca.volume', mother32: 'out.volume', subharmonicon: 'vca.volume' }[instrumentId];
      if (volumeId && isZero(value(volumeId))) {
        return {
          id: `diagnosis:${instrumentId}:volume`,
          title: `${name} volume is at zero`,
          body: `VOLUME is all the way down, so ${name} is silent. Raise VOLUME.`,
          panelMessage: 'Raise VOLUME',
          targets: [control(instrumentId, volumeId)],
          trace: [`${name} VOLUME is at zero`]
        };
      }
      if (instrumentId === 'dfam') {
        const mixer = ['mixer.vco-1-level', 'mixer.noise-ext-level', 'mixer.vco-2-level'];
        if (mixer.every(id => isZero(value(id)))) {
          return {
            id: 'diagnosis:dfam:mixer',
            title: 'DFAM mixer is closed',
            body: 'All three MIXER levels are at zero, so nothing reaches the filter. Raise VCO 1 LEVEL.',
            panelMessage: 'Raise VCO 1 LEVEL',
            targets: [control('dfam', 'mixer.vco-1-level')],
            trace: ['Every DFAM mixer level is at zero']
          };
        }
        // Clock inputs still require RUN / STOP to arm the sequencer. Transport
        // inputs are reflected in running state; only trigger/VCA inputs bypass it.
        const externallyDriven = ['trigger-in', 'vca-cv-in']
          .some(jackId => facts.patchedInto('dfam', jackId));
        if (!facts.running('dfam') && !externallyDriven) {
          return {
            id: 'diagnosis:dfam:stopped',
            title: 'DFAM is not playing',
            body: 'DFAM’s sequencer is stopped, so this change will not sound yet. Press RUN / STOP, or TRIGGER for a single hit.',
            panelMessage: 'Press RUN / STOP',
            targets: [control('dfam', 'seq.run-stop')],
            trace: ['The DFAM sequencer is stopped', 'No trigger or VCA CV cable drives DFAM']
          };
        }
      }
      if (instrumentId === 'mother32') {
        const playingPad = String(action.targetId ?? '').startsWith('kb.pad');
        const gated = ['gate-in', 'vca-cv-in', 'run-stop-in']
          .some(jackId => facts.patchedInto('mother32', jackId));
        if ((value('eg.vca-mode') ?? 0) < 0.5 && !facts.running('mother32') &&
          !facts.heldKeys && !playingPad && !gated) {
          return {
            id: 'diagnosis:mother32:closed',
            title: 'Mother-32 is waiting for a note',
            body: 'With VCA MODE on EG, the amplifier only opens for notes. Play a pad, start the sequencer with RUN/STOP, or set VCA MODE to ON for a continuous tone.',
            panelMessage: 'Set VCA MODE to ON, or play a pad',
            targets: [control('mother32', 'eg.vca-mode')],
            trace: ['VCA MODE is EG', 'No note is held and the sequencer is stopped']
          };
        }
      }
      if (instrumentId === 'subharmonicon') {
        const mixer = [
          'mixer.vco-1-level', 'mixer.sub-1-level-vco-1', 'mixer.sub-2-level-vco-1',
          'mixer.vco-2-level', 'mixer.sub-1-level-vco-2', 'mixer.sub-2-level-vco-2'
        ];
        if (mixer.every(id => isZero(value(id)))) {
          return {
            id: 'diagnosis:subharmonicon:mixer',
            title: 'Subharmonicon mixer is closed',
            body: 'All six MIXER levels are at zero, so nothing reaches the filter. Raise VCO 1 LEVEL.',
            panelMessage: 'Raise VCO 1 LEVEL',
            targets: [control('subharmonicon', 'mixer.vco-1-level')],
            trace: ['Every Subharmonicon mixer level is at zero']
          };
        }
        if (facts.patchedInto('subharmonicon', 'trigger-in')) return null;
        const steps = [];
        const traces = [];
        if ((value('transport.eg') ?? 0) < 0.25) {
          steps.push({ text: 'press EG until it reads ON', target: 'transport.eg' });
          traces.push('EG is Off, so sequencer steps do not trigger the envelopes');
        }
        const routed = [0, 1, 2, 3].some(index => ['seq1', 'seq2'].some(seq => (
          (value(`rhythm.generator[${index}].assign.${seq}`) ?? 0) >= 0.5
        )));
        if (!routed) {
          steps.push({ text: 'assign a rhythm to a sequencer, for example RHYTHM 1 → SEQ 1', target: 'rhythm.generator[0].assign.seq1' });
          traces.push('No rhythm generator is assigned to SEQ 1 or SEQ 2');
        }
        if (!facts.running('subharmonicon') && !facts.patchedInto('subharmonicon', 'play-in')) {
          steps.push({ text: 'press PLAY', target: 'transport.play' });
          traces.push('The Subharmonicon sequencer is stopped');
        }
        if (steps.length) {
          const capitalize = text => text[0].toUpperCase() + text.slice(1);
          const checklist = steps.length === 1
            ? `${capitalize(steps[0].text)} to hear its sequence.`
            : `To hear its sequence: ${steps.map((step, index) => `${index + 1}. ${capitalize(step.text)}.`).join(' ')}`;
          return {
            id: 'diagnosis:subharmonicon:sequence',
            title: 'Subharmonicon is silent',
            body: `${checklist} TRIGGER plays a single note at any time.`,
            panelMessage: capitalize(steps[0].text.replace(/, for example .*/, '')),
            targets: [control('subharmonicon', steps[0].target)],
            trace: traces
          };
        }
      }
      return null;
    }

    // ─── Settings that hide or reshape a change ─────────────────────────────────────
    // From reviewing a recorded take (2026-09-13): moves that changed nothing audible, or
    // changed the sound in a way a switch or the rack's timing explains. Structural checks
    // only; each cue is withdrawn once its setting changes.
    const secondsLabel = seconds => (
      seconds < 1 ? `${Math.round(seconds * 1000)} ms` : `${seconds.toFixed(1)} s`
    );
    function plainSeconds(facts, instrumentId, targetId) {
      const entry = facts.plain(instrumentId, targetId);
      if (!entry) return null;
      if (entry.unit === 'ms') return entry.value / 1000;
      return entry.unit === 's' ? entry.value : null;
    }

    const SETTING_RULES = [
      {
        id: 'mother32-pulse-width-on-saw',
        instrumentId: 'mother32',
        triggers: ['vco.pulse-width'],
        check: facts => ((facts.value('mother32', 'vco.vco-wave') ?? 0) < 0.5 ||
          facts.patchedFrom('mother32', 'vco-pulse-out') ? null : {
          priority: 72,
          title: 'PULSE WIDTH needs the PULSE wave',
          body: 'PULSE WIDTH only shapes the pulse wave, and VCO WAVE is on SAW, so this knob changes nothing you can hear. Switch VCO WAVE to PULSE to hear it.',
          rationale: 'The Mother-32 VCO applies pulse width only to its pulse wave.',
          targets: [control('mother32', 'vco.vco-wave')],
          trace: ['VCO WAVE is SAW', 'PULSE WIDTH shapes only the pulse wave']
        })
      },
      {
        id: 'mother32-vco-mod-pwm-on-saw',
        instrumentId: 'mother32',
        triggers: ['vco.vco-mod-amount', 'vco.vco-mod-destination', 'vco.vco-mod-source', 'vco.vco-wave'],
        check: facts => {
          const value = targetId => facts.value('mother32', targetId) ?? 0;
          if (facts.patchedFrom('mother32', 'vco-pulse-out') ||
            value('vco.vco-wave') < 0.5 || value('vco.vco-mod-destination') >= 0.5 ||
            value('vco.vco-mod-amount') <= 0.001) return null;
          return {
            priority: 72,
            title: 'VCO MOD is going to pulse width',
            body: 'VCO MOD DESTINATION is PWM, but VCO WAVE is on SAW, so VCO MOD AMOUNT changes nothing you can hear. Switch VCO WAVE to PULSE to hear the width move, or set DESTINATION to FREQ to modulate pitch.',
            rationale: 'The Mother-32 VCO applies pulse-width modulation only to its pulse wave.',
            targets: [control('mother32', 'vco.vco-wave'), control('mother32', 'vco.vco-mod-destination')],
            trace: ['VCO MOD DESTINATION is PWM', 'VCO WAVE is SAW', 'VCO MOD AMOUNT is above zero']
          };
        }
      },
      {
        id: 'dfam-seq-pitch-off',
        instrumentId: 'dfam',
        triggers: [/^seq\.pitch\[\d+\]$/],
        check: facts => {
          const mode = facts.value('dfam', 'vco.seq-pitch-mod') ?? 0;
          // A patched PITCH output still carries the sequence to another instrument.
          if (mode < 1 / 3 || mode >= 2 / 3 || facts.patchedFrom('dfam', 'pitch-out')) return null;
          return {
            priority: 72,
            title: 'SEQ PITCH MOD is OFF',
            body: 'The PITCH knobs are not reaching either VCO because SEQ PITCH MOD is OFF. Set it to VCO 1&2 or VCO 2 to hear the pitch sequence, or patch PITCH out to play another instrument.',
            rationale: 'SEQ PITCH MOD chooses which oscillators follow the pitch knobs.',
            targets: [control('dfam', 'vco.seq-pitch-mod')],
            trace: ['SEQ PITCH MOD is OFF', 'DFAM PITCH out is not patched']
          };
        }
      },
      {
        id: 'mother32-attack-step',
        instrumentId: 'mother32',
        triggers: ['eg.attack', 'eg.vca-mode'],
        check: facts => {
          if ((facts.value('mother32', 'eg.vca-mode') ?? 0) >= 0.5) return null;
          const step = facts.running('mother32') ? facts.stepSeconds('mother32') : null;
          const attack = plainSeconds(facts, 'mother32', 'eg.attack');
          if (!step || attack === null || attack <= step) return null;
          return {
            kind: 'teach',
            priority: 60,
            title: 'ATTACK is longer than a step',
            body: `ATTACK takes about ${secondsLabel(attack)}, but a new step starts every ${secondsLabel(step)}, so notes never reach full level and blur into a swell. Set ATTACK below ${secondsLabel(step)} for distinct notes, or keep it for a slow pad.`,
            rationale: 'An envelope only shapes a note fully when it can finish before the next note starts.',
            targets: [control('mother32', 'eg.attack')],
            trace: [`ATTACK is about ${secondsLabel(attack)}`, `Steps start about every ${secondsLabel(step)}`]
          };
        }
      },
      ...['vca', 'vcf'].map(stage => ({
        id: `subharmonicon-${stage}-step`,
        instrumentId: 'subharmonicon',
        triggers: [`${stage}.${stage}-attack`, `${stage}.${stage}-decay`],
        check: facts => {
          const step = facts.running('subharmonicon') ? facts.stepSeconds('subharmonicon') : null;
          const attack = plainSeconds(facts, 'subharmonicon', `${stage}.${stage}-attack`);
          const decay = plainSeconds(facts, 'subharmonicon', `${stage}.${stage}-decay`);
          if (!step || attack === null || decay === null || attack + decay <= step) return null;
          const name = stage.toUpperCase();
          // Name every stage that alone outlasts a step, or else the longer one.
          const tooLong = [['ATTACK', attack], ['DECAY', decay]]
            .filter(([, seconds]) => seconds >= step).map(([label]) => label);
          const shorten = tooLong.length ? tooLong : [attack > decay ? 'ATTACK' : 'DECAY'];
          return {
            kind: 'teach',
            priority: 60,
            title: stage === 'vca' ? 'Notes overlap into a drone' : 'The filter never closes between notes',
            body: `The ${name} envelope lasts about ${secondsLabel(attack + decay)} (ATTACK + DECAY), but a new note starts every ${secondsLabel(step)}, so ${stage === 'vca' ? 'notes overlap and blur into a drone' : 'the filter stays open instead of shaping each note'}. Shorten ${name} ${shorten.join(' and ')} until the total is under ${secondsLabel(step)} for separate notes, or keep it for a drone.`,
            rationale: 'An envelope only shapes a note fully when it can finish before the next note starts.',
            targets: shorten.map(label => control('subharmonicon', `${stage}.${stage}-${label.toLowerCase()}`)),
            trace: [`${name} ATTACK + DECAY is about ${secondsLabel(attack + decay)}`,
              `Notes start about every ${secondsLabel(step)}`]
          };
        }
      })),
      {
        id: 'mother32-audio-rate-lfo',
        instrumentId: 'mother32',
        triggers: ['lfo.lfo-rate', 'vcf.vcf-mod-amount', 'vcf.vcf-mod-source',
          'vco.vco-mod-amount', 'vco.vco-mod-source', 'vco.vco-mod-destination'],
        check: facts => {
          const value = targetId => facts.value('mother32', targetId) ?? 0;
          const rate = facts.plain('mother32', 'lfo.lfo-rate');
          if (!rate || rate.unit !== 'Hz' || rate.value < 20) return null;
          const destinations = [];
          if (value('vcf.vcf-mod-source') < 0.5 && value('vcf.vcf-mod-amount') > 0.05) {
            destinations.push('filter cutoff');
          }
          if (value('vco.vco-mod-source') < 0.5 && value('vco.vco-mod-amount') > 0.05) {
            if (value('vco.vco-mod-destination') >= 0.5) destinations.push('pitch');
            else if (value('vco.vco-wave') < 0.5) destinations.push('pulse width');
          }
          if (!destinations.length) return null;
          const hz = Math.round(rate.value);
          return {
            kind: 'teach',
            priority: 58,
            title: 'The LFO is at audio rate',
            body: `LFO RATE is about ${hz} Hz, too fast to hear as a wobble. Modulating the ${destinations.join(' and ')} that fast adds growl and new partials instead. Turn LFO RATE below about 10 Hz to hear it as movement again.`,
            rationale: 'Above roughly 20 Hz, modulation is heard as tone color rather than motion.',
            targets: [control('mother32', 'lfo.lfo-rate')],
            trace: [`LFO RATE is about ${hz} Hz`, `The LFO modulates the ${destinations.join(' and ')}`]
          };
        }
      }
    ];

    function settingHolds(ruleId, facts) {
      const rule = SETTING_RULES.find(candidate => candidate.id === ruleId);
      return Boolean(rule && facts.hasParameters && rule.check(facts));
    }

    function settingCandidates(action, facts) {
      if (!facts.hasParameters || action.type !== 'control-change') return [];
      return SETTING_RULES.filter(rule => rule.instrumentId === action.instrumentId && rule.triggers.some(trigger => (
        typeof trigger === 'string' ? trigger === action.targetId : trigger.test(String(action.targetId))
      ))).map(rule => {
        const finding = rule.check(facts);
        return finding && genericCue(action, {
          ...finding,
          id: `setting:${rule.id}`,
          kind: finding.kind ?? 'completion',
          confidence: 'spec-derived',
          panelMessage: finding.title,
          condition: { type: 'setting', ruleId: rule.id },
          focus: { instrumentId: rule.instrumentId }
        });
      }).filter(Boolean);
    }

    const VOLUME_CONTROLS = { dfam: 'vca.volume', mother32: 'out.volume', subharmonicon: 'vca.volume' };

    // Raising one voice again and again usually means a louder voice covers it.
    function balanceCandidates(action, model, facts) {
      if (!facts.hasParameters || action.type !== 'control-change' ||
        VOLUME_CONTROLS[action.instrumentId] !== action.targetId || !(action.after > action.before)) return [];
      const moves = model.balanceHistory.filter(entry => (
        entry.type === 'control-change' && entry.instrumentId === action.instrumentId &&
        entry.targetId === action.targetId && entry.before !== null && entry.after !== null
      ));
      const raises = moves.filter(entry => entry.after > entry.before).length;
      if (raises < 3 || moves.some(entry => entry.after < entry.before)) return [];
      const others = Object.entries(VOLUME_CONTROLS).filter(([instrumentId, targetId]) => (
        instrumentId !== action.instrumentId && (facts.value(instrumentId, targetId) ?? 0) > 0.05
      ));
      if (!others.length) return [];
      const name = instrumentName(action.instrumentId);
      const otherNames = others.map(([instrumentId]) => instrumentName(instrumentId));
      return [genericCue(action, {
        id: `balance:volume-creep:${action.instrumentId}`,
        kind: 'suggestion',
        priority: 52,
        title: 'Balance by turning another voice down',
        body: `You have turned ${name} VOLUME up ${raises} times in a row. If it still sounds buried, another voice is probably covering it: lower ${otherNames.join(' or ')} for a moment and listen. Turning the loudest voice down keeps the mix clear of clipping.`,
        rationale: 'A voice that seems too quiet is often masked by a louder one in the same range.',
        targets: others.map(([instrumentId, targetId]) => control(instrumentId, targetId)),
        panelMessage: 'Try lowering another voice',
        focus: { instrumentId: action.instrumentId },
        trace: [`${name} VOLUME raised ${raises} times without lowering`,
          `${otherNames.join(' and ')} also have VOLUME up`]
      })];
    }

    // ─── Layer 2: interaction lens ──────────────────────────────────────────────────
    function observe(model, action) {
      const counted = COUNTED_ACTIONS.has(action.type) && action.targetId !== 'sequencer-state';
      if (!counted) return model;
      const actionIndex = model.actionIndex + 1;
      const entry = Object.freeze({
        i: actionIndex,
        type: action.type,
        instrumentId: action.instrumentId ?? action.patch?.to?.instrumentId ??
          action.endpoint?.instrumentId ?? null,
        targetId: action.targetId ?? null,
        sectionId: action.sectionId ?? null,
        before: typeof action.before === 'number' ? action.before : null,
        after: typeof action.after === 'number' ? action.after : null,
        gesture: action.gesture ?? null,
        timestamp: Number.isFinite(action.timestamp) ? action.timestamp : null,
        cable: action.patch?.from && action.patch?.to ? cableKey(action.patch) : null
      });
      // Keep eight deliberate actions/runs for balance coaching. Raw wheel ticks stay
      // in recent for the other interaction lenses, but cannot evict earlier raises here.
      const last = model.balanceHistory.at(-1);
      const continuesRun = entry.type === 'control-change' &&
        VOLUME_CONTROLS[entry.instrumentId] === entry.targetId &&
        ['wheel', 'keyboard'].includes(entry.gesture) && last?.gesture === entry.gesture &&
        last.instrumentId === entry.instrumentId && last.targetId === entry.targetId &&
        last.i === entry.i - 1 && Number.isFinite(last.timestamp) && Number.isFinite(entry.timestamp) &&
        entry.timestamp >= last.timestamp && entry.timestamp - last.timestamp <= 750 &&
        Number.isFinite(entry.before) && Number.isFinite(entry.after) &&
        Math.abs(last.after - entry.before) < 1e-9 &&
        Math.sign(last.after - last.before) === Math.sign(entry.after - entry.before);
      const balanceHistory = continuesRun
        ? [...model.balanceHistory.slice(0, -1), Object.freeze({ ...entry, before: last.before })]
        : [...model.balanceHistory, entry].slice(-8);
      const patchChanged = action.type === 'patch-created' || action.type === 'patch-removed';
      const volumeLowered = entry.type === 'control-change' &&
        VOLUME_CONTROLS[entry.instrumentId] === entry.targetId && entry.after < entry.before;
      const isBalanceCue = cue => cue?.id?.startsWith('balance:volume-creep:');
      return createSessionModel({
        ...model,
        actionIndex,
        recent: [...model.recent, entry].slice(-RECENT_LIMIT),
        balanceHistory,
        activeCue: volumeLowered && isBalanceCue(model.activeCue) ? null : model.activeCue,
        alternates: volumeLowered ? model.alternates.filter(cue => !isBalanceCue(cue)) : model.alternates,
        lastProgressAt: patchChanged ? actionIndex : model.lastProgressAt
      });
    }

    function readLens(model, action) {
      const window = model.recent.slice(-6);
      let sweep = false;
      if (action.type === 'control-change') {
        const moves = window.filter(entry => (
          entry.type === 'control-change' && entry.instrumentId === action.instrumentId &&
          entry.targetId === action.targetId && entry.before !== null && entry.after !== null
        ));
        const directions = moves.map(entry => Math.sign(entry.after - entry.before)).filter(Boolean);
        const reversals = directions.filter((direction, index) => (
          index > 0 && direction !== directions[index - 1]
        )).length;
        // Two reversals distinguishes a sweep from fine-tuning past a target and back.
        sweep = moves.length >= 3 && reversals >= 2;
      }
      const dwell = Boolean(action.sectionId) && window.filter(entry => (
        entry.instrumentId === action.instrumentId && entry.sectionId === action.sectionId
      )).length >= 4;
      const tail = model.recent.slice(-10);
      const churn = tail.filter((entry, index) => entry.type === 'patch-removed' &&
        tail.slice(Math.max(0, index - 3), index).some(previous => (
          previous.type === 'patch-created' && previous.cable === entry.cable
        ))).length >= 2;
      const weights = new Map();
      model.recent.slice(-8).forEach((entry, index) => {
        if (entry.instrumentId) {
          weights.set(entry.instrumentId, (weights.get(entry.instrumentId) ?? 0) + index + 1);
        }
      });
      const focusInstrument = [...weights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
        action.instrumentId ?? null;
      return {
        sweep,
        dwell,
        churn,
        plateau: model.actionIndex - model.lastProgressAt >= PLATEAU_ACTIONS,
        focusInstrument
      };
    }

    // ─── Layer 3/4: candidate generators ────────────────────────────────────────────
    function ideaCue(idea, trigger, model, endpoint = null) {
      if (!idea || model.completedIdeaIds.includes(idea.id) ||
        (trigger === 'starter' && model.dismissedStarterIds.includes(idea.id))) {
        return null;
      }
      if (trigger === 'matched') {
        return {
          id: `${idea.id}:matched`,
          ideaId: idea.id,
          kind: 'suggestion',
          trigger,
          priority: 80,
          title: idea.title,
          body: `Patch matched. ${idea.tryNext.map(next => next.hint).join(' ')}`,
          ...withEvidence(idea),
          targets: idea.tryNext.map(targetForControl),
          panelMessage: idea.tryNext[0]?.hint ?? idea.title,
          completionTargets: idea.tryNext.map(targetForControl),
          trace: ['Every cable of a verified Moog technique is patched']
        };
      }

      const cable = endpoint
        ? idea.cables.find(candidate => (
          sameEndpoint(candidate.from, endpoint) || sameEndpoint(candidate.to, endpoint)
        ))
        : idea.cables[0];
      if (!cable) return null;
      const other = endpoint && sameEndpoint(cable.from, endpoint) ? cable.to : cable.from;
      const targets = endpoint
        ? [targetForEndpoint(endpoint), targetForEndpoint(other)]
        : [targetForEndpoint(cable.from), targetForEndpoint(cable.to)];
      const body = trigger === 'jack'
        ? `Try ${jackName(other)} ${jackNames[endpointKey(endpoint)]?.dir === 'in'
          ? 'here'
          : `into ${jackName(cable.to)}`}.`
        : `Try this: ${jackName(cable.from)} → ${jackName(cable.to)}.`;
      return {
        id: `${idea.id}:${trigger}`,
        ideaId: idea.id,
        kind: 'suggestion',
        trigger,
        priority: trigger === 'jack' ? 45 : 20,
        title: 'Try a Moog technique',
        body,
        ...withEvidence(idea),
        targets,
        panelMessage: trigger === 'jack'
          ? `Connect ${jackName(other)} here`
          : `${jackName(cable.from)} → ${jackName(cable.to)}`,
        trace: [trigger === 'jack'
          ? `${jackName(endpoint)} appears in a verified Moog technique`
          : 'The rack has no cables yet']
      };
    }

    function genericCue(action, values) {
      return {
        id: values.id ?? `action:${action.type}:${action.instrumentId ?? 'rack'}:${action.targetId ?? ''}`,
        kind: values.kind ?? 'event',
        trigger: action.type,
        priority: values.priority ?? 30,
        title: values.title,
        body: values.body,
        rationale: values.rationale ?? '',
        confidence: values.confidence ?? null,
        evidence: values.evidence ?? null,
        evidenceQuote: values.evidence?.quote ?? '',
        evidenceLabel: evidenceLabel(values.evidence),
        targets: values.targets ?? [],
        panelMessage: values.panelMessage ?? '',
        concept: values.concept ?? null,
        progress: values.progress ?? null,
        proactive: Boolean(values.proactive),
        // Ideas unrelated to the action itself may be offered in the tray but never take
        // over the primary cue, which must stay about what the player just did.
        alternateOnly: Boolean(values.alternateOnly),
        // A cue about a fixable rack condition is withdrawn once the condition clears.
        condition: values.condition ?? null,
        focus: values.focus ?? null,
        normalNote: values.normalNote ?? null,
        trace: values.trace ?? []
      };
    }

    // A cable the coach itself recommends (a verified technique or a concept's automation
    // patch) is expected to replace an internal normal; that is information, not a warning.
    const isRecommendedCable = patch => Boolean(patch?.from && patch?.to) && (
      ideas.some(idea => idea.cables.some(cable => sameCable(cable, patch))) ||
      recipes.some(recipe => recipe.steps.some(step => step.kind === 'cable' && sameCable(step.cable, patch)) ||
        (recipe.buildOn ?? []).some(item => item.cables.some(cable => sameCable(cable, patch)))) ||
      concepts.some(concept => Object.values(concept.ladder ?? {})
        .some(rungs => rungs.automate && sameCable(rungs.automate, patch)))
    );

    // ─── Rack recipes: guided patches across all three instruments ──────────────────
    // Progress is read from the rack itself (cables, settings, running sequencers), so
    // the guide follows whatever order the player works in and never needs undoing.
    function recipeStepDone(step, facts) {
      if (step.kind === 'cable') return facts.hasCable(step.cable);
      if (step.kind === 'setting') {
        return facts.hasParameters && step.targetIds.some(targetId => {
          const value = facts.value(step.instrumentId, targetId);
          if (value === null) return false;
          if ('atLeast' in step) return value >= step.atLeast;
          if ('atMost' in step) return value <= step.atMost;
          return value >= step.between[0] && value <= step.between[1];
        });
      }
      return facts.audio === 'running' && facts.running(step.instrumentId);
    }

    function recipeStatus(recipe, facts) {
      const done = recipe.steps.map(step => recipeStepDone(step, facts));
      const leaderIndex = recipe.steps.findIndex(step => step.role === 'leader');
      // Starting the leader before its followers are armed is the classic sync mistake.
      const leaderEarly = leaderIndex >= 0 && done[leaderIndex] && recipe.steps.some((step, index) => (
        index < leaderIndex && step.kind === 'transport' && step.role === 'follower' && !done[index]
      ));
      return { done, nextIndex: done.indexOf(false), leaderIndex, leaderEarly };
    }

    const recipeStepTargets = step => {
      if (step.kind === 'cable') return [targetForEndpoint(step.cable.from), targetForEndpoint(step.cable.to)];
      if (step.kind === 'setting') return [control(step.instrumentId, step.targetIds[0])];
      return [control(step.instrumentId, RUN_CONTROLS[step.instrumentId])];
    };

    function recipeCue(action, model, facts) {
      const recipe = recipeById.get(model.activeRecipeId);
      if (!recipe) return null;
      const status = recipeStatus(recipe, facts);
      const total = recipe.steps.length;
      if (status.nextIndex === -1) {
        return {
          ...genericCue(action, {
            id: `recipe:${recipe.id}:done`,
            kind: 'recipe',
            priority: 88,
            title: `Rack patched: ${recipe.title}`,
            body: `All ${total} steps are done. ${recipe.tryNext.map(next => next.text).join(' ')}`,
            rationale: recipe.rationale,
            confidence: recipe.confidence,
            targets: recipe.tryNext.map(targetForControl),
            panelMessage: recipe.tryNext[0]?.text ?? recipe.title,
            trace: [`Every step of ${recipe.title} is in place on the rack`]
          }),
          recipeId: recipe.id,
          completesRecipe: recipe.id
        };
      }
      const step = recipe.steps[status.nextIndex];
      const doneCount = status.done.filter(Boolean).length;
      let body = step.text;
      let targets = recipeStepTargets(step);
      let panelMessage = step.panel;
      const trace = [`You are following ${recipe.title}`, `${doneCount} of ${total} steps are already in place`];
      const occupant = step.kind === 'cable' ? conflictFor(step.cable, facts) : null;
      if (occupant) {
        const owner = pathwayOwning(occupant, facts);
        body = `${endpointLabel(step.cable.to)} already receives ${endpointLabel(occupant.from)}` +
          `${owner ? `, part of ${owner.title}` : ''}. Remove that cable first, or this input will need a mixer. Then: ${step.text}`;
        trace.push(`${jackName(step.cable.to)} is already patched`);
      }
      if (status.leaderEarly) {
        const leader = recipe.steps[status.leaderIndex];
        const name = instrumentName(leader.instrumentId);
        body = `${name} started before the others were armed. Press its ${RUN_NAMES[leader.instrumentId]} to stop it, then: ${step.text} Start ${name} again last so every instrument begins together.`;
        targets = [control(leader.instrumentId, RUN_CONTROLS[leader.instrumentId]), ...targets];
        panelMessage = `Stop ${name} first`;
        trace.push(`${name} is running before its followers are armed`);
      } else if (step.kind === 'transport' && facts.audio !== 'running') {
        body = `Press Start Audio first. Then: ${step.text}`;
        panelMessage = 'Start Audio first';
        trace.push('The audio engine is not running');
      }
      return {
        ...genericCue(action, {
          id: `recipe:${recipe.id}:${step.id}`,
          kind: 'recipe',
          priority: 88,
          title: `${recipe.title} · step ${status.nextIndex + 1} of ${total}`,
          body,
          rationale: recipe.rationale,
          confidence: step.confidence ?? recipe.confidence,
          evidence: step.evidence ?? null,
          targets,
          panelMessage,
          trace
        }),
        recipeId: recipe.id
      };
    }

    // ─── Pathways: patched recipes the coach builds on and protects ─────────────────
    const recipeCableSteps = recipe => recipe.steps.filter(step => step.kind === 'cable');
    const buildOnItems = recipe => recipe?.buildOn ?? [];
    const endpointLabel = endpoint => `${instrumentName(endpoint.instrumentId)} ${jackName(endpoint)}`;

    // A step is satisfied by its own cable, or by a fully patched build-on that replaces it
    // (for example DFAM clocked from SEQ 1 CLK instead of the MULT).
    function stepSatisfied(recipe, step, facts) {
      return facts.hasCable(step.cable) || buildOnItems(recipe).some(item => (
        (item.replaces ?? []).includes(step.id) && item.cables.every(cable => facts.hasCable(cable))
      ));
    }

    function completePathways(facts) {
      return recipes.filter(recipe => recipeCableSteps(recipe).every(step => stepSatisfied(recipe, step, facts)));
    }

    // The cable already occupying this cable's destination, other than itself or allowed ones.
    function conflictFor(cable, facts, allowed = []) {
      return facts.occupantsOf(cable.to.instrumentId, cable.to.jackId).find(patch => (
        !sameCable(patch, cable) && !allowed.some(other => sameCable(other, patch))
      )) ?? null;
    }

    function pathwayOwning(patch, facts) {
      return completePathways(facts).find(recipe => (
        recipeCableSteps(recipe).some(step => sameCable(step.cable, patch)) ||
        buildOnItems(recipe).some(item => item.cables.some(cable => sameCable(cable, patch)))
      )) ?? null;
    }

    function buildOnCue(action, recipe, item, facts, { alternateOnly }) {
      const next = item.cables.find(cable => !facts.hasCable(cable));
      if (!next) return null;
      const replaced = recipe.steps.filter(step => (item.replaces ?? []).includes(step.id)).map(step => step.cable);
      if (conflictFor(next, facts, replaced)) return null;
      return genericCue(action, {
        id: `buildon:${recipe.id}:${item.id}`,
        kind: 'suggestion',
        priority: 42,
        title: `Build on ${recipe.title}: ${item.title}`,
        body: item.text,
        rationale: `This keeps your ${recipe.title} pathway working. ${item.result}`,
        confidence: item.confidence ?? 'general-synthesis',
        evidence: item.evidence ?? null,
        targets: [targetForEndpoint(next.from), targetForEndpoint(next.to)],
        panelMessage: `${jackName(next.from)} → ${jackName(next.to)}`,
        proactive: alternateOnly,
        alternateOnly,
        focus: { instrumentId: next.to.instrumentId },
        trace: [`${recipe.title} is patched on your rack`]
      });
    }

    function buildOnCandidates(action, facts) {
      return completePathways(facts).flatMap(recipe => buildOnItems(recipe)
        .map(item => buildOnCue(action, recipe, item, facts, { alternateOnly: true })));
    }

    function builtOnCandidates(action, facts) {
      if (!action.patch?.from) return [];
      return completePathways(facts).flatMap(recipe => buildOnItems(recipe)
        .filter(item => item.cables.some(cable => sameCable(cable, action.patch)) &&
          item.cables.every(cable => facts.hasCable(cable)))
        .map(item => genericCue(action, {
          id: `builton:${recipe.id}:${item.id}`,
          kind: 'completion',
          priority: 66,
          title: `Built on ${recipe.title}: ${item.title}`,
          body: `${item.result} ${recipe.title} is still complete.`,
          rationale: item.text,
          confidence: item.confidence ?? 'general-synthesis',
          evidence: item.evidence ?? null,
          targets: [targetForEndpoint(action.patch.to)],
          panelMessage: item.title,
          trace: [`This cable builds on ${recipe.title}`]
        })));
    }

    // Removing a cable from a pathway that was complete says what broke and how to restore it.
    function pathwayBreakCandidates(action, rackState, facts) {
      if (!action.patch?.from || !action.patch?.to) return [];
      const before = deriveRackFacts({ ...rackState, patches: [...facts.patches, action.patch] });
      const stillComplete = new Set(completePathways(facts).map(recipe => recipe.id));
      return completePathways(before).filter(recipe => !stillComplete.has(recipe.id)).map(recipe => {
        const step = recipeCableSteps(recipe).find(candidate => (
          stepSatisfied(recipe, candidate, before) && !stepSatisfied(recipe, candidate, facts)
        ));
        const alternative = buildOnItems(recipe).find(item => (
          (item.replaces ?? []).includes(step.id) && !item.cables.every(cable => facts.hasCable(cable))
        ));
        const alternativeCable = alternative?.cables.find(cable => !facts.hasCable(cable));
        const restore = `Re-patch ${jackName(action.patch.from)} → ${jackName(action.patch.to)} to restore it.`;
        const offer = alternativeCable && !sameCable(alternativeCable, action.patch)
          ? ` Or build “${alternative.title}”: ${jackName(alternativeCable.from)} → ${jackName(alternativeCable.to)}.`
          : '';
        return genericCue(action, {
          id: `pathway:${recipe.id}:${step.id}`,
          kind: 'completion',
          priority: 75,
          title: `${recipe.title}: pathway interrupted`,
          body: `${step.ifRemoved ?? `${recipe.title} is no longer complete.`} ${restore}${offer}`,
          rationale: 'Coaching tracks the pathways you build, so one cable change does not silently undo one.',
          targets: [targetForEndpoint(action.patch.from), targetForEndpoint(action.patch.to)],
          panelMessage: `Re-patch ${jackName(action.patch.from)} → ${jackName(action.patch.to)}`,
          condition: { type: 'pathway', recipeId: recipe.id },
          focus: { instrumentId: action.patch.to.instrumentId },
          trace: [`${recipe.title} was complete before this cable was removed`]
        });
      });
    }

    function pathwaySummary(model, rackState = {}) {
      const facts = deriveRackFacts(rackState);
      return completePathways(facts).map(recipe => Object.freeze({
        id: recipe.id,
        title: recipe.title,
        buildOn: Object.freeze(buildOnItems(recipe).map(item => Object.freeze({
          id: item.id,
          title: item.title,
          done: item.cables.every(cable => facts.hasCable(cable)),
          available: Boolean(buildOnCue({ type: 'summary' }, recipe, item, facts, { alternateOnly: false }))
        })))
      }));
    }

    // Every cable the coach would currently recommend, with the reason, in priority order.
    function suggestedCables(model, facts) {
      const list = [];
      const add = (cable, reason) => {
        if (!facts.hasCable(cable) && !list.some(entry => sameCable(entry.cable, cable))) list.push({ cable, reason });
      };
      const active = recipeById.get(model.activeRecipeId);
      if (active) {
        for (const step of recipeCableSteps(active)) add(step.cable, `Step ${active.steps.indexOf(step) + 1} of ${active.title}.`);
      }
      for (const recipe of completePathways(facts)) {
        for (const item of buildOnItems(recipe)) item.cables.forEach(cable => add(cable, `Builds on ${recipe.title}: ${item.title}.`));
      }
      for (const idea of ideas) {
        if (!model.completedIdeaIds.includes(idea.id)) idea.cables.forEach(cable => add(cable, `Moog technique: ${idea.title}.`));
      }
      for (const recipe of recipes) {
        for (const step of recipeCableSteps(recipe)) add(step.cable, `Part of Patch all three: ${recipe.title}.`);
      }
      for (const concept of concepts) {
        for (const rungs of Object.values(concept.ladder ?? {})) {
          if (rungs.automate) add(rungs.automate, `Automates ${concept.title.toLowerCase()}.`);
        }
      }
      return list;
    }

    function signalFit(outSignal, inSignal) {
      const timing = signal => signal === 'gate' || signal === 'clock';
      if (inSignal === 'midi') {
        return { grade: 'unusable', reason: 'MIDI input: it needs a MIDI cable from a controller, not a patch cable.' };
      }
      if (outSignal === 'any' || inSignal === 'any') return { grade: 'natural', reason: 'Utility jack: passes any signal.' };
      if (timing(outSignal) && timing(inSignal)) return { grade: 'natural', reason: 'Clock or trigger into a clock or trigger input.' };
      if (outSignal === inSignal) {
        return { grade: 'natural', reason: inSignal === 'audio' ? 'Audio into an audio input.' : 'Control voltage into a CV input.' };
      }
      if (outSignal === 'audio' && inSignal === 'cv') {
        return { grade: 'creative', reason: 'Audio into a CV input is audio-rate modulation (FM or AM). Start with low levels.' };
      }
      if (timing(inSignal)) {
        return { grade: 'creative', reason: 'Trigger inputs respond to rising edges, so a smooth or small signal may not fire it.' };
      }
      if (timing(outSignal)) return { grade: 'creative', reason: 'A gate or clock used as a stepped control voltage.' };
      if (inSignal === 'audio') return { grade: 'creative', reason: 'A control signal into an audio input is heard as offsets or clicks, not a tone.' };
      return { grade: 'creative', reason: 'An unusual pairing; the hardware allows it.' };
    }

    // Grades every jack that could complete a cable with the selected jack, given the patch.
    function gradeTargets(selected, rackState = {}, sessionModel = createSessionModel()) {
      const model = createSessionModel(sessionModel);
      const facts = deriveRackFacts(rackState);
      const selectedInfo = selected ? jackNames[endpointKey(selected)] : null;
      if (!selectedInfo || !['in', 'out'].includes(selectedInfo.dir)) return [];
      const selectingOutput = selectedInfo.dir === 'out';
      const suggestions = suggestedCables(model, facts);
      const graded = [];
      for (const [key, info] of Object.entries(jackNames)) {
        if (!['in', 'out'].includes(info.dir) || info.dir === selectedInfo.dir) continue;
        const split = key.indexOf(':');
        const endpoint = { instrumentId: key.slice(0, split), jackId: key.slice(split + 1) };
        const cable = selectingOutput ? { from: selected, to: endpoint } : { from: endpoint, to: selected };
        const fromInfo = jackNames[endpointKey(cable.from)] ?? {};
        const toInfo = jackNames[endpointKey(cable.to)] ?? {};
        const reasons = [];
        let grade;
        if (facts.hasCable(cable)) {
          grade = 'connected';
          reasons.push('Already connected.');
        } else {
          const fit = signalFit(fromInfo.signal, toInfo.signal);
          const occupant = conflictFor(cable, facts);
          const suggestion = suggestions.find(entry => sameCable(entry.cable, cable));
          grade = fit.grade === 'unusable' ? 'unusable' : occupant ? 'occupied' : suggestion ? 'suggested' : fit.grade;
          if (suggestion && grade !== 'unusable') reasons.push(suggestion.reason);
          if (occupant) {
            const owner = pathwayOwning(occupant, facts);
            reasons.push(`${endpointLabel(cable.to)} already receives ${endpointLabel(occupant.from)}` +
              `${owner ? `, part of ${owner.title}` : ''}. A second source here needs a mixer.`);
          }
          reasons.push(fit.reason);
          const replacedId = toInfo.breaksNormal ?? toInfo.replaces ?? toInfo.normalledFrom;
          const replaced = toInfo.breaksNormalLabel ?? toInfo.replacesLabel ?? toInfo.normalledFromLabel ??
            (replacedId ? String(replacedId).replaceAll('-', ' ') : null);
          if (replaced && grade !== 'unusable') reasons.push(`Replaces the internal ${replaced}.`);
          if (!selectingOutput) {
            const feeds = facts.patches.filter(patch => sameEndpoint(patch.from, endpoint));
            if (feeds.length) reasons.push(`Already feeds ${feeds.map(patch => endpointLabel(patch.to)).join(', ')}; one output can feed several inputs.`);
          }
        }
        graded.push(Object.freeze({ endpoint, grade, summary: reasons[0], reasons: Object.freeze(reasons) }));
      }
      return graded;
    }

    function recipeOffers(action, model, facts) {
      if (model.activeRecipeId) return [];
      return recipes.filter(recipe => !model.completedRecipeIds.includes(recipe.id) &&
        // Never offer a recipe that would fight cables already on the rack.
        !recipeCableSteps(recipe).some(step => !facts.hasCable(step.cable) && conflictFor(step.cable, facts)) && (
        action.type === 'starter' ||
        (action.type === 'patch-created' && recipe.steps.some(step => (
          step.kind === 'cable' && sameCable(step.cable, action.patch)
        )))
      )).map(recipe => ({
        ...genericCue(action, {
          id: `recipe-offer:${recipe.id}`,
          kind: 'suggestion',
          priority: action.type === 'starter' ? 25 : 45,
          title: `Patch all three: ${recipe.title}`,
          body: `${recipe.summary} Choose this to be guided step by step.`,
          rationale: recipe.rationale,
          confidence: recipe.confidence,
          targets: recipeStepTargets(recipe.steps.find(step => step.kind === 'cable') ?? recipe.steps[0]),
          alternateOnly: true,
          focus: action.type === 'patch-created' ? { instrumentId: action.patch.to.instrumentId } : null,
          trace: [action.type === 'starter'
            ? 'The rack has no cables yet'
            : 'This cable is part of a patch that connects all three instruments']
        }),
        startsRecipe: recipe.id
      }));
    }

    function listRecipes(model) {
      return recipes.map(recipe => Object.freeze({
        id: recipe.id,
        title: recipe.title,
        summary: recipe.summary,
        stepCount: recipe.steps.length,
        completed: model.completedRecipeIds.includes(recipe.id),
        active: model.activeRecipeId === recipe.id
      }));
    }

    function recipeProgress(model, rackState = {}) {
      const recipe = recipeById.get(model.activeRecipeId);
      if (!recipe) return null;
      const status = recipeStatus(recipe, deriveRackFacts(rackState));
      return Object.freeze({
        id: recipe.id,
        title: recipe.title,
        total: recipe.steps.length,
        doneCount: status.done.filter(Boolean).length,
        nextIndex: status.nextIndex,
        leaderEarly: status.leaderEarly,
        steps: Object.freeze(recipe.steps.map((step, index) => Object.freeze({
          id: step.id,
          panel: step.panel,
          text: step.text,
          done: status.done[index],
          current: index === status.nextIndex
        })))
      });
    }

    function warningCue(action, rackState) {
      if (action.type !== 'patch-created' || !action.patch?.to) return null;
      const patches = Array.isArray(rackState.patches) ? rackState.patches : [];
      const destination = action.patch.to;
      const destinationInfo = jackNames[endpointKey(destination)] ?? {};
      const destinationCount = patches.filter(patch => (
        sameEndpoint(patch.to, destination)
      )).length;

      if (destinationCount > 1) {
        const mixInputs = ['mix-1-in', 'mix-2-in'];
        const vcMixFree = !patches.some(patch => (
          patch.to?.instrumentId === 'mother32' && mixInputs.includes(patch.to?.jackId)
        )) && !(destination.instrumentId === 'mother32' && mixInputs.includes(destination.jackId));
        const mixerTip = vcMixFree
          ? ' On this rack, the Mother-32 VC MIX can blend two of them: patch them into MIX 1 and MIX 2, then VC MIX out into this input (the VC MIX knob sets the balance).'
          : '';
        return genericCue(action, {
          kind: 'warning',
          priority: 100,
          title: 'Use a mixer for multiple outputs',
          body: `${jackName(destination)} now receives ${destinationCount} outputs. The simulator can sum them, but do not recreate this with a passive mult, Y-cable, or stacked plug.${mixerTip}`,
          rationale: 'Connecting outputs directly together can make their output stages contend. Combine them with an active mixer or an appropriate logic utility.',
          targets: [targetForEndpoint(destination)],
          panelMessage: 'Multiple outputs: use a mixer',
          trace: [`${destinationCount} cables end at ${jackName(destination)}`]
        });
      }

      const brokenNormal = destinationInfo.breaksNormal ?? destinationInfo.normalledFrom;
      if (brokenNormal) {
        const routing = destinationInfo.breaksNormalLabel ??
          destinationInfo.normalledFromLabel ?? String(brokenNormal).replaceAll('-', ' ');
        const condition = destinationInfo.normalCondition
          ? ` (${destinationInfo.normalConditionLabel ??
            String(destinationInfo.normalCondition).replaceAll('-', ' ')})`
          : '';
        return genericCue(action, {
          kind: 'warning',
          priority: 90,
          title: 'Internal normal disconnected',
          body: `Patching ${jackName(destination)} replaces its internal ${routing} connection${condition}. Remove the cable to restore it.`,
          normalNote: `This cable intentionally replaces the internal ${routing} connection.`,
          rationale: 'This is normal semi-modular behavior. Remove the cable to restore the internal route.',
          targets: [targetForEndpoint(destination)],
          panelMessage: 'This cable breaks an internal normal',
          trace: [`${jackName(destination)} has an internal normal`]
        });
      }
      return null;
    }

    function diagnosisCandidates(action, facts, instrumentId) {
      if (!instrumentId || facts.audio === null) return [];
      if (facts.audio !== 'running') {
        return [genericCue(action, {
          id: 'diagnosis:audio-off',
          kind: 'diagnosis',
          priority: 45,
          title: 'Audio is off',
          body: 'Changes can’t be heard until the audio engine runs. Press Start Audio.',
          rationale: 'The browser only produces sound after Start Audio.',
          trace: ['The audio engine is not running'],
          condition: { type: 'audio-off' },
          focus: { instrumentId }
        })];
      }
      const blocker = audibleBlocker(facts, instrumentId, action);
      if (!blocker) return [];
      return [genericCue(action, {
        ...blocker,
        kind: 'diagnosis',
        priority: 85,
        rationale: 'Coaching checks the rack’s settings and cables, not the audio, to explain silence.',
        panelMessage: blocker.panelMessage ?? blocker.title,
        condition: { type: 'diagnosis', instrumentId, blockerId: blocker.id },
        focus: { instrumentId }
      })];
    }

    function openEndHolds(rule, facts) {
      if (!facts.hasParameters || !facts.patchedInto(rule.jack.instrumentId, rule.jack.jackId)) return false;
      const value = facts.value(rule.control.instrumentId, rule.control.targetId);
      if (value === null) return false;
      if ('atMost' in rule.when) return value <= rule.when.atMost;
      if ('atLeast' in rule.when) return value >= rule.when.atLeast;
      return Math.abs(value - rule.when.notNear) > 0.1;
    }

    function conditionHolds(condition, facts) {
      if (condition.type === 'audio-off') return facts.audio === null || facts.audio !== 'running';
      if (condition.type === 'openend') {
        const rule = openEnds.find(candidate => candidate.id === condition.ruleId);
        return Boolean(rule) && openEndHolds(rule, facts);
      }
      if (condition.type === 'pathway') {
        return !completePathways(facts).some(recipe => recipe.id === condition.recipeId);
      }
      if (condition.type === 'diagnosis') {
        return facts.audio === 'running' &&
          audibleBlocker(facts, condition.instrumentId, {})?.id === condition.blockerId;
      }
      if (condition.type === 'setting') return settingHolds(condition.ruleId, facts);
      return true;
    }

    function openEndCandidates(action, facts) {
      if (!facts.hasParameters) return [];
      return openEnds.filter(rule => {
        const touchesRule = (action.type === 'patch-created' && sameEndpoint(action.patch?.to, rule.jack)) ||
          (action.type === 'control-change' && action.instrumentId === rule.control.instrumentId &&
            action.targetId === rule.control.targetId);
        return touchesRule && openEndHolds(rule, facts);
      }).map(rule => genericCue(action, {
        condition: { type: 'openend', ruleId: rule.id },
        id: `openend:${rule.id}`,
        kind: 'completion',
        priority: 70,
        title: rule.title,
        body: rule.text,
        rationale: 'A patched input does nothing audible until its depth or mode lets it through.',
        confidence: 'spec-derived',
        targets: [targetForControl(rule.control)],
        panelMessage: rule.title,
        focus: { instrumentId: rule.control.instrumentId, targetId: rule.control.targetId },
        trace: [`A cable goes into ${jackName(rule.jack)}`,
          `${controlName(rule.control.instrumentId, rule.control.targetId)} blocks its effect`]
      }));
    }

    const progressOf = (model, conceptId) => {
      const progress = model.concepts[conceptId] ?? NO_PROGRESS;
      return { ...progress, rung: progress.known ? Math.max(progress.rung, 3) : progress.rung };
    };
    const touchesOf = (model, conceptId) =>
      model.conceptTouches[conceptId] ?? { total: 0, sinceRung: 0, instruments: [] };
    const snoozed = (model, key) => (model.snoozed[key] ?? -1) > model.actionIndex;

    function nearestIdea(model, predicate, facts) {
      return ideas
        .filter(idea => !model.completedIdeaIds.includes(idea.id) && predicate(idea))
        .map(idea => ({
          idea,
          missing: idea.cables.filter(cable => !facts.hasCable(cable))
        }))
        .filter(entry => entry.missing.length > 0 && !conflictFor(entry.missing[0], facts))
        .sort((a, b) => a.missing.length - b.missing.length)[0] ?? null;
    }

    const ideaTouchesConcept = (idea, concept) =>
      idea.cables.some(cable => (concept.jacks ?? []).some(jack => (
        sameEndpoint(jack, cable.from) || sameEndpoint(jack, cable.to)
      ))) ||
      idea.tryNext.some(next => (concept.controls ?? []).some(control => (
        control.instrumentId === next.instrumentId && control.targetId === next.controlId
      )));

    function automateCue(action, concept, automate, priority, reason, facts) {
      if (!automate || facts.hasCable(automate) || conflictFor(automate, facts)) return null;
      return genericCue(action, {
        id: `concept:${concept.id}:automate`,
        kind: 'teach',
        priority,
        title: priority > 50 ? 'Let a patch do the sweep' : concept.title,
        body: automate.text,
        rationale: 'A control voltage patched into an input moves that parameter continuously, freeing your hands.',
        confidence: concept.confidence ?? 'general-synthesis',
        targets: [targetForEndpoint(automate.from), targetForEndpoint(automate.to)],
        panelMessage: `${jackName(automate.from)} → ${jackName(automate.to)}`,
        concept: concept.id,
        progress: { conceptId: concept.id, rung: 3 },
        focus: { instrumentId: action.instrumentId, targetId: action.targetId },
        trace: [reason]
      });
    }

    function ladderCandidates(action, model, lens, facts) {
      const concept = conceptByControl.get(`${action.instrumentId}:${action.targetId}`);
      if (!concept || snoozed(model, concept.id)) return [];
      const level = GUIDANCE[model.guidanceLevel] ?? GUIDANCE.coach;
      const progress = progressOf(model, concept.id);
      const touches = touchesOf(model, concept.id);
      const rungs = concept.ladder?.[action.instrumentId] ?? {};
      const cue = controlCues.find(candidate => (
        candidate.match.action === action.type &&
        candidate.match.instrumentId === action.instrumentId &&
        candidate.match.targetIds.includes(action.targetId)
      ));
      const contrast = rungs.contrast ?? (cue?.tryNext
        ? { targetId: cue.tryNext.targetId, text: cue.tryNext.text, instrumentId: cue.tryNext.instrumentId }
        : null);
      const focus = { instrumentId: action.instrumentId, targetId: action.targetId, sectionId: action.sectionId };
      const setting = action.displayValue == null || action.displayValue === ''
        ? ''
        : ` Current setting: ${action.displayValue}.`;
      const candidates = [];

      if (lens.sweep && progress.rung < 3) {
        const automate = automateCue(action, concept, rungs.automate, 60,
          `You moved ${action.targetName ?? controlName(action.instrumentId, action.targetId)} back and forth several times`, facts);
        if (automate) candidates.push(automate);
      }

      if (progress.rung === 0) {
        if (cue) {
          candidates.push(genericCue(action, {
            id: `concept:${concept.id}:intro:${cue.id}`,
            kind: 'teach',
            priority: 50,
            title: cue.title,
            body: `${cue.actionText}${setting} Listen for ${cue.listenFor}`,
            ...withEvidence(cue),
            targets: [targetForControl(cue.tryNext)],
            panelMessage: cue.tryNext.text,
            concept: concept.id,
            progress: { conceptId: concept.id, rung: 1 },
            focus,
            trace: [`First time using ${concept.title.toLowerCase()}`]
          }));
        } else if (concept.intro) {
          const contrastTarget = contrast
            ? [control(contrast.instrumentId ?? action.instrumentId, contrast.targetId)]
            : [];
          candidates.push(genericCue(action, {
            id: `concept:${concept.id}:intro`,
            kind: 'teach',
            priority: 50,
            title: concept.title,
            body: `${concept.intro.text}${setting} Listen for ${concept.intro.listenFor}`,
            confidence: concept.confidence,
            targets: contrastTarget,
            panelMessage: contrast?.text ?? concept.title,
            concept: concept.id,
            progress: { conceptId: concept.id, rung: 1 },
            focus,
            trace: [`First time using ${concept.title.toLowerCase()}`]
          }));
        }
        return candidates;
      }

      const ready = touches.sinceRung >= level.rungTouches;
      if (progress.rung === 1 && ready && contrast) {
        candidates.push(genericCue(action, {
          id: `concept:${concept.id}:contrast`,
          kind: 'teach',
          priority: 50,
          title: `${concept.title}: compare`,
          body: contrast.text,
          confidence: cue?.tryNext && !rungs.contrast ? cue.confidence : concept.confidence,
          evidence: cue?.tryNext && !rungs.contrast ? cue.evidence : null,
          targets: [control(contrast.instrumentId ?? action.instrumentId, contrast.targetId)],
          panelMessage: contrast.text,
          concept: concept.id,
          progress: { conceptId: concept.id, rung: 2 },
          focus,
          trace: [`You have come back to ${concept.title.toLowerCase()} ${touches.total} times`]
        }));
      } else if (progress.rung <= 2 && ready) {
        const automate = automateCue(action, concept, rungs.automate, 50,
          `You keep returning to ${concept.title.toLowerCase()}`, facts);
        if (automate) candidates.push(automate);
      } else if (progress.rung === 3 && ready) {
        const nearest = nearestIdea(model, idea => ideaTouchesConcept(idea, concept), facts);
        if (nearest) candidates.push(applyCue(action, concept, nearest));
        else candidates.push(...transferCues(action, concept, touches, 5));
      } else if (progress.rung === 4 && ready) {
        candidates.push(...transferCues(action, concept, touches, 5));
      }
      return candidates;
    }

    function applyCue(action, concept, nearest) {
      const next = nearest.missing[0];
      const count = nearest.missing.length;
      return genericCue(action, {
        id: `concept:${concept.id}:apply`,
        kind: 'suggestion',
        priority: 40,
        title: `Moog technique: ${nearest.idea.title}`,
        body: `${nearest.idea.title} builds on ${concept.title.toLowerCase()}. ${count === 1 ? 'One cable' : `${count} cables`} away: next ${jackName(next.from)} → ${jackName(next.to)}.`,
        ...withEvidence(nearest.idea),
        targets: [targetForEndpoint(next.from), targetForEndpoint(next.to)],
        panelMessage: `${jackName(next.from)} → ${jackName(next.to)}`,
        concept: concept.id,
        progress: { conceptId: concept.id, rung: 4 },
        focus: { instrumentId: next.to.instrumentId },
        trace: [`You have explored ${concept.title.toLowerCase()} through a patch`]
      });
    }

    function transferCues(action, concept, touches, rung) {
      const elsewhere = (concept.controls ?? []).find(candidate => (
        candidate.instrumentId !== action.instrumentId &&
        !touches.instruments.includes(candidate.instrumentId)
      ));
      if (!elsewhere) return [];
      const name = instrumentName(elsewhere.instrumentId);
      return [genericCue(action, {
        id: `concept:${concept.id}:transfer`,
        kind: 'suggestion',
        priority: 35,
        title: `Same idea on ${name}`,
        body: `${concept.title} works the same way on ${name}. Try ${controlName(elsewhere.instrumentId, elsewhere.targetId)} there.`,
        confidence: concept.confidence,
        targets: [control(elsewhere.instrumentId, elsewhere.targetId)],
        panelMessage: `Try ${controlName(elsewhere.instrumentId, elsewhere.targetId)}`,
        concept: concept.id,
        progress: { conceptId: concept.id, rung },
        focus: { instrumentId: elsewhere.instrumentId },
        trace: [`You have used ${concept.title.toLowerCase()} on ${instrumentName(action.instrumentId)} only`]
      })];
    }

    // Patching a concept's automation cable offers the nearest verified technique that
    // uses the concept. It never skips earlier rungs: a player who copied a cable has not
    // yet had the knob itself explained.
    function patchLadderCandidates(action, model, facts) {
      const candidates = [];
      for (const concept of concepts) {
        const automations = Object.values(concept.ladder ?? {}).map(rungs => rungs.automate).filter(Boolean);
        if (!automations.some(automate => sameCable(automate, action.patch))) continue;
        const progress = progressOf(model, concept.id);
        if (progress.rung < 1 || progress.rung > 3 || snoozed(model, concept.id)) continue;
        const nearest = nearestIdea(model, idea => ideaTouchesConcept(idea, concept), facts);
        if (!nearest) continue;
        const cue = applyCue(action, concept, nearest);
        candidates.push(progress.rung === 3 ? cue : { ...cue, progress: null });
      }
      return candidates;
    }

    function destinationCandidates(action, endpoint, model, priority, proactive, facts) {
      const seen = new Set();
      const destinations = [];
      for (const idea of ideas) {
        for (const cable of idea.cables) {
          if (sameEndpoint(cable.from, endpoint) && !seen.has(endpointKey(cable.to))) {
            seen.add(endpointKey(cable.to));
            destinations.push({ to: cable.to, why: `used by ${idea.title}`, idea });
          }
        }
      }
      for (const concept of concepts) {
        for (const rungs of Object.values(concept.ladder ?? {})) {
          const automate = rungs.automate;
          if (automate && sameEndpoint(automate.from, endpoint) && !seen.has(endpointKey(automate.to))) {
            seen.add(endpointKey(automate.to));
            destinations.push({ to: automate.to, why: automate.text, concept });
          }
        }
      }
      return destinations.filter(destination => !facts?.occupantsOf(destination.to.instrumentId, destination.to.jackId).length)
        .slice(0, 3).map(destination => genericCue(action, {
        id: `destination:${endpointKey(endpoint)}>${endpointKey(destination.to)}`,
        kind: 'suggestion',
        priority,
        title: `${jackName(endpoint)} → ${jackName(destination.to)}`,
        body: destination.idea
          ? `Try ${jackName(endpoint)} into ${instrumentName(destination.to.instrumentId)} ${jackName(destination.to)}; it is ${destination.why}.`
          : destination.why,
        ...(destination.idea ? withEvidence(destination.idea) : { confidence: destination.concept?.confidence }),
        targets: [targetForEndpoint(endpoint), targetForEndpoint(destination.to)],
        panelMessage: `${jackName(endpoint)} → ${jackName(destination.to)}`,
        proactive,
        alternateOnly: !proactive,
        focus: { instrumentId: destination.to.instrumentId },
        trace: [proactive
          ? 'You connected and removed cables from this output more than once'
          : `${jackName(endpoint)} is selected`]
      }));
    }

    function proactiveCandidates(action, model, lens, facts) {
      const candidates = [];
      const focus = lens.focusInstrument;
      if (focus) {
        const nearest = nearestIdea(model, idea => idea.cables.some(cable => (
          cable.from.instrumentId === focus || cable.to.instrumentId === focus
        )), facts);
        if (nearest) {
          const next = nearest.missing[0];
          candidates.push(genericCue(action, {
            id: `technique:${nearest.idea.id}`,
            kind: 'suggestion',
            priority: 35,
            title: `Moog technique: ${nearest.idea.title}`,
            body: `${nearest.missing.length === nearest.idea.cables.length ? 'Start with' : 'Next'} ${jackName(next.from)} → ${jackName(next.to)}.`,
            ...withEvidence(nearest.idea),
            targets: [targetForEndpoint(next.from), targetForEndpoint(next.to)],
            panelMessage: `${jackName(next.from)} → ${jackName(next.to)}`,
            proactive: true,
            alternateOnly: true,
            focus: { instrumentId: next.to.instrumentId },
            trace: [`A verified technique uses ${instrumentName(focus)}`]
          }));
        }
        const lfoFree = !facts.patchedFrom('mother32', 'lfo-triangle-out') &&
          !facts.patchedFrom('mother32', 'lfo-square-out');
        if (focus !== 'mother32' && lfoFree) {
          const borrowed = concepts.flatMap(concept => Object.values(concept.ladder ?? {})
            .map(rungs => ({ concept, automate: rungs.automate })))
            .find(entry => entry.automate?.from.instrumentId === 'mother32' &&
              entry.automate.from.jackId.startsWith('lfo-') && entry.automate.to.instrumentId === focus);
          if (borrowed && !conflictFor(borrowed.automate, facts)) {
            candidates.push(genericCue(action, {
              id: `crossrole:lfo:${focus}`,
              kind: 'suggestion',
              priority: 30,
              title: 'Borrow the rack’s only LFO',
              body: borrowed.automate.text,
              rationale: `${instrumentName(focus)} has no LFO of its own; Mother-32's LFO can move it.`,
              confidence: borrowed.concept.confidence,
              targets: [targetForEndpoint(borrowed.automate.from), targetForEndpoint(borrowed.automate.to)],
              panelMessage: `${jackName(borrowed.automate.from)} → ${jackName(borrowed.automate.to)}`,
              proactive: true,
              alternateOnly: true,
              focus: { instrumentId: focus },
              trace: [`You are working on ${instrumentName(focus)}`, 'Mother-32 LFO outputs are unpatched']
            }));
          }
        }
        if (lens.plateau || lens.dwell) {
          const unexplored = concepts.find(concept => !concept.synthetic &&
            (concept.controls ?? []).some(candidate => candidate.instrumentId === focus) &&
            progressOf(model, concept.id).rung === 0 && touchesOf(model, concept.id).total === 0 &&
            !snoozed(model, concept.id));
          const first = unexplored?.controls.find(candidate => candidate.instrumentId === focus);
          if (first) {
            candidates.push(genericCue(action, {
              id: `explore:${unexplored.id}`,
              kind: 'suggestion',
              // A plateau is a clear stuck signal; lingering in one section is a weaker one.
              priority: lens.plateau ? 40 : 25,
              title: `Explore: ${unexplored.title}`,
              body: `${unexplored.intro.text} Try ${controlName(first.instrumentId, first.targetId)}.`,
              confidence: unexplored.confidence,
              targets: [control(first.instrumentId, first.targetId)],
              panelMessage: `Try ${controlName(first.instrumentId, first.targetId)}`,
              concept: unexplored.id,
              proactive: true,
              focus: { instrumentId: focus },
              trace: [lens.plateau
                ? `No new idea or cable in the last ${PLATEAU_ACTIONS} actions`
                : 'You have stayed in one section for a while']
            }));
          }
        }
      }
      return candidates;
    }

    // ─── Layer 5: scoring and arbitration ───────────────────────────────────────────
    function relevance(cue, action, lens) {
      const focus = cue.focus;
      if (!focus) return 0.35;
      const instrumentId = action.instrumentId ?? lens.focusInstrument;
      if (focus.instrumentId === instrumentId && focus.targetId && focus.targetId === action.targetId) return 1;
      if (focus.instrumentId === instrumentId && focus.sectionId && focus.sectionId === action.sectionId) return 0.8;
      if (focus.instrumentId === instrumentId) return 0.6;
      return 0.35;
    }

    const scoreOf = (cue, action, lens) => cue.priority * relevance(cue, action, lens) *
      (cue.targets?.length ? 1 : 0.7) * (CONFIDENCE_WEIGHT[cue.confidence] ?? 0.8);

    function coolingDown(model, cue) {
      // Direct feedback about the player's own action never goes quiet.
      if (['event', 'warning', 'instruction', 'recipe'].includes(cue.kind)) return false;
      if ((cue.concept && snoozed(model, cue.concept)) || snoozed(model, cue.id)) return true;
      if (cue.kind === 'diagnosis' && cue.id !== 'diagnosis:audio-off') return false;
      const shownAt = model.ledger[cue.id];
      const cooldown = cue.id === 'diagnosis:audio-off' ? AUDIO_OFF_COOLDOWN : CUE_COOLDOWN;
      return Number.isFinite(shownAt) && model.actionIndex - shownAt < cooldown;
    }

    function markShown(model, cue) {
      const ledger = { ...model.ledger, [cue.id]: model.actionIndex };
      let conceptState = model.concepts;
      let conceptTouches = model.conceptTouches;
      let lastProgressAt = model.lastProgressAt;
      // Any displayed explanation that names a concept is exposure, whether or not it
      // also advances the content stage. It is never evidence the learner tried or
      // understood anything: only operating a control sets tried, and only the learner
      // saying so sets known.
      const introducedId = cue.progress?.conceptId ?? cue.concept ?? null;
      if (introducedId) {
        const current = conceptState[introducedId] ?? NO_PROGRESS;
        if (!current.introduced) {
          conceptState = { ...conceptState, [introducedId]: { ...current, introduced: true } };
        }
      }
      if (cue.progress) {
        const { conceptId, rung } = cue.progress;
        const current = conceptState[conceptId] ?? NO_PROGRESS;
        if (rung > current.rung) {
          conceptState = { ...conceptState, [conceptId]: { ...current, rung } };
          conceptTouches = {
            ...conceptTouches,
            [conceptId]: { ...touchesOf(model, conceptId), sinceRung: 0 }
          };
          lastProgressAt = model.actionIndex;
        }
      }
      if (cue.trigger === 'matched') lastProgressAt = model.actionIndex;
      const completedRecipeIds = cue.completesRecipe
        ? [...new Set([...model.completedRecipeIds, cue.completesRecipe])]
        : model.completedRecipeIds;
      return createSessionModel({
        ...model,
        completedRecipeIds,
        activeRecipeId: cue.completesRecipe ? null : model.activeRecipeId,
        ledger,
        concepts: conceptState,
        conceptTouches,
        lastProgressAt,
        lastProactiveAt: cue.proactive ? model.actionIndex : model.lastProactiveAt
      });
    }

    function decide(model, candidates, action, lens) {
      const level = GUIDANCE[model.guidanceLevel] ?? GUIDANCE.coach;
      const active = model.activeCue;
      const eligible = candidates
        .filter(Boolean)
        .filter(cue => !coolingDown(model, cue))
        .map(cue => ({ ...cue, score: scoreOf(cue, action, lens) }));
      // Primary follows priority (warnings, diagnoses, completions, teaching, events);
      // the relevance score breaks ties and orders the alternates.
      const byPriority = [...eligible].sort((a, b) => b.priority - a.priority || b.score - a.score);
      let primary = byPriority.find(cue => !cue.alternateOnly && (
        !cue.proactive || model.actionIndex - model.lastProactiveAt >= level.proactiveGap
      )) ?? null;
      if (primary && active?.completionTargets?.length && active.priority > primary.priority) {
        primary = null;
      }
      const seen = new Set([primary?.id, active?.id].filter(Boolean));
      // Two ideas that highlight exactly the same controls and jacks are one idea.
      const targetSignature = cue => (cue?.targets?.length
        ? cue.targets.map(target => `${target.instrumentId}:${target.targetId}`).join('|')
        : null);
      const seenTargets = new Set([targetSignature(primary)].filter(Boolean));
      const alternates = [];
      for (const cue of [...eligible].sort((a, b) => b.score - a.score)) {
        if (alternates.length >= level.alternates) break;
        if (!ALTERNATE_KINDS.has(cue.kind) || seen.has(cue.id)) continue;
        const targetKey = targetSignature(cue);
        if (targetKey && seenTargets.has(targetKey)) continue;
        seen.add(cue.id);
        if (targetKey) seenTargets.add(targetKey);
        alternates.push(Object.freeze(cue));
      }
      if (!primary) return result(active ?? null, { ...model, alternates });
      const shown = markShown(model, primary);
      return result(Object.freeze(primary), { ...shown, alternates });
    }

    // ─── Coach controls: feedback, promotion, guidance, reset ───────────────────────
    function handleCoachAction(action, model, rackState) {
      const offered = action.type === 'promote-alternate'
        ? model.alternates.find(cue => cue.id === action.cueId)?.startsRecipe
        : null;
      if (action.type === 'start-recipe' || offered) {
        const recipeId = offered ?? action.recipeId;
        if (!recipeById.has(recipeId)) return retain(model);
        const next = createSessionModel({ ...model, activeRecipeId: recipeId, alternates: [] });
        const cue = recipeCue(action, next, deriveRackFacts(rackState));
        return cue ? result(Object.freeze(cue), markShown(next, cue)) : retain(next);
      }
      if (action.type === 'show-build-on') {
        const recipe = recipeById.get(action.recipeId);
        const item = buildOnItems(recipe).find(candidate => candidate.id === action.itemId);
        const cue = recipe && item ? buildOnCue(action, recipe, item, deriveRackFacts(rackState), { alternateOnly: false }) : null;
        return cue ? result(Object.freeze(cue), markShown(model, cue)) : retain(model);
      }
      if (action.type === 'stop-recipe') {
        const activeCue = model.activeCue?.kind === 'recipe' ? null : model.activeCue;
        return result(activeCue, { ...model, activeRecipeId: null });
      }
      if (action.type === 'set-guidance') {
        const next = createSessionModel({ ...model, guidanceLevel: action.level });
        return next.guidanceLevel === 'off' ? silence(next) : retain(next);
      }
      if (action.type === 'reset-progress') {
        return result(null, createSessionModel({ guidanceLevel: model.guidanceLevel }));
      }
      if (action.type === 'promote-alternate') {
        const chosen = model.alternates.find(cue => cue.id === action.cueId);
        if (!chosen) return retain(model);
        const shown = markShown(model, chosen);
        return result(chosen, {
          ...shown,
          alternates: model.alternates.filter(cue => cue.id !== chosen.id)
        });
      }
      if (action.type === 'cue-feedback') {
        const cue = model.activeCue;
        if (!cue) return retain(model);
        let next = { ...model };
        const conceptId = cue.concept;
        if (action.verdict === 'know' && conceptId) {
          const current = model.concepts[conceptId] ?? NO_PROGRESS;
          next.concepts = {
            ...model.concepts,
            [conceptId]: { ...current, rung: Math.max(current.rung, 3), known: true }
          };
        } else if (action.verdict === 'not-now') {
          next.snoozed = { ...model.snoozed, [conceptId ?? cue.id]: model.actionIndex + NOT_NOW_COOLDOWN };
        } else if (action.verdict === 'got-it' && conceptId) {
          const touches = touchesOf(model, conceptId);
          next.conceptTouches = {
            ...model.conceptTouches,
            [conceptId]: { ...touches, sinceRung: Math.max(touches.sinceRung, GUIDANCE.teach.rungTouches) }
          };
        }
        return result(null, { ...next, activeCue: null });
      }
      return null;
    }

    function evaluate(action, rackState = {}, previousSessionModel = createSessionModel()) {
      let model = createSessionModel(previousSessionModel);
      if (!action || typeof action.type !== 'string') return retain(model);
      const coachResult = handleCoachAction(action, model, rackState);
      if (coachResult) return coachResult;

      model = observe(model, action);
      const warning = warningCue(action, rackState);
      const expectedNormalBreak = warning?.priority === 90 && isRecommendedCable(action.patch);
      if (warning && !expectedNormalBreak) {
        return result(Object.freeze(warning), markShown({ ...model, alternates: [] }, warning));
      }
      const normalNote = expectedNormalBreak ? ` ${warning.normalNote}` : '';
      if (action.mode === 'perform') return silence(model);
      if (action.type === 'clear-cue') {
        return result(null, { ...model, activeCue: null });
      }
      if (action.type === 'dismiss-cue') {
        const dismissedStarterIds = model.activeCue?.trigger === 'starter' && model.activeCue.ideaId
          ? [...new Set([...model.dismissedStarterIds, model.activeCue.ideaId])]
          : model.dismissedStarterIds;
        return result(null, { ...model, activeCue: null, dismissedStarterIds });
      }
      if (model.guidanceLevel === 'off') return silence(model);

      const facts = deriveRackFacts(rackState);
      if (model.activeCue?.condition && !conditionHolds(model.activeCue.condition, facts)) {
        model = createSessionModel({ ...model, activeCue: null });
      }
      const lens = readLens(model, action);
      // An active rack recipe leads every action until it is finished or stopped; only
      // safety warnings (returned above) outrank it.
      const candidates = [recipeCue(action, model, facts), ...recipeOffers(action, model, facts), ...buildOnCandidates(action, facts)];

      if (action.type === 'starter') {
        candidates.push(ideaCue(ideas.find(idea => (
          !model.completedIdeaIds.includes(idea.id) &&
          !model.dismissedStarterIds.includes(idea.id)
        )), 'starter', model));
      }
      if (action.type === 'jack-hover') {
        const idea = ideas.find(candidate => (
          !model.completedIdeaIds.includes(candidate.id) &&
          candidate.cables.some(cable => (
            sameEndpoint(cable.from, action.endpoint) || sameEndpoint(cable.to, action.endpoint)
          ))
        ));
        candidates.push(ideaCue(idea, 'jack', model, action.endpoint));
      }
      if (action.type === 'patch-created') {
        const patches = facts.patches;
        const completedIdea = ideas.find(candidate => (
          !model.completedIdeaIds.includes(candidate.id) &&
          candidate.cables.every(required => patches.some(patch => sameCable(required, patch)))
        ));
        const partialIdea = completedIdea ? null : ideas.find(candidate => (
          !model.completedIdeaIds.includes(candidate.id) &&
          candidate.cables.some(required => sameCable(required, action.patch))
        ));
        // Following a technique should read as one set of instructions: fold any setting
        // it still needs (for example PWM needing the pulse waveform) into its own cue.
        const openEndCues = openEndCandidates(action, facts);
        const inTechnique = Boolean(completedIdea || partialIdea) && openEndCues.length > 0;
        const techniqueNote = inTechnique ? ` ${openEndCues.map(cue => cue.body).join(' ')}` : '';
        const techniqueTargets = inTechnique ? openEndCues.flatMap(cue => cue.targets) : [];
        if (completedIdea) {
          const matched = ideaCue(completedIdea, 'matched', model);
          candidates.push(matched && (normalNote || techniqueNote)
            ? {
              ...matched,
              body: `${matched.body}${normalNote}${techniqueNote}`,
              targets: [...matched.targets, ...techniqueTargets]
            }
            : matched);
        } else if (partialIdea) {
          const remaining = partialIdea.cables.filter(
            required => !patches.some(patch => sameCable(required, patch))
          );
          const next = remaining[0];
          candidates.push(genericCue(action, {
            id: `partial:${partialIdea.id}:${partialIdea.cables.length - remaining.length}`,
            kind: 'completion',
            priority: 65,
            title: partialIdea.title,
            body: `${partialIdea.cables.length - remaining.length} of ${partialIdea.cables.length} cables connected. Next try ${jackName(next.from)} → ${jackName(next.to)}.${normalNote}${techniqueNote}`,
            ...withEvidence(partialIdea),
            targets: [targetForEndpoint(next.from), targetForEndpoint(next.to), ...techniqueTargets],
            panelMessage: `${jackName(next.from)} → ${jackName(next.to)}`,
            trace: [`This cable is part of ${partialIdea.title}`]
          }));
        } else {
          const routing = action.toRouting ? ` ${action.toRouting}` : '';
          candidates.push(genericCue(action, {
            priority: 60,
            title: 'Cable connected',
            body: `${action.fromName} → ${action.toName}.${normalNote || routing}`,
            rationale: action.signalSummary ?? 'The output now contributes to this input.',
            targets: [targetForEndpoint(action.patch.to)],
            panelMessage: `${action.fromName} → ${action.toName}`
          }));
        }
        candidates.push(...builtOnCandidates(action, facts));
        candidates.push(...patchLadderCandidates(action, model, facts));
        if (!inTechnique) candidates.push(...openEndCues);
        candidates.push(...diagnosisCandidates(action, facts, action.patch.to.instrumentId));
        candidates.push(...proactiveCandidates(action, model, lens, facts));
      }
      if (action.type === 'patch-removed') {
        candidates.push(genericCue(action, {
          title: 'Cable removed',
          body: action.restoredRouting
            ? `${action.fromName} → ${action.toName} removed. ${action.restoredRouting}`
            : `${action.fromName} → ${action.toName} removed.`,
          rationale: action.restoredRouting
            ? 'Removing a patch can restore an instrument’s internal normal.'
            : 'The destination no longer receives that source.'
        }));
        candidates.push(...pathwayBreakCandidates(action, rackState, facts));
        if (lens.churn && action.patch?.from) {
          candidates.push(...destinationCandidates(action, action.patch.from, model, 55, true, facts).slice(0, 1)
            .map(cue => ({ ...cue, title: `Where could ${jackName(action.patch.from)} go?` })));
        }
        candidates.push(...proactiveCandidates(action, model, lens, facts));
      }
      if (action.type === 'output-selected') {
        candidates.push(genericCue(action, {
          title: 'Choose a destination',
          body: `${action.targetName} is selected. Gold inputs fit your current patch; red ones already have a cable. Any input is allowed, including one on the same instrument.`,
          rationale: action.signalSummary,
          targets: [targetForEndpoint(action.endpoint)],
          panelMessage: `${action.targetName} selected`
        }));
        candidates.push(...destinationCandidates(action, action.endpoint, model, 40, false, facts));
      }
      if (action.type === 'input-selected') {
        const occupants = facts.occupantsOf(action.endpoint.instrumentId, action.endpoint.jackId);
        const owner = occupants[0] ? pathwayOwning(occupants[0], facts) : null;
        candidates.push(genericCue(action, {
          title: 'Choose a source',
          body: occupants.length
            ? `${action.targetName} already receives ${occupants.map(patch => endpointLabel(patch.from)).join(', ')}` +
              `${owner ? `, part of ${owner.title}` : ''}. Another source here needs a mixer.`
            : `${action.targetName} is the destination. Gold outputs fit your current patch; choose any output to connect it.`,
          rationale: action.signalSummary,
          targets: [targetForEndpoint(action.endpoint)],
          panelMessage: `${action.targetName} selected`
        }));
      }
      if (action.type === 'input-without-output') {
        candidates.push(genericCue(action, {
          kind: 'instruction',
          title: 'Start with a source',
          body: `Select an outlined output before ${action.targetName}.`,
          rationale: 'A patch cable carries a signal from an output into an input.',
          targets: [targetForEndpoint(action.endpoint)],
          panelMessage: 'Choose an output first'
        }));
        // Repeated mistakes are a stuck signal, so offer the same next steps as a plateau.
        candidates.push(...proactiveCandidates(action, model, lens, facts));
      }
      if (action.type === 'control-change') {
        const completedTarget = model.activeCue?.completionTargets?.some(target => (
          target.instrumentId === action.instrumentId && target.targetId === action.targetId
        ));
        if (completedTarget) {
          const completedIdeaIds = model.activeCue.ideaId
            ? [...new Set([...model.completedIdeaIds, model.activeCue.ideaId])]
            : model.completedIdeaIds;
          model = createSessionModel({ ...model, activeCue: null, completedIdeaIds, lastProgressAt: model.actionIndex });
        }
        const concept = conceptByControl.get(`${action.instrumentId}:${action.targetId}`);
        if (concept) {
          const touches = touchesOf(model, concept.id);
          const instruments = touches.instruments.includes(action.instrumentId)
            ? touches.instruments
            : [...touches.instruments, action.instrumentId];
          const tried = model.concepts[concept.id] ?? NO_PROGRESS;
          model = createSessionModel({
            ...model,
            conceptCounts: { ...model.conceptCounts, [concept.id]: (model.conceptCounts[concept.id] ?? 0) + 1 },
            // Operating the concept's own control is the only thing that marks it tried.
            concepts: tried.tried
              ? model.concepts
              : { ...model.concepts, [concept.id]: { ...tried, tried: true } },
            conceptTouches: {
              ...model.conceptTouches,
              [concept.id]: { total: touches.total + 1, sinceRung: touches.sinceRung + 1, instruments }
            }
          });
        }
        candidates.push(...ladderCandidates(action, model, lens, facts));
        candidates.push(...openEndCandidates(action, facts));
        candidates.push(...settingCandidates(action, facts));
        candidates.push(...balanceCandidates(action, model, facts));
        candidates.push(...diagnosisCandidates(action, facts, action.instrumentId));
        candidates.push(...proactiveCandidates(action, model, lens, facts));
      }
      if (action.type === 'transport') {
        candidates.push(genericCue(action, {
          priority: 55,
          title: `${action.instrumentName} transport`,
          body: `${action.targetName}: ${action.state}. ${action.next ?? 'Watch the step position and listen for the next event.'}`,
          rationale: action.rationale ?? ''
        }));
        // A press is confirmed by the worklet's state report; diagnose that report, not the
        // press, and never diagnose a manual trigger, which sounds regardless.
        const report = action.targetId === 'sequencer-state';
        if (report) candidates.push(...diagnosisCandidates(action, facts, action.instrumentId));
      }
      if (action.type === 'audio') {
        candidates.push(genericCue(action, {
          title: 'Audio engine',
          body: action.message,
          rationale: action.state === 'running'
            ? 'Trigger or start one instrument, then use its analysis tab to connect control changes to sound.'
            : ''
        }));
      }
      if (action.type === 'analysis-source') {
        candidates.push(genericCue(action, {
          title: `Inspecting ${action.sourceName}`,
          body: 'Watch the oscilloscope for shape, the spectrum for harmonics, and the spectrogram for change over time.',
          rationale: action.sourceName === 'rack mix'
            ? 'The mix view combines all three post-output signals.'
            : `This view isolates ${action.sourceName}.`
        }));
      }
      if (action.type === 'project') {
        candidates.push(genericCue(action, {
          priority: 10,
          title: action.title,
          body: action.message,
          rationale: action.next ?? ''
        }));
      }
      if (action.type === 'practice-mode') {
        candidates.push(genericCue(action, {
          priority: 15,
          title: 'Practice coaching active',
          body: 'Actions can now surface one contextual explanation or next step.',
          rationale: 'Perform mode keeps this layer silent.'
        }));
      }
      return decide(model, candidates, action, lens);
    }

    // Exposure, action, and self-report are reported separately. Demonstrated
    // application needs a task predicate and is not claimed by this engine.
    function summarizeProgress(model) {
      const ids = catalogConceptIds.length ? catalogConceptIds : concepts.map(concept => concept.id);
      const count = predicate => ids.filter(id => {
        const progress = model.concepts[id];
        return Boolean(progress) && predicate(progress);
      }).length;
      return Object.freeze({
        introduced: count(progress => progress.introduced || progress.rung > 0),
        tried: count(progress => progress.tried),
        known: count(progress => progress.known),
        total: ids.length
      });
    }

    return Object.freeze({
      evaluate,
      summarizeProgress,
      listRecipes,
      recipeProgress,
      pathwaySummary,
      gradeTargets,
      importProgress: data => importProgress(data, {
        conceptIds: concepts.map(concept => concept.id),
        ideaIds: ideas.map(idea => idea.id),
        recipeIds: recipes.map(recipe => recipe.id)
      })
    });
  }

  return Object.freeze({
    createCoachEngine,
    createSessionModel,
    exportProgress,
    importProgress,
    PROGRESS_SCHEMA_VERSION
  });
}));
