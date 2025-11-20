import React, { useRef } from 'react';
import { RewrittenCV } from '../types';
import { Download, ArrowLeft, Copy, Check } from 'lucide-react';
import jsPDF from 'jspdf';

interface ImprovedCVProps {
  rewrittenCV: RewrittenCV;
  onBack: () => void;
  onReset: () => void;
}

export const ImprovedCV: React.FC<ImprovedCVProps> = ({ rewrittenCV, onBack, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  // Function to download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFont("helvetica");
    doc.setFontSize(10);
    
    // Split text by lines and add to PDF
    const lines = doc.splitTextToSize(rewrittenCV.markdownContent, maxLineWidth);
    
    let y = 15;
    
    // Simple parsing to bold headers (lines starting with #)
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }

      if (line.trim().startsWith('#')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(line.replace(/#/g, '').trim(), margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      } else if (line.trim().startsWith('-')) {
         doc.text(line, margin + 2, y);
         y += 5;
      } else {
        doc.text(line, margin, y);
        y += 5;
      }
    });

    doc.save('CV_Optimise.pdf');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenCV.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-fade-in pb-12">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'analyse
        </button>
        
        <div className="flex gap-3">
           <button 
            onClick={onReset}
             className="px-4 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
           >
             Recommencer
           </button>
           <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
           >
             {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
             {copied ? 'Copié !' : 'Copier le texte'}
           </button>
           <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
           >
             <Download className="w-4 h-4" />
             Télécharger PDF
           </button>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[75vh]">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">Aperçu du CV Optimisé</h3>
             <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Markdown Mode</span>
          </div>
          <div className="p-8 overflow-y-auto flex-1 font-mono text-sm leading-relaxed text-slate-800 whitespace-pre-wrap bg-[#fff]">
            {rewrittenCV.markdownContent}
          </div>
        </div>
      </div>
    </div>
  );
};