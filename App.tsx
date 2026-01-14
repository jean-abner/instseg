
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Calculator as CalcIcon, FileSpreadsheet, Menu, X, ArrowRight, CheckCircle2, MousePointer2, Calendar, ArrowUpRight, ChevronDown, Download, Smartphone, List, Plus, Instagram } from 'lucide-react';
import { Calculator } from './components/Calculator';
import { DiagramGenerator } from './components/DiagramGenerator';
import { Blog } from './components/Blog';
import { WhoWeAre } from './components/WhoWeAre';
import { BlogPost } from './types';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Contact } from './components/Contact';
import { supabase } from './lib/supabaseClient';
import { Analytics } from "@vercel/analytics/react"
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [instagramUrl, setInstagramUrl] = useState<string>('#');
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check active route
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: socialData } = await supabase
        .from('social_links')
        .select('url')
        .eq('platform', 'instagram')
        .single();

      if (socialData) {
        setInstagramUrl(socialData.url);
      }

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false })
        .limit(3);

      if (postsData) {
        setLatestPosts(postsData);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openBlogPost = (id: number) => {
    navigate(`/blog/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NavItem = ({ target, label, className = "" }: { target: string, label: string, className?: string }) => (
    <button
      onClick={() => {
        navigate(target);
        setMobileMenuOpen(false);
        setToolsOpen(false);
        setMobileToolsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`font-medium transition-colors text-left ${isActive(target) ? 'text-electric-yellow' : 'text-text-secondary hover:text-text-primary'} ${className ? className : 'text-base'}`}
    >
      {label}
    </button>
  );

  const DemoCalculatorAnimation = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setStep((prev) => (prev + 1) % 6); // Cycle through 6 steps
      }, 1500);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="relative w-full max-w-md mx-auto perspective-1000">
        <div className="relative bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-500 hover:rotate-0">
          <div className="bg-zinc-900/50 p-4 border-b border-dark-border flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-2 w-20 bg-zinc-800 rounded"></div>
              <div className={`h-12 w-full rounded border border-dark-border flex items-center px-4 transition-colors duration-300 ${step >= 1 ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-dark-bg text-zinc-600'}`}>
                <span className="text-sm">{step >= 1 ? 'Chuveiro Elétrico' : 'Selecione...'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-2 w-12 bg-zinc-800 rounded"></div>
                <div className={`h-12 w-full rounded border border-dark-border flex items-center px-4 transition-colors duration-300 ${step >= 2 ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-dark-bg'}`}>
                  <span className="text-sm">{step >= 2 ? '5500 W' : ''}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-12 bg-zinc-800 rounded"></div>
                <div className={`h-12 w-full rounded border border-dark-border flex items-center px-4 transition-colors duration-300 ${step >= 2 ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-dark-bg'}`}>
                  <span className="text-sm">{step >= 2 ? '220V' : '127V'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-16 bg-zinc-800 rounded"></div>
              <div className={`h-12 w-full rounded border border-dark-border flex items-center px-4 transition-colors duration-300 ${step >= 3 ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-dark-bg'}`}>
                <span className="text-sm">{step >= 3 ? '20 Metros' : ''}</span>
              </div>
            </div>

            <div className={`h-12 w-full rounded flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 4 ? 'bg-white scale-95' : 'bg-electric-yellow'} text-black shadow-lg relative`}>
              Calcular
              {step === 4 && (
                <MousePointer2 className="absolute -bottom-3 -right-3 w-6 h-6 text-white fill-black animate-bounce" />
              )}
            </div>

            <div className={`absolute inset-0 bg-dark-surface/95 backdrop-blur-sm flex items-center justify-center transition-opacity duration-500 ${step >= 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="w-3/4 bg-dark-bg border border-electric-yellow/50 rounded-lg p-6 shadow-2xl transform transition-all duration-500 translate-y-0">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <CheckCircle2 className="w-5 h-5 text-electric-yellow" />
                  <span className="text-sm font-bold text-white">Resultado</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-900 rounded p-3 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">CABO</div>
                    <div className="text-2xl font-bold text-blue-400">4mm²</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-3 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">DISJUNTOR</div>
                    <div className="text-2xl font-bold text-white">25A</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-electric-yellow/10 blur-[60px] rounded-full -z-10"></div>
      </div>
    );
  };

  const DemoQDCAnimation = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setStep((prev) => (prev + 1) % 6);
      }, 1500);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="relative w-full max-w-md mx-auto perspective-1000">
        <div className="relative bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden transform rotate-y-[5deg] rotate-x-[5deg] transition-transform duration-500 hover:rotate-0">
          <div className="bg-zinc-900/50 p-4 border-b border-dark-border flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            </div>
            <div className="h-1.5 w-16 bg-zinc-800 rounded-full"></div>
          </div>

          <div className="p-6 space-y-4">
            {/* Input Phase */}
            <div className={`space-y-3 transition-opacity duration-300 ${step >= 4 ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
              <div className="flex justify-between items-center text-xs text-zinc-500 uppercase font-bold">
                <span>Cargas</span>
                <span className="text-electric-yellow flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</span>
              </div>

              {/* Circuit 1 */}
              <div className={`bg-dark-bg border border-zinc-800 p-3 rounded-lg flex items-center justify-between transition-all duration-500 ${step >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-electric-yellow text-black text-[10px] font-bold flex items-center justify-center">1</div>
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-zinc-700 rounded"></div>
                    <div className="h-1.5 w-10 bg-zinc-800 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-12 bg-zinc-800 rounded border border-zinc-700"></div>
              </div>

              {/* Circuit 2 */}
              <div className={`bg-dark-bg border border-zinc-800 p-3 rounded-lg flex items-center justify-between transition-all duration-500 ${step >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-zinc-700 text-black text-[10px] font-bold flex items-center justify-center">2</div>
                  <div className="space-y-1">
                    <div className="h-2 w-20 bg-zinc-700 rounded"></div>
                    <div className="h-1.5 w-8 bg-zinc-800 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-12 bg-zinc-800 rounded border border-zinc-700"></div>
              </div>
            </div>

            <div className={`h-10 w-full rounded flex items-center justify-center font-bold text-xs transition-all duration-300 ${step === 3 ? 'bg-white text-black scale-95' : 'bg-electric-yellow text-black'} shadow-lg relative`}>
              <List className="w-3 h-3 mr-2" /> Gerar Lista
              {step === 3 && (
                <MousePointer2 className="absolute -bottom-3 -right-3 w-6 h-6 text-white fill-black animate-bounce" />
              )}
            </div>

            {/* Results Phase */}
            <div className={`absolute inset-0 top-14 bg-dark-surface p-6 flex flex-col transition-all duration-500 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <div className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Lista de Materiais
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
                  <span>Disjuntor Geral</span>
                  <span className="text-white font-mono">50A</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
                  <span>IDR Tetrapolar</span>
                  <span className="text-white font-mono">63A</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
                  <span>Cabos 4mm²</span>
                  <span className="text-white font-mono">35m</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
                  <span>Cabos 2.5mm²</span>
                  <span className="text-white font-mono">120m</span>
                </div>
              </div>
              <div className="mt-auto bg-green-500/10 border border-green-500/20 rounded p-2 text-center text-[10px] text-green-400">
                Projeto NBR 5410 Gerado!
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[60px] rounded-full -z-10"></div>
      </div>
    );
  };

  const LatestArticlesSection = () => (
    <div className="py-20 px-6 bg-dark-bg border-t border-dark-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Últimos Artigos</h2>
            <p className="text-text-secondary text-sm">Aplicação prática, resultados reais!</p>
          </div>
          <button
            onClick={() => {
              navigate('/blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-sm text-electric-yellow hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => openBlogPost(post.id)}
              className="group bg-dark-surface border border-dark-border rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700 hover:shadow-xl transition-all flex flex-col h-full"
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-60"></div>
                <span className="absolute bottom-3 left-3 bg-electric-yellow text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {post.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.display_date}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-yellow transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-xs font-medium text-electric-yellow gap-1 mt-auto">
                  Ler artigo <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const HowToSection = () => (
    <div className="py-20 px-6 border-t border-zinc-200 bg-ice-white">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-stretch">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-zinc-900 mb-6 text-center lg:text-left">
            Calculadora Elétrica <span className="text-yellow-600">Inteligente</span> e Segura
          </h2>

          <p className="text-zinc-600 leading-relaxed mb-8 text-lg text-center lg:text-left">
            Em dúvida sobre qual <strong className="text-zinc-900">bitola de fio</strong>, <strong className="text-zinc-900">disjuntor</strong> ou materiais elétricos utilizar?
            Com a Calculadora Elétrica da Instalação Segura, o dimensionamento elétrico ficou fácil.
            Insira os dados do seu equipamento e rapidamente obtenha a indicação correta dos materiais para utilizar,
            evitando riscos de incêndio e desperdício de energia.
          </p>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-[1px] bg-yellow-500"></span>
              Como usar a ferramenta
            </h3>

            <ul className="space-y-4">
              {[
                {
                  title: "Informe o Equipamento",
                  desc: "Selecione na lista (ex: Chuveiro, Ar Condicionado) ou digite um nome personalizado."
                },
                {
                  title: "Preencha a Potência e Tensão",
                  desc: "Insira a potência em Watts (W) e a voltagem (127V ou 220V) do aparelho."
                },
                {
                  title: "Defina a Distância",
                  desc: "Coloque a distância aproximada em metros entre o quadro de energia e o aparelho. Isso é crucial para calcular a queda de tensão."
                },
                {
                  title: "Receba o Resultado Completo",
                  desc: "Nosso sistema calcula automaticamente a bitola do fio, o disjuntor correto, a queda de tensão e lista os materiais necessários."
                }
              ].map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-electric-yellow font-bold text-sm shadow-md">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-zinc-900 font-medium text-sm">{step.title}</h4>
                    <p className="text-zinc-600 text-sm leading-snug mt-1">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col justify-between items-center h-full">
          <div className="w-full">
            <DemoCalculatorAnimation />
          </div>

          <div className="pt-8 w-full flex justify-center pb-2 max-w-md mx-auto">
            <button
              onClick={() => navigate('/calculator')}
              className="inline-flex items-center gap-2 bg-electric-yellow text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 w-full justify-center"
            >
              <CalcIcon className="w-4 h-4" />
              Começar a Calcular Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HowToQDCSection = () => (
    <div className="py-20 px-6 border-t border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Animation on Left */}
        <div className="relative flex flex-col justify-between items-center h-full order-2 lg:order-1">
          <div className="w-full">
            <DemoQDCAnimation />
          </div>

          <div className="pt-8 w-full flex justify-center pb-2 max-w-md mx-auto">
            <button
              onClick={() => navigate('/diagram-generator')}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors shadow-lg shadow-zinc-500/20 w-full justify-center"
            >
              <FileSpreadsheet className="w-4 h-4 text-electric-yellow" />
              Criar Meu Projeto QDC
            </button>
          </div>
        </div>

        {/* Text on Right */}
        <div className="flex flex-col order-1 lg:order-2">
          <h2 className="text-3xl font-bold text-zinc-900 mb-6 text-center lg:text-left">
            Dimensionador QDC <span className="text-yellow-600">Completo</span> e Automático
          </h2>

          <p className="text-zinc-600 leading-relaxed mb-8 text-lg text-center lg:text-left">
            Vai reformar ou construir? O <strong className="text-zinc-900">Dimensionador QDC</strong> gera a lista completa de materiais para o seu Quadro de Distribuição.
            Adicione todos os circuitos da casa e o sistema calcula automaticamente o Disjuntor Geral, IDR, DPS e balanceia as fases, entregando um relatório pronto para compra.
          </p>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-8 h-[1px] bg-yellow-500"></span>
              Passo a Passo Simplificado
            </h3>

            <ul className="space-y-4">
              {[
                {
                  title: "Adicione os Circuitos",
                  desc: "Liste todos os pontos da casa (ex: Chuveiro, Iluminação Cozinha, Tomadas Sala)."
                },
                {
                  title: "Identificação Automática",
                  desc: "O sistema detecta se é Iluminação (cabo 1.5mm²) ou Força (cabo 2.5mm²+) automaticamente."
                },
                {
                  title: "Gere a Lista",
                  desc: "Ao clicar em dimensionar, o algoritmo aplica a NBR 5410 para definir as proteções gerais e individuais."
                },
                {
                  title: "Baixe o Relatório",
                  desc: "Exporte uma imagem detalhada com o resumo de cabos (metros) e disjuntores para levar à loja."
                }
              ].map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-yellow-600 font-bold text-sm shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-zinc-900 font-medium text-sm">{step.title}</h4>
                    <p className="text-zinc-600 text-sm leading-snug mt-1">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const Hero = () => (
    <div className="relative pt-32 pb-20 px-6 animate-fade-in overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-dark-border text-xs font-medium text-electric-yellow mb-8">
          <span className="w-2 h-2 rounded-full bg-electric-yellow animate-pulse"></span>
          Conformidade NBR 5410
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-400 to-white bg-[length:200%_auto] animate-shimmer">
            Dimensionamento elétrico
          </span>
          <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-500 bg-[length:200%_auto] animate-shimmer">
            preciso e acessível.
          </span>
        </h1>

        <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Conjunto de ferramentas para <strong className="font-bold text-text-primary">Dimensionamento</strong> de <strong className="font-bold text-text-primary">Disjuntores</strong>, <strong className="font-bold text-text-primary">Condutores</strong> e <strong className="font-bold text-text-primary">Projetos Elétricos Profissionais</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/calculator')}
            className="group bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            <CalcIcon className="w-4 h-4" />
            Abrir Calculadora
          </button>

          <button
            onClick={() => navigate('/diagram-generator')}
            className="group text-text-secondary hover:text-white font-medium px-6 py-3 flex items-center gap-2 transition-colors"
          >
            Dimensionador QDC <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-dark-bg selection:bg-electric-yellow selection:text-black">
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0"></div>

      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-dark-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex justify-between items-center">
          {/* ... header content ... */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="w-8 h-8 rounded-md shadow-[0_0_15px_rgba(250,204,21,0.3)] overflow-hidden shrink-0">
              <svg viewBox="0 0 512 512" className="w-full h-full">
                <rect width="512" height="512" fill="#FACC15" />
                <path d="M256 80L410 140V240C410 350 340 440 256 470C172 440 102 350 102 240V140L256 80Z" fill="none" stroke="black" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M300 150L190 290H270L240 420L350 240H270L300 150Z" fill="black" />
              </svg>
            </div>

            <div className="flex flex-col justify-center">
              <span className="font-display font-bold text-[14px] tracking-wider leading-none">
                <span className="text-white">INSTALAÇÃO</span><span className="text-electric-yellow">SEGURA</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-8">
              <NavItem target="/" label="Início" />

              {/* Ferramentas Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`text-base font-medium transition-colors flex items-center gap-1 ${['/calculator', '/diagram-generator', '/download-app'].some(path => location.pathname.startsWith(path)) ? 'text-electric-yellow' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Ferramentas <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-dark-surface border border-dark-border rounded-xl shadow-2xl py-2 animate-fade-in overflow-hidden">
                    <button onClick={() => { navigate('/calculator'); setToolsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 flex items-center gap-3">
                      <CalcIcon className="w-4 h-4 text-electric-yellow" /> Calculadora
                    </button>
                    <button onClick={() => { navigate('/diagram-generator'); setToolsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 flex items-center gap-3">
                      <FileSpreadsheet className="w-4 h-4 text-electric-yellow" /> Dimensionador QDC
                    </button>
                    <div className="h-[1px] bg-dark-border my-1 mx-2"></div>
                    <button onClick={() => { navigate('/download-app'); setToolsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-electric-yellow" /> Baixar App Android
                    </button>
                  </div>
                )}
              </div>

              <NavItem target="/blog" label="Artigos" />
              <NavItem target="/who-we-are" label="Quem Somos" />
              <NavItem target="/contact" label="Contato" />
            </nav>

            {/* Instagram Icon */}
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hidden lg:block text-text-secondary hover:text-electric-yellow transition-colors">
              <Instagram className="w-5 h-5" />
            </a>

            <button className="lg:hidden text-text-secondary hover:text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-dark-bg border-b border-dark-border p-6 space-y-6 absolute w-full shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in z-[60]">
            <div className="flex flex-col gap-6">
              <NavItem target="/" label="Início" className="text-lg" />

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                  className={`text-lg font-medium transition-colors flex items-center justify-between ${['/calculator', '/diagram-generator', '/download-app'].some(path => location.pathname.startsWith(path)) ? 'text-electric-yellow' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Ferramentas <ChevronDown className={`w-5 h-5 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileToolsOpen && (
                  <div className="pl-4 border-l-2 border-electric-yellow/30 flex flex-col gap-5 py-2 animate-fade-in">
                    <button
                      onClick={() => { navigate('/calculator'); setMobileMenuOpen(false); }}
                      className="text-white text-base font-medium flex items-center gap-3"
                    >
                      <CalcIcon className="w-5 h-5 text-electric-yellow" /> Calculadora
                    </button>
                    <button
                      onClick={() => { navigate('/diagram-generator'); setMobileMenuOpen(false); }}
                      className="text-white text-base font-medium flex items-center gap-3"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-electric-yellow" /> Dimensionador QDC
                    </button>
                    <button
                      onClick={() => { navigate('/download-app'); setMobileMenuOpen(false); }}
                      className="text-white text-base font-medium flex items-center gap-3"
                    >
                      <Smartphone className="w-5 h-5 text-electric-yellow" /> Baixar App Android
                    </button>
                  </div>
                )}
              </div>

              <NavItem target="/blog" label="Artigos" className="text-lg" />
              <NavItem target="/who-we-are" label="Quem Somos" className="text-lg" />
              <NavItem target="/contact" label="Contato" className="text-lg" />
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-16 relative z-10">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <HowToSection />
              <HowToQDCSection />
              <LatestArticlesSection />
            </>
          } />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/diagram-generator" element={<DiagramGenerator />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/who-we-are" element={<WhoWeAre />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/download-app" element={
            <div className="max-w-4xl mx-auto p-12 text-center flex flex-col items-center justify-center animate-fade-in min-h-[60vh]">
              <Smartphone className="w-20 h-20 text-electric-yellow mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Instalação Segura Mobile</h2>
              <p className="text-text-secondary mb-8 max-w-md">Em breve, nossa Calculadora e Dimensionador juntamente com outras ferramentas profissionais estarão disponíveis nativamente na versão Android.</p>
              <button className="bg-white text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-zinc-200 transition-all opacity-50 cursor-not-allowed">
                <Download className="w-5 h-5" /> Google Play (Em breve)
              </button>
            </div>
          } />
          <Route path="/privacy-policy" element={<PrivacyPolicy onBack={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />} />
        </Routes>
      </main>

      <Footer />
      <Analytics />
    </div>
  );
};

export default App;
