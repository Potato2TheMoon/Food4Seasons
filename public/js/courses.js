// Onglet Courses (04 décisions 7, 8, 9, 25 à 28 ; 03 décision 7) : la liste de la semaine à venir,
// marché puis supermarché sur un seul écran, avec les articles ajoutés à la main.
import * as db from './db.js';
import { el, svg, ICONES, message, groupe, vide, barreBas } from './ui.js';
import { formaterQuantite } from './recettes.js';
import { listeVide, mettreAJour, formaterArticle, trierPartie, placerArticle, ajouterManuel, reporterManuels } from './liste.js';
import { dimancheAVenir, dateLongue, lireSemaine } from './semaine.js';

const PARTIES = [
  { lieu: 'marche', titre: 'Marché', autre: 'supermarche', vers: 'au supermarché' },
  { lieu: 'supermarche', titre: 'Supermarché', autre: 'marche', vers: 'au marché' },
];

let saisie = ''; // ce qui est tapé dans « Ajouter un article », gardé quand l'écran se redessine

export async function courses(rafraichir) {
  const id = dimancheAVenir();
  const semaine = await lireSemaine(id);
  const recettes = new Map((await db.tout('recettes')).map((r) => [r.id, r]));
  const ingredients = await db.tout('ingredients');
  const catalogue = new Map(ingredients.map((i) => [i.nom, i]));
  const lieuDe = (nom) => catalogue.get(nom)?.lieu ?? 'supermarche';

  const existait = Boolean(semaine.liste);
  semaine.liste ??= listeVide();
  const liste = semaine.liste;
  let change = mettreAJour(liste, semaine.recettes, recettes, lieuDe);
  if (change && existait) message('Liste complétée avec les recettes ajoutées.');

  // Report du lundi (04 décision 26) : les ajouts à la main non cochés des semaines passées arrivent ici.
  const passees = (await db.tout('semaines')).filter((s) => s.id < id);
  const anciennes = reporterManuels(liste, passees);
  for (const ancienne of anciennes) await db.enregistrer('semaines', ancienne);
  if (anciennes.length) change = true;
  if (change) await db.enregistrer('semaines', semaine);

  async function enregistrer() {
    await db.enregistrer('semaines', semaine);
    rafraichir();
  }

  // Corriger le lieu d'achat : l'article change de partie, et l'ingrédient du catalogue aussi (02 décision 5).
  // Un article ajouté à la main qui n'est pas au catalogue change seulement de partie.
  async function deplacer(article, partie) {
    for (const a of liste.articles) if (a.ingredient === article.ingredient) a.lieu = partie.autre;
    const ingredient = catalogue.get(article.ingredient);
    if (ingredient) {
      await db.enregistrer('ingredients', { ...ingredient, lieu: partie.autre });
      message(`${article.ingredient} : ${partie.vers}, aussi pour les prochaines listes.`);
    } else {
      message(`${article.ingredient} : ${partie.vers}.`);
    }
    enregistrer();
  }

  async function ajouter() {
    const place = placerArticle(saisie, ingredients);
    if (!place) return;
    ajouterManuel(liste, place.nom, place.lieu);
    saisie = '';
    message(`${place.nom} : ${place.lieu === 'marche' ? 'au marché' : 'au supermarché'}.`);
    await enregistrer();
    document.querySelector('.barre-bas input')?.focus();
  }

  function retirer(article) {
    liste.articles = liste.articles.filter((a) => a !== article);
    enregistrer();
    message(`${article.ingredient} retiré.`, {
      libelle: 'Annuler',
      // Relue avant d'annuler : la liste a pu changer depuis (une case cochée entre-temps).
      faire: async () => {
        const actuelle = await lireSemaine(id);
        actuelle.liste.articles.push(article);
        await db.enregistrer('semaines', actuelle);
        rafraichir();
      },
    });
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
      }, svg(ICONES.echange)),
      // Seul un article ajouté à la main se retire : ceux des recettes suivent la liste figée (02 décision 13).
      article.manuel
        ? el('button', {
          class: 'bouton-icone', type: 'button', 'aria-label': `Retirer ${article.ingredient}`,
          onclick: () => retirer(article),
        }, svg(ICONES.croix))
        : null);
  }

  const parties = PARTIES.map((partie) => {
    const articles = trierPartie(liste.articles.filter((a) => a.lieu === partie.lieu));
    const restants = articles.filter((a) => !a.coche).length;
    return [
      el('div', { class: 'entete-groupe' }, `${partie.titre} · ${restants ? `${restants} à acheter` : 'tout est pris'}`),
      articles.length ? groupe(articles.map((a) => ligneArticle(a, partie))) : vide('Rien à acheter ici', ''),
    ];
  });

  // Champ « Ajouter un article » et « + » en bas, à portée du pouce (04 décision 24).
  return [
    el('h1', {}, 'Courses'),
    el('p', { class: 'sous-titre' }, `Cuisine du ${dateLongue(id)}`),
    liste.articles.length
      ? [parties, el('p', { class: 'pied-groupe' }, 'Les flèches changent le lieu d’achat d’un article, pour cette liste et les suivantes.')]
      : vide('Liste vide', 'Choisis une recette dans Semaine, ou ajoute un article en bas.'),
    barreBas(
      el('label', { class: 'recherche' },
        el('input', {
          type: 'text', placeholder: 'Ajouter un article', value: saisie, 'aria-label': 'Ajouter un article',
          enterkeyhint: 'done', autocapitalize: 'sentences',
          oninput: (e) => { saisie = e.target.value; },
          onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter(); } },
        })),
      el('button', { class: 'bouton-rond', type: 'button', 'aria-label': 'Ajouter l’article', onclick: ajouter }, svg(ICONES.plus)),
    ),
  ];
}
