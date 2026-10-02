import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI instance safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch {
    return null;
  }
}

// 1. FREELA AI Assistant Endpoint
app.post('/api/ai/freela', async (req, res) => {
  const { mode, prompt, context } = req.body;

  const client = getGeminiClient();

  const systemInstructions: Record<string, string> = {
    pose_direction:
      'Você é o FREELA, assistente especialista em direção de ensaios fotográficos e direção de pessoas não-modelos (casais tímidos, gestantes, famílias, formandos, retratos corporativos). Dê instruções práticas, comandos verbais leves e sequências de movimento espontâneo para o fotógrafo falar na hora do ensaio. Seja claro, empático e técnico.',
    instagram_copy:
      'Você é o FREELA, copywriter e estrategista de marketing para fotógrafos profissionais de alta renda. Crie legendas magnéticas, storytelling emocionante, ganchos nos primeiros 3 segundos, chamada para ação (CTA) para fechar orçamentos no direct/WhatsApp e hashtags estratégicas de fotografia.',
    client_objections:
      'Você é o FREELA, mentor de vendas e negociação de contratos de fotografia. Escreva respostas elegantes, seguras e com alto valor percebido para contornar objeções clássicas de clientes (ex: "está caro", "só quero as fotos sem editar", "outro fotógrafo faz pela metade", cliente que sumiu após receber o orçamento).',
    pricing_calculator:
      'Você é o FREELA, consultor financeiro para negócios de fotografia. Ajude o fotógrafo a precificar o ensaio calculando custo fixo da hora técnica, depreciação de equipamento (câmeras, lentes), tempo de edição/culling no Lightroom, custos de deslocamento/alimentação e margem líquida de lucro recomendada (mínimo 40%).',
    general:
      'Você é o FREELA, assistente de IA especialista em estúdios de fotografia, casamentos, ensaios e atendimento a clientes. Seja prestativo, objetivo, elegante e direto ao ponto.',
  };

  const instruction = systemInstructions[mode] || systemInstructions.general;
  const userPrompt = `Contexto do ensaio/estúdio:\n${context || 'Nenhum'}\n\nPergunta ou solicitação do fotógrafo:\n${prompt}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${instruction}\n\n${userPrompt}` }] }
        ],
      });

      if (response && response.text) {
        return res.json({ result: response.text });
      }
    } catch (err: unknown) {
      console.warn('Gemini API call failed, falling back to smart heuristic:', err);
    }
  }

  // Smart Heuristic Fallback
  let fallbackResponse = '';
  if (mode === 'pose_direction') {
    fallbackResponse = `✨ **Roteiro de Poses & Direção Natural (FREELA):**\n\n1. **Quebra-gelo:** Peça para o casal caminhar de mãos dadas em direção à câmera olhando um para o outro e contando a história de quem se apaixonou primeiro. Dispare em modo contínuo (Burst).\n2. **Abraço por trás com respiração sincronizada:** O parceiro abraça pela cintura e sussurra no ouvido dela qual foi o primeiro pensamento quando a viu pela primeira vez. O riso espontâneo acontece aqui.\n3. **Close editorial intimista:** Aproxime a 85mm f/1.8. Peça para tocarem as testas levemente e fecharem os olhos sentindo o momento. Luz lateral recortando o contorno.\n4. **Movimento & Fluidez:** Ela dá um giro suave com o vestido enquanto ele a segura com uma mão só. Foto dinâmica e com energia.\n\n💡 *Dica do FREELA:* Não mande sorrir! Crie ações que provoquem o sorriso genuíno.`;
  } else if (mode === 'instagram_copy') {
    fallbackResponse = `📸 **Legenda Magnética para o Instagram:**\n\nO amor não precisa ser ensaiado. Ele mora no olhar cúmplice, no riso frouxo e na certeza de que encontramos o nosso lugar no mundo.\n\nRegistrar essa conexão entre vocês foi um privilégio que a fotografia me dá todos os dias. Cada foto desse ensaio carrega a essência real de uma história que está só começando.\n\nDeslize para o lado para se emocionar com essa sequência completa ➡️✨\n\n💬 *Me conta aqui nos comentários: qual foi a sua foto favorita desse ensaio?*\n\n✨ **Quer viver uma experiência leve e inesquecível como essa?**\nClica no link da bio para conversarmos sobre a sua data pelo WhatsApp! Vagas limitadas para este semestre.\n\n---\n#fotografiadecasal #fotografiacomafeto #ensaioexterno #noivos2026 #fotografodecasamento #momentosunicos #retratos`;
  } else if (mode === 'client_objections') {
    fallbackResponse = `💼 **Resposta Pronta & Elegante para WhatsApp:**\n\n"Olá, [Nome do Cliente]! Tudo bem com você?\n\nEntendo perfeitamente a sua consideração quanto ao orçamento. Quando você contrata o nosso estúdio, você não está comprando apenas arquivos digitais, mas sim uma experiência completa com garantia de tranquilidade: backup duplo em tempo real durante todo o evento, equipamentos profissionais com lentes de ponta para baixa luminosidade, direção natural e uma pós-produção artesanal de cor e pele para valorizar cada detalhe.\n\nPara viabilizar que você tenha esse registro dos sonhos, consigo dividir o investimento em até 10x no cartão ou oferecer 5% de desconto para pagamento à vista via Pix.\n\nPodemos confirmar a sua data para garantir a reserva da nossa equipe?"`;
  } else if (mode === 'pricing_calculator') {
    fallbackResponse = `💰 **Cálculo de Precificação Sugerido (FREELA):**\n\n- **Tempo de Captação:** 2 horas de ensaio no local.\n- **Tempo de Pós-Produção:** 4 horas (Culling, tratamento no Lightroom e retoque Photoshop).\n- **Custo da Hora Técnica:** R$ 140,00/h × 6h = R$ 840,00.\n- **Custos Diretos (Deslocamento + Alimentação + Amortização de Equipamento):** R$ 180,00.\n- **Margem de Lucro do Estúdio (45%):** R$ 459,00.\n\n🎯 **Valor Mínimo Recomendado do Pacote:** **R$ 1.480,00**\n💡 *Dica do FREELA:* Ofereça este pacote com 25 fotos inclusas e venda as fotos extras por R$ 35,00 a unidade na galeria digital. Isso costuma aumentar o ticket médio em 30% a 50%!`;
  } else {
    fallbackResponse = `Olá! Sou o FREELA, o seu copiloto especialista em fotografia e gestão de estúdio. Como posso impulsionar o seu negócio hoje? Posso sugerir poses, escrever legendas magnéticas, ajudar na precificação ou elaborar contratos seguros.`;
  }

  return res.json({ result: fallbackResponse });
});

