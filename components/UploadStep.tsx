import React, { useCallback, useState } from 'react';
import { Upload, FileText, Briefcase, ArrowRight, Loader2 } from 'lucide-react';

interface UploadStepProps {
  onAnalyze: (file: File, jobDescription: string) => void;
  isLoading: boolean;
}

export const UploadStep: React.FC<UploadStepProps> = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Veuillez uploader un fichier PDF.');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file && jobDescription.trim().length > 10) {
      onAnalyze(file, jobDescription);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Title Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">Optimisez votre CV pour votre job de rêve</h2>
        <p className="text-slate-600 max-w-lg mx-auto">
          Téléversez votre CV actuel et copiez l'offre d'emploi. Notre IA analysera la compatibilité et générera une version améliorée.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: CV Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">1. Votre CV (PDF)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 h-64 flex flex-col items-center justify-center cursor-pointer
              ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
              ${file ? 'bg-indigo-50 border-indigo-500' : ''}
            `}
          >
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="hidden" 
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
              {file ? (
                <>
                  <FileText className="w-12 h-12 text-indigo-600 mb-3" />
                  <span className="font-medium text-slate-900">{file.name}</span>
                  <span className="text-xs text-indigo-600 mt-2">Changer de fichier</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-slate-600 font-medium">Glissez votre PDF ici</span>
                  <span className="text-xs text-slate-400 mt-1">ou cliquez pour parcourir</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Right: Job Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">2. Offre d'emploi</label>
          <div className="relative h-64">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Collez le texte de l'offre d'emploi ici..."
              className="w-full h-full p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-sm"
            />
            <Briefcase className="absolute top-4 right-4 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSubmit}
          disabled={!file || jobDescription.length < 10 || isLoading}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform
            ${(!file || jobDescription.length < 10) 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-200'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              Analyser et Optimiser
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};