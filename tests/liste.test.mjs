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

// --- Articles ajoutés à la main (04 décisions 25 à 27) ---
import { placerArticle, ajouterManuel, reporterManuels } from '../public/js/liste.js';

const catalogue = [{ nom: 'Poireau', lieu: 'marche' }, { nom: 'Riz', lieu: 'supermarche' }];

test('article à la main : lieu du catalogue si le nom y figure, sinon supermarché', () => {
  assert.deepEqual(placerArticle('  poireau ', catalogue), { nom: 'Poireau', lieu: 'marche' });
  assert.deepEqual(placerArticle('lessive  liquide', catalogue), { nom: 'Lessive liquide', lieu: 'supermarche' });
  assert.equal(placerArticle('   ', catalogue), null);
});

test('un article à la main ne reçoit pas les quantités des recettes', () => {
  const liste = listeVide();
  ajouterManuel(liste, 'Oignon', 'marche');
  mettreAJour(liste, [{ recette: 's', portions: 4 }], recettes, lieuDe);
  const oignons = liste.articles.filter((a) => a.ingredient === 'Oignon');
  assert.equal(oignons.length, 2);
  assert.equal(formaterArticle(oignons.find((a) => a.manuel), formaterQuantite), '');
  assert.equal(formaterArticle(oignons.find((a) => !a.manuel), formaterQuantite), '1 pièce');
});

test('le lundi, les ajouts à la main non cochés passent à la nouvelle semaine', () => {
  const ancienne = { id: '2026-11-08', liste: listeVide() };
  mettreAJour(ancienne.liste, [{ recette: 's', portions: 4 }], recettes, lieuDe);
  ajouterManuel(ancienne.liste, 'Pain', 'supermarche');
  ajouterManuel(ancienne.liste, 'Lessive', 'supermarche').coche = true;
  const nouvelle = listeVide();
  ajouterManuel(nouvelle, 'Pain', 'supermarche'); // déjà rajouté à la main : pas de doublon
  const modifiees = reporterManuels(nouvelle, [ancienne]);
  assert.deepEqual(modifiees, [ancienne]);
  assert.deepEqual(nouvelle.articles.map((a) => a.ingredient), ['Pain']);
  assert.ok(!ancienne.liste.articles.some((a) => a.ingredient === 'Pain'));
  assert.ok(ancienne.liste.articles.some((a) => a.ingredient === 'Lessive' && a.coche));
  assert.ok(ancienne.liste.articles.some((a) => a.ingredient === 'Potiron'), 'les articles des recettes restent');
  assert.deepEqual(reporterManuels(nouvelle, [ancienne]), [], 'rien à reporter la deuxième fois');
});

test('report depuis plusieurs semaines passées, en gardant le lieu', () => {
  const s1 = { id: '2026-11-01', liste: listeVide() };
  const s2 = { id: '2026-11-08', liste: listeVide() };
  ajouterManuel(s1.liste, 'Poireau', 'marche');
  ajouterManuel(s2.liste, 'Pain', 'supermarche');
  const nouvelle = listeVide();
  reporterManuels(nouvelle, [s1, s2, { id: '2026-10-25' }]);
  assert.deepEqual(nouvelle.articles.map((a) => [a.ingredient, a.lieu, a.manuel]), [['Poireau', 'marche', true], ['Pain', 'supermarche', true]]);
});
