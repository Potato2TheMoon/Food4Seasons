// Tests des règles de saison, des portions et de la recherche (02 décisions 3, 19) : node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { horsSaison, recalculer, formaterQuantite, chercher, normaliser, trierParNom, tientJusquauMercredi, seCongele, aVerifier, portionsDemandees, lignesPourPortions, boutonIngredientsVisible, fermerApresGlissement, vitesseFinale } from '../public/js/recettes.js';

const catalogue = JSON.parse(readFileSync(new URL('../public/catalogue.json', import.meta.url)));
const l = (ingredient, quantite = null, unite = '') => ({ ingredient, quantite, unite });
const petitCatalogue = [
  { nom: 'Potiron', categorie: 'legume', mois: [9, 10, 11, 12] },
  { nom: 'Tomate', categorie: 'legume', mois: [7, 8, 9] },
  { nom: 'Basilic', categorie: 'herbe', mois: [6, 7, 8] },
  { nom: 'Pomme', categorie: 'fruit', mois: [1, 2, 3, 9, 10, 11, 12] },
  { nom: 'Riz', categorie: 'epicerie', mois: [] },
];

test('de saison si tous les fruits, légumes et herbes le sont ce mois-ci', () => {
  const soupe = { lignes: [l('Potiron', 1, 'kg'), l('Pomme', 2, 'pièce'), l('Riz', 100, 'g')] };
  assert.deepEqual(horsSaison(soupe, petitCatalogue, 11), []);
  assert.deepEqual(horsSaison(soupe, petitCatalogue, 5), ['Potiron', 'Pomme']);
});

test('les herbes comptent pour la saison, l’épicerie et les ingrédients inconnus non', () => {
  const pesto = { lignes: [l('Basilic'), l('Riz'), l('Ingrédient inconnu')] };
  assert.deepEqual(horsSaison(pesto, petitCatalogue, 7), []);
  assert.deepEqual(horsSaison(pesto, petitCatalogue, 11), ['Basilic']);
  assert.deepEqual(horsSaison({ lignes: [] }, petitCatalogue, 1), []);
});

test('avec le vrai catalogue : une recette d’hiver est de saison en décembre, pas en juillet', () => {
  const nom = (n) => catalogue.find((i) => i.nom === n);
  assert.ok(nom('Carotte'), 'Carotte doit être au catalogue');
  const hiver = { lignes: [l('Carotte', 500, 'g'), l('Oignon', 1, 'pièce')] };
  assert.deepEqual(horsSaison(hiver, catalogue, 12), []);
  assert.deepEqual(horsSaison(hiver, catalogue, 7), ['Carotte']);
});

test('quantité recalculée au prorata des portions', () => {
  assert.equal(recalculer(300, 4, 6), 450);
  assert.equal(recalculer(1, 4, 2), 0.5);
  assert.equal(recalculer(200, 2, 2), 200);
  assert.equal(recalculer(null, 4, 6), null); // sans quantité (sel, poivre)
  assert.equal(recalculer(150, 0, 6), 150); // portions d'origine inconnues : on ne touche à rien
});

test('quantité affichée : arrondie, à la française, au pluriel quand il faut', () => {
  assert.equal(formaterQuantite(1.25, 'kg'), '1,3 kg');
  assert.equal(formaterQuantite(12.4, 'g'), '12 g');
  assert.equal(formaterQuantite(1, 'pièce'), '1 pièce');
  assert.equal(formaterQuantite(3, 'gousse'), '3 gousses');
  assert.equal(formaterQuantite(2, 'botte'), '2 bottes');
  assert.equal(formaterQuantite(2, 'pincée'), '2 pincées');
  assert.equal(formaterQuantite(2, 'c. à soupe'), '2 c. à soupe');
  assert.equal(formaterQuantite(null, 'g'), '');
  assert.equal(formaterQuantite(5, ''), '');
});

test('recherche par nom ou par ingrédient, sans accents ni majuscules', () => {
  const recettes = [
    { nom: 'Velouté de potiron', lignes: [l('Potiron'), l('Crème fraîche')] },
    { nom: 'Risotto', lignes: [l('Riz'), l('Échalote')] },
  ];
  assert.equal(normaliser('  Échalote '), 'echalote');
  assert.deepEqual(chercher(recettes, 'VELOUTE').map((r) => r.nom), ['Velouté de potiron']);
  assert.deepEqual(chercher(recettes, 'creme').map((r) => r.nom), ['Velouté de potiron']);
  assert.deepEqual(chercher(recettes, 'echalote').map((r) => r.nom), ['Risotto']);
  assert.equal(chercher(recettes, '  ').length, 2);
  assert.deepEqual(trierParNom([{ nom: 'tarte' }, { nom: 'Écrasé' }, { nom: 'Gratin' }]).map((r) => r.nom), ['Écrasé', 'Gratin', 'tarte']);
});

