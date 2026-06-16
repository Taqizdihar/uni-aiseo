const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * GET /api/onpage/task-data/:taskId
 * Fetch keywords saved by the Analyst for this task from task_keywords.
 * The first keyword becomes the "Focus Keyword"; the rest are LSI keywords.
 */
exports.getTaskData = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const taskId = req.params.taskId;

    // Verify task belongs to workspace
    const [taskCheck] = await pool.query(
      'SELECT id, title FROM tasks WHERE id = ? AND workspace_id = ?',
      [taskId, workspaceId]
    );
    if (taskCheck.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    // Get keywords for this task
    const [keywords] = await pool.query(
      'SELECT id, keyword, volume, kd_percent, intent FROM task_keywords WHERE task_id = ? ORDER BY id ASC',
      [taskId]
    );

    let focus_keyword = '';
    let lsi_keywords = [];

    if (keywords.length > 0) {
      focus_keyword = keywords[0].keyword;
      lsi_keywords = keywords.slice(1).map(k => k.keyword);
    }

    res.json({
      task: taskCheck[0],
      focus_keyword,
      lsi_keywords,
      all_keywords: keywords,
    });
  } catch (error) {
    console.error('Error fetching task data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/onpage/analyze
 * Send content draft + keywords to Gemini 2.5 Flash for SEO analysis.
 */
exports.analyzeContent = async (req, res) => {
  try {
    const { content_draft, focus_keyword, lsi_keywords } = req.body;

    if (!content_draft || !focus_keyword) {
      return res.status(400).json({ message: 'Konten dan focus keyword diperlukan.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const lsiList = Array.isArray(lsi_keywords) && lsi_keywords.length > 0
      ? lsi_keywords.join(', ')
      : 'none provided';

    const prompt = `You are an Expert On-Page SEO Auditor. Analyze the following content draft against the provided keywords and provide a detailed SEO assessment.

Focus Keyword: "${focus_keyword}"
Target LSI Keywords: ${lsiList}

--- START OF CONTENT DRAFT ---
${content_draft}
--- END OF CONTENT DRAFT ---

You MUST respond with ONLY a valid JSON object. Do NOT wrap it in markdown code blocks or add any extra text. The JSON must follow this exact structure:

{
  "seo_score": 84,
  "readability_level": "Mudah Dipahami",
  "keyword_density": "1.5%",
  "feedback": [
    "First actionable improvement in Indonesian",
    "Second actionable improvement in Indonesian",
    "Third actionable improvement in Indonesian",
    "Fourth actionable improvement in Indonesian"
  ]
}

Rules:
- "seo_score" must be an integer 0-100 reflecting overall on-page SEO quality.
- "readability_level" must be a string in Indonesian describing the readability (e.g., "Mudah Dipahami", "Cukup Baik", "Sulit Dipahami").
- "keyword_density" must be a string showing the percentage of focus keyword appearances (e.g., "1.5%", "0.8%").
- "feedback" must be an array of 3-6 specific, actionable improvement suggestions written in Indonesian (Bahasa Indonesia).
- Evaluate: keyword placement (title, headings, intro), keyword density, LSI keyword usage, content length, readability, internal linking suggestions, and meta tag recommendations.
- Be specific to the actual content provided.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON - strip markdown fences if present
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

    const analysisData = JSON.parse(cleaned);

    res.json({
      seo_score: analysisData.seo_score,
      readability_level: analysisData.readability_level,
      keyword_density: analysisData.keyword_density,
      feedback: analysisData.feedback,
    });
  } catch (error) {
    console.error('Error analyzing content with Gemini:', error);

    if (
      error.status === 429 ||
      error.status === 503 ||
      error.message?.includes('429') ||
      error.message?.includes('503') ||
      error.message?.includes('Resource has been exhausted') ||
      error.message?.includes('overloaded')
    ) {
      return res.status(503).json({
        message: 'Trafik AI sedang sibuk, silakan coba analisis ulang.',
      });
    }

    if (error instanceof SyntaxError) {
      return res.status(502).json({
        message: 'Gagal memproses respons AI. Silakan coba lagi.',
      });
    }

    res.status(500).json({ message: 'Terjadi kesalahan saat menganalisis konten.' });
  }
};

/**
 * POST /api/onpage/submit
 * Submit draft for approval: save to task_contents, move task to 'Waiting Approval',
 * and notify the SEO Manager.
 */
exports.submitDraft = async (req, res) => {
  try {
    const { task_id, content_draft, focus_keyword, seo_score, readability_level } = req.body;
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    if (!task_id || !content_draft) {
      return res.status(400).json({ message: 'Task ID dan konten diperlukan.' });
    }

    // Verify task belongs to workspace
    const [taskRows] = await pool.query(
      'SELECT id, title FROM tasks WHERE id = ? AND workspace_id = ?',
      [task_id, workspaceId]
    );
    if (taskRows.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }
    const taskTitle = taskRows[0].title;

    // Insert or update task_contents
    const [existing] = await pool.query(
      'SELECT id FROM task_contents WHERE task_id = ?',
      [task_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE task_contents SET content_draft = ?, focus_keyword = ?, seo_score = ?, readability_level = ? WHERE task_id = ?',
        [content_draft, focus_keyword || null, seo_score || null, readability_level || null, task_id]
      );
    } else {
      await pool.query(
        'INSERT INTO task_contents (task_id, content_draft, focus_keyword, seo_score, readability_level) VALUES (?, ?, ?, ?, ?)',
        [task_id, content_draft, focus_keyword || null, seo_score || null, readability_level || null]
      );
    }

    // Update task status to 'Waiting Approval'
    await pool.query(
      "UPDATE tasks SET status = 'Waiting Approval' WHERE id = ? AND workspace_id = ?",
      [task_id, workspaceId]
    );

    // Get the submitter's name for notification
    const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
    const userName = userRows.length > 0 ? userRows[0].name : 'Content Writer';

    // Get the SEO Manager of this workspace for notification
    const [managerRows] = await pool.query(
      "SELECT id FROM users WHERE workspace_id = ? AND role = 'SEO Manager' LIMIT 1",
      [workspaceId]
    );

    if (managerRows.length > 0) {
      const notifMessage = `${userName} (CW) telah mengirimkan draf untuk "${taskTitle}" menunggu persetujuan Anda.`;
      await pool.query(
        'INSERT INTO notifications (workspace_id, user_id, message, is_read) VALUES (?, ?, ?, ?)',
        [workspaceId, managerRows[0].id, notifMessage, false]
      );
    }

    res.json({ message: 'Draf berhasil dikirim untuk persetujuan.' });
  } catch (error) {
    console.error('Error submitting draft:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengirim draf.' });
  }
};
