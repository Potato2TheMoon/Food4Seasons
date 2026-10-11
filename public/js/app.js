import * as db from './db.js';
import { el, message, groupe } from './ui.js';
import * as bibliotheque from './bibliotheque.js';
import * as semaine from './semaine.js';
import * as courses from './courses.js';
import * as congelateur from './congelateur.js';
import * as synchro from './synchro.js';
import { VERSION } from './version.js';

const vue = document.getElementById('vue');
const champFichier = document.getElementById('fichier-restauration');

// --- Navigation : onglets (04 décision 3) et leurs écrans ---

const ECRANS = {
  semaine: { onglet: 'semaine', afficher: (quelle) => semaine.semaine(quelle, rafraichir) },
  choix: { onglet: 'semaine', afficher: (id) => semaine.choix(id) },
  courses: { onglet: 'semaine', afficher: (id) => courses.courses(id, rafraichir) },
  congelateur: { onglet: 'congelateur', afficher: () => congelateur.inventaire(rafraichir) },
  bibliotheque: { onglet: 'bibliotheque', afficher: bibliotheque.liste },
  reglages: { onglet: 'reglages', afficher: () => [el('h1', {}, 'Réglages'), ...blocSauvegarde(), ...blocVersion()] },
  ajout: { onglet: 'bibliotheque', afficher: bibliotheque.ajout },
  coller: { onglet: 'bibliotheque', afficher: bibliotheque.coller },
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

// --- Synchro entre appareils (06, 2026-10-11), dans l'onglet Réglages ---

function blocSynchro() {
  if (!synchro.configuree()) return [];
  const s = synchro.session();
  if (!s) {
    const email = el('input', { class: 'champ', type: 'email', autocomplete: 'username', placeholder: 'E-mail', 'aria-label': 'E-mail' });
    const motDePasse = el('input', { class: 'champ', type: 'password', autocomplete: 'current-password', placeholder: 'Mot de passe', 'aria-label': 'Mot de passe' });
    const agir = (creer) => async () => {
      if (!email.value.trim() || motDePasse.value.length < 6) return message('Indique ton e-mail et un mot de passe d’au moins 6 caractères.');
      try {
        if (creer && !(await synchro.creerCompte(email.value.trim(), motDePasse.value))) {
          return message('Compte créé : confirme ton e-mail avec le lien reçu, puis connecte-toi ici.');
        }
        if (!creer) await synchro.connecter(email.value.trim(), motDePasse.value);
        message(synchro.etat.erreur ?? 'Connecté : tes données sont synchronisées.');
        rafraichir();
      } catch (erreur) {
        message(navigator.onLine ? erreur.message : 'Pas de réseau pour se connecter.');
      }
    };
    return [
      el('div', { class: 'entete-groupe' }, 'Synchronisation'),
      groupe(
        el('div', { class: 'ligne' }, email),
        el('div', { class: 'ligne' }, motDePasse),
        el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: agir(false) }, 'Se connecter')),
      ),
      el('p', { class: 'pied-groupe' }, 'Connecte-toi avec ton compte sur chaque appareil pour retrouver partout les mêmes données.'),
    ];
  }
  const { derniere, erreur } = synchro.etat;
  return [
    el('div', { class: 'entete-groupe' }, 'Synchronisation'),
    groupe(
      el('div', { class: 'ligne' }, 'Compte', el('span', { class: 'secondaire' }, s.utilisateur.email)),
      el('div', { class: 'ligne' }, 'Dernière synchro', el('span', { class: 'secondaire etat-synchro' },
        erreur ?? (derniere ? derniere.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'en cours…'))),
      el('div', { class: 'ligne' }, el('button', {
        class: 'action', type: 'button',
        onclick: async () => { await synchro.synchroniser(); message(synchro.etat.erreur ?? 'Synchronisé.'); rafraichir(); },
      }, 'Synchroniser maintenant')),
      el('div', { class: 'ligne' }, el('button', {
        class: 'action danger', type: 'button',
        onclick: () => {
          if (!confirm('Se déconnecter ? Les données restent sur cet appareil, mais ne sont plus synchronisées.')) return;
          synchro.deconnecter();
          rafraichir();
        },
      }, 'Se déconnecter')),
    ),
  ];
}

// --- Sauvegarder / Restaurer (01 point 10), dans l'onglet Réglages ---

function blocSauvegarde() {
  return [
    ...blocSynchro(),
    el('div', { class: 'entete-groupe' }, 'Sauvegarde'),
    groupe(
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: sauvegarder }, 'Sauvegarder dans un fichier')),
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: () => champFichier.click() }, 'Restaurer depuis un fichier')),
    ),
    el('p', { class: 'pied-groupe' },
      synchro.session()
        ? 'Une copie dans un fichier reste utile en cas de souci, par exemple dans iCloud Drive.'
        : 'Toutes tes données restent sur cet appareil. Sauvegarde-les régulièrement, par exemple dans iCloud Drive.'),
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

addEventListener('food4seasons-bloque', () => {
  vue.replaceChildren(el('h1', {}, 'Food4Seasons'), groupe(el('div', { class: 'vide' },
    el('strong', {}, 'Mise à jour en attente'),
    'Le site est encore ouvert dans un autre onglet ou une autre fenêtre avec l’ancienne version. Ferme-les, puis recharge cette page.')));
});

function blocVersion() {
  return [
    el('div', { class: 'entete-groupe' }, 'Site'),
    groupe(
      el('div', { class: 'ligne' }, 'Version', el('span', { class: 'secondaire' }, VERSION)),
      el('div', { class: 'ligne' }, el('button', { class: 'action', type: 'button', onclick: () => recharger() }, 'Recharger le site')),
    ),
    el('p', { class: 'pied-groupe' }, 'Si un écran semble ancien ou vide, recharge le site : tes données ne sont pas touchées.'),
  ];
}

// --- Mise à jour du site ---
// Safari (et surtout l'app sur l'écran d'accueil) peut garder l'ancienne version en mémoire.
// On compare avec la version publiée, et on propose de recharger en contournant le cache.
let versionProposee = null;
async function verifierVersion() {
  if (VERSION === 'dev' || !navigator.onLine) return;
  try {
    const { version } = await (await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' })).json();
    if (version && version !== VERSION && version !== versionProposee) {
      versionProposee = version;
      message('Une nouvelle version du site est disponible.', { libelle: 'Mettre à jour', faire: () => recharger(version) });
    }
  } catch { /* hors ligne : on réessaiera */ }
}

function recharger(version = Date.now()) {
  location.replace(`${location.pathname}?v=${version}${location.hash}`);
}

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
  await afficher();
  verifierVersion();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verifierVersion(); });
  synchro.demarrer({
    // Données reçues d'un autre appareil : on redessine, sauf pendant une saisie.
    apresReception: () => {
      const saisie = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (route().nom !== 'edition' && !saisie) rafraichir();
    },
    apresEtat: () => {
      const etat = document.querySelector('.etat-synchro');
      if (etat) etat.textContent = synchro.etat.erreur
        ?? synchro.etat.derniere?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) ?? '';
    },
  });
}

demarrer();
