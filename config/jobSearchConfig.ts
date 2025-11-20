// Configuration pour la recherche d'offres d'emploi
export interface JobSearchConfig {
  baseUrl: string;
  maxOffers: number;
  corsProxy?: string; // URL d'un proxy CORS optionnel (ex: https://cors-anywhere.herokuapp.com/)
}

// Configuration par défaut
export const defaultJobSearchConfig: JobSearchConfig = {
  baseUrl: 'https://www.portaljob-madagascar.com/',
  maxOffers: 10,
  corsProxy: undefined, // À configurer manuellement si vous avez un proxy CORS fonctionnel
};

// Récupérer la configuration depuis les variables d'environnement ou utiliser les valeurs par défaut
export const getJobSearchConfig = (): JobSearchConfig => {
  return {
    baseUrl: import.meta.env.VITE_JOB_SEARCH_URL || defaultJobSearchConfig.baseUrl,
    maxOffers: parseInt(import.meta.env.VITE_JOB_SEARCH_MAX_OFFERS || String(defaultJobSearchConfig.maxOffers), 10),
    corsProxy: import.meta.env.VITE_CORS_PROXY || defaultJobSearchConfig.corsProxy,
  };
};

