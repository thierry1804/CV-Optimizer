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

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
