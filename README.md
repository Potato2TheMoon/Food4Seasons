# Food4Seasons

Page web personnelle de cuisine de saison et de batch cooking (voir `../06-plan-construction.md`).
Site statique, sans serveur : les données restent dans Safari sur l'iPhone, avec Sauvegarder / Restaurer vers un fichier.

## Contenu

- `public/` : le site publié tel quel (HTML, CSS, JavaScript, `catalogue.json`, icônes).
- `catalogue-a-relire.md` : le catalogue d'ingrédients en version lisible, à relire avant validation.
- `.github/workflows/pages.yml` : publication automatique sur GitHub Pages à chaque envoi sur la branche principale.

## Essayer en local

```
cd public && python3 -m http.server 8000
```
puis ouvrir http://localhost:8000.

## En ligne

Le site est publié sur GitHub Pages : https://potato2themoon.github.io/food4seasons/
(dépôt public : le code et le catalogue sont visibles, les données personnelles restent dans Safari).

Sur l'iPhone : ouvrir l'adresse dans Safari, puis Partager > « Sur l'écran d'accueil ».
