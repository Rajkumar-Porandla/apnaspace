const { GoogleGenAI } = require('@google/genai');

let aiClient = null;
let isMockAI = false;

const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiKey });
    console.log('Gemini AI Service initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini AI SDK client:', error.message);
    isMockAI = true;
  }
} else {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables. EstateAI will fall back to standard rule-based parsing and mock descriptions.');
  isMockAI = true;
}

module.exports = {
  aiClient,
  isMockAI,
  modelName: 'gemini-1.5-flash'
};
