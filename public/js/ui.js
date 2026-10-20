// Petits outils d'affichage partagés par les écrans.

export function el(balise, attributs = {}, ...enfants) {
  const noeud = document.createElement(balise);
  for (const [nom, valeur] of Object.entries(attributs)) {
    if (valeur == null || valeur === false) continue;
    if (nom.startsWith('on')) noeud.addEventListener(nom.slice(2), valeur);
    else if (nom === 'value') noeud.value = valeur;
    else noeud.setAttribute(nom, valeur === true ? '' : valeur);
  }
  noeud.append(...enfants.flat(Infinity).filter((e) => e != null && e !== false));
  return noeud;
}

export function svg(chemin, classe = 'icone') {
  const noeud = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  noeud.setAttribute('viewBox', '0 0 24 24');
  noeud.setAttribute('class', classe);
  noeud.setAttribute('aria-hidden', 'true');
  noeud.innerHTML = chemin;
  return noeud;
}

export const ICONES = {
  couverts: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1.5-3.5 4-3.5 7.5 0 1.5.7 2.5 2 2.5H17"/>',
  flocon: '<path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5"/>',
  triangle: '<path d="M12 4 2.8 19.5h18.4L12 4zM12 10v4.5M12 17v.3"/>',
  feuille: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  retour: '<path d="m15 4-8 8 8 8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  loupe: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  croix: '<path d="M6 6l12 12M18 6 6 18"/>',
  casserole: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6zM2 10h2M20 10h2M9 10V8.5a3 3 0 0 1 6 0V10M12 3v2"/>',
  gateau: '<path d="M4 20h16v-7H4v7zM4 16c2 1.3 4 1.3 6 0s4-1.3 6 0 3 1 4 .5M8 13v-2M12 13v-2M16 13v-2M8 8.5v.5M12 8.5v.5M16 8.5v.5"/>',
  horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cercle: '<circle cx="12" cy="12" r="9"/>',
  coche: '<circle cx="12" cy="12" r="9" class="plein"/><path d="m7.8 12.3 2.8 2.8 5.6-5.8" class="trait"/>',
  echange: '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
};

// Petite bulle en bas de l'écran ; avec une action (par exemple « Annuler »), elle reste un peu plus longtemps.
export function message(texte, action) {
  document.querySelector('.message')?.remove();
  const bulle = el('div', { class: 'message', role: 'status' }, texte,
    action ? el('button', { class: 'message-action', type: 'button', onclick: () => { bulle.remove(); action.faire(); } }, action.libelle) : null);
  document.body.append(bulle);
  setTimeout(() => bulle.remove(), action ? 6000 : 3500);
}

export function groupe(...lignes) {
  return el('div', { class: 'groupe' }, ...lignes);
}

export function vide(titre, texte) {
  return groupe(el('div', { class: 'vide' }, el('strong', {}, titre), texte));
}

// Barre du haut d'un écran secondaire : retour à gauche, action à droite.
export function barre({ retour, titreRetour, action, titreAction, actionPrincipale }) {
  return el('div', { class: 'barre-nav' },
    retour
      ? el('a', { class: 'barre-retour', href: retour }, svg(ICONES.retour), titreRetour)
      : el('span'),
    action
      ? el('button', { class: actionPrincipale ? 'barre-action principale' : 'barre-action', type: 'button', onclick: action }, titreAction)
      : el('span'),
  );
}

// Barre en bas de l'écran, juste au-dessus des onglets, pour les actions à portée du pouce (04 décision 24).
// Elle reste collée en bas quand la page défile, et remonte au-dessus du clavier.
export function barreBas(options, ...enfants) {
  if (options instanceof Node || options == null) return barreBas({}, options, ...enfants);
  const classes = ['barre-bas', options.pied ? 'pied' : '', options.boutons ? 'boutons' : ''].filter(Boolean).join(' ');
  return el('div', { class: classes }, ...enfants);
}

// Vignette carrée devant le nom (05 décision 7) : l'image, ou un carré potiron clair avec des couverts.
export function vignette(recette, classe = 'vignette') {
  if (recette?.image) return el('img', { class: classe, src: recette.image, alt: '' });
  return el('span', { class: `${classe} remplacement` }, svg(ICONES.couverts));
}

export function mention(icone, texte) {
  return el('span', { class: 'mention' }, svg(ICONES[icone]), texte);
}
