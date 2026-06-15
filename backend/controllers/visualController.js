const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/visual/analyze
 * Accepts a single image upload, sends it to Gemini 1.5 Flash for multimodal analysis,
 * and returns structured SEO/UX audit feedback as JSON.
 */
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' });
    }

    // Read the uploaded file from disk and convert to base64
    const filePath = req.file.path;
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct the prompt
    const prompt = `You are an Expert SEO & UX Auditor. Analyze the provided image (which is a website screenshot, mockup, or marketing design) and provide a detailed assessment.

You MUST respond with ONLY a valid JSON object. Do NOT wrap it in markdown code blocks or add any extra text. The JSON must follow this exact structure:

{
  "text_ratio": "A string describing the text-to-image ratio percentage and quality, e.g., '18% (Optimal)' or '45% (Terlalu Banyak Teks)'",
  "readability": "A string with a score out of 100 and a quality label, e.g., '92/100 (Sangat Baik)' or '65/100 (Perlu Perbaikan)'",
  "contrast_score": "A string describing the color contrast assessment, e.g., 'Baik (Semua elemen memenuhi standar WCAG AA)' or 'Perlu Perbaikan (Kontras teks Header dengan latar belakang gelap sedikit rendah)'",
  "recommendations": [
    "First actionable recommendation in Indonesian",
    "Second actionable recommendation in Indonesian",
    "Third actionable recommendation in Indonesian",
    "Fourth actionable recommendation in Indonesian"
  ]
}

Important rules:
- All text values MUST be in Indonesian (Bahasa Indonesia).
- The recommendations array must contain 3-6 specific, actionable items.
- Evaluate: visual hierarchy, text legibility, color contrast (WCAG), image optimization potential, CTA visibility, and mobile-friendliness.
- Be specific to what you actually observe in the image.`;

    // Call Gemini with multimodal input
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ]);

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

    const analysisData = JSON.parse(cleaned);

    // Return the analysis along with the saved image URL
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      image_url: imageUrl,
      text_ratio: analysisData.text_ratio,
      readability: analysisData.readability,
      contrast_score: analysisData.contrast_score,
      recommendations: analysisData.recommendations,
    });
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);

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
        message: 'Trafik Gemini API sedang sibuk. Silakan coba unggah ulang dalam beberapa saat.',
      });
    }

    // Handle JSON parse errors from unexpected Gemini output
    if (error instanceof SyntaxError) {
      return res.status(502).json({
        message: 'Gagal memproses respons AI. Silakan coba lagi.',
      });
    }

    res.status(500).json({ message: 'Terjadi kesalahan saat menganalisis gambar.' });
  }
};

/**
 * POST /api/visual/save
 * Save visual analysis results to the task_visuals table.
 */
exports.saveToTask = async (req, res) => {
  try {
    const { task_id, image_url, text_ratio, readability, contrast_score, recommendations } = req.body;

    if (!task_id) {
      return res.status(400).json({ message: 'Task ID diperlukan.' });
    }

    // Verify the task belongs to this workspace
    const workspaceId = req.user.workspace_id;
    const [taskCheck] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND workspace_id = ?',
      [task_id, workspaceId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan di workspace ini.' });
    }

    // Check if a visual analysis already exists for this task
    const [existing] = await pool.query(
      'SELECT id FROM task_visuals WHERE task_id = ?',
      [task_id]
    );

    const recsJson = typeof recommendations === 'string' ? recommendations : JSON.stringify(recommendations);

    if (existing.length > 0) {
      // Update existing record
      await pool.query(
        'UPDATE task_visuals SET image_url = ?, text_ratio = ?, readability = ?, contrast_score = ?, recommendations = ? WHERE task_id = ?',
        [image_url, text_ratio, readability, contrast_score, recsJson, task_id]
      );
    } else {
      // Insert new record
      await pool.query(
        'INSERT INTO task_visuals (task_id, image_url, text_ratio, readability, contrast_score, recommendations) VALUES (?, ?, ?, ?, ?, ?)',
        [task_id, image_url, text_ratio, readability, contrast_score, recsJson]
      );
    }

    res.json({ message: 'Hasil analisis berhasil disimpan ke tugas.' });
  } catch (error) {
    console.error('Error saving visual analysis:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan.' });
  }
};

/**
 * GET /api/tasks/active
 * Fetch tasks with status 'To Do' or 'In Progress' for the current workspace.
 */
exports.getActiveTasks = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const [rows] = await pool.query(
      `SELECT id, title, status FROM tasks 
       WHERE workspace_id = ? AND status IN ('To Do', 'In Progress') 
       ORDER BY created_at DESC`,
      [workspaceId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching active tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
