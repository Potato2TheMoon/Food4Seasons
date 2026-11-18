// Tests du texte envoyé par le bouton Partager de la fiche (issue #6) : node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { texteRecette } from '../public/js/recettes.js';

const soupe = {
  id: 'r-1', categorie: 'batch', nom: 'Soupe de potiron', portions: 4, image: 'data:image/jpeg;base64,xyz',
  frigoJours: 4, congelMois: 3,
  lignes: [
    { ingredient: 'Potiron', quantite: 1.25, unite: 'kg' },
    { ingredient: 'Oignon', quantite: 2, unite: 'pièce' },
    { ingredient: 'Sel', quantite: null, unite: '' },
  ],
  etapes: ['Éplucher le potiron.', '  ', 'Cuire 30 min puis mixer.'],
};

test('nom, ingrédients pour les portions d’origine, puis étapes numérotées', () => {
  assert.equal(texteRecette(soupe), [
    'Soupe de potiron',
    '',
    'Ingrédients pour 4 portions',
    '- Potiron : 1,3 kg',
    '- Oignon : 2 pièces',
    '- Sel',
    '',
    'Étapes',
    '1. Éplucher le potiron.',
    '2. Cuire 30 min puis mixer.',
  ].join('\n'));
});

test('ni conservation, ni photo, ni catégorie dans le texte', () => {
  const texte = texteRecette(soupe);
  for (const absent of ['frigo', 'Frigo', 'congél', 'Congél', 'data:', 'Batch', 'jours', 'mois']) {
    assert.ok(!texte.includes(absent), absent);
  }
});

test('une portion au singulier, portions absentes sans nombre', () => {
  assert.ok(texteRecette({ ...soupe, portions: 1 }).includes('Ingrédients pour 1 portion\n'));
  assert.ok(texteRecette({ ...soupe, portions: null }).includes('\nIngrédients\n- Potiron'));
});

test('sans étapes ni ingrédients, seules les sections remplies apparaissent', () => {
  assert.equal(texteRecette({ ...soupe, etapes: [''] }).includes('Étapes'), false);
  assert.equal(texteRecette({ ...soupe, lignes: [], etapes: [] }), 'Soupe de potiron');
});
