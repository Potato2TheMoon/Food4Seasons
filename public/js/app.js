import * as db from './db.js';

const vue = document.getElementById('vue');
const champFichier = document.getElementById('fichier-restauration');

function el(balise, attributs = {}, ...enfants) {
  const noeud = document.createElement(balise);
  for (const [nom, valeur] of Object.entries(attributs)) {
    if (nom.startsWith('on')) noeud.addEventListener(nom.slice(2), valeur);
    else noeud.setAttribute(nom, valeur);
  }
  noeud.append(...enfants.flat().filter((e) => e != null));
  return noeud;
}

function message(texte) {
  const bulle = el('div', { class: 'message', role: 'status' }, texte);
  document.body.append(bulle);
  setTimeout(() => bulle.remove(), 3500);
}

function groupe(...lignes) {
  return el('div', { class: 'groupe' }, ...lignes);
}

function vide(titre, texte) {
  return groupe(el('div', { class: 'vide' }, el('strong', {}, titre), texte));
}

// --- Onglets (04 décision 3) ---

const ONGLETS = {
  semaine: afficherSemaine,
  congelateur: afficherCongelateur,
  bibliotheque: afficherBibliotheque,
};

async function afficher() {
  let onglet = location.hash.slice(1);
  if (!ONGLETS[onglet]) onglet = 'semaine'; // l'app s'ouvre sur la semaine (04 décision 1)
  for (const lien of document.querySelectorAll('.onglets a')) {
    if (lien.dataset.onglet === onglet) lien.setAttribute('aria-current', 'page');
    else lien.removeAttribute('aria-current');
  }
  vue.replaceChildren(...(await ONGLETS[onglet]()));
  window.scrollTo(0, 0);
}

async function afficherSemaine() {
  return [
    el('h1', {}, 'Semaine'),
    vide('Aucune recette prévue', 'Le choix des recettes de la semaine arrive à l’étape C.'),
  ];
}

async function afficherCongelateur() {
  return [
    el('h1', {}, 'Congélateur'),
    vide('Congélateur vide', 'L’inventaire du congélateur arrive à l’étape E.'),
  ];
}

async function afficherBibliotheque() {
  const nbRecettes = await db.compter('recettes');
  const nbIngredients = await db.compter('ingredients');
  return [
    el('h1', {}, 'Bibliothèque'),
    nbRecettes
      ? groupe(el('div', { class: 'ligne' }, `${nbRecettes} recette(s)`))
      : vide('Aucune recette', 'L’ajout de recettes arrive à l’étape B.'),
    el('div', { class: 'entete-groupe' }, 'Sauvegarde'),
    groupe(
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: sauvegarder }, 'Sauvegarder dans un fichier')),
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: () => champFichier.click() }, 'Restaurer depuis un fichier')),
    ),
    el('p', { class: 'pied-groupe' },
      `Toutes tes données restent sur cet appareil. Sauvegarde-les régulièrement, par exemple dans iCloud Drive. Catalogue : ${nbIngredients} ingrédients.`),
  ];
}

// --- Sauvegarder / Restaurer (01 point 10) ---

async function sauvegarder() {
  const contenu = JSON.stringify(await db.exporter());
  const nom = `food4seasons-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  const fichier = new File([contenu], nom, { type: 'application/json' });
  // Sur iPhone, le partage propose « Enregistrer dans Fichiers ».
  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], title: nom });
      return;
    } catch (erreur) {
      if (erreur.name === 'AbortError') return;
    }
  }
  const lien = el('a', { href: URL.createObjectURL(fichier), download: nom });
  lien.click();
  setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
}

champFichier.addEventListener('change', async () => {
  const fichier = champFichier.files[0];
  champFichier.value = '';
  if (!fichier) return;
  try {
    const sauvegarde = JSON.parse(await fichier.text());
    if (sauvegarde?.app !== 'food4seasons') throw new Error("Ce fichier n'est pas une sauvegarde Food4Seasons.");
    const date = sauvegarde.date ? new Date(sauvegarde.date).toLocaleString('fr-FR') : 'date inconnue';
    if (!confirm(`Remplacer toutes les données actuelles par la sauvegarde du ${date} ?`)) return;
    await db.importer(sauvegarde);
    message('Sauvegarde restaurée.');
    afficher();
  } catch (erreur) {
    message(erreur instanceof SyntaxError ? "Ce fichier n'est pas lisible." : erreur.message);
  }
});

// --- Démarrage ---

async function demarrer() {
  // Demande à Safari de ne pas effacer les données de la page.
  navigator.storage?.persist?.();
  try {
    const catalogue = await (await fetch('catalogue.json', { cache: 'no-cache' })).json();
    await db.completerCatalogue(catalogue);
  } catch {
    // Hors ligne : on garde le catalogue déjà enregistré.
  }
  window.addEventListener('hashchange', afficher);
  afficher();
}

demarrer();
