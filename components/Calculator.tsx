
import React, { useState } from 'react';
import { Zap, AlertTriangle, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from './Button';

export const Calculator: React.FC = () => {
  // Alterado para iniciar vazio e permitir texto livre
  const [equipment, setEquipment] = useState(''); 
  const [voltage, setVoltage] = useState<127 | 220 | 380>(220);
  const [power, setPower] = useState<number | ''>('');
  const [unit, setUnit] = useState<'W' | 'BTU'>('W');
  const [connectionType, setConnectionType] = useState<'mono' | 'bi' | 'tri'>('bi');
  const [distance, setDistance] = useState<number | ''>('');
  const [distanceUnknown, setDistanceUnknown] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleVoltageChange = (val: 127 | 220 | 380) => {
    setVoltage(val);
    if (val === 127) setConnectionType('mono');
    else if (val === 220) setConnectionType('bi');
    else if (val === 380) setConnectionType('tri');
  };

  const handleReset = () => {
    setEquipment('');
    setPower('');
    setDistance('');
    setDistanceUnknown(false);
    setResult(null);
    setValidationError(null);
  };

  const calculate = () => {
    // Validation Logic
    if (power === '' || (distance === '' && !distanceUnknown)) {
      setValidationError("Preencha todos os campos para fazer o cálculo. Caso não saiba a distância, selecione N/A e fazemos o cálculo para você.");
      return;
    }
    
    // Clear error if valid
    setValidationError(null);

    if (equipment.trim() === '') {
       // Optional: Force equipment name, currently just returns
       // If you want to enforce name: setValidationError("Preencha o nome do equipamento."); return;
    } 

    // 1. Convert Unit (BTU to Watts)
    const powerInWatts = unit === 'BTU' ? Number(power) * 0.293 : Number(power);

    // 2. Calculate Design Current (IB)
    let current = 0;
    if (connectionType === 'tri') {
      // I = P / (V * sqrt(3))
      current = powerInWatts / (voltage * 1.732);
    } else {
      // Mono or Bi
      current = powerInWatts / voltage;
    }
    
    // 3. Define NBR 5410 Tables (Method B1 - Embutido Alvenaria, PVC)
    // Conductors Loaded: 2 for Mono/Bi, 3 for Tri
    const numLoadedConductors = connectionType === 'tri' ? 3 : 2;

    const cableTable = [
      // { section: mm², cap2: capacity 2 conductors, cap3: capacity 3 conductors }
      { section: 1.5, cap2: 17.5, cap3: 15.5 },
      { section: 2.5, cap2: 24, cap3: 21 },
      { section: 4.0, cap2: 32, cap3: 28 },
      { section: 6.0, cap2: 41, cap3: 36 },
      { section: 10.0, cap2: 57, cap3: 50 },
      { section: 16.0, cap2: 76, cap3: 68 },
      { section: 25.0, cap2: 101, cap3: 89 },
      { section: 35.0, cap2: 125, cap3: 110 },
      { section: 50.0, cap2: 151, cap3: 134 },
    ];

    const standardBreakers = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125];

    // 4. Initial Selection based on Ampacity (Iz >= IB) AND Minimum Section Rule
    
    // Regra NBR 5410:
    // Iluminação: Mínimo 1.5mm²
    // Força (Tomadas/Equipamentos): Mínimo 2.5mm²
    const nameLower = equipment.toLowerCase();
    const isLighting = nameLower.includes('ilumina') || nameLower.includes('luz') || nameLower.includes('lampada') || nameLower.includes('lâmpada');
    const minSectionAllowed = isLighting ? 1.5 : 2.5;

    let selectedCableIndex = 0;
    
    for (let i = 0; i < cableTable.length; i++) {
       // Check 1: Respeita a seção mínima pelo tipo de uso?
       if (cableTable[i].section < minSectionAllowed) continue;

       // Check 2: A capacidade suporta a corrente calculada?
       const capacity = numLoadedConductors === 3 ? cableTable[i].cap3 : cableTable[i].cap2;
       if (capacity >= current) {
         selectedCableIndex = i;
         break;
       }
       // Se chegamos ao fim e nada serviu, pega o último (maior)
       if (i === cableTable.length - 1) selectedCableIndex = i;
    }

    // 5. Breaker Selection (In >= IB)
    // Find smallest breaker greater than design current
    let selectedBreaker = 10;
    for (const b of standardBreakers) {
      if (b >= current) {
        selectedBreaker = b;
        break;
      }
    }

    // 6. Coordination Check (In <= Iz)
    // The breaker (In) must be less than or equal to the cable capacity (Iz).
    // If Breaker > Cable Capacity, we must increase cable size.
    let iz = numLoadedConductors === 3 ? cableTable[selectedCableIndex].cap3 : cableTable[selectedCableIndex].cap2;

    while (selectedBreaker > iz && selectedCableIndex < cableTable.length - 1) {
       selectedCableIndex++;
       iz = numLoadedConductors === 3 ? cableTable[selectedCableIndex].cap3 : cableTable[selectedCableIndex].cap2;
    }

    // Current Cable Stats
    let minCable = cableTable[selectedCableIndex].section;
    let cableCapacity = iz;

    // 7. Calculate Voltage Drop
    let voltageDropString = "N/A";
    let voltageDropVoltsString = "N/A";
    let showDistanceWarning = false;

    if (distanceUnknown) {
      showDistanceWarning = true;
    } else {
      const resistivity = 0.0172; // Copper ohm*mm²/m
      // Mono/Bi (F+N or F+F): L is distance, total length is 2*L
      // Tri: Factor is sqrt(3)
      const factor = connectionType === 'tri' ? 1.732 : 2;
      const calcDistance = Number(distance);
      
      let voltageDrop = (factor * calcDistance * current * resistivity) / (minCable * voltage) * 100;

      // Upsize cable if drop > 4% (NBR 5410 limit for terminal circuits usually 4%)
      while (voltageDrop > 4 && selectedCableIndex < cableTable.length - 1) {
          selectedCableIndex++;
          minCable = cableTable[selectedCableIndex].section;
          // Update capacity based on new size
          cableCapacity = numLoadedConductors === 3 ? cableTable[selectedCableIndex].cap3 : cableTable[selectedCableIndex].cap2;
          
          voltageDrop = (factor * calcDistance * current * resistivity) / (minCable * voltage) * 100;
      }
      voltageDropString = voltageDrop.toFixed(2);
      voltageDropVoltsString = ((voltageDrop / 100) * voltage).toFixed(2);
    }

    // 8. Wiring Details Logic
    let wiringDetails = {
      phases: { qty: 1, text: "Fase" },
      neutral: { needed: true, text: "Necessário" },
      ground: { needed: true, text: "Passa Direto" }
    };

    if (connectionType === 'mono') {
      wiringDetails.phases = { qty: 1, text: "1x Fase (Liga no Disjuntor)" };
      wiringDetails.neutral = { needed: true, text: "1x Neutro (Passa Direto)" };
    } else if (connectionType === 'bi') {
      wiringDetails.phases = { qty: 2, text: "2x Fases (Liga no Disjuntor)" };
      wiringDetails.neutral = { needed: false, text: "Não utiliza (Geralmente)" };
    } else {
      wiringDetails.phases = { qty: 3, text: "3x Fases (Liga no Disjuntor)" };
      wiringDetails.neutral = { needed: true, text: "1x Neutro (Se carga interna precisar)" };
    }

    setResult({
      equipmentName: equipment,
      powerWatts: powerInWatts.toFixed(0),
      current: current.toFixed(2),
      minCable,
      cableCapacity,
      breaker: selectedBreaker,
      voltageDrop: voltageDropString,
      voltageDropVolts: voltageDropVoltsString,
      showDistanceWarning,
      wiringDetails
    });
  };

  const handleCopy = () => {
    if (!result) return;
    const distText = distanceUnknown ? "Não informada" : `${distance}m`;
    const dropText = result.showDistanceWarning 
      ? "Não calculada" 
      : `${result.voltageDrop}% (${result.voltageDropVolts}V)`;

    const text = `
⚡ *Instalação Segura - Relatório Técnico*

*Equipamento:* ${result.equipmentName}
*Potência:* ${result.powerWatts}W (${voltage}V)
*Ligação:* ${connectionType === 'mono' ? 'Monofásico' : connectionType === 'bi' ? 'Bifásico' : 'Trifásico'}
*Distância:* ${distText}

📋 *RESULTADO:*
*Cabo Indicado:* ${result.minCable} mm²
*Disjuntor:* ${result.breaker} A
*Corrente Est.:* ${result.current} A
*Queda Tensão:* ${dropText}

🔗 *Fios:*
• ${result.wiringDetails.phases.text}
• Terra: ${result.minCable}mm² (Passa Direto)
${result.wiringDetails.neutral.needed ? `• Neutro: ${result.minCable}mm²` : '• Neutro: Não utiliza'}
${result.showDistanceWarning ? "\n⚠️ *Atenção:* Distância não informada. Verifique queda de tensão em circuitos longos." : ""}
${(!result.showDistanceWarning && Number(result.voltageDrop) > 4) ? "\n⚠️ *Atenção:* Queda de tensão elevada (>4%)." : ""}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Calculadora de Instalação</h2>
        <p className="text-text-secondary text-sm">
          Dimensionamento conforme NBR 5410. Preencha os dados do equipamento abaixo.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-electric-yellow rounded-full"></span>
                Dados da Instalação
              </h3>

              <div className="space-y-5">
                {/* Equipment Input (Text Free) */}
                <div>
                  <label className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5 block">Nome do Equipamento / Circuito</label>
                  <input
                    type="text"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    placeholder="Ex: Chuveiro, Iluminação Sala, Ar Condicionado..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-electric-yellow focus:outline-none placeholder-zinc-700 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Digite "Iluminação" ou "Lâmpada" para cálculo de circuitos de luz (mín. 1.5mm²).
                  </p>
                </div>

                {/* Power & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5 block">Potência</label>
                     <input
                      type="number"
                      value={power === '' ? '' : power}
                      onChange={(e) => setPower(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-electric-yellow focus:outline-none placeholder-zinc-700"
                      placeholder="0"
                    />
                  </div>
                  <div>
                     <label className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5 block">Unidade</label>
                     <div className="flex bg-dark-bg rounded-lg border border-dark-border p-1">
                        <button 
                          onClick={() => setUnit('W')}
                          className={`flex-1 text-xs font-bold rounded py-1.5 transition-all ${unit === 'W' ? 'bg-electric-yellow text-black' : 'text-text-secondary'}`}
                        >
                          Watts
                        </button>
                        <button 
                          onClick={() => setUnit('BTU')}
                          className={`flex-1 text-xs font-bold rounded py-1.5 transition-all ${unit === 'BTU' ? 'bg-electric-yellow text-black' : 'text-text-secondary'}`}
                        >
                          BTUs
                        </button>
                     </div>
                  </div>
                </div>

                {/* Voltage & Connection (Locked) */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5 block">Tensão (Volts)</label>
                      <select 
                        value={voltage}
                        onChange={(e) => handleVoltageChange(Number(e.target.value) as 127 | 220 | 380)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-electric-yellow focus:outline-none"
                      >
                        <option value={127}>127V</option>
                        <option value={220}>220V</option>
                        <option value={380}>380V</option>
                      </select>
                   </div>
                   <div>
                      <div className="flex justify-between items-baseline mb-1.5">
                         <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block">Ligação</label>
                         <span className="text-[10px] text-zinc-500">Automático</span>
                      </div>
                      <select 
                        value={connectionType}
                        disabled
                        className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed opacity-70 appearance-none"
                      >
                        <option value="mono">Monofásico</option>
                        <option value="bi">Bifásico</option>
                        <option value="tri">Trifásico</option>
                      </select>
                   </div>
                </div>

                {/* Distance */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                     <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block">Distância do Quadro</label>
                     <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={distanceUnknown}
                          onChange={(e) => setDistanceUnknown(e.target.checked)}
                          className="accent-electric-yellow rounded w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">N/A</span>
                     </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={distance === '' ? '' : distance}
                      onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={distanceUnknown}
                      className={`w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-electric-yellow focus:outline-none transition-opacity placeholder-zinc-700 ${distanceUnknown ? 'opacity-30 cursor-not-allowed' : ''}`}
                      placeholder={distanceUnknown ? "Indefinida" : "0"}
                    />
                    {!distanceUnknown && <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">Metros</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {validationError && (
                 <div className="bg-red-500/10 border border-red-500/20 rounded p-3 flex items-start gap-2 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-200">{validationError}</p>
                 </div>
              )}
              <Button onClick={calculate} fullWidth className="h-12 shadow-lg shadow-yellow-500/20">
                 Calcular Dimensionamento
              </Button>
              <button 
                onClick={handleReset}
                className="w-full bg-ice-white text-zinc-900 font-medium text-sm py-2.5 px-5 rounded-lg transition-all duration-200 hover:bg-white flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-zinc-500" /> Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className={`h-full border rounded-xl p-6 relative overflow-hidden transition-all flex flex-col ${result ? 'bg-dark-surface border-electric-yellow/50' : 'bg-dark-surface/50 border-dark-border'}`}>
            
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                <div className="w-16 h-16 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center">
                   <Zap className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-sm font-medium">Preencha os dados e clique em calcular</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in relative z-10 flex-grow">
                {/* Header with Copy */}
                <div className="flex justify-between items-center pb-4 border-b border-dark-border">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-electric-yellow" />
                    <h3 className="font-bold text-white">Resultado</h3>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white bg-dark-bg px-3 py-1.5 rounded border border-dark-border hover:border-zinc-600 transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIADO' : 'COPIAR DADOS'}
                  </button>
                </div>

                {/* Main Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-bg p-4 rounded-lg border border-dark-border text-center">
                     <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Cabo Recomendado</span>
                     <div className="text-3xl font-bold text-blue-400 my-1">{result.minCable} <span className="text-sm text-zinc-500">mm²</span></div>
                     <span className="text-[10px] text-zinc-500">Capacidade: {result.cableCapacity}A</span>
                  </div>
                  <div className="bg-dark-bg p-4 rounded-lg border border-dark-border text-center">
                     <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Disjuntor Indicado</span>
                     <div className="text-3xl font-bold text-white my-1">{result.breaker} <span className="text-sm text-zinc-500">A</span></div>
                     <span className="text-[10px] text-zinc-500">Curva C (Padrão)</span>
                  </div>
                </div>

                {/* Secondary Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/10 text-center">
                    <span className="text-[10px] text-blue-200/70 uppercase tracking-wider font-bold">Corrente de Projeto</span>
                    <div className="text-xl font-mono text-blue-100">{result.current} A</div>
                  </div>
                  <div className={`p-3 rounded-lg border text-center flex flex-col justify-center ${
                    result.showDistanceWarning 
                      ? 'bg-zinc-800 border-zinc-700' 
                      : (Number(result.voltageDrop) > 4 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20')
                  }`}>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${
                      result.showDistanceWarning 
                        ? 'text-zinc-400' 
                        : (Number(result.voltageDrop) > 4 ? 'text-red-300' : 'text-green-300')
                    }`}>
                      Queda de Tensão
                    </span>
                    <div className={`text-xl font-mono my-1 ${
                      result.showDistanceWarning 
                        ? 'text-zinc-300' 
                        : (Number(result.voltageDrop) > 4 ? 'text-red-200' : 'text-green-200')
                    }`}>
                      {result.showDistanceWarning ? '--' : `${result.voltageDrop}% (${result.voltageDropVolts}V)`}
                    </div>
                    
                    {!result.showDistanceWarning && Number(result.voltageDrop) > 4 && (
                       <span className="text-[10px] text-red-400 font-medium leading-tight mt-1">
                         ⚠ Atenção: Queda de tensão elevada.
                       </span>
                    )}
                  </div>
                </div>

                {/* Distance Warning Banner */}
                {result.showDistanceWarning && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded flex gap-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-yellow-200/80 leading-relaxed">
                        <strong>Atenção:</strong> Distância não informada. Em circuitos longos, a queda de tensão pode ser crítica, causando falhas ou aquecimento. Considere superdimensionar o cabo se a distância for grande.
                      </p>
                   </div>
                )}

                {/* Wiring Details */}
                <div className="bg-dark-bg rounded-lg border border-dark-border p-5 mt-auto">
                   <h4 className="text-xs font-bold text-text-secondary uppercase mb-4 flex items-center gap-2">
                     <span className="text-lg leading-none">+</span> Detalhamento dos Fios
                   </h4>
                   <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-dark-border pb-2">
                        <span className="text-zinc-400">Fases</span>
                        <div className="text-right">
                          <span className="text-white font-bold">{result.wiringDetails.phases.qty}x Cabo {result.minCable} mm²</span>
                          <span className="text-[10px] text-blue-400 block">(Liga no Disjuntor)</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-dark-border pb-2">
                        <span className="text-zinc-400">Neutro</span>
                        <div className="text-right">
                          {result.wiringDetails.neutral.needed ? (
                             <span className="text-white font-bold">1x Cabo {result.minCable} mm²</span>
                          ) : (
                             <span className="text-zinc-600 font-bold">Não utiliza</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Terra</span>
                        <div className="text-right">
                          <span className="text-white font-bold">1x Cabo {result.minCable} mm²</span>
                          <span className="text-[10px] text-orange-400 block">(Passa Direto)</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
            
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
