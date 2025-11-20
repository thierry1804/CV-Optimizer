// Define the structure of the extracted CV data
export interface CVData {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    links: string[];
  };
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    dates: string;
    description?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    dates: string;
    description: string;
  }>;
  skills: string[];
  languages: string[];
}

// Analysis result from Gemini
export interface CVAnalysis {
  matchingScore: number; // 0-100
  positivePoints: string[];
  negativePoints: string[];
  improvementSuggestions: string[];
  summaryFeedback: string;
}

// The full rewritten CV structure
export interface RewrittenCV {
  markdownContent: string; // Full Markdown text for display/editing
  rawJson: CVData; // Structured data if needed for form fields
}

// Job offer structure
export interface JobOffer {
  title: string;
  company: string;
  contractType: string;
  sector: string;
  date: string;
  reference?: string;
  url?: string;
  description?: string;
}

// Matched job offer with score
export interface MatchedJobOffer extends JobOffer {
  matchingScore: number; // 0-100
  matchReasons: string[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  JOB_OFFERS_ONLY = 'JOB_OFFERS_ONLY', // Mode simple : juste les offres sans analyse complète
  ERROR = 'ERROR'
}
