import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitFontSize, formatDatePt, certificateCode, MIN_FONT, MAX_FONT } from '../site/js/engine/certificate.js';

const measure = (text) => (px) => text.length * px * 0.55;

test('nome curto usa a fonte maxima', () => {
  assert.equal(fitFontSize('Ana', 1000, measure('Ana')), MAX_FONT);
});

test('nome longo reduz a fonte ate caber', () => {
  const name = 'Maria Eduarda dos Santos Albuquerque Ferreira';
  const px = fitFontSize(name, 1000, measure(name));
  assert.ok(px < MAX_FONT);
  assert.ok(measure(name)(px) <= 1000);
});

test('nunca abaixo do minimo', () => {
  const name = 'x'.repeat(500);
  assert.equal(fitFontSize(name, 100, measure(name)), MIN_FONT);
  assert.equal(MIN_FONT, 18);
});

test('data em portugues e codigo estavel', () => {
  assert.equal(formatDatePt('2026-11-14T10:00:00.000Z'), '14 de novembro de 2026');
  assert.equal(certificateCode('Ana', 'python', '2026-11-14'), certificateCode('Ana', 'python', '2026-11-14'));
  assert.notEqual(certificateCode('Ana', 'python', '2026-11-14'), certificateCode('Bia', 'python', '2026-11-14'));
  assert.match(certificateCode('Ana', 'python', '2026-11-14'), /^DT-[0-9A-F]{4}-[0-9A-F]{4}$/);
});
