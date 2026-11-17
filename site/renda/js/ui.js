// Utilitários de interface compartilhados entre o site e o CRM.
import { preferencia } from './store.js';

export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const fmtReal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const real = (v) => fmtReal.format(Math.round(v || 0));
export const pct = (v) => `${Math.round((v || 0) * 100)}%`;
export const data = (ts) => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
export const dataHora = (ts) => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function telefoneBonito(t) {
  const d = String(t || '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

export function toast(msg, tipo = '') {
  const area = document.getElementById('toasts');
  if (!area) return;
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

export function iniciarTema() {
  const salvo = preferencia('tema');
  if (salvo) document.documentElement.dataset.theme = salvo;
  $$('.tema-btn').forEach((b) =>
    b.addEventListener('click', () => {
      const escuroAgora =
        document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
      const novo = escuroAgora ? 'light' : 'dark';
      document.documentElement.dataset.theme = novo;
      preferencia('tema', novo);
    }),
  );
}

export function baixar(nome, conteudo, tipo = 'text/plain') {
  const blob = new Blob([conteudo], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
