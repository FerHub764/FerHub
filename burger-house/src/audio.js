// Sons sintetizados (WebAudio) — nada de arquivos externos
export class Sound {
  constructor() {
    this.ctx = null; this.muted = false; this.ambient = null;
    try { this.muted = localStorage.getItem('bh-muted') === '1'; } catch { /* sem storage */ }
  }
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 1; this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.004 ? 3 : 0.6); // chiado + estalos
      this.noise = buf;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('bh-muted', m ? '1' : '0'); } catch { /* ok */ }
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05);
  }
  click(freq = 620) {
    const c = this.ensure(); if (!c || this.muted) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.08);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.14);
  }
  sizzleNode(vol) {
    const c = this.ctx, src = c.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const bp = c.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = 6000; bp.gain.value = 6;
    const g = c.createGain(); g.gain.value = 0.0001;
    src.connect(hp).connect(bp).connect(g).connect(this.master);
    src.start(0, Math.random() * 1.5);
    return { src, g, vol };
  }
  sizzle(dur = 0.8, vol = 0.05) {
    const c = this.ensure(); if (!c || this.muted) return;
    const n = this.sizzleNode(vol), t = c.currentTime;
    n.g.gain.exponentialRampToValueAtTime(vol, t + 0.05); n.g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.src.stop(t + dur + 0.05);
  }
  setAmbient(on) {
    const c = this.ctx; if (!c) return;
    if (on && !this.ambient) { this.ambient = this.sizzleNode(0.018); this.ambient.g.gain.setTargetAtTime(0.018, c.currentTime, 0.6); }
    if (!on && this.ambient) { const a = this.ambient; a.g.gain.setTargetAtTime(0.0001, c.currentTime, 0.3); a.src.stop(c.currentTime + 1.2); this.ambient = null; }
  }
}
