import { Mode } from './useKiviInput';
import { transformLocally } from './components/styles/StylesData';

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

export async function transformText(rawText: string, mode: Mode, degree: number): Promise<string> {
  if (!rawText.trim()) return '';

  let customRule = '';
  try {
    const savedRules = localStorage.getItem('whispurr_context_custom_rules');
    if (savedRules) {
      const rules = JSON.parse(savedRules);
      customRule = rules[mode] || '';
    }
  } catch (e) {}

  // If no API key is provided, use the instant local transformer
  if (!API_KEY) {
    return transformLocally(rawText, mode, 50, 50, customRule);
  }

  const systemPrompt = `You are WhisPURR, an invisible translation layer. Your job is to translate the user's raw dictated speech into perfectly formatted digital output based on the provided Mode and Degree script.
Styles & Output Intentions:
- Professional / Formal: Clear, polished, work-appropriate, confident.
- Casual: Natural, conversational, relaxed.
- Concise: Shorter, tighter, straight to the point.
- Warm: Friendly without being overly formal, empathetic and supportive.
- Technical / Developer: Preserve technical meaning, terminology, architecture names, code markdown, and syntax structure.
- Prompts: Clear, structured, optimized for AI models with constraints.
- Meeting Notes: Highly structured, bulleted summarization of the conversation.

${customRule ? `Strict Custom Rules for ${mode}:\n"${customRule}"\nYou MUST strictly follow these custom rules.` : ''}

Degree Scripting (IMPORTANT):
- Degree 1 (Roman): The output MUST be in the English alphabet (Romanized). If translating from another language, spell out the words phonetically using A-Z.
- Degree 2 (Native): The output MUST be in the Native Script corresponding to the language being spoken. (e.g., Devanagari for Hindi, Gujarati script for Gujarati).

Do not output any conversational filler like "Here is your text". Just output the final translated text directly.`;

  const userPrompt = `Style Intention: ${mode}\nDegree: ${degree} (${degree === 1 ? 'Roman Script' : 'Native Script'})\nRaw Speech: "${rawText}"\n\nTranslate this perfectly:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.warn("Gemini API Error, falling back to local transformer:", data.error);
      return transformLocally(rawText, mode);
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || transformLocally(rawText, mode);
  } catch (error: any) {
    console.warn("Network Error, falling back to local transformer:", error);
    return transformLocally(rawText, mode);
  }
}
