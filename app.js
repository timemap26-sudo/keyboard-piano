(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Key layout: e.code -> MIDI note (octave shift is applied on top)
  // ---------------------------------------------------------------------------
  const CODE_TO_MIDI = {
    // lower row: C3 .. E4
    KeyZ: 48, KeyS: 49, KeyX: 50, KeyD: 51, KeyC: 52, KeyV: 53, KeyG: 54, KeyB: 55,
    KeyH: 56, KeyN: 57, KeyJ: 58, KeyM: 59, Comma: 60, KeyL: 61, Period: 62,
    Semicolon: 63, Slash: 64,
    // upper row: C4 .. G5
    KeyQ: 60, Digit2: 61, KeyW: 62, Digit3: 63, KeyE: 64, KeyR: 65, Digit5: 66,
    KeyT: 67, Digit6: 68, KeyY: 69, Digit7: 70, KeyU: 71, KeyI: 72, Digit9: 73,
    KeyO: 74, Digit0: 75, KeyP: 76, BracketLeft: 77, Equal: 78, BracketRight: 79,
  };
  const CODE_LABEL = {
    KeyZ: 'Z', KeyS: 'S', KeyX: 'X', KeyD: 'D', KeyC: 'C', KeyV: 'V', KeyG: 'G', KeyB: 'B',
    KeyH: 'H', KeyN: 'N', KeyJ: 'J', KeyM: 'M', Comma: ',', KeyL: 'L', Period: '.',
    Semicolon: ';', Slash: '/', KeyQ: 'Q', Digit2: '2', KeyW: 'W', Digit3: '3', KeyE: 'E',
    KeyR: 'R', Digit5: '5', KeyT: 'T', Digit6: '6', KeyY: 'Y', Digit7: '7', KeyU: 'U',
    KeyI: 'I', Digit9: '9', KeyO: 'O', Digit0: '0', KeyP: 'P', BracketLeft: '[',
    Equal: '=', BracketRight: ']',
  };
  const LOW = 48, HIGH = 79;
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SOLFEGE = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  const isBlack = (m) => [1, 3, 6, 8, 10].includes(m % 12);
  const midiName = (m) => NAMES[m % 12] + (Math.floor(m / 12) - 1);
  const noteToMidi = (s) => {
    const r = /^([A-G])(#|b)?(-?\d)$/.exec(s);
    if (!r) throw new Error('bad note ' + s);
    let n = NAMES.indexOf(r[1]) + (r[2] === '#' ? 1 : r[2] === 'b' ? -1 : 0);
    return n + (parseInt(r[3], 10) + 1) * 12;
  };

  // ---------------------------------------------------------------------------
  // Songs (public domain). Format: "NOTE:beats", R = rest, default 1 beat.
  // ---------------------------------------------------------------------------
  const SONGS = [
    {
      name: '小星星', bpm: 100,
      score: `C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2
              G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2
              C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2`,
    },
    {
      name: '瑪莉有隻小綿羊', bpm: 110,
      score: `E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2
              E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:4`,
    },
    {
      name: '歡樂頌', bpm: 110,
      score: `E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2
              E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2
              D4 D4 E4 C4 D4 E4:0.5 F4:0.5 E4 C4 D4 E4:0.5 F4:0.5 E4 D4 C4 D4 G3:2
              E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2`,
    },
    {
      name: '生日快樂', bpm: 100,
      score: `G4:0.75 G4:0.25 A4 G4 C5 B4:2 G4:0.75 G4:0.25 A4 G4 D5 C5:2
              G4:0.75 G4:0.25 G5 E5 C5 B4 A4:2 F5:0.75 F5:0.25 E5 C5 D5 C5:3`,
    },
    {
      name: '給愛麗絲（開頭）', bpm: 120,
      score: `E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5
              C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 G#4:.5 B4:.5 C5:1 R:.5
              E4:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5
              C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 C5:.5 B4:.5 A4:2`,
    },
    {
      name: '小蜜蜂', bpm: 120,
      score: `G4 E4 E4:2 F4 D4 D4:2 C4 D4 E4 F4 G4 G4 G4:2
              G4 E4 E4:2 F4 D4 D4:2 C4 E4 G4 G4 E4:4
              D4 D4 D4 D4 D4 E4 F4:2 E4 E4 E4 E4 E4 F4 G4:2
              G4 E4 E4:2 F4 D4 D4:2 C4 E4 G4 G4 C4:4`,
    },
  ];

  function parseSong(song) {
    const out = [];
    let beat = 0;
    for (const tok of song.score.trim().split(/\s+/)) {
      const [n, b] = tok.split(':');
      const beats = b ? parseFloat(b) : 1;
      if (n !== 'R') out.push({ midi: noteToMidi(n), beat, beats });
      beat += beats;
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Audio engine
  // ---------------------------------------------------------------------------
  let ctx = null, master, dry, wet, comp, reverbOn = true;
  let instrument = 'piano';

  function initAudio() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = volumeEl.value / 100;
    dry = ctx.createGain();
    wet = ctx.createGain();
    wet.gain.value = reverbOn ? 0.28 : 0;
    const conv = ctx.createConvolver();
    conv.buffer = makeImpulse(2.2, 2.5);
    dry.connect(comp);
    dry.connect(conv); conv.connect(wet); wet.connect(comp);
    comp.connect(master); master.connect(ctx.destination);
  }

  function makeImpulse(seconds, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  const freqOf = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Returns a voice with release(time)
  function makeVoice(midi, velocity = 0.85) {
    const t = ctx.currentTime;
    const f = freqOf(midi);
    const out = ctx.createGain();
    out.connect(dry);
    const nodes = [];
    const osc = (type, freq, gainVal, dest) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = gainVal;
      o.connect(g); g.connect(dest || out);
      o.start(t); nodes.push(o);
      return { o, g };
    };
    let releaseTau = 0.12;

    if (instrument === 'piano') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(f * 9, 16000), t);
      filter.frequency.exponentialRampToValueAtTime(Math.max(f * 2, 400), t + 1.6);
      filter.connect(out);
      const partials = [1, 0.55, 0.3, 0.18, 0.1, 0.07, 0.04];
      partials.forEach((a, i) => {
        const p = osc('sine', f * (i + 1) * (1 + 0.0004 * i * i), a * 0.32, filter);
        // higher partials fade faster
        p.g.gain.setTargetAtTime(0.0001, t, 2.2 / (i + 1.5));
      });
      osc('triangle', f * 1.002, 0.06, filter);
      // natural decay: lower notes ring longer
      const decay = Math.max(0.5, 3.2 - (midi - 48) * 0.06);
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(velocity, t + 0.004);
      out.gain.setTargetAtTime(velocity * 0.35, t + 0.004, 0.12);
      out.gain.setTargetAtTime(0.0001, t + 0.3, decay);
      releaseTau = 0.09;
    } else if (instrument === 'epiano') {
      // simple FM tine
      const car = ctx.createOscillator(); car.frequency.value = f;
      const mod = ctx.createOscillator(); mod.frequency.value = f * 1;
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(f * 2.2, t);
      modGain.gain.setTargetAtTime(f * 0.25, t, 0.25);
      mod.connect(modGain); modGain.connect(car.frequency);
      const bell = ctx.createOscillator(); bell.frequency.value = f * 14;
      const bellG = ctx.createGain();
      bellG.gain.setValueAtTime(0.04, t); bellG.gain.setTargetAtTime(0.0001, t, 0.05);
      bell.connect(bellG); bellG.connect(out);
      const cg = ctx.createGain(); cg.gain.value = 0.45;
      car.connect(cg); cg.connect(out);
      [car, mod, bell].forEach((o) => { o.start(t); nodes.push(o); });
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(velocity, t + 0.006);
      out.gain.setTargetAtTime(0.0001, t + 0.05, 1.6);
      releaseTau = 0.15;
    } else if (instrument === 'organ') {
      [[0.5, 0.25], [1, 0.35], [2, 0.22], [3, 0.12], [4, 0.1], [6, 0.05]].forEach(([r, a]) => {
        osc('sine', f * r, a * 0.6);
      });
      const lfo = ctx.createOscillator(); lfo.frequency.value = 5.8;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.06;
      lfo.connect(lfoG); lfoG.connect(out.gain); lfo.start(t); nodes.push(lfo);
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(velocity * 0.7, t + 0.03);
      releaseTau = 0.06;
    } else {
      osc('square', f, 0.13);
      osc('square', f * 2.005, 0.04);
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(velocity, t + 0.003);
      out.gain.setTargetAtTime(velocity * 0.6, t + 0.003, 0.2);
      releaseTau = 0.04;
    }

    let released = false;
    return {
      release(when = ctx.currentTime) {
        if (released) return;
        released = true;
        out.gain.cancelScheduledValues(when);
        out.gain.setValueAtTime(out.gain.value, when);
        out.gain.setTargetAtTime(0, when, releaseTau);
        const stopAt = when + releaseTau * 8;
        nodes.forEach((n) => { try { n.stop(stopAt); } catch (e) { /* noop */ } });
        setTimeout(() => out.disconnect(), (stopAt - ctx.currentTime) * 1000 + 100);
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Note on / off with sustain pedal
  // ---------------------------------------------------------------------------
  const held = new Map();      // midi -> voice
  const sustained = new Set(); // voices waiting for pedal up
  let sustain = false, sustainLocked = false;
  const downCount = new Map(); // midi -> count of sources holding (visual)

  function noteOn(midi, { record = true, velocity } = {}) {
    if (midi < 21 || midi > 108) return;
    initAudio();
    const prev = held.get(midi);
    if (prev) prev.release();
    held.set(midi, makeVoice(midi, velocity));
    setDown(midi, +1);
    trailStart(midi);
    if (record && recording) recEvents.push({ t: performance.now() - recStart, on: true, midi });
  }

  function noteOff(midi, { record = true } = {}) {
    const v = held.get(midi);
    setDown(midi, -1);
    trailEnd(midi);
    if (record && recording) recEvents.push({ t: performance.now() - recStart, on: false, midi });
    if (!v) return;
    if ((downCount.get(midi) || 0) > 0) return; // another source still holds it
    held.delete(midi);
    if (sustain) sustained.add(v); else v.release();
  }

  function setSustain(on) {
    sustain = on;
    sustainBtn.classList.toggle('on', on);
    if (!on) { sustained.forEach((v) => v.release()); sustained.clear(); }
  }

  function allNotesOff() {
    held.forEach((v) => v.release()); held.clear();
    sustained.forEach((v) => v.release()); sustained.clear();
    downCount.clear();
    keyEls.forEach((el) => el.classList.remove('down'));
    trails.forEach((tr) => { if (tr.end == null) tr.end = performance.now(); });
  }

  // ---------------------------------------------------------------------------
  // DOM: keyboard
  // ---------------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const keysEl = $('keys'), canvas = $('fall'), cctx = canvas.getContext('2d');
  const volumeEl = $('volume'), sustainBtn = $('sustainBtn'), reverbBtn = $('reverbBtn');
  const octaveEl = $('octave'), labelsEl = $('labels');
  const keyEls = new Map(); // displayed midi -> element
  let octave = 0;

  const labelsFor = {};
  for (const [code, m] of Object.entries(CODE_TO_MIDI)) (labelsFor[m] ||= []).push(CODE_LABEL[code]);

  function buildKeyboard() {
    keysEl.innerHTML = '';
    for (let m = LOW; m <= HIGH; m++) {
      const el = document.createElement('div');
      el.className = 'key ' + (isBlack(m) ? 'black' : 'white') + (m % 12 === 0 ? ' c-key' : '');
      el.dataset.midi = m;
      el.innerHTML = '<span class="lbl"></span>' + (m % 12 === 0 ? `<span class="oct">${midiName(m)}</span>` : '');
      keysEl.appendChild(el);
      keyEls.set(m, el);
    }
    updateLabels();
    layoutBlackKeys();
  }

  function layoutBlackKeys() {
    keyEls.forEach((el, m) => {
      if (!isBlack(m)) return;
      const left = keyEls.get(m - 1);
      const w = left.offsetWidth * 0.62;
      el.style.width = w + 'px';
      el.style.left = (left.offsetLeft + left.offsetWidth + 1 - w / 2) + 'px';
    });
  }

  function updateLabels() {
    const mode = labelsEl.value;
    keyEls.forEach((el, m) => {
      const lbl = el.querySelector('.lbl');
      if (mode === 'key') {
        const ks = (labelsFor[m] || []).slice().reverse();
        lbl.innerHTML = ks.map((k, i) => (i ? `<em>${k}</em>` : k)).join('<br>');
      } else if (mode === 'note') {
        lbl.textContent = NAMES[(m + octave * 12) % 12];
      } else if (mode === 'solfege') {
        lbl.textContent = isBlack(m) ? '' : SOLFEGE[(m + octave * 12) % 12];
      } else lbl.textContent = '';
    });
  }

  function setDown(midi, delta) {
    const n = Math.max(0, (downCount.get(midi) || 0) + delta);
    downCount.set(midi, n);
    const el = keyEls.get(midi - octave * 12);
    if (el) el.classList.toggle('down', n > 0);
  }

  function setOctave(o) {
    o = Math.max(-2, Math.min(2, o));
    if (o === octave) return;
    allNotesOff();
    octave = o;
    octaveEl.textContent = (o > 0 ? '+' : '') + o;
    updateLabels();
  }

  // ---------------------------------------------------------------------------
  // Input: computer keyboard
  // ---------------------------------------------------------------------------
  const pressed = new Map(); // code -> sounding midi

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) setSustain(true);
      return;
    }
    if (e.code === 'ArrowLeft') { e.preventDefault(); if (!game.running) setOctave(octave - 1); return; }
    if (e.code === 'ArrowRight') { e.preventDefault(); if (!game.running) setOctave(octave + 1); return; }
    if (e.code === 'Escape') { if (game.running) stopGame(false); return; }
    const base = CODE_TO_MIDI[e.code];
    if (base == null) return;
    e.preventDefault();
    if (e.repeat || pressed.has(e.code)) return;
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    const midi = base + octave * 12;
    pressed.set(e.code, midi);
    userPress(midi);
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') { e.preventDefault(); if (!sustainLocked) setSustain(false); return; }
    const midi = pressed.get(e.code);
    if (midi == null) return;
    pressed.delete(e.code);
    noteOff(midi);
  });

  window.addEventListener('blur', () => {
    pressed.forEach((m) => noteOff(m));
    pressed.clear();
    if (!sustainLocked) setSustain(false);
  });

  // ---------------------------------------------------------------------------
  // Input: mouse / touch (with glissando)
  // ---------------------------------------------------------------------------
  const pointers = new Map(); // pointerId -> midi
  function keyAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el && el.classList.contains('key') ? +el.dataset.midi : null;
  }
  keysEl.addEventListener('pointerdown', (e) => {
    const m = keyAt(e.clientX, e.clientY);
    if (m == null) return;
    e.preventDefault();
    keysEl.setPointerCapture(e.pointerId);
    const midi = m + octave * 12;
    pointers.set(e.pointerId, midi);
    userPress(midi);
  });
  keysEl.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const m = keyAt(e.clientX, e.clientY);
    if (m == null) return;
    const midi = m + octave * 12;
    const cur = pointers.get(e.pointerId);
    if (midi === cur) return;
    noteOff(cur);
    pointers.set(e.pointerId, midi);
    userPress(midi);
  });
  const endPointer = (e) => {
    const midi = pointers.get(e.pointerId);
    if (midi == null) return;
    pointers.delete(e.pointerId);
    noteOff(midi);
  };
  keysEl.addEventListener('pointerup', endPointer);
  keysEl.addEventListener('pointercancel', endPointer);

  function userPress(midi) {
    noteOn(midi);
    if (game.running) gameHit(midi);
  }

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------
  $('instrument').addEventListener('change', (e) => { instrument = e.target.value; e.target.blur(); });
  volumeEl.addEventListener('input', () => { if (master) master.gain.value = volumeEl.value / 100; });
  volumeEl.addEventListener('change', () => volumeEl.blur());
  labelsEl.addEventListener('change', () => { updateLabels(); labelsEl.blur(); });
  $('octDown').addEventListener('click', (e) => { setOctave(octave - 1); e.currentTarget.blur(); });
  $('octUp').addEventListener('click', (e) => { setOctave(octave + 1); e.currentTarget.blur(); });
  sustainBtn.addEventListener('click', () => {
    sustainLocked = !sustain;
    setSustain(!sustain);
    sustainBtn.blur();
  });
  reverbBtn.addEventListener('click', () => {
    reverbOn = !reverbOn;
    reverbBtn.classList.toggle('on', reverbOn);
    if (wet) wet.gain.value = reverbOn ? 0.28 : 0;
    reverbBtn.blur();
  });
  ['song', 'mode', 'speed'].forEach((id) => $(id).addEventListener('change', (e) => e.target.blur()));

  // ---------------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------------
  let recording = false, recStart = 0, recEvents = [], playTimers = [];
  const recBtn = $('recBtn'), playBtn = $('playBtn'), clearBtn = $('clearBtn');

  recBtn.addEventListener('click', () => {
    recBtn.blur();
    if (!recording) {
      stopPlayback();
      recEvents = []; recStart = performance.now(); recording = true;
      recBtn.classList.add('on'); recBtn.textContent = '■ 停止錄音';
      playBtn.disabled = true; clearBtn.disabled = true;
    } else {
      recording = false;
      recBtn.classList.remove('on'); recBtn.textContent = '● 錄音';
      playBtn.disabled = clearBtn.disabled = recEvents.length === 0;
    }
  });
  playBtn.addEventListener('click', () => {
    playBtn.blur();
    if (playTimers.length) { stopPlayback(); return; }
    if (!recEvents.length) return;
    initAudio();
    const first = recEvents[0].t;
    for (const ev of recEvents) {
      playTimers.push(setTimeout(() => {
        ev.on ? noteOn(ev.midi, { record: false }) : noteOff(ev.midi, { record: false });
      }, ev.t - first));
    }
    const last = recEvents[recEvents.length - 1].t - first;
    playTimers.push(setTimeout(stopPlayback, last + 50));
    playBtn.textContent = '■ 停止';
  });
  clearBtn.addEventListener('click', () => {
    clearBtn.blur(); stopPlayback(); recEvents = [];
    playBtn.disabled = clearBtn.disabled = true;
  });
  function stopPlayback() {
    if (!playTimers.length) return;
    playTimers.forEach(clearTimeout); playTimers = [];
    allNotesOff();
    playBtn.textContent = '▶ 播放';
  }

  // ---------------------------------------------------------------------------
  // Visual trails (free play)
  // ---------------------------------------------------------------------------
  const trails = [];
  const openTrail = new Map();
  function trailStart(midi) {
    trailEnd(midi);
    const tr = { midi, start: performance.now(), end: null };
    trails.push(tr); openTrail.set(midi, tr);
  }
  function trailEnd(midi) {
    const tr = openTrail.get(midi);
    if (tr) { tr.end = performance.now(); openTrail.delete(midi); }
  }

  // ---------------------------------------------------------------------------
  // Game
  // ---------------------------------------------------------------------------
  const songEl = $('song'), modeEl = $('mode'), speedEl = $('speed'), startBtn = $('startBtn');
  const scoreEl = $('score'), comboEl = $('combo'), progressEl = $('progress'), judgeEl = $('judge');
  SONGS.forEach((s, i) => songEl.add(new Option(s.name, i)));

  const PERFECT = 0.08, GOOD = 0.17, LATE_MISS = 0.22, LEAD_IN = 2.5;
  const game = {
    running: false, notes: [], time: 0, mode: 'play',
    score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0, effects: [],
  };

  startBtn.addEventListener('click', () => {
    startBtn.blur();
    game.running ? stopGame(false) : startGame();
  });

  function startGame() {
    initAudio();
    stopPlayback();
    allNotesOff();
    setOctave(0);
    const song = SONGS[+songEl.value];
    const spb = 60 / song.bpm / parseFloat(speedEl.value);
    Object.assign(game, {
      running: true, mode: modeEl.value, time: -LEAD_IN,
      score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0, effects: [],
      notes: parseSong(song).map((n) => ({ midi: n.midi, t: n.beat * spb, dur: n.beats * spb, done: false })),
    });
    game.end = Math.max(...game.notes.map((n) => n.t + n.dur)) + 1.2;
    startBtn.textContent = '■ 停止';
    [songEl, modeEl, speedEl].forEach((el) => (el.disabled = true));
    updateHud();
  }

  function stopGame(finished) {
    game.running = false;
    allNotesOff();
    keyEls.forEach((el) => el.classList.remove('target'));
    startBtn.textContent = '▶ 開始';
    [songEl, modeEl, speedEl].forEach((el) => (el.disabled = false));
    if (finished && game.mode !== 'auto') showResult();
  }

  function nextPending() {
    for (const n of game.notes) if (!n.done) return n;
    return null;
  }

  function gameHit(midi) {
    if (game.mode === 'auto') return;
    let best = null, bestErr = Infinity;
    if (game.mode === 'wait') {
      const next = nextPending();
      if (!next || game.time < next.t - 0.35) return;
      for (const n of game.notes) {
        if (n.done || n.t > next.t + 0.001) continue;
        if (n.midi === midi) { best = n; bestErr = 0; break; }
      }
    } else {
      for (const n of game.notes) {
        if (n.done || n.midi !== midi) continue;
        const err = Math.abs(n.t - game.time);
        if (err < bestErr) { best = n; bestErr = err; }
      }
      if (bestErr > GOOD) best = null;
    }
    if (!best) return;
    best.done = true;
    if (bestErr <= PERFECT) judge(best, 'perfect'); else judge(best, 'good');
  }

  function judge(note, kind) {
    note.result = kind;
    if (kind === 'miss') {
      game.miss++; game.combo = 0;
    } else {
      game.combo++;
      game.maxCombo = Math.max(game.maxCombo, game.combo);
      const mult = 1 + Math.min(game.combo, 50) / 25;
      if (kind === 'perfect') { game.perfect++; game.score += Math.round(300 * mult); }
      else { game.good++; game.score += Math.round(120 * mult); }
      game.effects.push({ midi: note.midi, born: performance.now(), kind });
    }
    if (game.mode !== 'auto') showJudge(kind);
    updateHud();
  }

  function showJudge(kind) {
    const txt = { perfect: 'PERFECT', good: 'GOOD', miss: 'MISS' }[kind];
    judgeEl.textContent = game.combo > 2 && kind !== 'miss' ? `${txt}  ×${game.combo}` : txt;
    judgeEl.style.color = `var(--${kind})`;
    judgeEl.classList.remove('show'); void judgeEl.offsetWidth; judgeEl.classList.add('show');
  }

  function updateHud() {
    scoreEl.textContent = game.score.toLocaleString();
    comboEl.textContent = game.combo;
    const done = game.notes.filter((n) => n.done).length;
    progressEl.textContent = game.notes.length ? Math.round((done / game.notes.length) * 100) + '%' : '–';
  }

  function showResult() {
    const total = game.notes.length;
    const acc = (game.perfect + game.good * 0.6) / total;
    const grade = acc >= 0.95 ? 'S' : acc >= 0.85 ? 'A' : acc >= 0.7 ? 'B' : acc >= 0.5 ? 'C' : 'D';
    $('resultTitle').textContent = SONGS[+songEl.value].name + ' 完成！';
    $('grade').textContent = grade;
    $('resultStats').innerHTML = `
      <li>分數 <b>${game.score.toLocaleString()}</b></li>
      <li>準確率 <b>${Math.round(acc * 100)}%</b></li>
      <li>Perfect <b>${game.perfect}</b> · Good <b>${game.good}</b> · Miss <b>${game.miss}</b></li>
      <li>最大連擊 <b>${game.maxCombo}</b></li>`;
    $('result').hidden = false;
    $('resultClose').focus();
  }
  $('resultClose').addEventListener('click', () => { $('result').hidden = true; $('resultClose').blur(); });

  const autoReleases = [];
  function updateGame(dt) {
    if (game.mode === 'wait') {
      const next = nextPending();
      game.time = next ? Math.min(game.time + dt, next.t) : game.time + dt;
    } else {
      game.time += dt;
    }
    for (const n of game.notes) {
      if (n.done) continue;
      if (game.mode === 'auto' && game.time >= n.t) {
        n.done = true;
        noteOn(n.midi, { record: false });
        autoReleases.push({ midi: n.midi, at: n.t + Math.max(0.08, n.dur * 0.9) });
        judge(n, 'perfect');
      } else if (game.mode === 'play' && game.time > n.t + LATE_MISS) {
        n.done = true;
        judge(n, 'miss');
      }
    }
    for (let i = autoReleases.length - 1; i >= 0; i--) {
      if (game.time >= autoReleases[i].at) { noteOff(autoReleases[i].midi, { record: false }); autoReleases.splice(i, 1); }
    }
    // highlight upcoming target keys
    const next = nextPending();
    keyEls.forEach((el, m) => {
      const isTarget = !!next && game.mode !== 'auto' &&
        game.notes.some((n) => !n.done && n.midi === m && Math.abs(n.t - next.t) < 0.001 && n.t - game.time < 0.6);
      el.classList.toggle('target', isTarget);
    });
    if (game.time > game.end && !nextPending()) stopGame(true);
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutBlackKeys();
  }
  window.addEventListener('resize', resize);

  function keyRect(midi) {
    const el = keyEls.get(midi);
    if (!el) return null;
    return { x: keysEl.offsetLeft + el.offsetLeft, w: el.offsetWidth, black: isBlack(midi) };
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    cctx.beginPath();
    cctx.moveTo(x + r, y);
    cctx.arcTo(x + w, y, x + w, y + h, r);
    cctx.arcTo(x + w, y + h, x, y + h, r);
    cctx.arcTo(x, y + h, x, y, r);
    cctx.arcTo(x, y, x + w, y, r);
    cctx.closePath();
  }

  function drawBackground() {
    cctx.clearRect(0, 0, W, H);
    // lane guides at each C and F
    cctx.strokeStyle = 'rgba(255,255,255,0.05)';
    cctx.lineWidth = 1;
    for (let m = LOW; m <= HIGH; m++) {
      if (m % 12 !== 0 && m % 12 !== 5) continue;
      const r = keyRect(m);
      if (!r) continue;
      cctx.beginPath(); cctx.moveTo(r.x - 1.5, 0); cctx.lineTo(r.x - 1.5, H); cctx.stroke();
    }
  }

  function drawTrails(now) {
    const pps = H / 2.2 / 1000; // px per ms
    for (let i = trails.length - 1; i >= 0; i--) {
      const tr = trails[i];
      const dm = tr.midi - octave * 12;
      const bottom = tr.end == null ? H : H - (now - tr.end) * pps;
      if (bottom < 0) { trails.splice(i, 1); continue; }
      const r = keyRect(dm);
      if (!r) continue;
      const top = H - (now - tr.start) * pps;
      const g = cctx.createLinearGradient(0, top, 0, bottom);
      const c = r.black ? '255,140,40' : '255,200,90';
      g.addColorStop(0, `rgba(${c},0)`);
      g.addColorStop(1, `rgba(${c},0.85)`);
      cctx.fillStyle = g;
      roundRect(r.x + 2, top, r.w - 4, Math.max(2, bottom - top), 5);
      cctx.fill();
    }
  }

  function drawGame(now) {
    const pps = H / 2.0; // px per second (2 seconds visible)
    for (const n of game.notes) {
      if (n.done && n.result !== 'miss') continue;
      const yBottom = H - (n.t - game.time) * pps;
      const h = Math.max(12, n.dur * pps - 4);
      const yTop = yBottom - h;
      if (yTop > H || yBottom < 0) continue;
      const r = keyRect(n.midi);
      if (!r) continue;
      const x = r.x + (r.black ? 0 : 3), w = r.w - (r.black ? 0 : 6);
      if (n.result === 'miss') {
        cctx.fillStyle = 'rgba(255,107,122,0.25)';
      } else {
        const g = cctx.createLinearGradient(0, yTop, 0, yBottom);
        if (r.black) { g.addColorStop(0, '#2f9e97'); g.addColorStop(1, '#5ad1c9'); }
        else { g.addColorStop(0, '#d27f17'); g.addColorStop(1, '#ffc35c'); }
        cctx.fillStyle = g;
      }
      roundRect(x, yTop, w, h, 6);
      cctx.fill();
      if (!n.done && labelsEl.value !== 'none' && h > 16) {
        cctx.fillStyle = 'rgba(20,12,0,0.75)';
        cctx.font = '600 11px system-ui, sans-serif';
        cctx.textAlign = 'center';
        const lbl = labelsEl.value === 'key' ? (labelsFor[n.midi] || []).slice(-1)[0] || '' :
          labelsEl.value === 'solfege' ? SOLFEGE[n.midi % 12] : NAMES[n.midi % 12];
        cctx.fillText(lbl, x + w / 2, yBottom - 6);
      }
    }
    // hit effects
    for (let i = game.effects.length - 1; i >= 0; i--) {
      const fx = game.effects[i];
      const age = (now - fx.born) / 400;
      if (age > 1) { game.effects.splice(i, 1); continue; }
      const r = keyRect(fx.midi);
      if (!r) continue;
      const cx = r.x + r.w / 2;
      cctx.strokeStyle = fx.kind === 'perfect' ? `rgba(125,255,155,${1 - age})` : `rgba(90,209,201,${1 - age})`;
      cctx.lineWidth = 3;
      cctx.beginPath(); cctx.arc(cx, H - 4, 8 + age * 34, Math.PI, 2 * Math.PI); cctx.stroke();
    }
    // lead-in countdown
    if (game.time < 0) {
      cctx.fillStyle = 'rgba(255,255,255,0.85)';
      cctx.font = '800 64px system-ui, sans-serif';
      cctx.textAlign = 'center';
      cctx.fillText(String(Math.ceil(-game.time)), W / 2, H / 2 + 20);
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (game.running) updateGame(dt);
    drawBackground();
    drawTrails(now);
    if (game.running) drawGame(now);
    requestAnimationFrame(frame);
  }

  buildKeyboard();
  resize();
  requestAnimationFrame(frame);
})();
