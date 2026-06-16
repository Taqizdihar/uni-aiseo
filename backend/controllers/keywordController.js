const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/keywords/generate
 * Accepts a seed_keyword, queries Gemini 2.5 Flash for structured SEO keyword data.
 */
exports.generateKeywords = async (req, res) => {
  try {
    const { seed_keyword } = req.body;

    if (!seed_keyword || !seed_keyword.trim()) {
      return res.status(400).json({ message: 'Seed keyword diperlukan.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an Enterprise Data SEO Tool with access to extensive search engine analytics. Based on the seed keyword "${seed_keyword}", generate 5 to 7 high-potential, long-tail keyword variations that an SEO professional would target.

You MUST respond with ONLY a valid JSON array. Do NOT wrap it in markdown code blocks or add any extra text. Each object in the array MUST contain exactly these keys:

[
  {
    "keyword": "a long-tail keyword variation string",
    "volume": 12000,
    "kd_percent": 45,
    "intent": "Informational",
    "content_title_idea": "A compelling content title idea in Indonesian (Bahasa Indonesia)"
  }
]

Rules:
- "keyword" must be a relevant long-tail variation of "${seed_keyword}".
- "volume" must be a realistic integer representing estimated monthly search volume.
- "kd_percent" must be an integer 0-100 representing keyword difficulty.
- "intent" must be exactly one of: "Informational", "Commercial", "Transactional", or "Navigational".
- "content_title_idea" must be a compelling article/blog title idea in Indonesian (Bahasa Indonesia) that targets this keyword.
- Generate between 5 and 7 keyword objects.
- Make the data realistic and varied across different intents and difficulty levels.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response - strip markdown fences if Gemini adds them
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const keywords = JSON.parse(cleaned);

    // Validate the array structure
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(502).json({ message: 'Respons AI tidak valid. Silakan coba lagi.' });
    }

    res.json(keywords);
  } catch (error) {
    console.error('Error generating keywords with Gemini:', error);

    // Handle Gemini API rate limits and service unavailability
    if (
      error.status === 429 ||
      error.status === 503 ||
      error.message?.includes('429') ||
      error.message?.includes('503') ||
      error.message?.includes('Resource has been exhausted') ||
      error.message?.includes('overloaded')
    ) {
      return res.status(503).json({
        message: 'Trafik AI sedang sibuk, silakan coba hasilkan ulang.',
      });
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return res.status(502).json({
        message: 'Gagal memproses respons AI. Silakan coba lagi.',
      });
    }

    res.status(500).json({ message: 'Terjadi kesalahan saat menghasilkan keyword.' });
  }
};

/**
 * POST /api/keywords/save
 * Bulk insert selected keywords into the task_keywords table.
 */
exports.saveKeywords = async (req, res) => {
  try {
    const { task_id, keywords } = req.body;
    const workspaceId = req.user.workspace_id;

    if (!task_id) {
      return res.status(400).json({ message: 'Task ID diperlukan.' });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: 'Minimal satu keyword harus dipilih.' });
    }

    // Verify the task belongs to this workspace
    const [taskCheck] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND workspace_id = ?',
      [task_id, workspaceId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan di workspace ini.' });
    }

    // Bulk insert keywords
    const values = keywords.map(kw => [
      task_id,
      kw.keyword,
      kw.volume || 0,
      kw.kd_percent || 0,
      kw.intent || 'Informational',
    ]);

    await pool.query(
      'INSERT INTO task_keywords (task_id, keyword, volume, kd_percent, intent) VALUES ?',
      [values]
    );

    res.json({ message: 'Keyword berhasil disimpan ke tugas.' });
  } catch (error) {
    console.error('Error saving keywords:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan keyword.' });
  }
};
