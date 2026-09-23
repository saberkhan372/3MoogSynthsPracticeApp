'use strict';

// Bounded undo/redo for the reversible edits the rack makes: a control value, the set of
// patch cables, a group of settings applied together, and occasional pattern or
// whole-project restoration. Everything here is pure, so grouping and bounds can be
// tested without a browser. Applying an entry belongs to the caller.
//
// Momentary transport and played notes stay outside history. Pattern edits and
// whole-project replacements are serializable settings, so they participate.
(function exposeHistory(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_HISTORY = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const DEFAULT_LIMIT = 100;
  const DEFAULT_BYTE_LIMIT = 8 * 1024 * 1024;
  // Matches the patch log's run semantics, so an undo step covers the same span of a
  // wheel or arrow-key run that the log reports as one move.
  const STEP_GESTURES = new Set(['wheel', 'keyboard']);
  const STEP_RUN_MS = 750;

  const clonePatches = patches => patches.map(patch => ({ ...patch }));
  const cloneProject = project => JSON.parse(JSON.stringify(project));

  // Count UTF-8 bytes without depending on TextEncoder, which keeps the pure module
  // usable in both the direct-file browser and Node's VM tests.
  function utf8ByteLength(value) {
    let bytes = 0;
    for (const character of value) {
      const codePoint = character.codePointAt(0);
      bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    }
    return bytes;
  }

  const entryBytes = entry => utf8ByteLength(JSON.stringify(entry));
  const totalBytes = entries => entries.reduce((sum, entry) => sum + entryBytes(entry), 0);

  function createHistory({ limit = DEFAULT_LIMIT, byteLimit = DEFAULT_BYTE_LIMIT } = {}) {
    return Object.freeze({
      limit: Math.max(1, Math.round(limit)),
      byteLimit: Math.max(1, Math.round(byteLimit)),
      entries: Object.freeze([]),
      bytes: 0,
      // Index of the next entry an undo would reverse. Redo walks back up.
      position: 0,
      // Whether the newest entry is still the run in progress, so a continuing gesture
      // may extend it. Traversing the history closes it: see `record`.
      openRun: false
    });
  }

  const withEntries = (history, entries, position, openRun) => Object.freeze({
    limit: history.limit,
    byteLimit: history.byteLimit,
    entries: Object.freeze(entries),
    bytes: totalBytes(entries),
    position,
    openRun
  });

  function boundEntries(history, entries) {
    let bytes = totalBytes(entries);
    if (entries.length === 1 && bytes > history.byteLimit) {
      throw new Error(`A history entry exceeds the ${history.byteLimit}-byte history limit.`);
    }
    let start = 0;
    while (entries.length - start > history.limit || bytes > history.byteLimit) {
      bytes -= entryBytes(entries[start]);
      start += 1;
    }
    return start ? entries.slice(start) : entries;
  }

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
    if (entry.kind === 'settings') {
      // Several controls moved as one deliberate act, so they reverse as one. A player
      // who tried a variation wants the variation back, not one knob of it.
      if (!Array.isArray(entry.values) || entry.values.length === 0) {
        throw new Error('A settings entry needs a non-empty values array.');
      }
      const values = entry.values.map(value => {
        if (typeof value?.instrumentId !== 'string' || typeof value?.parameterId !== 'string') {
          throw new Error('A settings value needs instrumentId and parameterId.');
        }
        if (!numeric(value.before) || !numeric(value.after)) {
          throw new Error('A settings value needs finite before and after values.');
        }
        return Object.freeze({
          instrumentId: value.instrumentId,
          parameterId: value.parameterId,
          label: value.label ?? value.parameterId,
          before: value.before,
          after: value.after
        });
      });
      return Object.freeze({
        kind: 'settings',
        label: entry.label ?? 'settings',
        values: Object.freeze(values),
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
    if (entry.kind === 'project') {
      if (!entry.before || typeof entry.before !== 'object' ||
        !entry.after || typeof entry.after !== 'object') {
        throw new Error('A project entry needs before and after project objects.');
      }
      return Object.freeze({
        kind: 'project',
        label: entry.label ?? 'project',
        before: cloneProject(entry.before),
        after: cloneProject(entry.after),
        at: numeric(entry.at) ? entry.at : null
      });
    }
    if (entry.kind === 'pattern') {
      if (!entry.before || typeof entry.before !== 'object' ||
        !entry.after || typeof entry.after !== 'object') {
        throw new Error('A pattern entry needs before and after pattern-bank objects.');
      }
      return Object.freeze({
        kind: 'pattern',
        label: entry.label ?? 'Mother-32 pattern edit',
        before: cloneProject(entry.before),
        after: cloneProject(entry.after),
        at: numeric(entry.at) ? entry.at : null
      });
    }
    throw new Error(`Unknown history entry kind: ${entry.kind}`);
  }

  // A no-op change is not a move. Undoing one would look broken.
  function isNoop(entry) {
    if (entry.kind === 'parameter') return entry.before === entry.after;
    if (entry.kind === 'settings') return entry.values.every(value => value.before === value.after);
    if (entry.kind === 'cables') {
      return entry.before.length === entry.after.length &&
        entry.before.every((patch, index) => patch.id === entry.after[index]?.id);
    }
    if (entry.kind === 'project' || entry.kind === 'pattern') {
      return JSON.stringify(entry.before) === JSON.stringify(entry.after);
    }
    return false;
  }

  function record(history, rawEntry) {
    const entry = normalize(rawEntry);
    if (isNoop(entry)) return history;
    // A new edit abandons the redo branch: there is no longer one future to return to.
    const kept = history.entries.slice(0, history.position);
    const last = kept[kept.length - 1];
    // Only a run left open by the previous edit can absorb this one. An undo or redo
    // closed it, and the value it restored is a starting point the player expects to
    // come back to, so merging across that boundary would skip past it.
    if (history.openRun && continuesRun(last, entry)) {
      const merged = Object.freeze({ ...last, after: entry.after, at: entry.at });
      const entries = boundEntries(history, [...kept.slice(0, -1), merged]);
      return withEntries(history, entries, entries.length, true);
    }
    const entries = [...kept, entry];
    const bounded = boundEntries(history, entries);
    return withEntries(history, bounded, bounded.length, true);
  }

  // Returns the entry to reverse along with the advanced history, or null at the end.
  function undo(history) {
    if (!canUndo(history)) return null;
    const position = history.position - 1;
    return {
      history: withEntries(history, [...history.entries], position, false),
      entry: history.entries[position]
    };
  }

  function redo(history) {
    if (!canRedo(history)) return null;
    const entry = history.entries[history.position];
    return {
      history: withEntries(history, [...history.entries], history.position + 1, false),
      entry
    };
  }

  function clear(history) {
    return withEntries(history, [], 0, false);
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
    STEP_RUN_MS, DEFAULT_BYTE_LIMIT
  });
}));
