
import React from 'react';
import { Eye, BookOpen } from 'lucide-react';

interface GuideCard {
  title: string;
  description: string;
  image: string;
  category: string;
}

const guides: GuideCard[] = [
  {
    title: "Ligação Simples de Iluminação",
    description: "Esquema básico com um interruptor simples comandando uma ou mais lâmpadas em série/paralelo.",
    image: "https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=1974&auto=format&fit=crop",
    category: "Residencial"
  },
  {
    title: "Ligação Paralela (Three-Way)",
    description: "Comando de iluminação a partir de dois pontos diferentes, ideal para corredores e escadas.",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=2070&auto=format&fit=crop",
    category: "Residencial"
  },
  {
    title: "Ligação Intermediária (Four-Way)",
    description: "Comando de iluminação a partir de três ou mais pontos distintos usando interruptores intermediários.",
    image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=1974&auto=format&fit=crop",
    category: "Residencial"
  },
  {
    title: "Partida Estrela-Triângulo",
    description: "Configuração para motores elétricos trifásicos para redução da corrente de partida.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop",
    category: "Industrial"
  },
  {
    title: "Montagem de Dispositivos no QDC",
    description: "Disposição correta de Disjuntor Geral, IDR e DPS no barramento conforme a NBR 5410.",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop",
    category: "Normatização"
  },
  {
    title: "Ligação de Chuveiro Elétrico",
    description: "Dimensionamento e conexão correta de cabos e disjuntores para chuveiros de alta potência.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
    category: "Residencial"
  }
];

export const TechnicalGuide: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in pb-20">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">Guia Técnico</h2>
        <p className="text-text-secondary text-sm">Esquemas de ligações e boas práticas de montagem.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map((guide, i) => (
          <div key={i} className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden group hover:border-electric-yellow/30 transition-all flex flex-col">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={guide.image} 
                alt={guide.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black/60 backdrop-blur-md text-electric-yellow text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-wider">
                  {guide.category}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-yellow transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
                {guide.description}
              </p>
              <button className="flex items-center gap-2 text-xs font-bold text-electric-yellow hover:gap-3 transition-all">
                <Eye className="w-4 h-4" /> VER ESQUEMA COMPLETO
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-zinc-900 to-dark-bg border border-dark-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-electric-yellow/10 flex items-center justify-center text-electric-yellow shrink-0">
             <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-1">Precisa de um Guia Específico?</h4>
            <p className="text-sm text-text-secondary">Nossa equipe está constantemente atualizando nossa biblioteca de esquemas.</p>
          </div>
        </div>
        <button className="whitespace-nowrap bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors">
          Sugerir Novo Guia
        </button>
      </div>
    </div>
  );
};
