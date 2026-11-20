// Règles de calcul sur les recettes, sans affichage (02 décisions 2, 3, 12, 19).

export const UNITES = ['g', 'kg', 'ml', 'l', 'pièce', 'c. à soupe', 'c. à café', 'pincée', 'botte', 'gousse'];
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const CATEGORIES_DE_SAISON = ['legume', 'fruit', 'herbe'];

// Catégorie de la recette (02 décision 22). Une recette sans catégorie, enregistrée avant, est une recette batch.
export const CATEGORIES_RECETTE = [
  { id: 'batch', libelle: 'Batch', mention: 'Batch cooking', icone: 'casserole' },
  { id: 'minute', libelle: 'Minute', mention: 'Recette minute', icone: 'horloge' },
  { id: 'dessert', libelle: 'Dessert', mention: 'Dessert', icone: 'gateau' },
];

export function categorie(recette) {
  return CATEGORIES_RECETTE.some((c) => c.id === recette?.categorie) ? recette.categorie : 'batch';
}

export function infosCategorie(recette) {
  return CATEGORIES_RECETTE.find((c) => c.id === categorie(recette));
}

// Pour chercher sans tenir compte des accents ni des majuscules.
export function normaliser(texte) {
  return (texte ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function trierParNom(recettes) {
  return [...recettes].sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
}

// Recherche par nom de recette ou par ingrédient (04 décision 12).
export function chercher(recettes, texte) {
  const cherche = normaliser(texte);
  if (!cherche) return recettes;
  return recettes.filter((r) =>
    normaliser(r.nom).includes(cherche) ||
    r.lignes.some((l) => normaliser(l.ingredient).includes(cherche)));
}

// Une recette est de saison si tous ses fruits, légumes et herbes le sont ce mois-ci (02 décision 19).
// Rend la liste des ingrédients hors saison (vide = de saison).
export function horsSaison(recette, catalogue, mois) {
  const parNom = new Map(catalogue.map((i) => [i.nom, i]));
  return recette.lignes
    .map((l) => parNom.get(l.ingredient))
    .filter((i) => i && CATEGORIES_DE_SAISON.includes(i.categorie) && !i.mois.includes(mois))
    .map((i) => i.nom);
}

// Tient du dimanche soir au mercredi soir : 3 jours au frigo après la cuisson.
export function tientJusquauMercredi(recette) {
  return recette.frigoJours == null || recette.frigoJours >= 3;
}

// L'avertissement « ne tient pas jusqu'au mercredi » ne concerne que les recettes batch (04 décision 22).
export function avertirMercredi(recette) {
  return categorie(recette) === 'batch' && !tientJusquauMercredi(recette);
}

export function seCongele(recette) {
  return recette.congelMois != null && recette.congelMois > 0;
}

// Quantité recalculée pour le nombre de portions choisi (02 décision 3).
export function recalculer(quantite, portionsOrigine, portionsChoisies) {
  if (quantite == null || !portionsOrigine) return quantite;
  return quantite * portionsChoisies / portionsOrigine;
}

export function formaterQuantite(quantite, unite) {
  if (quantite == null || !unite) return '';
  const arrondi = quantite >= 10 ? Math.round(quantite) : Math.round(quantite * 10) / 10;
  const nombre = arrondi.toLocaleString('fr-FR');
  const pluriel = unite === 'pièce' && arrondi > 1 ? 'pièces' : unite === 'gousse' && arrondi > 1 ? 'gousses' : unite === 'botte' && arrondi > 1 ? 'bottes' : unite === 'pincée' && arrondi > 1 ? 'pincées' : unite;
  return `${nombre} ${pluriel}`;
}

// Portions demandées dans l'adresse de la fiche (depuis la Semaine) ; sinon celles d'origine.
export function portionsDemandees(texte, portionsOrigine) {
  const n = Number(texte);
  return Number.isInteger(n) && n > 0 ? n : portionsOrigine;
}

// Lignes de la fiche et du panneau Ingrédients : nom et quantité pour les portions demandées.
export function lignesPourPortions(recette, portions) {
  return recette.lignes.map((l) => ({
    ingredient: l.ingredient,
    quantite: formaterQuantite(recalculer(l.quantite, recette.portions, portions), l.unite),
  }));
}

// Bouton « Ingrédients » de la fiche (#10) : visible dès que la 1re ligne commence à passer
// sous la barre du haut (collante), caché quand la liste redevient entièrement visible.
export function boutonIngredientsVisible(hautPremiereLigne, basBarre) {
  return hautPremiereLigne < basBarre;
}

// Panneau Ingrédients glissé vers le bas (#10) : fermé au-delà de 25 % de sa hauteur, ou par un
// geste rapide vers le bas (> 0,5 px/ms à la fin du geste) d'au moins 30 px ; sinon il revient en place.
export function fermerApresGlissement(deplacement, vitesse, hauteurPanneau) {
  if (deplacement <= 0) return false;
  if (deplacement > hauteurPanneau * 0.25) return true;
  return deplacement >= 30 && vitesse > 0.5;
}

// Vitesse en fin de geste (px/ms), mesurée sur les ~100 dernières ms : un coup sec final compte
// même si le geste a commencé lentement. points : [{ y, t }] dans l'ordre.
export function vitesseFinale(points, fenetreMs = 100) {
  if (points.length < 2) return 0;
  const dernier = points[points.length - 1];
  const premier = points.find((p) => dernier.t - p.t <= fenetreMs) ?? points[0];
  const debut = premier === dernier ? points[points.length - 2] : premier;
  const duree = dernier.t - debut.t;
  return duree > 0 ? (dernier.y - debut.y) / duree : 0;
}

// Texte lisible envoyé par le bouton Partager de la fiche : nom, ingrédients pour les portions d'origine, étapes.
// La conservation, les commentaires et la photo restent dans l'app.
export function texteRecette(recette) {
  const blocs = [recette.nom.trim()];
  if (recette.lignes.length) {
    const titre = recette.portions ? `Ingrédients pour ${recette.portions} portion${recette.portions > 1 ? 's' : ''}` : 'Ingrédients';
    blocs.push([titre, ...recette.lignes.map((l) => {
      const quantite = formaterQuantite(l.quantite, l.unite);
      return quantite ? `- ${l.ingredient} : ${quantite}` : `- ${l.ingredient}`;
    })].join('\n'));
  }
  const etapes = recette.etapes.map((e) => e.trim()).filter(Boolean);
  if (etapes.length) blocs.push(['Étapes', ...etapes.map((e, i) => `${i + 1}. ${e}`)].join('\n'));
  return blocs.join('\n\n');
}

// Ce que le brouillon signale à vérifier (04 décision 15) : champs vides et ingrédients nouveaux.
export function aVerifier(recette, catalogue) {
  const connus = new Set(catalogue.map((i) => i.nom));
  const manques = [];
  if (!recette.nom?.trim()) manques.push('le nom');
  if (!recette.portions) manques.push("le nombre de portions d'origine");
  // Une recette minute se mange le jour même : sa conservation n'est pas demandée.
  if (categorie(recette) !== 'minute') {
    if (recette.frigoJours == null) manques.push('les jours au frigo');
    if (recette.congelMois === undefined) manques.push('la congélation');
  }
  if (!recette.lignes.length) manques.push('les ingrédients');
  if (!recette.etapes.some((e) => e.trim())) manques.push('les étapes');
  const nouveaux = recette.lignes.map((l) => l.ingredient).filter((n) => n && !connus.has(n));
  return { manques, nouveaux };
}

export function nouvelId() {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
