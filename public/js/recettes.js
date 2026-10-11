// Règles de calcul sur les recettes, sans affichage (02 décisions 2, 3, 12, 19).

export const UNITES = ['g', 'kg', 'ml', 'l', 'pièce', 'c. à soupe', 'c. à café', 'pincée', 'botte', 'gousse'];
export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const CATEGORIES_DE_SAISON = ['legume', 'fruit', 'herbe'];

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

// Ce que le brouillon signale à vérifier (04 décision 15) : champs vides et ingrédients nouveaux.
export function aVerifier(recette, catalogue) {
  const connus = new Set(catalogue.map((i) => i.nom));
  const manques = [];
  if (!recette.nom?.trim()) manques.push('le nom');
  if (!recette.portions) manques.push("le nombre de portions d'origine");
  if (recette.frigoJours == null) manques.push('les jours au frigo');
  if (recette.congelMois === undefined) manques.push('la congélation');
  if (!recette.lignes.length) manques.push('les ingrédients');
  if (!recette.etapes.some((e) => e.trim())) manques.push('les étapes');
  const nouveaux = recette.lignes.map((l) => l.ingredient).filter((n) => n && !connus.has(n));
  return { manques, nouveaux };
}

export function nouvelId() {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
