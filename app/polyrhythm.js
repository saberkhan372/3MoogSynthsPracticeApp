'use strict';

(function exposePolyrhythm(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_POLYRHYTHM = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const lcm2 = (a, b) => (a / gcd(a, b)) * b;
  const lcmAll = values => values.reduce(lcm2, 1);

  function repeatHorizon(rhythms) {
    const active = rhythms.filter(rhythm => rhythm.seq1 || rhythm.seq2);
    if (active.length === 0) return null;

    const masterCycle = lcmAll(active.map(rhythm => rhythm.divisor));
    const edgeCount = route => {
      const edges = new Set();
      for (const rhythm of active) {
        if (!rhythm[route]) continue;
        for (let tick = rhythm.divisor; tick <= masterCycle; tick += rhythm.divisor) {
          edges.add(tick);
        }
      }
      return edges.size;
    };
    const seq1Edges = edgeCount('seq1');
    const seq2Edges = edgeCount('seq2');
    const cyclesToReset = edges => edges === 0 ? 1 : 4 / gcd(4, edges);

    return Object.freeze({
      ticks: masterCycle * lcm2(
        cyclesToReset(seq1Edges),
        cyclesToReset(seq2Edges)
      ),
      masterCycle,
      edges: Object.freeze([seq1Edges, seq2Edges])
    });
  }

  function repeatSeconds(rhythms, bpm) {
    const horizon = repeatHorizon(rhythms);
    return horizon === null ? null : horizon.ticks / bpm * 60;
  }

  return Object.freeze({ repeatHorizon, repeatSeconds });
}));
