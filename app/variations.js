'use strict';

// Musical intentions: "Gentler", "More movement", "Tighter rhythm", and "Surprise me".
// Given the rack as it stands, an authored catalog, and a seed, this proposes up to a
// few concrete settings changes. It proposes; it never applies. The caller applies a
// chosen proposal as one undoable transaction.
//
// Everything here is pure so the rules can be tested without a browser: the same rack,
// intent, locks, scope, and seed always produce the same proposals.
//
// Deliberately out of scope: cables, transport, patterns, and switch positions. A
// variation moves continuous panel controls only, so it can never quietly rewire a
// patch, start a sequencer, or rewrite a pattern the player wrote.
(function exposeVariations(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_VARIATIONS = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const DEFAULT_LIMIT = 3;
  // Below this a change is not worth offering: the control is already where the
  // variation wanted to take it, and applying it would look like nothing happened.
  const MIN_CHANGE = 0.01;
  const CONFIDENCE_RANK = Object.freeze({ 'manual-stated': 0, authored: 1, exploratory: 2 });

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const key = (instrumentId, parameterId) => `${instrumentId}:${parameterId}`;
  const percent = value => `${Math.round(value * 100)}%`;

  // Deterministic, seed-addressable noise. Proposals must be reproducible from the
  // seed the player can see, so nothing here may read the clock.
  function hashString(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The signature makes proposals depend on the patch as well as the seed: the same
  // seed on a different rack is a different question, and should get a different answer.
  function rackSignature(rack, controlIds) {
    const parts = [];
    for (const id of controlIds) {
      const [instrumentId, parameterId] = id.split(/:(.*)/s);
      const value = rack.instruments?.[instrumentId]?.parameters?.[parameterId];
      parts.push(`${id}=${Number.isFinite(value) ? value.toFixed(4) : 'x'}`);
    }
    for (const patch of rack.patches ?? []) {
      parts.push(`${patch.from?.instrumentId}:${patch.from?.jackId}>${patch.to?.instrumentId}:${patch.to?.jackId}`);
    }
    return parts.join('|');
  }

  function validateCatalog(catalog, manifests) {
    const kinds = new Map();
    for (const [instrumentId, manifest] of Object.entries(manifests ?? {})) {
      for (const parameter of manifest.parameters ?? []) {
        kinds.set(key(instrumentId, parameter.id), parameter.kind);
      }
    }
    const known = id => kinds.has(id);
    for (const lock of catalog.locks ?? []) {
      for (const field of lock.fields ?? []) {
        if (!known(field)) throw new Error(`Lock ${lock.id} names an unknown control: ${field}`);
      }
    }
    for (const intent of catalog.intents ?? []) {
      for (const candidate of intent.candidates ?? []) {
        if (!candidate.changes?.length) {
          throw new Error(`Candidate ${candidate.id} proposes no changes.`);
        }
        for (const change of candidate.changes) {
          const id = key(change.instrumentId, change.controlId);
          if (!known(id)) throw new Error(`Candidate ${candidate.id} names an unknown control: ${id}`);
          // A stepped or switch control jumps between labelled positions. Nudging one by
          // a fraction would misreport what changed, so variations stay on knobs.
          if (kinds.get(id) !== 'continuous') {
            throw new Error(`Candidate ${candidate.id} moves ${id}, which is ${kinds.get(id)}, not continuous.`);
          }
          if (!(change.bounds?.min >= 0) || !(change.bounds?.max <= 1) ||
            change.bounds.min >= change.bounds.max) {
            throw new Error(`Candidate ${candidate.id} has bounds outside 0-1 for ${id}.`);
          }
          if (!(change.delta?.min > 0) || !(change.delta?.max >= change.delta.min)) {
            throw new Error(`Candidate ${candidate.id} has an unusable delta for ${id}.`);
          }
          if (!['up', 'down', 'either', 'toward-center', 'away-from-center'].includes(change.direction)) {
            throw new Error(`Candidate ${candidate.id} has an unknown direction for ${id}.`);
          }
        }
      }
    }
  }

  function createVariations(options = {}) {
    const catalog = options.catalog ?? { locks: [], intents: [] };
    validateCatalog(catalog, options.manifests);

    const controlNames = options.controlNames ?? {};
    const instrumentNames = options.instrumentNames ?? {};
    const jackNames = options.jackNames ?? {};
    const format = typeof options.format === 'function' ? options.format : (() => null);

    const label = (instrumentId, parameterId) => [
      instrumentNames[instrumentId] ?? instrumentId,
      controlNames[key(instrumentId, parameterId)]?.name ?? parameterId
    ].join(' ');
    const shown = (instrumentId, parameterId, value) =>
      format(instrumentId, parameterId, value) ?? percent(value);

    const locks = (catalog.locks ?? []).map(lock => Object.freeze({
      id: lock.id,
      label: lock.label,
      summary: lock.summary,
      fields: Object.freeze([...(lock.fields ?? [])])
    }));
    const lockById = new Map(locks.map(lock => [lock.id, lock]));
    const intents = (catalog.intents ?? []).map(intent => Object.freeze({
      id: intent.id, label: intent.label, summary: intent.summary
    }));
    const intentById = new Map((catalog.intents ?? []).map(intent => [intent.id, intent]));
    const touchedControls = [...new Set((catalog.intents ?? []).flatMap(intent => (
      (intent.candidates ?? []).flatMap(candidate => candidate.changes.map(
        change => key(change.instrumentId, change.controlId)
      ))
    )))].sort();

    const valueOf = (rack, instrumentId, parameterId) => {
      const value = rack.instruments?.[instrumentId]?.parameters?.[parameterId];
      return Number.isFinite(value) ? value : null;
    };

    const cableInto = (rack, instrumentId, jackId) => (rack.patches ?? []).some(patch =>
      patch.to?.instrumentId === instrumentId && patch.to?.jackId === jackId);

    const hasCable = (rack, requirement) => (rack.patches ?? []).some(patch => (
      patch.from?.instrumentId === requirement.from?.instrumentId &&
      patch.from?.jackId === requirement.from?.jackId &&
      patch.to?.instrumentId === requirement.to?.instrumentId &&
      patch.to?.jackId === requirement.to?.jackId
    ));

    // Prerequisites answer one question: would this change do anything the player can
    // hear, on this patch? A failed prerequisite is reported, never silently dropped.
    function checkRequirement(requirement, rack, change) {
      const instrumentId = requirement.instrumentId ?? change.instrumentId;
      const parameterId = requirement.controlId ?? change.controlId;
      if (requirement.kind === 'any-of') {
        const results = (requirement.requires ?? []).map(inner => checkRequirement(inner, rack, change));
        const passed = results.find(result => result.ok);
        // Every way in failed, so the player is told all of them rather than the first.
        return passed ?? { ok: false, reason: results.map(result => result.reason).join('; ') };
      }
      if (requirement.kind === 'all-of') {
        const results = (requirement.requires ?? []).map(inner => checkRequirement(inner, rack, change));
        const failed = results.find(result => !result.ok);
        return failed ?? {
          ok: true,
          reason: results.map(result => result.reason).filter(Boolean).join(', and ')
        };
      }
      if (requirement.kind === 'cable') {
        return hasCable(rack, requirement)
          ? { ok: true, reason: requirement.because ?? 'the named cable is connected' }
          : { ok: false, reason: requirement.missing ?? 'the named cable is not connected' };
      }
      if (requirement.kind === 'cable-into' || requirement.kind === 'no-cable-into') {
        const present = cableInto(rack, requirement.instrumentId, requirement.jackId);
        const wanted = requirement.kind === 'cable-into';
        const jack = [
          instrumentNames[requirement.instrumentId] ?? requirement.instrumentId,
          jackNames[key(requirement.instrumentId, requirement.jackId)]?.name ?? requirement.jackId
        ].join(' ');
        return present === wanted
          ? { ok: true, reason: requirement.because ?? '' }
          : {
            ok: false,
            reason: wanted ? `nothing is patched into ${jack}` : `${jack} already has a cable`
          };
      }
      const value = valueOf(rack, instrumentId, parameterId);
      if (value === null) return { ok: false, reason: `${label(instrumentId, parameterId)} is not on this rack` };
      const name = label(instrumentId, parameterId);
      if (requirement.kind === 'value-at-most') {
        return value <= requirement.value
          ? { ok: true, reason: `${name} is at ${shown(instrumentId, parameterId, value)}, so there is room` }
          : { ok: false, reason: `${name} is already past ${shown(instrumentId, parameterId, requirement.value)}` };
      }
      if (requirement.kind === 'value-at-least') {
        return value >= requirement.value
          ? { ok: true, reason: `${name} is at ${shown(instrumentId, parameterId, value)}, so there is something to change` }
          : { ok: false, reason: `${name} is only at ${shown(instrumentId, parameterId, value)}` };
      }
      throw new Error(`Unknown requirement kind: ${requirement.kind}`);
    }

    // One change, resolved against the rack: the value it would land on, or why not.
    function resolveChange(change, rack, activeLocks, random) {
      const id = key(change.instrumentId, change.controlId);
      const name = label(change.instrumentId, change.controlId);
      const lock = activeLocks.find(active => active.fields.includes(id));
      if (lock) return { ok: false, reason: `${lock.label} holds ${name}` };
      const from = valueOf(rack, change.instrumentId, change.controlId);
      if (from === null) return { ok: false, reason: `${name} is not on this rack` };
      const reasons = [];
      for (const requirement of change.requires ?? []) {
        const checked = checkRequirement(requirement, rack, change);
        if (!checked.ok) return { ok: false, reason: checked.reason };
        if (checked.reason) reasons.push(checked.reason);
      }
      const span = change.delta.max - change.delta.min;
      const size = change.delta.min + (span > 0 ? random() * span : 0);
      const center = Number.isFinite(change.center) ? change.center : 0.5;
      const direction = change.direction === 'either'
        ? (random() < 0.5 ? -1 : 1)
        : change.direction === 'toward-center'
          ? (from < center ? 1 : -1)
          : change.direction === 'away-from-center'
            ? (from < center ? -1 : from > center ? 1 : (random() < 0.5 ? -1 : 1))
            : (change.direction === 'up' ? 1 : -1);
      let requested = from + size * direction;
      // A bipolar depth reaches silence at its centre. "Gentler" must stop there rather
      // than crossing through zero and growing again with the opposite polarity.
      if (change.direction === 'toward-center') {
        requested = direction > 0 ? Math.min(center, requested) : Math.max(center, requested);
      }
      const to = clamp01(Math.min(change.bounds.max, Math.max(change.bounds.min, requested)));
      if (Math.abs(to - from) < MIN_CHANGE) {
        return { ok: false, reason: `${name} is already as far as this variation goes` };
      }
      // The bounds restrict the move; they never extend it. A control parked outside the
      // range this variation works in is left alone rather than yanked into it.
      if (Math.abs(to - from) > change.delta.max || Math.sign(to - from) !== direction) {
        return { ok: false, reason: `${name} is outside the range this variation works in` };
      }
      if (change.direction === 'toward-center' && Math.abs(to - center) >= Math.abs(from - center)) {
        return { ok: false, reason: `${name} is already near its neutral point` };
      }
      if (change.direction === 'away-from-center' && Math.abs(to - center) <= Math.abs(from - center)) {
        return { ok: false, reason: `${name} cannot move farther from its neutral point in this range` };
      }
      if (change.direction === 'toward-center') {
        reasons.push(`${name} moves toward its ${shown(change.instrumentId, change.controlId, center)} neutral point`);
      } else if (change.direction === 'away-from-center') {
        reasons.push(`${name} moves farther from its ${shown(change.instrumentId, change.controlId, center)} neutral point`);
      }
      return {
        ok: true,
        reasons,
        change: Object.freeze({
          instrumentId: change.instrumentId,
          parameterId: change.controlId,
          label: name,
          from,
          to,
          fromText: shown(change.instrumentId, change.controlId, from),
          toText: shown(change.instrumentId, change.controlId, to)
        })
      };
    }

    function propose(request = {}) {
      const intent = intentById.get(request.intentId);
      if (!intent) throw new Error(`Unknown intent: ${request.intentId}`);
      const rack = request.rack ?? {};
      const scope = request.scope ?? 'rack';
      const seed = Number.isFinite(request.seed) ? Math.trunc(request.seed) : 0;
      const limit = Number.isInteger(request.limit) && request.limit > 0 ? request.limit : DEFAULT_LIMIT;
      const activeLocks = (request.locks ?? [])
        .map(lockId => lockById.get(lockId))
        .filter(Boolean);
      const signature = rackSignature(rack, touchedControls);

      const offered = [];
      const blocked = [];
      let outOfScope = 0;
      for (const candidate of intent.candidates ?? []) {
        if (scope !== 'rack' && candidate.changes.some(change => change.instrumentId !== scope)) {
          outOfScope++;
          continue;
        }
        // Each candidate draws from its own stream, so one candidate becoming available
        // does not shift the random numbers the others would have used. Without this the
        // same seed would produce different values as the rack changes around it.
        const random = mulberry32(hashString(`${seed}|${intent.id}|${scope}|${candidate.id}|${signature}`));
        const resolved = candidate.changes.map(change => resolveChange(change, rack, activeLocks, random));
        const refused = resolved.find(result => !result.ok);
        if (refused) {
          blocked.push(Object.freeze({ id: candidate.id, title: candidate.title, reason: refused.reason }));
          continue;
        }
        const headroom = resolved.reduce((total, result) =>
          total + Math.abs(result.change.to - result.change.from), 0);
        offered.push({
          id: candidate.id,
          title: candidate.title,
          why: candidate.why,
          listenFor: candidate.listenFor,
          // Nothing here moves a cable. Saying so is part of the offer: the player can
          // tell a settings change from a rewiring without reading the diff.
          routes: 'No cables change.',
          confidence: candidate.confidence ?? 'authored',
          changes: resolved.map(result => result.change),
          because: resolved.flatMap(result => result.reasons),
          headroom,
          order: hashString(`${seed}|${candidate.id}|${signature}`)
        });
      }

      offered.sort((left, right) => (
        (CONFIDENCE_RANK[left.confidence] ?? 9) - (CONFIDENCE_RANK[right.confidence] ?? 9) ||
        (intent.seeded ? left.order - right.order : right.headroom - left.headroom) ||
        (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
      ));

      const proposals = take(offered, limit, Boolean(intent.seeded)).map(proposal => Object.freeze({
        id: proposal.id,
        title: proposal.title,
        why: proposal.why,
        listenFor: proposal.listenFor,
        routes: proposal.routes,
        changes: Object.freeze(proposal.changes),
        because: Object.freeze(proposal.because)
      }));

      return Object.freeze({
        intentId: intent.id,
        label: intent.label,
        summary: intent.summary,
        scope,
        seed,
        proposals: Object.freeze(proposals),
        blocked: Object.freeze(blocked),
        // With nothing to offer, say which lock or which setting stood in the way. A
        // silently empty list would read as the lock having been ignored.
        explanation: proposals.length ? null : explain(intent, activeLocks, blocked, outOfScope)
      });
    }

    // A seeded draw that lands three nudges on one instrument is a poorer offer than
    // one that spreads them, so the first pass prefers instruments not yet represented.
    function take(offered, limit, spread) {
      if (!spread) return offered.slice(0, limit);
      const picked = [];
      const seen = new Set();
      for (const pass of [0, 1]) {
        for (const proposal of offered) {
          if (picked.length >= limit || picked.includes(proposal)) continue;
          const instrumentId = proposal.changes[0].instrumentId;
          if (pass === 0 && seen.has(instrumentId)) continue;
          picked.push(proposal);
          seen.add(instrumentId);
        }
      }
      return picked;
    }

    function explain(intent, activeLocks, blocked, outOfScope) {
      if (!blocked.length && outOfScope) {
        return `Every ${intent.label} variation changes another instrument. Widen the scope to the whole rack.`;
      }
      if (!blocked.length) return `There are no ${intent.label} variations for this rack yet.`;
      const byLock = activeLocks
        .map(lock => ({ lock, count: blocked.filter(item => item.reason.startsWith(lock.label)).length }))
        .filter(item => item.count > 0);
      const held = byLock.map(item => `${item.lock.label} holds ${item.count} of them`).join(', ');
      const reasons = [...new Set(blocked.map(item => item.reason))].slice(0, 2).join('; ');
      const tail = outOfScope ? ` ${outOfScope} more change another instrument.` : '';
      return held
        ? `No ${intent.label} variation is available here: ${held}. Unlock it or change the scope.${tail}`
        : `No ${intent.label} variation is available here: ${reasons}.${tail}`;
    }

    return Object.freeze({
      intents: Object.freeze(intents),
      locks: Object.freeze(locks),
      propose
    });
  }

  return Object.freeze({ createVariations, MIN_CHANGE });
}));
