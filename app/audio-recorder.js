'use strict';

(function exposeRecorder(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOOG_AUDIO_RECORDER = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const CHANNELS = ['dfam', 'mother32', 'subharmonicon', 'mix'];
  const SESSION_BYTES = 192 * 1024 * 1024;
  const MAX_SECONDS = 300;
  // Unacknowledged 4096-frame chunks tolerated before capture stops: about 2.7 s of 48 kHz
  // audio, so a brief main-thread stall (GC, heavy drawing) does not end a jam.
  const BACKPRESSURE_CHUNKS = 32;

  // Serialized into an embedded worklet module; keep this function self-contained.
  function registerCapture() {
    class RackCapture extends AudioWorkletProcessor {
      constructor() {
        super();
        this.active = false;
        this.pending = 0;
        this.port.onmessage = ({ data }) => {
          if (data.type === 'ack') this.pending = Math.max(0, this.pending - 1);
          if (data.type === 'start' && !this.active && this.pending === 0 &&
            Number.isInteger(data.maxFrames) && data.maxFrames > 0) {
            this.active = true;
            this.limit = data.maxFrames;
            this.maxPending = Number.isInteger(data.maxPending) && data.maxPending > 0 ? data.maxPending : 32;
            this.total = 0;
            this.offset = 0;
            this.startFrame = null;
            this.allocate();
          }
          if (data.type === 'stop' && this.active) this.finish(data.reason || 'stopped');
        };
      }
      allocate() { this.buffers = Array.from({ length: 4 }, () => new Float32Array(4096)); }
      flush() {
        if (!this.offset) return;
        const channels = this.buffers.map(buffer => buffer.slice(0, this.offset));
        this.port.postMessage({ type: 'chunk', offset: this.total - this.offset,
          channels }, channels.map(channel => channel.buffer));
        this.pending += 1;
        this.offset = 0;
      }
      finish(reason) {
        this.flush();
        this.active = false;
        this.buffers = null;
        this.port.postMessage({ type: 'finished', frames: this.total,
          startFrame: this.startFrame, reason });
      }
      process(inputs, outputs) {
        // Silent output keeps this capture branch rendering without doubling the mix.
        const output = outputs[0]?.[0];
        if (output) output.fill(0);
        if (!this.active) return true;
        if (this.startFrame === null) {
          this.startFrame = currentFrame;
          this.port.postMessage({ type: 'started', frame: currentFrame });
        }
        if (currentFrame !== this.startFrame + this.total) {
          this.finish('partial: discontinuous audio frames');
          return true;
        }
        const length = output?.length || inputs[0]?.[0]?.length || 0;
        for (let index = 0; index < length; index += 1) {
          let mix = 0;
          for (let channel = 0; channel < 3; channel += 1) {
            const value = inputs[channel]?.[0]?.[index] ?? 0;
            this.buffers[channel][this.offset] = value;
            mix += value;
          }
          this.buffers[3][this.offset] = mix;
          this.offset += 1;
          this.total += 1;
          if (this.total === this.limit) { this.finish('limit'); break; }
          if (this.offset === 4096) {
            this.flush();
            if (this.pending >= this.maxPending) { this.finish('backpressure'); break; }
            this.allocate();
          }
        }
        return true;
      }
    }
    registerProcessor('moog-rack-capture', RackCapture);
  }

  function encodePCM24(samples) {
    const bytes = new Uint8Array(samples.length * 3);
    let clipped = 0;
    let invalid = 0;
    for (let index = 0; index < samples.length; index += 1) {
      let value = samples[index];
      if (!Number.isFinite(value)) { invalid += 1; value = 0; }
      if (value < -1 || value > 1 - 1 / 8388608) clipped += 1;
      const integer = Math.max(-8388608, Math.min(8388607, Math.round(value * 8388608)));
      bytes[index * 3] = integer & 255;
      bytes[index * 3 + 1] = (integer >> 8) & 255;
      bytes[index * 3 + 2] = (integer >> 16) & 255;
    }
    return { bytes, clipped, invalid };
  }

  function wavHeader(frames, sampleRate) {
    if (!Number.isInteger(frames) || frames < 0 || frames * 3 > 0xffffffff - 37 ||
      !Number.isInteger(sampleRate) || sampleRate < 1 || sampleRate > 384000) {
      throw new Error('Invalid WAV dimensions.');
    }
    const bytes = new Uint8Array(44);
    const view = new DataView(bytes.buffer);
    const tag = (offset, value) => [...value].forEach((char, index) => { bytes[offset + index] = char.charCodeAt(0); });
    tag(0, 'RIFF'); view.setUint32(4, 36 + frames * 3 + (frames * 3 % 2), true);
    tag(8, 'WAVE'); tag(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 3, true);
    view.setUint16(32, 3, true); view.setUint16(34, 24, true);
    tag(36, 'data'); view.setUint32(40, frames * 3, true);
    return bytes;
  }

  function wavBlob(take, channel) {
    return new Blob([wavHeader(take.frames, take.sampleRate), ...take.parts[channel],
      ...(take.frames % 2 ? [new Uint8Array(1)] : [])], { type: 'audio/wav' });
  }

  // Patch log: the performance moves made during a take, timed against its audio.
  // Readable text for people, JSON (with start/end patch snapshots) for later replay work.
  function formatLogTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds - minutes * 60).toFixed(1).padStart(4, '0')}`;
  }

  function patchLogText(take, describeState) {
    const duration = take.frames / take.sampleRate;
    const lines = [
      `Patch log · ${take.name}`,
      `Recorded ${take.recordedAt ?? 'at an unknown time'} · ${duration.toFixed(1)} s · ${take.sampleRate} Hz` +
        (take.reason && take.reason !== 'stopped' ? ` · ${take.reason}` : ''),
      'Times are relative to the start of the audio files and approximate (about ±20 ms). ' +
        'A knob drag shows when it started and when it was released.',
      ''
    ];
    const events = take.log ?? [];
    // A control changed during the take is listed in the snapshots even at its default,
    // so every event's starting value can be read from the starting patch.
    const include = new Set(events
      .filter(event => event.type === 'control' && event.instrumentId && event.targetId)
      .map(event => `${event.instrumentId}:${event.targetId}`));
    const section = (title, state) => {
      if (!state || !describeState) return;
      lines.push(title, ...describeState(state, { include }).map(line => `  ${line}`), '');
    };
    section('Starting patch', take.initialState);
    const eventTime = event => (
      Number.isFinite(event.startSeconds) && event.seconds - event.startSeconds >= 0.05
        ? `${formatLogTime(event.startSeconds)}–${formatLogTime(event.seconds)}`
        : formatLogTime(event.seconds)
    );
    lines.push(`Events (${events.length})`);
    if (!events.length) lines.push('  No patching, knob, note, pattern, or transport changes.');
    for (const event of events) lines.push(`  ${eventTime(event)}  ${event.text}`);
    lines.push('');
    section('Ending patch', take.finalState);
    return `${lines.join('\n').trimEnd()}\n`;
  }

  // Summarize monotonic wheel/key runs, retaining each numeric step for JSON export.
  // A reversal starts a new run: returning to the starting value is still a performance.
  const STEP_GESTURES = new Set(['wheel', 'keyboard']);
  const STEP_RUN_SECONDS = 0.75;
  const stepRuns = new WeakMap();
  const valueSplit = text => {
    const arrow = text.lastIndexOf(' → ');
    return arrow < 0 ? null : { head: text.slice(0, arrow), tail: text.slice(arrow) };
  };
  const numericChange = entry => entry?.type === 'control' &&
    Number.isFinite(entry.before) && Number.isFinite(entry.after);
  const logStep = entry => ({ seconds: entry.seconds, before: entry.before, after: entry.after });
  function appendLogEntry(log, entry, stepGesture = null) {
    // Display values are rounded. Only exact numeric equality proves a no-op.
    if (numericChange(entry) && entry.before === entry.after) return log;
    const last = log[log.length - 1];
    const split = entry.type === 'control' ? valueSplit(entry.text) : null;
    if (split && STEP_GESTURES.has(stepGesture) && numericChange(entry) && numericChange(last) &&
      stepRuns.get(last) === stepGesture &&
      last.instrumentId === entry.instrumentId && last.targetId === entry.targetId &&
      entry.seconds >= last.seconds && entry.seconds - last.seconds <= STEP_RUN_SECONDS &&
      Math.abs(last.after - entry.before) < 1e-9 &&
      Math.sign(last.after - last.before) === Math.sign(entry.after - entry.before) && valueSplit(last.text)) {
      last.steps ??= [logStep(last)];
      last.steps.push(logStep(entry));
      last.after = entry.after;
      last.startSeconds ??= last.seconds;
      last.seconds = entry.seconds;
      last.text = valueSplit(last.text).head + split.tail;
    } else {
      log.push(entry);
      if (split && STEP_GESTURES.has(stepGesture)) stepRuns.set(entry, stepGesture);
    }
    return log;
  }

  function patchLogJson(take) {
    return {
      format: 'moog-rack-patch-log',
      schemaVersion: 1,
      take: { id: take.id, name: take.name, reason: take.reason ?? null },
      recordedAt: take.recordedAt ?? null,
      sampleRate: take.sampleRate,
      startFrame: Number.isInteger(take.startFrame) ? take.startFrame : null,
      durationSeconds: take.frames / take.sampleRate,
      timing: 'Event seconds are measured on the main thread against the audio clock, relative to the first captured frame; approximate, not sample-accurate. ' +
        'Knob drags also carry startSeconds, when the drag began; their seconds is when it was released. ' +
        'Merged wheel/key runs retain their individual numeric changes and times in steps.',
      initialState: take.initialState ?? null,
      events: take.log ?? [],
      finalState: take.finalState ?? null
    };
  }

  function create({ element, ensureAudio, getAudio, getSnapshot, describeState,
    storageBytes = SESSION_BYTES, maxSeconds = MAX_SECONDS }) {
    if (!Number.isInteger(storageBytes) || storageBytes < 12 || storageBytes > SESSION_BYTES ||
      !Number.isFinite(maxSeconds) || maxSeconds <= 0 || maxSeconds > MAX_SECONDS) {
      throw new Error('Invalid recorder limits.');
    }
    const record = element.querySelector('[data-record]');
    const stop = element.querySelector('[data-stop]');
    const status = element.querySelector('[data-status]');
    const list = element.querySelector('[data-takes]');
    const details = element.querySelector('[data-details]');
    const takeCount = element.querySelector('[data-take-count]');
    const takes = [];
    let active = null;
    let node = null;
    let context = null;
    let busy = false;
    let nextId = 1;
    let usedBytes = 0;
    let finishWaiters = [];
    let stopDeadline = null;
    const loadedContexts = new WeakSet();
    let attachedGains = null;
    const urls = new Set();
    const duration = frames => (frames / (active?.sampleRate || context?.sampleRate || 48000)).toFixed(1);
    function controls() {
      record.disabled = busy || Boolean(active) || storageBytes - usedBytes < 12 * (context?.sampleRate || 48000);
      stop.disabled = !active || active.stopping;
    }
    const fileStem = take => take.name.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || `take-${take.id}`;
    function saveBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      urls.add(url);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = filename;
      document.body.append(anchor); anchor.click(); anchor.remove();
      // Allow the browser to consume the download before releasing its Blob reference.
      setTimeout(() => { URL.revokeObjectURL(url); urls.delete(url); }, 1000);
    }
    function download(take, channel, button) {
      try {
        saveBlob(wavBlob(take, channel), `${fileStem(take)}-${CHANNELS[channel]}.wav`);
        take.exported.add(channel);
        button.textContent = `${CHANNELS[channel]} WAV ↓`;
        status.textContent = 'Download requested. Verify the file before closing this page.';
      } catch (error) { status.textContent = `Export failed: ${error.message}`; }
    }
    function downloadLog(take, kind, button) {
      try {
        const blob = kind === 'json'
          ? new Blob([`${JSON.stringify(patchLogJson(take), null, 2)}\n`], { type: 'application/json' })
          : new Blob([patchLogText(take, describeState)], { type: 'text/plain' });
        saveBlob(blob, `${fileStem(take)}-patch-log.${kind === 'json' ? 'json' : 'txt'}`);
        take.exported.add('log');
        button.textContent = `${button.textContent.replace(/ ↓$/, '')} ↓`;
        status.textContent = 'Download requested. Verify the file before closing this page.';
      } catch (error) { status.textContent = `Export failed: ${error.message}`; }
    }
    // Called by the app for each performance move while a take is recording.
    // A gesture may pass `contextStartTime` (audio-clock seconds when it began); the log
    // stores it as `startSeconds`, clamped to the take.
    function note(event) {
      if (!active || active.stopping || !event || typeof event.text !== 'string') return;
      const takeSeconds = contextTime => (context && Number.isInteger(active.startFrame)
        ? Math.round(Math.max(0, (contextTime * active.sampleRate - active.startFrame) / active.sampleRate) * 1000) / 1000
        : 0);
      const { contextStartTime, stepGesture, ...logged } = event;
      const entry = { ...logged, seconds: takeSeconds(context?.currentTime ?? 0) };
      if (Number.isFinite(contextStartTime)) {
        entry.startSeconds = Math.min(entry.seconds, takeSeconds(contextStartTime));
      }
      appendLogEntry(active.log, entry, stepGesture);
    }
    function renderTakes() {
      list.replaceChildren();
      if (takeCount) takeCount.textContent = takes.length ? `(${takes.length})` : '';
      for (const take of takes) {
        const item = document.createElement('li');
        const name = document.createElement('input');
        name.type = 'text'; name.value = take.name; name.maxLength = 80;
        name.setAttribute('aria-label', `Name for take ${take.id}`);
        name.addEventListener('change', () => { take.name = name.value.trim() || `Take ${take.id}`; name.value = take.name; });
        const detail = document.createElement('p');
        detail.textContent = `${(take.frames / take.sampleRate).toFixed(1)} s · ${take.sampleRate} Hz · mono · 24-bit · ${take.log.length} patch event${take.log.length === 1 ? '' : 's'}${take.reason !== 'stopped' ? ` · ${take.reason}` : ''}`;
        const issues = take.clipped.map((count, channel) => count ? CHANNELS[channel] : '').filter(Boolean);
        if (issues.length) detail.textContent += ` · Clipping: ${issues.join(', ')}`;
        if (take.invalid) detail.textContent += ` · ${take.invalid} invalid samples replaced with silence`;
        item.append(name, detail);
        CHANNELS.forEach((label, channel) => {
          const button = document.createElement('button');
          button.type = 'button'; button.textContent = `${label} WAV`;
          button.addEventListener('click', () => download(take, channel, button)); item.append(button);
        });
        for (const [kind, label] of [['text', 'Patch log (text)'], ['json', 'Patch log (JSON)']]) {
          const button = document.createElement('button');
          button.type = 'button'; button.textContent = label;
          button.addEventListener('click', () => downloadLog(take, kind, button)); item.append(button);
        }
        const remove = document.createElement('button');
        remove.type = 'button'; remove.textContent = 'Delete take';
        remove.addEventListener('click', () => {
          if (!window.confirm(`Delete “${take.name}” from this session? Export any WAVs you want to keep first.`)) return;
          takes.splice(takes.indexOf(take), 1); usedBytes -= take.frames * 12;
          take.parts = [[], [], [], []]; renderTakes(); controls();
        });
        item.append(remove); list.append(item);
      }
    }
    function requestStop(reason = 'stopped') {
      if (!active) return Promise.resolve();
      const finished = new Promise(resolve => finishWaiters.push(resolve));
      if (active.stopping) return finished;
      active.stopping = true;
      node.port.postMessage({ type: 'stop', reason }); controls();
      // A suspended/failed rendering thread may not deliver its partial chunk.
      // Keep only verified chunks and label the take partial instead of hanging.
      stopDeadline = setTimeout(() => {
        if (!active) return;
        detach();
        receive({ data: { type: 'finished', frames: active.frames,
          reason: 'partial: capture stopped responding' } });
      }, 2000);
      return finished;
    }
    function receive({ data }) {
      if (data.type === 'chunk') {
        if (!active) { node.port.postMessage({ type: 'ack' }); return; }
        const length = data.channels?.[0]?.length;
        if (data.offset !== active.frames || !Array.isArray(data.channels) || data.channels.length !== 4 || !length ||
          data.channels.some(channel => channel.length !== length) || usedBytes + length * 12 > storageBytes) {
          active.fault = 'partial: capture data could not be retained';
          requestStop(active.fault);
        } else if (!active.fault) {
          data.channels.forEach((samples, channel) => {
            const result = encodePCM24(samples);
            active.parts[channel].push(result.bytes);
            active.clipped[channel] += result.clipped;
            active.invalid += result.invalid;
          });
          active.frames += length; usedBytes += length * 12;
          status.textContent = `Recording ${duration(active.frames)} s · ${duration(active.maxFrames - active.frames)} s remaining · ${active.log.length} patch event${active.log.length === 1 ? '' : 's'}`;
        }
        node.port.postMessage({ type: 'ack' });
      }
      if (data.type === 'started' && active) {
        active.startFrame = data.frame;
        status.textContent = 'Recording audio · the instrument transports remain under your control';
      }
      if (data.type === 'finished' && active) {
        clearTimeout(stopDeadline); stopDeadline = null;
        const take = active;
        take.reason = take.fault || (data.frames !== take.frames ? 'partial: missing audio' : ({
          stopped: 'stopped', limit: 'duration/storage limit reached',
          backpressure: 'partial: capture could not keep up', interrupted: 'partial: audio interrupted'
        }[data.reason] || data.reason));
        take.finalState = getSnapshot?.() ?? null;
        if (take.frames) takes.push(take);
        // Reveal the collapsed take list so the new take's downloads are visible.
        if (take.frames && details) details.open = true;
        active = null;
        status.textContent = take.frames ? `Take saved in this page only · ${take.reason}. Export WAVs before closing.` : 'No audio captured.';
        renderTakes(); controls();
        for (const resolve of finishWaiters) resolve();
        finishWaiters = [];
      }
    }
    function detach() {
      if (!node) return;
      for (const gain of Object.values(attachedGains || {})) {
        try { gain.disconnect(node); } catch { /* Already disconnected. */ }
      }
      node.disconnect(); node = null;
    }
    async function attach() {
      const audio = getAudio();
      if (node && context === audio.context) return;
      detach();
      context = audio.context;
      if (!loadedContexts.has(context)) {
        await context.audioWorklet.addModule(`data:text/javascript;charset=utf-8,${encodeURIComponent(`(${registerCapture.toString()})();`)}`);
        loadedContexts.add(context);
      }
      node = new AudioWorkletNode(context, 'moog-rack-capture', {
        numberOfInputs: 3, numberOfOutputs: 1, outputChannelCount: [1],
        channelCount: 1, channelCountMode: 'explicit'
      });
      CHANNELS.slice(0, 3).forEach((id, index) => audio.gains[id].connect(node, 0, index));
      attachedGains = audio.gains;
      node.connect(context.destination);
      const attachedNode = node;
      const attachedContext = context;
      node.port.onmessage = event => { if (node === attachedNode) receive(event); };
      node.onprocessorerror = () => {
        if (node !== attachedNode) return;
        detach();
        if (active) receive({ data: { type: 'finished', frames: active.frames, reason: 'partial: recorder processor failed' } });
      };
      context.addEventListener('statechange', () => {
        if (node === attachedNode && attachedContext.state !== 'running') requestStop('interrupted');
      });
    }
    record.addEventListener('click', async () => {
      if (busy || active) return;
      busy = true; controls();
      try {
        await ensureAudio();
        if (getAudio().context?.state !== 'running') throw new Error('Audio could not start.');
        await attach();
        if (context.state !== 'running') throw new Error('Audio was paused while preparing capture. Press Record to resume.');
        const maxFrames = Math.min(Math.floor(context.sampleRate * maxSeconds), Math.floor((storageBytes - usedBytes) / 12));
        if (maxFrames < context.sampleRate) throw new Error('Session storage is full. Export and delete a take first.');
        active = { id: nextId++, name: `Take ${nextId - 1}`, frames: 0,
          parts: [[], [], [], []], sampleRate: context.sampleRate, maxFrames,
          clipped: [0, 0, 0, 0], invalid: 0, exported: new Set(),
          log: [], recordedAt: new Date().toISOString(), initialState: getSnapshot?.() ?? null, finalState: null };
        node.port.postMessage({ type: 'start', maxFrames, maxPending: BACKPRESSURE_CHUNKS });
        status.textContent = 'Starting audio capture…';
      } catch (error) { status.textContent = `Recording failed: ${error.message}`; }
      finally { busy = false; controls(); }
    });
    stop.addEventListener('click', () => requestStop());
    window.addEventListener('beforeunload', event => {
      // Warn only while recording or when a take still has unexported WAVs or patch log.
      if (!active && takes.every(take => CHANNELS.every((_, channel) => take.exported.has(channel)) &&
        take.exported.has('log'))) return;
      event.preventDefault(); event.returnValue = '';
    });
    controls();
    return { stop: requestStop, note, get recording() { return Boolean(active); } };
  }
  return Object.freeze({ CHANNELS, SESSION_BYTES, MAX_SECONDS, BACKPRESSURE_CHUNKS, registerCapture, formatLogTime, patchLogText, patchLogJson, appendLogEntry, encodePCM24, wavHeader, wavBlob, create });
}));