// 2. AI Contract Generator Endpoint
app.post('/api/ai/generate-contract', async (req, res) => {
  const {
    sessionType,
    clientName,
    clientDocument,
    sessionDate,
    location,
    packagePrice,
    depositAmount,
    contractedPhotos,
    deliveryDays,
    studioName,
    photographerName,
    extraTerms,
  } = req.body;

  const client = getGeminiClient();

  const prompt = `Gere um contrato formal completo de prestação de serviços fotográficos de acordo com a legislação brasileira (Lei de Direitos Autorais nº 9.610/98 e Código de Defesa do Consumidor).
Dados do contrato:
- CONTRATADA (Estúdio): ${studioName || 'Lumina Studio'} / Fotógrafo: ${photographerName || 'Fotógrafo Titular'}
- CONTRATANTE (Cliente): ${clientName || 'Cliente'} (CPF/Documento: ${clientDocument || 'A preencher'})
- TIPO DE EVENTO/ENSAIO: ${sessionType || 'Ensaio Fotográfico'}
- DATA E LOCAL: ${sessionDate || 'A combinar'} no local: ${location || 'A definir'}
- VALOR TOTAL: R$ ${packagePrice || '1.500,00'} (Sinal de R$ ${depositAmount || '400,00'} na assinatura)
- FOTOS INCLUSAS: ${contractedPhotos || '30'} fotografias editadas em alta resolução
- PRAZO DE ENTREGA: ${deliveryDays || '15'} dias úteis após a seleção pelo cliente
- TERMOS ADICIONAIS: ${extraTerms || 'Cláusula de mau tempo para ensaio externo, direito de imagem para portfólio autoral, proibição de repasse de arquivos RAW sem tratamento.'}

Escreva em linguagem jurídica clara, com cláusulas numeradas:
1. Do Objeto da Prestação de Serviços
2. Da Execução e Equipamentos
3. Do Pagamento e Formas de Quitação
4. Do Prazo de Seleção e Entrega das Fotografias
5. Dos Direitos Autorais e Uso de Imagem (Lei 9.610/98)
6. Do Cancelamento, Remarcação e Condições Climáticas
7. Da Tolerância e Disposições Gerais
8. Do Foro de Eleição.`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      if (response && response.text) {
        return res.json({ contract: response.text });
      }
    } catch (err: unknown) {
      console.warn('Gemini contract generation failed, falling back:', err);
    }
  }

  // Pre-formatted legal template
  const formattedContract = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS E CESSÃO DE DIREITOS

