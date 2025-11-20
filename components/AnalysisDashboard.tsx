import React from 'react';
import { CVAnalysis, CVData } from '../types';
import { CheckCircle2, XCircle, Lightbulb, Star } from 'lucide-react';
import { JobOffersList } from './JobOffersList';

interface AnalysisDashboardProps {
  analysis: CVAnalysis;
  cvData: CVData;
  onNext: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, cvData, onNext }) => {
  // Color for score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-600';
    if (score >= 50) return 'text-yellow-600 border-yellow-600';
    return 'text-red-600 border-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Score Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className={`relative w-32 h-32 rounded-full border-8 flex items-center justify-center ${getScoreColor(analysis.matchingScore)} ${getScoreBg(analysis.matchingScore)}`}>
           <div className="text-center">
             <span className="text-3xl font-bold">{analysis.matchingScore}%</span>
             <span className="block text-xs font-medium uppercase tracking-wide">Match</span>
           </div>
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Analyse de compatibilité</h2>
          <p className="text-slate-600 text-lg">{analysis.summaryFeedback}</p>
        </div>
        <div className="hidden md:block">
           <button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow transition-colors">
             Voir le CV optimisé
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Points */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="font-bold text-lg">Points Forts</h3>
          </div>
          <ul className="space-y-3">
            {analysis.positivePoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 bg-green-50/50 p-3 rounded-lg">
                <div className="min-w-[6px] h-[6px] rounded-full bg-green-500 mt-2"></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Negative Points */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-red-700">
            <XCircle className="w-6 h-6" />
            <h3 className="font-bold text-lg">Points à améliorer</h3>
          </div>
          <ul className="space-y-3">
            {analysis.negativePoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 bg-red-50/50 p-3 rounded-lg">
                <div className="min-w-[6px] h-[6px] rounded-full bg-red-500 mt-2"></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6 md:p-8">
         <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
             <Lightbulb className="w-6 h-6" />
           </div>
           <h3 className="text-xl font-bold text-indigo-900">Stratégie d'amélioration appliquée</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.improvementSuggestions.map((sugg, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 flex flex-col gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <p className="text-sm text-slate-700 font-medium">{sugg}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Job Offers Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <JobOffersList cvData={cvData} />
      </div>

      <div className="md:hidden text-center">
           <button onClick={onNext} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-colors">
             Voir le CV optimisé
           </button>
      </div>
    </div>
  );
};