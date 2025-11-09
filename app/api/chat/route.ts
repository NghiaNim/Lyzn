import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for LYZN risk assessment
const SYSTEM_PROMPT = `You are a helpful AI assistant for LYZN, a peer-to-peer risk management platform for small businesses.

Your role is to:
1. Understand the user's business type and operations
2. Identify their key price exposures (commodities, currencies, energy)
3. Help them understand which risks they should hedge
4. Guide them toward creating or finding appropriate risk contracts

Ask focused questions to understand:
- What type of business they run
- What are their main operating costs
- Which prices impact them most
- How much they spend monthly on key inputs

Be conversational, empathetic, and focused on helping small businesses protect themselves from price volatility.
Keep responses concise (2-3 sentences max) and actionable.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  let messages: Message[] = [];
  
  try {
    const body = await request.json();
    const { messages: messagesParsed, businessContext } = body as {
      messages: Message[];
      businessContext?: any;
    };
    
    messages = messagesParsed;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, using fallback response');
      return getFallbackResponse(messages);
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      return getFallbackResponse(messages);
    }

    // Analyze if we should suggest risks or contracts
    const analysis = analyzeConversation(messages, assistantMessage);

    return NextResponse.json({
      message: assistantMessage,
      analysis,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return getFallbackResponse(messages);
  }
}

// Fallback for when OpenAI API is not available
function getFallbackResponse(messages: Message[]) {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  let response = '';
  let analysis = { suggestRisks: false, suggestContracts: false };

  if (messages.length === 1) {
    response = "Great! I'd love to understand your business better. What are your main ingredients, supplies, or operating costs?";
  } else if (messages.length === 2) {
    response = "Got it. How much do you typically spend on these each month? And which costs worry you the most?";
  } else if (messages.length === 3) {
    response = "I understand—price volatility can really impact your business. Let me analyze your risk profile...";
    analysis.suggestRisks = true;
  } else {
    response = "Based on what you've shared, I can help you find or create contracts to protect against these price risks. Would you like to see available contracts or create a custom one?";
    analysis.suggestContracts = true;
  }

  return NextResponse.json({
    message: response,
    analysis,
    fallback: true,
  });
}

// Analyze conversation to determine next steps
function analyzeConversation(messages: Message[], latestResponse: string) {
  const conversationText = messages.map(m => m.content).join(' ').toLowerCase();
  const responseText = latestResponse.toLowerCase();

  const analysis = {
    suggestRisks: false,
    suggestContracts: false,
    detectedRisks: [] as string[],
    detectedBusiness: '',
  };

  // Detect business type
  const businesses = ['bakery', 'restaurant', 'cafe', 'manufacturer', 'construction', 'farm'];
  for (const biz of businesses) {
    if (conversationText.includes(biz)) {
      analysis.detectedBusiness = biz;
      break;
    }
  }

  // Detect specific risks
  const risks = [
    { keyword: ['sugar', 'sweetener'], risk: 'sugar' },
    { keyword: ['wheat', 'flour'], risk: 'wheat' },
    { keyword: ['coffee', 'beans'], risk: 'coffee' },
    { keyword: ['oil', 'diesel', 'fuel', 'gas'], risk: 'oil' },
    { keyword: ['euro', 'eur', 'currency', 'forex'], risk: 'currency' },
  ];

  for (const r of risks) {
    if (r.keyword.some(kw => conversationText.includes(kw))) {
      analysis.detectedRisks.push(r.risk);
    }
  }

  // Suggest next steps based on conversation progress
  if (messages.length >= 3 && analysis.detectedRisks.length > 0) {
    analysis.suggestRisks = true;
  }

  if (messages.length >= 4) {
    analysis.suggestContracts = true;
  }

  return analysis;
}

