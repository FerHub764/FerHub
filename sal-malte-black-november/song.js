// THE SONG — a pagode groove (surdo, pandeiro, tamborim, cavaquinho, 7-string bass)
// that turns into a samba-funk drop with brass for Black November.
//   node song.js            (STEMS=1 writes out/stem-*.wav, LUFS=-12 sets loudness)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const perc = bus(), drums = bus(), bass = bus(), cav = bus(), pad = bus(), lead = bus(), brass = bus(), fx = bus();
const verb = bus(), dly = bus();
const silent = (t) => t >= ev.breath && t < ev.drop;

// ---------- percussion: pagode from the foam (bar 2) to the end ----------
const SURDO = I.tom(58, 0.55, 3), SURDO_M = I.tom(62, 0.1, 4);
const SH = [I.shaker(1, 15), I.shaker(0.6, 16), I.shaker(0.5, 17), I.shaker(1.3, 18)];
const TAMB = [I.rim(1.6, 3), I.rim(1.7, 4)];
const PARTIDO = new Set([0, 3, 6, 10, 12]); // partido-alto on 16ths
const K = I.kick({ punch: 1.1 }), CL = I.clap(), SN = I.snare(), HO = I.hat(true, 14), CR = I.crash(18), CR2 = I.crash(21);
const kicks = [];
clock.eachStep(2, 16, 16, (t, b, s) => {
  if (silent(t) || t > ev.end + 0.6) return;
  const drop = b >= 10 && b < 13;
  const outro = b >= 13;
  // surdo: strong on 2 and 4, muted on 1 and 3
  if (s === 4 || s === 12) { perc.addMono(SURDO, t, 0.9); kicks.push(t); }
  if (s === 0 || s === 8) perc.addMono(SURDO_M, t, 0.45);
  // pandeiro: every 16th, accent on the last 16th of each beat
  perc.addMono(SH[s % 4], t, outro ? 0.12 : 0.16, 0.25);
  // tamborim
  if (PARTIDO.has(s) && b >= 5) perc.addMono(TAMB[s % 2], t, 0.22, -0.35);
  if (drop) {
    if (s % 4 === 0) { drums.addMono(K, t, 0.9); kicks.push(t); }
    if (s === 4 || s === 12) { drums.addMono(CL, t, 0.55); drums.addMono(SN, t, 0.25); verb.addMono(CL, t, 0.25); }
    if (s % 4 === 2) drums.addMono(HO, t, 0.13, 0.3);
  }
});
drums.addMono(CR, ev.drop, 0.5, -0.2);
drums.addMono(CR2, ev.endCard, 0.35, 0.2);
// tamborim roll into each scene cut
for (const bar of [5, 7]) for (let i = 0; i < 4; i++) perc.addMono(TAMB[i % 2], T(bar - 1, 3) + i * BEAT / 4, 0.18 + i * 0.04, -0.3);

// ---------- cavaquinho: syncopated chord stabs (from the very start) ----------
clock.eachStep(0, 16, 16, (t, b, s) => {
  if (silent(t) || t > ev.end + 0.6) return;
  const c = sc.chordAt(t);
  if (!c) return;
  const intro = b < 2;
  if (!(PARTIDO.has(s) || (intro && s === 14))) return;
  const dur = s === 6 || s === 12 ? BEAT * 0.7 : BEAT * 0.35;
  c.notes.forEach((n, k) => {
    const g = I.guitar(n + 12, dur, { bright: 0.75, sustain: 0.993, seed: 40 + k + s });
    cav.addMono(g, t + k * 0.008, intro ? 0.22 : 0.17, 0.2 - k * 0.15);
  });
});

// ---------- 7-string bass: root on 1, fifth on 3, a walk-up on 4 ----------
clock.eachStep(2, 16, 8, (t, b, s) => {
  if (silent(t) || t > ev.end + 0.4) return;
  const c = sc.chordAt(t);
  if (!c) return;
  const R = c.bass + 12;
  const drop = b >= 10 && b < 13;
  if (s === 0) bass.addMono(I.bass(R, BEAT * 0.9, { sub: drop ? 0.9 : 0.5 }), t, 0.6);
  else if (s === 4) bass.addMono(I.bass(R + 7, BEAT * 0.8, { sub: 0.5 }), t, 0.5);
  else if (s === 6) bass.addMono(I.bass(R + 9, BEAT * 0.4), t, 0.4);
  else if (s === 7) bass.addMono(I.bass(R + 11, BEAT * 0.4), t, 0.4);
  else if (drop && s % 2 === 1) bass.addMono(I.bass(R + 12, BEAT * 0.3), t, 0.3);
});
bass.addMono(I.bass(m('C2'), 2.5, { sub: 1 }), ev.end, 0.5);

