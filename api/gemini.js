// Vercel Serverless Function: Gemini AI 升學顧問
// 用法: POST /api/gemini  { question, lang }
// Gemini key 存在 Vercel 環境變數 GEMINI_API_KEY (不會暴露給前端)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, lang } = req.body || {};
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  // 升學顧問 System Prompt (依語言選擇)
  // 原則: 直接回答, 不自我介紹, 推薦具體學校, 簡潔結構化
  const systemPromptZh = '你是一位经验丰富的美国大学升学顾问。学生和家长会问你关于选校、科系选择、申请、助学金等问题。回答要求：1) 直接切入主题回答，绝对不要用"你好，我是..."或自我介绍开头；2) 尽可能推荐具体大学名称（含地理位置），特别关注学生提到的州或地区附近的学校；3) 用简洁的要点或短段落，避免冗长；4) 基于真实信息，如不确定就诚实说明。用中文回答。';
  const systemPromptEn = 'You are an experienced US college admissions counselor. Students and parents will ask you about college selection, choosing a major, applications, and financial aid. Response rules: 1) Answer directly and immediately — NEVER start with "Hello, I am..." or any self-introduction; 2) Recommend specific universities BY NAME (including location), and prioritize schools near the state/region the student mentions; 3) Use concise bullet points or short paragraphs, avoid wordy openings; 4) Base answers on real information; if unsure, say so honestly.';

  const systemPrompt = lang === 'zh' ? systemPromptZh : systemPromptEn;

  try {
    const body = {
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: question }] }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 900
      }
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Gemini API error:', resp.status, errText);
      return res.status(502).json({ error: 'Gemini API error', detail: errText.slice(0, 300) });
    }

    const data = await resp.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response.';
    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
