
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, X, Trash2, List, PenLine, CheckCircle2, Calculator as CalcIcon, AlertTriangle, Download, Zap, Image as ImageIcon, Lightbulb, Plug, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { CircuitInput } from '../types';

export const DiagramGenerator: React.FC = () => {
  const MAX_CIRCUITS = 12; // Aumentado levemente para flexibilidade

  // Estados iniciais
  const [projectName, setProjectName] = useState('');
  const [circuits, setCircuits] = useState<CircuitInput[]>([
    { id: '1', name: '', power: 0, unit: 'W', voltage: 220, type: 'outlet', distance: 0, distanceUnknown: false }
  ]);
  
  const [mainSpecs, setMainSpecs] = useState<{ breaker: number, idr: number, dps: number } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  // Estado para controlar qual dropdown de voltagem está aberto
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica Principal de Dimensionamento
  const calculateCircuitData = (c: CircuitInput) => {
    // 1. Detectar Tipo pelo Nome (Regra da Iluminação)
    const nameLower = c.name.toLowerCase();
    const isLighting = nameLower.includes('ilumina') || nameLower.includes('luz') || nameLower.includes('lampada') || nameLower.includes('lâmpada') || nameLower.includes('led');
    
    // 2. Calcular Corrente de Projeto (IB)
    const current = c.power / c.voltage;
    
    // 3. Definir Seção Mínima (NBR 5410)
    let cable = isLighting ? 1.5 : 2.5;

    // 4. Ajustar Cabo pela Capacidade de Corrente (Método B1 - Eletroduto Embutido, 2 condutores carregados)
    // Valores aproximados de Iz (Capacidade de condução):
    // 1.5mm²: ~17.5A
    // 2.5mm²: ~24A
    // 4.0mm²: ~32A
    // 6.0mm²: ~41A
    // 10mm²: ~57A
    // 16mm²: ~76A
    
    // Primeiro ajuste baseado puramente na corrente de carga
    if (current > 15.0 && cable < 2.5) cable = 2.5;
    if (current > 21.0 && cable < 4.0) cable = 4.0;
    if (current > 28.0 && cable < 6.0) cable = 6.0;
    if (current > 36.0 && cable < 10.0) cable = 10.0;
    if (current > 50.0 && cable < 16.0) cable = 16.0;
    if (current > 68.0 && cable < 25.0) cable = 25.0;
    
    // 5. Selecionar Disjuntor (In >= IB)
    const standardBreakers = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80];
    let breaker = standardBreakers.find(b => b >= current) || 10;
    
    // 6. Coordenação Disjuntor x Cabo (In <= Iz)
    // O disjuntor deve proteger o cabo. Se o disjuntor for maior que a capacidade do cabo, aumentamos o cabo.
    const cableCapacity: Record<number, number> = { 
        1.5: 17.5, 2.5: 24, 4.0: 32, 6.0: 41, 10.0: 57, 16.0: 76, 25.0: 101 
    };
    
    // Loop de verificação: Se a capacidade do cabo atual for menor que o disjuntor escolhido, sobe a bitola
    const availableCables = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0];
    
    while (cableCapacity[cable] < breaker) {
         const idx = availableCables.indexOf(cable);
         if (idx < availableCables.length - 1) {
             cable = availableCables[idx + 1];
         } else {
             break; // Limite máximo atingido
         }
    }

    return { cable, breaker, current, isLighting };
  };

  const materials = useMemo(() => {
    if (!showResults || !mainSpecs) return null;
    
    const cableSummary = {
      phases: {} as Record<number, number>,
      neutrals: {} as Record<number, number>,
      grounds: {} as Record<number, number>
    };

    const individualCalculations = circuits
      .filter(c => c.power > 0)
      .map(c => {
        const calc = calculateCircuitData(c);
        const { cable } = calc;
        let numFases = c.voltage === 220 ? 2 : (c.voltage === 380 ? 3 : 1);
        let hasNeutral = c.voltage === 127 || c.voltage === 380;
        const dist = c.distanceUnknown ? 10 : c.distance;
        
        cableSummary.phases[cable] = (cableSummary.phases[cable] || 0) + (dist * numFases);
        if (hasNeutral) {
          cableSummary.neutrals[cable] = (cableSummary.neutrals[cable] || 0) + dist;
        }
        cableSummary.grounds[cable] = (cableSummary.grounds[cable] || 0) + dist;

        return {
          id: c.id,
          name: c.name || 'Circuito sem nome',
          power: c.power,
          voltage: c.voltage,
          unit: c.unit,
          ...calc
        };
      });

    return {
        individualCalculations,
        breakers: individualCalculations.map(c => ({ 
          name: `Disjuntor DIN ${c.breaker}A`, 
          qty: 1 
        })),
        detailedCables: {
          phases: Object.entries(cableSummary.phases).map(([mm, len]) => ({ mm, len: Math.ceil(len * 1.1) })),
          neutrals: Object.entries(cableSummary.neutrals).map(([mm, len]) => ({ mm, len: Math.ceil(len * 1.1) })),
          grounds: Object.entries(cableSummary.grounds).map(([mm, len]) => ({ mm, len: Math.ceil(len * 1.1) }))
        },
        general: [
            { name: `Disjuntor Geral DIN ${mainSpecs.breaker}A`, qty: 1 },
            { name: `IDR Geral ${mainSpecs.idr}A`, qty: 1 },
            { name: `Módulo DPS 45kA`, qty: 4 }
        ]
    };
  }, [circuits, mainSpecs, showResults]);

  const handleGenerateList = () => {
    const newErrors: Record<string, string[]> = {};
    let hasError = false;

    circuits.forEach(c => {
      const fieldErrors = [];
      if (!c.name.trim()) fieldErrors.push('name');
      if (c.power <= 0) fieldErrors.push('power');
      if (!c.distanceUnknown && c.distance <= 0) fieldErrors.push('distance');
      
      if (fieldErrors.length > 0) {
        newErrors[c.id] = fieldErrors;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      setShowWarningModal(true);
      return;
    }

    const totalPower = circuits.reduce((sum, c) => sum + c.power, 0);
    // Estimativa grosseira para Geral: Fator de demanda 0.85
    const estimatedCurrent = (totalPower / 220) * 0.85; 
    const mainBreaker = [40, 50, 63, 70, 80, 100].find(b => b >= estimatedCurrent) || 40;
    const idr = [40, 63, 80, 100].find(v => v >= mainBreaker) || 40;

    setMainSpecs({ breaker: mainBreaker, idr, dps: 45 });
    setShowResults(true);

    setTimeout(() => {
        const el = document.getElementById('report-view');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDownloadImage = async () => {
    if (!materials) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    // Fundo Branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Grid pattern sutil (cinza claro)
    ctx.strokeStyle = '#f1f1f1';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for(let j=0; j<height; j+=40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke(); }

    // Header (Amarelo)
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(0, 0, width, 140);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillText('INSTALAÇÃO SEGURA', 40, 60);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('RELATÓRIO TÉCNICO DE DIMENSIONAMENTO QDC', 40, 90);
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`PROJETO: ${projectName.toUpperCase() || 'RESIDENCIAL'}`, 40, 115);

    let y = 190;

    // Seção de Cargas
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('1. DIMENSIONAMENTO POR CIRCUITO', 40, y);
    y += 40;

    materials.individualCalculations.forEach((c, idx) => {
      ctx.fillStyle = '#f8f8f8';
      ctx.beginPath();
      // @ts-ignore
      if (ctx.roundRect) ctx.roundRect(40, y, 720, 55, 8); else ctx.rect(40, y, 720, 55);
      ctx.fill();
      ctx.strokeStyle = '#e5e5e5';
      ctx.stroke();
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`${idx + 1}. ${c.name}`, 55, y + 33);
      
      ctx.fillStyle = '#666666';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`Potência: ${Math.round(c.unit === 'BTU' ? c.power / 0.293 : c.power)}${c.unit}`, 250, y + 33);
      ctx.fillText(`Corrente: ${c.current.toFixed(2)}A`, 380, y + 33);
      
      ctx.fillStyle = '#d97706';
      ctx.fillText(`Disjuntor: ${c.breaker}A`, 520, y + 33);
      ctx.fillStyle = '#2563eb';
      ctx.fillText(`Cabo: ${c.cable}mm²`, 640, y + 33);
      
      y += 65;
    });

    y += 30;

    // Seção de Materiais Consolidada
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('2. LISTA CONSOLIDADA DE MATERIAIS', 40, y);
    y += 40;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // @ts-ignore
    if (ctx.roundRect) ctx.roundRect(40, y, 720, 480, 12); else ctx.rect(40, y, 720, 480);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    const startY = y + 40;
    
    // Coluna 1: Proteção
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('PROTEÇÃO DO QUADRO', 70, startY);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#000000';
    let devY = startY + 30;
    materials.general.forEach(m => {
        ctx.fillText(`• ${m.name}`, 70, devY);
        ctx.fillText(`x${m.qty}`, 330, devY);
        devY += 28;
    });
    materials.breakers.forEach(m => {
        ctx.fillText(`• ${m.name}`, 70, devY);
        ctx.fillText(`x${m.qty}`, 330, devY);
        devY += 28;
    });

    // Coluna 2: Condutores
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('CONDUTORES (METRAGEM TOTAL)', 420, startY);
    let cableY = startY + 30;
    ctx.font = '14px Inter, sans-serif';
    
    // Fases
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Fases (Cobre):', 420, cableY);
    cableY += 25;
    ctx.fillStyle = '#000000';
    materials.detailedCables.phases.forEach(c => {
        ctx.fillText(`Cabo Flexível ${c.mm}mm²`, 435, cableY);
        ctx.fillText(`${c.len}m`, 650, cableY);
        cableY += 22;
    });

    // Neutros e Terra abaixo
    cableY += 20;
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Neutros (Cobre):', 420, cableY);
    cableY += 25;
    ctx.fillStyle = '#000000';
    if(materials.detailedCables.neutrals.length > 0) {
        materials.detailedCables.neutrals.forEach(c => {
            ctx.fillText(`Cabo Flexível ${c.mm}mm²`, 435, cableY);
            ctx.fillText(`${c.len}m`, 650, cableY);
            cableY += 22;
        });
    } else { ctx.fillText('N/A', 435, cableY); cableY += 22; }

    cableY += 20;
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Terra (Cobre):', 420, cableY);
    cableY += 25;
    ctx.fillStyle = '#000000';
    materials.detailedCables.grounds.forEach(c => {
        ctx.fillText(`Cabo Flexível ${c.mm}mm²`, 435, cableY);
        ctx.fillText(`${c.len}m`, 650, cableY);
        cableY += 22;
    });

    // Marca d'água Diagonal
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.translate(width/2, height/2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText('INSTALAÇÃO SEGURA', 0, -40);
    ctx.font = '30px Inter, sans-serif';
    ctx.fillText('Gerado por Instalação Segura', 0, 20);
    ctx.restore();

    // Footer bottom
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(0, height - 60, width, 60);
    ctx.fillStyle = '#71717a';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Dimensionamento automático baseado na NBR 5410. Margem de segurança de 10% inclusa.', 40, height - 25);

    // Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Relatorio_QDC_${projectName.replace(/\s+/g, '_') || 'Projeto'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const addCircuit = () => {
    if (circuits.length >= MAX_CIRCUITS) return;
    const newId = Date.now().toString();
    setCircuits([...circuits, { id: newId, name: '', power: 0, unit: 'W', voltage: 220, type: 'outlet', distance: 0, distanceUnknown: false }]);
    setShowResults(false);
  };

  const updateCircuit = (id: string, field: keyof CircuitInput, value: any) => {
    setCircuits(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newCircuit = { ...c };
      if (field === 'unit') {
        newCircuit.unit = value;
      } else if (field === 'power') {
        const numVal = Number(value);
        newCircuit.power = newCircuit.unit === 'BTU' ? numVal * 0.293 : numVal;
      } else {
        (newCircuit as any)[field] = value;
      }
      return newCircuit;
    }));
    if (errors[id]?.includes(field as string)) {
      setErrors(prev => ({
        ...prev,
        [id]: prev[id].filter(f => f !== field)
      }));
    }
    setShowResults(false);
  };

  const hasFieldError = (id: string, field: string) => errors[id]?.includes(field);

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in flex flex-col min-h-screen">
       <style>{`
         @keyframes pulse-red-highlight {
           0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); background-color: rgba(239, 68, 68, 0.1); }
           50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); background-color: rgba(239, 68, 68, 0.2); }
           100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); background-color: rgba(239, 68, 68, 0.1); }
         }
         .error-pulse {
           animation: pulse-red-highlight 2s infinite;
           border-color: #ef4444 !important;
         }
       `}</style>

       {/* Modal de Aviso */}
       {showWarningModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-surface border border-electric-yellow/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-electric-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-electric-yellow" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dados Incompletos</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                Por favor, preencha todos os campos destacados em vermelho para prosseguir.
              </p>
              <Button onClick={() => setShowWarningModal(false)} fullWidth className="h-12">
                Entendido
              </Button>
           </div>
         </div>
       )}

       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Dimensionador QDC
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Geração de lista técnica de materiais conforme NBR 5410.
          </p>
        </div>
        
        {/* Botão de Download (Topo-Direita) */}
        <div className="flex gap-2 w-full md:w-auto">
           {showResults && (
             <Button onClick={handleDownloadImage} variant="primary" className="px-4 h-11 text-xs">
                <ImageIcon className="w-4 h-4" /> Baixar Relatório
             </Button>
           )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Painel de Entrada */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-5 shadow-xl">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
               <PenLine className="w-3 h-3 text-electric-yellow" /> Título do Projeto
            </label>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-electric-yellow focus:outline-none transition-all"
              placeholder="Ex: Reforma Cozinha"
            />
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-dark-border bg-dark-bg/50 flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cargas ({circuits.length}/{MAX_CIRCUITS})</h3>
              <button onClick={addCircuit} disabled={circuits.length >= MAX_CIRCUITS} className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 uppercase transition-colors disabled:opacity-30">
                <Plus className="w-3 h-3" /> Adicionar Carga
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[450px] custom-scrollbar" ref={dropdownRef}>
              {circuits.map((circuit, index) => {
                 // Detector Visual de Tipo
                 const nameLower = circuit.name.toLowerCase();
                 const isLighting = nameLower.includes('ilumina') || nameLower.includes('luz') || nameLower.includes('lampada') || nameLower.includes('lâmpada') || nameLower.includes('led');
                 
                 return (
                  <div key={circuit.id} className="bg-dark-bg p-4 rounded-xl border border-dark-border hover:border-zinc-500 transition-all group relative">
                    {/* Badge de Tipo */}
                    <div className={`absolute top-2 right-2 flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded border ${isLighting ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                        {isLighting ? <Lightbulb className="w-2.5 h-2.5" /> : <Plug className="w-2.5 h-2.5" />}
                        {isLighting ? 'ILUMINAÇÃO (1.5mm²)' : 'FORÇA (2.5mm²)'}
                    </div>

                    <div className="flex justify-between items-center mb-3 mt-3">
                      <div className="flex items-center gap-2 w-full pr-8">
                        <span className="text-[10px] font-black text-black bg-electric-yellow w-5 h-5 rounded flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={circuit.name}
                          onChange={(e) => updateCircuit(circuit.id, 'name', e.target.value)}
                          className={`w-full bg-zinc-900/50 text-xs p-2 rounded border border-dark-border text-white outline-none focus:border-electric-yellow transition-all placeholder-zinc-700 ${hasFieldError(circuit.id, 'name') ? 'error-pulse' : ''}`}
                          placeholder="Nome do Equipamento"
                        />
                      </div>
                      {circuits.length > 1 && (
                        <button onClick={() => setCircuits(circuits.filter(c => c.id !== circuit.id))} className="text-zinc-600 hover:text-red-500 transition-colors absolute top-2 right-2 hidden group-hover:block bg-dark-bg border border-zinc-700 p-1 rounded">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="text-[9px] text-zinc-600 font-bold uppercase">Potência</label>
                          <div className="flex gap-1">
                            <button onClick={() => updateCircuit(circuit.id, 'unit', 'W')} className={`text-[8px] font-bold px-1 rounded ${circuit.unit === 'W' ? 'bg-electric-yellow text-black' : 'text-zinc-600'}`}>W</button>
                            <button onClick={() => updateCircuit(circuit.id, 'unit', 'BTU')} className={`text-[8px] font-bold px-1 rounded ${circuit.unit === 'BTU' ? 'bg-electric-yellow text-black' : 'text-zinc-600'}`}>BTU</button>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={circuit.power === 0 ? '' : (circuit.unit === 'BTU' ? Math.round(circuit.power / 0.293) : circuit.power)}
                          onChange={(e) => updateCircuit(circuit.id, 'power', e.target.value)}
                          className={`w-full bg-zinc-900/50 text-xs p-2 rounded border border-dark-border text-white outline-none focus:border-electric-yellow ${hasFieldError(circuit.id, 'power') ? 'error-pulse' : ''}`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] text-zinc-600 font-bold uppercase">Distância (m)</label>
                          <label className="flex items-center gap-1 cursor-pointer">
                             <input type="checkbox" checked={circuit.distanceUnknown} onChange={(e) => updateCircuit(circuit.id, 'distanceUnknown', e.target.checked)} className="accent-electric-yellow w-3 h-3 cursor-pointer" />
                             <span className="text-[8px] font-bold text-zinc-600">N/A</span>
                          </label>
                        </div>
                        <input
                          type="number"
                          value={circuit.distance === 0 ? '' : circuit.distance}
                          disabled={circuit.distanceUnknown}
                          onChange={(e) => updateCircuit(circuit.id, 'distance', Number(e.target.value))}
                          className={`w-full bg-zinc-900/50 text-xs p-2 rounded border border-dark-border text-white outline-none focus:border-electric-yellow ${!circuit.distanceUnknown && hasFieldError(circuit.id, 'distance') ? 'error-pulse' : ''} ${circuit.distanceUnknown ? 'opacity-20' : ''}`}
                          placeholder={circuit.distanceUnknown ? "--" : "0"}
                        />
                      </div>
                    </div>

                    {/* Custom Select for Voltage - Substitui o <select> nativo para controlar a cor do hover */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === circuit.id ? null : circuit.id)}
                        className="w-full bg-zinc-900 text-xs p-2 rounded border border-dark-border text-white flex justify-between items-center focus:border-electric-yellow transition-colors hover:border-zinc-500"
                      >
                        <span className="font-bold">{circuit.voltage}V</span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${openDropdownId === circuit.id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openDropdownId === circuit.id && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-xl z-50 overflow-hidden animate-fade-in">
                          {[127, 220, 380].map((v) => (
                            <div
                              key={v}
                              onClick={() => {
                                updateCircuit(circuit.id, 'voltage', v);
                                setOpenDropdownId(null);
                              }}
                              className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors hover:bg-zinc-200 hover:text-black ${
                                circuit.voltage === v 
                                  ? 'text-electric-yellow' // Destaque visual apenas no texto para indicar seleção
                                  : 'text-zinc-300' 
                              }`}
                            >
                              {v}V
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                 );
              })}
            </div>

            {/* Botões de Ação (Abaixo das Cargas) */}
            <div className="p-4 bg-dark-bg/80 border-t border-dark-border space-y-3">
              <Button onClick={handleGenerateList} fullWidth className="h-11 shadow-lg shadow-yellow-500/20 font-bold">
                 <CalcIcon className="w-4 h-4" /> Dimensionar QDC
              </Button>
              <Button onClick={() => { setProjectName(''); setCircuits([{ id: '1', name: '', power: 0, unit: 'W', voltage: 220, type: 'outlet', distance: 0, distanceUnknown: false }]); setShowResults(false); setErrors({}); }} variant="secondary" fullWidth className="h-10 text-xs opacity-60 hover:opacity-100">
                 <Trash2 className="w-4 h-4" /> Limpar Campos
              </Button>
            </div>
          </div>
        </div>

        {/* Relatório Visual */}
        <div className="lg:col-span-8" id="report-view">
          {showResults && materials ? (
            <div className="space-y-6 animate-fade-in">
              {/* Individual */}
              <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-xl">
                <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex items-center gap-2">
                   <Zap className="w-5 h-5 text-electric-yellow" />
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest">Dimensionamento por Circuito</h3>
                </div>
                <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.individualCalculations.map((c, i) => (
                    <div key={c.id} className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                      <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
                        <span className="text-[10px] font-black text-black bg-zinc-400 w-5 h-5 rounded flex items-center justify-center">{i + 1}</span>
                        <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Corrente</p>
                          <p className="text-xs font-mono text-electric-yellow font-bold">{c.current.toFixed(2)}A</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Disjuntor</p>
                          <p className="text-xs font-bold text-white">{c.breaker}A</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Cabo Mín.</p>
                          <p className="text-xs font-bold text-blue-400">{c.cable} mm²</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidado Reorganizado */}
              <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-xl">
                <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex items-center gap-2">
                    <List className="w-5 h-5 text-electric-yellow" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Lista Consolidada de Materiais</h3>
                </div>
                
                <div className="p-8 grid md:grid-cols-2 gap-12">
                  {/* Coluna 1: Dispositivos */}
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Proteção do Quadro</h4>
                      <ul className="text-sm space-y-3">
                        {materials.general.map((m, i) => (
                            <li key={`g-${i}`} className="flex justify-between items-center text-zinc-300">
                              <span className="leading-tight">{m.name}</span>
                              <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">x{m.qty}</span>
                            </li>
                        ))}
                        {materials.breakers.map((m, i) => (
                            <li key={`b-${i}`} className="flex justify-between items-center text-zinc-300">
                              <span className="leading-tight">{m.name}</span>
                              <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">x{m.qty}</span>
                            </li>
                        ))}
                      </ul>
                  </div>

                  {/* Coluna 2: Condutores (Agrupados Verticalmente) */}
                  <div className="space-y-8">
                      {/* Fases */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Fases (Cobre)</h4>
                        <ul className="text-sm space-y-2">
                          {materials.detailedCables.phases.map((c, i) => (
                              <li key={`ph-${i}`} className="flex justify-between items-center text-zinc-300">
                                <span>Cabo Flexível {c.mm}mm²</span>
                                <span className="font-mono font-bold text-white">{c.len}m</span>
                              </li>
                          ))}
                        </ul>
                      </div>

                      {/* Neutros e Terra abaixo economizando altura */}
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Neutros (Cobre)</h4>
                          <ul className="text-sm space-y-2">
                            {materials.detailedCables.neutrals.length > 0 ? materials.detailedCables.neutrals.map((c, i) => (
                                <li key={`nt-${i}`} className="flex justify-between items-center text-zinc-300">
                                  <span>Cabo Flexível {c.mm}mm²</span>
                                  <span className="font-mono font-bold text-white">{c.len}m</span>
                                </li>
                            )) : <li className="text-zinc-600 italic text-xs">Não aplicável</li>}
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Aterramento (Cobre)</h4>
                          <ul className="text-sm space-y-2">
                            {materials.detailedCables.grounds.map((c, i) => (
                                <li key={`gr-${i}`} className="flex justify-between items-center text-zinc-300">
                                  <span>Cabo Flexível {c.mm}mm²</span>
                                  <span className="font-mono font-bold text-white">{c.len}m</span>
                                </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-6 border-t border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-green-500/70" /> Dimensionamento Completo
                  </div>
                  <p className="text-[10px] text-zinc-500 italic">
                    Margem de segurança de 10% aplicada.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-dark-surface/30 border border-dark-border border-dashed rounded-xl h-[500px] flex flex-col items-center justify-center text-zinc-700 gap-4">
               <CalcIcon className="w-16 h-16 opacity-20" />
               <div className="text-center px-6">
                 <p className="text-sm font-bold uppercase tracking-widest opacity-30">Relatório Consolidado</p>
                 <p className="text-xs opacity-20 mt-2">Os resultados aparecerão aqui após o cálculo.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
