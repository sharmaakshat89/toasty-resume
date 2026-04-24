export async function generateResumeAI(prompt, systemInstruction) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]
    })
  });
  
  const data = await res.json();
  if (!data.choices || !data.choices[0]) {
    console.error('AI API Error:', data);
    const errorMessage = data.error?.message || 'Unknown API Error';
    throw new Error(`AI generation failed: ${errorMessage}`);
  }
  return data.choices[0].message.content;
}