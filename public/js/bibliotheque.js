// Onglet Bibliothèque (04 décisions 12, 13, 14, 19) : liste, fiche recette et brouillon à relire.
import * as db from './db.js';
import { el, svg, ICONES, message, groupe, vide, barre, vignette, mention } from './ui.js';
import {
  UNITES, MOIS, trierParNom, chercher, horsSaison, tientJusquauMercredi,
  seCongele, formaterQuantite, aVerifier, nouvelId,
} from './recettes.js';
import { lireRecetteCollee } from './import.js';

let recherche = '';
const TOUTE_L_ANNEE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// --- Liste ---

export async function liste() {
  const recettes = trierParNom(await db.tout('recettes'));
  const resultats = el('div');

  function remplir() {
    const trouvees = chercher(recettes, recherche);
    resultats.replaceChildren(
      !recettes.length
        ? vide('Aucune recette', 'Ajoute ta première recette avec le bouton +.')
        : !trouvees.length
          ? vide('Aucun résultat', `Aucune recette ni ingrédient ne correspond à « ${recherche} ».`)
          : groupe(trouvees.map((r) =>
            el('a', { class: 'ligne lien', href: `#recette/${r.id}` },
              vignette(r), el('span', { class: 'ligne-texte' }, r.nom), svg(ICONES.chevron, 'icone chevron')))),
    );
  }
  remplir();

  return [
    el('div', { class: 'entete-onglet' },
      el('h1', {}, 'Bibliothèque'),
      el('a', { class: 'bouton-rond', href: '#ajout', 'aria-label': 'Ajouter une recette' }, svg(ICONES.plus))),
    recettes.length ? el('label', { class: 'recherche' }, svg(ICONES.loupe),
      el('input', {
        type: 'search', placeholder: 'Recette ou ingrédient', value: recherche, 'aria-label': 'Rechercher',
        oninput: (e) => { recherche = e.target.value; remplir(); },
      })) : null,
    resultats,
  ];
}

// --- Choix d'ajout (04 décision 14) ---

export function ajout() {
  return [
    barre({ retour: '#bibliotheque', titreRetour: 'Bibliothèque' }),
    el('h1', {}, 'Ajouter une recette'),
    groupe(
      el('a', { class: 'ligne lien', href: '#edition/nouvelle' },
        el('span', { class: 'ligne-texte' }, 'Créer à la main'), svg(ICONES.chevron, 'icone chevron')),
      el('a', { class: 'ligne lien', href: '#coller' },
        el('span', { class: 'ligne-texte' }, 'Coller une recette du skill Claude'), svg(ICONES.chevron, 'icone chevron')),
    ),
    el('p', { class: 'pied-groupe' }, 'Pour importer un texte ou un lien, ou trouver une idée, passe par le skill Food4Seasons dans l’app Claude.'),
  ];
}

// --- Coller une recette préparée par le skill (06 étape F) ---

export function coller() {
  const zone = el('textarea', {
    class: 'champ zone-collage', rows: '10', 'aria-label': 'Recette à coller',
    placeholder: 'Colle ici le bloc rendu par le skill Food4Seasons',
  });

  async function lire() {
    try {
      const { recette, nouveaux } = lireRecetteCollee(zone.value, await db.tout('ingredients'));
      // Le brouillon à relire s'ouvre avec la recette lue (03 décision 8).
      document.querySelector('.message')?.remove();
      brouillon = { pour: 'nouvelle', recette, nouveaux };
      location.hash = '#edition/nouvelle';
    } catch (erreur) {
      message(erreur.message);
    }
  }

  async function collerPressePapiers() {
    try {
      zone.value = await navigator.clipboard.readText();
      lire();
    } catch {
      zone.focus();
      message('Touche longuement la zone puis « Coller ».');
    }
  }

  return [
    barre({ retour: '#ajout', titreRetour: 'Ajouter' }),
    el('h1', {}, 'Coller une recette'),
    el('p', { class: 'pied-groupe intro' }, 'Dans l’app Claude, demande au skill Food4Seasons la recette « pour le site », copie le bloc qu’il rend, puis colle-le ici.'),
    navigator.clipboard?.readText
      ? el('button', { class: 'bouton-principal', type: 'button', onclick: collerPressePapiers }, 'Coller et lire')
      : null,
    groupe(el('div', { class: 'ligne' }, zone)),
    el('button', { class: 'bouton-secondaire', type: 'button', onclick: lire }, 'Lire la recette'),
    el('p', { class: 'pied-groupe' }, 'Rien n’est enregistré avant ta relecture : la recette s’ouvre dans le brouillon, avec les champs vides et les ingrédients nouveaux signalés.'),
  ];
}

