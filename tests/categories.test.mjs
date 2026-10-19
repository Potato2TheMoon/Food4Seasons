// Tests des catégories de recettes (02 décision 22) et du widget de saison (04 décision 23).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categorie, avertirMercredi, aVerifier } from '../public/js/recettes.js';
import { lireRecetteCollee } from '../public/js/import.js';
import { fruitsEtLegumesDuMois } from '../public/js/saison.js';
import { ICONES_SAISON } from '../public/js/icones-saison.js';

const catalogue = JSON.parse(readFileSync(new URL('../public/catalogue.json', import.meta.url)));

test('une recette sans catégorie est une recette batch', () => {
  assert.equal(categorie({}), 'batch');
  assert.equal(categorie({ categorie: 'minute' }), 'minute');
  assert.equal(categorie({ categorie: 'n’importe quoi' }), 'batch');
});

test('l’avertissement du mercredi ne vaut que pour le batch', () => {
  assert.equal(avertirMercredi({ frigoJours: 1 }), true);
  assert.equal(avertirMercredi({ frigoJours: 1, categorie: 'minute' }), false);
  assert.equal(avertirMercredi({ frigoJours: 1, categorie: 'dessert' }), false);
});

test('une recette minute ne demande pas sa conservation', () => {
  const base = { nom: 'Omelette', portions: 1, frigoJours: null, congelMois: undefined, lignes: [{ ingredient: 'Œuf' }], etapes: ['Battre'] };
  assert.deepEqual(aVerifier({ ...base, categorie: 'minute' }, []).manques, []);
  assert.deepEqual(aVerifier(base, []).manques, ['les jours au frigo', 'la congélation']);
});

test('la catégorie collée depuis le skill est reprise, Batch par défaut', () => {
  const bloc = (extra) => JSON.stringify({ food4seasons: 1, nom: 'Mousse', portions: 4, ingredients: [], etapes: ['x'], ...extra });
  assert.equal(lireRecetteCollee(bloc({ categorie: 'dessert' }), catalogue).recette.categorie, 'dessert');
  assert.equal(lireRecetteCollee(bloc({}), catalogue).recette.categorie, 'batch');
});

test('le widget montre les fruits et légumes du mois, sans ceux de toute l’année', () => {
  const { fruits, legumes } = fruitsEtLegumesDuMois(catalogue, 10);
  assert.ok(fruits.includes('Coing') && legumes.includes('Poireau'));
  assert.ok(!legumes.includes('Carotte') && !fruits.includes('Pomme'));
  assert.ok(!fruits.includes('Fraise'));
});

test('chaque fruit et légume du catalogue a son icône', () => {
  const manquants = catalogue.filter((i) => ['fruit', 'legume'].includes(i.categorie) && !ICONES_SAISON[i.nom]).map((i) => i.nom);
  assert.deepEqual(manquants, []);
});
