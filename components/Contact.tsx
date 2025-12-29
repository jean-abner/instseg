
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, MapPin, Instagram, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../lib/supabaseClient';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSubjectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject) {
      alert("Por favor, selecione um assunto.");
      return;
    }

    setStatus('sending');

    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'new'
        }
      ]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reseta o status após 5 segundos para permitir novo envio
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
      setStatus('idle');
    }
  };

  const subjectOptions = [
    "Dúvida Técnica sobre Calculadoras",
    "Sugestão de Melhoria",
    "Reportar Erro no Site",
    "Comercial / Parceria",
    "Outros Assuntos"
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in min-h-screen pb-20">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Fale Conosco</h2>
        <p className="text-text-secondary text-sm">
          Tem alguma dúvida, sugestão ou encontrou um erro? Entre em contato com nossa equipe técnica.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Coluna de Informações (Esquerda) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-yellow/5 rounded-bl-full transition-transform group-hover:scale-110"></div>

            <h3 className="text-xl font-bold text-white mb-6">Canais de Atendimento</h3>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-electric-yellow shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">E-mail</p>
                  <p className="text-white font-medium">contato@instalacaosegura.com.br</p>
                  <p className="text-xs text-zinc-500 mt-1">Resposta em até 24h úteis.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-electric-yellow shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Instagram</p>
                  <p className="text-white font-medium">Instalação Segura</p>
                  <p className="text-xs text-zinc-500 mt-1">Siga nosso perfil.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-electric-yellow shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Localização</p>
                  <p className="text-white font-medium">São Paulo, SP</p>
                  <p className="text-xs text-zinc-500 mt-1">Atendimento exclusivamente online.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-electric-yellow/10 border border-electric-yellow/20 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-electric-yellow shrink-0" />
              <p className="text-sm text-yellow-100/80 leading-relaxed">
                <strong>Nota:</strong> Para dúvidas técnicas específicas sobre seu projeto, recomendamos utilizar nossas calculadoras antes de enviar uma mensagem.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna do Formulário (Direita) */}
        <div className="lg:col-span-7">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl">
            {status === 'success' ? (
              <div className="py-20 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-8">
                  Obrigado por entrar em contato. Recebemos sua mensagem e nossa equipe retornará para o e-mail <strong>{formData.email}</strong> o mais breve possível.
                </p>
                <Button onClick={() => setStatus('idle')} variant="outline">
                  Enviar nova mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Seu Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-white focus:border-electric-yellow focus:outline-none transition-colors placeholder-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Seu E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ex: joao@email.com"
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-white focus:border-electric-yellow focus:outline-none transition-colors placeholder-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label htmlFor="subject" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Assunto <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setSubjectOpen(!subjectOpen)}
                    className={`w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-left flex justify-between items-center transition-colors ${subjectOpen ? 'border-electric-yellow' : 'focus:border-electric-yellow'}`}
                  >
                    <span className={formData.subject ? "text-white" : "text-zinc-500"}>
                      {formData.subject || "Selecione um motivo..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${subjectOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {subjectOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-dark-bg border border-dark-border rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in">
                      {subjectOptions.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, subject: option }));
                            setSubjectOpen(false);
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer transition-colors ${formData.subject === option
                            ? 'bg-zinc-800 text-electric-yellow'
                            : 'text-white hover:bg-zinc-200 hover:text-black'
                            }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Mensagem <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escreva sua mensagem aqui com o máximo de detalhes possível..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-sm text-white focus:border-electric-yellow focus:outline-none transition-colors placeholder-zinc-700 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    className="h-12 font-bold shadow-lg shadow-yellow-500/20"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Enviar Mensagem
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
