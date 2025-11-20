<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YrB7W9iFBCD3QDnG4T9wC19skvxEPp14

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Configuration de la recherche d'offres d'emploi

L'application peut rechercher automatiquement les offres d'emploi correspondantes sur portaljob-madagascar.com. Vous pouvez configurer cette fonctionnalité via les variables d'environnement suivantes :

### Variables d'environnement optionnelles

- `VITE_JOB_SEARCH_URL` : URL du site de recherche d'emploi (par défaut: `https://www.portaljob-madagascar.com/`)
- `VITE_JOB_SEARCH_MAX_OFFERS` : Nombre maximum d'offres à récupérer (par défaut: `10`)
- `VITE_CORS_PROXY` : URL d'un proxy CORS si le scraping direct est bloqué (optionnel)

### Exemple de configuration

Créez un fichier `.env.local` avec :

```env
VITE_GEMINI_API_KEY=votre_cle_gemini_ici
VITE_JOB_SEARCH_URL=https://www.portaljob-madagascar.com/
VITE_JOB_SEARCH_MAX_OFFERS=10
VITE_CORS_PROXY=https://cors-anywhere.herokuapp.com/
```

**Note:** Le scraping web depuis le navigateur peut être limité par les politiques CORS. Si vous rencontrez des erreurs, vous pouvez :
- Configurer un proxy CORS via `VITE_CORS_PROXY`
- Utiliser un backend proxy pour récupérer les offres
- L'application utilisera des offres d'exemple en cas d'échec du scraping
