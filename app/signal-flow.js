'use strict';

(function exposeSignalFlow(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_SIGNAL_FLOW = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  // Hidden-wiring view: draws each instrument's internal connections (normals) and explains
  // what a cable into any jack would replace or add to. Design: docs/design/09-visible-signal-flow.md.
  const SVG = 'http://www.w3.org/2000/svg';
  const PREFERENCE_KEY = 'moog-wiring-view-v1';

  function createSignalFlow({ specs, signalFlow }) {
    const entries = signalFlow?.normals ?? [];
    const entryByInput = new Map(entries.map(entry => [`${entry.instrumentId}:${entry.to}`, entry]));
    const jackFor = (instrumentId, jackId) =>
      specs[instrumentId]?.patchbay.jacks.find(jack => jack.id === jackId) ?? null;
    const sourceLabel = (instrumentId, sourceId) =>
      specs[instrumentId]?.internalSources?.find(source => source.id === sourceId)?.desc ??
      String(sourceId).replaceAll('-', ' ');

    function holds(condition, instrumentId, state) {
      if (!condition) return true;
      const value = state?.instruments?.[instrumentId]?.parameters?.[condition.targetId];
      if (!Number.isFinite(value)) return false;
      if ('atLeast' in condition) return value >= condition.atLeast;
      if ('atMost' in condition) return value <= condition.atMost;
      return value >= condition.between[0] && value <= condition.between[1];
    }
    const conditionMet = (entry, state) => holds(entry.condition, entry.instrumentId, state);
    // Whether a patched cable takes effect is separate from whether the internal
    // connection exists: Subharmonicon PWM cables also work on SQUARE.
    const cableWorks = (entry, state) => holds(entry.cableCondition, entry.instrumentId, state);

    function statusOf(entry, state) {
      const patched = (state?.patches ?? []).some(patch => (
        patch.to?.instrumentId === entry.instrumentId && patch.to?.jackId === entry.to
      ));
      const met = conditionMet(entry, state);
      return {
        patched,
        status: !met ? 'dormant' : patched ? 'replaced' : 'active',
        reason: !met
          ? `Needs ${entry.condition.label}`
          : patched ? 'Replaced by a cable' : `Active: ${entry.summary}`
      };
    }

    function wiring(state) {
      return entries.map(entry => Object.freeze({ ...entry, ...statusOf(entry, state) }));
    }

    function describeJack(instrumentId, jackId, state) {
      const jack = jackFor(instrumentId, jackId);
      const name = specs[instrumentId]?.name ?? instrumentId;
      if (!jack) return { title: name, lines: [] };
      const title = `${name} ${jack.name} · ${jack.dir === 'out' ? 'output' : 'input'}`;
      if (jack.dir === 'out') {
        return { title, lines: ['A cable here copies this signal; nothing internal is disconnected.'] };
      }
      const lines = [];
      const entry = entryByInput.get(`${instrumentId}:${jackId}`);
      if (entry) {
        const { patched, status } = statusOf(entry, state);
        const when = entry.condition ? ` (only when ${entry.condition.label})` : '';
        lines.push(`Replaces ${entry.summary}${when}.`);
        const effective = cableWorks(entry, state);
        if (patched && !effective) {
          lines.push(`This cable has no effect until ${entry.cableCondition.label}.`);
        } else if (status === 'dormant') {
          lines.push(patched
            ? 'That internal connection is off in this position, but this cable still takes effect.'
            : 'That internal connection is currently not in use.');
          if (!patched && !effective) lines.push(`A cable here has no effect until ${entry.cableCondition.label}.`);
        } else {
          lines.push(patched ? 'A cable is replacing it now.' : 'It is active now.');
        }
      }
      const sums = (jack.sumsWith ?? []).map(sourceId => sourceLabel(instrumentId, sourceId));
      if (sums.length) lines.push(`${entry ? 'Also adds' : 'Adds'} to ${sums.join(', ')}.`);
      if (!lines.length) lines.push("No internal connection: a cable here is this input's only source.");
      return { title, lines };
    }

    return Object.freeze({ wiring, describeJack });
  }

  function createWiringView({ flow, rack, button, jackAnchor, requestDraw, getState }) {
    let enabled = false;
    try {
      enabled = globalThis.localStorage?.getItem(PREFERENCE_KEY) === 'on';
    } catch {
      enabled = false;
    }
    const doc = rack.ownerDocument;
    const tip = doc.createElement('div');
    tip.className = 'wiring-tip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    doc.body.append(tip);

    const performing = () => doc.body.dataset.mode === 'perform';
    const syncButton = () => {
      if (!button) return;
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? 'Hide wiring' : 'Show wiring';
    };

    function controlAnchor(instrumentId, parameterId, bounds) {
      const control = rack.querySelector(
        `.control[data-instrument-id="${instrumentId}"][data-parameter-id="${parameterId}"]`
      );
      const target = control?.querySelector('.control__knob, .control__action') ?? control;
      if (!target) return null;
      const box = target.getBoundingClientRect();
      return { x: box.left + box.width / 2 - bounds.left, y: box.top + box.height / 2 - bounds.top };
    }

    const node = (name, attributes, text) => {
      const element = doc.createElementNS(SVG, name);
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
      if (text !== undefined) element.textContent = text;
      return element;
    };

    function draw(layer, bounds, state) {
      if (!enabled) return;
      for (const entry of flow.wiring(state)) {
        const to = jackAnchor({ instrumentId: entry.instrumentId, jackId: entry.to }, bounds);
        if (!to) continue;
        let from = null;
        if (entry.from.jack) from = jackAnchor({ instrumentId: entry.instrumentId, jackId: entry.from.jack }, bounds);
        else if (entry.from.control) from = controlAnchor(entry.instrumentId, entry.from.control, bounds);
        else from = { x: to.x - 34, y: to.y - 22 };
        if (!from) continue;
        // Internal wiring bows upward; patch cables sag downward, so the two never look alike.
        const distance = Math.hypot(to.x - from.x, to.y - from.y);
        const lift = Math.min(90, Math.max(22, distance * 0.2));
        const cx = (from.x + to.x) / 2;
        const cy = Math.min(from.y, to.y) - lift;
        const midX = (from.x + 2 * cx + to.x) / 4;
        const midY = (from.y + 2 * cy + to.y) / 4;
        const group = node('g', {
          class: `wiring-group wiring-group--${entry.status}`,
          'data-wiring-id': entry.id,
          'data-status': entry.status
        });
        const title = node('title', {}, `${entry.label}: ${entry.reason}`);
        group.append(
          title,
          node('path', {
            class: `wiring wiring--${entry.status}`,
            d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
          }),
          node('circle', { class: 'wiring-source', cx: from.x, cy: from.y, r: 3 }),
          node('circle', { class: `wiring-target wiring-target--${entry.status}`, cx: to.x, cy: to.y, r: 9 })
        );
        if (entry.status === 'replaced') {
          group.append(node('path', {
            class: 'wiring-cross',
            d: `M ${midX - 5} ${midY - 5} L ${midX + 5} ${midY + 5} M ${midX + 5} ${midY - 5} L ${midX - 5} ${midY + 5}`
          }));
        }
        // Short jack-to-jack lines sit inside the dense patchbay grid, where a label would
        // cover printed jack names; their hover tooltip and <title> carry the explanation.
        if (distance >= 70) {
          const text = entry.status === 'dormant' ? `${entry.label} · off` : entry.label;
          group.append(node('text', {
            class: `wiring-label wiring-label--${entry.status}`,
            x: midX,
            y: entry.status === 'replaced' ? midY - 9 : midY - 4
          }, text));
        }
        layer.append(group);
      }
    }

    function hideTip() {
      tip.hidden = true;
    }

    function showTip(jackElement) {
      if (!enabled || performing()) return hideTip();
      const { title, lines } = flow.describeJack(
        jackElement.dataset.instrumentId, jackElement.dataset.jackId, getState()
      );
      const heading = doc.createElement('strong');
      heading.textContent = title;
      tip.replaceChildren(heading, ...lines.map(line => {
        const paragraph = doc.createElement('span');
        paragraph.textContent = line;
        return paragraph;
      }));
      tip.hidden = false;
      const box = jackElement.getBoundingClientRect();
      const tipBox = tip.getBoundingClientRect();
      const view = doc.defaultView;
      const left = box.right + 10 + tipBox.width > view.innerWidth
        ? box.left - 10 - tipBox.width
        : box.right + 10;
      tip.style.left = `${Math.max(8, left)}px`;
      tip.style.top = `${Math.max(8, Math.min(view.innerHeight - tipBox.height - 8, box.top - 6))}px`;
    }

    function setEnabled(next) {
      enabled = Boolean(next);
      try {
        globalThis.localStorage?.setItem(PREFERENCE_KEY, enabled ? 'on' : 'off');
      } catch {
        // Storage can be unavailable; the toggle then lasts for this page only.
      }
      syncButton();
      hideTip();
      requestDraw();
    }

    button?.addEventListener('click', () => setEnabled(!enabled));
    rack.addEventListener('pointerover', event => {
      const jack = event.target.closest?.('.jack');
      if (jack) showTip(jack);
    });
    rack.addEventListener('pointerout', event => {
      const jack = event.target.closest?.('.jack');
      if (jack && !jack.contains(event.relatedTarget)) hideTip();
    });
    rack.addEventListener('focusin', event => {
      const jack = event.target.closest?.('.jack');
      if (jack) showTip(jack);
      else hideTip();
    });
    // Switch positions change which normals are live, so redraw after any rack input.
    for (const type of ['click', 'keyup', 'pointerup', 'change']) {
      rack.addEventListener(type, () => {
        if (enabled) requestDraw();
      });
    }
    syncButton();

    return Object.freeze({
      draw,
      setEnabled,
      get enabled() { return enabled; }
    });
  }

  return Object.freeze({ createSignalFlow, createWiringView, PREFERENCE_KEY });
}));
