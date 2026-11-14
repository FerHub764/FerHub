// SAL & MALTE GASTROBAR — Black November Reel (9:16)
// THE SCORE — the single source of truth for music AND picture.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 120, offset: 0.5 }); // 1 bar = 2s
  const { T, BEAT } = clock;
  const DURATION = T(16) + 0.5; // 33s

  // ---------- sections / shots (cuts on bar lines) ----------
  const S = {
    intro: [0, T(3)],        // a chopp fills up, foam overflows -> title
    comida: [T(3), T(5)],    // dishes pop onto the table
    musica: [T(5), T(7)],    // live music + telão
    galera: [T(7), T(9)],    // family, friends, the dog
    breath: [T(9), T(10)],    // "e em novembro..." -> silence
    drop: [T(10), T(13)],     // BLACK NOVEMBER 30% OFF
    outro: [T(13), DURATION],// end card: reserve
  };

  // ---------- harmony: pagode classic I - VI7 - ii - V7 in C ----------
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    A7: { notes: ['E4', 'G4', 'C#5'], bass: 'A1' },
    Dm: { notes: ['F4', 'A4', 'D5'], bass: 'D2' },
    G7: { notes: ['F4', 'B4', 'D5'], bass: 'G1' },
    C6: { notes: ['E4', 'A4', 'C5', 'G5'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G7'], [2, 0, 4, 'C'],
    [3, 0, 4, 'A7'], [4, 0, 4, 'Dm'], [5, 0, 4, 'G7'], [6, 0, 4, 'C'],
    [7, 0, 4, 'A7'], [8, 0, 4, 'Dm'], [9, 0, 4, 'G7'],
    [10, 0, 4, 'C'], [11, 0, 4, 'A7'], [12, 0, 2, 'Dm'], [12, 2, 2, 'G7'],
    [13, 0, 4, 'C6'], [14, 0, 4, 'C6'], [15, 0, 4, 'C6'],
  ]);

  // ---------- the hook (8th-note grid: [note, start8th, dur8ths]) ----------
  const HOOK = {
    a: [['G4', 0, 1], ['C5', 1, 1], ['E5', 2, 2], ['D5', 4, 1], ['C5', 5, 1], ['A4', 6, 2]],
    b: [['A4', 0, 1], ['C#5', 1, 1], ['E5', 2, 2], ['G5', 4, 2], ['E5', 6, 2]],
    c: [['F5', 0, 1], ['E5', 1, 1], ['D5', 2, 2], ['A4', 4, 1], ['D5', 5, 1], ['F5', 6, 2]],
    d: [['G5', 0, 2], ['F5', 2, 1], ['D5', 3, 1], ['B4', 4, 4]],
    end: [['E5', 0, 1], ['G5', 1, 1], ['C6', 2, 6]],
  };

  const ev = {
    pourStart: T(0, 0.5),
    foam: T(2),          // foam overflows on the downbeat: drums start
    breath: T(9, 2.5),   // total silence + freeze
    drop: T(10),         // BLACK NOVEMBER stamp
    pct: T(10, 2),        // "30%" slam
    endCard: T(13),
    end: T(15),
  };

  // dishes pop onto the table on the beats of bar 2 (each = a note)
  const dishes = [
    { key: 'feijoada', label: 'Feijoada', t: T(3, 0.5) },
    { key: 'parmegiana', label: 'Lanche de parmegiana', t: T(3, 1.5) },
    { key: 'porcao', label: 'Porções', t: T(3, 2.5) },
    { key: 'caldo', label: 'Caldos', t: T(3, 3.5) },
  ];
  // music notes that float out of the singer = the cavaco melody in bar 4-5
  const leadA = [...placeBar(clock, HOOK.a, 5), ...placeBar(clock, HOOK.b, 6)];
  // the dog barks twice
  const barks = [T(8, 1), T(8, 1.5)];
  // drop: the brass hook
  const brass = [...placeBar(clock, HOOK.a, 10), ...placeBar(clock, HOOK.b, 11), ...placeBar(clock, HOOK.c, 12), ...placeBar(clock, HOOK.end, 13)]
    .filter((n) => Math.abs(n.t - ev.pct) > 1e-6); // the 30% slam stands alone
  // black november letters stamp on 8ths during bar 9
  const stampWord = 'BLACK';
  const stamps = stampWord.split('').map((c, i) => ({ c, t: ev.drop + i * BEAT / 4 }));

  const markers = {
    foam: { t: ev.foam, sync: 'av' },
    feijoada: dishes[0].t,
    comida: { t: T(3), sync: 'v' },
    musica: T(5),
    galera: { t: T(7), sync: 'v' },
    bark: { t: barks[0], sync: 'a' },
    breath: ev.breath,
    drop: { t: ev.drop, sync: 'av' },
    pct: { t: ev.pct, sync: 'av' },
    endCard: { t: ev.endCard, sync: 'av' },
    end: ev.end,
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, HOOK, ev, markers, dishes, leadA, barks, brass, stamps };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
