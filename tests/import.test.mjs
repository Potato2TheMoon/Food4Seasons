// Tests de la lecture d'une recette collée : node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireRecetteCollee } from '../public/js/import.js';

const catalogue = [{ nom: 'Potiron' }, { nom: 'Oignon' }, { nom: 'Crème fraîche' }];
const bloc = (o) => `Voici la recette :\n\`\`\`json\n${JSON.stringify({ food4seasons: 1, ...o })}\n\`\`\`\nBon appétit`;

test('lit le bloc du skill, reconnaît le catalogue sans accents ni majuscules', () => {
  const { recette, nouveaux } = lireRecetteCollee(bloc({
    nom: ' Soupe ', portions: 4, frigoJours: 4, congelMois: 3,
    ingredients: [{ nom: 'potiron', quantite: 1, unite: 'kg' }, { nom: 'creme fraiche', quantite: '20', unite: 'ml' },
      { nom: 'Sel', quantite: null, unite: null }, { nom: 'Patate douce', quantite: 2, unite: 'pièces' }],
    etapes: ['Couper', ' ', 'Cuire'],
    nouveaux: [{ nom: 'Patate douce', lieu: 'marche', mois: [10, 11, 13] }, { nom: 'oignon', lieu: 'marche', mois: [] }],
  }), catalogue);
  assert.equal(recette.nom, 'Soupe');
  assert.deepEqual(recette.lignes, [
    { ingredient: 'Potiron', quantite: 1, unite: 'kg' },
    { ingredient: 'Crème fraîche', quantite: 20, unite: 'ml' },
    { ingredient: 'Sel', quantite: null, unite: '' },
    { ingredient: 'Patate douce', quantite: null, unite: '' }, // unité hors liste : à compléter
  ]);
  assert.deepEqual(recette.etapes, ['Couper', 'Cuire']);
  assert.equal(recette.congelMois, 3);
  assert.deepEqual(nouveaux, { 'Patate douce': { lieu: 'marche', mois: [10, 11] } });
});

test('congélation : absente = à compléter, 0 ou null = ne se congèle pas', () => {
  assert.equal(lireRecetteCollee(bloc({ nom: 'A' }), catalogue).recette.congelMois, undefined);
  assert.equal(lireRecetteCollee(bloc({ nom: 'A', congelMois: 0 }), catalogue).recette.congelMois, null);
  assert.equal(lireRecetteCollee(bloc({ nom: 'A', congelMois: null }), catalogue).recette.congelMois, null);
});

test('refuse un texte qui ne vient pas du skill', () => {
  assert.throws(() => lireRecetteCollee('une recette en texte libre', catalogue), /Aucune recette/);
  assert.throws(() => lireRecetteCollee('{"nom": "x"', catalogue), /Aucune recette|incomplet/);
  assert.throws(() => lireRecetteCollee('{"nom": "x"}', catalogue), /skill Food4Seasons/);
});
