// Base de données dans le navigateur (IndexedDB), d'après le modèle du 02.
// Tout reste sur l'iPhone ; Sauvegarder / Restaurer (01 point 10) passe par un fichier.

const NOM_BASE = 'food4seasons';
const VERSION_BASE = 1;

// Une table par entité du 02. La liste de courses vit dans sa semaine de cuisine.
export const TABLES = {
  ingredients: 'nom',   // catalogue : nom, categorie, mois, lieu
  recettes: 'id',       // bibliothèque
  semaines: 'id',       // semaines de cuisine (id = date du dimanche, AAAA-MM-JJ)
  congelateur: 'id',    // entrées du congélateur
};

let ouverture;

export function ouvrir() {
  ouverture ??= new Promise((resoudre, rejeter) => {
    const requete = indexedDB.open(NOM_BASE, VERSION_BASE);
    requete.onupgradeneeded = () => {
      const base = requete.result;
      for (const [table, cle] of Object.entries(TABLES)) {
        if (!base.objectStoreNames.contains(table)) base.createObjectStore(table, { keyPath: cle });
      }
    };
    requete.onsuccess = () => resoudre(requete.result);
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

export async function enregistrer(table, elements) {
  const base = await ouvrir();
  const transaction = base.transaction(table, 'readwrite');
  const magasin = transaction.objectStore(table);
  for (const element of [].concat(elements)) magasin.put(element);
  return attendre(transaction);
}

export async function supprimer(table, cle) {
  const base = await ouvrir();
  const transaction = base.transaction(table, 'readwrite');
  transaction.objectStore(table).delete(cle);
  return attendre(transaction);
}

// Ajoute au catalogue les ingrédients livrés avec le site qui n'y sont pas encore,
// sans écraser les corrections déjà faites (lieu d'achat, 02 décision 5).
export async function completerCatalogue(catalogue) {
  const connus = new Set((await tout('ingredients')).map((i) => i.nom));
  const nouveaux = catalogue.filter((i) => !connus.has(i.nom));
  if (nouveaux.length) await enregistrer('ingredients', nouveaux);
  return nouveaux.length;
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
  const transaction = base.transaction(tables, 'readwrite');
  for (const table of tables) {
    const magasin = transaction.objectStore(table);
    magasin.clear();
    for (const element of sauvegarde.donnees[table] ?? []) magasin.put(element);
  }
  return attendre(transaction);
}
