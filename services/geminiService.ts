import { GoogleGenAI, Type } from "@google/genai";
import { CVData, CVAnalysis, RewrittenCV } from "../types";

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
 * Step 1: Extract structured data from raw PDF text.
 */
export const extractCVData = async (rawText: string): Promise<CVData> => {
  const prompt = `Tu es un expert en extraction de données RH. 
  Analyse le texte brut suivant provenant d'un CV et extrais les informations en format JSON structuré.
  
  Texte du CV:
  ${rawText}
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contactInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              address: { type: Type.STRING },
              links: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          summary: { type: Type.STRING },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                institution: { type: Type.STRING },
                degree: { type: Type.STRING },
                dates: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                dates: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          languages: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  if (!response.text) throw new Error("Erreur d'extraction du CV");
  return JSON.parse(response.text) as CVData;
};

/**
 * Step 2: Analyze CV against Job Description.
 */
export const analyzeCV = async (cvData: CVData, jobDescription: string): Promise<CVAnalysis> => {
  const prompt = `Tu es un recruteur senior expert. Analyse ce CV par rapport à l'offre d'emploi suivante.
  Donne un score de correspondance honnête sur 100.
  Liste les points forts (pourquoi ce candidat matche).
  Liste les points faibles (ce qui manque ou ce qui est mal formulé).
  Donne des suggestions concrètes pour améliorer le CV pour CETTE offre précise.
  
  Données du CV: ${JSON.stringify(cvData)}
  
  Offre d'emploi: ${jobDescription}
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchingScore: { type: Type.NUMBER, description: "Score de 0 à 100" },
          positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          negativePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          summaryFeedback: { type: Type.STRING, description: "Un résumé global de l'analyse en une phrase." }
        }
      }
    }
  });

  if (!response.text) throw new Error("Erreur d'analyse du CV");
  return JSON.parse(response.text) as CVAnalysis;
};

/**
 * Step 3: Rewrite the CV to match the job description.
 */
export const rewriteCV = async (cvData: CVData, jobDescription: string, suggestions: string[]): Promise<RewrittenCV> => {
  const prompt = `Tu es un rédacteur de CV professionnel. 
  Réécris ce CV pour qu'il corresponde parfaitement à l'offre d'emploi, en prenant en compte les suggestions d'amélioration.
  
  Règles:
  1. Ne pas inventer d'expériences qui n'existent pas (rester véridique).
  2. Reformuler le résumé (profil) pour utiliser les mots-clés de l'offre.
  3. Mettre en valeur les compétences (hard/soft skills) demandées dans l'offre.
  4. Reformuler les descriptions de poste pour mettre l'accent sur les réalisations pertinentes.
  5. La sortie doit être en format MARKDOWN propre et professionnel, prêt à être lu.
  
  Données Originales: ${JSON.stringify(cvData)}
  Offre d'emploi: ${jobDescription}
  Suggestions appliquées: ${JSON.stringify(suggestions)}
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          markdownContent: { type: Type.STRING, description: "Le CV complet rédigé en Markdown." },
          rawJson: {
            type: Type.OBJECT,
            description: "Les données structurées mises à jour.",
            properties: {
               // Simplified schema just to hold basic updated data if needed
               contactInfo: { type: Type.OBJECT, properties: { name: {type: Type.STRING} } }, 
               summary: { type: Type.STRING },
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("Erreur de réécriture du CV");
  // The rawJson schema above is minimal because we mostly care about the Markdown for the download/display
  // But we return the parsed object to satisfy the interface
  const result = JSON.parse(response.text);
  
  // Merge original contact info into rawJson if it's missing deep details, 
  // but for this specific app flow, we primarily use the markdownContent.
  return {
    markdownContent: result.markdownContent,
    rawJson: { ...cvData, ...result.rawJson } 
  };
};