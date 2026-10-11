// Tests du calcul de la liste de courses : node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listeVide, mettreAJour, formaterArticle, trierPartie } from '../public/js/liste.js';
import { formaterQuantite } from '../public/js/recettes.js';

const lieux = { Potiron: 'marche', Oignon: 'marche', Tomate: 'marche', Riz: 'supermarche', Sel: 'supermarche', 'Crème fraîche': 'supermarche' };
const lieuDe = (nom) => lieux[nom] ?? 'supermarche';
const l = (ingredient, quantite, unite) => ({ ingredient, quantite, unite });
const soupe = { id: 's', portions: 4, lignes: [l('Potiron', 1, 'kg'), l('Oignon', 1, 'pièce'), l('Sel', null, ''), l('Crème fraîche', 20, 'ml')] };
const risotto = { id: 'r', portions: 2, lignes: [l('Riz', 150, 'g'), l('Oignon', 100, 'g'), l('Potiron', 300, 'g')] };
const recettes = new Map([[soupe.id, soupe], [risotto.id, risotto]]);
const texte = (liste, nom, complement = false) =>
  formaterArticle(liste.articles.find((a) => a.ingredient === nom && a.complement === complement), formaterQuantite);

test('quantités recalculées pour les portions choisies', () => {
  const liste = listeVide();
  mettreAJour(liste, [{ recette: 's', portions: 6 }], recettes, lieuDe);
  assert.equal(texte(liste, 'Potiron'), '1,5 kg');
  assert.equal(texte(liste, 'Oignon'), '1,5 pièces');
  assert.equal(texte(liste, 'Sel'), '');
  assert.equal(liste.articles.find((a) => a.ingredient === 'Potiron').lieu, 'marche');
  assert.equal(liste.articles.find((a) => a.ingredient === 'Riz'), undefined);
});

test('un article par ingrédient, unités de même famille additionnées, autres côte à côte', () => {
  const liste = listeVide();
  mettreAJour(liste, [{ recette: 's', portions: 4 }, { recette: 'r', portions: 4 }], recettes, lieuDe);
  assert.equal(liste.articles.filter((a) => a.ingredient === 'Potiron').length, 1);
  assert.equal(texte(liste, 'Potiron'), '1,6 kg');
  assert.equal(texte(liste, 'Oignon'), '1 pièce + 200 g');
  assert.equal(texte(liste, 'Riz'), '300 g');
});

test('recette ajoutée après génération : quantités additionnées, cases cochées gardées, complément', () => {
  const liste = listeVide();
  mettreAJour(liste, [{ recette: 's', portions: 4 }], recettes, lieuDe);
  liste.articles.find((a) => a.ingredient === 'Potiron').coche = true;
  mettreAJour(liste, [{ recette: 's', portions: 4 }, { recette: 'r', portions: 2 }], recettes, lieuDe);
  const potiron = liste.articles.find((a) => a.ingredient === 'Potiron' && !a.complement);
  assert.equal(potiron.coche, true);
  assert.equal(texte(liste, 'Potiron'), '1 kg');
  assert.equal(texte(liste, 'Potiron', true), '300 g');
  assert.equal(texte(liste, 'Oignon'), '1 pièce + 100 g');
  assert.equal(trierPartie(liste.articles.filter((a) => a.lieu === 'marche'))[0].complement, true);
});

test('portions en plus : seulement la différence ; en moins ou recette retirée : rien ne change', () => {
  const liste = listeVide();
  mettreAJour(liste, [{ recette: 's', portions: 4 }], recettes, lieuDe);
  assert.equal(mettreAJour(liste, [{ recette: 's', portions: 6 }], recettes, lieuDe), true);
  assert.equal(texte(liste, 'Potiron'), '1,5 kg');
  assert.equal(mettreAJour(liste, [{ recette: 's', portions: 2 }], recettes, lieuDe), false);
  assert.equal(mettreAJour(liste, [], recettes, lieuDe), false);
  assert.equal(texte(liste, 'Potiron'), '1,5 kg');
});

test('coché en bas de sa partie', () => {
  const liste = listeVide();
  mettreAJour(liste, [{ recette: 's', portions: 4 }], recettes, lieuDe);
  liste.articles.find((a) => a.ingredient === 'Oignon').coche = true;
  const marche = trierPartie(liste.articles.filter((a) => a.lieu === 'marche')).map((a) => a.ingredient);
  assert.deepEqual(marche, ['Potiron', 'Oignon']);
});
