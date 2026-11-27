// Música chiptune e efeitos sonoros sintetizados na hora com Web Audio.
// Nenhum arquivo de áudio: tudo é oscilador, ruído e envelope.
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midiOf(n) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) throw new Error(`nota inválida ${n}`);
  return (parseInt(m[3], 10) + 1) * 12 + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const freq = (n) => hz(midiOf(n));

function chordNotes(name) {
  const m = /^([A-G])([#b]?)(m?)$/.exec(name);
  const root = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return [root, root + (m[3] ? 3 : 4), root + 7];
}

export const TRACKS = {
  title: {
    bpm: 84, chords: ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'], bass: 'long', arp: 'updown', arpVol: 0.035, drums: null, lead: 'tri', echo: true, leadVol: 0.11,
    melody: [
      'A4 - - - C5 - - - F5 - - - E5 - - -', 'D5 - - - - - - - B4 - - - G4 - - -',
      'G4 - - - B4 - - - E5 - - - D5 - - -', 'C5 - - - - - - - - - - - . . . .',
      'A4 - - - C5 - - - F5 - - - G5 - - -', 'A5 - - - G5 - - - F5 - - - D5 - - -',
      'E5 - - - - - - - D5 - - - C5 - - -', 'C5 - - - - - - - - - - - . . . .',
    ],
  },
  w1: {
    bpm: 116, chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'], bass: 'octave', arp: 'up', arpVol: 0.03, lead: 'sq25', leadVol: 0.085,
    drums: 'k . h . s . h . k . k h s . h h',
    melody: [
      'E5 - - . A5 - G5 - E5 - - . C5 - D5 -', 'C5 - - . A4 - - . C5 - D5 - E5 - - .',
      'G5 - - . E5 - G5 - A5 - G5 - E5 - D5 -', 'D5 - - - B4 - - . D5 - E5 - D5 - B4 -',
      'E5 - - . A5 - B5 - C6 - B5 - A5 - G5 -', 'A5 - - . F5 - - . A5 - G5 - F5 - E5 -',
      'G5 - - . E5 - C5 - E5 - G5 - C6 - - .', 'B5 - - - G5 - - . A5 - - - - - . .',
    ],
  },
  w2: {
    bpm: 104, chords: ['Em', 'C', 'D', 'Bm', 'Em', 'C', 'Am', 'B'], bass: 'pulse', arp: 'up', arpOct: 5, arpVol: 0.022, lead: 'sq12', leadVol: 0.08, echo: true,
    drums: 'k . . h s . . h k . k h s . . h',
    melody: [
      'E5 - - . G5 - B5 - - . A5 - G5 - F#5 -', 'E5 - - . - . G5 - - . E5 - C5 - - .',
      'D5 - - . F#5 - A5 - - . G5 - F#5 - D5 -', 'F#5 - - - - - - . D5 - - . B4 - - .',
      'E5 - - . G5 - B5 - - . E6 - D6 - B5 -', 'C6 - - . B5 - G5 - - . E5 - G5 - - .',
      'A5 - - . G5 - E5 - - . C5 - E5 - A5 -', 'B5 - - - - - - - D#5 - - - F#5 - - -',
    ],
  },
  w3: {
    bpm: 96, chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'C', 'A'], bass: 'octave', arp: 'updown', arpVol: 0.026, lead: 'tri', leadVol: 0.13, echo: true,
    drums: 'k . . . s . . h k . h . s . h .',
    melody: [
      'D5 - - - F5 - - . A5 - - - G5 - F5 -', 'D5 - - - - - - . Bb4 - - . C5 - D5 -',
      'G5 - - - F5 - - . D5 - - - Bb4 - - .', 'A4 - - - - - - - C#5 - - - E5 - - -',
      'D5 - - - F5 - - . A5 - - - D6 - C6 -', 'Bb5 - - - A5 - - . F5 - - - D5 - - .',
      'E5 - - - G5 - - . C6 - - - Bb5 - A5 -', 'A5 - - - - - - - - - - - . . . .',
    ],
  },
  rise: {
    bpm: 150, chords: ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'A'], bass: 'octave', arp: 'up', arpVol: 0.025, lead: 'sq25', leadVol: 0.08,
    drums: 'k . h k s . h . k . h k s . h h',
    melody: [
      'D5 . D5 . F5 . D5 . A5 - G5 - F5 - E5 -', 'F5 - - . E5 . D5 . E5 - F5 - A4 - - .',
      'Bb4 . D5 . F5 . Bb5 . A5 - F5 - D5 - - .', 'C5 . E5 . G5 . C6 . Bb5 - G5 - E5 - - .',
      'D6 - - . C6 - A5 - - . F5 - A5 - D6 -', 'C6 - A5 - F5 - A5 - G5 - F5 - E5 - D5 -',
      'D5 - F5 - Bb5 - - . A5 - G5 - F5 - - .', 'E5 - - . C#5 - - . A4 - C#5 - E5 - A5 -',
    ],
  },
  ending: {
    bpm: 108, chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'], bass: 'octave', arp: 'updown', arpVol: 0.03, lead: 'sq25', leadVol: 0.085, echo: true,
    drums: 'k . h . s . h . k . h k s . h .',
    melody: [
      'E5 - - . G5 - - . C6 - - - B5 - G5 -', 'D5 - - . G5 - - . B5 - - - A5 - G5 -',
      'C5 - - . E5 - - . A5 - - - G5 - E5 -', 'F5 - - - - - - . E5 - D5 - C5 - - .',
      'E5 - - . G5 - - . C6 - - - D6 - E6 -', 'D6 - - . B5 - - . G5 - - - A5 - B5 -',
      'C6 - - . A5 - - . F5 - - - G5 - A5 -', 'G5 - - - - - - - C6 - - - - - - .',
    ],
  },
};

