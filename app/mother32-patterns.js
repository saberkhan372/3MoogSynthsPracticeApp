'use strict';

(function exposePatterns(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_MOTHER32_PATTERNS = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function integer(value, min, max, label) {
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`${label} must be an integer from ${min} to ${max}.`);
    }
    return value;
  }
  function createPattern() {
    return { length: 8, steps: Array.from({ length: 32 }, () => ({
      note: 33, gateLength: 4, rest: false, glide: false
    })) };
  }
  function createBank() { return { selected: 0, patterns: {} }; }
  function normalizePattern(value) {
    if (!record(value)) throw new Error('Mother-32 pattern must be an object.');
    const length = integer(value.length, 1, 32, 'Pattern length');
    if (!Array.isArray(value.steps) || value.steps.length !== 32) {
      throw new Error('Mother-32 pattern must store exactly 32 steps.');
    }
    const steps = value.steps.map((step, index) => {
      if (!record(step) || typeof step.rest !== 'boolean' || typeof step.glide !== 'boolean') {
        throw new Error(`Step ${index + 1} needs boolean rest and glide flags.`);
      }
      return {
        note: integer(step.note, 0, 105, `Step ${index + 1} note`),
        gateLength: integer(step.gateLength, 1, 8, `Step ${index + 1} gate length`),
        rest: step.rest, glide: step.glide
      };
    });
    return { length, steps };
  }
  function normalizeBank(value) {
    // Additive v1 migration: old project saves contain no pattern bank.
    if (value === undefined) return createBank();
    if (!record(value) || !record(value.patterns)) throw new Error('Invalid Mother-32 pattern bank.');
    const selected = integer(value.selected, 0, 63, 'Selected pattern');
    const patterns = {};
    const entries = Object.entries(value.patterns);
    if (entries.length > 64) throw new Error('Mother-32 supports 64 patterns.');
    for (const [key, pattern] of entries) {
      if (!/^(?:[0-9]|[1-5][0-9]|6[0-3])$/.test(key)) throw new Error('Invalid pattern slot.');
      patterns[key] = normalizePattern(pattern);
    }
    return { selected, patterns };
  }
  function activePattern(bank) { return bank.patterns[bank.selected] ?? createPattern(); }
  function toSteps(pattern) {
    return pattern.steps.slice(0, pattern.length).map(step => ({
      // Existing core reference is 110 Hz (A2 / MIDI 45) with FREQUENCY centered.
      pitchCv: (step.note - 45) / 12,
      gateLength: step.gateLength, rest: step.rest, glide: step.glide
    }));
  }
  function noteName(note) {
    return ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][note % 12] +
      (Math.floor(note / 12) - 1);
  }
  return Object.freeze({ createPattern, createBank, normalizePattern, normalizeBank, activePattern, toSteps, noteName });
}));