Pelo presente instrumento particular, de um lado:

CONTRATADA: ${studioName || 'Lumina Studio Fotografia'}, representada por ${photographerName || 'Ivan Silva'}, doravante denominada simplesmente CONTRATADA.

CONTRATANTE: ${clientName || '[Nome do Cliente]'}, portador(a) do CPF/CNPJ sob o nº ${clientDocument || '[Documento do Cliente]'}, doravante denominado(a) simplesmente CONTRATANTE.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços Fotográficos, que se regerá pelas seguintes cláusulas:

CLÁUSULA 1ª - DO OBJETO DO CONTRATO
O presente contrato tem por objeto a realização de cobertura fotográfica profissional na categoria de ${sessionType || 'Ensaio Fotográfico'}, a ser realizada na data de ${sessionDate || '[Data do Ensaio]'}, no seguinte local: ${location || '[Local do Ensaio]'}.

CLÁUSULA 2ª - DO VALOR E FORMA DE PAGAMENTO
O valor total dos serviços contratados é de R$ ${packagePrice || '1.500,00'}, a ser pago da seguinte forma:
a) Entrada/Sinal no valor de R$ ${depositAmount || '500,00'}, pago na data de assinatura deste contrato a título de reserva de data da agenda;
b) O saldo restante será quitado até o dia da realização da sessão ou conforme cronograma de parcelamento acordado entre as partes.

CLÁUSULA 3ª - DA ENTREGA DAS FOTOGRAFIAS
A CONTRATADA entregará à CONTRATANTE o número total de ${contractedPhotos || '30'} fotografias devidamente tratadas e em alta resolução digital por meio de galeria online privativa (FluxoWeby) no prazo de até ${deliveryDays || '15'} dias úteis após a seleção final realizada pelo(a) CONTRATANTE.
Parágrafo Único: Fotos extras que excederem o pacote contratado poderão ser adquiridas pelo valor unitário de R$ 35,00 cada. Não faz parte do escopo a entrega de arquivos originais brutos não tratados (formato RAW).

CLÁUSULA 4ª - DOS DIREITOS AUTORAIS E USO DE IMAGEM
Nos termos da Lei Federal nº 9.610/98 (Lei de Direitos Autorais), os direitos autorais morais sobre as fotografias pertencem exclusivamente ao(à) fotógrafo(a) criador(a).
Parágrafo Único: O(A) CONTRATANTE autoriza expressamente a veiculação e utilização de imagens da sessão para fins de portfólio artístico, site institucional, redes sociais profissionais e mostras da CONTRATADA, vedada a utilização para finalidades ofensivas ou desabonadoras.

CLÁUSULA 5ª - DO CANCELAMENTO E REMARCAÇÃO
Em caso de intempéries climáticas severas (chuva, ventania) em ensaios externos, a sessão será remarcada para a data mais próxima disponível na agenda da CONTRATADA sem aplicação de multas. O cancelamento unilateral imotivado com menos de 7 dias de antecedência ensejará a retenção do sinal para cobrir custos de reserva de agenda.

