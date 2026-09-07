'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateQuestionWithAI(category: string, existingQuestions: string[] = []) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: 'Gemini API key is not configured.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const categoryPrompts: Record<string, string> = {
      fun: 'Icebreakers & Fun (Làm quen & Vui vẻ): light-hearted questions to spark a smile or funny memories.',
      deep: 'Deep Connection (Gắn kết sâu sắc): deep, meaningful questions to understand each other on a deeper level.',
      future: 'Future Goals (Kế hoạch tương lai): questions about future aspirations, relationship goals, and building a life together.',
      spicy: 'Spicy Secrets (Thử thách Bí mật): slightly bold, romantic, or intimate questions for couples.'
    };

    const categoryDescription = categoryPrompts[category] || 'Questions for couples to improve their relationship.';
    
    // Convert existing to a short list so AI doesn't duplicate
    const avoidList = existingQuestions.slice(0, 10).map(q => `- ${q}`).join('\n');

    const prompt = `
You are an expert relationship coach creating engaging questions for a couple's web app called "The Relationship Journey".
Generate exactly ONE unique, engaging, and thoughtful question for the category: ${categoryDescription}.

IMPORTANT: Do not duplicate any of these recently asked questions:
${avoidList}

Format your response strictly as a JSON object with two keys: 'en' (English version) and 'vi' (Vietnamese version).
DO NOT include markdown formatting or backticks (like \`\`\`json). Just return the raw JSON object.

Example output:
{
  "en": "What is your most cherished memory of us?",
  "vi": "Kỷ niệm nào của chúng ta mà bạn trân trọng nhất?"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean up potential markdown blocks if AI ignored instructions
    const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();

    try {
      const json = JSON.parse(cleanedText);
      if (json.en && json.vi) {
        return { data: json };
      } else {
        throw new Error('Invalid JSON structure from AI');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', cleanedText);
      return { error: 'AI generated invalid format. Please try again.' };
    }
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return { error: `Failed to generate: ${error?.message || String(error)}` };
  }
}
