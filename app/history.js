'use strict';

// Bounded undo/redo for the two reversible edits the rack makes constantly: a control
// value and the set of patch cables. Everything here is pure, so the grouping rules can
// be tested without a browser. Applying an entry belongs to the caller.
//
// Deliberately out of scope for now: pattern edits, and load/import. Those replace state
// wholesale, so the caller clears the history instead of trying to reverse them.
(function exposeHistory(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_HISTORY = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const DEFAULT_LIMIT = 100;
  // Matches the patch log's run semantics, so an undo step covers the same span of a
  // wheel or arrow-key run that the log reports as one move.
  const STEP_GESTURES = new Set(['wheel', 'keyboard']);
  const STEP_RUN_MS = 750;

  const clonePatches = patches => patches.map(patch => ({ ...patch }));

  function createHistory({ limit = DEFAULT_LIMIT } = {}) {
    return Object.freeze({
      limit: Math.max(1, Math.round(limit)),
      entries: Object.freeze([]),
      // Index of the next entry an undo would reverse. Redo walks back up.
      position: 0
    });
  }

  const withEntries = (history, entries, position) => Object.freeze({
    limit: history.limit,
    entries: Object.freeze(entries),
    position
  });

  function canUndo(history) {
    return history.position > 0;
  }

  function canRedo(history) {
    return history.position < history.entries.length;
  }

  const numeric = value => typeof value === 'number' && Number.isFinite(value);

  // A monotonic wheel/key run on one control is one move to the player, so it is one
  // undo step. A reversal or a pause starts a new one: returning to where you started
  // is still something you did, and should be undoable on its own.
  function continuesRun(last, entry) {
    return Boolean(last) &&
      last.kind === 'parameter' && entry.kind === 'parameter' &&
      last.instrumentId === entry.instrumentId &&
      last.parameterId === entry.parameterId &&
      STEP_GESTURES.has(last.gesture) && last.gesture === entry.gesture &&
      numeric(last.at) && numeric(entry.at) &&
      entry.at >= last.at && entry.at - last.at <= STEP_RUN_MS &&
      Math.abs(last.after - entry.before) < 1e-9 &&
      Math.sign(last.after - last.before) === Math.sign(entry.after - entry.before);
  }

  function normalize(entry) {
    if (!entry || typeof entry !== 'object') throw new Error('A history entry must be an object.');
    if (entry.kind === 'parameter') {
      if (typeof entry.instrumentId !== 'string' || typeof entry.parameterId !== 'string') {
        throw new Error('A parameter entry needs instrumentId and parameterId.');
      }
      if (!numeric(entry.before) || !numeric(entry.after)) {
        throw new Error('A parameter entry needs finite before and after values.');
      }
      return Object.freeze({
        kind: 'parameter',
        instrumentId: entry.instrumentId,
        parameterId: entry.parameterId,
        label: entry.label ?? entry.parameterId,
        before: entry.before,
        after: entry.after,
        gesture: entry.gesture ?? null,
        at: numeric(entry.at) ? entry.at : null
      });
    }
    if (entry.kind === 'cables') {
      if (!Array.isArray(entry.before) || !Array.isArray(entry.after)) {
        throw new Error('A cables entry needs before and after patch arrays.');
      }
      return Object.freeze({
        kind: 'cables',
        label: entry.label ?? 'cables',
        before: Object.freeze(clonePatches(entry.before)),
        after: Object.freeze(clonePatches(entry.after)),
        at: numeric(entry.at) ? entry.at : null
      });
    }
    throw new Error(`Unknown history entry kind: ${entry.kind}`);
  }

  // A no-op change is not a move. Undoing one would look broken.
  function isNoop(entry) {
    if (entry.kind === 'parameter') return entry.before === entry.after;
    if (entry.kind === 'cables') {
      return entry.before.length === entry.after.length &&
        entry.before.every((patch, index) => patch.id === entry.after[index]?.id);
    }
    return false;
  }

  function record(history, rawEntry) {
    const entry = normalize(rawEntry);
    if (isNoop(entry)) return history;
    // A new edit abandons the redo branch: there is no longer one future to return to.
    const kept = history.entries.slice(0, history.position);
    const last = kept[kept.length - 1];
    if (continuesRun(last, entry)) {
      const merged = Object.freeze({ ...last, after: entry.after, at: entry.at });
      const entries = [...kept.slice(0, -1), merged];
      return withEntries(history, entries, entries.length);
    }
    const entries = [...kept, entry];
    const overflow = Math.max(0, entries.length - history.limit);
    const bounded = overflow ? entries.slice(overflow) : entries;
    return withEntries(history, bounded, bounded.length);
  }

  // Returns the entry to reverse along with the advanced history, or null at the end.
  function undo(history) {
    if (!canUndo(history)) return null;
    const position = history.position - 1;
    return { history: withEntries(history, [...history.entries], position), entry: history.entries[position] };
  }

  function redo(history) {
    if (!canRedo(history)) return null;
    const entry = history.entries[history.position];
    return { history: withEntries(history, [...history.entries], history.position + 1), entry };
  }

  function clear(history) {
    return withEntries(history, [], 0);
  }

  // The label the caller shows on the button, so the player knows what is about to move.
  function describe(history, direction) {
    const entry = direction === 'undo'
      ? (canUndo(history) ? history.entries[history.position - 1] : null)
      : (canRedo(history) ? history.entries[history.position] : null);
    if (!entry) return null;
    return entry.label;
  }

  return Object.freeze({
    createHistory, record, undo, redo, clear, canUndo, canRedo, describe,
    STEP_RUN_MS
  });
}));
