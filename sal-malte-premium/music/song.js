// Samba-house soundtrack for the Sal & Malte Black November ad.
// Reads the same timeline as the Remotion video, so every hit lands on its cut.
//   node music/song.js            -> public/music.wav   (STEMS=1 also writes music/out/stem-*.wav)
const path = require('path');
const { SR, Bus, reverb, pingpong, SVF } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const { makeClock, m } = require('./engine/music');
const TL = require('../src/timeline.json');

const F = (f) => f / TL.fps; // frame -> seconds
const clock = makeClock({ bpm: TL.bpm, offset: 0 });
const { T, BEAT } = clock;
const DURATION = F(TL.total);
const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const kickB = bus(), perc = bus(), bass = bus(), keys = bus(), pad = bus(), lead = bus(), brass = bus(), fx = bus(), verb = bus(), dly = bus();

const DROP = F(TL.drop), BREATH = F(TL.breath), END = F(TL.endHit);
const bar = (t) => Math.floor(t / (BEAT * 4));

// harmony: Am9 - Fmaj9 - Dm9 - E7(b9) ... (a minor, warm and night-time)
const PROG = [
  { name: 'Am9', notes: ['C4', 'E4', 'G4', 'B4'], bass: 'A1' },
  { name: 'Fmaj9', notes: ['A3', 'C4', 'E4', 'G4'], bass: 'F1' },
  { name: 'Dm9', notes: ['F3', 'A3', 'C4', 'E4'], bass: 'D2' },
  { name: 'E7b9', notes: ['G#3', 'B3', 'D4', 'F4'], bass: 'E1' },
];
const chordAt = (t) => PROG[bar(t) % 4];
const midi = (n) => (typeof n === 'number' ? n : m(n));

// ---------------------------------------------------------- drums
const K = I.kick({ punch: 1.0, tail: 0.9 }), CL = I.clap(), HO = I.hat(true, 14), HC = [I.hat(false, 11), I.hat(false, 12)];
const SH = [I.shaker(1, 15), I.shaker(0.55, 16), I.shaker(0.5, 17), I.shaker(1.2, 18)];
const RIM = [I.rim(1.5, 3), I.rim(1.65, 4)], SURDO = I.tom(62, 0.45, 3);
const CR = I.crash(18);
const PARTIDO = new Set([0, 3, 6, 10, 12]);
const kicks = [];
clock.eachStep(0, Math.ceil(DURATION / (BEAT * 4)) + 1, 16, (t, b, s) => {
  if (t >= DURATION - 0.05) return;
  if (t >= BREATH && t < DROP) return;           // the held breath before the drop
  const intro = t < F(TL.scenes.menu[0]);
  const build = t >= F(TL.scenes.build[0]) && t < BREATH;
  const outro = t >= END + BEAT * 8;
  perc.addMono(SH[s % 4], t, intro ? 0.10 : 0.14, 0.3);
  if (intro) return;
  if (!build && !outro && s % 4 === 0) { kickB.addMono(K, t, 0.95); kicks.push(t); }
  if (build && s % 4 === 0) { kickB.addMono(K, t, 0.5 + 0.4 * ((t - F(TL.scenes.build[0])) / (BREATH - F(TL.scenes.build[0])))); }
  if (s === 4 || s === 12) { perc.addMono(CL, t, 0.5); verb.addMono(CL, t, 0.18); }
  if (s % 4 === 2) perc.addMono(HO, t, 0.10, -0.25);
  if (PARTIDO.has(s)) perc.addMono(RIM[s % 2], t, 0.16, -0.4);
  if (s === 14 && !build) perc.addMono(SURDO, t, 0.55);
  if (t >= DROP && t < END && s % 2 === 1) perc.addMono(HC[s % 2], t, 0.08, 0.3);
});
perc.addMono(CR, F(TL.scenes.menu[0]), 0.25, -0.2);
perc.addMono(CR, DROP, 0.42, 0.2);
perc.addMono(CR, END, 0.3, -0.1);

// ---------------------------------------------------------- bass: deep, syncopated, sidechained
clock.eachStep(2, 16, 8, (t, b, s) => {
  if (t >= DURATION - 0.3 || (t >= BREATH && t < DROP)) return;
  if (t >= F(TL.scenes.build[0]) && t < BREATH) return; // bass drops out in the build
  const R = midi(chordAt(t).bass) + 12;
  const pattern = { 0: [0, 0.8], 3: [0, 0.35], 4: [12, 0.3], 6: [0, 0.5], 7: [7, 0.3] };
  const p = pattern[s];
  if (p) bass.addMono(I.bass(R + p[0], BEAT * p[1] * 2, { bright: 0.25, sub: 0.9 }), t, 0.6);
});

