// Certificate generation on a canvas (exported as PNG).

export const MAX_FONT = 88;
export const MIN_FONT = 18;
export const WIDTH = 1600;
export const HEIGHT = 1130;

export function fitFontSize(text, maxWidth, measure) {
  for (let px = MAX_FONT; px > MIN_FONT; px -= 2) {
    if (measure(px) <= maxWidth) return px;
  }
  return MIN_FONT;
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function formatDatePt(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function certificateCode(name, trackId, date) {
  let h1 = 0x811c9dc5;
  const text = `${name}|${trackId}|${date}`;
  for (let i = 0; i < text.length; i++) {
    h1 ^= text.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  const hex = h1.toString(16).toUpperCase().padStart(8, '0');
  return `DT-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** data: { name, trackName, trackColor, short, score, date, hours } */
export function renderCertificate(canvas, data) {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  const accent = data.trackColor || '#ffb547';
  const display = '"Space Grotesk", system-ui, sans-serif';
  const body = '"IBM Plex Sans", system-ui, sans-serif';
  const mono = '"JetBrains Mono", ui-monospace, monospace';

  // background
  ctx.fillStyle = '#0b0f16';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  for (let x = 20; x < WIDTH; x += 28) for (let y = 20; y < HEIGHT; y += 28) ctx.fillRect(x, y, 2, 2);
  const glow = ctx.createRadialGradient(WIDTH * 0.85, 0, 50, WIDTH * 0.85, 0, 900);
  glow.addColorStop(0, hexA(accent, 0.35));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // frame
  ctx.strokeStyle = hexA(accent, 0.7);
  ctx.lineWidth = 3;
  roundRect(ctx, 48, 48, WIDTH - 96, HEIGHT - 96, 28);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, 64, 64, WIDTH - 128, HEIGHT - 128, 20);
  ctx.stroke();

  // logo
  ctx.fillStyle = '#ffb547';
  roundRect(ctx, 120, 120, 64, 64, 16);
  ctx.fill();
  ctx.fillStyle = '#1d1404';
  ctx.font = `700 28px ${mono}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('>_', 152, 153);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e8edf4';
  ctx.font = `700 34px ${display}`;
  ctx.fillText('DevTrilhas', 204, 153);

  // track badge (top right)
  ctx.fillStyle = hexA(accent, 0.16);
  roundRect(ctx, WIDTH - 248, 112, 128, 80, 18);
  ctx.fill();
  ctx.strokeStyle = hexA(accent, 0.6);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = `700 30px ${mono}`;
  ctx.textAlign = 'center';
  ctx.fillText(data.short || '', WIDTH - 184, 153);

  // heading
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = accent;
  ctx.font = `500 26px ${mono}`;
  ctx.fillText('CERTIFICADO DE CONCLUSÃO', WIDTH / 2, 330);
  ctx.fillStyle = '#96a3b6';
  ctx.font = `400 30px ${body}`;
  ctx.fillText('Certificamos que', WIDTH / 2, 410);

  // name
  const name = data.name || 'Estudante';
  ctx.fillStyle = '#ffffff';
  const px = fitFontSize(name, WIDTH - 320, (size) => {
    ctx.font = `700 ${size}px ${display}`;
    return ctx.measureText(name).width;
  });
  ctx.font = `700 ${px}px ${display}`;
  ctx.fillText(name, WIDTH / 2, 530);
  ctx.fillStyle = accent;
  ctx.fillRect(WIDTH / 2 - 160, 568, 320, 4);

  ctx.fillStyle = '#c9d2df';
  ctx.font = `400 32px ${body}`;
  ctx.fillText('concluiu com aprovação a trilha', WIDTH / 2, 650);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 60px ${display}`;
  ctx.fillText(data.trackName, WIDTH / 2, 735);
  ctx.fillStyle = '#96a3b6';
  ctx.font = `400 28px ${body}`;
  ctx.fillText(`com nota final de ${data.score}% na prova de certificação.`, WIDTH / 2, 800);

  // footer
  const date = formatDatePt(data.date);
  const code = certificateCode(name, data.trackId || data.trackName, String(data.date).slice(0, 10));
  ctx.textAlign = 'left';
  ctx.fillStyle = '#66748a';
  ctx.font = `500 20px ${mono}`;
  ctx.fillText('EMITIDO EM', 140, 935);
  ctx.fillText('CÓDIGO', WIDTH / 2 - 120, 935);
  ctx.fillStyle = '#e8edf4';
  ctx.font = `500 28px ${body}`;
  ctx.fillText(date, 140, 978);
  ctx.font = `500 28px ${mono}`;
  ctx.fillText(code, WIDTH / 2 - 120, 978);

  // seal
  const cx = WIDTH - 240;
  const cy = 940;
  ctx.beginPath();
  ctx.arc(cx, cy, 92, 0, Math.PI * 2);
  ctx.fillStyle = hexA(accent, 0.14);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = accent;
  ctx.stroke();
  ctx.beginPath();
  ctx.setLineDash([6, 8]);
  ctx.arc(cx, cy, 74, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `700 40px ${display}`;
  ctx.fillText(`${data.score}%`, cx, cy + 6);
  ctx.font = `500 15px ${mono}`;
  ctx.fillText('APROVADO', cx, cy + 36);
  return code;
}

function hexA(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return `rgba(255,181,71,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function downloadCertificate(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); resolve(); }, 0);
    }, 'image/png');
  });
}

export function slugify(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'certificado';
}
