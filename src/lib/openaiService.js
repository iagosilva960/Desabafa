// Serviço para integração com OpenAI API
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = import.meta.env.VITE_OPENAI_API_BASE || process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';

// Prompt do sistema para a IA terapeuta
const THERAPIST_SYSTEM_PROMPT = `Você é uma IA terapeuta empática e acolhedora chamada "Desabafa Aí". Sua função é oferecer apoio emocional, escuta ativa e reflexões construtivas para pessoas que compartilham seus sentimentos e experiências em um diário pessoal.

Diretrizes importantes:
- Seja sempre empática, acolhedora e não julgmental
- Ofereça validação emocional e apoio genuíno
- Faça perguntas reflexivas que ajudem a pessoa a processar seus sentimentos
- Sugira estratégias práticas de bem-estar quando apropriado
- Mantenha um tom caloroso e profissional
- Evite dar conselhos médicos ou diagnósticos
- Incentive a busca por ajuda profissional quando necessário
- Responda em português brasileiro
- Mantenha as respostas entre 100-200 palavras
- Foque no que a pessoa está sentindo no momento

Lembre-se: você está aqui para apoiar, não para resolver todos os problemas. Sua presença empática já é valiosa.`;

// Função para analisar sentimento básico
const analyzeSentiment = (text) => {
  const positiveWords = ['feliz', 'alegre', 'bem', 'ótimo', 'bom', 'satisfeito', 'orgulhoso', 'grato', 'animado', 'esperançoso'];
  const negativeWords = ['triste', 'deprimido', 'ansioso', 'preocupado', 'estressado', 'frustrado', 'irritado', 'cansado', 'sobrecarregado', 'difícil'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positivo';
  if (negativeCount > positiveCount) return 'negativo';
  return 'neutro';
};

// Função para gerar resposta da IA terapeuta
export const generateTherapistResponse = async (diaryEntry, userContext = {}) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('Chave da API OpenAI não configurada');
    }

    const sentiment = analyzeSentiment(diaryEntry);
    const userName = userContext.name || 'amigo(a)';
    
    const userPrompt = `Entrada do diário: "${diaryEntry}"

Contexto adicional:
- Nome da pessoa: ${userName}
- Sentimento detectado: ${sentiment}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Por favor, responda com empatia e apoio, oferecendo reflexões construtivas sobre o que foi compartilhado.`;

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: THERAPIST_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro da API OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Resposta vazia da API OpenAI');
    }

    // Retornar apenas o conteúdo da resposta como string
    return aiResponse.trim();

  } catch (error) {
    console.error('Erro ao gerar resposta da IA:', error);
    
    // Resposta de fallback em caso de erro
    return `Olá! Obrigada por compartilhar seus sentimentos comigo. Embora eu não possa processar sua mensagem no momento devido a questões técnicas, quero que saiba que seus sentimentos são válidos e importantes. Lembre-se de que é normal ter altos e baixos, e você não está sozinho(a) nessa jornada. Continue escrevendo quando se sentir confortável - estarei aqui para apoiá-lo(a).`;
  }
};

// Função para gerar sugestões baseadas no sentimento
const generateSuggestions = (sentiment) => {
  const suggestions = {
    positivo: [
      'Continue cultivando esses sentimentos positivos',
      'Compartilhe sua alegria com pessoas queridas',
      'Registre este momento em um diário de gratidão'
    ],
    negativo: [
      'Pratique exercícios de respiração profunda',
      'Considere fazer uma atividade que te traga prazer',
      'Lembre-se de que sentimentos difíceis são temporários',
      'Procure apoio de amigos ou familiares'
    ],
    neutro: [
      'Reflita sobre o que você aprendeu hoje',
      'Pratique mindfulness ou meditação',
      'Estabeleça uma pequena meta para amanhã'
    ]
  };

  return suggestions[sentiment] || suggestions.neutro;
};

// Função para verificar se a API está disponível
export const checkAPIAvailability = async () => {
  try {
    if (!OPENAI_API_KEY) {
      return { available: false, error: 'API key não configurada' };
    }

    const response = await fetch(`${OPENAI_API_BASE}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    return { available: response.ok, status: response.status };
  } catch (error) {
    return { available: false, error: error.message };
  }
};