export class Audio {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.track = null;
    this.wanted = null;
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC(); } catch { return; }
      const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = 0.9;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      this.master.connect(comp); comp.connect(c.destination);
      this.musicBus = c.createGain(); this.musicBus.gain.value = this.musicOn ? 1 : 0; this.musicBus.connect(this.master);
      this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.sfxOn ? 1 : 0; this.sfxBus.connect(this.master);
      this.echo = c.createDelay(1); this.echo.delayTime.value = 0.27;
      const fb = c.createGain(); fb.gain.value = 0.32;
      const wet = c.createGain(); wet.gain.value = 0.35;
      this.echo.connect(fb); fb.connect(this.echo); this.echo.connect(wet); wet.connect(this.musicBus);
      this.waves = { sq12: this.pulse(0.125), sq25: this.pulse(0.25), sq50: this.pulse(0.5) };
      const len = c.sampleRate;
      this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (this.wanted && !this.track) this.play(this.wanted);
  }

  pulse(duty) {
    const n = 40, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) re[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    return this.ctx.createPeriodicWave(re, im);
  }

  setMusic(on) { this.musicOn = on; if (this.musicBus) this.musicBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05); }
  setSfx(on) { this.sfxOn = on; if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.02); }

  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }

  // ---------- música ----------
  play(name) {
    this.wanted = name;
    if (!this.ctx) return;
    if (this.track && this.track.name === name) return;
    this.stopMusic();
    const spec = TRACKS[name];
    if (!spec) return;
    this.track = { name, spec, parsed: this.parseTrack(spec) };
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.trackGain = this.ctx.createGain();
    this.trackGain.gain.value = 1;
    this.trackGain.connect(this.musicBus);
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.trackGain && this.ctx) {
      const g = this.trackGain;
      g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      setTimeout(() => { try { g.disconnect(); } catch { /* já desligado */ } }, 600);
    }
    this.track = null;
  }

  parseTrack(spec) {
    const bars = spec.chords.length;
    const lead = [];
    spec.melody.forEach((bar, bi) => {
      const toks = bar.trim().split(/\s+/);
      toks.forEach((tk, si) => {
        if (tk === '-' || tk === '.') return;
        let len = 1;
        for (let k = si + 1; k < toks.length && toks[k] === '-'; k++) len++;
        lead[bi * 16 + si] = { f: freq(tk), len };
      });
    });
    const drums = spec.drums ? spec.drums.split(/\s+/) : null;
    return { bars, lead, drums, chords: spec.chords.map(chordNotes) };
  }

  schedule() {
    const c = this.ctx;
    if (!this.track || !c) return;
    const { spec, parsed } = this.track;
    const sd = 60 / spec.bpm / 4;
    while (this.nextTime < c.currentTime + 0.15) {
      this.playStep(this.step, this.nextTime, sd, spec, parsed);
      this.nextTime += sd;
      this.step = (this.step + 1) % (parsed.bars * 16);
    }
  }

  playStep(step, t, sd, spec, P) {
    const bar = (step / 16) | 0, s = step % 16;
    const ch = P.chords[bar];
    const out = this.trackGain;
    const n = P.lead[step];
    if (n) this.note(spec.lead, n.f, t, n.len * sd * 0.95, spec.leadVol, out, spec.echo, n.len >= 4);
    const root = ch[0];
    if (spec.bass === 'octave' && s % 2 === 0) this.note('tri', hz(36 + root + (s % 4 === 2 ? 12 : 0)), t, sd * 1.6, 0.2, out);
    if (spec.bass === 'pulse' && s % 2 === 0) this.note('tri', hz(36 + root + (s === 14 ? 7 : 0)), t, sd * 1.5, 0.2, out);
    if (spec.bass === 'long' && s % 8 === 0) this.note('tri', hz(36 + root), t, sd * 7.5, 0.18, out);
    if (spec.arp) {
      const oct = 12 * ((spec.arpOct || 4) + 1);
      const seq = spec.arp === 'up' ? [0, 1, 2, 1] : [0, 1, 2, 3, 2, 1];
      const k = seq[s % seq.length];
      const semi = k === 3 ? ch[0] + 12 : ch[k];
      if (spec.bass !== 'long' || s % 2 === 0) this.note('sq12', hz(oct + semi), t, sd * 0.8, spec.arpVol, out, spec.echo && spec.lead === 'tri');
    }
    if (P.drums) {
      const d = P.drums[s];
      if (d === 'k') this.kick(t, out);
      else if (d === 's') this.snare(t, out);
      else if (d === 'h') this.hat(t, out);
    }
  }

  note(wave, f, t, dur, vol, out, echo = false, vib = false) {
    const c = this.ctx;
    const o = c.createOscillator();
    if (wave === 'tri') o.type = 'triangle';
    else if (wave === 'sine') o.type = 'sine';
    else o.setPeriodicWave(this.waves[wave] || this.waves.sq25);
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.setTargetAtTime(vol * 0.6, t + 0.02, 0.08);
    g.gain.setTargetAtTime(0, t + dur, 0.03);
    o.connect(g); g.connect(out);
    if (echo) g.connect(this.echo);
    if (vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = 5.5; lg.gain.value = 9;
      l.connect(lg); lg.connect(o.detune);
      l.start(t + 0.12); l.stop(t + dur + 0.2);
    }
    o.start(t); o.stop(t + dur + 0.2);
  }

  noise(t, dur, vol, type, f0, f1, out, q = 1) {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  kick(t, out) {
    const c = this.ctx;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.18);
  }
  snare(t, out) { this.noise(t, 0.12, 0.14, 'bandpass', 2200, 1400, out, 0.8); this.tone('tri', 200, 120, t, 0.06, 0.08, out); }
  hat(t, out) { this.noise(t, 0.035, 0.06, 'highpass', 7500, 7500, out); }

  tone(wave, f0, f1, t, dur, vol, out = this.sfxBus) {
    const c = this.ctx;
    const o = c.createOscillator();
    if (wave === 'tri') o.type = 'triangle';
    else if (wave === 'sine' || wave === 'sawtooth') o.type = wave;
    else o.setPeriodicWave(this.waves[wave] || this.waves.sq25);
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // ---------- efeitos ----------
  sfx(name, v = 0) {
    const c = this.ctx;
    if (!c || !this.sfxOn || c.state !== 'running') return;
    const t = c.currentTime + 0.005;
    const out = this.sfxBus;
    switch (name) {
      case 'jump': this.tone('sq25', 320, 640, t, 0.11, 0.13); break;
      case 'walljump': this.tone('sq50', 260, 820, t, 0.1, 0.11); this.noise(t, 0.05, 0.05, 'highpass', 3000, 3000, out); break;
      case 'dashjump': this.tone('sq25', 440, 1100, t, 0.12, 0.12); break;
      case 'dash':
        this.noise(t, 0.2, 0.32, 'bandpass', 2600, 420, out, 1.2);
        this.tone('sawtooth', 240, 70, t, 0.16, 0.06);
        break;
      case 'land': this.noise(t, 0.07, 0.22, 'lowpass', 500, 200, out); break;
      case 'coin': {
        const f = 988 * Math.pow(2, Math.min(v, 14) / 12);
        this.tone('sq25', f, f, t, 0.05, 0.08);
        this.tone('sq25', f * 1.335, f * 1.335, t + 0.05, 0.09, 0.08);
        break;
      }
      case 'gem':
        ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => this.tone('sq12', freq(n), freq(n), t + i * 0.06, 0.12, 0.1));
        this.tone('tri', freq('C6'), freq('C6'), t + 0.24, 0.5, 0.12);
        this.tone('tri', freq('G6'), freq('G6'), t + 0.24, 0.5, 0.06);
        break;
      case 'kill': {
        const k = Math.pow(2, (Math.min(v, 8) * 2) / 12);
        this.noise(t, 0.14, 0.3, 'lowpass', 2400, 300, out);
        this.tone('sq50', 520 * k, 130 * k, t, 0.14, 0.12);
        if (v >= 2) this.tone('sq12', 880 * k, 880 * k, t + 0.05, 0.12, 0.06);
        break;
      }
      case 'clang': this.tone('sq50', 1400, 1300, t, 0.09, 0.08); this.tone('sq50', 1870, 1800, t, 0.12, 0.05); this.noise(t, 0.06, 0.12, 'highpass', 4000, 4000, out); break;
      case 'spring': this.tone('sine', 180, 760, t, 0.2, 0.25); this.tone('sq12', 360, 1400, t, 0.14, 0.04); break;
      case 'orb': this.tone('sine', 500, 1500, t, 0.22, 0.16); this.tone('tri', 1500, 1500, t + 0.08, 0.2, 0.06); break;
      case 'die': this.tone('sq50', 520, 60, t, 0.45, 0.14); this.noise(t, 0.35, 0.25, 'lowpass', 1600, 200, out); break;
      case 'fizz': this.noise(t, 0.7, 0.3, 'highpass', 2500, 5000, out); this.tone('sine', 320, 90, t, 0.3, 0.12); break;
      case 'checkpoint':
        ['C5', 'E5', 'G5'].forEach((n, i) => this.tone('tri', freq(n), freq(n), t + i * 0.05, 0.6, 0.11));
        this.tone('sq12', freq('C6'), freq('C6'), t + 0.15, 0.3, 0.05);
        this.tone('sq12', freq('E6'), freq('E6'), t + 0.22, 0.4, 0.05);
        break;
      case 'crack': this.noise(t, 0.05, 0.12, 'bandpass', 900, 900, out, 2); this.noise(t + 0.07, 0.05, 0.1, 'bandpass', 700, 700, out, 2); break;
      case 'crumble': this.noise(t, 0.4, 0.3, 'lowpass', 700, 150, out); break;
      case 'shoot': this.tone('sine', 440, 170, t, 0.13, 0.14); break;
      case 'pop': this.tone('sine', 800, 1300, t, 0.07, 0.12); break;
      case 'drip': this.tone('sine', 1300, 620, t, 0.06, 0.05); break;
      case 'spawn': this.tone('tri', 300, 900, t, 0.22, 0.08); break;
      case 'win':
        ['G5', 'C6', 'E6', 'G6'].forEach((n, i) => this.tone('sq25', freq(n), freq(n), t + i * 0.08, 0.12, 0.09));
        ['C6', 'E6', 'G6'].forEach((n) => this.tone('sq25', freq(n), freq(n), t + 0.34, 0.7, 0.06));
        this.tone('tri', freq('C4'), freq('C4'), t + 0.34, 0.8, 0.2);
        break;
      case 'ui': this.tone('sq25', 880, 880, t, 0.04, 0.07); break;
      case 'uiBack': this.tone('sq25', 520, 440, t, 0.05, 0.07); break;
      case 'buy': ['E6', 'G6', 'B6', 'E7'].forEach((n, i) => this.tone('sq12', freq(n), freq(n), t + i * 0.05, 0.1, 0.08)); break;
      case 'nope': this.tone('sq50', 220, 180, t, 0.12, 0.08); break;
      case 'pause': this.tone('sq25', 660, 440, t, 0.08, 0.08); break;
      case 'tick': this.tone('sq12', 1600, 1600, t, 0.02, 0.05); break;
      default:
    }
  }
}
