// Synchro entre appareils par une base Supabase (décision du 2026-10-11, 06).
// Le site garde ses données dans Safari pour marcher sans réseau, envoie les modifications locales
// et récupère celles des autres appareils. En cas de conflit, la dernière modification envoyée l'emporte.
import * as db from './db.js';
import { SUPABASE_URL, SUPABASE_CLE } from './config.js';

const SESSION = 'food4seasons-session';
const DERNIERE = 'food4seasons-derniere-synchro';
const PAQUET = 200;

let enCours = null;
let minuterie = null;
let surReception = () => {};
let surEtat = () => {};
export const etat = { derniere: null, erreur: null };

export const configuree = () => Boolean(SUPABASE_URL && SUPABASE_CLE);

function lireStockage(nom) {
  try { return JSON.parse(localStorage.getItem(nom)); } catch { return null; }
}
function ecrireStockage(nom, valeur) {
  try {
    if (valeur == null) localStorage.removeItem(nom);
    else localStorage.setItem(nom, JSON.stringify(valeur));
  } catch { /* stockage indisponible : la session ne survivra pas au rechargement */ }
}

export function session() {
  return lireStockage(SESSION);
}

// --- Connexion (e-mail et mot de passe) ---

async function appelAuth(chemin, corps) {
  const reponse = await fetch(`${SUPABASE_URL}/auth/v1/${chemin}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_CLE, 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  });
  const donnees = await reponse.json().catch(() => ({}));
  if (!reponse.ok) {
    const texte = donnees.error_description || donnees.msg || donnees.message || '';
    if (/invalid login/i.test(texte)) throw new Error('E-mail ou mot de passe incorrect.');
    if (/not confirmed/i.test(texte)) throw new Error('Confirme d’abord ton e-mail avec le lien reçu.');
    if (/already registered/i.test(texte)) throw new Error('Ce compte existe déjà : connecte-toi.');
    throw new Error(texte || `Erreur de connexion (${reponse.status}).`);
  }
  return donnees;
}

function garderSession(donnees) {
  ecrireStockage(SESSION, {
    access_token: donnees.access_token,
    refresh_token: donnees.refresh_token,
    expire: Date.now() + (donnees.expires_in ?? 3600) * 1000,
    utilisateur: { id: donnees.user.id, email: donnees.user.email },
  });
}

export async function connecter(email, motDePasse) {
  garderSession(await appelAuth('token?grant_type=password', { email, password: motDePasse }));
  // Première connexion de cet appareil : tout ce qu'il contient rejoint la base partagée.
  await db.toutMettreEnAttente();
  ecrireStockage(DERNIERE, null);
  return synchroniser();
}

// Rend true si le compte est prêt, false s'il faut d'abord confirmer l'e-mail.
export async function creerCompte(email, motDePasse) {
  const donnees = await appelAuth('signup', { email, password: motDePasse });
  if (!donnees.access_token) return false;
  garderSession(donnees);
  await db.toutMettreEnAttente();
  ecrireStockage(DERNIERE, null);
  await synchroniser();
  return true;
}

export function deconnecter() {
  ecrireStockage(SESSION, null);
  ecrireStockage(DERNIERE, null);
  etat.derniere = null;
  surEtat();
}

async function jeton() {
  const s = session();
  if (!s) return null;
  if (Date.now() < s.expire - 60000) return s.access_token;
  try {
    garderSession(await appelAuth('token?grant_type=refresh_token', { refresh_token: s.refresh_token }));
    return session().access_token;
  } catch (erreur) {
    if (!navigator.onLine) throw erreur;
    deconnecter();
    throw new Error('Session expirée : reconnecte-toi dans la Bibliothèque.');
  }
}

async function appelBase(methode, requete, corps, entetes = {}) {
  const reponse = await fetch(`${SUPABASE_URL}/rest/v1/${requete}`, {
    method: methode,
    headers: {
      apikey: SUPABASE_CLE,
      Authorization: `Bearer ${await jeton()}`,
      'Content-Type': 'application/json',
      ...entetes,
    },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  if (!reponse.ok) throw new Error(`La base partagée a répondu ${reponse.status}.`);
  return reponse.status === 204 ? null : reponse.json().catch(() => null);
}

// --- Envoi puis réception ---

async function envoyer() {
  const attente = await db.enAttente();
  const proprietaire = session().utilisateur.id;
  for (let i = 0; i < attente.length; i += PAQUET) {
    const paquet = attente.slice(i, i + PAQUET);
    const lignes = await Promise.all(paquet.map(async (a) => {
      const valeur = await db.lire(a.table, a.cle);
      return { proprietaire, table_nom: a.table, cle: String(a.cle), valeur: valeur ?? null, supprime: valeur == null };
    }));
    await appelBase('POST', 'elements?on_conflict=proprietaire,table_nom,cle', lignes,
      { Prefer: 'resolution=merge-duplicates,return=minimal' });
    await db.retirerAttente(paquet);
  }
}

async function recevoir() {
  let depuis = lireStockage(DERNIERE);
  let recues = 0;
  for (;;) {
    const filtre = depuis ? `&modifie_le=gt.${encodeURIComponent(depuis)}` : '';
    const lignes = await appelBase('GET', `elements?select=table_nom,cle,valeur,supprime,modifie_le${filtre}&order=modifie_le.asc&limit=${PAQUET}`);
    if (!lignes?.length) break;
    recues += await db.appliquerDistant(lignes);
    depuis = lignes[lignes.length - 1].modifie_le;
    ecrireStockage(DERNIERE, depuis);
    if (lignes.length < PAQUET) break;
  }
  return recues;
}

export function synchroniser() {
  if (!configuree() || !session()) return Promise.resolve(0);
  enCours ??= (async () => {
    try {
      await envoyer();
      const recues = await recevoir();
      etat.derniere = new Date();
      etat.erreur = null;
      if (recues) surReception();
      return recues;
    } catch (erreur) {
      etat.erreur = navigator.onLine ? erreur.message : 'Hors ligne : synchro dès le retour du réseau.';
      return 0;
    } finally {
      enCours = null;
      surEtat();
    }
  })();
  return enCours;
}

// Après une modification locale, on attend un peu pour regrouper les envois.
function bientot() {
  clearTimeout(minuterie);
  minuterie = setTimeout(synchroniser, 1500);
}

export function demarrer({ apresReception, apresEtat }) {
  surReception = apresReception;
  surEtat = apresEtat;
  if (!configuree()) return;
  db.surEcriture(bientot);
  synchroniser();
  addEventListener('online', synchroniser);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') synchroniser(); });
  setInterval(() => { if (document.visibilityState === 'visible') synchroniser(); }, 60000);
}
