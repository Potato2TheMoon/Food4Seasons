// Widget « Fruits & légumes » du mois sur l'écran Semaine (04 décision 23), inspiré de celui de Yuka.
// Il montre les fruits puis les légumes de saison du catalogue ; un appui ouvre les recettes qui en contiennent.
import { el } from './ui.js';
import { ICONES_SAISON } from './icones-saison.js';
import { MOIS } from './recettes.js';

const APERCU = 10; // deux rangées de cinq par partie, le reste derrière « Tout voir »
const COULEURS = ['#E07B00', '#4FA545', '#C2306A', '#5B3A7A', '#D8A520', '#3E8AB8'];
let toutVoir = false;

function icone(nom) {
  const noeud = el('span', { class: 'saison-icone', 'aria-hidden': 'true' });
  const dessin = ICONES_SAISON[nom];
  if (dessin) {
    noeud.innerHTML = `<svg viewBox="0 0 64 64">${dessin}</svg>`;
  } else {
    // Ingrédient ajouté après coup, sans dessin : une pastille avec son initiale.
    const couleur = COULEURS[[...nom].reduce((s, c) => s + c.charCodeAt(0), 0) % COULEURS.length];
    noeud.append(el('span', { class: 'saison-pastille', style: `background:${couleur}` }, nom.slice(0, 1).toUpperCase()));
  }
  return noeud;
}

// Ce qui est de saison toute l'année (carotte, oignon, pomme…) n'apporte pas d'idée : on le laisse de côté.
export function fruitsEtLegumesDuMois(catalogue, mois) {
  const deSaison = catalogue
    .filter((i) => ['fruit', 'legume'].includes(i.categorie) && i.mois?.length && i.mois.length < 12 && i.mois.includes(mois))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
  return {
    fruits: deSaison.filter((i) => i.categorie === 'fruit').map((i) => i.nom),
    legumes: deSaison.filter((i) => i.categorie === 'legume').map((i) => i.nom),
  };
}

export function widgetSaison(catalogue, mois, ouvrir) {
  const { fruits, legumes } = fruitsEtLegumesDuMois(catalogue, mois);
  if (!fruits.length && !legumes.length) return null;
  const cadre = el('section', { class: 'saison', 'aria-label': `Fruits et légumes de saison en ${MOIS[mois - 1]}` });

  function partie(noms) {
    const visibles = toutVoir ? noms : noms.slice(0, APERCU);
    return el('div', { class: 'saison-grille' }, visibles.map((nom) =>
      el('button', { class: 'saison-case', type: 'button', title: nom, onclick: () => ouvrir(nom) },
        icone(nom), el('span', { class: 'saison-nom' }, nom))));
  }

  function dessiner() {
    const caches = Math.max(0, fruits.length - APERCU) + Math.max(0, legumes.length - APERCU);
    cadre.replaceChildren(
      el('h2', { class: 'saison-titre' }, `Fruits & légumes • ${MOIS[mois - 1]}`),
      fruits.length ? partie(fruits) : null,
      fruits.length && legumes.length ? el('hr', { class: 'saison-separation' }) : null,
      legumes.length ? partie(legumes) : null,
      caches || toutVoir ? el('button', {
        class: 'saison-plus', type: 'button',
        onclick: () => { toutVoir = !toutVoir; dessiner(); },
      }, toutVoir ? 'Voir moins' : `Tout voir (${caches} de plus)`) : null,
    );
  }
  dessiner();
  return cadre;
}
