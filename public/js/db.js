// Base de données dans le navigateur (IndexedDB), d'après le modèle du 02.
// Tout reste sur l'iPhone ; Sauvegarder / Restaurer (01 point 10) passe par un fichier.

const NOM_BASE = 'food4seasons';
const VERSION_BASE = 2;

// Une table par entité du 02. La liste de courses vit dans sa semaine de cuisine.
export const TABLES = {
  ingredients: 'nom',   // catalogue : nom, categorie, mois, lieu
  recettes: 'id',       // bibliothèque
  semaines: 'id',       // semaines de cuisine (id = date du dimanche, AAAA-MM-JJ)
  congelateur: 'id',    // entrées du congélateur
};

// Modifications locales pas encore envoyées à la base partagée (synchro, 06) : une ligne par élément.
const ATTENTE = 'attente';
const cleAttente = (table, cle) => `${table}\u0001${cle}`;

let ouverture;
let apresEcriture = () => {};

// La synchro est prévenue de chaque modification locale.
export function surEcriture(fonction) {
  apresEcriture = fonction;
}

export function ouvrir() {
  ouverture ??= new Promise((resoudre, rejeter) => {
    const requete = indexedDB.open(NOM_BASE, VERSION_BASE);
    requete.onupgradeneeded = () => {
      const base = requete.result;
      for (const [table, cle] of Object.entries(TABLES)) {
        if (!base.objectStoreNames.contains(table)) base.createObjectStore(table, { keyPath: cle });
      }
      if (!base.objectStoreNames.contains(ATTENTE)) base.createObjectStore(ATTENTE, { keyPath: 'id' });
    };
    // Une ancienne version du site encore ouverte dans un autre onglet empêche la mise à jour de la base.
    requete.onblocked = () => dispatchEvent(new Event('food4seasons-bloque'));
    requete.onsuccess = () => {
      const base = requete.result;
      // Si une version plus récente du site s'ouvre ailleurs, on lui laisse la place.
      base.onversionchange = () => { base.close(); location.reload(); };
      resoudre(base);
    };
    requete.onerror = () => rejeter(requete.error);
  });
  return ouverture;
}

function attendre(transaction) {
  return new Promise((resoudre, rejeter) => {
    transaction.oncomplete = () => resoudre();
    transaction.onerror = () => rejeter(transaction.error);
    transaction.onabort = () => rejeter(transaction.error);
  });
}

