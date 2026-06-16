const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/metatags/generate
 * Generates highly engaging Meta Title and Meta Description using Gemini 2.5 Flash
 */
exports.generateMetaTags = async (req, res) => {
  try {
    const { focus_topic, content_brief } = req.body;

    if (!focus_topic || !content_brief) {
      return res.status(400).json({ message: 'Judul/Topik dan Deskripsi Singkat diperlukan.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an Expert SEO Copywriter. Based on the following focus topic and content brief, generate one highly engaging Meta Title (aiming for 50-60 characters) and one Meta Description (aiming for 150-160 characters) designed to maximize CTR in Google SERPs.

Focus Topic: "${focus_topic}"
Content Brief: "${content_brief}"

You MUST respond with ONLY a valid JSON object. Do NOT wrap it in markdown code blocks or add any extra text. The JSON must follow this exact structure:

{
  "meta_title": "string",
  "meta_description": "string"
}

Important rules:
- The text MUST be in Indonesian (Bahasa Indonesia) if the input seems targeted to Indonesian audiences, or English if the input is English. Match the language of the input.
- "meta_title" should be extremely compelling, include the focus topic, and be around 50-60 characters long.
- "meta_description" should include a strong call-to-action (CTA), naturally incorporate the topic, and be around 150-160 characters long.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

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

    const tags = JSON.parse(cleaned);

    res.json({
      meta_title: tags.meta_title,
      meta_description: tags.meta_description,
    });
  } catch (error) {
    console.error('Error generating meta tags:', error);

    if (
      error.status === 429 ||
      error.status === 503 ||
      error.message?.includes('429') ||
      error.message?.includes('503') ||
      error.message?.includes('Resource has been exhausted') ||
      error.message?.includes('overloaded')
    ) {
      return res.status(503).json({
        message: 'Trafik AI sedang sibuk, silakan coba lagi.',
      });
    }

    if (error instanceof SyntaxError) {
      return res.status(502).json({
        message: 'Gagal memproses respons AI. Silakan coba lagi.',
      });
    }

    res.status(500).json({ message: 'Terjadi kesalahan saat menghasilkan meta tags.' });
  }
};

/**
 * POST /api/metatags/save
 * Saves the finalized meta tags to the task_metatags table.
 */
exports.saveMetaTags = async (req, res) => {
  try {
    const { task_id, meta_title, meta_description } = req.body;
    const workspaceId = req.user.workspace_id;

    if (!task_id || !meta_title || !meta_description) {
      return res.status(400).json({ message: 'Task ID, Meta Title, dan Meta Description diperlukan.' });
    }

    // Verify the task belongs to this workspace
    const [taskCheck] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND workspace_id = ?',
      [task_id, workspaceId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan di workspace ini.' });
    }

    // Insert or update (ON DUPLICATE KEY UPDATE)
    await pool.query(
      `INSERT INTO task_metatags (task_id, meta_title, meta_description) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_description = VALUES(meta_description)`,
      [task_id, meta_title, meta_description]
    );

    res.json({ message: 'Meta Tags berhasil disimpan ke tugas.' });
  } catch (error) {
    console.error('Error saving meta tags:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan Meta Tags.' });
  }
};