// ---------- warm pad (soft, under everything) ----------
for (const c of sc.chords) {
  if (c.t0 >= ev.breath && c.t0 < ev.drop) continue;
  const t1 = c.t0 < ev.breath && c.t1 > ev.breath ? ev.breath : c.t1;
  for (const n of c.notes) { const { L, R } = I.padNote(n - 12, t1 - c.t0, { cutoff: 1100, attack: 0.3, release: 0.8 }); pad.addStereo(L, R, c.t0, 0.05); }
}

// ---------- the floating notes the singer sends out (bars 4-5) ----------
for (const n of sc.leadA) {
  const x = I.epiano(n.midi, n.dur * 1.4, { index: 1.2, decay: 0.8 });
  lead.addMono(x, n.t, 0.35, 0.1);
  verb.addMono(x, n.t, 0.15); dly.addMono(x, n.t, 0.06);
}

// ---------- brass hook on the drop ----------
for (const n of sc.brass) {
  const a = I.brassNote(n.midi, n.dur * 0.9, { stab: n.dur < 0.3 ? 1 : 0 }), b = I.brassNote(n.midi - 12, n.dur * 0.9, { bright: 0.8, seed: 99 });
  brass.addStereo(a.L, a.R, n.t, 0.3); brass.addStereo(b.L, b.R, n.t, 0.16);
  verb.addStereo(a.L, a.R, n.t, 0.12); dly.addStereo(a.L, a.R, n.t, 0.04);
}

// ---------- fx, each one tied to an event in the score ----------
// the chopp pour: a soft filtered hiss that rises as the glass fills
fx.addMono(I.noiseSweep(ev.foam - ev.pourStart - 0.15, 500, 2600, { q: 1.4, pink: true, shape: (x) => Math.sin(Math.PI * Math.min(1, x * 1.1)) }), ev.pourStart, 0.16);
fx.addMono(I.pop(1400, 5), ev.foam - 0.005, 0.55);
fx.addMono(I.bell(2637, 0.9, 2.2, 3.01), ev.foam, 0.18, 0.2); // the glass "tim"
fx.addMono(I.thud(90, 0.09), ev.foam, 0.4);
for (const [i, d] of sc.dishes.entries()) {
  fx.addMono(I.pop(1200 + i * 350, 30 + i), d.t, 0.5, -0.3 + i * 0.2);
  const mb = I.marimba([m('C5'), m('E5'), m('G5'), m('C6')][i], { thock: 0.3 });
  lead.addMono(mb, d.t, 0.3, -0.3 + i * 0.2); verb.addMono(mb, d.t, 0.1);
}
fx.addMono(I.noiseSweep(0.35, 300, 4000, { q: 0.8, pink: true }), T(5) - 0.35, 0.18); // whoosh into each cut
fx.addMono(I.noiseSweep(0.35, 300, 4000, { q: 0.8, pink: true }), T(7) - 0.35, 0.18);
fx.addMono(I.noiseSweep(0.35, 300, 4000, { q: 0.8, pink: true }), T(3) - 0.35, 0.18);
for (const [i, b] of sc.barks.entries()) {
  fx.addMono(I.voice(m('A4') - i * 2, 0.11, { syl: 'a', type: 'alto', shout: 1.6, seed: 70 + i, breath: 0.25, vib: 0 }), b, 0.6, 0.35);
  fx.addMono(I.woodTick(0.7), b, 0.3, 0.35);
}
// riser into the breath, then silence, then the drop
fx.addMono(I.noiseSweep(ev.breath - T(9), 200, 9000, { q: 0.9, shape: (x) => x * x, pink: true }), T(9), 0.45);
fx.addMono(I.subBoom(2.2), ev.drop, 0.75);
fx.addMono(I.thwack(), ev.drop, 0.4);
for (const s of sc.stamps.slice(1)) fx.addMono(I.thud(120, 0.06), s.t, 0.35);
fx.addMono(I.thwack(), ev.pct, 0.95);
fx.addMono(I.pop(900, 44), ev.pct, 0.6);
drums.addMono(CR2, ev.pct, 0.45, 0.1);
fx.addMono(I.thud(90, 0.07), ev.pct, 0.5);
fx.addMono(I.paperFwip(1.1, 9), ev.endCard - 0.02, 0.3);
fx.addMono(I.thud(100, 0.08), ev.endCard, 0.35);
fx.addMono(I.bell(2093, 1.2, 2, 3.01), ev.end, 0.15);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => t >= ev.drop && t < ev.endCard));
const stems = {
  perc, drums, bass, cav, pad, lead, brass, fx,
  verb: reverb(verb, { room: 0.8, damp: 0.35 }),
  dly: pingpong(dly, BEAT * 0.75, 0.35, 3500),
};
const GAIN = { perc: 0.4, drums: 0.45, bass: 0.7, cav: 4.2, pad: 2.4, lead: 1.0, brass: 1.9, fx: 0.85, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
MIX.gate(mix, ev.breath, ev.drop);
MIX.gate(mix, ev.pct - BEAT / 2, ev.pct); // a samba "breque": an 8th of held breath, then the 30% slam
MIX.fadeOut(mix, DURATION - 1.8, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -12 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
