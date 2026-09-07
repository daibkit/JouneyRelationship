import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  console.log("Key starting with:", process.env.GEMINI_API_KEY?.substring(0, 10));
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const result = await model.generateContent("Say hello in JSON format { 'en': 'Hello' }");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