// ---------------------------------------------------------- keys: rhodes stabs + pads
clock.eachStep(0, 16, 16, (t, b, s) => {
  if (t >= DURATION - 0.5 || (t >= BREATH && t < DROP)) return;
  const c = chordAt(t);
  const hit = t < F(TL.scenes.menu[0]) ? (s === 0 || s === 6 || s === 10) : PARTIDO.has(s);
  if (!hit) return;
  const dur = s === 0 ? BEAT * 1.6 : BEAT * 0.6;
  c.notes.forEach((n, k) => {
    const e = I.epiano(midi(n), dur, { index: 1.1, decay: 0.7 });
    keys.addMono(e, t + k * 0.006, 0.16, -0.25 + k * 0.16);
    if (s === 0) dly.addMono(e, t, 0.03);
  });
});
for (let b = 0; b < 16; b++) {
  const t0 = T(b); if (t0 >= DURATION) break;
  const t1 = Math.min(T(b + 1), DURATION);
  if (t0 >= BREATH && t0 < DROP) continue;
  const c = PROG[b % 4];
  for (const n of c.notes) {
    const { L, R } = I.padNote(midi(n) - 12, Math.min(t1, b === 8 ? BREATH : t1) - t0, { cutoff: t0 >= DROP && t0 < END ? 2400 : 1200, attack: 0.4, release: 1.0 });
    pad.addStereo(L, R, t0, 0.05);
  }
}

// ---------------------------------------------------------- lead: a sultry guitar line over the family/music scenes
const LINE = [['E5', 0, 1], ['G5', 1, 1], ['A5', 2, 2], ['C6', 5, 1], ['B5', 6, 2]];
for (const b of [4, 5, 6, 7]) for (const [n, s8, d8] of LINE) {
  const t = T(b) + s8 * BEAT / 2;
  const g = I.guitar(midi(n) - 12 + (b % 2 ? -2 : 0), d8 * BEAT / 2 + 0.3, { bright: 0.6, sustain: 0.996, seed: b * 10 + s8 });
  lead.addMono(g, t, 0.22, 0.2); verb.addMono(g, t, 0.1); dly.addMono(g, t, 0.05);
}

// ---------------------------------------------------------- brass: the Black November hook on the drop
const HOOK = [['A4', 0, 1], ['C5', 1, 1], ['E5', 2, 1], ['A5', 3, 3], ['G5', 6, 1], ['E5', 7, 1]];
for (const b of [9, 10]) for (const [n, s8, d8] of HOOK) {
  const t = T(b) + s8 * BEAT / 2;
  const a = I.brassNote(midi(n), d8 * BEAT / 2 * 0.9, { stab: d8 === 1 ? 1 : 0 }), lo = I.brassNote(midi(n) - 12, d8 * BEAT / 2 * 0.9, { seed: 9, bright: 0.7 });
  brass.addStereo(a.L, a.R, t, 0.26); brass.addStereo(lo.L, lo.R, t, 0.14); verb.addStereo(a.L, a.R, t, 0.08);
}
{ const a = I.brassNote(m('A4'), 1.6), b2 = I.brassNote(m('E5'), 1.6, { seed: 4 }); brass.addStereo(a.L, a.R, END, 0.25); brass.addStereo(b2.L, b2.R, END, 0.2); }

// ---------------------------------------------------------- fx tied to the timeline
fx.addMono(I.noiseSweep(F(TL.scenes.menu[0]) - 0.1, 200, 3000, { q: 0.7, pink: true, shape: (x) => x * x }), 0.1, 0.12); // intro swell
for (const w of TL.menu) fx.addMono(I.noiseSweep(0.18, 4000, 900, { q: 1.2, pink: true }), F(w.at) - 0.12, 0.10); // swish on each word
fx.addMono(I.noiseSweep(BREATH - F(TL.scenes.build[0]), 300, 10000, { q: 0.9, shape: (x) => x * x * x, pink: true }), F(TL.scenes.build[0]), 0.4);
fx.addMono(I.subBoom(2.5), DROP, 0.75);
fx.addMono(I.thwack(), DROP, 0.5);
fx.addMono(I.subBoom(1.6, 60, 30), END, 0.35);
fx.addMono(I.bell(1760, 1.8, 1.6, 3.01), END, 0.08);

// ---------------------------------------------------------- mix
MIX.sidechain([pad, bass, keys], kicks, { depth: 0.55, release: 0.16 });
const stems = {
  kick: kickB, perc, bass, keys, pad, lead, brass, fx,
  verb: reverb(verb, { room: 0.82, damp: 0.4 }),
  dly: pingpong(dly, BEAT * 0.75, 0.38, 3200),
};
const GAIN = { kick: 0.24, perc: 1.1, bass: 0.7, keys: 1.5, pad: 2.8, lead: 3.6, brass: 2.6, fx: 0.8, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
require('fs').mkdirSync(out, { recursive: true });
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 26);
MIX.gate(mix, BREATH, DROP);
MIX.fadeOut(mix, DURATION - 2.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: -13 });
MIX.writeWav(path.join(__dirname, '..', 'public', 'music.wav'), mix);
console.log(`wrote public/music.wav (${DURATION.toFixed(2)}s, ${M.lufs.toFixed(1)} LUFS)`);
