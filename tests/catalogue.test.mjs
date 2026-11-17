// Contrôles du catalogue d'ingrédients, dont dépend le calcul de saison : node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORIES_DE_SAISON } from '../public/js/recettes.js';

const catalogue = JSON.parse(readFileSync(new URL('../public/catalogue.json', import.meta.url)));

test('chaque ingrédient a un nom unique', () => {
  const noms = catalogue.map((i) => i.nom);
  assert.ok(noms.every((n) => typeof n === 'string' && n.trim() === n && n));
  assert.deepEqual(noms.filter((n, i) => noms.indexOf(n) !== i), []);
});

test('fruits, légumes et herbes : des mois de 1 à 12, sans doublon', () => {
  for (const i of catalogue.filter((i) => CATEGORIES_DE_SAISON.includes(i.categorie))) {
    assert.ok(Array.isArray(i.mois) && i.mois.length, `${i.nom} : mois manquants`);
    assert.ok(i.mois.every((m) => Number.isInteger(m) && m >= 1 && m <= 12), `${i.nom} : mois invalide`);
    assert.equal(new Set(i.mois).size, i.mois.length, `${i.nom} : mois en double`);
  }
});

test('lieu d’achat : marché ou supermarché', () => {
  for (const i of catalogue.filter((i) => i.lieu !== undefined)) {
    assert.ok(['marche', 'supermarche'].includes(i.lieu), `${i.nom} : lieu ${i.lieu}`);
  }
});
