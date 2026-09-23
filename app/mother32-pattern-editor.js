'use strict';

window.MOOG_MOTHER32_EDITOR = Object.freeze({
  create({ getBank, onChange, onToggle }) {
    const api = window.MOOG_MOTHER32_PATTERNS;
    const clone = value => JSON.parse(JSON.stringify(value));
    const element = document.createElement('details');
    element.id = 'mother32PatternEditor';
    element.className = 'pattern-editor';
    const summary = document.createElement('summary');
    const body = document.createElement('div');
    body.className = 'pattern-editor__body';
    element.append(summary, body);
    const toolbar = document.createElement('div');
    toolbar.className = 'pattern-editor__toolbar';
    body.append(toolbar);
    function field(parent, text, input) {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = text;
      label.append(span, input);
      parent.append(label);
      return input;
    }
    function options(min, max, name) {
      const select = document.createElement('select');
      for (let i = min; i <= max; i++) select.add(new Option(name(i), String(i)));
      return select;
    }
    const bankSelect = field(toolbar, 'Bank', options(0, 7, i => String(i + 1)));
    bankSelect.id = 'mother32Bank';
    const slotSelect = field(toolbar, 'Pattern', options(0, 7, i => String(i + 1)));
    slotSelect.id = 'mother32Pattern';
    const length = field(toolbar, 'Length', options(1, 32, i => `${i} steps`));
    length.id = 'mother32PatternLength';
    const note = document.createElement('p');
    note.className = 'fine-print';
    note.textContent = 'Notes assume FREQUENCY is centered. Pads transpose the sequence. Edits keep its position; selecting a pattern restarts at step 1. Save Local or Export JSON preserves all 64 slots.';
    body.append(note);
    const navigation = document.createElement('div');
    navigation.className = 'pattern-editor__navigation';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.textContent = 'Previous steps';
    const pageLabel = document.createElement('span');
    pageLabel.setAttribute('aria-live', 'polite');
    const next = document.createElement('button');
    next.type = 'button'; next.textContent = 'Next steps';
    navigation.append(previous, pageLabel, next);
    const steps = document.createElement('div');
    steps.className = 'pattern-editor__steps';
    const playhead = document.createElement('output');
    playhead.id = 'mother32PatternPlayhead';
    playhead.setAttribute('aria-live', 'off');
    playhead.textContent = 'Sequencer stopped';
    body.append(navigation, steps, playhead);
    let page = 0;
    let state = null;
    const pattern = () => api.activePattern(getBank());
    function editable() {
      const bank = getBank();
      return bank.patterns[bank.selected] ??= api.createPattern();
    }
    function updatePlayhead(nextState) {
      state = nextState;
      for (const row of steps.children) {
        const active = state?.running && state.indicatorMode !== 'running' &&
          Number(row.dataset.step) === state.currentStep;
        row.dataset.playing = String(Boolean(active));
      }
      playhead.textContent = !state?.running ? 'Sequencer stopped' :
        state.indicatorMode === 'running' ? 'Running · step display suppressed' :
          `Playing step ${state.currentStep + 1}`;
    }
    function renderSteps() {
      const current = pattern();
      page = Math.min(page, Math.floor((current.length - 1) / 8));
      previous.disabled = page === 0;
      next.disabled = (page + 1) * 8 >= current.length;
      pageLabel.textContent = `Steps ${page * 8 + 1}–${Math.min((page + 1) * 8, current.length)}`;
      steps.replaceChildren();
      for (let index = page * 8; index < Math.min((page + 1) * 8, current.length); index++) {
        const step = current.steps[index];
        const row = document.createElement('fieldset');
        row.dataset.step = String(index);
        const legend = document.createElement('legend');
        legend.textContent = `Step ${index + 1}`;
        row.append(legend);
        const pitch = field(row, 'Note', options(0, 105, api.noteName));
        pitch.dataset.field = 'note'; pitch.value = String(step.note);
        const gate = field(row, 'Gate', options(1, 8, i => i === 8 ? '8/8 · tie' : `${i}/8`));
        gate.dataset.field = 'gateLength'; gate.value = String(step.gateLength);
        for (const key of ['rest', 'glide']) {
          const input = document.createElement('input');
          input.type = 'checkbox'; input.checked = step[key]; input.dataset.field = key;
          field(row, key === 'rest' ? 'Rest' : 'Glide', input);
        }
        row.addEventListener('change', event => {
          const key = event.target.dataset.field;
          if (!key) return;
          const before = clone(getBank());
          editable().steps[index][key] = event.target.type === 'checkbox'
            ? event.target.checked : Number(event.target.value);
          onChange(false, before);
        });
        steps.append(row);
      }
      updatePlayhead(state);
      onToggle();
    }
    function refresh() {
      const bank = getBank();
      bankSelect.value = String(Math.floor(bank.selected / 8));
      slotSelect.value = String(bank.selected % 8);
      summary.textContent = `Pattern editor · Bank ${Math.floor(bank.selected / 8) + 1} / Pattern ${bank.selected % 8 + 1}`;
      length.value = String(pattern().length);
      renderSteps();
    }
    function selectPattern() {
      const before = clone(getBank());
      getBank().selected = Number(bankSelect.value) * 8 + Number(slotSelect.value);
      page = 0;
      refresh();
      onChange(true, before);
    }
    bankSelect.addEventListener('change', selectPattern);
    slotSelect.addEventListener('change', selectPattern);
    length.addEventListener('change', () => {
      const before = clone(getBank());
      editable().length = Number(length.value);
      renderSteps();
      onChange(false, before);
    });
    previous.addEventListener('click', () => { page--; renderSteps(); });
    next.addEventListener('click', () => { page++; renderSteps(); });
    element.addEventListener('toggle', onToggle);
    refresh();
    return { element, refresh, updatePlayhead, open() {
      element.open = true;
      element.scrollIntoView({ block: 'nearest' });
      bankSelect.focus({ preventScroll: true });
    } };
  }
});
