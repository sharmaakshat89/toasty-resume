// lib/ai.js
export async function generateResumeAI(prompt, systemInstruction) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  // List of free fallback models to try in order
  const models = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'nvidia/nemotron-3-nano-30b-a3b:free', // Confirmed working with system prompts
    'nvidia/nemotron-3-super-120b-a12b:free',
    'minimax/minimax-m2.5:free',
    'qwen/qwen3-coder:free',
    'openrouter/free'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting AI generation with model: ${model}`);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Tech Resume Generator'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ]
        })
      });
      
      const data = await res.json();
      
      if (data.choices && data.choices[0]) {
        console.log(`Successfully generated using model: ${model}`);
        return data.choices[0].message.content;
      } else {
        const errorMessage = data.error?.message || 'Unknown API Error';
        const rawError = data.error?.metadata?.raw || '';
        console.warn(`Model ${model} failed: ${errorMessage} - ${rawError}`);
        lastError = new Error(`AI generation failed with ${model}: ${errorMessage} - ${rawError}`);
        // Continue to the next model
      }
    } catch (e) {
      console.warn(`Fetch error for model ${model}: ${e.message}`);
      lastError = e;
      // Continue to the next model
    }
  }

  // If we reach here, all models failed
  console.error('All fallback models failed. Last error:', lastError);
  throw lastError || new Error('All AI models failed');
}