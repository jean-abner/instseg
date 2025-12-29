import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { getSEOTips } from '../services/geminiService';

interface SEOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SEOModal: React.FC<SEOModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<string>('<p>Carregando estratégia de SEO...</p>');

  useEffect(() => {
    if (isOpen) {
      getSEOTips().then(setContent);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-carbon border border-electric-yellow/30 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-dark-matter">
          <div className="flex items-center gap-2">
            <Search className="text-electric-yellow w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Estratégia de SEO (Gerada por IA)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto prose prose-invert prose-yellow max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};