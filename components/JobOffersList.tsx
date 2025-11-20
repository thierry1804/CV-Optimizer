import React, { useState, useEffect } from 'react';
import { MatchedJobOffer, CVData } from '../types';
import { fetchJobOffers } from '../services/jobSearchService';
import { matchJobOffers } from '../services/jobMatchingService';
import { Briefcase, Building2, Calendar, MapPin, ExternalLink, TrendingUp, Loader2 } from 'lucide-react';

interface JobOffersListProps {
  cvData: CVData;
}

export const JobOffersList: React.FC<JobOffersListProps> = ({ cvData }) => {
  const [matchedOffers, setMatchedOffers] = useState<MatchedJobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingExampleOffers, setIsUsingExampleOffers] = useState(false);

  useEffect(() => {
    const loadJobOffers = async () => {
      setIsLoading(true);
      setError(null);
      setIsUsingExampleOffers(false);
      
      try {
        // Récupérer les offres
        const offers = await fetchJobOffers();
        
        // Vérifier si ce sont des offres d'exemple (basé sur certaines caractéristiques)
        // Les offres d'exemple ont généralement des dates fixes et des références spécifiques
        const isExample = offers.length > 0 && offers.some(o => 
          o.date === '20 Nov 2025' || o.reference === 'RC-19-11'
        );
        setIsUsingExampleOffers(isExample);
        
        // Analyser la correspondance avec le CV
        // Cette fonction gère maintenant les erreurs individuellement
        const matched = await matchJobOffers(cvData, offers);
        
        setMatchedOffers(matched);
      } catch (err: any) {
        console.error('Erreur lors du chargement des offres:', err);
        // Ne pas bloquer l'utilisateur - afficher un message mais continuer
        setError(`Certaines analyses ont échoué: ${err.message || 'Erreur technique'}. Les offres sont affichées sans score de correspondance.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobOffers();
  }, [cvData]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Recherche d'offres d'emploi correspondantes...</span>
        </div>
      </div>
    );
  }

  // Afficher un avertissement si erreur mais continuer à afficher les offres
  if (error && matchedOffers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="text-red-700">
          <p className="font-medium mb-2">Erreur lors de la récupération des offres</p>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-2">
            Note: Le scraping direct peut être bloqué par CORS. Configurez un proxy CORS dans les variables d'environnement si nécessaire.
          </p>
        </div>
      </div>
    );
  }

  if (matchedOffers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-slate-600 text-center">Aucune offre d'emploi trouvée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <Briefcase className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800">Offres d'emploi correspondantes</h3>
          <p className="text-sm text-slate-600">
            {matchedOffers.length} offre{matchedOffers.length > 1 ? 's' : ''} trouvée{matchedOffers.length > 1 ? 's' : ''} sur portaljob-madagascar.com
          </p>
          {isUsingExampleOffers && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Note :</strong> Le scraping direct du site est bloqué par les restrictions CORS. 
                Les offres affichées sont des exemples basés sur les dernières offres disponibles. 
                Pour voir les offres en temps réel, visitez directement{' '}
                <a 
                  href="https://www.portaljob-madagascar.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-amber-900"
                >
                  portaljob-madagascar.com
                </a>
              </p>
            </div>
          )}
          {error && matchedOffers.length > 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Avertissement :</strong> {error}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matchedOffers.map((offer, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Score de correspondance */}
              <div className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
                offer.matchingScore === 0 
                  ? 'text-slate-400 bg-slate-50 border-slate-300' 
                  : getScoreColor(offer.matchingScore)
              }`}>
                <span className="text-2xl font-bold">
                  {offer.matchingScore === 0 ? 'N/A' : offer.matchingScore}
                </span>
                {offer.matchingScore !== 0 && <span className="text-xs font-medium">%</span>}
              </div>

              {/* Détails de l'offre */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800 mb-1">{offer.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{offer.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{offer.date}</span>
                      </div>
                      {offer.reference && (
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          Réf: {offer.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  {offer.url && (
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Voir l'offre complète"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {offer.contractType}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {offer.sector}
                  </span>
                </div>

                {/* Raisons de correspondance */}
                {offer.matchReasons && offer.matchReasons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Pourquoi cette offre vous correspond :</span>
                    </div>
                    <ul className="space-y-1">
                      {offer.matchReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 ${getScoreBadgeColor(offer.matchingScore)}`}></div>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

