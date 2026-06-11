import 'dotenv/config';
import genAI from '../config/gemini.js';

async function run() {
  try {
    console.log('Fetching available models using your API key...\n');
    // Using the REST API client method or direct fetch to get models
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in env.');
      return;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error('API Error:', data.error.message);
      return;
    }

    console.log('Supported Models:');
    console.log('=================');
    data.models.forEach(model => {
      console.log(`- ${model.name.replace('models/', '')}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Description: ${model.description}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('-----------------');
    });

  } catch (error) {
    console.error('Error listing models:', error);
  }
}

run();