test('conservation : 3 jours au frigo pour tenir jusqu’au mercredi, congélation si plus de 0 mois', () => {
  assert.equal(tientJusquauMercredi({ frigoJours: 3 }), true);
  assert.equal(tientJusquauMercredi({ frigoJours: 2 }), false);
  assert.equal(tientJusquauMercredi({}), true); // non renseigné : pas d'avertissement
  assert.equal(seCongele({ congelMois: 3 }), true);
  assert.equal(seCongele({ congelMois: 0 }), false);
  assert.equal(seCongele({}), false);
});

test('brouillon complet : rien à vérifier, ingrédients nouveaux signalés', () => {
  const recette = { nom: 'Soupe', portions: 4, frigoJours: 3, congelMois: 2, lignes: [l('Potiron'), l('Topinambour')], etapes: ['Cuire'] };
  assert.deepEqual(aVerifier(recette, petitCatalogue), { manques: [], nouveaux: ['Topinambour'] });
  const vide = { nom: ' ', portions: 0, lignes: [], etapes: [''] };
  assert.deepEqual(aVerifier(vide, petitCatalogue).manques,
    ['le nom', "le nombre de portions d'origine", 'les jours au frigo', 'la congélation', 'les ingrédients', 'les étapes']);
});

test('fiche : portions demandées par l’adresse, sinon celles d’origine (#8)', () => {
  assert.equal(portionsDemandees('6', 4), 6);
  assert.equal(portionsDemandees('', 4), 4);
  assert.equal(portionsDemandees(undefined, 4), 4);
  assert.equal(portionsDemandees('0', 4), 4);
  assert.equal(portionsDemandees('-2', 4), 4);
  assert.equal(portionsDemandees('2.5', 4), 4);
  assert.equal(portionsDemandees('abc', 4), 4);
});

test('fiche et panneau Ingrédients : quantités recalculées pour les portions demandées (#8)', () => {
  const recette = { portions: 4, lignes: [l('Potiron', 1, 'kg'), l('Oignon', 2, 'pièce'), l('Sel')] };
  assert.deepEqual(lignesPourPortions(recette, 6), [
    { ingredient: 'Potiron', quantite: '1,5 kg' },
    { ingredient: 'Oignon', quantite: '3 pièces' },
    { ingredient: 'Sel', quantite: '' },
  ]);
  assert.deepEqual(lignesPourPortions(recette, 4).map((x) => x.quantite), ['1 kg', '2 pièces', '']);
  assert.deepEqual(lignesPourPortions({ portions: 4, lignes: [] }, 6), []);
});

test('bouton Ingrédients : visible dès que la 1re ligne passe sous la barre du haut (#10)', () => {
  assert.equal(boutonIngredientsVisible(300, 60), false); // liste entièrement visible
  assert.equal(boutonIngredientsVisible(60, 60), false); // ligne juste sous la barre
  assert.equal(boutonIngredientsVisible(59, 60), true); // elle commence à être cachée
  assert.equal(boutonIngredientsVisible(-500, 60), true); // liste sortie de l'écran
});

test('panneau Ingrédients : fermé en glissant assez loin ou assez vite, sinon remis en place (#10)', () => {
  assert.equal(fermerApresGlissement(120, 0.1, 400), true); // plus de 25 % de la hauteur
  assert.equal(fermerApresGlissement(90, 0.1, 400), false); // lent et court : revient
  assert.equal(fermerApresGlissement(60, 0.8, 400), true); // geste rapide
  assert.equal(fermerApresGlissement(20, 2, 400), false); // trop court même rapide
  assert.equal(fermerApresGlissement(-150, -1, 400), false); // vers le haut
  assert.equal(fermerApresGlissement(0, 0, 400), false);
});

test('vitesse en fin de geste : le coup sec final compte, pas la lenteur du début (#10)', () => {
  const lentPuisRapide = [{ y: 0, t: 0 }, { y: 10, t: 400 }, { y: 20, t: 800 }, { y: 50, t: 850 }, { y: 80, t: 900 }];
  assert.equal(vitesseFinale(lentPuisRapide), 0.6);
  assert.equal(vitesseFinale([{ y: 0, t: 0 }, { y: 40, t: 400 }]), 0.1);
  assert.equal(vitesseFinale([{ y: 0, t: 0 }]), 0);
  assert.equal(vitesseFinale([{ y: 0, t: 5 }, { y: 30, t: 5 }]), 0);
});
