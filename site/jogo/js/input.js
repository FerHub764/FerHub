// Teclado, toque (com vários dedos ao mesmo tempo) e controle (Gamepad API)
// viram um único estado por quadro. Toques rápidos ficam "travados" até o
// próximo quadro para nenhum pulo se perder.
const KEYS = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'jump', KeyZ: 'jump', KeyK: 'jump', ArrowUp: 'jump', KeyW: 'jump',
  KeyX: 'dash', KeyJ: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash', KeyC: 'dash',
  Escape: 'pause', KeyP: 'pause', Enter: 'confirm',
};

export class Input {
  constructor() {
    this.keys = { left: false, right: false, jump: false, dash: false };
    this.touch = { left: false, right: false, jump: false, dash: false };
    this.pad = { left: false, right: false, jump: false, dash: false, pause: false };
    this.latch = { jump: false, dash: false, pause: false };
    this.prev = { jump: false, dash: false, pause: false };
    this.enabled = false;
    this.usedTouch = false;
    this.usedPad = false;
    this.onPause = null;
    this.onAnyKey = null;
    this.out = { left: false, right: false, jump: false, jumpPressed: false, dashPressed: false };

    window.addEventListener('keydown', (e) => {
      const k = KEYS[e.code];
      if (this.onAnyKey) this.onAnyKey(e);
      if (!k) return;
      if (k === 'pause') { if (!e.repeat && this.onPause) this.onPause(); return; }
      if (k === 'confirm') return;
      if (!this.enabled) return;
      e.preventDefault();
      if (!e.repeat && (k === 'jump' || k === 'dash') && !this.keys[k]) this.latch[k] = true;
      this.keys[k] = true;
    });
    window.addEventListener('keyup', (e) => {
      const k = KEYS[e.code];
      if (k && k in this.keys) this.keys[k] = false;
    });
    window.addEventListener('blur', () => this.clear());
  }

  clear() {
    for (const o of [this.keys, this.touch]) for (const k in o) o[k] = false;
    this.latch.jump = this.latch.dash = false;
    this.renderButtons();
  }

  bindTouch(padEl, buttons, onFirstTouch) {
    this.padEl = padEl;
    this.btn = buttons;
    const handle = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      if (!this.usedTouch) { this.usedTouch = true; if (onFirstTouch) onFirstTouch(); }
      const before = { ...this.touch };
      const next = { left: false, right: false, jump: false, dash: false };
      const pressed = new Set();
      for (const t of e.touches) {
        const hit = this.hitTest(t.clientX, t.clientY);
        if (hit) next[hit] = true;
      }
      if (e.type === 'touchstart') {
        for (const t of e.changedTouches) {
          const hit = this.hitTest(t.clientX, t.clientY);
          if (hit) pressed.add(hit);
        }
      }
      for (const k of ['jump', 'dash']) if ((next[k] && !before[k]) || pressed.has(k)) this.latch[k] = true;
      this.touch = next;
      this.renderButtons();
    };
    for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) padEl.addEventListener(ev, handle, { passive: false });
    // Mouse também funciona nos botões (útil para testar no computador).
    let mouseHit = null;
    padEl.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      mouseHit = this.hitTest(e.clientX, e.clientY, true);
      if (mouseHit) { this.touch[mouseHit] = true; if (mouseHit === 'jump' || mouseHit === 'dash') this.latch[mouseHit] = true; this.renderButtons(); }
    });
    window.addEventListener('mouseup', () => { if (mouseHit) { this.touch[mouseHit] = false; mouseHit = null; this.renderButtons(); } });
  }

  rects() {
    const r = {};
    for (const k of ['left', 'right', 'jump', 'dash']) r[k] = this.btn[k].getBoundingClientRect();
    return r;
  }

  hitTest(x, y, strict = false) {
    const r = this.rects();
    const pad = strict ? 0 : 26;
    const inR = (b, m) => x >= b.left - m && x <= b.right + m && y >= b.top - m && y <= b.bottom + m;
    const dpadL = Math.min(r.left.left, r.right.left), dpadR = Math.max(r.left.right, r.right.right);
    const dpadT = Math.min(r.left.top, r.right.top), dpadB = Math.max(r.left.bottom, r.right.bottom);
    const mid = (r.left.right + r.right.left) / 2;
    const dist = (b) => Math.hypot(x - (b.left + b.right) / 2, y - (b.top + b.bottom) / 2);
    if (strict) {
      for (const k of ['left', 'right', 'jump', 'dash']) if (inR(r[k], 0)) return k;
      return null;
    }
    if (x >= dpadL - pad && x <= dpadR + pad && y >= dpadT - pad * 2 && y <= dpadB + pad) return x < mid ? 'left' : 'right';
    if (inR(r.jump, pad) || inR(r.dash, pad)) return dist(r.jump) <= dist(r.dash) ? 'jump' : 'dash';
    // Fora dos botões: metade esquerda move, metade direita age.
    const padBox = this.padEl.getBoundingClientRect();
    if (y < padBox.top) return null;
    const half = padBox.left + padBox.width / 2;
    if (x < half) return x < mid ? 'left' : 'right';
    return dist(r.jump) <= dist(r.dash) ? 'jump' : 'dash';
  }

  renderButtons() {
    if (!this.btn) return;
    for (const k of ['left', 'right', 'jump', 'dash']) this.btn[k].classList.toggle('on', !!(this.touch[k] || this.keys[k] || this.pad[k]));
  }

  pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (const p of pads) if (p && p.connected) { gp = p; break; }
    if (!gp) return;
    const b = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
    const ax = gp.axes[0] || 0;
    const st = {
      left: b(14) || ax < -0.4,
      right: b(15) || ax > 0.4,
      jump: b(0) || b(12),
      dash: b(1) || b(2) || b(5) || b(7),
      pause: b(9),
    };
    if (st.jump || st.dash || st.left || st.right) this.usedPad = true;
    if (st.jump && !this.pad.jump) this.latch.jump = true;
    if (st.dash && !this.pad.dash) this.latch.dash = true;
    if (st.pause && !this.pad.pause && this.onPause) this.onPause();
    this.pad = st;
  }

  frame() {
    this.pollPad();
    const o = this.out;
    const k = this.keys, t = this.touch, p = this.pad;
    o.left = k.left || t.left || p.left;
    o.right = k.right || t.right || p.right;
    o.jump = k.jump || t.jump || p.jump;
    o.jumpPressed = this.latch.jump;
    o.dashPressed = this.latch.dash;
    this.latch.jump = this.latch.dash = false;
    return o;
  }
}
