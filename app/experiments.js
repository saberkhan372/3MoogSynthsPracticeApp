'use strict';

(function exposeExperiments(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_EXPERIMENTS = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const ACTIVE_STATES = new Set(['trying', 'reflecting']);
  const TERMINAL_STATES = new Set(['kept', 'restored', 'abandoned']);
  const freeze = value => Object.freeze(value);

  function createExperiments(catalog) {
    const experiments = (catalog?.experiments ?? []).map(experiment => freeze(experiment));
    const byId = new Map(experiments.map(experiment => [experiment.id, experiment]));

    function valueOf(rack, predicate) {
      return rack.instruments?.[predicate.instrumentId]?.parameters?.[predicate.controlId];
    }

    function passes(predicate, rack, context) {
      if (predicate.kind === 'audio-running') return Boolean(context.audioRunning);
      if (predicate.kind === 'transport-running') {
        return Boolean(context.transport?.[predicate.instrumentId]?.running);
      }
      if (predicate.kind === 'any-of') {
        return predicate.requires.some(inner => passes(inner, rack, context));
      }
      if (predicate.kind === 'all-of') {
        return predicate.requires.every(inner => passes(inner, rack, context));
      }
      if (predicate.kind === 'no-cable-into') {
        return !(rack.patches ?? []).some(patch =>
          patch.to?.instrumentId === predicate.instrumentId && patch.to?.jackId === predicate.jackId);
      }
      if (predicate.kind === 'cable-present') {
        return (rack.patches ?? []).some(patch =>
          patch.from?.instrumentId === predicate.from.instrumentId &&
          patch.from?.jackId === predicate.from.jackId &&
          patch.to?.instrumentId === predicate.to.instrumentId &&
          patch.to?.jackId === predicate.to.jackId);
      }
      const value = valueOf(rack, predicate);
      if (!Number.isFinite(value)) return false;
      if (predicate.kind === 'value-at-least') return value >= predicate.value;
      if (predicate.kind === 'value-between') return value >= predicate.min && value <= predicate.max;
      throw new Error(`Unknown experiment prerequisite: ${predicate.kind}`);
    }

    function check(id, rack, context = {}) {
      const experiment = byId.get(id);
      if (!experiment) throw new Error(`Unknown experiment: ${id}`);
      return freeze({
        ready: experiment.prerequisites.every(item => passes(item, rack, context)),
        blockers: freeze(experiment.prerequisites
          .filter(item => !passes(item, rack, context))
          .map(item => item.blocker))
      });
    }

    function createSession(id, baselineValue) {
      if (!byId.has(id)) throw new Error(`Unknown experiment: ${id}`);
      if (!Number.isFinite(baselineValue)) throw new Error('An experiment baseline needs a finite target value.');
      return freeze({ id, state: 'offered', baselineValue, changedValue: null, prediction: null, view: 'current' });
    }

    function transition(session, event) {
      const experiment = byId.get(session?.id);
      if (!experiment) throw new Error('A valid experiment session is required.');
      if (!event || typeof event.type !== 'string') throw new Error('An experiment event is required.');
      if (event.type === 'begin' && session.state === 'offered') {
        return freeze({ ...session, state: 'trying' });
      }
      if (event.type === 'predict' && ACTIVE_STATES.has(session.state)) {
        const valid = experiment.predictions.some(prediction => prediction.id === event.prediction);
        if (!valid) throw new Error(`Unknown experiment prediction: ${event.prediction}`);
        return freeze({ ...session, prediction: event.prediction });
      }
      if (event.type === 'target-change' && ACTIVE_STATES.has(session.state)) {
        if (!Number.isFinite(event.value) || Math.abs(event.value - session.baselineValue) < experiment.target.minDelta) {
          return session;
        }
        return freeze({ ...session, state: 'reflecting', changedValue: event.value, view: 'changed' });
      }
      if (event.type === 'show-baseline' && session.state === 'reflecting') {
        return freeze({ ...session, view: 'baseline' });
      }
      if (event.type === 'show-changed' && session.state === 'reflecting') {
        return freeze({ ...session, view: 'changed' });
      }
      if (event.type === 'show-current' && session.state === 'reflecting') {
        return freeze({ ...session, view: 'current' });
      }
      if (event.type === 'keep' && session.state === 'reflecting') {
        return freeze({ ...session, state: 'kept', view: 'changed' });
      }
      if (event.type === 'restore' && ACTIVE_STATES.has(session.state)) {
        return freeze({ ...session, state: 'restored', view: 'baseline' });
      }
      if (event.type === 'abandon' && ACTIVE_STATES.has(session.state)) {
        return freeze({ ...session, state: 'abandoned' });
      }
      throw new Error(`Event ${event.type} is not valid while the experiment is ${session.state}.`);
    }

    return freeze({
      experiments: freeze(experiments),
      get: id => byId.get(id) ?? null,
      check,
      createSession,
      transition,
      isActive: session => Boolean(session && ACTIVE_STATES.has(session.state)),
      isTerminal: session => Boolean(session && TERMINAL_STATES.has(session.state))
    });
  }

  return freeze({ createExperiments });
}));
