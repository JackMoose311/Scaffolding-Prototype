import axios from 'axios';
import { config } from '../config';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Get API key at runtime, not at import time
function getApiKey(): string {
  if (!config.GROQ_API_KEY) {
    throw new Error('groq_key environment variable not set');
  }
  return config.GROQ_API_KEY;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const LEVEL_SYSTEM_PROMPTS: Record<string, string> = {
  '1-2': `You are a patient coding tutor helping students learn Turtle Graphics. 
The student is working on Level 1-2: Draw a 1x1 square to the front and left of the turtle.
Available commands: moveForward(), turnLeft()
Rules:
- Guide the student without giving the answer
- Ask clarifying questions
- Help them think through the logic
- Encourage them when they're on the right track`,

  '1-3': `You are a patient coding tutor helping students learn Turtle Graphics.
The student is working on Level 1-3: Draw a 1x1 square to the front and RIGHT using only left turns.
Available commands: moveForward(), turnLeft() (no turnRight!)
Rules:
- Guide without solving
- Help them realize multiple left turns can equal one right turn
- Ask questions to guide their thinking`,

  '1-4': `You are a patient coding tutor helping students learn Turtle Graphics.
The student is working on Level 1-4: Draw a 3x3 grid.
Available commands: moveForward(), turnLeft()
Rules:
- Guide without giving code
- Help them think about patterns and efficiency
- Ask about loops or repetition`,

  '2-2': `You are a patient coding tutor helping students learn Functions.
The student is working on Level 2-2: Define and call a turnAround() function.
Rules:
- Help them understand function syntax
- Guide them to realize turning around = 180 degrees
- Remind them functions are called before definition in this lesson`,

  '2-3': `You are a patient coding tutor helping students learn Functions.
The student is working on Level 2-3: Create a plus sign using functions.
Rules:
- Guide them through the plus structure (4 segments)
- Help them understand function calls
- Ask about how to return to the starting position`,
};

export async function getAIGuidance(
  level: string,
  userMessage: string,
  conversationHistory: AIMessage[],
  isHint: boolean = false
): Promise<string> {
  try {
    const apiKey = getApiKey();
    const systemPrompt = LEVEL_SYSTEM_PROMPTS[level] || 'You are a helpful coding tutor.';

    const enhancedSystemPrompt = isHint
      ? `${systemPrompt}\n\nIMPORTANT: The student asked for a hint. Provide ONE specific, focused hint that helps them move forward without giving away the solution.`
      : systemPrompt;

    const messages: AIMessage[] = [
      { role: 'system', content: enhancedSystemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Groq API error:', error.response?.data || error.message);
    
    // Fallback response when API fails
    if (error.response?.data?.error?.code === 'insufficient_quota') {
      return 'The AI guidance service is currently unavailable due to usage limits. However, remember the key concepts: think about the geometry of what you\'re drawing, test your code step by step, and don\'t be afraid to experiment. You\'re on the right track!';
    }
    
    throw new Error(
      error.response?.data?.error?.message || 'Failed to get AI guidance'
    );
  }
}

export async function getInitialTips(level: string): Promise<string> {
  try {
    const apiKey = getApiKey();
    const tipPrompts: Record<string, string> = {
      '1-2': `Provide a brief welcome and 3-4 key tips for Level 1-2 (drawing a 1x1 square to the front and left).
      Focus on: understanding a square's geometry, using the available commands efficiently.
      Keep it concise and encouraging. End with "Ready? Send your code and I'll guide you!"`,

      '1-3': `Provide a brief welcome and 3-4 key tips for Level 1-3 (drawing a square to the front and RIGHT using only left turns).
      Focus on: the challenge of no right turns, thinking about turning angles.
      Keep it concise. End with "Send your code when ready!"`,

      '1-4': `Provide a brief welcome and 3-4 key tips for Level 1-4 (drawing a 3x3 grid).
      Focus on: grid structure, efficiency, possibly loops/patterns.
      Keep it concise. End with "Ready? Share your code!"`,

      '2-2': `Provide a brief welcome and 3-4 key tips for Level 2-2 (defining a turnAround function).
      Focus on: function syntax, the goal of turning 180 degrees, remember to call before defining.
      Keep it concise. End with "Send your code to get started!"`,

      '2-3': `Provide a brief welcome and 3-4 key tips for Level 2-3 (creating a plus sign with functions).
      Focus on: plus structure (4 segments), function usage, returning to start.
      Keep it concise. End with "Share your code!"`,
    };

    const prompt = tipPrompts[level] || `Give tips for Code.org level ${level} without solving it.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an encouraging coding tutor. Provide practical tips for learning to code.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 400,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Groq API error for tips:', error.response?.data || error.message);
    
    // Fallback tips when API fails
    const fallbackTips: Record<string, string> = {
      '1-2': 'Welcome to Turtle Graphics! Draw a 1x1 square to the front and left. Available commands: moveForward() and turnLeft(). Think about how many sides a square has and how many turns you need. Ready? Send your code and I\'ll guide you!',
      '1-3': 'Great! Now draw a 1x1 square to the front and RIGHT using only left turns. Available: moveForward() and turnLeft(). Consider how multiple left turns can equal one right turn. Send your code when ready!',
      '1-4': 'Draw a 3x3 grid using moveForward() and turnLeft(). Think about the grid structure and look for patterns. Ready? Share your code!',
      '2-2': 'Define a turnAround() function that rotates the turtle 180 degrees. Remember: functions are called before they are defined in this lesson. Send your code to get started!',
      '2-3': 'Create a plus sign centered at your starting position using functions. A plus has 4 segments. Share your code!',
    };

    return fallbackTips[level] || 'Welcome! Send your code and I\'ll provide guidance.';
  }
}
