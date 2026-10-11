// Lecture d'une recette collée depuis le skill Claude (06 étape F ; 03 décisions 8 et 10 ; 04 décision 15).
// Le skill rend un bloc JSON ; on le transforme en brouillon à relire, sans rien enregistrer.
import { UNITES, normaliser } from './recettes.js';

const nombre = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v.replace(',', '.'))) ? Number(v.replace(',', '.')) : null);

// Rend { recette, nouveaux } ou lève une erreur lisible.
export function lireRecetteCollee(texte, catalogue) {
  const debut = texte.indexOf('{');
  const fin = texte.lastIndexOf('}');
  if (debut < 0 || fin < debut) throw new Error('Aucune recette trouvée : ce texte n’a pas le bloc « pour le site ». Demande au skill Food4Seasons la recette « pour le site », puis copie le bloc de code.');
  let donnees;
  try {
    donnees = JSON.parse(texte.slice(debut, fin + 1));
  } catch {
    throw new Error('Le bloc collé est incomplet : recopie-le en entier depuis le skill.');
  }
  if (!donnees || typeof donnees !== 'object' || !('food4seasons' in donnees)) {
    throw new Error('Ce texte ne vient pas du skill Food4Seasons.');
  }

  // Un ingrédient du catalogue est reconnu sans tenir compte des accents ni des majuscules.
  const parNom = new Map(catalogue.map((i) => [normaliser(i.nom), i.nom]));
  const nomCatalogue = (nom) => parNom.get(normaliser(nom)) ?? String(nom).trim();

  const lignes = (Array.isArray(donnees.ingredients) ? donnees.ingredients : [])
    .filter((i) => i && String(i.nom ?? '').trim())
    .map((i) => {
      const unite = UNITES.includes(i.unite) ? i.unite : '';
      const quantite = unite ? nombre(i.quantite) : null;
      return { ingredient: nomCatalogue(i.nom), quantite, unite: quantite == null ? '' : unite };
    });

  // Propositions du skill pour les ingrédients absents du catalogue, à vérifier dans le brouillon.
  const nouveaux = {};
  for (const n of Array.isArray(donnees.nouveaux) ? donnees.nouveaux : []) {
    const nom = nomCatalogue(n?.nom ?? '');
    if (!nom || parNom.has(normaliser(nom))) continue;
    nouveaux[nom] = {
      lieu: n.lieu === 'supermarche' ? 'supermarche' : 'marche',
      mois: (Array.isArray(n.mois) ? n.mois : []).map(Number).filter((m) => m >= 1 && m <= 12),
    };
  }

  const congel = 'congelMois' in donnees ? nombre(donnees.congelMois) : undefined;
  const etapes = (Array.isArray(donnees.etapes) ? donnees.etapes : []).map((e) => String(e).trim()).filter(Boolean);
  const portions = nombre(donnees.portions);
  return {
    recette: {
      id: null,
      nom: String(donnees.nom ?? '').trim(),
      portions: portions && portions > 0 ? Math.round(portions) : null,
      image: typeof donnees.image === 'string' && /^https:\/\//.test(donnees.image) ? donnees.image : null,
      frigoJours: nombre(donnees.frigoJours),
      // Absent : à compléter ; 0 ou null : ne se congèle pas.
      congelMois: congel === undefined ? undefined : congel > 0 ? congel : null,
      lignes,
      etapes: etapes.length ? etapes : [''],
    },
    nouveaux,
  };
}
