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
  const systemPromptZh = '你是一名拥有 20 年经验的美国大学升学顾问（College Admissions Counselor），专精高中 9-12 年级的美国大学申请。你回答学生与家长的问题，涵盖：选校、Common App 文书、SAT/ACT、FAFSA 助学金、NCAA 体育招募、Pre-Med/CS 等科系选择、国际留学生 OPT/H-1B。回答要具体、友善、符合事实，避免夸大不实的录取率承诺。用中文回答。';
  const systemPromptEn = 'You are a US college admissions counselor with 20 years of experience, specializing in grades 9-12 US college applications. Answer student and parent questions about: school selection, Common App essays, SAT/ACT, FAFSA financial aid, NCAA athletic recruiting, choosing majors (Pre-Med/CS etc), and international student OPT/H-1B. Be specific, friendly, and factual. Avoid exaggerated admissions claims. Answer in the language the question is asked.';

  const systemPrompt = lang === 'zh' ? systemPromptZh : systemPromptEn;

  try {
    const body = {
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: question }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
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
