// Onglet Semaine (04 décisions 1, 2, 4, 5, 17, 18) : la semaine de cuisine et l'écran de choix des recettes.
import * as db from './db.js';
import { el, svg, ICONES, message, groupe, vide, barre, vignette, mention } from './ui.js';
import { MOIS, trierParNom, horsSaison, tientJusquauMercredi, seCongele } from './recettes.js';

const PORTIONS_PAR_DEFAUT = 4;
let touteLaBibliotheque = false;

// --- Dates : une semaine de cuisine est repérée par son dimanche (AAAA-MM-JJ) ---

function versId(date) {
  const deux = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`;
}

function depuisId(id) {
  const [a, m, j] = id.split('-').map(Number);
  return new Date(a, m - 1, j);
}

// La semaine à venir finit au prochain dimanche (aujourd'hui si on est dimanche) :
// l'écran passe donc à la semaine suivante le lundi (04 décision 2).
export function dimancheAVenir(aujourdhui = new Date()) {
  const dimanche = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
  dimanche.setDate(dimanche.getDate() + (7 - dimanche.getDay()) % 7);
  return versId(dimanche);
}

export function dimanchePrecedent() {
  const dimanche = depuisId(dimancheAVenir());
  dimanche.setDate(dimanche.getDate() - 7);
  return versId(dimanche);
}

export function dateLongue(id) {
  return depuisId(id).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// La saison se calcule pour le mois du dimanche de cuisine.
function moisDe(id) {
  return depuisId(id).getMonth() + 1;
}

export async function lireSemaine(id) {
  return (await db.tout('semaines')).find((s) => s.id === id) ?? { id, recettes: [] };
}

function resteAAcheter(liste) {
  const restants = liste.articles.filter((a) => !a.coche).length;
  return restants ? `${restants} à acheter` : 'tout est pris';
}

// Boutons − et + autour d'un nombre.
function compteur(valeur, minimum, nom, changer) {
  return el('span', { class: 'compteur' },
    el('button', {
      class: 'bouton-compteur', type: 'button', 'aria-label': `Une ${nom} de moins`, disabled: valeur <= minimum,
      onclick: () => changer(-1),
    }, '−'),
    el('span', { class: 'compteur-valeur' }, valeur),
    el('button', {
      class: 'bouton-compteur', type: 'button', 'aria-label': `Une ${nom} de plus`,
      onclick: () => changer(1),
    }, '+'));
}

// --- Écran Semaine ---

export async function semaine(quelle, rafraichir) {
  const precedente = quelle === 'precedente';
  const id = precedente ? dimanchePrecedent() : dimancheAVenir();
  const donnees = await lireSemaine(id);
  const recettes = new Map((await db.tout('recettes')).map((r) => [r.id, r]));
  // Une recette supprimée de la bibliothèque disparaît de la semaine.
  const prevues = donnees.recettes.filter((p) => recettes.has(p.recette));

  async function enregistrer() {
    await db.enregistrer('semaines', donnees);
    rafraichir();
  }

  // Chaque recette de la semaine a sa propre entrée au congélateur (02 décisions 4 et 16).
  // Elle compte les portions restantes : changer les portions congelées la corrige d'autant.
  async function changerCongelees(prevue, recette, delta) {
    prevue.congelees = Math.max(0, (prevue.congelees ?? 0) + delta);
    const cle = `${id}/${recette.id}`;
    const entree = (await db.tout('congelateur')).find((e) => e.id === cle)
      ?? { id: cle, recette: recette.id, semaine: id, date: id, portions: 0 };
    entree.portions = Math.max(0, entree.portions + delta);
    if (entree.portions > 0) await db.enregistrer('congelateur', entree);
    else await db.supprimer('congelateur', cle);
    enregistrer();
  }

  function blocRecette(prevue) {
    const recette = recettes.get(prevue.recette);
    return groupe(
      el('a', { class: 'ligne lien', href: `#recette/${recette.id}` },
        vignette(recette),
        el('span', { class: 'ligne-texte' }, recette.nom,
          !tientJusquauMercredi(recette) ? el('span', { class: 'mentions' }, mention('triangle', 'Ne tient pas jusqu’au mercredi')) : null),
        svg(ICONES.chevron, 'icone chevron')),
      el('div', { class: 'ligne' }, 'Portions',
        compteur(prevue.portions, 1, 'portion', (delta) => { prevue.portions += delta; enregistrer(); })),
      // Après la cuisson, on indique soi-même les portions congelées (03 décision 3).
      seCongele(recette)
        ? el('div', { class: 'ligne' }, 'Portions congelées',
          compteur(prevue.congelees ?? 0, 0, 'portion congelée', (delta) => changerCongelees(prevue, recette, delta)))
        : null,
      el('div', { class: 'ligne' }, el('button', {
        class: 'action danger', type: 'button',
        onclick: () => {
          if (!confirm(`Retirer « ${recette.nom} » de la semaine ?`)) return;
          donnees.recettes = donnees.recettes.filter((p) => p !== prevue);
          enregistrer();
        },
      }, 'Retirer de la semaine')),
    );
  }

  return [
    el('h1', {}, 'Semaine'),
    el('div', { class: 'segments large' },
      el('a', { class: precedente ? 'segment' : 'segment actif', href: '#semaine' }, 'À venir'),
      el('a', { class: precedente ? 'segment actif' : 'segment', href: '#semaine/precedente' }, 'Précédente')),
    el('p', { class: 'sous-titre' }, `Cuisine du ${dateLongue(id)}`),

    prevues.length
      ? [
        el('div', { class: 'entete-groupe' }, prevues.length > 1 ? 'Recettes de la semaine' : 'Recette de la semaine'),
        el('div', { class: 'pile' }, prevues.map(blocRecette)),
        el('a', { class: 'bouton-secondaire', href: `#choix/${id}` }, 'Ajouter une recette'),
        el('div', { class: 'entete-groupe' }, 'Courses'),
        groupe(el('a', { class: 'ligne lien', href: `#courses/${id}` },
          el('span', { class: 'ligne-texte' }, 'Liste de courses'),
          donnees.liste ? el('span', { class: 'secondaire' }, resteAAcheter(donnees.liste)) : null,
          svg(ICONES.chevron, 'icone chevron'))),
      ]
      : [
        vide('Aucune recette prévue', precedente
          ? 'Rien n’a été cuisiné cette semaine-là.'
          : 'Choisis ce que tu cuisines dimanche.'),
        el('a', { class: 'bouton-principal', href: `#choix/${id}` }, 'Choisir une recette'),
      ],
  ];
}

