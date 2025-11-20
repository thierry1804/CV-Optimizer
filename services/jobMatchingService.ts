import { GoogleGenAI, Type } from "@google/genai";
import { CVData, JobOffer, MatchedJobOffer } from "../types";

// Initialize Gemini Client lazily
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY n'est pas définie. Veuillez créer un fichier .env avec GEMINI_API_KEY=votre_cle");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const MODEL_FAST = 'gemini-2.5-flash';

/**
 * Fonction utilitaire pour attendre un délai
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyse la correspondance entre un CV et une offre d'emploi avec retry
 */
export const matchJobOffer = async (
  cvData: CVData, 
  jobOffer: JobOffer,
  retries: number = 3,
  delay: number = 1000
): Promise<MatchedJobOffer> => {
  const prompt = `Tu es un recruteur expert. Analyse la correspondance entre ce CV et cette offre d'emploi.
  
  Données du CV:
  - Résumé: ${cvData.summary}
  - Expériences: ${JSON.stringify(cvData.experience)}
  - Compétences: ${cvData.skills.join(', ')}
  - Formation: ${JSON.stringify(cvData.education)}
  - Langues: ${cvData.languages.join(', ')}
  
  Offre d'emploi:
  - Titre: ${jobOffer.title}
  - Entreprise: ${jobOffer.company}
  - Type de contrat: ${jobOffer.contractType}
  - Secteur: ${jobOffer.sector}
  ${jobOffer.description ? `- Description: ${jobOffer.description}` : ''}
  
  Donne un score de correspondance de 0 à 100 et liste les raisons principales de cette correspondance.
  `;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await getAI().models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchingScore: { 
                type: Type.NUMBER, 
                description: "Score de correspondance de 0 à 100" 
              },
              matchReasons: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Liste des raisons principales de la correspondance (3-5 raisons)"
              }
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Erreur d'analyse de correspondance");
      }

      const result = JSON.parse(response.text);
      
      return {
        ...jobOffer,
        matchingScore: result.matchingScore,
        matchReasons: result.matchReasons || [],
      };
    } catch (error: any) {
      // Si c'est une erreur 503 (service unavailable) et qu'il reste des tentatives
      const is503 = error?.status === 503 || 
                    error?.code === 503 || 
                    error?.message?.includes('503') ||
                    error?.message?.includes('overloaded') ||
                    error?.message?.includes('UNAVAILABLE');
      
      if (is503 && attempt < retries - 1) {
        // Backoff exponentiel : attendre de plus en plus longtemps
        const waitTime = delay * Math.pow(2, attempt);
        console.log(`Tentative ${attempt + 1}/${retries} échouée (503). Nouvelle tentative dans ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      
      // Si c'est la dernière tentative ou une autre erreur, relancer l'erreur
      throw error;
    }
  }
  
  throw new Error("Toutes les tentatives ont échoué");
};

/**
 * Analyse la correspondance entre un CV et plusieurs offres d'emploi
 * Retourne les offres triées par score de correspondance décroissant
 * En cas d'échec partiel, retourne les offres analysées avec succès + les autres sans score
 */
export const matchJobOffers = async (
  cvData: CVData, 
  jobOffers: JobOffer[]
): Promise<MatchedJobOffer[]> => {
  // Analyser les offres une par une pour gérer les erreurs individuellement
  const matchedOffers: MatchedJobOffer[] = [];
  
  for (const offer of jobOffers) {
    try {
      const matched = await matchJobOffer(cvData, offer);
      matchedOffers.push(matched);
    } catch (error: any) {
      // Si l'analyse échoue, ajouter quand même l'offre sans score
      console.warn(`Impossible d'analyser l'offre "${offer.title}":`, error.message);
      matchedOffers.push({
        ...offer,
        matchingScore: 0, // Score par défaut
        matchReasons: [`Analyse non disponible (${error.message?.includes('overloaded') ? 'Service surchargé' : 'Erreur technique'})`],
      });
    }
  }
  
  // Trier par score décroissant (les offres avec score 0 seront en dernier)
  return matchedOffers.sort((a, b) => b.matchingScore - a.matchingScore);
};

