# Food4Seasons

Page web personnelle de cuisine de saison et de batch cooking (voir `../06-plan-construction.md`).
Site statique, sans serveur : les données restent dans Safari sur l'iPhone, avec Sauvegarder / Restaurer vers un fichier.

## Contenu

- `public/` : le site publié tel quel (HTML, CSS, JavaScript, `catalogue.json`, icônes).
- `catalogue-a-relire.md` : le catalogue d'ingrédients en version lisible, à relire avant validation.
- `.gitlab-ci.yml` : publication automatique sur GitLab Pages à chaque envoi sur la branche principale.

## Essayer en local

```
cd public && python3 -m http.server 8000
```
puis ouvrir http://localhost:8000.

## Mettre en ligne sur GitLab Pages

1. Créer un projet **privé** vide sur GitLab et y envoyer ce dossier.
2. Paramètres > Général > Visibilité : régler **Pages** sur « Membres du projet uniquement ».
3. Après le premier envoi, l'adresse du site apparaît dans Déploiement > Pages.
4. Sur l'iPhone, ouvrir l'adresse dans Safari, se connecter à GitLab, puis Partager > « Sur l'écran d'accueil ».
