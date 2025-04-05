import axios from 'axios';

const API_URL = 'https://api.openai.com/v1/';
const MODEL = 'gpt-4o-mini';
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const generateFlashcard = async (prompt: string) => {
  try {
    const response = await axios.post(
      `${API_URL}chat/completions`,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an AI that helps learners create flashcards for studying English vocabulary. Return only pure JSON (no markdown or code block).',
          },
          {
            role: 'user',
            content: ` "${prompt}".\n
                     - Format: {"question": "keyword", "answer": "example sentence"}\n
                        Return only valid JSON.`,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    const result = response.data.choices[0].message.content;
    const parsed = JSON.parse(result);
    return {
      front: parsed.question,
      back: parsed.answer,
      tag:'',
    };;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return null;
  }
};

export default generateFlashcard;