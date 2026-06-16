const pool = require('../config/db');

/**
 * GET /api/archive
 * Fetch all completed tasks (status = 'Done') with aggregated data
 */
exports.getArchive = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;

    const query = `
      SELECT 
        t.id, t.title, t.description, t.created_at, t.updated_at,
        a.name as analyst_name, 
        w.name as writer_name,
        tc.content_draft, tc.focus_keyword, tc.seo_score, tc.readability_level, tc.feedback,
        tm.meta_title, tm.meta_description
      FROM tasks t
      LEFT JOIN users a ON t.analyst_id = a.id
      LEFT JOIN users w ON t.writer_id = w.id
      LEFT JOIN task_contents tc ON t.id = tc.task_id
      LEFT JOIN task_metatags tm ON t.id = tm.task_id
      WHERE t.workspace_id = ? AND t.status = 'Done'
      ORDER BY t.updated_at DESC
    `;

    const [rows] = await pool.query(query, [workspaceId]);

    const formatted = rows.map(r => ({
      id: r.id.toString(),
      title: r.title,
      description: r.description,
      analyst_name: r.analyst_name || 'Tidak ada',
      writer_name: r.writer_name || 'Tidak ada',
      focus_keyword: r.focus_keyword || 'Belum ada',
      seo_score: r.seo_score || 0,
      meta_title: r.meta_title || 'Belum ada',
      meta_description: r.meta_description || 'Belum ada',
      content_draft: r.content_draft || 'Belum ada',
      readability_level: r.readability_level || 'Belum ada',
      feedback: r.feedback ? JSON.parse(r.feedback || '[]') : [],
      completed_at: r.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching workspace archive:', error);
    res.status(500).json({ message: 'Gagal memuat arsip workspace.' });
  }
};