// --- Écran de choix (04 décision 5) ---

export async function choix(id) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) id = dimancheAVenir();
  const retour = id === dimanchePrecedent() ? '#semaine/precedente' : '#semaine';
  const donnees = await lireSemaine(id);
  const dejaPrevues = new Set(donnees.recettes.map((p) => p.recette));
  const catalogue = await db.tout('ingredients');
  const mois = moisDe(id);
  const toutes = trierParNom(await db.tout('recettes')).filter((r) => !dejaPrevues.has(r.id));
  const avecSaison = toutes.map((r) => ({ recette: r, hors: horsSaison(r, catalogue, mois) }));
  const affichees = touteLaBibliotheque ? avecSaison : avecSaison.filter((r) => !r.hors.length);

  async function choisir(recette) {
    donnees.recettes.push({ recette: recette.id, portions: PORTIONS_PAR_DEFAUT });
    await db.enregistrer('semaines', donnees);
    message(`${recette.nom} : ${PORTIONS_PAR_DEFAUT} portions, modifiable sur la semaine.`);
    touteLaBibliotheque = false;
    location.hash = retour;
  }

  let contenu;
  if (!toutes.length) {
    contenu = dejaPrevues.size
      ? vide('Tout est déjà prévu', 'Toutes les recettes de la bibliothèque sont dans cette semaine.')
      : [vide('Bibliothèque vide', 'Ajoute d’abord une recette dans la Bibliothèque.'),
        el('a', { class: 'bouton-principal', href: '#ajout' }, 'Ajouter une recette')];
  } else if (!affichees.length) {
    contenu = vide(`Aucune recette de saison en ${MOIS[mois - 1]}`, 'Regarde dans toute la bibliothèque pour refaire une recette hors saison.');
  } else {
    contenu = groupe(affichees.map(({ recette, hors }) =>
      el('button', { class: 'ligne lien choix', type: 'button', onclick: () => choisir(recette) },
        vignette(recette),
        el('span', { class: 'ligne-texte' }, recette.nom,
          el('span', { class: 'mentions' },
            hors.length ? mention('feuille', `Hors saison : ${hors.join(', ')}`) : null,
            !tientJusquauMercredi(recette) ? mention('triangle', 'Ne tient pas jusqu’au mercredi') : null)),
        svg(ICONES.plus, 'icone ajout'))));
  }

  return [
    barre({ retour, titreRetour: 'Semaine' }),
    el('h1', {}, 'Choisir une recette'),
    el('div', { class: 'segments large' },
      el('button', { class: touteLaBibliotheque ? 'segment' : 'segment actif', type: 'button',
        onclick: () => { touteLaBibliotheque = false; dispatchEvent(new HashChangeEvent('hashchange')); } }, 'De saison'),
      el('button', { class: touteLaBibliotheque ? 'segment actif' : 'segment', type: 'button',
        onclick: () => { touteLaBibliotheque = true; dispatchEvent(new HashChangeEvent('hashchange')); } }, 'Toute la bibliothèque')),
    el('p', { class: 'sous-titre' }, `Saison : ${MOIS[mois - 1]}, cuisine du ${dateLongue(id)}`),
    contenu,
  ];
}

export function quitterChoix() {
  touteLaBibliotheque = false;
}
