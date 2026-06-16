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
        t.id AS taskId,
        t.title AS campaignName,
        t.created_at AS completionDate,
        tc.seo_score AS finalScore,
        tc.focus_keyword AS focusKeyword,
        tc.content_draft AS contentDraft,
        tm.meta_title AS metaTitle,
        tm.meta_description AS metaDescription,
        u_analyst.name AS analystName,
        u_writer.name AS writerName
      FROM tasks t
      LEFT JOIN task_contents tc ON t.id = tc.task_id
      LEFT JOIN task_metatags tm ON t.id = tm.task_id
      LEFT JOIN users u_analyst ON t.analyst_id = u_analyst.id
      LEFT JOIN users u_writer ON t.writer_id = u_writer.id
      WHERE t.workspace_id = ? AND t.status = 'Done'
      ORDER BY t.created_at DESC
    `;

    const [rows] = await pool.query(query, [workspaceId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching workspace archive:', error);
    res.status(500).json({ message: 'Gagal memuat arsip workspace.' });
  }
};
