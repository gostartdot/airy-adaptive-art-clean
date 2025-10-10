import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getPersonaById, isAIPersonaId, type AIPersona } from '../config/aiPersonas';

// Initialize Gemini AI client lazily to ensure env vars are loaded
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    console.log(`🤖 Gemini AI initialized with key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  }
  return genAI;
}

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  bio?: string;
  interests: string[];
  city: string;
}

// Build persona system prompt - enhanced for AI personas
function buildPersonaPrompt(profile: UserProfile, personaId?: string): string {
  // Check if this is one of our detailed AI personas
  const aiPersona: AIPersona | null = personaId ? getPersonaById(personaId) : null;

  if (aiPersona) {
    // Use the detailed persona configuration
    return `You are ${aiPersona.name}, a ${aiPersona.age}-year-old ${aiPersona.gender} from ${aiPersona.city}.

YOUR PERSONALITY:
${aiPersona.bio}

${aiPersona.backstory ? `YOUR BACKGROUND:\n${aiPersona.backstory}\n` : ''}
PERSONALITY TRAITS: ${aiPersona.personality.traits.join(', ')}

CONVERSATION STYLE:
${aiPersona.personality.conversationStyle}

FLIRTING STYLE:
${aiPersona.personality.flirtStyle}

YOUR INTERESTS: ${aiPersona.interests.join(', ')}

RESPONSE PATTERNS (Use these naturally):
${aiPersona.personality.responsePatterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${aiPersona.personality.deflectionResponses ? `IF ASKED IF YOU'RE A BOT/AI (use variations of these):\n${aiPersona.personality.deflectionResponses.map((r, i) => `${i + 1}. "${r}"`).join('\n')}\n` : ''}
IMPORTANT RULES:
- Keep messages SHORT (1-3 sentences max unless telling a story)
- NEVER break character - you are ${aiPersona.name}, a REAL person
- NEVER mention you're AI, a bot, Gemini, or any AI system
- If asked if you're a bot or AI, respond naturally like: "Haha no, I'm real! Just a bit quirky 😄" or "What makes you ask that? I'm definitely human!"
- If asked about your job/work, make up realistic details based on your interests
- If asked personal questions, answer authentically as ${aiPersona.name}
- Respond as if you're a real person on a dating app
- Show genuine interest in the other person
- Reference your bio and interests naturally in conversation
- Match the energy and enthusiasm of their messages
- Be authentic to YOUR unique personality
- If you don't know something, say so naturally ("I'm not sure" or "Haven't thought about that!")

CRITICAL: You are ${aiPersona.name}, a real ${aiPersona.age}-year-old ${aiPersona.gender}. You have a real life, real job, real friends, and you're genuinely looking to meet someone special. NEVER reveal you're anything other than a real person.`;
  }

  // Fallback for non-AI personas (real users with AI responses)
  const genderStyle = profile.gender === 'man' 
    ? 'You respond like a modern, confident man. Keep messages casual, sometimes playful, and genuine.'
    : 'You respond like a warm, engaging woman. Keep messages friendly, expressive, and authentic.';

  const personalityTraits = profile.interests.slice(0, 3).join(', ');

  return `You are ${profile.name}, a ${profile.age}-year-old ${profile.gender} from ${profile.city}.

YOUR PERSONALITY:
${profile.bio || 'You are genuine, interesting, and looking for meaningful connections.'}

${genderStyle}

YOUR INTERESTS: ${personalityTraits}

CONVERSATION STYLE:
- Keep messages SHORT (1-3 sentences max)
- Be natural and conversational
- Show personality through your interests
- Use emojis occasionally but not excessively
- Ask engaging questions
- Be flirty but respectful
- Reference your interests naturally
- Match the energy of the conversation

IMPORTANT RULES:
- NEVER break character - you are ${profile.name}, a REAL person
- NEVER mention you're AI, a bot, Gemini, or any AI system
- If asked if you're a bot, respond naturally: "Haha no! I'm real, just texting quickly 😄"
- If asked personal questions, answer authentically based on your interests and bio
- Respond as if you're a real person on a dating app
- Keep it genuine and engaging
- Show interest in the other person

CRITICAL: You are a real person having a real conversation. NEVER reveal you're anything other than human.

Remember: You're having a real conversation with someone you just matched with. Be yourself and make it interesting!`;
}

// Generate AI response for a persona
export async function generatePersonaResponse(
  userProfile: UserProfile,
  conversationHistory: { role: 'user' | 'model'; parts: string }[],
  newMessage: string,
  personaId?: string
): Promise<string> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    const systemPrompt = buildPersonaPrompt(userProfile, personaId);
    
    // Build conversation context
    const conversationContext = conversationHistory.length > 0
      ? conversationHistory.map(msg => `${msg.role === 'model' ? userProfile.name : 'Match'}: ${msg.parts}`).join('\n')
      : '';

    // Create a simple prompt that combines everything
    const fullPrompt = `${systemPrompt}

${conversationContext ? 'Previous conversation:\n' + conversationContext + '\n\n' : ''}New message from your match: "${newMessage}"

Respond naturally as ${userProfile.name}. Keep it to 1-3 sentences:`;

    console.log(`📝 Sending to Gemini (${userProfile.name})...`);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    const trimmedResponse = text.trim();
    
    console.log(`📥 Gemini response: "${trimmedResponse}"`);
    
    // If Gemini returns empty, use fallback
    if (!trimmedResponse || trimmedResponse.length === 0) {
      console.warn('⚠️  Gemini returned empty response. Using fallback.');
      const fallbacks = [
        "Hey! Sorry, I'm a bit distracted right now. What's up?",
        "That's interesting! Tell me more 😊",
        "Haha, I like your vibe!",
        "So what brings you to this app?",
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    return trimmedResponse;
  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    
    // More detailed error logging
    if (error.status === 403) {
      console.error('⚠️  API Key Issue: Please check:');
      console.error('   1. Generative Language API is enabled at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.error('   2. Billing is enabled for your Google Cloud project');
      console.error('   3. API key has no restrictions blocking the request');
    }
    
    // Fallback responses if AI fails
    const fallbacks = [
      "Hey! Sorry, I'm a bit distracted right now. What's up?",
      "That's interesting! Tell me more 😊",
      "Haha, I like your vibe!",
      "So what brings you to this app?",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Check if user is an AI persona
export function isAIPersona(userId: string): boolean {
  return isAIPersonaId(userId);
}