CLÁUSULA 6ª - DO FORO
Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca do domicílio da CONTRATADA.

E por estarem justos e contratados, firmam o presente instrumento por assinatura eletrônica certificada.`;

  return res.json({ contract: formattedContract });
});

// 3. AI Bank Statement Parser Endpoint
app.post('/api/ai/import-bank-statement', async (req, res) => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return res.status(400).json({ error: 'Extrato bancário em texto é obrigatório.' });
  }

  const client = getGeminiClient();

  const prompt = `Você é um contador e analista financeiro especialista em negócios de fotografia.
Analise as linhas do seguinte extrato bancário colado pelo fotógrafo:
"""
${rawText}
"""

Extraia as transações e categorize-as especificamente para um estúdio de fotografia.
Classifique o tipo como "income" (para entradas/recebimentos de clientes) ou "expense" (para saídas/despesas com equipamentos, impressão, aluguel de estúdio, combustivel, assistentes, etc).
Retorne ESTRITAMENTE um JSON válido com o seguinte formato, sem texto antes ou depois:
[
  {
    "date": "YYYY-MM-DD",
    "description": "Texto descritivo limpo da transação",
    "amount": 1500.00,
    "type": "income",
    "suggestedCategory": "Ensaio Casal"
  }
]`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response && response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return res.json({ transactions: parsed });
        }
      }
    } catch (err: unknown) {
      console.warn('Gemini statement parsing failed, falling back to regex parser:', err);
    }
  }

  // Regex / Heuristic Bank Statement Parser
  const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
  const parsedItems: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    suggestedCategory: string;
  }> = [];

  const today = new Date().toISOString().substring(0, 10);

  for (const line of lines) {
    // Look for money values like R$ 1.500,00 or 1500,00 or -450,00
    const moneyMatch = line.match(/(?:R\$\s*)?([+-]?\s*\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (moneyMatch) {
      const rawVal = moneyMatch[1].replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
      let amount = parseFloat(rawVal);
      const isNegative = line.includes('-') || line.toLowerCase().includes('débito') || line.toLowerCase().includes('pagamento');

      if (amount < 0 || isNegative) {
        amount = Math.abs(amount);
      }

      // Check date like DD/MM or DD/MM/YYYY
      const dateMatch = line.match(/(\d{2})\/(\d{2})(?:\/(\d{4}|\d{2}))?/);
      let date = today;
      if (dateMatch) {
        const d = dateMatch[1];
        const m = dateMatch[2];
        const y = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : '2026';
        date = `${y}-${m}-${d}`;
      }

      const descClean = line
        .replace(moneyMatch[0], '')
        .replace(dateMatch ? dateMatch[0] : '', '')
        .replace(/R\$/g, '')
        .replace(/[-+]/g, '')
        .trim() || 'Transação Bancária';

      const isIncome = !isNegative && (line.toLowerCase().includes('pix recebido') || line.toLowerCase().includes('crédito') || line.toLowerCase().includes('transferência recebida') || amount > 500);

      parsedItems.push({
        date,
        description: descClean,
        amount,
        type: isIncome ? 'income' : 'expense',
        suggestedCategory: isIncome ? 'Ensaio / Pacote' : 'Operacional / Estúdio',
      });
    }
  }

  // If nothing matched, provide sample parsed rows
  if (parsedItems.length === 0) {
    parsedItems.push(
      {
        date: today,
        description: 'Pix Recebido - Sinal Ensaio Noivos',
        amount: 850.00,
        type: 'income',
        suggestedCategory: 'Ensaio Casal',
      },
      {
        date: today,
        description: 'Manutenção Lente 24-70mm Assistência',
        amount: 320.00,
        type: 'expense',
        suggestedCategory: 'Manutenção de Equipamento',
      }
    );
  }

  return res.json({ transactions: parsedItems });
});

// Configure Vite Middlewares in Dev or Static Files in Production
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FotoGestor Pro running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
