// Calcul de la liste de courses, sans affichage (02 décisions 3, 13, 15, 17, 20, 21).
// La liste est figée : elle se crée à partir des recettes de la semaine, puis ne fait que recevoir des ajouts.

// Unités d'une même famille additionnées (02 décision 20) : tout est compté en g ou en ml.
const FAMILLES = { g: ['g', 1], kg: ['g', 1000], ml: ['ml', 1], l: ['ml', 1000] };

function enBase(quantite, unite) {
  const [base, facteur] = FAMILLES[unite] ?? [unite, 1];
  return { unite: base, quantite: quantite * facteur };
}

export function listeVide() {
  return { articles: [], inclus: {} };
}

function ajouterQuantite(article, ajout) {
  if (!ajout) return;
  const existante = article.quantites.find((q) => q.unite === ajout.unite);
  if (existante) existante.quantite += ajout.quantite;
  else article.quantites.push({ ...ajout });
}

function nouvelArticle(liste, ingredient, lieu, complement) {
  const article = {
    id: `a${liste.articles.length + 1}-${Math.random().toString(36).slice(2, 6)}`,
    ingredient, lieu, coche: false, quantites: [], complement,
  };
  liste.articles.push(article);
  return article;
}

// Ajoute à la liste les ingrédients d'une recette pour un nombre de portions.
// Un article déjà coché ne change pas : la quantité en plus va dans un article complémentaire (02 décision 21).
function ajouterRecette(liste, recette, portions, lieuDe) {
  for (const ligne of recette.lignes) {
    if (!ligne.ingredient) continue;
    const ajout = ligne.quantite != null && ligne.unite && recette.portions
      ? enBase(ligne.quantite * portions / recette.portions, ligne.unite)
      : null; // « sans quantité » (sel, poivre…)
    const principal = liste.articles.find((a) => a.ingredient === ligne.ingredient && !a.complement);
    if (!principal) {
      ajouterQuantite(nouvelArticle(liste, ligne.ingredient, lieuDe(ligne.ingredient), false), ajout);
    } else if (!principal.coche) {
      ajouterQuantite(principal, ajout);
    } else if (ajout) {
      const complement = liste.articles.find((a) => a.ingredient === ligne.ingredient && a.complement && !a.coche)
        ?? nouvelArticle(liste, ligne.ingredient, principal.lieu, true);
      ajouterQuantite(complement, ajout);
    }
  }
}

// Met la liste à jour avec les recettes de la semaine : une recette nouvelle y ajoute ses ingrédients
// (02 décision 17) ; des portions en plus y ajoutent seulement la différence. Une recette retirée ou des
// portions en moins ne changent rien, la liste étant figée (02 décision 13).
// Rend true si la liste a changé.
export function mettreAJour(liste, prevues, recettes, lieuDe) {
  let change = false;
  for (const prevue of prevues) {
    const recette = recettes.get(prevue.recette);
    if (!recette) continue;
    const deja = liste.inclus[prevue.recette] ?? 0;
    if (prevue.portions > deja) {
      ajouterRecette(liste, recette, prevue.portions - deja, lieuDe);
      liste.inclus[prevue.recette] = prevue.portions;
      change = true;
    }
  }
  return change;
}

// Quantités d'un article, côte à côte si les unités ne s'additionnent pas (« 1 pièce + 200 g »).
export function formaterArticle(article, formaterQuantite) {
  return article.quantites
    .filter((q) => q.quantite > 0)
    .map(({ quantite, unite }) => {
      if (unite === 'g' && quantite >= 1000) return formaterQuantite(quantite / 1000, 'kg');
      if (unite === 'ml' && quantite >= 1000) return formaterQuantite(quantite / 1000, 'l');
      return formaterQuantite(quantite, unite);
    })
    .join(' + ');
}

// Ordre d'une partie : compléments en haut (02 décision 21), puis le reste à acheter, puis le coché en bas (04 décision 8).
export function trierPartie(articles) {
  const rang = (a) => (a.coche ? 2 : a.complement ? 0 : 1);
  return [...articles].sort((a, b) => rang(a) - rang(b) || a.ingredient.localeCompare(b.ingredient, 'fr', { sensitivity: 'base' }));
}
