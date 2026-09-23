'use strict';

(() => {
  const appData = window.MOOG_APP_DATA;
  const coachApi = window.MOOG_COACH;
  const polyrhythm = window.MOOG_POLYRHYTHM;
  const workletSource = window.MOOG_WORKLET_SOURCE;
  const mother32Patterns = window.MOOG_MOTHER32_PATTERNS;
  const mother32EditorApi = window.MOOG_MOTHER32_EDITOR;
  const recorderApi = window.MOOG_AUDIO_RECORDER;
  const historyApi = window.MOOG_HISTORY;
  const variationsApi = window.MOOG_VARIATIONS;
  const experimentsApi = window.MOOG_EXPERIMENTS;
  if (!appData || !coachApi || !polyrhythm || !workletSource || !mother32Patterns || !mother32EditorApi || !recorderApi || !historyApi || !variationsApi || !experimentsApi) {
    document.body.textContent = 'The local runtime bundle is incomplete.';
    return;
  }

  const instrumentOrder = ['dfam', 'mother32', 'subharmonicon'];
  const colors = {
    dfam: '#e45336',
    mother32: '#d6a84b',
    subharmonicon: '#65a7b8'
  };
  const cableColors = [
    '#f5c84b', '#eb6f92', '#62c8ff', '#a7e46e',
    '#bd93f9', '#ff8f5c', '#f4a3d7', '#8ad1c2'
  ];
  const storageKey = 'moog-rack-project-v1';
  const liveInstrumentIds = ['dfam', 'mother32', 'subharmonicon'];
  const liveRackLabel = liveInstrumentIds.map(id => appData.specs[id].name).join(' + ');
  const mother32StepPadIds = [
    'kb.pad[0]', 'kb.pad[2]', 'kb.pad[4]', 'kb.pad[5]',
    'kb.pad[7]', 'kb.pad[9]', 'kb.pad[11]', 'kb.pad[12]'
  ];

  const rack = document.querySelector('#rack');
  const rackShell = document.querySelector('#rackShell');
  const cableLayer = document.querySelector('#cableLayer');
  const statusText = document.querySelector('#statusText');
  const stateSummary = document.querySelector('#stateSummary');
  const audioStatus = document.querySelector('#audioStatus');
  const startAudioButton = document.querySelector('#startAudioBtn');
  const importInput = document.querySelector('#importInput');
  const hintCard = document.querySelector('#hintCard');
  const hintTitle = document.querySelector('#hintTitle');
  const hintText = document.querySelector('#hintText');
  const hintWhy = document.querySelector('#hintWhy');
  const hintEvidence = document.querySelector('#hintEvidence');
  const hintEvidenceGroup = document.querySelector('#hintEvidenceGroup');
  const hintSource = document.querySelector('#hintSource');
  const hintDetails = hintWhy.closest('.hint-details');
  const dismissHintButton = document.querySelector('#dismissHintBtn');
  const hintDock = document.querySelector('#hintDock');
  const hintActions = document.querySelector('#hintActions');
  const hintTrace = document.querySelector('#hintTrace');
  const hintFeedback = document.querySelector('#hintFeedback');
  const hintGotItButton = document.querySelector('#hintGotItBtn');
  const hintKnowButton = document.querySelector('#hintKnowBtn');
  const hintMore = document.querySelector('#hintMore');
  const hintMoreSummary = document.querySelector('#hintMoreSummary');
  const hintAlternates = document.querySelector('#hintAlternates');
  const guidanceSelect = document.querySelector('#guidanceSelect');
  const coachProgressText = document.querySelector('#coachProgress');
  const resetCoachButton = document.querySelector('#resetCoachBtn');
  const stopRecipeButton = document.querySelector('#stopRecipeBtn');
  const recipeIntro = document.querySelector('#recipeIntro');
  const recipeSteps = document.querySelector('#recipeSteps');
  const recipeList = document.querySelector('#recipeList');
  const recipePathways = document.querySelector('#recipePathways');
  const recipeIntroText = recipeIntro.textContent;
  const repeatHorizonReadout = document.querySelector('#repeatHorizonReadout');
  const analysisTabs = [...document.querySelectorAll('.analysis-tab')];
  const scopeCanvas = document.querySelector('#scopeCanvas');
  const spectrumCanvas = document.querySelector('#spectrumCanvas');
  const spectrogramCanvas = document.querySelector('#spectrogramCanvas');
  const analysisReadout = document.querySelector('#analysisReadout');
  const analysisCard = document.querySelector('#analysisCard');
  const performanceCard = document.querySelector('#performanceCard');
  const performanceMeterFill = document.querySelector('#performanceMeterFill');
  const performanceMeterReadout = document.querySelector('#performanceMeterReadout');
  const patchAssist = document.querySelector('#patchAssist');
  const patchAssistText = document.querySelector('#patchAssistText');
  const patchAssistLegend = document.querySelector('#patchAssistLegend');
  const patchAssistSuggestions = document.querySelector('#patchAssistSuggestions');
  const hintShowButton = document.querySelector('#hintShowBtn');
  const targetLocator = document.querySelector('#targetLocator');
  const appHeader = document.querySelector('.app-header');
  const cancelPatchButton = document.querySelector('#cancelPatchBtn');
  const undoButton = document.querySelector('#undoBtn');
  const redoButton = document.querySelector('#redoBtn');
  const keepButton = document.querySelector('#keepBtn');
  const returnButton = document.querySelector('#returnBtn');
  const intentButtons = document.querySelector('#intentButtons');
  const intentScope = document.querySelector('#intentScope');
  const intentLockFields = document.querySelector('#intentLocks');
  const intentStatus = document.querySelector('#intentStatus');
  const intentProposals = document.querySelector('#intentProposals');
  const experimentSelect = document.querySelector('#experimentSelect');
  const experimentIntro = document.querySelector('#experimentIntro');
  const experimentStatus = document.querySelector('#experimentStatus');
  const experimentBlockers = document.querySelector('#experimentBlockers');
  const experimentPredictionField = document.querySelector('#experimentPredictionField');
  const experimentPredictionPrompt = document.querySelector('#experimentPredictionPrompt');
  const experimentPrediction = document.querySelector('#experimentPrediction');
  const experimentInstruction = document.querySelector('#experimentInstruction');
  const experimentStartButton = document.querySelector('#experimentStartBtn');
  const experimentShowButton = document.querySelector('#experimentShowBtn');
  const experimentCompareButton = document.querySelector('#experimentCompareBtn');
  const experimentKeepButton = document.querySelector('#experimentKeepBtn');
  const experimentRestoreButton = document.querySelector('#experimentRestoreBtn');
  const knobPopover = document.createElement('div');
  knobPopover.id = 'knobValuePopover';
  knobPopover.className = 'knob-popover';
  knobPopover.setAttribute('role', 'tooltip');
  knobPopover.hidden = true;
  // The popover is the only place a pointer user learns how far a drag travels, so it
  // carries the live value, the distance from where the gesture started, and a meter
  // showing how fine the current pointer position has made the knob.
  const knobPopoverValue = document.createElement('span');
  knobPopoverValue.className = 'knob-popover__value';
  const knobPopoverDelta = document.createElement('span');
  knobPopoverDelta.className = 'knob-popover__delta';
  const knobPopoverMeter = document.createElement('span');
  knobPopoverMeter.className = 'knob-popover__meter';
  const knobPopoverMeterFill = document.createElement('span');
  knobPopoverMeterFill.className = 'knob-popover__meter-fill';
  knobPopoverMeter.append(knobPopoverMeterFill);
  const knobPopoverHint = document.createElement('span');
  knobPopoverHint.className = 'knob-popover__hint';
  knobPopover.append(knobPopoverValue, knobPopoverDelta, knobPopoverMeter, knobPopoverHint);
  document.body.append(knobPopover);

  // Typed entry is a separate element from the read-only popover because it has to take
  // focus and keystrokes, which a `pointer-events: none` tooltip cannot.
  const knobEditor = document.createElement('form');
  knobEditor.className = 'knob-editor';
  knobEditor.hidden = true;
  const knobEditorLabel = document.createElement('label');
  knobEditorLabel.className = 'knob-editor__label';
  knobEditorLabel.htmlFor = 'knobEditorInput';
  const knobEditorInput = document.createElement('input');
  knobEditorInput.id = 'knobEditorInput';
  knobEditorInput.className = 'knob-editor__input';
  knobEditorInput.type = 'text';
  knobEditorInput.autocomplete = 'off';
  knobEditorInput.spellcheck = false;
  const knobEditorHint = document.createElement('span');
  knobEditorHint.className = 'knob-editor__hint';
  knobEditorHint.id = 'knobEditorHint';
  knobEditorInput.setAttribute('aria-describedby', knobEditorHint.id);
  knobEditor.append(knobEditorLabel, knobEditorInput, knobEditorHint);
  document.body.append(knobEditor);
  const panelHint = document.createElement('div');
  panelHint.className = 'panel-hint';
  panelHint.setAttribute('aria-hidden', 'true');
  panelHint.hidden = true;

  let projectState = clone(appData.defaultState);
  // One session checkpoint for fearless exploration. It deliberately stores panel,
  // cable, and pattern settings rather than live DSP phase or held notes.
  let keptCheckpoint = null;
  let patternEditor = null;
  let patternRestartPending = false;
  let selectedOutput = null;
  let previewInput = null;
  // Input-first patching: an input chosen as the destination, and the output being previewed.
  let selectedInput = null;
  let previewOutput = null;
  let targetGrades = new Map();
  let patchSuggestionsKey = '';
  let locatorEntries = [];
  let locatorSignature = '';
  let cableDrawFrame = 0;
  let jackNameFitWidth = -1;
  let cableResizeObserver = null;
  let audioContext = null;
  let audioTransitionPending = false;
  let audioInstrumentNodes = Object.create(null);
  let audioDestinationGains = Object.create(null);
  let audioCrossConnections = [];
  let audioAnalysisGraph = null;
  const audioRecorder = recorderApi.create({
    element: document.querySelector('#audioRecorder'),
    ensureAudio: async () => {
      if (audioTransitionPending) throw new Error('An audio transition is in progress. Try Record again.');
      if (audioContext?.state !== 'running') await toggleAudio();
    },
    getAudio: () => ({ context: audioContext, gains: audioDestinationGains }),
    getSnapshot: () => stateForSave(),
    describeState: describeStateForLog
  });
  let selectedAnalysisSource = 'mix';
  let lastAnalysisFrameMs = 0;
  let lastMeterFrameMs = 0;
  let meterClipUntilMs = 0;
  let lastSpectrogramFrameMs = 0;
  let spectrogramColumnRemainder = 0;
  let spectrumPeakDb = null;
  let spectrumPeakUntilMs = null;
  const audioBlockSizes = { dfam: 128, mother32: 128, subharmonicon: 128 };
  const audioReadyInstruments = new Set();
  const activeSubharmoniconHolds = new Map();
  const activeKeyboardPads = new Map();
  const coachActionHistory = [];
  // One set of display names for everything that talks about the rack in words.
  const jackNamesById = Object.fromEntries(instrumentOrder.flatMap(instrumentId => (
    appData.specs[instrumentId].patchbay.jacks.map(jack => {
      const sources = appData.specs[instrumentId].internalSources ?? [];
      const sourceLabel = sourceId => sources.find(source => source.id === sourceId)?.desc;
      return [`${instrumentId}:${jack.id}`, {
        name: jack.name,
        dir: jack.dir,
        normalledFrom: jack.normalledFrom,
        normalledFromLabel: sourceLabel(jack.normalledFrom),
        normalCondition: jack.normalCondition,
        normalConditionLabel: sourceLabel(jack.normalCondition),
        breaksNormal: jack.breaksNormal,
        breaksNormalLabel: sourceLabel(jack.breaksNormal),
        signal: jack.signal,
        replacesLabel: sourceLabel(jack.replaces)
      }];
    })
  )));
  const instrumentNamesById = Object.fromEntries(
    instrumentOrder.map(id => [id, appData.specs[id].name])
  );
  const controlNamesById = Object.fromEntries(instrumentOrder.flatMap(instrumentId => (
    parameterDefinitions(appData.specs[instrumentId]).map(definition => [
      `${instrumentId}:${definition.id}`,
      { name: definition.name, sectionId: definition.sectionId }
    ])
  )));
  const coachEngine = coachApi.createCoachEngine({
    patchIdeas: appData.patchIdeas,
    coachCues: appData.coachCues,
    jackNames: jackNamesById,
    concepts: appData.concepts,
    rackRecipes: appData.rackRecipes,
    instrumentNames: instrumentNamesById,
    controlNames: controlNamesById
  });
  // Musical intentions. The engine proposes; applying belongs here, as one undoable
  // transaction, and only when the player asks for it.
  const variationEngine = variationsApi.createVariations({
    catalog: appData.intentions,
    manifests: appData.manifests,
    jackNames: jackNamesById,
    instrumentNames: instrumentNamesById,
    controlNames: controlNamesById,
    // Proposals are read before they are accepted, so they show panel values, not the
    // normalized numbers the engine works in.
    format: (instrumentId, parameterId, value) => {
      const definition = definitionFor(instrumentId, parameterId);
      return definition ? displayParameterValue(definition, value) : null;
    }
  });
  const experimentEngine = experimentsApi.createExperiments(appData.experiments);
  experimentSelect.replaceChildren(...experimentEngine.experiments.map(experiment =>
    new Option(experiment.title, experiment.id)));
  // Coaching progress belongs to the learner, not the patch: its own storage key, never
  // part of project save/export, and an in-memory fallback when storage is unavailable.
  const coachProgressKey = 'moog-coach-progress-v1';
  const coachTransport = Object.create(null);
  let coachProgressMemory = null;
  let coachProgressSignature = '';
  let coachSessionModel = coachApi.createSessionModel();
  coachSessionModel = restoreCoachProgress();
  let activeKnobDrag = null;
  let activeKnobEditor = null;
  // Reversible edits: control values and the cable list. Session-only by design, so it
  // is never written into a save. Applying an entry must not record a new one.
  let editHistory = historyApi.createHistory();
  let applyingHistory = false;
  // The last set of variation proposals, the intention that produced them, and the seed
  // they were drawn with. Any edit to the rack clears them: a proposal describes the
  // settings it was drawn against, and applying a stale one would move the wrong knobs.
  let variationOffer = null;
  let variationSeed = 1;
  const variationLocks = new Set();
  // An experiment baseline is independent of the player's manual checkpoint. It lasts
  // until the task is kept, restored, or abandoned, including through unrelated edits.
  let activeExperiment = null;
  let experimentSetupBlockers = [];
  let activeCoachCue = null;
  let patchIdCounter = 0;
  const signalFlowApi = window.MOOG_SIGNAL_FLOW;
  // Constructed without drawing; drawCables() renders it once the rack exists.
  const wiringView = signalFlowApi && appData.signalFlow
    ? signalFlowApi.createWiringView({
      flow: signalFlowApi.createSignalFlow({ specs: appData.specs, signalFlow: appData.signalFlow }),
      rack,
      button: document.querySelector('#wiringBtn'),
      jackAnchor: (endpoint, bounds) => cableAnchor(endpoint, bounds),
      requestDraw: () => scheduleCableDraw(),
      getState: () => projectState
    })
    : null;

  function clone(value) {
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function assertRuntimeContract() {
    if (appData.dataVersion !== 1) throw new Error('Unsupported local data bundle.');
    if (typeof polyrhythm.repeatHorizon !== 'function' ||
      typeof polyrhythm.repeatSeconds !== 'function') {
      throw new Error('The Subharmonicon polyrhythm helper is incomplete.');
    }
    if (!appData.calibrationManifest || appData.calibrationManifest.slotCount !== 43 ||
      appData.calibrationManifest.slots.some(slot => (
        slot.status !== 'measurement-needed' || Object.keys(slot.values).length !== 0
      ))) {
      throw new Error('Calibration contract is incomplete or contains unverified values.');
    }
    if (appData.patchIdeas?.schemaVersion !== 2 ||
      !Array.isArray(appData.patchIdeas.ideas) || !appData.patchIdeas.ideas.length) {
      throw new Error('The source-grounded patch-idea catalog is incomplete.');
    }
    if (appData.coachCues?.schemaVersion !== 2 ||
      !Array.isArray(appData.coachCues.cues) || !appData.coachCues.cues.length) {
      throw new Error('The coaching-cue catalog is incomplete.');
    }
    if (appData.experiments?.schemaVersion !== 1 ||
      !Array.isArray(appData.experiments.experiments) || !appData.experiments.experiments.length) {
      throw new Error('The listening-experiment catalog is incomplete.');
    }
    for (const instrumentId of instrumentOrder) {
      const spec = appData.specs[instrumentId];
      const manifest = appData.manifests[instrumentId];
      const state = appData.defaultState.instruments[instrumentId];
      if (!spec || spec.patchbay.jacks.length !== spec.patchbay.total) {
        throw new Error(`${instrumentId} patchbay data is incomplete.`);
      }
      if (!manifest || manifest.parameters.length !== manifest.parameterCount) {
        throw new Error(`${instrumentId} parameter manifest is incomplete.`);
      }
      const definitions = parameterDefinitions(spec);
      const definitionIds = new Set(definitions.map(control => control.id));
      if (definitionIds.size !== manifest.parameterCount ||
        manifest.parameters.some(parameter => !definitionIds.has(parameter.id))) {
        throw new Error(`${instrumentId} panel controls do not match the parameter manifest.`);
      }
      if (appData.defaultState.parameterTables[instrumentId] !== manifest.parameterHash ||
        Object.keys(state?.parameters ?? {}).length !== manifest.parameterCount) {
        throw new Error(`${instrumentId} default state does not match its manifest.`);
      }
    }
  }

  function setStatus(message, tone = 'normal') {
    statusText.textContent = message;
    statusText.dataset.tone = tone;
  }

  function allParametersCount() {
    return instrumentOrder.reduce((total, id) => (
      total + appData.manifests[id].parameterCount
    ), 0);
  }

  function endpointKey(endpoint) {
    return `${endpoint.instrumentId}/${endpoint.jackId}`;
  }

  function jackFor(endpoint) {
    const spec = appData.specs[endpoint?.instrumentId];
    return spec?.patchbay.jacks.find(jack => jack.id === endpoint?.jackId) ?? null;
  }

  function physicalJackIds(instrumentId, direction) {
    return appData.specs[instrumentId].patchbay.jacks
      .filter(jack => jack.dir === direction)
      .sort((left, right) => left.row - right.row || left.col - right.col)
      .map(jack => jack.id);
  }

  function describeJack(spec, jack) {
    const voltage = Array.isArray(jack.range)
      ? `${jack.range[0]}…${jack.range[1]} V`
      : jack.rangeNote ?? 'range not published';
    const routing = jack.breaksNormal
      ? ` Breaks ${jack.breaksNormal}.`
      : jack.replaces
        ? ` Replaces ${jack.replaces}.`
        : '';
    return `${spec.name} ${jack.name}; ${jack.dir === 'out' ? 'output' : 'input'}; ${voltage}.${routing}`;
  }

  function endpointsMatch(left, right) {
    return left?.instrumentId === right?.instrumentId && left?.jackId === right?.jackId;
  }

  function endpointLabel(endpoint) {
    const spec = appData.specs[endpoint?.instrumentId];
    const jack = jackFor(endpoint);
    return spec && jack ? `${spec.name} ${jack.name}` : 'patch jack';
  }

  function clearHintTargets() {
    for (const element of rack.querySelectorAll('.control--hint-target, .jack--hint-target')) {
      element.classList.remove('control--hint-target', 'jack--hint-target');
    }
    panelHint.hidden = true;
    panelHint.remove();
  }

  function showPanelHint(target, message) {
    const faceplate = target?.closest('.instrument__faceplate');
    if (!faceplate || projectState.ui?.mode === 'perform') return;
    const faceplateBounds = faceplate.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    const x = (targetBounds.left + targetBounds.width / 2 - faceplateBounds.left) /
      faceplateBounds.width;
    const top = (targetBounds.top - faceplateBounds.top) / faceplateBounds.height;
    const bottom = (targetBounds.bottom - faceplateBounds.top) / faceplateBounds.height;
    panelHint.textContent = message;
    const patchbay = target.closest('.patchbay');
    if (patchbay) {
      // Jacks sit in a dense grid: anchor the note just outside the patchbay's left edge,
      // level with the jack, so no jack or label in the grid is covered.
      const patchbayLeft = (patchbay.getBoundingClientRect().left - faceplateBounds.left) /
        faceplateBounds.width;
      const middle = (top + bottom) / 2;
      panelHint.dataset.side = 'left';
      panelHint.style.left = `${patchbayLeft * 100}%`;
      panelHint.style.top = `${Math.max(0.06, Math.min(0.94, middle)) * 100}%`;
    } else {
      // Controls: sit beside the target's top or bottom edge, never over it.
      const above = top > 0.22;
      panelHint.dataset.side = above ? 'above' : 'below';
      panelHint.style.left = `${Math.max(0.12, Math.min(0.88, x)) * 100}%`;
      panelHint.style.top = `${(above ? top : bottom) * 100}%`;
    }
    faceplate.append(panelHint);
    panelHint.hidden = false;
  }

  function coachTargetElement(target) {
    if (target.kind === 'jack') return jackElement({
      instrumentId: target.instrumentId,
      jackId: target.targetId
    });
    return rack.querySelector(
      `.control[data-instrument-id="${target.instrumentId}"][data-parameter-id="${target.targetId}"]`
    );
  }

  function presentCoachCue(cue) {
    if (!cue || (projectState.ui?.mode === 'perform' && cue.kind !== 'warning')) return;
    clearHintTargets();
    activeCoachCue = cue;
    hintCard.classList.toggle('card--warning', cue.kind === 'warning');
    hintCard.setAttribute('aria-live', cue.kind === 'warning' ? 'assertive' : 'polite');
    hintTitle.textContent = cue.title;
    hintText.textContent = cue.body;
    hintWhy.textContent = cue.rationale;
    hintEvidence.textContent = cue.evidenceQuote;
    hintSource.textContent = cue.evidenceLabel;
    hintEvidenceGroup.hidden = !cue.evidenceQuote;
    hintDetails.hidden = !cue.rationale && !cue.evidenceQuote;
    let firstTarget = null;
    for (const target of cue.targets ?? []) {
      const element = coachTargetElement(target);
      element?.classList.add(target.kind === 'jack'
        ? 'jack--hint-target'
        : 'control--hint-target');
      firstTarget ??= element;
    }
    if (firstTarget && cue.panelMessage) showPanelHint(firstTarget, cue.panelMessage);
    // When the hint floats over the rack (narrow layouts), keep it on the side away from
    // the control it is pointing at.
    const targetBounds = firstTarget?.getBoundingClientRect();
    hintDock.dataset.side = targetBounds && targetBounds.left + targetBounds.width / 2 > innerWidth / 2
      ? 'left'
      : 'right';
    hintCard.hidden = false;
    const locatable = (cue.targets ?? []).map(coachTargetElement).filter(Boolean);
    hintShowButton.hidden = !locatable.length;
    hintShowButton.textContent = new Set((cue.targets ?? []).map(target => target.instrumentId)).size > 1
      ? 'Show both ends'
      : 'Show on panel';
    scheduleCableDraw();
    hintTrace.textContent = cue.trace?.length ? `Why this: ${cue.trace.join('; ')}.` : '';
    hintTrace.hidden = !cue.trace?.length;
    const instructional = !['warning', 'event', 'instruction', 'recipe'].includes(cue.kind);
    hintFeedback.hidden = !instructional;
    hintGotItButton.hidden = !cue.concept;
    hintKnowButton.hidden = !cue.concept;
  }

  function clearCoachPresentation() {
    activeCoachCue = null;
    hintCard.hidden = true;
    hintActions.hidden = true;
    hintCard.classList.remove('card--warning');
    clearHintTargets();
    scheduleCableDraw();
  }

  // Controls whose seconds or hertz the coach compares with the rack's measured timing.
  const coachPlainControls = [
    ['mother32', 'eg.attack'], ['mother32', 'lfo.lfo-rate'],
    ['subharmonicon', 'vca.vca-attack'], ['subharmonicon', 'vca.vca-decay'],
    ['subharmonicon', 'vcf.vcf-attack'], ['subharmonicon', 'vcf.vcf-decay']
  ];

  function coachPlainValues() {
    const values = {};
    for (const [instrumentId, targetId] of coachPlainControls) {
      const definition = definitionFor(instrumentId, targetId);
      const value = projectState.instruments[instrumentId]?.parameters?.[targetId];
      const plain = definition && Number.isFinite(value) ? normalizedToPlainValue(definition, value) : null;
      if (Number.isFinite(plain)) values[`${instrumentId}:${targetId}`] = { value: plain, unit: definition.plain?.unit };
    }
    return values;
  }

  // Seconds between note starts, from the worklets' step reports (about every 50 ms). It is
  // measured rather than derived from tempo knobs, so it holds whatever clocks the synth.
  function nextStepTiming(previous, data) {
    const position = JSON.stringify(data.currentSteps ?? data.currentStep);
    if (!data.running) return { position, stepAt: null, intervals: [], stepSeconds: null };
    const now = audioContext?.currentTime ?? 0;
    const intervals = previous?.running ? [...(previous.intervals ?? [])] : [];
    let stepAt = previous?.running ? previous.stepAt ?? null : null;
    if (position !== previous?.position) {
      if (stepAt !== null && now - stepAt > 0.02) intervals.push(now - stepAt);
      stepAt = now;
    }
    const recent = intervals.slice(-5);
    const sorted = [...recent].sort((a, b) => a - b);
    // Above ~10 steps per second several steps share one report, so use the reported rate.
    const stepSeconds = data.reason === 'clock' && data.observedStepRateHz > 10
      ? 1 / data.observedStepRateHz
      : sorted.length >= 2 ? sorted[Math.floor(sorted.length / 2)] : previous?.stepSeconds ?? null;
    return { position, stepAt, intervals: recent, stepSeconds };
  }

  function coachRackState() {
    return {
      patches: projectState.patches,
      instruments: projectState.instruments,
      audio: audioContext ? audioContext.state : 'idle',
      transport: coachTransport,
      heldKeys: activeKeyboardPads.size > 0,
      plainValues: coachPlainValues()
    };
  }

  function restoreCoachProgress() {
    let stored = coachProgressMemory;
    try {
      stored = JSON.parse(localStorage.getItem(coachProgressKey) ?? 'null');
    } catch {
      stored = coachProgressMemory;
    }
    const model = coachEngine.importProgress(stored);
    coachProgressSignature = JSON.stringify(coachApi.exportProgress(model));
    return model;
  }

  function renderRecipeCard() {
    const progress = coachEngine.recipeProgress(coachSessionModel, coachRackState());
    stopRecipeButton.hidden = !progress;
    recipeIntro.textContent = progress
      ? `${progress.title}: ${progress.doneCount} of ${progress.total} steps in place.`
      : recipeIntroText;
    recipeSteps.hidden = !progress;
    recipeSteps.replaceChildren(...(progress?.steps ?? []).map(step => {
      const item = document.createElement('li');
      item.textContent = step.panel;
      item.title = step.text;
      if (step.done) item.className = 'recipe-step--done';
      else if (step.current) item.className = 'recipe-step--current';
      if (step.current) item.setAttribute('aria-current', 'step');
      return item;
    }));
    recipeList.hidden = Boolean(progress);
    recipeList.replaceChildren(...coachEngine.listRecipes(coachSessionModel).map(recipe => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'recipe-option';
      button.dataset.recipeId = recipe.id;
      button.dataset.completed = String(recipe.completed);
      const title = document.createElement('strong');
      title.textContent = recipe.title;
      const summary = document.createElement('span');
      summary.textContent = `${recipe.summary} ${recipe.stepCount} steps.`;
      button.append(title, summary);
      return button;
    }));
    // Completed pathways and the ways to build on them (docs/design/10).
    const pathways = coachEngine.pathwaySummary(coachSessionModel, coachRackState());
    recipePathways.hidden = !pathways.length;
    recipePathways.replaceChildren(...pathways.flatMap(pathway => {
      const heading = document.createElement('h3');
      heading.textContent = `On your rack: ${pathway.title} ✓`;
      const recovery = document.createElement('p');
      recovery.className = 'fine-print';
      recovery.textContent = [
        pathway.listeningPrompt ? `Listen: ${pathway.listeningPrompt}` : '',
        pathway.recovery || 'Before branching, choose Keep this sound. Undo backs out one change; Return restores the checkpoint.'
      ].filter(Boolean).join(' ');
      return [heading, recovery, ...pathway.buildOn.map(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.buildOn = `${pathway.id}|${item.id}`;
        button.dataset.done = String(item.done);
        button.disabled = item.done || !item.available;
        button.title = item.done || item.available ? '' : 'Its input is already used by another cable.';
        button.textContent = item.done ? `Built: ${item.title}` : `Build on it: ${item.title}`;
        button.setAttribute('aria-description', [item.result, item.listeningPrompt].filter(Boolean).join(' '));
        return button;
      })];
    }));
  }

  function persistCoachProgress() {
    renderRecipeCard();
    const summary = coachEngine.summarizeProgress(coachSessionModel);
    // Say what actually happened. Showing an explanation is not the learner exploring
    // anything, so exposure and action are reported as the separate things they are.
    const parts = [`${summary.tried} of ${summary.total} concepts tried`];
    if (summary.introduced > summary.tried) parts.push(`${summary.introduced} explained`);
    if (summary.heard > 0) parts.push(`${summary.heard} heard`);
    if (summary.known > 0) parts.push(`${summary.known} marked known`);
    coachProgressText.textContent = parts.join(' · ');
    guidanceSelect.value = coachSessionModel.guidanceLevel;
    const progress = coachApi.exportProgress(coachSessionModel);
    const signature = JSON.stringify(progress);
    if (signature === coachProgressSignature) return;
    coachProgressSignature = signature;
    coachProgressMemory = progress;
    try {
      localStorage.setItem(coachProgressKey, signature);
    } catch {
      // Storage can be unavailable; progress then lasts for this session only.
    }
  }

  function renderCoachAlternates() {
    const perform = projectState.ui?.mode === 'perform';
    const alternates = activeCoachCue && !perform ? coachSessionModel.alternates : [];
    hintAlternates.replaceChildren(...alternates.map(cue => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hint-alternate';
      button.dataset.cueId = cue.id;
      const title = document.createElement('strong');
      title.textContent = cue.title;
      const body = document.createElement('span');
      body.textContent = cue.body;
      button.append(title, body);
      item.append(button);
      return item;
    }));
    hintMore.hidden = alternates.length === 0;
    hintMoreSummary.textContent = `More ideas (${alternates.length})`;
    hintActions.hidden = perform || !activeCoachCue ||
      (hintTrace.hidden && hintFeedback.hidden && alternates.length === 0);
  }

  function applyCoachOutcome(outcome) {
    coachSessionModel = outcome.sessionModel;
    if (outcome.cue) presentCoachCue(outcome.cue);
    else clearCoachPresentation();
    renderCoachAlternates();
    persistCoachProgress();
  }

  // Feedback, tray promotion, guidance, and reset act on the coach itself, so they bypass
  // the semantic action history.
  function coachControl(action) {
    applyCoachOutcome(coachEngine.evaluate(
      { mode: projectState.ui?.mode ?? 'practice', ...action },
      coachRackState(),
      coachSessionModel
    ));
    // Choosing an idea, build-on, or guide is a request to see it; plain hints never scroll.
    if (activeCoachCue && ['promote-alternate', 'show-build-on', 'start-recipe'].includes(action.type)) {
      revealElements((activeCoachCue.targets ?? []).map(coachTargetElement), { onlyIfHidden: true });
    }
  }

  function hideCoachCue(reason = 'hide') {
    const outcome = coachEngine.evaluate(
      { type: reason === 'dismiss' ? 'dismiss-cue' : 'clear-cue', mode: 'practice' },
      coachRackState(),
      coachSessionModel
    );
    coachSessionModel = outcome.sessionModel;
    clearCoachPresentation();
    persistCoachProgress();
  }

  function recordAction(action) {
    const normalized = Object.freeze({
      ...action,
      mode: projectState.ui?.mode ?? 'practice',
      timestamp: performance.now()
    });
    if (audioRecorder.recording) audioRecorder.note(patchLogEvent(normalized));
    coachActionHistory.push(normalized);
    if (coachActionHistory.length > 64) coachActionHistory.shift();
    const outcome = coachEngine.evaluate(
      normalized,
      coachRackState(),
      coachSessionModel
    );
    // An active listening task owns the guidance surface. Keep coach progress current,
    // but only a warning may interrupt the pinned experiment.
    if (experimentIsActive() && outcome.cue?.kind !== 'warning') {
      coachSessionModel = outcome.sessionModel;
      persistCoachProgress();
      return outcome.cue;
    }
    applyCoachOutcome(outcome);
    return outcome.cue;
  }

  function showStarterHint() {
    if (projectState.patches.length !== 0) return;
    recordAction({ type: 'starter' });
  }

  function showHintForJack(endpoint) {
    const occupied = projectState.patches.some(patch => (
      endpointsMatch(patch.from, endpoint) || endpointsMatch(patch.to, endpoint)
    ));
    if (!occupied) recordAction({ type: 'jack-hover', endpoint });
  }

  function showHintForPatch(patch) {
    const fromJack = jackFor(patch.from);
    const toJack = jackFor(patch.to);
    const restored = toJack.breaksNormal
      ? `This patch breaks ${toJack.breaksNormal}.`
      : toJack.replaces
        ? `This patch replaces ${toJack.replaces}.`
        : '';
    recordAction({
      type: 'patch-created',
      patch,
      fromName: fromJack.name,
      toName: toJack.name,
      toRouting: restored,
      signalSummary: describeJack(appData.specs[patch.from.instrumentId], fromJack)
    });
  }

  function parameterDefinitions(spec) {
    return spec.panel.sections.flatMap(section => section.controls.flatMap(control => (
      Array.isArray(control.elements) ? control.elements : [control]
    )).map(control => ({ ...control, sectionId: section.id, sectionLabel: section.label })));
  }

  function definitionFor(instrumentId, parameterId) {
    return parameterDefinitions(appData.specs[instrumentId])
      .find(control => control.id === parameterId) ?? null;
  }

  function switchLabels(definition) {
    if (Array.isArray(definition.positions)) return definition.positions;
    if (Array.isArray(definition.plain?.values)) return definition.plain.values;
    return ['OFF', 'ON'];
  }

  function normalizedStep(definition) {
    if (definition.kind === 'switch') {
      return 1 / Math.max(1, switchLabels(definition).length - 1);
    }
    if (definition.kind === 'stepped' && Array.isArray(definition.plain?.range)) {
      const [minimum, maximum] = definition.plain.range;
      return 1 / Math.max(1, maximum - minimum);
    }
    return 0.001;
  }

  function interactionStep(definition) {
    return definition.kind === 'stepped' ? normalizedStep(definition) : 0.01;
  }

  function numericRange(definition) {
    const plain = definition.plain ?? {};
    for (const candidate of [
      plain.range,
      plain.manualEndpoints,
      plain.manualRange,
      plain.manufacturerReported
    ]) {
      if (Array.isArray(candidate) && candidate.length === 2 &&
        candidate.every(Number.isFinite)) return candidate;
    }
    return null;
  }

  function mappedPlainRange(definition) {
    const plain = definition.plain ?? {};
    if (plain.unit === 'bpm' && Array.isArray(plain.clockRangeHz) &&
      Number.isFinite(plain.stepsPerQuarterNote) && plain.stepsPerQuarterNote > 0) {
      return plain.clockRangeHz.map(clockHz => (
        clockHz * 60 / plain.stepsPerQuarterNote
      ));
    }
    return numericRange(definition);
  }

  function normalizedToPlainValue(definition, value) {
    const range = mappedPlainRange(definition);
    if (!range) return null;
    const [minimum, maximum] = range;
    const directedValue = definition.plain?.direction === 'clockwise-decreases'
      ? 1 - value
      : value;
    if (definition.taper === 'exp' && minimum > 0 && maximum > 0) {
      return minimum * Math.pow(maximum / minimum, directedValue);
    }
    return minimum + directedValue * (maximum - minimum);
  }

  // Inverse of normalizedToPlainValue, so a typed value lands on exactly the knob
  // position that would print it back.
  function plainToNormalizedValue(definition, plainValue) {
    const range = mappedPlainRange(definition);
    if (!range || !Number.isFinite(plainValue)) return null;
    const [minimum, maximum] = range;
    let directedValue;
    if (definition.taper === 'exp' && minimum > 0 && maximum > 0) {
      directedValue = plainValue <= 0
        ? 0
        : Math.log(plainValue / minimum) / Math.log(maximum / minimum);
    } else if (maximum === minimum) {
      directedValue = 0;
    } else {
      directedValue = (plainValue - minimum) / (maximum - minimum);
    }
    return definition.plain?.direction === 'clockwise-decreases'
      ? 1 - directedValue
      : directedValue;
  }

  // What the typed-entry field tells the user to type, matched to how the readout prints.
  function entryUnitHint(definition) {
    const unit = definition.plain?.unit;
    if (unit === 'crossfade') return 'a mix like 30:70, or one number for the B side';
    if (unit === 'divisor') return 'a divisor from 1 to 16';
    if (unit === 'ratio' || unit === 'normalized' || !mappedPlainRange(definition)) {
      return 'a percentage from 0 to 100';
    }
    if (unit === 'percent') return 'a percentage';
    if (unit === 'octaves') return 'a number of octaves';
    if (unit === 'V') return 'a voltage';
    if (unit === 'ms') return 'a time in ms (or "0.5 s")';
    if (unit === 'Hz') return 'a frequency in Hz (or "1.2 kHz")';
    if (unit === 'bpm') return 'a tempo in BPM';
    return 'a number';
  }

  // Accepts whatever the readout prints back ("440 Hz", "+2.00 oct", "30:70", "50%"),
  // plus the words that name a position the pointer cannot land on exactly.
  function parseControlEntry(definition, text) {
    // The readout prefixes uncalibrated mappings with "~"; typing the readout straight
    // back must still parse, so drop it before matching.
    const entry = String(text).trim().toLowerCase().replace(/^[~\u2248\s]+/, '');
    if (!entry) return null;
    if (entry === 'default' || entry === 'def') return definition.defaultNormalized ?? 0;
    const reversed = definition.plain?.direction === 'clockwise-decreases';
    if (entry === 'min') return reversed ? 1 : 0;
    if (entry === 'max') return reversed ? 0 : 1;
    if (entry === 'center' || entry === 'centre' || entry === 'mid') {
      return bipolarCenter(definition) ?? 0.5;
    }

    const unit = definition.plain?.unit;
    if (unit === 'crossfade') {
      const pair = entry.match(/^(-?[\d.]+)\s*[:\/]\s*(-?[\d.]+)$/);
      if (pair) {
        const left = Number(pair[1]);
        const right = Number(pair[2]);
        const total = left + right;
        if (Number.isFinite(total) && total > 0) {
          return plainToNormalizedValue(definition, right / total);
        }
      }
    }

    const numeric = entry.match(/-?\d*\.?\d+/);
    if (!numeric) return null;
    let plainValue = Number(numeric[0]);
    if (!Number.isFinite(plainValue)) return null;
    // A control with no published range prints a percentage of travel, so that is also
    // what it has to accept back.
    if (!mappedPlainRange(definition)) return plainValue / 100;
    // kHz is not a readout unit, but it is the natural way to say a filter cutoff.
    if (unit === 'Hz' && /k\s*(hz)?\s*$/.test(entry)) plainValue *= 1000;
    if (unit === 'ms' && /(^|[^m])s\s*$/.test(entry)) plainValue *= 1000;
    // These print as percentages of a 0-1 plain value, so undo that before mapping.
    if (unit === 'ratio' || unit === 'normalized' || unit === 'crossfade') plainValue /= 100;
    return plainToNormalizedValue(definition, plainValue);
  }

  function bipolarCenter(definition) {
    const range = numericRange(definition);
    if (!range || range[0] >= 0 || range[1] <= 0) return null;
    return (0 - range[0]) / (range[1] - range[0]);
  }

  function formatPlainValue(definition, plainValue) {
    const unit = definition.plain?.unit;
    if (unit === 'divisor') return `÷${Math.round(plainValue)}`;
    if (unit === 'Hz') {
      const digits = plainValue < 10 ? 2 : plainValue < 100 ? 1 : 0;
      return `${plainValue.toFixed(digits)} Hz`;
    }
    if (unit === 'bpm') {
      return `${plainValue < 100 ? plainValue.toFixed(1) : Math.round(plainValue)} BPM`;
    }
    if (unit === 'ms') {
      return `${plainValue < 10 ? plainValue.toFixed(2) : Math.round(plainValue)} ms`;
    }
    if (unit === 'V') {
      const sign = plainValue > 0 ? '+' : '';
      return `${sign}${plainValue.toFixed(2)} V`;
    }
    if (unit === 'octaves') {
      const sign = plainValue > 0 ? '+' : '';
      return `${sign}${plainValue.toFixed(2)} oct`;
    }
    if (unit === 'percent') return `${Math.round(plainValue)}%`;
    if (unit === 'ratio') return `${Math.round(plainValue * 100)}%`;
    if (unit === 'crossfade') {
      return `${Math.round((1 - plainValue) * 100)}:${Math.round(plainValue * 100)}`;
    }
    if (unit === 'normalized') return `${Math.round(plainValue * 100)}%`;
    return Number(plainValue.toFixed(3)).toString();
  }

  function displayParameterValue(definition, value) {
    if (definition.kind === 'switch') {
      const labels = switchLabels(definition);
      const index = Math.round(value * Math.max(1, labels.length - 1));
      return labels[index] ?? labels[0];
    }
    if (definition.kind === 'button') return value >= 0.5 ? 'ON' : 'OFF';
    const plainValue = normalizedToPlainValue(definition, value);
    if (plainValue !== null) {
      const approximation = definition.kind === 'continuous' &&
        definition.mapping?.status === 'measurement-needed' ? '~' : '';
      return `${approximation}${formatPlainValue(definition, plainValue)}`;
    }
    return `${Math.round(value * 100)}%`;
  }

  function subharmoniconRhythms() {
    const parameters = projectState.instruments.subharmonicon.parameters;
    return Array.from({ length: 4 }, (_, index) => {
      const parameterId = `rhythm.generator[${index}]`;
      const divisor = normalizedToPlainValue(
        definitionFor('subharmonicon', parameterId),
        parameters[parameterId]
      );
      return {
        divisor: Math.max(1, Math.min(16, Math.round(divisor))),
        seq1: parameters[`${parameterId}.assign.seq1`] >= 0.5,
        seq2: parameters[`${parameterId}.assign.seq2`] >= 0.5
      };
    });
  }

  function formatDuration(seconds) {
    if (seconds < 10) return `${seconds.toFixed(1)} seconds`;
    if (seconds < 90) return `${Math.round(seconds)} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.round(seconds - minutes * 60);
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  // Mirrors SubharmoniconTiming's egMode getter: 0 Off, 1 On, 2 Held. Sequencer steps
  // only trigger the envelopes when EG is On or Held (manual PDF p. 28), so an
  // unrouted rhythm and an Off EG explain why the default patch has no sequenced sound.
  function subharmoniconEgMode() {
    const value = projectState.instruments.subharmonicon.parameters['transport.eg'];
    return Math.round((value ?? 0) * 2);
  }

  function updateRepeatHorizon() {
    const rhythms = subharmoniconRhythms();
    const horizon = polyrhythm.repeatHorizon(rhythms);
    const egOff = subharmoniconEgMode() === 0;
    if (!horizon) {
      repeatHorizonReadout.value = 'No rhythm is routed to either Subharmonicon sequencer, so ' +
        'internal rhythms will not advance the steps. Engage SEQ 1 or SEQ 2 under a RHYTHM' +
        (egOff ? ', then press EG so steps trigger the envelopes.' : '.');
      return;
    }
    const tempoId = 'rhythm.tempo';
    const tempo = normalizedToPlainValue(
      definitionFor('subharmonicon', tempoId),
      projectState.instruments.subharmonicon.parameters[tempoId]
    );
    const duration = polyrhythm.repeatSeconds(rhythms, tempo);
    repeatHorizonReadout.value = `Structural repeat: ${horizon.ticks} master ` +
      `tick${horizon.ticks === 1 ? '' : 's'} · ≈${formatDuration(duration)} ` +
      `at ≈${Math.round(tempo)} BPM` +
      (egOff
        ? ' · EG is Off, so Subharmonicon sequencer steps do not trigger the envelopes. Press EG to enable sequenced envelopes; manual and external triggers still work.'
        : '');
  }

  function syncKnobAccessibility(knob, definition, value) {
    if (!knob) return;
    const plainValue = normalizedToPlainValue(definition, value);
    const range = mappedPlainRange(definition);
    if (plainValue !== null && range) {
      knob.setAttribute('aria-valuemin', String(range[0]));
      knob.setAttribute('aria-valuemax', String(range[1]));
      knob.setAttribute('aria-valuenow', String(Number(plainValue.toFixed(3))));
    } else {
      knob.setAttribute('aria-valuemin', '0');
      knob.setAttribute('aria-valuemax', '100');
      knob.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    }
    knob.setAttribute('aria-valuetext', displayParameterValue(definition, value));
  }

  function syncControlElement(control) {
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    const value = projectState.instruments[instrumentId].parameters[parameterId];
    if (!definition || !Number.isFinite(value)) return;

    control.dataset.active = value >= 0.5 ? 'true' : 'false';
    control.style.setProperty('--control-angle', `${-150 + value * 300}deg`);
    const knob = control.querySelector('.control__knob');
    syncKnobAccessibility(knob, definition, value);
    const action = control.querySelector('.control__action');
    if (action) action.setAttribute('aria-pressed', String(value >= 0.5));
    const readout = control.querySelector('.control__readout');
    if (readout) readout.textContent = displayParameterValue(definition, value);
  }

  function syncControlSurface() {
    for (const control of rack.querySelectorAll('.control[data-parameter-id]')) {
      syncControlElement(control);
    }
  }

  function updateSequencerIndicator(instrumentId, state) {
    if (instrumentId === 'mother32') patternEditor?.updatePlayhead(state);
    const instrument = rack.querySelector(`.instrument[data-instrument-id="${instrumentId}"]`);
    if (!instrument) return;
    for (const control of instrument.querySelectorAll('[data-sequencer-step="active"]')) {
      delete control.dataset.sequencerStep;
      control.querySelector('[role="slider"], button')?.removeAttribute('aria-current');
    }

    const output = instrument.querySelector('.instrument__sequencer-state');
    const running = Boolean(state.running);
    const precise = running && state.indicatorMode !== 'running';
    instrument.dataset.sequencerIndicator = running
      ? (precise ? 'step' : 'running')
      : 'stopped';

    const activeIds = [];
    if (precise && instrumentId === 'dfam') {
      activeIds.push(`seq.pitch[${state.currentStep}]`, `seq.velocity[${state.currentStep}]`);
    } else if (precise && instrumentId === 'mother32') {
      activeIds.push(mother32StepPadIds[state.currentStep % mother32StepPadIds.length]);
    } else if (precise && instrumentId === 'subharmonicon') {
      const steps = state.currentSteps ?? [state.currentStep, state.currentStep];
      activeIds.push(`seq.seq1.step[${steps[0]}]`, `seq.seq2.step[${steps[1]}]`);
    }

    for (const parameterId of activeIds) {
      const control = instrument.querySelector(`.control[data-parameter-id="${parameterId}"]`);
      if (!control) continue;
      control.dataset.sequencerStep = 'active';
      control.querySelector('[role="slider"], button')?.setAttribute('aria-current', 'step');
    }

    if (!running) {
      output.value = 'Sequencer stopped';
    } else if (!precise) {
      output.value = 'Running · step display suppressed';
    } else if (instrumentId === 'subharmonicon') {
      const steps = state.currentSteps ?? [state.currentStep, state.currentStep];
      output.value = `SEQ 1 · ${steps[0] + 1}   SEQ 2 · ${steps[1] + 1}`;
    } else {
      output.value = `Step ${state.currentStep + 1}`;
    }
  }

  // Generated from the DSP sources, so a control stops being flagged as soon as its
  // parameter is actually applied by the worklet.
  function engineSupports(instrumentId, parameterId) {
    return !(appData.audioRuntime[instrumentId]?.unsupportedParameterIds ?? [])
      .includes(parameterId);
  }

  const UNSUPPORTED_NOTE = 'Not implemented yet: this control is on the panel but the ' +
    'audio engine does not apply it, so moving it will not change the sound.';

  function makeControl(instrumentId, definition) {
    const control = document.createElement('div');
    control.className = `control control--${definition.kind}`;
    control.dataset.instrumentId = instrumentId;
    control.dataset.parameterId = definition.id;
    control.dataset.mappingStatus = definition.mapping?.status ??
      definition.mapping?.kind ?? definition.kind;
    const supported = engineSupports(instrumentId, definition.id);
    if (!supported) {
      control.dataset.engineSupport = 'not-implemented';
      control.classList.add('control--unimplemented');
    }
    control.title = definition.plain?.manualNotes ??
      `${appData.specs[instrumentId].name} ${definition.name}`;
    if (!supported) {
      control.title += `\n\n${UNSUPPORTED_NOTE}`;
    }
    if (definition.panelPosition) {
      control.classList.add('control--positioned');
      control.classList.add(`control--panel-${definition.panelSize ?? 'medium'}`);
      control.style.setProperty('--panel-x', `${definition.panelPosition.x * 100}%`);
      control.style.setProperty('--panel-y', `${definition.panelPosition.y * 100}%`);
    }

    const name = document.createElement('span');
    name.className = 'control__name';
    name.textContent = definition.panelLegend ?? definition.name;

    const readout = document.createElement('output');
    readout.className = 'control__readout';

    if (definition.kind === 'continuous' || definition.kind === 'stepped') {
      const knob = document.createElement('div');
      knob.className = 'control__knob';
      knob.tabIndex = 0;
      knob.setAttribute('role', 'slider');
      knob.setAttribute('aria-orientation', 'vertical');
      knob.setAttribute('aria-label', `${appData.specs[instrumentId].name} ${definition.name}`);
      if (definition.plain?.manualNotes) {
        knob.setAttribute('aria-description', definition.plain.manualNotes);
      }
      if (!supported) knob.setAttribute('aria-description', UNSUPPORTED_NOTE);

      const dial = document.createElement('span');
      dial.className = 'control__dial';
      dial.setAttribute('aria-hidden', 'true');
      knob.append(dial);
      if (bipolarCenter(definition) !== null) control.classList.add('control--bipolar');
      control.append(knob, name, readout);
    } else {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'control__action';
      action.setAttribute('aria-label', `${appData.specs[instrumentId].name} ${definition.name}`);
      if (!supported) action.setAttribute('aria-description', UNSUPPORTED_NOTE);
      action.append(name, readout);
      control.append(action);
    }

    syncControlElement(control);
    return control;
  }

  function makeControlSurface(instrumentId, spec, manifest) {
    const surface = document.createElement('div');
    surface.className = 'control-surface';
    if (spec.panel.layout) surface.classList.add('control-surface--positioned');
    surface.setAttribute('aria-label', `${spec.name} controls`);
    const manifestIds = new Set(manifest.parameters.map(parameter => parameter.id));

    for (const section of spec.panel.sections) {
      const definitions = section.controls.flatMap(control => (
        Array.isArray(control.elements) ? control.elements : [control]
      )).filter(control => manifestIds.has(control.id));
      if (!definitions.length) continue;

      const group = document.createElement('section');
      group.className = 'control-section';
      group.dataset.sectionId = section.id;
      const heading = document.createElement('h3');
      heading.textContent = section.label;
      const labelPosition = spec.panel.layout?.sectionLabels?.[section.id];
      if (labelPosition) {
        heading.style.setProperty('--section-x', `${labelPosition.x * 100}%`);
        heading.style.setProperty('--section-y', `${labelPosition.y * 100}%`);
      }
      const grid = document.createElement('div');
      grid.className = 'control-grid';
      for (const definition of definitions) {
        grid.append(makeControl(instrumentId, definition));
      }
      group.append(heading, grid);
      surface.append(group);
    }
    return surface;
  }

  function renderRack() {
    rack.replaceChildren();

    for (const instrumentId of instrumentOrder) {
      const spec = appData.specs[instrumentId];
      const manifest = appData.manifests[instrumentId];
      const panel = document.createElement('article');
      panel.className = 'instrument';
      panel.dataset.instrumentId = instrumentId;
      panel.style.setProperty('--instrument-color', colors[instrumentId]);

      const header = document.createElement('header');
      header.className = 'instrument__header';
      header.innerHTML = `
        <div>
          <p class="instrument__eyebrow">60HP · ${spec.format.widthIn} × ${spec.format.heightIn} IN</p>
          <h2>${spec.name}</h2>
          <p>${spec.longName}</p>
        </div>
        <dl class="instrument__counts">
          <div><dt>Jacks</dt><dd>${spec.patchbay.total}</dd></div>
          <div><dt>Inputs</dt><dd>${spec.patchbay.inputs}</dd></div>
          <div><dt>Outputs</dt><dd>${spec.patchbay.outputs}</dd></div>
          <div><dt>Controls</dt><dd>${manifest.parameterCount}</dd></div>
        </dl>
        <output class="instrument__sequencer-state" aria-live="off" aria-label="${spec.name} sequencer state">Sequencer stopped</output>
      `;

      const controlSurface = makeControlSurface(instrumentId, spec, manifest);
      const faceplate = document.createElement('div');
      faceplate.className = 'instrument__faceplate';
      faceplate.style.setProperty('--panel-aspect', spec.panel.layout.aspectRatio);
      const patchbay = document.createElement('div');
      patchbay.className = 'patchbay';
      patchbay.style.setProperty('--patch-cols', spec.patchbay.layout.cols);
      patchbay.style.setProperty('--patch-rows', spec.patchbay.layout.rows);
      patchbay.style.setProperty('--patch-x', `${spec.panel.layout.patchbay.x * 100}%`);
      patchbay.style.setProperty('--patch-y', `${spec.panel.layout.patchbay.y * 100}%`);
      patchbay.style.setProperty('--patch-width', `${spec.panel.layout.patchbay.width * 100}%`);
      patchbay.style.setProperty('--patch-height', `${spec.panel.layout.patchbay.height * 100}%`);
      patchbay.setAttribute('aria-label', `${spec.name} patchbay`);

      for (const jack of spec.patchbay.jacks) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `jack jack--${jack.dir}`;
        button.dataset.instrumentId = instrumentId;
        button.dataset.jackId = jack.id;
        button.dataset.direction = jack.dir;
        button.style.gridColumn = String(jack.col);
        button.style.gridRow = String(jack.row);
        button.dataset.baseLabel = describeJack(spec, jack);
        button.title = button.dataset.baseLabel;
        button.setAttribute('aria-label', button.dataset.baseLabel);
        if (jack.dir === 'out') button.setAttribute('aria-pressed', 'false');
        button.innerHTML = `
          <span class="jack__socket" aria-hidden="true"></span>
          <span class="jack__name">${jack.name}</span>
          <span class="jack__direction">${jack.dir}</span>
        `;
        patchbay.append(button);
      }

      faceplate.append(header, controlSurface, patchbay);
      panel.append(faceplate);
      if (instrumentId === 'mother32') {
        patternEditor = mother32EditorApi.create({
          getBank: () => projectState.instruments.mother32.patternBank,
          onChange: (restart, beforeBank) => {
            syncAudioPattern(restart);
            if (!applyingHistory && beforeBank) {
              clearVariationOffer();
              editHistory = historyApi.record(editHistory, {
                kind: 'pattern',
                label: restart ? 'Mother-32 pattern selection' : 'Mother-32 pattern edit',
                before: beforeBank,
                after: projectState.instruments.mother32.patternBank,
                at: performance.now()
              });
              syncHistoryControls();
              syncExperimentViewToProject();
            }
            if (audioRecorder.recording) {
              audioRecorder.note({
                type: 'pattern', instrumentId: 'mother32', restart,
                text: restart ? 'MOTHER-32 pattern selected (playback restarts at step 1)' : 'MOTHER-32 pattern edited',
                patternBank: clone(projectState.instruments.mother32.patternBank)
              });
            }
            setStatus(restart ? 'Mother-32 pattern selected; playback restarts at step 1.' :
              'Mother-32 pattern edited. Save Local or Export JSON to keep it.', 'success');
          },
          onToggle: scheduleCableDraw
        });
        panel.append(patternEditor.element);
      }
      rack.append(panel);
    }

    refreshSelection();
    scheduleCableDraw();
  }

  function createAudioAnalysisGraph(context, gains) {
    const analyzers = Object.create(null);
    const buffers = Object.create(null);
    for (const sourceId of [...liveInstrumentIds, 'mix']) {
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.72;
      analyzers[sourceId] = analyser;
      buffers[sourceId] = {
        time: new Float32Array(analyser.fftSize),
        frequency: new Float32Array(analyser.frequencyBinCount)
      };
    }

    const mixBus = context.createGain();
    mixBus.gain.value = 1;
    const meterBus = context.createGain();
    meterBus.gain.value = 1;
    const meterAnalyser = context.createAnalyser();
    meterAnalyser.fftSize = 512;
    meterAnalyser.smoothingTimeConstant = 0;
    const meterBuffer = new Float32Array(meterAnalyser.fftSize);
    for (const instrumentId of liveInstrumentIds) {
      gains[instrumentId].connect(meterBus);
    }
    meterBus.connect(meterAnalyser);
    performanceCard.dataset.meterConnected = 'true';

    return {
      context,
      gains,
      analyzers,
      buffers,
      mixBus,
      meterBus,
      meterAnalyser,
      meterBuffer,
      meterConnected: true,
      connected: false
    };
  }

  function connectAudioAnalysis() {
    const graph = audioAnalysisGraph;
    if (!graph || graph.connected) return;
    for (const instrumentId of liveInstrumentIds) {
      graph.gains[instrumentId].connect(graph.analyzers[instrumentId]);
      graph.gains[instrumentId].connect(graph.mixBus);
    }
    graph.mixBus.connect(graph.analyzers.mix);
    graph.connected = true;
    analysisCard.dataset.tapState = 'connected';
    clearAnalysisViews();
  }

  function disconnectAudioAnalysis() {
    const graph = audioAnalysisGraph;
    if (!graph || !graph.connected) return;
    for (const instrumentId of liveInstrumentIds) {
      graph.gains[instrumentId].disconnect(graph.analyzers[instrumentId]);
      graph.gains[instrumentId].disconnect(graph.mixBus);
    }
    graph.mixBus.disconnect(graph.analyzers.mix);
    graph.connected = false;
    analysisCard.dataset.tapState = 'disconnected';
    lastSpectrogramFrameMs = 0;
  }

  function syncAudioAnalysisMode() {
    if (projectState.ui?.mode === 'perform') disconnectAudioAnalysis();
    else connectAudioAnalysis();
  }

  function prepareAnalysisCanvas(canvas) {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 2 || bounds.height < 2) return null;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(2, Math.round(bounds.width * pixelRatio));
    const height = Math.max(2, Math.round(bounds.height * pixelRatio));
    const resized = canvas.width !== width || canvas.height !== height;
    if (resized) {
      canvas.width = width;
      canvas.height = height;
    }
    return { context: canvas.getContext('2d'), width, height, pixelRatio, resized };
  }

  function clearAnalysisViews() {
    for (const canvas of [scopeCanvas, spectrumCanvas, spectrogramCanvas]) {
      const prepared = prepareAnalysisCanvas(canvas);
      if (!prepared) continue;
      prepared.context.fillStyle = '#0d1010';
      prepared.context.fillRect(0, 0, prepared.width, prepared.height);
    }
    spectrumPeakDb = null;
    spectrumPeakUntilMs = null;
    spectrogramColumnRemainder = 0;
    lastSpectrogramFrameMs = 0;
  }

  function findTriggerOffset(buffer) {
    for (let index = 1; index < buffer.length - 1; index += 1) {
      if (buffer[index - 1] <= 0 && buffer[index] > 0) return index;
    }
    return 0;
  }

  function sourceOutputGain(sourceId) {
    if (sourceId === 'mix') return 0.1;
    return appData.audioRuntime[sourceId]?.browserOutputGain ?? 0.1;
  }

  function drawScope(buffer, sourceId) {
    const prepared = prepareAnalysisCanvas(scopeCanvas);
    if (!prepared) return;
    const { context, width, height, pixelRatio } = prepared;
    context.fillStyle = '#0d1010';
    context.fillRect(0, 0, width, height);

    const voltsPerFloat = 1 / sourceOutputGain(sourceId);
    const voltageToY = voltage => height / 2 - (voltage / 10) * (height * 0.46);
    context.lineWidth = pixelRatio;
    for (const voltage of [-5, -1, 0, 1, 5]) {
      context.beginPath();
      context.strokeStyle = voltage === 0 ? '#62665f' : '#303633';
      context.moveTo(0, voltageToY(voltage));
      context.lineTo(width, voltageToY(voltage));
      context.stroke();
    }
    for (let division = 1; division < 8; division += 1) {
      const x = width * division / 8;
      context.beginPath();
      context.strokeStyle = '#222825';
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    const triggerOffset = findTriggerOffset(buffer);
    const sampleWindow = Math.min(2048, buffer.length);
    context.beginPath();
    context.strokeStyle = '#76d5dc';
    context.lineWidth = Math.max(1.25 * pixelRatio, 1);
    for (let x = 0; x < width; x += 1) {
      const sampleIndex = (triggerOffset + Math.floor(x / Math.max(1, width - 1) *
        (sampleWindow - 1))) % buffer.length;
      const y = voltageToY(buffer[sampleIndex] * voltsPerFloat);
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    context.fillStyle = '#777f78';
    context.font = `${9 * pixelRatio}px ui-monospace, monospace`;
    context.fillText('+5V', 4 * pixelRatio, voltageToY(5) - 3 * pixelRatio);
    context.fillText('-5V', 4 * pixelRatio, voltageToY(-5) - 3 * pixelRatio);
  }

  function frequencyForColumn(column, width) {
    return 20 * Math.pow(1000, column / Math.max(1, width - 1));
  }

  function dbForFrequency(buffer, frequency, sampleRate) {
    const nyquist = sampleRate / 2;
    const index = Math.max(0, Math.min(
      buffer.length - 1,
      Math.round(frequency / nyquist * buffer.length)
    ));
    return buffer[index];
  }

  function drawSpectrum(buffer, sampleRate, timestamp) {
    const prepared = prepareAnalysisCanvas(spectrumCanvas);
    if (!prepared) return { peakDb: -100, peakHz: 0 };
    const { context, width, height, pixelRatio, resized } = prepared;
    context.fillStyle = '#0d1010';
    context.fillRect(0, 0, width, height);

    if (resized || !spectrumPeakDb || spectrumPeakDb.length !== width) {
      spectrumPeakDb = new Float32Array(width).fill(-100);
      spectrumPeakUntilMs = new Float64Array(width);
    }

    const dbToY = value => height - ((Math.max(-100, Math.min(-10, value)) + 100) / 90) *
      (height - 12 * pixelRatio);
    for (const db of [-80, -60, -40, -20]) {
      const y = dbToY(db);
      context.beginPath();
      context.strokeStyle = '#29302c';
      context.lineWidth = pixelRatio;
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    for (const frequency of [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]) {
      const x = Math.log(frequency / 20) / Math.log(1000) * width;
      context.beginPath();
      context.strokeStyle = frequency === 1000 ? '#424943' : '#252b28';
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    let peakDb = -Infinity;
    let peakHz = 0;
    context.beginPath();
    context.strokeStyle = '#e2b34e';
    context.lineWidth = Math.max(1.3 * pixelRatio, 1);
    for (let x = 0; x < width; x += 1) {
      const frequency = frequencyForColumn(x, width);
      const db = dbForFrequency(buffer, frequency, sampleRate);
      if (db > peakDb) {
        peakDb = db;
        peakHz = frequency;
      }
      if (db >= spectrumPeakDb[x]) {
        spectrumPeakDb[x] = db;
        spectrumPeakUntilMs[x] = timestamp + 200;
      } else if (timestamp > spectrumPeakUntilMs[x]) {
        spectrumPeakDb[x] = Math.max(db, spectrumPeakDb[x] - 1.8);
      }
      const y = dbToY(db);
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    context.beginPath();
    context.strokeStyle = '#f4efe5';
    context.lineWidth = pixelRatio;
    for (let x = 0; x < width; x += 1) {
      const y = dbToY(spectrumPeakDb[x]);
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    return { peakDb, peakHz };
  }

  function viridisApproximation(value) {
    const clamp = number => Math.min(1, Math.max(0, number));
    return [
      Math.round(255 * clamp(-0.35 + 2.1 * value - 0.85 * value * value)),
      Math.round(255 * clamp(0.06 + 1.25 * value - 0.42 * value * value)),
      Math.round(255 * clamp(0.30 + 1.05 * value - 1.35 * value * value))
    ];
  }

  function drawSpectrogram(buffer, sampleRate, timestamp) {
    const prepared = prepareAnalysisCanvas(spectrogramCanvas);
    if (!prepared) return;
    const { context, width, height, resized } = prepared;
    if (resized) {
      context.fillStyle = '#0d1010';
      context.fillRect(0, 0, width, height);
      spectrogramColumnRemainder = 0;
      lastSpectrogramFrameMs = timestamp;
    }

    const elapsed = Math.max(0, timestamp - (lastSpectrogramFrameMs || timestamp));
    lastSpectrogramFrameMs = timestamp;
    spectrogramColumnRemainder += elapsed * width / 10000;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const columns = reducedMotion
      ? 1
      : Math.min(width, Math.max(1, Math.floor(spectrogramColumnRemainder)));
    if (reducedMotion) spectrogramColumnRemainder = 0;
    else spectrogramColumnRemainder -= Math.floor(spectrogramColumnRemainder);
    if (!reducedMotion) context.drawImage(spectrogramCanvas, -columns, 0);

    const image = context.createImageData(columns, height);
    for (let y = 0; y < height; y += 1) {
      const frequency = frequencyForColumn(height - 1 - y, height);
      const db = dbForFrequency(buffer, frequency, sampleRate);
      const value = Math.max(0, Math.min(1, (db + 100) / 80));
      const [red, green, blue] = viridisApproximation(value);
      for (let x = 0; x < columns; x += 1) {
        const offset = (y * columns + x) * 4;
        image.data[offset] = red;
        image.data[offset + 1] = green;
        image.data[offset + 2] = blue;
        image.data[offset + 3] = 255;
      }
    }
    context.putImageData(image, width - columns, 0);
  }

  function noteNameForFrequency(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) return '—';
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return `${names[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`;
  }

  function setPerformanceMeterIdle(label = 'Audio idle') {
    performanceCard.dataset.meterState = 'idle';
    performanceMeterFill.style.width = '0%';
    performanceMeterReadout.value = label;
    lastMeterFrameMs = 0;
    meterClipUntilMs = 0;
  }

  function renderPerformanceMeter(timestamp) {
    const graph = audioAnalysisGraph;
    if (!graph?.meterConnected || audioContext?.state !== 'running' ||
      timestamp - lastMeterFrameMs < 50) return;
    lastMeterFrameMs = timestamp;
    graph.meterAnalyser.getFloatTimeDomainData(graph.meterBuffer);
    let samplePeak = 0;
    for (const sample of graph.meterBuffer) samplePeak = Math.max(samplePeak, Math.abs(sample));
    if (samplePeak >= 0.98) meterClipUntilMs = timestamp + 2000;
    const clipAfterglow = timestamp < meterClipUntilMs;
    const volts = samplePeak / sourceOutputGain('mix');
    performanceCard.dataset.meterState = clipAfterglow ? 'clip' : 'running';
    performanceMeterFill.style.width = `${Math.min(100, samplePeak * 100).toFixed(1)}%`;
    performanceMeterReadout.value = `Rack · ${volts.toFixed(2)} V sample peak${
      clipAfterglow ? ' · CLIP RISK' : ''
    }`;
  }

  function renderAnalysisFrame(timestamp) {
    requestAnimationFrame(renderAnalysisFrame);
    for (const [token, active] of activeKeyboardPads) {
      if (active.releaseAt !== undefined && audioContext?.currentTime >= active.releaseAt) {
        releaseKeyboardPad(token);
      }
    }
    renderPerformanceMeter(timestamp);
    if (projectState.ui?.mode !== 'practice' || !audioAnalysisGraph?.connected ||
      audioContext?.state !== 'running' || timestamp - lastAnalysisFrameMs < 50) return;
    lastAnalysisFrameMs = timestamp;

    const analyser = audioAnalysisGraph.analyzers[selectedAnalysisSource];
    const buffers = audioAnalysisGraph.buffers[selectedAnalysisSource];
    analyser.getFloatTimeDomainData(buffers.time);
    analyser.getFloatFrequencyData(buffers.frequency);
    drawScope(buffers.time, selectedAnalysisSource);
    const spectrum = drawSpectrum(buffers.frequency, audioContext.sampleRate, timestamp);
    drawSpectrogram(buffers.frequency, audioContext.sampleRate, timestamp);

    const sourceName = selectedAnalysisSource === 'mix'
      ? 'Rack mix'
      : appData.specs[selectedAnalysisSource].name;
    const voltsPerFloat = 1 / sourceOutputGain(selectedAnalysisSource);
    let sumSquares = 0;
    let truePeak = 0;
    for (const sample of buffers.time) {
      sumSquares += sample * sample;
      truePeak = Math.max(truePeak, Math.abs(sample));
    }
    const rmsVolts = Math.sqrt(sumSquares / buffers.time.length) * voltsPerFloat;
    const peakLabel = selectedAnalysisSource === 'subharmonicon'
      ? `${noteNameForFrequency(spectrum.peakHz)} · ${Math.round(spectrum.peakHz)} Hz`
      : `${Math.round(spectrum.peakHz)} Hz`;
    analysisReadout.value = `${sourceName} · ${rmsVolts.toFixed(2)} Vrms · ` +
      `${(truePeak * voltsPerFloat).toFixed(2)} V peak · strongest ${peakLabel}`;
  }

  const patchGrades = ['suggested', 'natural', 'creative', 'occupied', 'connected', 'unusable'];

  function refreshSelection() {
    const source = selectedOutput ?? selectedInput;
    const partnerDirection = selectedOutput ? 'in' : selectedInput ? 'out' : null;
    const preview = selectedOutput ? previewInput : previewOutput;
    // Grade every possible partner against the current patch (docs/design/10).
    targetGrades = source
      ? new Map(coachEngine.gradeTargets(source, coachRackState(), coachSessionModel)
        .map(entry => [endpointKey(entry.endpoint), entry]))
      : new Map();
    for (const jack of rack.querySelectorAll('.jack')) {
      const endpoint = { instrumentId: jack.dataset.instrumentId, jackId: jack.dataset.jackId };
      const isSelected = Boolean(source && endpointsMatch(source, endpoint));
      const isCandidate = Boolean(partnerDirection && jack.dataset.direction === partnerDirection);
      const grade = isCandidate ? targetGrades.get(endpointKey(endpoint)) : null;
      const isPreview = Boolean(preview && endpointsMatch(preview, endpoint));
      jack.classList.toggle('jack--selected', isSelected);
      jack.classList.toggle('jack--source-selected', Boolean(isSelected && selectedOutput));
      jack.classList.toggle('jack--destination-selected', Boolean(isSelected && selectedInput));
      jack.classList.toggle('jack--compatible-target', isCandidate);
      jack.classList.toggle('jack--preview-target', isPreview);
      jack.classList.toggle('jack--preview-source', Boolean(isPreview && selectedInput));
      jack.classList.toggle('jack--not-target', Boolean(source && !isSelected && !isCandidate));
      for (const name of patchGrades) jack.classList.toggle(`jack--grade-${name}`, grade?.grade === name);
      if (grade) jack.dataset.patchGrade = grade.grade;
      else delete jack.dataset.patchGrade;
      jack.setAttribute('aria-pressed', String(isSelected));
      if (isCandidate) {
        const connection = selectedOutput
          ? `Connect ${endpointLabel(selectedOutput)} to ${jack.dataset.baseLabel}`
          : `Connect ${jack.dataset.baseLabel} to ${endpointLabel(selectedInput)}`;
        jack.setAttribute('aria-label', grade?.summary ? `${connection}. ${grade.summary}` : connection);
      } else {
        jack.setAttribute('aria-label', jack.dataset.baseLabel);
      }
    }
    renderPatchSuggestions(source);
    const suggestedCount = [...targetGrades.values()].filter(entry => entry.grade === 'suggested').length;
    const fits = suggestedCount ? ` ${suggestedCount} fit${suggestedCount === 1 ? 's' : ''} your patch.` : '';
    patchAssistLegend.hidden = !source;
    if (!source) {
      patchAssist.hidden = true;
      patchAssistText.textContent = 'Choose a highlighted input.';
    } else if (preview) {
      const from = selectedOutput ?? previewOutput;
      const to = selectedOutput ? previewInput : selectedInput;
      const reasons = targetGrades.get(endpointKey(preview))?.reasons ?? [];
      patchAssist.hidden = false;
      patchAssistText.textContent = `Connect ${endpointLabel(from)} → ${endpointLabel(to)}.` +
        `${reasons.length ? ` ${reasons.join(' ')}` : ''} Click to complete; Escape cancels.`;
    } else if (selectedOutput) {
      patchAssist.hidden = false;
      patchAssistText.textContent = `${endpointLabel(selectedOutput)} is the source. Choose a glowing input; Escape cancels.${fits}`;
    } else {
      const occupants = projectState.patches.filter(patch => endpointsMatch(patch.to, selectedInput));
      const note = occupants.length
        ? ` It already receives ${occupants.map(patch => endpointLabel(patch.from)).join(', ')}; another source needs a mixer.`
        : '';
      patchAssist.hidden = false;
      patchAssistText.textContent = `${endpointLabel(selectedInput)} is the destination.${note} Choose a glowing output; Escape cancels.${fits}`;
    }
  }

  function updateSummary() {
    const mode = projectState.ui?.mode ?? 'practice';
    stateSummary.innerHTML = `
      <span><strong>${projectState.patches.length}</strong> cables</span>
      <span><strong>${allParametersCount()}</strong> parameters</span>
      <span><strong>${appData.calibrationManifest.slotCount}</strong> calibration slots</span>
      <span><strong>${mode}</strong> mode</span>
      <span><strong>${location.protocol.replace(':', '') || 'local'}</strong> runtime</span>
    `;
    document.body.dataset.mode = mode;
    document.querySelector('#modeBtn').textContent = mode === 'practice'
      ? 'Switch to Perform'
      : 'Switch to Practice';
    if (mode === 'perform' && activeCoachCue?.kind !== 'warning') hintCard.hidden = true;
    else if (activeCoachCue) hintCard.hidden = false;
    updateRepeatHorizon();
    syncAudioAnalysisMode();
  }

  function jackElement(endpoint) {
    return rack.querySelector(
      `.jack[data-instrument-id="${endpoint.instrumentId}"][data-jack-id="${endpoint.jackId}"]`
    );
  }

  function jackSocketElement(endpoint) {
    return jackElement(endpoint)?.querySelector('.jack__socket') ?? null;
  }

  function cableAnchor(endpoint, layerBounds) {
    const socket = jackSocketElement(endpoint);
    if (!socket) return null;
    const bounds = socket.getBoundingClientRect();
    return {
      x: bounds.left + bounds.width / 2 - layerBounds.left,
      y: bounds.top + bounds.height / 2 - layerBounds.top
    };
  }

  function cableCurve(from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const slack = Math.min(210, Math.max(42, distance * 0.14));
    const sagY = Math.max(from.y, to.y) + slack;
    return `M ${from.x} ${from.y} C ${from.x} ${sagY}, ${to.x} ${sagY}, ${to.x} ${to.y}`;
  }

  function scheduleCableDraw() {
    if (cableDrawFrame) return;
    cableDrawFrame = requestAnimationFrame(() => {
      cableDrawFrame = 0;
      fitJackNames();
      drawCables();
    });
  }

  // Panel legends keep their hardware wording, so a legend wider than its cell is
  // drawn smaller rather than clipped. The ellipsis remains only below the floor.
  function fitJackNames() {
    const width = rack.getBoundingClientRect().width;
    if (width === jackNameFitWidth) return;
    jackNameFitWidth = width;
    const names = [...rack.querySelectorAll('.jack__name')];
    for (const name of names) name.style.removeProperty('--jack-name-fit');
    const fits = names.map(name => {
      if (name.scrollWidth <= name.clientWidth) return 1;
      const padding = parseFloat(getComputedStyle(name).paddingLeft) * 2;
      const ratio = (name.clientWidth - padding) / (name.scrollWidth - padding);
      return Math.max(0.7, Math.floor(ratio * 0.98 * 1000) / 1000);
    });
    names.forEach((name, index) => {
      if (fits[index] < 1) name.style.setProperty('--jack-name-fit', String(fits[index]));
    });
  }

  // ─── Finding suggested targets anywhere on the rack ───────────────────────────────
  const prefersReducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const locatorArrows = { up: '↑', down: '↓', left: '←', right: '→' };

  // The part of the window where rack content is actually visible: below the sticky
  // header and above the narrow-layout hint sheet.
  function visibleViewport() {
    const headerBottom = getComputedStyle(appHeader).position === 'sticky'
      ? Math.max(0, appHeader.getBoundingClientRect().bottom)
      : 0;
    const dockCovers = getComputedStyle(hintDock).position === 'fixed' && !hintCard.hidden;
    const dockTop = dockCovers ? hintDock.getBoundingClientRect().top : window.innerHeight;
    return { top: headerBottom, bottom: Math.min(window.innerHeight, dockTop), left: 0, right: window.innerWidth };
  }

  const rectVisible = (rect, view) => rect.bottom > view.top + 4 && rect.top < view.bottom - 4 &&
    rect.right > view.left + 4 && rect.left < view.right - 4;

  function pulseElements(elements) {
    for (const element of elements) {
      element.classList.remove('is-located');
      void element.offsetWidth;
      element.classList.add('is-located');
    }
  }

  // Scroll so every target fits when possible; otherwise bring the first into view and let
  // the edge locators point at the rest.
  function revealElements(elements, { onlyIfHidden = false } = {}) {
    const targets = elements.filter(Boolean);
    if (!targets.length) return;
    const view = visibleViewport();
    const rects = targets.map(element => element.getBoundingClientRect());
    if (!onlyIfHidden || !rects.every(rect => rectVisible(rect, view))) {
      const top = Math.min(...rects.map(rect => rect.top));
      const bottom = Math.max(...rects.map(rect => rect.bottom));
      const deltaY = bottom - top <= view.bottom - view.top - 48
        ? (top + bottom) / 2 - (view.top + view.bottom) / 2
        : rects[0].top - view.top - 24;
      const first = rects[0];
      const deltaX = first.left < view.left ? first.left - view.left - 24
        : first.right > view.right ? first.right - view.right + 24 : 0;
      window.scrollBy({ top: deltaY, left: deltaX, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    pulseElements(targets);
  }

  function targetLabel(target) {
    if (target.kind === 'jack') return endpointLabel({ instrumentId: target.instrumentId, jackId: target.targetId });
    const definition = definitionFor(target.instrumentId, target.targetId);
    return `${appData.specs[target.instrumentId]?.name ?? target.instrumentId} ${definition?.name ?? target.targetId}`;
  }

  // The cable the active hint recommends, drawn as a dotted ghost across the rack.
  function ghostCableForCue() {
    if (!activeCoachCue || hintCard.hidden) return null;
    const jacks = (activeCoachCue.targets ?? []).filter(target => target.kind === 'jack')
      .map(target => ({ instrumentId: target.instrumentId, jackId: target.targetId }));
    const from = jacks.find(endpoint => jackFor(endpoint)?.dir === 'out');
    const to = jacks.find(endpoint => jackFor(endpoint)?.dir === 'in');
    if (!from || !to) return null;
    const patched = projectState.patches.some(patch => endpointsMatch(patch.from, from) && endpointsMatch(patch.to, to));
    return patched ? null : { from, to };
  }

  function updateTargetLocators() {
    const view = visibleViewport();
    const directionOf = rect => rect.bottom <= view.top + 4 ? 'up'
      : rect.top >= view.bottom - 4 ? 'down'
        : rect.right <= view.left + 4 ? 'left'
          : rect.left >= view.right - 4 ? 'right' : null;
    const entries = [];
    if (activeCoachCue && !hintCard.hidden) {
      for (const target of activeCoachCue.targets ?? []) {
        const element = coachTargetElement(target);
        const rect = element?.getBoundingClientRect();
        const direction = rect && directionOf(rect);
        if (direction) entries.push({ direction, rect, elements: [element], text: targetLabel(target), kind: 'hint' });
      }
    }
    if (selectedOutput || selectedInput) {
      const groups = {};
      for (const grade of targetGrades.values()) {
        if (grade.grade !== 'suggested') continue;
        const element = jackElement(grade.endpoint);
        const rect = element?.getBoundingClientRect();
        const direction = rect && directionOf(rect);
        if (direction) (groups[direction] ??= []).push({ element, rect, endpoint: grade.endpoint });
      }
      for (const [direction, items] of Object.entries(groups)) {
        items.sort((a, b) => direction === 'up' ? b.rect.bottom - a.rect.bottom : a.rect.top - b.rect.top);
        const instruments = [...new Set(items.map(item => appData.specs[item.endpoint.instrumentId].name))].join(', ');
        entries.push({
          direction,
          rect: items[0].rect,
          elements: [items[0].element],
          text: items.length === 1
            ? endpointLabel(items[0].endpoint)
            : `${items.length} fitting ${selectedOutput ? 'inputs' : 'outputs'} on ${instruments}`,
          kind: 'selection'
        });
      }
    }
    const shown = entries.slice(0, 6);
    const signature = shown.map(entry => `${entry.kind}:${entry.direction}:${entry.text}:${Math.round(view.top)}:${Math.round(view.bottom)}`).join('|');
    locatorEntries = shown;
    if (signature === locatorSignature) return;
    locatorSignature = signature;
    // One wrapping row per edge, centred over the visible rack, so chips never overlap.
    const rackBounds = rackShell.getBoundingClientRect();
    const centreX = Math.min(view.right - 16, Math.max(view.left + 16,
      (Math.max(rackBounds.left, view.left) + Math.min(rackBounds.right, view.right)) / 2));
    const rows = {};
    shown.forEach((entry, index) => {
      if (!rows[entry.direction]) {
        const row = document.createElement('div');
        row.className = `target-locator-row target-locator-row--${entry.direction}`;
        if (entry.direction === 'up') {
          row.style.top = `${view.top + 10}px`;
          row.style.left = `${centreX}px`;
        } else if (entry.direction === 'down') {
          row.style.bottom = `${window.innerHeight - view.bottom + 10}px`;
          row.style.left = `${centreX}px`;
        } else {
          row.style.top = `${(view.top + view.bottom) / 2}px`;
          row.style[entry.direction] = '10px';
        }
        rows[entry.direction] = row;
      }
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `target-locator target-locator--${entry.direction} target-locator--${entry.kind}`;
      chip.dataset.locator = String(index);
      chip.textContent = `${locatorArrows[entry.direction]} ${entry.text}`;
      chip.setAttribute('aria-label', `Scroll to ${entry.text}`);
      rows[entry.direction].append(chip);
    });
    targetLocator.replaceChildren(...Object.values(rows));
  }

  function renderPatchSuggestions(source) {
    const suggested = source
      ? [...targetGrades.values()].filter(entry => entry.grade === 'suggested').slice(0, 5)
      : [];
    const key = source ? `${endpointKey(source)}|${suggested.map(entry => endpointKey(entry.endpoint)).join(',')}` : '';
    patchAssistSuggestions.hidden = !suggested.length;
    // Rebuild only when the list changes, so a focused button survives hover previews.
    if (key === patchSuggestionsKey) return;
    patchSuggestionsKey = key;
    patchAssistSuggestions.replaceChildren(...suggested.map(entry => {
      const item = document.createElement('li');
      const show = document.createElement('button');
      show.type = 'button';
      show.className = 'patch-suggestion';
      show.dataset.action = 'show';
      show.dataset.endpoint = endpointKey(entry.endpoint);
      const name = document.createElement('strong');
      name.textContent = endpointLabel(entry.endpoint);
      const why = document.createElement('span');
      why.textContent = entry.summary;
      show.append(name, why);
      const connect = document.createElement('button');
      connect.type = 'button';
      connect.className = 'patch-suggestion__connect';
      connect.dataset.action = 'connect';
      connect.dataset.endpoint = endpointKey(entry.endpoint);
      connect.textContent = 'Connect';
      connect.setAttribute('aria-label', `Connect ${endpointLabel(entry.endpoint)}`);
      item.append(show, connect);
      return item;
    }));
  }

  function drawCables() {
    const bounds = rackShell.getBoundingClientRect();
    cableLayer.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    cableLayer.replaceChildren();
    wiringView?.draw(cableLayer, bounds, projectState);

    // Jacks win over cables. Every jack is cut out of the cables' hit area, so a patched
    // socket can still be hovered, armed for another cable, or chosen as a destination;
    // a cable is removed by clicking along its run.
    const hitClipId = 'cable-hit-clip';
    if (projectState.patches.length) {
      let clipPathData = `M 0 0 H ${bounds.width} V ${bounds.height} H 0 Z`;
      for (const jack of rack.querySelectorAll('.jack')) {
        const box = jack.getBoundingClientRect();
        clipPathData += ` M ${box.left - bounds.left} ${box.top - bounds.top}` +
          ` h ${box.width} v ${box.height} h ${-box.width} Z`;
      }
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.id = hitClipId;
      const clipShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      clipShape.setAttribute('d', clipPathData);
      clipShape.setAttribute('clip-rule', 'evenodd');
      clip.append(clipShape);
      defs.append(clip);
      cableLayer.append(defs);
    }

    for (const patch of projectState.patches) {
      const from = cableAnchor(patch.from, bounds);
      const to = cableAnchor(patch.to, bounds);
      if (!from || !to) continue;
      const d = cableCurve(from, to);
      const color = cableColors[patch.colorIndex % cableColors.length];

      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      shadow.setAttribute('d', d);
      shadow.setAttribute('class', 'cable cable--shadow');

      const visible = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      visible.setAttribute('d', d);
      visible.setAttribute('class', 'cable cable--visible');
      visible.setAttribute('stroke', color);

      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'cable cable--hit');
      hit.dataset.patchId = patch.id;
      hit.setAttribute('clip-path', `url(#${hitClipId})`);

      const fromPlug = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      fromPlug.setAttribute('class', 'cable--plug');
      fromPlug.setAttribute('cx', from.x);
      fromPlug.setAttribute('cy', from.y);
      fromPlug.setAttribute('r', '5');
      fromPlug.setAttribute('fill', color);

      const toPlug = fromPlug.cloneNode();
      toPlug.setAttribute('cx', to.x);
      toPlug.setAttribute('cy', to.y);

      cableLayer.append(shadow, hit, visible, fromPlug, toPlug);
    }

    const ghost = ghostCableForCue();
    const ghostFrom = ghost && cableAnchor(ghost.from, bounds);
    const ghostTo = ghost && cableAnchor(ghost.to, bounds);
    if (ghostFrom && ghostTo) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'cable cable--ghost');
      path.setAttribute('d', cableCurve(ghostFrom, ghostTo));
      path.dataset.from = endpointKey(ghost.from);
      path.dataset.to = endpointKey(ghost.to);
      cableLayer.append(path);
    }

    const previewCable = selectedOutput && previewInput
      ? { from: selectedOutput, to: previewInput }
      : selectedInput && previewOutput ? { from: previewOutput, to: selectedInput } : null;
    if (previewCable) {
      const from = cableAnchor(previewCable.from, bounds);
      const to = cableAnchor(previewCable.to, bounds);
      if (from && to) {
        const preview = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        preview.setAttribute('class', 'cable cable--preview');
        preview.setAttribute('d', cableCurve(from, to));
        preview.dataset.from = endpointKey(previewCable.from);
        preview.dataset.to = endpointKey(previewCable.to);
        cableLayer.append(preview);
      }
    }
    updateTargetLocators();
  }

  function makePatchId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    patchIdCounter += 1;
    return `patch-${Date.now()}-${patchIdCounter}`;
  }

  function addPatch(from, to) {
    const duplicate = projectState.patches.some(patch => (
      endpointKey(patch.from) === endpointKey(from) &&
      endpointKey(patch.to) === endpointKey(to)
    ));
    if (duplicate) {
      setStatus('That cable is already connected.', 'warning');
      return;
    }

    const patch = {
      id: makePatchId(),
      from,
      to,
      colorIndex: projectState.patches.length % cableColors.length
    };
    const cablesBefore = projectState.patches.map(entry => ({ ...entry }));
    projectState.patches.push(patch);
    recordCableChange('the new cable', cablesBefore);
    setStatus(`Patched ${endpointKey(from)} → ${endpointKey(to)}.`, 'success');
    updateSummary();
    drawCables();
    syncAudioPatches();
    showHintForPatch(patch);
  }

  function clearPatchSelectionState() {
    selectedOutput = null;
    previewInput = null;
    selectedInput = null;
    previewOutput = null;
  }

  function cancelPatchSelection(announce = true) {
    if (!selectedOutput && !selectedInput) return;
    clearPatchSelectionState();
    refreshSelection();
    scheduleCableDraw();
    if (announce) setStatus('Cable selection cancelled.', 'normal');
  }

  function setParameterValue(control, rawValue) {
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    if (!definition) return;

    let value = Math.max(0, Math.min(1, rawValue));
    const step = normalizedStep(definition);
    if (definition.kind === 'switch' || definition.kind === 'stepped') {
      value = Math.max(0, Math.min(1, Math.round(value / step) * step));
    } else if (definition.kind === 'button') {
      value = value >= 0.5 ? 1 : 0;
    }
    projectState.instruments[instrumentId].parameters[parameterId] = value;
    syncControlElement(control);
    // The readout reports both reasons a routed sequencer can stay silent, so the EG
    // switch has to refresh it too, not just the rhythm assignments.
    if (instrumentId === 'subharmonicon' &&
      (parameterId.startsWith('rhythm.') || parameterId === 'transport.eg')) {
      updateRepeatHorizon();
    }
    scheduleAudioParameter(instrumentId, parameterId, value);
  }

  function recordControlChange(control, before, gesture, startContextTime = null) {
    const instrumentId = control.dataset.instrumentId;
    const targetId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, targetId);
    const after = projectState.instruments[instrumentId].parameters[targetId];
    if (!definition || before === after) return;
    recordAction({
      type: 'control-change',
      instrumentId,
      targetId,
      targetName: definition.name,
      sectionId: definition.sectionId,
      sectionLabel: definition.sectionLabel,
      before,
      after,
      displayValue: displayParameterValue(definition, after),
      gesture,
      gestureStartContextTime: startContextTime
    });
    // Every parameter write in the app reaches setParameterValue, and every deliberate
    // one is reported here, so this is the only hook undo needs for controls.
    if (applyingHistory) return;
    clearVariationOffer();
    editHistory = historyApi.record(editHistory, {
      kind: 'parameter',
      instrumentId,
      parameterId: targetId,
      label: `${appData.specs[instrumentId].name} ${definition.name}`,
      before,
      after,
      gesture,
      at: performance.now()
    });
    syncHistoryControls();
    if (!observeExperimentTarget(instrumentId, targetId, after)) {
      syncExperimentViewToProject();
    }
  }

  // Restores the cable list wholesale, which covers add, remove, and clear alike.
  function applyPatchList(patches) {
    projectState.patches = patches.map(patch => ({ ...patch }));
    clearPatchSelectionState();
    refreshSelection();
    updateSummary();
    drawCables();
    syncAudioPatches();
    syncExperimentViewToProject();
  }

  function recordCableChange(label, before) {
    if (applyingHistory) return;
    clearVariationOffer();
    editHistory = historyApi.record(editHistory, {
      kind: 'cables', label, before, after: projectState.patches, at: performance.now()
    });
    syncHistoryControls();
    syncExperimentViewToProject();
  }

  function syncHistoryControls() {
    const undoLabel = historyApi.describe(editHistory, 'undo');
    const redoLabel = historyApi.describe(editHistory, 'redo');
    undoButton.disabled = !undoLabel;
    redoButton.disabled = !redoLabel;
    undoButton.title = undoLabel ? `Undo ${undoLabel}` : 'Nothing to undo';
    redoButton.title = redoLabel ? `Redo ${redoLabel}` : 'Nothing to redo';
    undoButton.setAttribute('aria-label', undoButton.title);
    redoButton.setAttribute('aria-label', redoButton.title);
  }

  // Writes a value to a control by id, through the panel when the control is on screen
  // so its readout and audio follow, and straight into the project when it is not.
  function writeParameterById(instrumentId, parameterId, value) {
    const control = rack.querySelector(
      `.control[data-instrument-id="${instrumentId}"][data-parameter-id="${
        CSS.escape ? CSS.escape(parameterId) : parameterId}"]`
    );
    if (control) setParameterValue(control, value);
    else {
      projectState.instruments[instrumentId].parameters[parameterId] = value;
      scheduleAudioParameter(instrumentId, parameterId, value);
    }
  }

  function applyHistoryEntry(entry, direction) {
    applyingHistory = true;
    try {
      if (entry.kind === 'parameter') {
        writeParameterById(entry.instrumentId, entry.parameterId,
          direction === 'undo' ? entry.before : entry.after);
      } else if (entry.kind === 'settings') {
        for (const value of entry.values) {
          writeParameterById(value.instrumentId, value.parameterId,
            direction === 'undo' ? value.before : value.after);
        }
      } else if (entry.kind === 'project') {
        applyState(clone(direction === 'undo' ? entry.before : entry.after),
          direction === 'undo'
            ? `Restored the project from before ${entry.label}.`
            : `Reapplied ${entry.label}.`,
          { clearHistory: false });
      } else if (entry.kind === 'pattern') {
        projectState.instruments.mother32.patternBank = mother32Patterns.normalizeBank(
          clone(direction === 'undo' ? entry.before : entry.after));
        patternRestartPending = true;
        patternEditor.refresh();
        syncAudioPattern(true);
      } else {
        applyPatchList(direction === 'undo' ? entry.before : entry.after);
      }
    } finally {
      applyingHistory = false;
    }
  }

  function syncCheckpointControls() {
    returnButton.disabled = !keptCheckpoint;
    returnButton.title = keptCheckpoint
      ? 'Return to the session checkpoint; Undo restores the settings you leave'
      : 'Keep a sound first';
  }

  function keepCheckpoint() {
    if (activeKnobDrag) {
      setStatus('Release the knob before keeping this sound.', 'warning');
      return;
    }
    keptCheckpoint = clone(stateForSave());
    syncCheckpointControls();
    setStatus('Kept this sound for the current session. Return restores these settings.', 'success');
    recordAction({
      type: 'project', title: 'Checkpoint kept',
      message: 'Kept the current controls, cables, and Mother-32 patterns for this session.'
    });
  }

  function returnToCheckpoint() {
    if (!keptCheckpoint) return;
    if (activeKnobDrag) {
      setStatus('Release the knob before returning to the kept sound.', 'warning');
      return;
    }
    const before = stateForSave();
    const after = clone(keptCheckpoint);
    editHistory = historyApi.record(editHistory, {
      kind: 'project', label: 'Return to kept sound', before, after, at: performance.now()
    });
    applyState(after, 'Returned to the kept controls, cables, and patterns.', { clearHistory: false });
    syncHistoryControls();
    recordAction({
      type: 'project', title: 'Checkpoint returned',
      message: 'Returned to the kept controls, cables, and Mother-32 patterns.'
    });
  }

  function stepHistory(direction) {
    // A knob drag tracks its own value from where it was grabbed, so it would overwrite
    // a restoration on the next pointer move and then record a change that spans it.
    // The gesture in progress owns the control until it is released.
    if (activeKnobDrag) {
      setStatus(`Release the knob before ${direction === 'undo' ? 'undoing' : 'redoing'}.`, 'warning');
      return;
    }
    const step = direction === 'undo'
      ? historyApi.undo(editHistory)
      : historyApi.redo(editHistory);
    if (!step) return;
    editHistory = step.history;
    applyHistoryEntry(step.entry, direction);
    syncHistoryControls();
    syncExperimentViewToProject();
    clearVariationOffer();
    const verb = direction === 'undo' ? 'Undid' : 'Redid';
    setStatus(`${verb} ${step.entry.label}.`, 'success');
    // A restoration is one semantic project change. It is not a replay of the gestures
    // that produced the original value, and the log must not imply that it is.
    recordAction({
      type: 'project',
      title: direction === 'undo' ? 'Undo' : 'Redo',
      message: `${verb} ${step.entry.label}.`
    });
  }

  // ─── Listening experiment ──────────────────────────────────────────────────────

  function experimentIsActive() {
    return experimentEngine.isActive(activeExperiment?.session);
  }

  function experimentContext() {
    return {
      audioRunning: audioContext?.state === 'running',
      transport: coachTransport
    };
  }

  function setupExperimentPrediction(experiment) {
    if (experimentPrediction.dataset.experimentId === experiment.id) return;
    experimentPrediction.replaceChildren();
    experimentPrediction.dataset.experimentId = experiment.id;
    experimentPrediction.add(new Option('Choose if you want to predict', ''));
    for (const prediction of experiment.predictions) {
      experimentPrediction.add(new Option(prediction.label, prediction.id));
    }
  }

  function selectedExperiment() {
    return experimentEngine.get(experimentSelect.value) ?? experimentEngine.experiments[0];
  }

  function renderExperiment() {
    const experiment = activeExperiment?.experiment ?? selectedExperiment();
    if (!experiment) return;
    setupExperimentPrediction(experiment);
    const session = activeExperiment?.session ?? null;
    const state = session?.state ?? 'offered';
    const active = experimentEngine.isActive(session);
    const reflecting = state === 'reflecting';
    const terminal = experimentEngine.isTerminal(session);
    experimentSelect.disabled = active;
    experimentSelect.value = experiment.id;

    experimentIntro.textContent = `${experiment.title}. ${experiment.summary}`;
    experimentBlockers.replaceChildren(...experimentSetupBlockers.map(message => {
      const item = document.createElement('li');
      item.textContent = message;
      return item;
    }));
    experimentStartButton.hidden = active;
    experimentStartButton.textContent = terminal ? 'Run again' :
      (experimentSetupBlockers.length ? 'Check setup again' : 'Start experiment');
    experimentShowButton.hidden = !active;
    experimentShowButton.textContent = `Show ${controlNamesById[`${experiment.instrumentId}:${experiment.target.controlId}`]?.name ?? experiment.target.controlId}`;
    experimentCompareButton.hidden = !reflecting;
    experimentKeepButton.hidden = !reflecting;
    experimentRestoreButton.hidden = !active;
    experimentPredictionField.hidden = !active;
    experimentPredictionPrompt.textContent = experiment.predictionPrompt;
    experimentPrediction.value = session?.prediction ?? '';

    if (state === 'offered') {
      experimentStatus.value = experimentSetupBlockers.length
        ? 'The rack was not changed. Fix any setup item, then check again.'
        : 'Optional. Starting captures a separate settings baseline; it does not replace Keep this sound.';
      experimentInstruction.textContent = experiment.listenFor;
      return;
    }
    if (state === 'trying') {
      const definition = definitionFor(experiment.instrumentId, experiment.target.controlId);
      const suggested = session.baselineValue <= 0.5
        ? experiment.target.highTarget : experiment.target.lowTarget;
      experimentStatus.value = 'Baseline captured. Change the named control by hand; unrelated edits will not complete the task.';
      experimentInstruction.textContent = `${experiment.instruction} A clear contrast from this baseline is about ${
        displayParameterValue(definition, suggested)}. ${experiment.listenFor}`;
      return;
    }
    if (state === 'reflecting') {
      experimentStatus.value = session.view === 'baseline'
        ? 'Baseline is playing. The changed settings remain available.'
        : session.view === 'changed'
          ? 'Changed settings are playing. Compare them with the captured baseline.'
          : 'The rack has moved beyond both snapshots. Baseline and changed settings remain available.';
      experimentCompareButton.textContent = session.view === 'baseline'
        ? 'Hear changed settings' : 'Compare baseline';
      experimentInstruction.textContent = `${experiment.listenFor} Sequential recall restores settings, not oscillator or envelope phase.`;
      return;
    }
    experimentStatus.value = state === 'kept'
      ? 'Changed settings kept. The completed experiment does not judge your description.'
      : state === 'restored'
        ? 'Baseline restored. Undo can recover the settings that restoration displaced.'
        : 'Experiment ended.';
    experimentInstruction.textContent = experiment.listenFor;
  }

  function syncExperimentViewToProject() {
    if (activeExperiment?.session.state !== 'reflecting') return;
    const current = JSON.stringify(stateForSave());
    const desired = current === JSON.stringify(activeExperiment.baseline)
      ? 'baseline'
      : current === JSON.stringify(activeExperiment.changed)
        ? 'changed'
        : 'current';
    if (activeExperiment.session.view === desired) return;
    activeExperiment.session = experimentEngine.transition(activeExperiment.session, {
      type: `show-${desired}`
    });
    renderExperiment();
  }

  function beginExperiment() {
    const experiment = selectedExperiment();
    const result = experimentEngine.check(
      experiment.id,
      { instruments: projectState.instruments, patches: projectState.patches },
      experimentContext()
    );
    experimentSetupBlockers = [...result.blockers];
    if (!result.ready) {
      activeExperiment = null;
      renderExperiment();
      setStatus('The listening experiment needs setup first. Nothing was changed.', 'warning');
      return;
    }
    const baselineValue = projectState.instruments[experiment.instrumentId]
      .parameters[experiment.target.controlId];
    let session = experimentEngine.createSession(experiment.id, baselineValue);
    session = experimentEngine.transition(session, { type: 'begin' });
    activeExperiment = {
      experiment,
      session,
      baseline: clone(stateForSave()),
      changed: null
    };
    experimentSetupBlockers = [];
    clearVariationOffer();
    hideCoachCue();
    renderExperiment();
    setStatus(`${experiment.title} started. Its settings baseline is ready.`, 'success');
    recordAction({ type: 'experiment-started', experimentId: experiment.id });
  }

  function showExperimentTarget() {
    if (!experimentIsActive()) return;
    const { instrumentId, target } = activeExperiment.experiment;
    const control = rack.querySelector(
      `.control[data-instrument-id="${instrumentId}"][data-parameter-id="${target.controlId}"]`
    );
    if (!control) return;
    revealElements([control], { onlyIfHidden: true });
    control.querySelector('[role="slider"], button')?.focus({ preventScroll: true });
  }

  function observeExperimentTarget(instrumentId, parameterId, value) {
    if (!experimentIsActive()) return false;
    const experiment = activeExperiment.experiment;
    if (experiment.instrumentId !== instrumentId || experiment.target.controlId !== parameterId) return false;
    const next = experimentEngine.transition(activeExperiment.session, {
      type: 'target-change', value
    });
    if (next === activeExperiment.session) return false;
    activeExperiment.session = next;
    activeExperiment.changed = clone(stateForSave());
    renderExperiment();
    setStatus('The experiment has a clear contrast. Compare or choose which settings to keep.', 'success');
    recordAction({ type: 'experiment-tried', experimentId: experiment.id, targetId: parameterId });
    return true;
  }

  function applyExperimentSnapshot(snapshot, label) {
    const before = stateForSave();
    const changed = JSON.stringify(before) !== JSON.stringify(snapshot);
    editHistory = historyApi.record(editHistory, {
      kind: 'project', label, before, after: snapshot, at: performance.now()
    });
    applyState(clone(snapshot), label, { clearHistory: false });
    syncHistoryControls();
    return changed;
  }

  function compareExperiment() {
    if (activeExperiment?.session.state !== 'reflecting') return;
    const showBaseline = activeExperiment.session.view !== 'baseline';
    applyExperimentSnapshot(
      showBaseline ? activeExperiment.baseline : activeExperiment.changed,
      showBaseline ? 'Experiment: compare baseline' : 'Experiment: hear changed settings'
    );
    activeExperiment.session = experimentEngine.transition(activeExperiment.session, {
      type: showBaseline ? 'show-baseline' : 'show-changed'
    });
    renderExperiment();
    recordAction({ type: 'experiment-compared', experimentId: activeExperiment.experiment.id,
      view: activeExperiment.session.view });
  }

  function keepExperimentResult() {
    if (activeExperiment?.session.state !== 'reflecting') return;
    if (activeExperiment.session.view !== 'changed') {
      applyExperimentSnapshot(activeExperiment.changed, 'Experiment: keep changed settings');
    }
    activeExperiment.session = experimentEngine.transition(activeExperiment.session, { type: 'keep' });
    renderExperiment();
    setStatus('Kept the changed experiment settings.', 'success');
    recordAction({ type: 'experiment-kept', experimentId: activeExperiment.experiment.id });
  }

  function restoreExperimentBaseline() {
    if (!experimentIsActive()) return;
    const changed = applyExperimentSnapshot(
      activeExperiment.baseline, 'Experiment: restore baseline');
    activeExperiment.session = experimentEngine.transition(activeExperiment.session, { type: 'restore' });
    renderExperiment();
    setStatus(changed
      ? 'Restored the experiment baseline. Undo recovers the settings you left.'
      : 'The experiment baseline was already restored.', 'success');
    recordAction({ type: 'experiment-restored', experimentId: activeExperiment.experiment.id });
  }

  // ─── Musical intentions ─────────────────────────────────────────────────────────

  function renderIntentControls() {
    intentButtons.replaceChildren(...variationEngine.intents.map(intent => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.intentId = intent.id;
      button.textContent = intent.label;
      button.title = intent.summary;
      button.setAttribute('aria-pressed', String(variationOffer?.intentId === intent.id));
      return button;
    }));
    if (intentLockFields.querySelector('label')) return;
    intentLockFields.append(...variationEngine.locks.map(lock => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.lockId = lock.id;
      // The summary is the honest part: a lock holds named settings still. It does not
      // promise that the rhythm or the pitch you hear cannot change by another route.
      label.title = `${lock.summary} These are settings locks, not a guarantee about what you hear.`;
      label.append(input, document.createTextNode(lock.label.replace(/^Lock /, '')));
      return label;
    }));
  }

  function clearVariationOffer() {
    if (!variationOffer) return;
    variationOffer = null;
    renderVariationOffer();
  }

  function renderVariationOffer() {
    renderIntentControls();
    const offer = variationOffer;
    intentProposals.replaceChildren(...(offer?.proposals ?? []).map(proposal => {
      const item = document.createElement('li');
      item.className = 'intent-proposal';
      const title = document.createElement('h3');
      title.textContent = proposal.title;
      const changes = proposal.changes.map(change => {
        const line = document.createElement('p');
        line.className = 'intent-proposal__change';
        line.textContent = `${change.label}: ${change.fromText} → ${change.toText}`;
        return line;
      });
      const why = document.createElement('p');
      why.textContent = proposal.why;
      const listen = document.createElement('p');
      listen.className = 'intent-proposal__listen';
      listen.textContent = `Listen for: ${proposal.listenFor}`;
      const fit = document.createElement('p');
      fit.className = 'fine-print';
      fit.textContent = `${proposal.routes}${proposal.because.length
        ? ` Offered because ${proposal.because.join(', and ')}.`
        : ''}`;
      const apply = document.createElement('button');
      apply.type = 'button';
      apply.dataset.applyProposal = proposal.id;
      apply.textContent = 'Apply';
      item.append(title, ...changes, why, listen, fit, apply);
      return item;
    }));
    if (!offer) {
      intentStatus.value = '';
      return;
    }
    intentStatus.value = offer.proposals.length
      ? `${offer.label} · seed ${offer.seed}. Nothing has changed yet; press the same button again for another draw.`
      : offer.explanation;
  }

  function offerVariations(intentId) {
    const offer = variationEngine.propose({
      intentId,
      rack: { instruments: projectState.instruments, patches: projectState.patches },
      locks: [...variationLocks],
      scope: intentScope.value,
      // A fresh draw each time it is asked for, and the seed is shown so the same
      // proposals can be asked for again.
      seed: variationSeed++
    });
    variationOffer = offer;
    renderVariationOffer();
    setStatus(offer.proposals.length
      ? `${offer.label}: ${offer.proposals.length} variation${offer.proposals.length === 1 ? '' : 's'} to read before anything changes.`
      : offer.explanation, offer.proposals.length ? 'success' : 'warning');
    recordAction({ type: 'intent', intentId, scope: intentScope.value, offered: offer.proposals.length });
  }

  function applyVariation(proposalId) {
    const proposal = variationOffer?.proposals.find(item => item.id === proposalId);
    if (!proposal) return;
    const values = proposal.changes.map(change => ({
      instrumentId: change.instrumentId,
      parameterId: change.parameterId,
      label: change.label,
      before: projectState.instruments[change.instrumentId].parameters[change.parameterId],
      after: change.to
    }));
    // One deliberate act, so one history entry: undo takes back the whole variation.
    applyingHistory = true;
    try {
      for (const value of values) writeParameterById(value.instrumentId, value.parameterId, value.after);
    } finally {
      applyingHistory = false;
    }
    const label = `${variationOffer.label} · ${proposal.title}`;
    editHistory = historyApi.record(editHistory, {
      kind: 'settings', label, values, at: performance.now()
    });
    syncHistoryControls();
    syncExperimentViewToProject();
    const summary = proposal.changes
      .map(change => `${change.label} ${change.fromText} → ${change.toText}`).join('; ');
    setStatus(`${label}. Undo returns to the previous settings.`, 'success');
    recordAction({
      type: 'project',
      title: 'Variation applied',
      message: `${label}: ${summary}.`,
      next: `Listen for: ${proposal.listenFor}`
    });
    clearVariationOffer();
  }

  function controlValueMessage(control) {
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    const value = projectState.instruments[instrumentId].parameters[parameterId];
    return `${appData.specs[instrumentId].name} ${definition.name}: ${
      displayParameterValue(definition, value)
    }.`;
  }

  // Trackpad users cannot give a knob the fine travel a physical one has, so the pointer's
  // horizontal distance from the knob's own centre picks the resolution: over the knob
  // body a full sweep costs KNOB_COARSE_TRAVEL_PX, and moving aside stretches that sweep
  // out to KNOB_FINE_TRAVEL_PX. Horizontal distance is used rather than straight-line
  // distance so that the vertical drag itself never changes the resolution mid-gesture.
  const KNOB_COARSE_TRAVEL_PX = 200;
  const KNOB_FINE_TRAVEL_PX = 1600;
  const KNOB_FINE_REACH_RADII = 7;
  const KNOB_SHIFT_FINE_FACTOR = 5;
  // Shift on top of an already-distant pointer would otherwise ask for a sweep longer
  // than any screen, which reads as a dead knob rather than a precise one.
  const KNOB_MAX_TRAVEL_PX = 3200;

  function knobDragPrecision(knob, clientX, shiftHeld = false) {
    const bounds = knob.getBoundingClientRect();
    const radius = Math.max(1, bounds.width / 2);
    const offset = Math.abs(clientX - (bounds.left + bounds.width / 2));
    const reach = Math.max(0, Math.min(
      1,
      (offset / radius - 1) / (KNOB_FINE_REACH_RADII - 1)
    ));
    const travelPx = Math.min(
      KNOB_MAX_TRAVEL_PX,
      (KNOB_COARSE_TRAVEL_PX + reach * (KNOB_FINE_TRAVEL_PX - KNOB_COARSE_TRAVEL_PX)) *
        (shiftHeld ? KNOB_SHIFT_FINE_FACTOR : 1)
    );
    return {
      reach,
      shiftHeld,
      travelPx,
      tier: reach < 0.15 ? 'Coarse' : reach < 0.65 ? 'Fine' : 'Ultra fine'
    };
  }

  function knobGestureHint(precision) {
    if (!precision) {
      return 'Drag ↕ to set · move aside while dragging for finer steps · ' +
        'scroll ± 1 step · double-click to type · Alt-click to reset';
    }
    return `${precision.tier}${precision.shiftHeld ? ' + Shift' : ''} · ` +
      `full sweep ≈ ${Math.round(precision.travelPx)}px · ` +
      (precision.reach > 0.9
        ? 'back towards the knob for coarse'
        : 'move further from the knob for finer');
  }

  function showKnobPopover(control, clientX = null, clientY = null, drag = null) {
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    const value = projectState.instruments[instrumentId].parameters[parameterId];
    if (!definition || !Number.isFinite(value)) return;
    // Opening typed entry moves the layout under the cursor, which makes the browser
    // replay a hover; the read-only popover must not reappear behind the field.
    if (activeKnobEditor) return;

    knobPopoverValue.textContent =
      `${definition.name} · ${displayParameterValue(definition, value)}`;
    const startValue = drag?.startValue;
    const moved = Number.isFinite(startValue) && Math.abs(value - startValue) > 0.0005;
    // A whole percent would round every fine drag down to a frozen "0%".
    const sweepPercent = Math.abs(value - startValue) * 100;
    knobPopoverDelta.textContent = moved
      ? `from ${displayParameterValue(definition, startValue)} ` +
        `(${value > startValue ? '+' : '−'}${
          sweepPercent < 10 ? sweepPercent.toFixed(1) : Math.round(sweepPercent)
        }% of sweep)`
      : '';
    knobPopoverDelta.hidden = !moved;
    const precision = drag?.precision ?? null;
    knobPopoverMeter.hidden = !precision;
    if (precision) {
      knobPopoverMeterFill.style.width = `${Math.round(precision.reach * 100)}%`;
    }
    knobPopoverHint.textContent = knobGestureHint(precision);
    knobPopover.style.setProperty('--instrument-color', colors[instrumentId]);
    knobPopover.hidden = false;
    const controlBounds = control.querySelector('.control__knob').getBoundingClientRect();
    const anchorX = Number.isFinite(clientX)
      ? clientX
      : controlBounds.left + controlBounds.width / 2;
    const anchorY = Number.isFinite(clientY) ? clientY : controlBounds.top;
    const popoverBounds = knobPopover.getBoundingClientRect();
    const left = Math.max(8, Math.min(
      window.innerWidth - popoverBounds.width - 8,
      anchorX + 12
    ));
    const top = Math.max(8, Math.min(
      window.innerHeight - popoverBounds.height - 8,
      anchorY - popoverBounds.height - 12
    ));
    knobPopover.style.left = `${left}px`;
    knobPopover.style.top = `${top}px`;
  }

  function hideKnobPopover() {
    knobPopover.hidden = true;
  }

  function positionKnobEditor(control) {
    const bounds = control.querySelector('.control__knob').getBoundingClientRect();
    const editorBounds = knobEditor.getBoundingClientRect();
    const left = Math.max(8, Math.min(
      window.innerWidth - editorBounds.width - 8,
      bounds.left + bounds.width / 2 - editorBounds.width / 2
    ));
    // Prefer sitting above the knob, but drop below it rather than off the top edge.
    const above = bounds.top - editorBounds.height - 10;
    const top = above >= 8 ? above : Math.min(
      window.innerHeight - editorBounds.height - 8,
      bounds.bottom + 10
    );
    knobEditor.style.left = `${left}px`;
    knobEditor.style.top = `${top}px`;
  }

  function openKnobEditor(control) {
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    const value = projectState.instruments[instrumentId].parameters[parameterId];
    if (!definition || !Number.isFinite(value)) return;
    hideKnobPopover();
    activeKnobEditor = {
      control,
      startValue: value,
      startContextTime: audioContext?.currentTime ?? null
    };
    knobEditor.style.setProperty('--instrument-color', colors[instrumentId]);
    knobEditorLabel.textContent = `${appData.specs[instrumentId].name} ${definition.name}`;
    knobEditorHint.textContent = `Type ${entryUnitHint(definition)}, or ` +
      'min / max / center / default. Enter applies, Esc cancels.';
    // The readout's "~" marks an uncalibrated mapping; a field you are about to type an
    // exact request into should not start with it.
    knobEditorInput.value = displayParameterValue(definition, value).replace(/^~/, '');
    knobEditor.hidden = false;
    positionKnobEditor(control);
    knobEditorInput.focus();
    knobEditorInput.select();
  }

  function closeKnobEditor({ restoreFocus = false } = {}) {
    if (!activeKnobEditor) return;
    const { control } = activeKnobEditor;
    activeKnobEditor = null;
    knobEditor.hidden = true;
    if (restoreFocus) control.querySelector('.control__knob')?.focus({ preventScroll: true });
  }

  function commitKnobEditor() {
    if (!activeKnobEditor) return;
    const { control, startValue, startContextTime } = activeKnobEditor;
    const definition = definitionFor(
      control.dataset.instrumentId,
      control.dataset.parameterId
    );
    const parsed = parseControlEntry(definition, knobEditorInput.value);
    if (parsed === null || !Number.isFinite(parsed)) {
      knobEditor.dataset.invalid = 'true';
      knobEditorHint.textContent = `"${knobEditorInput.value.trim()}" is not ` +
        `${entryUnitHint(definition)}. Try again, or min / max / center / default.`;
      knobEditorInput.select();
      return;
    }
    delete knobEditor.dataset.invalid;
    setParameterValue(control, parsed);
    closeKnobEditor({ restoreFocus: true });
    setStatus(controlValueMessage(control), 'success');
    recordControlChange(control, startValue, 'typed', startContextTime);
  }

  knobEditor.addEventListener('submit', event => {
    event.preventDefault();
    commitKnobEditor();
  });

  knobEditorInput.addEventListener('input', () => {
    delete knobEditor.dataset.invalid;
  });

  knobEditorInput.addEventListener('keydown', event => {
    // The rack and document both listen for Escape; typed entry claims it first.
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    closeKnobEditor({ restoreFocus: true });
  });

  knobEditorInput.addEventListener('blur', () => closeKnobEditor());

  function adjustControlByStep(control, direction, multiplier = 1) {
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    const current = projectState.instruments[instrumentId].parameters[parameterId];
    if (!definition || !Number.isFinite(current)) return;
    const semanticDirection = definition.plain?.direction === 'clockwise-decreases'
      ? -direction
      : direction;
    setParameterValue(
      control,
      current + interactionStep(definition) * semanticDirection * multiplier
    );
  }

  function finishKnobDrag(event) {
    if (!activeKnobDrag || activeKnobDrag.pointerId !== event.pointerId) return;
    const { knob, control, startValue, startContextTime } = activeKnobDrag;
    activeKnobDrag = null;
    if (knob.hasPointerCapture?.(event.pointerId)) {
      knob.releasePointerCapture(event.pointerId);
    }
    hideKnobPopover();
    setStatus(controlValueMessage(control), 'success');
    recordControlChange(control, startValue, 'drag', startContextTime);
  }

  function scheduleAudioParameter(instrumentId, parameterId, value) {
    const node = audioInstrumentNodes[instrumentId];
    // While paused the project state is authoritative; replay its latest values on
    // resume instead of accumulating a worklet queue that cannot be consumed.
    if (!audioContext || audioContext.state !== 'running' || !node) return;
    const frame = Math.ceil(audioContext.currentTime * audioContext.sampleRate) +
      audioBlockSizes[instrumentId];
    node.port.postMessage({
      type: 'parameter',
      id: parameterId,
      value,
      frame
    });
  }

  function scheduleAudioTap(instrumentId, parameterId) {
    const node = audioInstrumentNodes[instrumentId];
    if (!audioContext || !node) return;
    const frame = Math.ceil(audioContext.currentTime * audioContext.sampleRate) +
      audioBlockSizes[instrumentId];
    node.port.postMessage({ type: 'parameter', id: parameterId, value: 1, frame });
    node.port.postMessage({ type: 'parameter', id: parameterId, value: 0, frame: frame + 1 });
  }

  function isKeyboardPad(control) {
    return control?.dataset.instrumentId === 'mother32' &&
      /^kb\.pad\[\d+\]$/.test(control.dataset.parameterId);
  }

  function holdKeyboardPad(action, token) {
    if (activeKeyboardPads.has(token)) return;
    const control = action.closest('.control[data-parameter-id]');
    activeKeyboardPads.set(token, { action, control });
    setParameterValue(control, 1);
    if (audioRecorder.recording) audioRecorder.note(padLogEvent(control, true));
    setStatus(audioContext?.state === 'running'
      ? `${controlValueMessage(control)} Release to stop the note.`
      : 'Start or resume Audio to hear the keyboard.', 'success');
  }

  function releaseKeyboardPad(token) {
    const active = activeKeyboardPads.get(token);
    if (!active) return;
    activeKeyboardPads.delete(token);
    if (![...activeKeyboardPads.values()].some(other => other.control === active.control)) {
      setParameterValue(active.control, 0);
      if (audioRecorder.recording) audioRecorder.note(padLogEvent(active.control, false));
    }
    if (token.startsWith('pointer:')) {
      const pointerId = Number(token.slice(8));
      if (active.action.hasPointerCapture?.(pointerId)) active.action.releasePointerCapture(pointerId);
    }
  }

  function releasePerformanceHolds() {
    for (const token of [...activeKeyboardPads.keys()]) releaseKeyboardPad(token);
    for (const pointerId of [...activeSubharmoniconHolds.keys()]) releaseSubharmoniconHold({ pointerId });
  }

  // Performance moves for a take's patch log. Coaching, hover, and UI-only actions are excluded.
  function patchLogEvent(action) {
    const instrumentName = id => appData.specs[id]?.name ?? id;
    const endpoint = point => ({ instrumentId: point.instrumentId, jackId: point.jackId });
    if (action.type === 'control-change') {
      const definition = definitionFor(action.instrumentId, action.targetId);
      if (!definition || !Number.isFinite(action.before) || !Number.isFinite(action.after)) return null;
      return {
        type: 'control', instrumentId: action.instrumentId, targetId: action.targetId,
        before: action.before, after: action.after,
        ...(Number.isFinite(action.gestureStartContextTime)
          ? { contextStartTime: action.gestureStartContextTime }
          : {}),
        stepGesture: definition.kind === 'continuous' ? action.gesture ?? null : null,
        text: `${instrumentName(action.instrumentId)} ${definition.name}: ` +
          `${displayParameterValue(definition, action.before)} → ${displayParameterValue(definition, action.after)}`
      };
    }
    if ((action.type === 'patch-created' || action.type === 'patch-removed') && action.patch) {
      const added = action.type === 'patch-created';
      return {
        type: added ? 'cable-added' : 'cable-removed',
        from: endpoint(action.patch.from), to: endpoint(action.patch.to),
        text: `${added ? 'Patched' : 'Removed'} ${endpointLabel(action.patch.from)} → ${endpointLabel(action.patch.to)}`
      };
    }
    if (action.type === 'transport' && action.state !== 'audio idle') {
      // Worklets report "stopped at step 1" when audio starts; log only real run/stop changes.
      if (action.targetId === 'sequencer-state' &&
        Boolean(action.previousRunning) === String(action.state).startsWith('running')) return null;
      return {
        type: 'transport', instrumentId: action.instrumentId, targetId: action.targetId, state: action.state,
        text: action.targetId === 'sequencer-state'
          ? `${action.instrumentName} sequencer ${action.state}`
          : `${action.instrumentName} ${action.targetName} ${action.state}`
      };
    }
    if (action.type === 'project') {
      // A whole-patch change: keep the resulting state so the log stays reconstructable.
      if (['Patch cleared', 'Project loaded', 'Project imported'].includes(action.title)) {
        return { type: 'project', text: action.title, state: stateForSave() };
      }
      // A restoration moves settings too, and the audio captures it. Log it with the
      // move it reversed and the state it left behind, so the log does not go quiet
      // while the recording changes.
      if (['Undo', 'Redo', 'Variation applied', 'Checkpoint returned'].includes(action.title)) {
        return { type: 'project', text: action.message, state: stateForSave() };
      }
    }
    return null;
  }

  function padLogEvent(control, pressed) {
    const definition = definitionFor('mother32', control.dataset.parameterId);
    return {
      type: 'note', instrumentId: 'mother32', targetId: control.dataset.parameterId, pressed,
      text: `${appData.specs.mother32.name} ${definition?.name ?? control.dataset.parameterId} ${pressed ? 'pressed' : 'released'}`
    };
  }

  // Readable patch summary for the start and end of a patch log: cables, then every
  // control that differs from the default patch or is in `include` (changed in the take).
  function describeStateForLog(state, { include = new Set() } = {}) {
    const lines = state.patches.length
      ? state.patches.map(patch => `Cable: ${endpointLabel(patch.from)} → ${endpointLabel(patch.to)}`)
      : ['No cables.'];
    for (const instrumentId of instrumentOrder) {
      const defaults = appData.defaultState.instruments[instrumentId].parameters;
      for (const [parameterId, value] of Object.entries(state.instruments[instrumentId].parameters)) {
        if (/^kb\.pad\[\d+\]$/.test(parameterId)) continue;
        const atDefault = Math.abs(value - (defaults[parameterId] ?? value)) < 1e-6;
        if (atDefault && !include.has(`${instrumentId}:${parameterId}`)) continue;
        const definition = definitionFor(instrumentId, parameterId);
        if (definition) {
          lines.push(`${appData.specs[instrumentId].name} ${definition.name}: ${displayParameterValue(definition, value)}`);
        }
      }
    }
    lines.push('Controls not listed are at their default settings.');
    const bank = state.instruments.mother32.patternBank;
    if (bank) {
      const edited = Object.keys(bank.patterns ?? {}).length;
      lines.push(`MOTHER-32 pattern ${Number(bank.selected ?? 0) + 1} selected` +
        (edited ? `; ${edited} edited pattern${edited === 1 ? '' : 's'} (full steps in the JSON log)` : ''));
    }
    return lines;
  }

  function stateForSave() {
    const saved = clone(projectState);
    // A held key is a live gesture, not part of a patch or preset.
    for (const id of Object.keys(saved.instruments.mother32.parameters)) {
      if (/^kb\.pad\[\d+\]$/.test(id)) saved.instruments.mother32.parameters[id] = 0;
    }
    return saved;
  }

  function isSubharmoniconHoldTransport(instrumentId, parameterId) {
    return instrumentId === 'subharmonicon' && (
      parameterId === 'transport.reset' || parameterId === 'transport.trigger'
    );
  }

  function syncAudioParameters() {
    if (!audioContext) return;
    for (const instrumentId of liveInstrumentIds) {
      for (const [parameterId, value] of Object.entries(
        projectState.instruments[instrumentId].parameters
      )) {
        scheduleAudioParameter(instrumentId, parameterId, value);
      }
    }
    syncAudioPattern();
  }

  function syncAudioPattern(restart = false) {
    patternRestartPending ||= restart;
    const node = audioInstrumentNodes.mother32;
    if (!audioContext || audioContext.state !== 'running' || !node) return;
    const bank = projectState.instruments.mother32.patternBank;
    node.port.postMessage({
      type: 'pattern', pattern: mother32Patterns.activePattern(bank),
      restart: patternRestartPending,
      frame: Math.ceil(audioContext.currentTime * audioContext.sampleRate) + audioBlockSizes.mother32
    });
    patternRestartPending = false;
  }

  function clearAudioCrossConnections() {
    for (const connection of audioCrossConnections) {
      try {
        if (connection.delay) {
          connection.source.disconnect(connection.delay, connection.outputIndex, 0);
          connection.delay.disconnect(connection.destination, 0, connection.inputIndex);
        } else {
          connection.source.disconnect(
            connection.destination,
            connection.outputIndex,
            connection.inputIndex
          );
        }
      } catch {
        // A browser may already have removed an edge while rebuilding the graph.
      }
    }
    audioCrossConnections = [];
  }

  function graphHasPath(adjacency, from, to, visited = new Set()) {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    for (const next of adjacency.get(from) ?? []) {
      if (graphHasPath(adjacency, next, to, visited)) return true;
    }
    return false;
  }

  function syncAudioPatches() {
    if (!audioContext) return;
    for (const instrumentId of liveInstrumentIds) {
      const node = audioInstrumentNodes[instrumentId];
      if (!node) continue;
      const routes = projectState.patches.filter(patch => (
        patch.from.instrumentId === instrumentId &&
        patch.to.instrumentId === instrumentId
      )).map(patch => ({
        fromJackId: patch.from.jackId,
        toJackId: patch.to.jackId
      }));
      node.port.postMessage({ type: 'patches', routes });
    }

    clearAudioCrossConnections();
    const adjacency = new Map(liveInstrumentIds.map(id => [id, new Set()]));
    for (const patch of projectState.patches) {
      const fromId = patch.from.instrumentId;
      const toId = patch.to.instrumentId;
      if (fromId === toId || !audioInstrumentNodes[fromId] || !audioInstrumentNodes[toId]) {
        continue;
      }
      const source = audioInstrumentNodes[fromId];
      const destination = audioInstrumentNodes[toId];
      const outputIndex = physicalJackIds(fromId, 'out').indexOf(patch.from.jackId);
      const inputIndex = physicalJackIds(toId, 'in').indexOf(patch.to.jackId);
      if (outputIndex < 0 || inputIndex < 0) continue;

      const closesCycle = graphHasPath(adjacency, toId, fromId);
      if (closesCycle) {
        const delay = audioContext.createDelay(1);
        delay.delayTime.value = 1 / audioContext.sampleRate;
        source.connect(delay, outputIndex, 0);
        delay.connect(destination, 0, inputIndex);
        audioCrossConnections.push({
          source, destination, delay, outputIndex, inputIndex
        });
      } else {
        source.connect(destination, outputIndex, inputIndex);
        audioCrossConnections.push({ source, destination, outputIndex, inputIndex });
        adjacency.get(fromId).add(toId);
      }
    }
  }

  function handleControlAction(action, keyboardTap = false) {
    const control = action.closest('.control[data-parameter-id]');
    if (!control) return;
    const instrumentId = control.dataset.instrumentId;
    const parameterId = control.dataset.parameterId;
    const definition = definitionFor(instrumentId, parameterId);
    const current = projectState.instruments[instrumentId].parameters[parameterId];
    if (!definition || !Number.isFinite(current)) return;
    if (instrumentId === 'mother32' && parameterId === 'seq.pattern-bank') {
      patternEditor.open();
      return;
    }

    const isMomentaryTransport = (
      instrumentId === 'mother32' && (
        parameterId === 'seq.run-stop-rec' || parameterId === 'seq.reset-accent'
      )
    ) || (
      instrumentId === 'dfam' && (
        parameterId === 'seq.run-stop' || parameterId === 'seq.advance' ||
        parameterId === 'seq.trigger'
      )
    ) || (
      instrumentId === 'subharmonicon' && (
        parameterId === 'transport.play' || parameterId === 'transport.reset' ||
        parameterId === 'transport.next' || parameterId === 'transport.trigger'
      )
    );
    if (isMomentaryTransport) {
      if (audioContext?.state !== 'running') {
        const next = `${audioContext ? 'Resume' : 'Start'} Audio, then press ${definition.name}.`;
        setStatus(next, 'warning');
        recordAction({
          type: 'transport', instrumentId, instrumentName: appData.specs[instrumentId].name,
          targetId: parameterId, targetName: definition.name, state: 'audio idle', next
        });
        return;
      }
      if (keyboardTap && isSubharmoniconHoldTransport(instrumentId, parameterId)) {
        scheduleAudioTap(instrumentId, parameterId);
      } else {
        scheduleAudioParameter(instrumentId, parameterId, 1);
      }
      projectState.instruments[instrumentId].parameters[parameterId] = 0;
      syncControlElement(control);
      setStatus(`${appData.specs[instrumentId].name} ${definition.name}: triggered.`, 'success');
      recordAction({
        type: 'transport',
        instrumentId,
        instrumentName: appData.specs[instrumentId].name,
        targetId: parameterId,
        targetName: definition.name,
        state: 'triggered'
      });
      return;
    }

    if (definition.kind === 'switch') {
      const positions = switchLabels(definition).length;
      const currentIndex = Math.round(current * Math.max(1, positions - 1));
      const nextIndex = (currentIndex + 1) % positions;
      setParameterValue(control, nextIndex / Math.max(1, positions - 1));
    } else {
      setParameterValue(control, current >= 0.5 ? 0 : 1);
    }
    const next = projectState.instruments[instrumentId].parameters[parameterId];
    setStatus(`${appData.specs[instrumentId].name} ${definition.name}: ${displayParameterValue(definition, next)}.`, 'success');
    recordControlChange(control, current, 'button');
  }

  function handleJackClick(button) {
    const endpoint = {
      instrumentId: button.dataset.instrumentId,
      jackId: button.dataset.jackId
    };
    const jack = jackFor(endpoint);
    const signalSummary = describeJack(appData.specs[endpoint.instrumentId], jack);
    if (jack.dir === 'out') {
      if (selectedInput) {
        const destination = selectedInput;
        clearPatchSelectionState();
        addPatch(endpoint, destination);
        refreshSelection();
        scheduleCableDraw();
        return;
      }
      if (endpointsMatch(selectedOutput, endpoint)) {
        cancelPatchSelection();
        return;
      }
      clearPatchSelectionState();
      selectedOutput = endpoint;
      refreshSelection();
      scheduleCableDraw();
      const alreadyPatched = projectState.patches.some(patch => endpointsMatch(patch.from, endpoint));
      setStatus(`Cable armed from ${endpointLabel(endpoint)}. Choose a glowing input; Escape cancels.` +
        (alreadyPatched
          ? ' This output already has a cable; on hardware, split it through a MULT or a stackable cable.'
          : ''), 'normal');
      recordAction({
        type: 'output-selected',
        instrumentId: endpoint.instrumentId,
        targetId: endpoint.jackId,
        targetName: jack.name,
        endpoint,
        signalSummary
      });
      return;
    }

    if (selectedOutput) {
      const source = selectedOutput;
      clearPatchSelectionState();
      addPatch(source, endpoint);
      refreshSelection();
      scheduleCableDraw();
      return;
    }
    if (endpointsMatch(selectedInput, endpoint)) {
      cancelPatchSelection();
      return;
    }
    // Input first is allowed: grade the outputs that could feed this input.
    selectedInput = endpoint;
    previewOutput = null;
    refreshSelection();
    scheduleCableDraw();
    setStatus(`${endpointLabel(endpoint)} chosen as the destination. Choose a glowing output; Escape cancels.`, 'normal');
    recordAction({
      type: 'input-selected',
      instrumentId: endpoint.instrumentId,
      targetId: endpoint.jackId,
      targetName: jack.name,
      endpoint,
      signalSummary
    });
  }

  function normalizeImportedState(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      throw new Error('Project state must be a JSON object.');
    }
    if (candidate.formatVersion !== appData.defaultState.formatVersion ||
      candidate.schemaVersion !== appData.defaultState.schemaVersion) {
      throw new Error('This project uses an unsupported state or schema version.');
    }

    const next = clone(appData.defaultState);
    const warnings = [];
    // Reject a malformed bank before applying any part of the incoming project.
    next.instruments.mother32.patternBank = mother32Patterns.normalizeBank(
      candidate.instruments?.mother32?.patternBank);
    for (const instrumentId of instrumentOrder) {
      if (candidate.parameterTables?.[instrumentId] !==
        appData.manifests[instrumentId].parameterHash) {
        warnings.push(`${instrumentId} table changed; migrated by stable ID`);
      }
      const incoming = candidate.instruments?.[instrumentId];
      if (typeof incoming?.enabled === 'boolean') next.instruments[instrumentId].enabled = incoming.enabled;
      for (const parameter of appData.manifests[instrumentId].parameters) {
        if (instrumentId === 'mother32' && /^kb\.pad\[\d+\]$/.test(parameter.id)) continue;
        const value = incoming?.parameters?.[parameter.id];
        if (Number.isFinite(value) && value >= 0 && value <= 1) {
          next.instruments[instrumentId].parameters[parameter.id] = value;
        }
      }
    }

    const patchIds = new Set();
    const connections = new Set();
    for (const patch of Array.isArray(candidate.patches) ? candidate.patches : []) {
      const fromJack = jackFor(patch?.from);
      const toJack = jackFor(patch?.to);
      if (!fromJack || !toJack || fromJack.dir !== 'out' || toJack.dir !== 'in') {
        warnings.push('ignored an invalid cable');
        continue;
      }
      const connection = `${endpointKey(patch.from)}→${endpointKey(patch.to)}`;
      if (connections.has(connection)) {
        warnings.push('ignored a duplicate cable');
        continue;
      }
      connections.add(connection);
      const id = typeof patch.id === 'string' && patch.id && !patchIds.has(patch.id)
        ? patch.id
        : makePatchId();
      patchIds.add(id);
      next.patches.push({
        id,
        from: patch.from,
        to: patch.to,
        colorIndex: Number.isInteger(patch.colorIndex)
          ? Math.max(0, Math.min(cableColors.length - 1, patch.colorIndex))
          : next.patches.length % cableColors.length
      });
    }

    if (candidate.ui?.mode === 'practice' || candidate.ui?.mode === 'perform') {
      next.ui.mode = candidate.ui.mode;
    }
    if (Number.isFinite(candidate.ui?.zoom) && candidate.ui.zoom > 0) {
      next.ui.zoom = candidate.ui.zoom;
    }
    if (Array.isArray(candidate.ui?.collapsedInstruments)) {
      next.ui.collapsedInstruments = candidate.ui.collapsedInstruments.filter(
        id => instrumentOrder.includes(id)
      );
    }
    return { state: next, warnings };
  }

  function applyState(next, message, { clearHistory = true } = {}) {
    releasePerformanceHolds();
    // Callers choose whether a replacement starts a new history or participates in the
    // existing one as a whole-project transaction.
    if (clearHistory) {
      editHistory = historyApi.clear(editHistory);
      syncHistoryControls();
    }
    clearVariationOffer();
    projectState = next;
    patternRestartPending = true;
    patternEditor.refresh();
    clearPatchSelectionState();
    refreshSelection();
    syncControlSurface();
    syncAudioParameters();
    syncAudioPatches();
    updateSummary();
    drawCables();
    setStatus(message, 'success');
    hideCoachCue();
    if (projectState.patches.length === 0) showStarterHint();
    syncExperimentViewToProject();
  }

  function saveLocal() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateForSave()));
      setStatus('Saved locally in this browser.', 'success');
      recordAction({
        type: 'project', title: 'Project saved',
        message: 'This rack state is stored in the current browser.',
        next: 'Export JSON when you want a portable copy.'
      });
    } catch (error) {
      setStatus(`Local save failed: ${error.message}`, 'error');
    }
  }

  function loadLocal() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setStatus('No local project has been saved yet.', 'warning');
        return;
      }
      const result = normalizeImportedState(JSON.parse(stored));
      const before = stateForSave();
      editHistory = historyApi.record(editHistory, {
        kind: 'project', label: 'Load local project', before, after: result.state,
        at: performance.now()
      });
      applyState(result.state, result.warnings.length
        ? `Loaded locally with ${result.warnings.length} migration warning(s).`
        : 'Loaded local project.', { clearHistory: false });
      syncHistoryControls();
      recordAction({
        type: 'project', title: 'Project loaded',
        message: `${result.state.patches.length} cable${result.state.patches.length === 1 ? '' : 's'} restored from local storage.`,
        next: result.warnings.length
          ? `${result.warnings.length} migration warning${result.warnings.length === 1 ? '' : 's'} were reported in Status.`
          : 'Review the panel before starting the transport.'
      });
    } catch (error) {
      setStatus(`Local load failed: ${error.message}`, 'error');
    }
  }

  function exportProject() {
    const blob = new Blob([`${JSON.stringify(stateForSave(), null, 2)}\n`], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'moog-rack-project.json';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus('Exported project JSON.', 'success');
    recordAction({
      type: 'project', title: 'Project exported',
      message: 'A portable JSON copy was downloaded.',
      next: 'The file uses stable instrument, jack, and parameter IDs.'
    });
  }

  async function importProject(file) {
    try {
      const result = normalizeImportedState(JSON.parse(await file.text()));
      const before = stateForSave();
      editHistory = historyApi.record(editHistory, {
        kind: 'project', label: 'Import project', before, after: result.state,
        at: performance.now()
      });
      applyState(result.state, result.warnings.length
        ? `Imported with ${result.warnings.length} migration warning(s).`
        : 'Imported project JSON.', { clearHistory: false });
      syncHistoryControls();
      recordAction({
        type: 'project', title: 'Project imported',
        message: `${result.state.patches.length} cable${result.state.patches.length === 1 ? '' : 's'} loaded from JSON.`,
        next: 'Review the reconstructed patch before starting audio.'
      });
    } catch (error) {
      setStatus(`Import failed: ${error.message}`, 'error');
    } finally {
      importInput.value = '';
    }
  }

  async function toggleAudio() {
    if (audioTransitionPending) return;
    audioTransitionPending = true;
    startAudioButton.disabled = true;
    try {
      await changeAudioState();
    } catch (error) {
      setStatus(`Audio transition failed: ${error.message}`, 'error');
    } finally {
      audioTransitionPending = false;
      startAudioButton.disabled = false;
    }
  }

  async function changeAudioState() {
    if (audioContext) {
      if (audioContext.state === 'running') {
        await audioRecorder.stop('interrupted');
        releasePerformanceHolds();
        await audioContext.suspend();
        audioStatus.textContent = 'Audio suspended';
        startAudioButton.textContent = 'Resume Audio';
        setPerformanceMeterIdle('Audio suspended');
        recordAction({
          type: 'audio', state: 'suspended',
          message: 'Audio is paused; the rack state and patch remain intact.'
        });
      } else {
        await audioContext.resume();
        syncAudioParameters();
        audioStatus.textContent = `Audio running · ${audioContext.sampleRate} Hz`;
        startAudioButton.textContent = 'Pause Audio';
        recordAction({
          type: 'audio', state: 'running',
          message: `Audio resumed at ${audioContext.sampleRate} Hz.`
        });
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setStatus('This browser does not support Web Audio.', 'error');
      return;
    }

    let context = null;
    try {
      context = new AudioContextClass({ latencyHint: 'interactive' });
      if (!context.audioWorklet || typeof AudioWorkletNode !== 'function') {
        await context.close();
        throw new Error('AudioWorklet is unavailable in this direct-file context.');
      }

      const moduleCandidates = [{
        kind: 'embedded data',
        url: `data:text/javascript;charset=utf-8,${encodeURIComponent(workletSource)}`
      }];
      if (location.protocol !== 'file:') {
        moduleCandidates.push({
          kind: 'Blob',
          url: URL.createObjectURL(new Blob([workletSource], {
            type: 'text/javascript'
          })),
          revoke: true
        });
      }

      let loadedModuleKind = null;
      let moduleError = null;
      for (const candidate of moduleCandidates) {
        try {
          await context.audioWorklet.addModule(candidate.url);
          loadedModuleKind = candidate.kind;
          break;
        } catch (error) {
          moduleError = error;
        } finally {
          if (candidate.revoke) URL.revokeObjectURL(candidate.url);
        }
      }
      if (!loadedModuleKind) {
        throw moduleError || new Error('Unable to load the embedded AudioWorklet module.');
      }

      const nodes = Object.create(null);
      const gains = Object.create(null);
      const processorNames = {
        dfam: 'moog-dfam',
        mother32: 'moog-mother32',
        subharmonicon: 'moog-subharmonicon'
      };
      const noiseSeeds = {
        dfam: 0x4446414d,
        mother32: 0x4d333220,
        subharmonicon: 0x53554248
      };
      for (const instrumentId of liveInstrumentIds) {
        const manifest = appData.manifests[instrumentId];
        const patchInputIds = physicalJackIds(instrumentId, 'in');
        const patchOutputIds = physicalJackIds(instrumentId, 'out');
        const audioRuntime = appData.audioRuntime[instrumentId];
        const node = new AudioWorkletNode(context, processorNames[instrumentId], {
          numberOfInputs: patchInputIds.length,
          numberOfOutputs: patchOutputIds.length,
          outputChannelCount: patchOutputIds.map(() => 1),
          processorOptions: {
            schemaVersion: manifest.schemaVersion,
            parameterHash: manifest.parameterHash,
            parameters: projectState.instruments[instrumentId].parameters,
            ...(instrumentId === 'mother32' ? {
              pattern: mother32Patterns.activePattern(projectState.instruments.mother32.patternBank)
            } : {}),
            noiseSeed: noiseSeeds[instrumentId]
          }
        });
        node.port.onmessage = event => {
          const name = appData.specs[instrumentId].name;
          if (event.data?.type === 'queue-overflow') {
            setStatus(
              `${name} audio event queue overflowed; the newest change was dropped.`,
              'error'
            );
            return;
          }
          if (event.data?.type === 'patch-error') {
            setStatus(`${name} patch routing failed: ${event.data.message}`, 'error');
            return;
          }
          if (event.data?.type === 'pattern-error') {
            setStatus(`Mother-32 pattern failed: ${event.data.message}`, 'error');
            return;
          }
          if (event.data?.type === 'sequencer-state') {
            const wasRunning = Boolean(coachTransport[instrumentId]?.running);
            coachTransport[instrumentId] = {
              running: Boolean(event.data.running),
              ...nextStepTiming(coachTransport[instrumentId], event.data)
            };
            updateSequencerIndicator(instrumentId, event.data);
            if (event.data.reason === 'clock') return;
            const action = event.data.running ? 'running' : 'stopped';
            // A delayed transport report must not erase a newer actionable error.
            if (statusText.dataset.tone !== 'error') {
              setStatus(
                `${name} sequencer ${action} at step ${event.data.currentStep + 1}.`,
                'success'
              );
            }
            recordAction({
              type: 'transport',
              instrumentId,
              instrumentName: name,
              targetId: 'sequencer-state',
              targetName: 'Sequencer',
              state: `${action} at step ${event.data.currentStep + 1}`,
              previousRunning: wasRunning,
              next: event.data.running
                ? 'Change one step control and listen for it on the next cycle.'
                : 'Start it when the patch and monitoring level are ready.'
            });
            return;
          }
          if (event.data?.type !== 'ready') return;
          if (JSON.stringify(event.data.patchInputIds) !== JSON.stringify(patchInputIds) ||
            JSON.stringify(event.data.patchOutputIds) !== JSON.stringify(patchOutputIds)) {
            setStatus(`${name} patch-port handshake failed.`, 'error');
            return;
          }
          audioBlockSizes[instrumentId] = event.data.blockSize;
          audioReadyInstruments.add(instrumentId);
          audioStatus.textContent = audioReadyInstruments.size === liveInstrumentIds.length
            ? `${liveRackLabel} live · ${event.data.sampleRate} Hz`
            : `${name} live · waiting for rack`;
        };
        const destinationGain = context.createGain();
        destinationGain.gain.value = audioRuntime.browserOutputGain;
        node.connect(destinationGain, patchOutputIds.indexOf('vca-out'), 0);
        destinationGain.connect(context.destination);
        nodes[instrumentId] = node;
        gains[instrumentId] = destinationGain;
      }
      audioContext = context;
      audioInstrumentNodes = nodes;
      audioDestinationGains = gains;
      audioAnalysisGraph = createAudioAnalysisGraph(context, gains);
      syncAudioAnalysisMode();
      audioReadyInstruments.clear();
      syncAudioPatches();
      await context.resume();
      syncAudioParameters();
      startAudioButton.textContent = 'Pause Audio';
      audioStatus.textContent = `${liveRackLabel} loading · ${context.sampleRate} Hz`;
      setStatus(`Local ${loadedModuleKind} three-instrument AudioWorklet rack started. All models remain provisional-unmeasured.`, 'success');
      recordAction({
        type: 'audio', state: 'running',
        message: `All three provisional instruments started at ${context.sampleRate} Hz.`
      });
    } catch (error) {
      if (context && context.state !== 'closed') {
        await context.close().catch(() => {});
      }
      audioContext = null;
      audioInstrumentNodes = Object.create(null);
      audioDestinationGains = Object.create(null);
      audioCrossConnections = [];
      audioAnalysisGraph = null;
      performanceCard.dataset.meterConnected = 'false';
      setPerformanceMeterIdle('Audio unavailable');
      audioReadyInstruments.clear();
      setStatus(`${error.message} Use a supported direct-file browser or the future standalone package.`, 'error');
      audioStatus.textContent = 'Audio unavailable';
      recordAction({
        type: 'audio', state: 'failed',
        message: `Audio could not start: ${error.message}`
      });
    }
  }

  rack.addEventListener('pointerdown', event => {
    const knob = event.target.closest('.control__knob');
    if (!knob || event.button !== 0) return;
    const control = knob.closest('.control[data-parameter-id]');
    const value = projectState.instruments[control.dataset.instrumentId]
      .parameters[control.dataset.parameterId];
    event.preventDefault();
    knob.focus({ preventScroll: true });
    // Double-click now opens typed entry, so the default reset moves to Alt-click and
    // to the word "default" in the entry field.
    if (event.altKey) {
      closeKnobEditor();
      const definition = definitionFor(
        control.dataset.instrumentId,
        control.dataset.parameterId
      );
      setParameterValue(control, definition.defaultNormalized ?? 0);
      showKnobPopover(control, event.clientX, event.clientY);
      setStatus(`${controlValueMessage(control)} Reset to default.`, 'success');
      recordControlChange(control, value, 'reset');
      return;
    }
    closeKnobEditor();
    knob.setPointerCapture?.(event.pointerId);
    activeKnobDrag = {
      pointerId: event.pointerId,
      knob,
      control,
      lastY: event.clientY,
      rawValue: value,
      startValue: value,
      precision: knobDragPrecision(knob, event.clientX, event.shiftKey),
      // A slow drag is audible long before release; the patch log keeps both times.
      startContextTime: audioContext?.currentTime ?? null
    };
    showKnobPopover(control, event.clientX, event.clientY, activeKnobDrag);
  });

  rack.addEventListener('pointermove', event => {
    const hoveredKnob = event.target.closest('.control__knob');
    if (!activeKnobDrag) {
      if (hoveredKnob) {
        showKnobPopover(
          hoveredKnob.closest('.control[data-parameter-id]'),
          event.clientX,
          event.clientY
        );
      }
      return;
    }
    if (activeKnobDrag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const definition = definitionFor(
      activeKnobDrag.control.dataset.instrumentId,
      activeKnobDrag.control.dataset.parameterId
    );
    const travel = activeKnobDrag.lastY - event.clientY;
    activeKnobDrag.lastY = event.clientY;
    activeKnobDrag.precision = knobDragPrecision(
      activeKnobDrag.knob,
      event.clientX,
      event.shiftKey
    );
    activeKnobDrag.rawValue = Math.max(0, Math.min(
      1,
      activeKnobDrag.rawValue + travel / activeKnobDrag.precision.travelPx
    ));
    const center = bipolarCenter(definition);
    const value = center !== null && Math.abs(activeKnobDrag.rawValue - center) <= 0.0125
      ? center
      : activeKnobDrag.rawValue;
    setParameterValue(activeKnobDrag.control, value);
    showKnobPopover(
      activeKnobDrag.control,
      event.clientX,
      event.clientY,
      activeKnobDrag
    );
  });

  rack.addEventListener('pointerup', finishKnobDrag);
  rack.addEventListener('pointercancel', finishKnobDrag);

  rack.addEventListener('pointerout', event => {
    const knob = event.target.closest('.control__knob');
    if (!activeKnobDrag && knob && !knob.contains(event.relatedTarget)) {
      hideKnobPopover();
    }
    const jack = event.target.closest('.jack');
    const previewed = previewInput ?? previewOutput;
    if (jack && !jack.contains(event.relatedTarget) && previewed &&
      jack.dataset.instrumentId === previewed.instrumentId &&
      jack.dataset.jackId === previewed.jackId) {
      previewInput = null;
      previewOutput = null;
      refreshSelection();
      scheduleCableDraw();
    }
  });

  rack.addEventListener('focusin', event => {
    const knob = event.target.closest('.control__knob');
    if (knob) showKnobPopover(knob.closest('.control[data-parameter-id]'));
    const jack = event.target.closest('.jack');
    if (jack) {
      const endpoint = {
        instrumentId: jack.dataset.instrumentId,
        jackId: jack.dataset.jackId
      };
      if (selectedOutput && jack.dataset.direction === 'in') {
        previewInput = endpoint;
        refreshSelection();
        scheduleCableDraw();
      } else if (selectedInput && jack.dataset.direction === 'out') {
        previewOutput = endpoint;
        refreshSelection();
        scheduleCableDraw();
      }
      showHintForJack(endpoint);
    }
  });

  rack.addEventListener('pointerover', event => {
    const jack = event.target.closest('.jack');
    if (!jack) return;
    const endpoint = {
      instrumentId: jack.dataset.instrumentId,
      jackId: jack.dataset.jackId
    };
    if (selectedOutput && jack.dataset.direction === 'in' &&
      !endpointsMatch(previewInput, endpoint)) {
      previewInput = endpoint;
      refreshSelection();
      scheduleCableDraw();
    } else if (selectedInput && jack.dataset.direction === 'out' &&
      !endpointsMatch(previewOutput, endpoint)) {
      previewOutput = endpoint;
      refreshSelection();
      scheduleCableDraw();
    }
    showHintForJack(endpoint);
  });

  rack.addEventListener('focusout', event => {
    if (event.target.matches('.control__knob') && !activeKnobDrag) hideKnobPopover();
    const jack = event.target.closest('.jack');
    const previewed = previewInput ?? previewOutput;
    if (jack && !jack.contains(event.relatedTarget) && previewed &&
      jack.dataset.instrumentId === previewed.instrumentId &&
      jack.dataset.jackId === previewed.jackId) {
      previewInput = null;
      previewOutput = null;
      refreshSelection();
      scheduleCableDraw();
    }
  });

  rack.addEventListener('wheel', event => {
    const knob = event.target.closest('.control__knob');
    if (!knob || event.deltaY === 0) return;
    event.preventDefault();
    const control = knob.closest('.control[data-parameter-id]');
    const before = projectState.instruments[control.dataset.instrumentId]
      .parameters[control.dataset.parameterId];
    adjustControlByStep(control, event.deltaY < 0 ? 1 : -1);
    showKnobPopover(control, event.clientX, event.clientY);
    setStatus(controlValueMessage(control), 'success');
    recordControlChange(control, before, 'wheel');
  }, { passive: false });

  rack.addEventListener('dblclick', event => {
    const knob = event.target.closest('.control__knob');
    if (!knob) return;
    event.preventDefault();
    openKnobEditor(knob.closest('.control[data-parameter-id]'));
  });

  rack.addEventListener('keydown', event => {
    const knob = event.target.closest('.control__knob');
    if (!knob) return;
    const control = knob.closest('.control[data-parameter-id]');
    const before = projectState.instruments[control.dataset.instrumentId]
      .parameters[control.dataset.parameterId];
    const definition = definitionFor(
      control.dataset.instrumentId,
      control.dataset.parameterId
    );
    // Double-click is the pointer route into typed entry; Enter is the keyboard one, so
    // an exact value is not a pointer-only capability.
    if (event.key === 'Enter') {
      event.preventDefault();
      openKnobEditor(control);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const reversed = definition.plain?.direction === 'clockwise-decreases';
      const selectsMinimum = event.key === 'Home';
      setParameterValue(control, selectsMinimum === reversed ? 1 : 0);
    } else {
      const direction = event.key === 'ArrowUp' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
          ? -1
          : 0;
      if (!direction) return;
      event.preventDefault();
      adjustControlByStep(control, direction, event.shiftKey ? 10 : 1);
    }
    showKnobPopover(control);
    setStatus(controlValueMessage(control), 'success');
    recordControlChange(control, before, 'keyboard');
  });

  rack.addEventListener('pointerdown', event => {
    const action = event.target.closest('.control__action');
    const control = action?.closest('.control[data-parameter-id]');
    if (isKeyboardPad(control)) {
      if (event.button !== 0) return;
      event.preventDefault();
      action.focus({ preventScroll: true });
      holdKeyboardPad(action, `pointer:${event.pointerId}`);
      action.setPointerCapture?.(event.pointerId);
      return;
    }
    if (!control || !isSubharmoniconHoldTransport(
      control.dataset.instrumentId,
      control.dataset.parameterId
    )) return;
    event.preventDefault();
    activeSubharmoniconHolds.set(event.pointerId, {
      action,
      instrumentId: control.dataset.instrumentId,
      parameterId: control.dataset.parameterId
    });
    action.setPointerCapture?.(event.pointerId);
    scheduleAudioParameter(control.dataset.instrumentId, control.dataset.parameterId, 1);
    setStatus(`${appData.specs.subharmonicon.name} ${definitionFor(
      control.dataset.instrumentId,
      control.dataset.parameterId
    ).name}: held.`, 'success');
    recordAction({
      type: 'transport',
      instrumentId: control.dataset.instrumentId,
      instrumentName: appData.specs[control.dataset.instrumentId].name,
      targetId: control.dataset.parameterId,
      targetName: definitionFor(
        control.dataset.instrumentId,
        control.dataset.parameterId
      ).name,
      state: 'held'
    });
  });

  function releaseSubharmoniconHold(event) {
    const active = activeSubharmoniconHolds.get(event.pointerId);
    if (!active) return;
    activeSubharmoniconHolds.delete(event.pointerId);
    scheduleAudioParameter(active.instrumentId, active.parameterId, 0);
    if (active.action.hasPointerCapture?.(event.pointerId)) {
      active.action.releasePointerCapture(event.pointerId);
    }
  }

  rack.addEventListener('pointerup', releaseSubharmoniconHold);
  rack.addEventListener('pointercancel', releaseSubharmoniconHold);
  rack.addEventListener('pointerup', event => releaseKeyboardPad(`pointer:${event.pointerId}`));
  rack.addEventListener('pointercancel', event => releaseKeyboardPad(`pointer:${event.pointerId}`));
  rack.addEventListener('lostpointercapture', event => {
    releaseKeyboardPad(`pointer:${event.pointerId}`);
    releaseSubharmoniconHold(event);
  });
  rack.addEventListener('keydown', event => {
    const action = event.target.closest('.control__action');
    if (!isKeyboardPad(action?.closest('.control')) || ![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) holdKeyboardPad(action, `key:${event.key}`);
  });
  document.addEventListener('keyup', event => {
    const token = `key:${event.key}`;
    if (!activeKeyboardPads.has(token)) return;
    event.preventDefault();
    releaseKeyboardPad(token);
  });
  window.addEventListener('blur', releasePerformanceHolds);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releasePerformanceHolds();
  });

  rack.addEventListener('click', event => {
    const action = event.target.closest('.control__action');
    if (action) {
      const control = action.closest('.control[data-parameter-id]');
      if (isKeyboardPad(control)) {
        // Pointer/keyboard gestures already supplied their own press and release.
        // Assistive activation without either gesture gets a short, non-latching note.
        if (event.detail === 0 && ![...activeKeyboardPads.values()].some(active => active.control === control)) {
          if (audioContext?.state !== 'running') {
            setStatus('Start Audio before playing a note.', 'warning');
            return;
          }
          const token = `activation:${control.dataset.parameterId}`;
          holdKeyboardPad(action, token);
          activeKeyboardPads.get(token).releaseAt = audioContext.currentTime + 0.12;
        }
        return;
      }
      const holdTransport = control && isSubharmoniconHoldTransport(
        control.dataset.instrumentId,
        control.dataset.parameterId
      );
      if (!holdTransport || event.detail === 0) {
        handleControlAction(action, holdTransport);
      }
      return;
    }
    const button = event.target.closest('.jack');
    if (button) handleJackClick(button);
  });

  cableLayer.addEventListener('click', event => {
    const patchId = event.target.dataset.patchId;
    if (!patchId) return;
    const removedPatch = projectState.patches.find(patch => patch.id === patchId);
    const cablesBefore = projectState.patches.map(patch => ({ ...patch }));
    projectState.patches = projectState.patches.filter(patch => patch.id !== patchId);
    recordCableChange('removing that cable', cablesBefore);
    syncAudioPatches();
    updateSummary();
    drawCables();
    setStatus('Cable removed.', 'success');
    if (removedPatch) {
      const fromJack = jackFor(removedPatch.from);
      const toJack = jackFor(removedPatch.to);
      recordAction({
        type: 'patch-removed',
        patch: removedPatch,
        fromName: fromJack.name,
        toName: toJack.name,
        restoredRouting: toJack.breaksNormal
          ? `Restored ${toJack.breaksNormal}.`
          : toJack.replaces
            ? `Restored ${toJack.replaces}.`
            : ''
      });
    }
  });

  document.querySelector('#saveBtn').addEventListener('click', saveLocal);
  document.querySelector('#loadBtn').addEventListener('click', loadLocal);
  document.querySelector('#exportBtn').addEventListener('click', exportProject);
  document.querySelector('#importBtn').addEventListener('click', () => importInput.click());
  dismissHintButton.addEventListener('click', () => hideCoachCue('dismiss'));
  hintShowButton.addEventListener('click', () => {
    revealElements((activeCoachCue?.targets ?? []).map(coachTargetElement));
  });
  targetLocator.addEventListener('click', event => {
    const chip = event.target.closest('[data-locator]');
    if (chip) revealElements(locatorEntries[Number(chip.dataset.locator)]?.elements ?? []);
  });
  patchAssistSuggestions.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const separator = button.dataset.endpoint.indexOf('/');
    const endpoint = {
      instrumentId: button.dataset.endpoint.slice(0, separator),
      jackId: button.dataset.endpoint.slice(separator + 1)
    };
    const element = jackElement(endpoint);
    if (!element) return;
    if (button.dataset.action === 'connect') {
      handleJackClick(element);
      return;
    }
    const source = selectedOutput ?? selectedInput;
    if (selectedOutput) previewInput = endpoint;
    else if (selectedInput) previewOutput = endpoint;
    refreshSelection();
    scheduleCableDraw();
    revealElements([element, source && jackElement(source)]);
  });
  rack.addEventListener('animationend', event => {
    if (event.animationName === 'located-pulse') event.target.classList?.remove('is-located');
  });
  hintFeedback.addEventListener('click', event => {
    const verdict = event.target.closest('[data-verdict]')?.dataset.verdict;
    if (verdict) coachControl({ type: 'cue-feedback', verdict });
  });
  hintAlternates.addEventListener('click', event => {
    const cueId = event.target.closest('[data-cue-id]')?.dataset.cueId;
    if (cueId) coachControl({ type: 'promote-alternate', cueId });
  });
  guidanceSelect.addEventListener('change', () => {
    coachControl({ type: 'set-guidance', level: guidanceSelect.value });
  });
  resetCoachButton.addEventListener('click', () => {
    coachControl({ type: 'reset-progress' });
    setStatus('Coaching progress reset.', 'success');
  });
  recipeList.addEventListener('click', event => {
    const recipeId = event.target.closest('[data-recipe-id]')?.dataset.recipeId;
    if (recipeId) coachControl({ type: 'start-recipe', recipeId });
  });
  stopRecipeButton.addEventListener('click', () => coachControl({ type: 'stop-recipe' }));
  recipePathways.addEventListener('click', event => {
    const [recipeId, itemId] = event.target.closest('[data-build-on]')?.dataset.buildOn.split('|') ?? [];
    if (recipeId && itemId) coachControl({ type: 'show-build-on', recipeId, itemId });
  });
  cancelPatchButton.addEventListener('click', () => cancelPatchSelection());
  importInput.addEventListener('change', () => {
    if (importInput.files?.[0]) importProject(importInput.files[0]);
  });
  document.querySelector('#clearBtn').addEventListener('click', () => {
    const cablesBefore = projectState.patches.map(patch => ({ ...patch }));
    projectState.patches = [];
    recordCableChange('Clear Cables', cablesBefore);
    clearPatchSelectionState();
    refreshSelection();
    updateSummary();
    drawCables();
    syncAudioPatches();
    setStatus('All patch cables cleared.', 'success');
    hideCoachCue();
    recordAction({
      type: 'project', title: 'Patch cleared',
      message: 'All external cables are gone; each instrument is back on its internal normals.',
      next: 'Start with one output and one clearly audible destination.'
    });
    showStarterHint();
  });
  document.querySelector('#modeBtn').addEventListener('click', () => {
    projectState.ui.mode = projectState.ui.mode === 'practice' ? 'perform' : 'practice';
    updateSummary();
    setStatus(`Switched to ${projectState.ui.mode} mode.`, 'success');
    if (projectState.ui.mode === 'practice') {
      recordAction({ type: 'practice-mode' });
      if (!activeCoachCue) showStarterHint();
    } else {
      recordAction({ type: 'perform-mode' });
    }
  });
  for (const tab of analysisTabs) {
    tab.addEventListener('click', () => {
      selectedAnalysisSource = tab.dataset.analysisSource;
      for (const candidate of analysisTabs) {
        candidate.setAttribute('aria-selected', String(candidate === tab));
      }
      clearAnalysisViews();
      const sourceName = selectedAnalysisSource === 'mix'
        ? 'rack mix'
        : appData.specs[selectedAnalysisSource].name;
      analysisReadout.value = audioContext
        ? `Inspecting ${sourceName}.`
        : `Start audio to inspect ${sourceName}.`;
      recordAction({ type: 'analysis-source', sourceName });
    });
  }
  startAudioButton.addEventListener('click', toggleAudio);
  undoButton.addEventListener('click', () => stepHistory('undo'));
  redoButton.addEventListener('click', () => stepHistory('redo'));
  keepButton.addEventListener('click', keepCheckpoint);
  returnButton.addEventListener('click', returnToCheckpoint);
  experimentStartButton.addEventListener('click', beginExperiment);
  experimentShowButton.addEventListener('click', showExperimentTarget);
  experimentCompareButton.addEventListener('click', compareExperiment);
  experimentKeepButton.addEventListener('click', keepExperimentResult);
  experimentRestoreButton.addEventListener('click', restoreExperimentBaseline);
  experimentSelect.addEventListener('change', () => {
    activeExperiment = null;
    experimentSetupBlockers = [];
    renderExperiment();
  });
  experimentPrediction.addEventListener('change', () => {
    if (!experimentIsActive() || !experimentPrediction.value) return;
    activeExperiment.session = experimentEngine.transition(activeExperiment.session, {
      type: 'predict', prediction: experimentPrediction.value
    });
    renderExperiment();
    recordAction({
      type: 'experiment-prediction',
      experimentId: activeExperiment.experiment.id,
      prediction: experimentPrediction.value
    });
  });
  intentButtons.addEventListener('click', event => {
    const intentId = event.target.closest('[data-intent-id]')?.dataset.intentId;
    if (intentId) offerVariations(intentId);
  });
  intentProposals.addEventListener('click', event => {
    const proposalId = event.target.closest('[data-apply-proposal]')?.dataset.applyProposal;
    if (proposalId) applyVariation(proposalId);
  });
  // Changing the scope or a lock changes the question, so the answer on screen is no
  // longer the answer to it.
  intentScope.addEventListener('change', clearVariationOffer);
  intentLockFields.addEventListener('change', event => {
    const lockId = event.target.dataset.lockId;
    if (!lockId) return;
    if (event.target.checked) variationLocks.add(lockId);
    else variationLocks.delete(lockId);
    clearVariationOffer();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || (!selectedOutput && !selectedInput)) return;
    event.preventDefault();
    cancelPatchSelection();
  });
  document.addEventListener('keydown', event => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    // Typed value entry and any other text field own their own undo stack.
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ||
      target?.isContentEditable) return;
    const key = event.key.toLowerCase();
    const direction = key === 'z'
      ? (event.shiftKey ? 'redo' : 'undo')
      : (key === 'y' && !event.shiftKey ? 'redo' : null);
    if (!direction) return;
    event.preventDefault();
    stepHistory(direction);
  });
  window.addEventListener('resize', scheduleCableDraw);
  window.addEventListener('scroll', scheduleCableDraw, true);
  window.visualViewport?.addEventListener('resize', scheduleCableDraw);
  window.visualViewport?.addEventListener('scroll', scheduleCableDraw);
  if (typeof ResizeObserver === 'function') {
    cableResizeObserver = new ResizeObserver(scheduleCableDraw);
    cableResizeObserver.observe(rackShell);
    cableResizeObserver.observe(rack);
  }
  document.fonts?.ready.then(() => {
    // Loaded fonts change legend widths without resizing the rack.
    jackNameFitWidth = -1;
    scheduleCableDraw();
  });

  try {
    assertRuntimeContract();
    renderRack();
    updateSummary();
    syncHistoryControls();
    syncCheckpointControls();
    renderVariationOffer();
    renderExperiment();
    persistCoachProgress();
    showStarterHint();
    clearAnalysisViews();
    requestAnimationFrame(renderAnalysisFrame);
    const directFile = location.protocol === 'file:';
    audioStatus.textContent = `Audio idle · ${directFile ? 'direct file' : location.protocol}`;
    setStatus(`Runtime contract loaded: ${allParametersCount()} stable parameters. Select an output to begin patching.`);
  } catch (error) {
    setStatus(error.message, 'error');
    startAudioButton.disabled = true;
  }
})();
