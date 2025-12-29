
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Target, Users, ShieldCheck, Zap } from 'lucide-react';

export const WhoWeAre: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    const fetchImage = async () => {
      const { data } = await supabase
        .from('about_page_assets')
        .select('image_url')
        .eq('asset_key', 'who_we_are_main')
        .single();

      if (data) {
        setImageUrl(data.image_url);
      }
    };
    fetchImage();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in pb-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Quem Somos</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Transformando a complexidade da engenharia elétrica em ferramentas acessíveis e seguras para todos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-electric-yellow">Nossa Missão</h3>
          <p className="text-text-secondary leading-relaxed">
            A <strong>Instalação Segura</strong> nasceu da necessidade de facilitar e democratizar o acesso ao conhecimento técnico normatizado. Nosso objetivo é fornecer de forma simples e descomplicada ferramentas de alta precisão que auxiliem eletricistas, engenheiros e entusiastas a realizar projetos em conformidade com a <strong>NBR 5410</strong>.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Acreditamos que uma instalação bem planejada não é apenas uma questão de funcionalidade, mas de preservação da vida e do patrimônio. Através da tecnologia, eliminamos o erro humano em cálculos complexos de queda de tensão e dimensionamento de condutores.
          </p>
        </div>
        <div className="relative">
          <div className="aspect-video rounded-2xl overflow-hidden border border-dark-border shadow-2xl">
            <img
              src={imageUrl}
              alt="Engenharia Elétrica"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-electric-yellow/10 blur-3xl rounded-full"></div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <Target className="w-6 h-6" />, title: "Precisão", desc: "Cálculos baseados estritamente nas normas vigentes." },
          { icon: <ShieldCheck className="w-6 h-6" />, title: "Segurança", desc: "Foco total na prevenção de acidentes elétricos." },
          { icon: <Users className="w-6 h-6" />, title: "Comunidade", desc: "Suporte técnico e educacional para profissionais." },
          { icon: <Zap className="w-6 h-6" />, title: "Agilidade", desc: "Ferramentas que otimizam o tempo de projeto." }
        ].map((item, i) => (
          <div key={i} className="bg-dark-surface border border-dark-border p-6 rounded-xl hover:border-electric-yellow/30 transition-colors group">
            <div className="text-electric-yellow mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h4 className="text-white font-bold mb-2">{item.title}</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
