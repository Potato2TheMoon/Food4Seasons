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
};

export function message(texte) {
  document.querySelector('.message')?.remove();
  const bulle = el('div', { class: 'message', role: 'status' }, texte);
  document.body.append(bulle);
  setTimeout(() => bulle.remove(), 3500);
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

// Vignette carrée devant le nom (05 décision 7) : l'image, ou un carré potiron clair avec des couverts.
export function vignette(recette, classe = 'vignette') {
  if (recette?.image) return el('img', { class: classe, src: recette.image, alt: '' });
  return el('span', { class: `${classe} remplacement` }, svg(ICONES.couverts));
}

export function mention(icone, texte) {
  return el('span', { class: 'mention' }, svg(ICONES[icone]), texte);
}
