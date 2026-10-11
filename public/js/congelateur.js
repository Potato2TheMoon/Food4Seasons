// Onglet Congélateur (04 décisions 10 et 11 ; 02 décisions 4, 8, 9).
import * as db from './db.js';
import { el, message, groupe, vide, vignette, mention } from './ui.js';
import { dateLongue } from './semaine.js';

// Limite de conservation : date de congélation + mois de congélation de la recette (02 décision 9).
function limite(entree, recette) {
  if (!recette?.congelMois) return null;
  const [a, m, j] = entree.date.split('-').map(Number);
  return new Date(a, m - 1 + recette.congelMois, j);
}

const dateCourte = (date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export async function inventaire(rafraichir) {
  const recettes = new Map((await db.tout('recettes')).map((r) => [r.id, r]));
  // La plus proche de sa limite en premier ; sans limite connue, à la fin (04 décision 10).
  const entrees = (await db.tout('congelateur'))
    .filter((e) => e.portions > 0)
    .map((e) => ({ entree: e, recette: recettes.get(e.recette), limite: limite(e, recettes.get(e.recette)) }))
    .sort((a, b) => (a.limite ?? Infinity) - (b.limite ?? Infinity) || a.entree.date.localeCompare(b.entree.date));

  // −1 retire une portion tout de suite ; « Annuler » la remet (04 décision 11). L'entrée disparaît à 0 (02 décision 8).
  async function retirer(entree, nom) {
    const avant = { ...entree };
    entree.portions -= 1;
    if (entree.portions > 0) await db.enregistrer('congelateur', entree);
    else await db.supprimer('congelateur', entree.id);
    message(entree.portions > 0 ? `${nom} : une portion sortie.` : `${nom} : dernière portion sortie.`, {
      libelle: 'Annuler',
      faire: async () => { await db.enregistrer('congelateur', avant); rafraichir(); },
    });
    rafraichir();
  }

  const aujourdhui = new Date();
  return [
    el('h1', {}, 'Congélateur'),
    entrees.length
      ? [
        el('div', { class: 'entete-groupe' }, 'À manger en priorité en haut'),
        groupe(entrees.map(({ entree, recette, limite: fin }) => {
          const nom = recette?.nom ?? 'Recette supprimée';
          return el('div', { class: 'ligne entree' },
            recette ? el('a', { href: `#recette/${recette.id}`, class: 'lien-vignette' }, vignette(recette)) : vignette(null),
            el('span', { class: 'ligne-texte' },
              el('span', { class: 'entree-nom' }, nom),
              el('span', { class: 'mentions' },
                mention('flocon', `${entree.portions} portion${entree.portions > 1 ? 's' : ''} · congelé le ${dateLongue(entree.date).replace(/^\S+ /, '')}`),
                fin ? mention(fin < aujourdhui ? 'triangle' : 'horloge', `${fin < aujourdhui ? 'Limite dépassée le' : 'À manger avant le'} ${dateCourte(fin)}`) : null)),
            el('button', { class: 'bouton-moins', type: 'button', 'aria-label': `Sortir une portion de ${nom}`, onclick: () => retirer(entree, nom) }, '−1'));
        })),
        el('p', { class: 'pied-groupe' }, 'Les portions congelées s’indiquent sur chaque recette de la semaine.'),
      ]
      : vide('Congélateur vide', 'Indique les portions congelées sur une recette de la semaine, après l’avoir cuisinée.'),
  ];
}
