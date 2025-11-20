import React, { useState } from 'react';
import { AppStep, CVAnalysis, CVData, RewrittenCV } from './types';
import { extractTextFromPDF } from './services/pdfService';
import { extractCVData, analyzeCV, rewriteCV } from './services/geminiService';
import { UploadStep } from './components/UploadStep';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ImprovedCV } from './components/ImprovedCV';
import { JobOffersList } from './components/JobOffersList';
import { FileText, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [jobDesc, setJobDesc] = useState<string>('');
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [rewrittenResult, setRewrittenResult] = useState<RewrittenCV | null>(null);

  const handleAnalyze = async (file: File, jobDescription: string) => {
    setIsLoading(true);
    setError(null);
    setJobDesc(jobDescription);

    try {
      // 1. PDF Extraction
      const text = await extractTextFromPDF(file);
      
      // 2. AI Extraction
      const extractedData = await extractCVData(text);
      setCvData(extractedData);

      // Mode simple : juste les offres (sans description de poste)
      if (!jobDescription || jobDescription.trim().length < 10) {
        setStep(AppStep.JOB_OFFERS_ONLY);
        setIsLoading(false);
        return;
      }

      // Mode complet : analyse complète avec description de poste
      // 3. AI Analysis
      const analysisResult = await analyzeCV(extractedData, jobDescription);
      setAnalysis(analysisResult);
      
      // 4. Pre-fetch the rewritten version to have it ready, or wait until next step? 
      // Let's do it all at once for a smoother user flow after loading.
      const rewritten = await rewriteCV(extractedData, jobDescription, analysisResult.improvementSuggestions);
      setRewrittenResult(rewritten);

      setStep(AppStep.RESULTS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue pendant l'analyse.");
      setStep(AppStep.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setStep(AppStep.UPLOAD);
    setCvData(null);
    setJobDesc('');
    setAnalysis(null);
    setRewrittenResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 cursor-pointer" onClick={resetApp}>
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">CV Optimize <span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            Optimisation de CV par Intelligence Artificielle
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
            <button onClick={resetApp} className="ml-auto text-sm underline font-medium">Réessayer</button>
          </div>
        )}

        {/* Routing */}
        {step === AppStep.UPLOAD && (
          <UploadStep onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {/* Mode simple : juste les offres d'emploi */}
        {step === AppStep.JOB_OFFERS_ONLY && cvData && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Votre CV a été analysé</h2>
              <p className="text-slate-600">
                Voici les offres d'emploi qui correspondent à votre profil sur portaljob-madagascar.com
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
              <JobOffersList cvData={cvData} />
            </div>
            <div className="text-center">
              <button 
                onClick={resetApp}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Analyser une autre offre
              </button>
            </div>
          </div>
        )}

        {/* Mode complet : analyse détaillée avec description de poste */}
        {step === AppStep.RESULTS && analysis && cvData && (
          <AnalysisDashboard 
            analysis={analysis}
            cvData={cvData}
            onNext={() => setStep(AppStep.ANALYZING)} // Using ANALYZING enum temporarily as 'SHOW_CV' state concept
          />
        )}

        {/* Re-using ANALYZING enum for "Show Result View" to keep types simple or adding a new step */}
        {step === AppStep.ANALYZING && rewrittenResult && (
          <ImprovedCV 
            rewrittenCV={rewrittenResult} 
            onBack={() => setStep(AppStep.RESULTS)}
            onReset={resetApp}
          />
        )}

        {step === AppStep.ERROR && !error && (
             <div className="text-center mt-20">
               <h3 className="text-xl font-semibold text-slate-800">Une erreur inconnue est survenue.</h3>
               <button onClick={resetApp} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Recommencer</button>
             </div>
        )}

      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} CV Optimize AI. Propulsé par Gemini 2.5 Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;