
import { GoogleGenAI } from "@google/genai";
import { CircuitInput } from "../types";

export const generateMultifilarDiagramSVG = async (circuits: CircuitInput[], projectName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const circuitsDescription = circuits.map((c, i) => 
    `Circuito ${i + 1}: ${c.name}, Potência: ${c.power}W, Tensão: ${c.voltage}V, Tipo: ${c.type}`
  ).join('\n');

  const prompt = `
    Atue como um Engenheiro Eletricista Sênior especialista em projetos de painéis elétricos.
    
    Tarefa: Gere um código SVG técnico de um DIAGRAMA MULTIFILAR para um Quadro de Distribuição (QDC) seguindo a NBR 5410.
    
    Projeto: ${projectName}
    Circuitos:
    ${circuitsDescription}

    Requisitos Técnicos e Visuais (Siga fielmente):
    1. ESTILO: Desenho limpo em estilo "blueprint" técnico. Use fundo branco (#FFFFFF) ou azul escuro técnico (#0f172a).
    2. COMPONENTES: 
       - Desenhe um Disjuntor Geral (Tripolar ou Bipolar conforme a carga).
       - Desenhe um IDR (Interruptor Diferencial Residual) tetrapolar logo após o geral.
       - Desenhe os módulos DPS (Protetor de Surto) conectados às fases e ao terra.
       - Desenhe barramentos de cobre para Neutro e Terra nas laterais ou topo/fundo.
    3. FIAÇÃO MULTIFILAR (Cores Normatizadas):
       - NEUTRO: Linhas em AZUL CLARO (#3b82f6).
       - TERRA: Linhas em VERDE ou VERDE-AMARELO (#22c55e).
       - FASES: Linhas em VERMELHO, PRETO ou MARROM.
       - Mostre as conexões entrando no topo dos disjuntores e saindo pela base.
    4. DETALHES: 
       - Indique a seção dos cabos (ex: 2.5mm², 6mm²) nos fios principais.
       - Rotule os barramentos (BARRAMENTO NEUTRO / BARRAMENTO TERRA).
       - Inclua uma legenda técnica no canto.
    
    RETORNO: Retorne APENAS o código SVG puro, sem markdown, crases ou explicações. O SVG deve ter viewBox apropriado para não cortar o desenho.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text || '';
    return text.replace(/```svg/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Erro ao gerar diagrama multifilar:", error);
    throw new Error("Falha na IA ao desenhar o esquema. Verifique sua chave API.");
  }
};

export const getSEOTips = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `
    Atue como um especialista em SEO para engenharia elétrica.
    Gere um relatório HTML (h3, p, ul, li) com dicas de palavras-chave e estratégias para um site chamado "Instalação Segura".
    Foque em termos como "NBR 5410", "calculadora de bitola", "diagrama unifilar online".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.replace(/```html/g, '').replace(/```/g, '').trim() || "";
  } catch (error) {
    return "<h3>Erro</h3><p>Não foi possível carregar as dicas de SEO.</p>";
  }
};