export async function tout(table) {
  const base = await ouvrir();
  return new Promise((resoudre, rejeter) => {
    const requete = base.transaction(table).objectStore(table).getAll();
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

export async function compter(table) {
  const base = await ouvrir();
  return new Promise((resoudre, rejeter) => {
    const requete = base.transaction(table).objectStore(table).count();
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

function noterAttente(transaction, table, cle) {
  transaction.objectStore(ATTENTE).put({ id: cleAttente(table, cle), table, cle, quand: Date.now() + Math.random() });
}

export async function enregistrer(table, elements) {
  const base = await ouvrir();
  const transaction = base.transaction([table, ATTENTE], 'readwrite');
  const magasin = transaction.objectStore(table);
  for (const element of [].concat(elements)) {
    magasin.put(element);
    noterAttente(transaction, table, element[TABLES[table]]);
  }
  await attendre(transaction);
  apresEcriture();
}

export async function supprimer(table, cle) {
  const base = await ouvrir();
  const transaction = base.transaction([table, ATTENTE], 'readwrite');
  transaction.objectStore(table).delete(cle);
  noterAttente(transaction, table, cle);
  await attendre(transaction);
  apresEcriture();
}

// --- Pour la synchro ---

export async function enAttente() {
  return tout(ATTENTE);
}

// Les modifications envoyées sortent de l'attente, sauf si elles ont encore changé entre-temps.
export async function retirerAttente(lignes) {
  const base = await ouvrir();
  const transaction = base.transaction(ATTENTE, 'readwrite');
  const magasin = transaction.objectStore(ATTENTE);
  for (const ligne of lignes) {
    const requete = magasin.get(ligne.id);
    requete.onsuccess = () => { if (requete.result?.quand === ligne.quand) magasin.delete(ligne.id); };
  }
  return attendre(transaction);
}

export async function lire(table, cle) {
  const base = await ouvrir();
  return new Promise((resoudre, rejeter) => {
    const requete = base.transaction(table).objectStore(table).get(cle);
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

// Applique les éléments reçus de la base partagée. Un élément modifié ici et pas encore envoyé garde
// sa version locale (elle partira au prochain envoi). Rend le nombre d'éléments changés.
export async function appliquerDistant(lignes) {
  const base = await ouvrir();
  const tables = Object.keys(TABLES);
  const transaction = base.transaction([...tables, ATTENTE], 'readwrite');
  const attente = transaction.objectStore(ATTENTE);
  let changes = 0;
  for (const ligne of lignes) {
    if (!tables.includes(ligne.table_nom)) continue;
    const requete = attente.get(cleAttente(ligne.table_nom, ligne.cle));
    requete.onsuccess = () => {
      if (requete.result) return;
      const magasin = transaction.objectStore(ligne.table_nom);
      if (ligne.supprime || ligne.valeur == null) magasin.delete(ligne.cle);
      else magasin.put(ligne.valeur);
      changes += 1;
    };
  }
  await attendre(transaction);
  return changes;
}

// À la première connexion d'un appareil, tout ce qu'il contient part vers la base partagée.
export async function toutMettreEnAttente() {
  const base = await ouvrir();
  const tables = Object.keys(TABLES);
  const cles = {};
  for (const table of tables) cles[table] = (await tout(table)).map((e) => e[TABLES[table]]);
  const transaction = base.transaction(ATTENTE, 'readwrite');
  for (const table of tables) for (const cle of cles[table]) noterAttente(transaction, table, cle);
  return attendre(transaction);
}

// Ajoute au catalogue les ingrédients livrés avec le site qui n'y sont pas encore,
// sans écraser les corrections déjà faites (lieu d'achat, 02 décision 5).
// Les mois de saison suivent toujours le catalogue livré (calendrier ADEME, 02 décision 23) :
// l'app ne permet pas de les modifier pour un ingrédient livré.
export async function completerCatalogue(catalogue) {
  const connus = new Map((await tout('ingredients')).map((i) => [i.nom, i]));
  const changes = catalogue.flatMap((livre) => {
    const local = connus.get(livre.nom);
    if (!local) return [livre];
    const memesMois = JSON.stringify(local.mois ?? []) === JSON.stringify(livre.mois ?? []);
    return memesMois ? [] : [{ ...local, mois: livre.mois }];
  });
  if (changes.length) await enregistrer('ingredients', changes);
  return changes.length;
}

export async function exporter() {
  const donnees = {};
  for (const table of Object.keys(TABLES)) donnees[table] = await tout(table);
  return { app: 'food4seasons', format: 1, date: new Date().toISOString(), donnees };
}

// Remplace toutes les données par celles d'une sauvegarde, en une seule transaction.
export async function importer(sauvegarde) {
  if (sauvegarde?.app !== 'food4seasons' || typeof sauvegarde.donnees !== 'object') {
    throw new Error("Ce fichier n'est pas une sauvegarde Food4Seasons.");
  }
  const base = await ouvrir();
  const tables = Object.keys(TABLES);
  const anciennes = {};
  for (const table of tables) anciennes[table] = (await tout(table)).map((e) => e[TABLES[table]]);
  const transaction = base.transaction([...tables, ATTENTE], 'readwrite');
  for (const table of tables) {
    const magasin = transaction.objectStore(table);
    magasin.clear();
    // Les éléments retirés par la restauration sont aussi supprimés de la base partagée.
    for (const cle of anciennes[table]) noterAttente(transaction, table, cle);
    for (const element of sauvegarde.donnees[table] ?? []) {
      magasin.put(element);
      noterAttente(transaction, table, element[TABLES[table]]);
    }
  }
  await attendre(transaction);
  apresEcriture();
}
