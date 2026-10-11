import * as db from './db.js';
import { el, message, groupe } from './ui.js';
import * as bibliotheque from './bibliotheque.js';
import * as semaine from './semaine.js';
import * as courses from './courses.js';

const vue = document.getElementById('vue');
const champFichier = document.getElementById('fichier-restauration');

// --- Navigation : onglets (04 décision 3) et leurs écrans ---

const ECRANS = {
  semaine: { onglet: 'semaine', afficher: (quelle) => semaine.semaine(quelle, rafraichir) },
  choix: { onglet: 'semaine', afficher: (id) => semaine.choix(id) },
  courses: { onglet: 'semaine', afficher: (id) => courses.courses(id, rafraichir) },
  congelateur: { onglet: 'congelateur', afficher: afficherCongelateur },
  bibliotheque: { onglet: 'bibliotheque', afficher: () => bibliotheque.liste(blocSauvegarde) },
  ajout: { onglet: 'bibliotheque', afficher: bibliotheque.ajout },
  recette: { onglet: 'bibliotheque', afficher: (id) => bibliotheque.fiche(id) },
  edition: { onglet: 'bibliotheque', afficher: (id) => bibliotheque.edition(id, rafraichir) },
};

function route() {
  const [nom, parametre] = location.hash.slice(1).split('/');
  // L'app s'ouvre sur la semaine (04 décision 1).
  return ECRANS[nom] ? { ecran: ECRANS[nom], nom, parametre: decodeURIComponent(parametre ?? '') } : { ecran: ECRANS.semaine, nom: 'semaine' };
}

async function dessiner() {
  const { ecran, nom, parametre } = route();
  if (nom !== 'edition') bibliotheque.quitterEdition();
  if (nom !== 'choix') semaine.quitterChoix();
  for (const lien of document.querySelectorAll('.onglets a')) {
    if (lien.dataset.onglet === ecran.onglet) lien.setAttribute('aria-current', 'page');
    else lien.removeAttribute('aria-current');
  }
  vue.replaceChildren(...(await ecran.afficher(parametre)).flat(Infinity).filter((e) => e != null && e !== false));
}

async function afficher() {
  await dessiner();
  window.scrollTo(0, 0);
}

// Redessine l'écran en gardant la position (utilisé pendant l'édition).
async function rafraichir() {
  const position = window.scrollY;
  await dessiner();
  window.scrollTo(0, position);
}

async function afficherCongelateur() {
  return [
    el('h1', {}, 'Congélateur'),
    groupe(el('div', { class: 'vide' }, el('strong', {}, 'Congélateur vide'), 'L’inventaire du congélateur arrive à l’étape E.')),
  ];
}

// --- Sauvegarder / Restaurer (01 point 10), en bas de la Bibliothèque ---

function blocSauvegarde() {
  return [
    el('div', { class: 'entete-groupe' }, 'Sauvegarde'),
    groupe(
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: sauvegarder }, 'Sauvegarder dans un fichier')),
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: () => champFichier.click() }, 'Restaurer depuis un fichier')),
    ),
    el('p', { class: 'pied-groupe' },
      'Toutes tes données restent sur cet appareil. Sauvegarde-les régulièrement, par exemple dans iCloud Drive.'),
  ];
}

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
