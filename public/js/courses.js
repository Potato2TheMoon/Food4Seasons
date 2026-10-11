// Écran Liste de courses (04 décisions 7, 8, 9 ; 03 décision 7) : marché puis supermarché, sur un seul écran.
import * as db from './db.js';
import { el, svg, ICONES, message, groupe, vide, barre } from './ui.js';
import { formaterQuantite } from './recettes.js';
import { listeVide, mettreAJour, formaterArticle, trierPartie } from './liste.js';
import { dimanchePrecedent, dateLongue, lireSemaine } from './semaine.js';

const PARTIES = [
  { lieu: 'marche', titre: 'Marché', autre: 'supermarche', vers: 'au supermarché' },
  { lieu: 'supermarche', titre: 'Supermarché', autre: 'marche', vers: 'au marché' },
];

export async function courses(id, rafraichir) {
  const retour = id === dimanchePrecedent() ? '#semaine/precedente' : '#semaine';
  const semaine = await lireSemaine(id);
  const recettes = new Map((await db.tout('recettes')).map((r) => [r.id, r]));
  const catalogue = new Map((await db.tout('ingredients')).map((i) => [i.nom, i]));
  const lieuDe = (nom) => catalogue.get(nom)?.lieu ?? 'supermarche';

  const existait = Boolean(semaine.liste);
  semaine.liste ??= listeVide();
  const liste = semaine.liste;
  if (mettreAJour(liste, semaine.recettes, recettes, lieuDe)) {
    await db.enregistrer('semaines', semaine);
    if (existait) message('Liste complétée avec les recettes ajoutées.');
  }

  async function enregistrer() {
    await db.enregistrer('semaines', semaine);
    rafraichir();
  }

  // Corriger le lieu d'achat : l'article change de partie, et l'ingrédient du catalogue aussi (02 décision 5).
  async function deplacer(article, partie) {
    for (const a of liste.articles) if (a.ingredient === article.ingredient) a.lieu = partie.autre;
    const ingredient = catalogue.get(article.ingredient);
    if (ingredient) await db.enregistrer('ingredients', { ...ingredient, lieu: partie.autre });
    message(`${article.ingredient} : ${partie.vers}, aussi pour les prochaines listes.`);
    enregistrer();
  }

  function ligneArticle(article, partie) {
    const quantite = formaterArticle(article, formaterQuantite);
    return el('div', { class: article.coche ? 'ligne article coche' : 'ligne article' },
      el('button', {
        class: 'case', type: 'button', role: 'checkbox', 'aria-checked': String(article.coche),
        onclick: () => { article.coche = !article.coche; enregistrer(); },
      },
      svg(article.coche ? ICONES.coche : ICONES.cercle, 'icone case-icone'),
      el('span', { class: 'ligne-texte' },
        el('span', { class: 'article-nom' }, article.ingredient),
        article.complement ? el('span', { class: 'article-en-plus' }, 'en plus') : null),
      quantite ? el('span', { class: 'secondaire' }, quantite) : null),
      el('button', {
        class: 'bouton-icone', type: 'button', 'aria-label': `Acheter ${article.ingredient} ${partie.vers}`,
        onclick: () => deplacer(article, partie),
      }, svg(ICONES.echange)));
  }

  const parties = PARTIES.map((partie) => {
    const articles = trierPartie(liste.articles.filter((a) => a.lieu === partie.lieu));
    const restants = articles.filter((a) => !a.coche).length;
    return [
      el('div', { class: 'entete-groupe' }, `${partie.titre} · ${restants ? `${restants} à acheter` : 'tout est pris'}`),
      articles.length ? groupe(articles.map((a) => ligneArticle(a, partie))) : vide('Rien à acheter ici', ''),
    ];
  });

  return [
    barre({ retour, titreRetour: 'Semaine' }),
    el('h1', {}, 'Courses'),
    el('p', { class: 'sous-titre' }, `Cuisine du ${dateLongue(id)}`),
    liste.articles.length
      ? [parties, el('p', { class: 'pied-groupe' }, 'Les flèches changent le lieu d’achat d’un ingrédient, pour cette liste et les suivantes.')]
      : vide('Liste vide', 'Choisis d’abord une recette pour la semaine.'),
  ];
}