// --- Fiche recette ---

export async function fiche(id) {
  const recette = (await db.tout('recettes')).find((r) => r.id === id);
  if (!recette) return [barre({ retour: '#bibliotheque', titreRetour: 'Bibliothèque' }), vide('Recette introuvable', '')];
  const catalogue = await db.tout('ingredients');
  const mois = new Date().getMonth() + 1;
  const hors = horsSaison(recette, catalogue, mois);

  // Commentaires de toutes les semaines où la recette a été cuisinée, le plus récent en premier (02).
  const commentaires = (await db.tout('semaines'))
    .flatMap((semaine) => semaine.recettes
      .filter((p) => p.recette === id && p.commentaire)
      .map((p) => ({ date: semaine.id, texte: p.commentaire })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const dateCommentaire = (iso) => {
    const [a, m, j] = iso.split('-').map(Number);
    return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const mentions = [
    hors.length
      ? mention('feuille', `Hors saison en ${MOIS[mois - 1]} : ${hors.join(', ')}`)
      : mention('feuille', `De saison en ${MOIS[mois - 1]}`),
    !tientJusquauMercredi(recette) ? mention('triangle', 'Ne tient pas jusqu’au mercredi') : null,
  ];

  return [
    barre({ retour: '#bibliotheque', titreRetour: 'Bibliothèque', action: () => { location.hash = `#edition/${id}`; }, titreAction: 'Modifier' }),
    recette.image ? el('img', { class: 'banniere', src: recette.image, alt: '' }) : null,
    el('h1', { class: 'titre-fiche' }, recette.nom),
    el('div', { class: 'mentions' }, mentions),

    el('div', { class: 'entete-groupe' }, 'Conservation'),
    groupe(
      el('div', { class: 'ligne' }, 'Frigo', el('span', { class: 'secondaire' }, recette.frigoJours == null ? 'non renseigné' : `${recette.frigoJours} jours`)),
      el('div', { class: 'ligne' }, 'Congélateur', el('span', { class: 'secondaire' },
        recette.congelMois === undefined ? 'non renseigné' : seCongele(recette) ? `${recette.congelMois} mois` : 'ne se congèle pas')),
    ),

    el('div', { class: 'entete-groupe' }, `Ingrédients pour ${recette.portions} portion${recette.portions > 1 ? 's' : ''}`),
    recette.lignes.length
      ? groupe(recette.lignes.map((l) => el('div', { class: 'ligne' }, l.ingredient,
        el('span', { class: 'secondaire' }, formaterQuantite(l.quantite, l.unite)))))
      : vide('Aucun ingrédient', ''),

    commentaires.length ? [
      el('div', { class: 'entete-groupe' }, 'Commentaires'),
      groupe(commentaires.map((c) => el('div', { class: 'ligne commentaire-fiche' },
        el('span', { class: 'ligne-texte' }, el('span', { class: 'commentaire-date' }, dateCommentaire(c.date)), c.texte)))),
    ] : null,

    el('div', { class: 'entete-groupe' }, 'Étapes'),
    recette.etapes.length
      ? groupe(recette.etapes.map((etape, i) => el('div', { class: 'ligne etape' },
        el('span', { class: 'numero' }, i + 1), el('span', { class: 'ligne-texte' }, etape))))
      : vide('Aucune étape', ''),
  ];
}

// --- Brouillon à relire, aussi utilisé pour modifier (04 décision 13) ---

let brouillon = null;

function recetteVide() {
  return { id: null, nom: '', portions: 4, image: null, frigoJours: null, congelMois: undefined, lignes: [], etapes: [''] };
}

export async function edition(id, rafraichir) {
  if (!brouillon || brouillon.pour !== id) {
    const existante = id === 'nouvelle' ? null : (await db.tout('recettes')).find((r) => r.id === id);
    brouillon = {
      pour: id,
      recette: structuredClone(existante ?? recetteVide()),
      nouveaux: {}, // ingrédients absents du catalogue : nom -> { lieu, mois }
    };
  }
  const { recette, nouveaux } = brouillon;
  const catalogue = await db.tout('ingredients');
  const connus = new Set(catalogue.map((i) => i.nom));
  const { manques, nouveaux: nomsNouveaux } = aVerifier(recette, catalogue);
  const retour = id === 'nouvelle' ? '#bibliotheque' : `#recette/${id}`;

  // Champs simples : on met à jour le brouillon sans tout redessiner, pour garder le clavier ouvert.
  const champ = (attributs) => el('input', { class: 'champ', ...attributs });
  const aCompleter = (vide) => (vide ? el('span', { class: 'a-completer' }, 'à compléter') : null);

  async function enregistrer() {
    if (!recette.nom.trim()) return message('Donne un nom à la recette.');
    if (!recette.portions || recette.portions < 1) return message("Indique le nombre de portions d'origine.");
    recette.nom = recette.nom.trim();
    recette.lignes = recette.lignes.filter((l) => l.ingredient.trim());
    recette.etapes = recette.etapes.map((e) => e.trim()).filter(Boolean);
    const ajouts = recette.lignes
      .map((l) => l.ingredient)
      .filter((n, i, t) => !connus.has(n) && t.indexOf(n) === i)
      .map((nom) => ({
        nom,
        categorie: nouveaux[nom]?.lieu === 'supermarche' ? 'epicerie' : 'legume',
        lieu: nouveaux[nom]?.lieu ?? 'marche',
        // Sur le marché sans mois choisi : disponible toute l'année.
        mois: nouveaux[nom]?.lieu === 'supermarche' ? [] : (nouveaux[nom]?.mois?.length ? nouveaux[nom].mois : TOUTE_L_ANNEE),
      }));
    if (ajouts.length) await db.enregistrer('ingredients', ajouts);
    recette.id ??= nouvelId();
    recette.modifieLe = new Date().toISOString();
    recette.creeLe ??= recette.modifieLe;
    await db.enregistrer('recettes', recette);
    brouillon = null;
    message('Recette enregistrée.');
    location.hash = `#recette/${recette.id}`;
  }

  async function supprimerRecette() {
    if (!confirm(`Supprimer « ${recette.nom || 'cette recette'} » ? Elle disparaîtra de la bibliothèque.`)) return;
    await db.supprimer('recettes', id);
    brouillon = null;
    message('Recette supprimée.');
    location.hash = '#bibliotheque';
  }

  function annuler() {
    brouillon = null;
    location.hash = retour;
  }

  async function choisirImage(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    recette.image = await reduireImage(fichier);
    rafraichir();
  }

  const ligneIngredient = (ligne, index) => {
    const estNouveau = ligne.ingredient.trim() && !connus.has(ligne.ingredient.trim());
    const infos = estNouveau ? (nouveaux[ligne.ingredient.trim()] ??= { lieu: 'marche', mois: [] }) : null;
    return el('div', { class: 'ligne ingredient' },
      el('div', { class: 'ingredient-champs' },
        champ({
          list: 'catalogue', placeholder: 'Ingrédient', value: ligne.ingredient, 'aria-label': 'Ingrédient',
          onchange: (e) => { ligne.ingredient = e.target.value.trim(); rafraichir(); },
        }),
        champ({
          type: 'number', inputmode: 'decimal', min: '0', step: 'any', class: 'champ quantite', placeholder: 'Qté',
          value: ligne.quantite ?? '', disabled: !ligne.unite, 'aria-label': 'Quantité',
          oninput: (e) => { ligne.quantite = e.target.value === '' ? null : Number(e.target.value); },
        }),
        el('select', {
          class: 'champ unite', 'aria-label': 'Unité',
          onchange: (e) => { ligne.unite = e.target.value || null; if (!ligne.unite) ligne.quantite = null; rafraichir(); },
        },
        UNITES.map((u) => el('option', { value: u, selected: ligne.unite === u }, u)),
        el('option', { value: '', selected: !ligne.unite }, 'sans quantité')),
        el('button', {
          class: 'bouton-icone', type: 'button', 'aria-label': 'Retirer cet ingrédient',
          onclick: () => { recette.lignes.splice(index, 1); rafraichir(); },
        }, svg(ICONES.croix)),
      ),
      estNouveau ? el('div', { class: 'nouvel-ingredient' },
        el('span', { class: 'a-completer' }, 'Nouvel ingrédient, à vérifier'),
        el('div', { class: 'segments' },
          ['marche', 'supermarche'].map((lieu) => el('button', {
            type: 'button', class: infos.lieu === lieu ? 'segment actif' : 'segment',
            onclick: () => { infos.lieu = lieu; rafraichir(); },
          }, lieu === 'marche' ? 'Marché' : 'Supermarché'))),
        infos.lieu === 'marche' ? el('div', { class: 'mois' },
          MOIS.map((nom, i) => el('button', {
            type: 'button', class: infos.mois.includes(i + 1) ? 'puce active' : 'puce', 'aria-label': nom,
            onclick: () => {
              infos.mois = infos.mois.includes(i + 1) ? infos.mois.filter((m) => m !== i + 1) : [...infos.mois, i + 1].sort((a, b) => a - b);
              rafraichir();
            },
          }, nom.slice(0, 1).toUpperCase()))) : null,
        infos.lieu === 'marche' ? el('span', { class: 'aide' }, 'Mois de saison (aucun = toute l’année).') : null,
      ) : null,
    );
  };

  return [
    el('div', { class: 'barre-nav' },
      el('button', { class: 'barre-action', type: 'button', onclick: annuler }, 'Annuler'),
      el('button', { class: 'barre-action principale', type: 'button', onclick: enregistrer }, 'Enregistrer')),
    el('h1', {}, id === 'nouvelle' ? 'Nouvelle recette' : 'Modifier'),

    manques.length || nomsNouveaux.length
      ? el('p', { class: 'avertissement' }, svg(ICONES.triangle),
        [manques.length ? `À compléter : ${manques.join(', ')}.` : '', nomsNouveaux.length ? ` Nouveaux ingrédients à vérifier : ${nomsNouveaux.join(', ')}.` : ''].join(''))
      : null,

    el('div', { class: 'entete-groupe' }, 'Photo'),
    groupe(el('div', { class: 'ligne photo' },
      vignette(recette, 'vignette grande'),
      el('label', { class: 'action' }, recette.image ? 'Changer la photo' : 'Ajouter une photo',
        el('input', { type: 'file', accept: 'image/*', hidden: true, onchange: choisirImage })),
      recette.image ? el('button', { class: 'action discret', type: 'button', onclick: () => { recette.image = null; rafraichir(); } }, 'Retirer') : null,
    )),

    el('div', { class: 'entete-groupe' }, 'Recette'),
    groupe(
      el('label', { class: 'ligne' }, 'Nom', aCompleter(!recette.nom.trim()),
        champ({ class: 'champ droite', value: recette.nom, placeholder: 'Nom de la recette', oninput: (e) => { recette.nom = e.target.value; } })),
      el('label', { class: 'ligne' }, "Portions d'origine",
        champ({ type: 'number', inputmode: 'numeric', min: '1', class: 'champ droite court', value: recette.portions ?? '',
          oninput: (e) => { recette.portions = e.target.value === '' ? null : Number(e.target.value); } })),
    ),

    el('div', { class: 'entete-groupe' }, 'Conservation'),
    groupe(
      el('label', { class: 'ligne' }, 'Jours au frigo', aCompleter(recette.frigoJours == null),
        champ({ type: 'number', inputmode: 'numeric', min: '0', class: 'champ droite court', value: recette.frigoJours ?? '',
          onchange: (e) => { recette.frigoJours = e.target.value === '' ? null : Number(e.target.value); rafraichir(); } })),
      el('div', { class: 'ligne' }, 'Se congèle', aCompleter(recette.congelMois === undefined),
        el('div', { class: 'segments droite' },
          [['Oui', recette.congelMois != null && recette.congelMois !== undefined, 3], ['Non', recette.congelMois === null, null]].map(([texte, actif, valeur]) =>
            el('button', { type: 'button', class: actif ? 'segment actif' : 'segment',
              onclick: () => { recette.congelMois = valeur === null ? null : (recette.congelMois || valeur); rafraichir(); } }, texte)))),
      seCongele(recette) ? el('label', { class: 'ligne' }, 'Mois au congélateur',
        champ({ type: 'number', inputmode: 'numeric', min: '1', class: 'champ droite court', value: recette.congelMois,
          oninput: (e) => { recette.congelMois = Math.max(1, Number(e.target.value) || 1); } })) : null,
    ),
    recette.frigoJours != null && !tientJusquauMercredi(recette)
      ? el('p', { class: 'pied-groupe' }, mention('triangle', 'Ne tient pas jusqu’au mercredi')) : null,

    el('div', { class: 'entete-groupe' }, 'Ingrédients'),
    groupe(
      recette.lignes.map(ligneIngredient),
      el('div', { class: 'ligne' }, el('button', {
        class: 'action', type: 'button',
        onclick: () => { recette.lignes.push({ ingredient: '', quantite: null, unite: 'g' }); rafraichir(); },
      }, 'Ajouter un ingrédient')),
    ),
    el('datalist', { id: 'catalogue' }, catalogue.map((i) => el('option', { value: i.nom }))),

    el('div', { class: 'entete-groupe' }, 'Étapes'),
    groupe(
      recette.etapes.map((etape, i) => el('div', { class: 'ligne etape' },
        el('span', { class: 'numero' }, i + 1),
        el('textarea', { class: 'champ', rows: '2', placeholder: `Étape ${i + 1}`, 'aria-label': `Étape ${i + 1}`,
          oninput: (e) => { recette.etapes[i] = e.target.value; } }, etape),
        el('button', { class: 'bouton-icone', type: 'button', 'aria-label': `Retirer l’étape ${i + 1}`,
          onclick: () => { recette.etapes.splice(i, 1); rafraichir(); } }, svg(ICONES.croix)))),
      el('div', { class: 'ligne' }, el('button', {
        class: 'action', type: 'button', onclick: () => { recette.etapes.push(''); rafraichir(); },
      }, 'Ajouter une étape')),
    ),
    el('button', { class: 'bouton-principal', type: 'button', onclick: enregistrer }, 'Enregistrer la recette'),
    id === 'nouvelle' ? null : groupe(el('div', { class: 'ligne' },
      el('button', { class: 'action danger', type: 'button', onclick: supprimerRecette }, 'Supprimer la recette'))),
  ];
}

// Réduit la photo (1200 px de large au plus, JPEG) pour ne pas alourdir la sauvegarde.
async function reduireImage(fichier) {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, 1200 / Math.max(image.width, image.height));
  const toile = document.createElement('canvas');
  toile.width = Math.round(image.width * echelle);
  toile.height = Math.round(image.height * echelle);
  toile.getContext('2d').drawImage(image, 0, 0, toile.width, toile.height);
  return toile.toDataURL('image/jpeg', 0.8);
}

export function quitterEdition() {
  brouillon = null;
}
