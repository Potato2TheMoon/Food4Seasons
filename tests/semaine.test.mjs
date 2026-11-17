// Tests du repérage des semaines de cuisine par leur dimanche (04 décision 2) : node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dimancheAVenir } from '../public/js/semaine.js';

test('la semaine à venir finit au prochain dimanche, aujourd’hui si on est dimanche', () => {
  assert.equal(dimancheAVenir(new Date(2026, 10, 18)), '2026-11-22'); // mercredi
  assert.equal(dimancheAVenir(new Date(2026, 10, 22, 21, 30)), '2026-11-22'); // dimanche soir
  assert.equal(dimancheAVenir(new Date(2026, 10, 23)), '2026-11-29'); // lundi : semaine suivante
});

test('changement de mois et d’année', () => {
  assert.equal(dimancheAVenir(new Date(2026, 11, 29)), '2027-01-03');
  assert.equal(dimancheAVenir(new Date(2026, 1, 26)), '2026-03-01');
});
