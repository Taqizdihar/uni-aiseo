const pool = require('../config/db');

/**
 * GET /api/approval/pending
 * Fetch tasks in 'Waiting Approval' state along with content and metatags.
 */
exports.getPendingApprovals = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;

    const query = `
      SELECT 
        t.id, t.title, t.status,
        tc.content_draft, tc.focus_keyword, tc.seo_score, tc.readability_level,
        tm.meta_title, tm.meta_description
      FROM tasks t
      LEFT JOIN task_contents tc ON t.id = tc.task_id
      LEFT JOIN task_metatags tm ON t.id = tm.task_id
      WHERE t.workspace_id = ? AND t.status = 'Waiting Approval'
    `;

    const [rows] = await pool.query(query, [workspaceId]);

    // Format the response for the frontend
    const tasks = rows.map(r => ({
      id: r.id.toString(),
      title: r.title,
      targetKeyword: r.focus_keyword || 'Belum ada',
      metaTitle: r.meta_title || 'Belum ada',
      metaDesc: r.meta_description || 'Belum ada',
      content: r.content_draft || 'Belum ada draf',
      seoScore: r.seo_score || 0,
      readability: r.readability_level || 'Belum dianalisis',
      // We don't save density to DB directly in the previous prompt, so we can mock or extract it.
      // But we can just use a placeholder for now as requested.
      density: 'Tersedia di riwayat',
      aiSuggestion: 'Tinjauan manual oleh Manager diperlukan.',
      status: r.status,
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Gagal mengambil data persetujuan.' });
  }
};

/**
 * PUT /api/approval/:taskId/approve
 * Approve the task (move to 'Done') and clear rejection notes.
 */
exports.approveTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const workspaceId = req.user.workspace_id;

    // Check if task exists and get writer/analyst ids
    const [taskCheck] = await pool.query(
      'SELECT title, writer_id, analyst_id FROM tasks WHERE id = ? AND workspace_id = ?',
      [taskId, workspaceId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    const { title, writer_id, analyst_id } = taskCheck[0];

    await pool.query(
      "UPDATE tasks SET status = 'Done', rejection_note = NULL WHERE id = ?",
      [taskId]
    );

    // Notifications
    let notifMessage = `Selamat! Draf untuk "${title}" telah disetujui oleh Manager dan diarsipkan.`;
    if (notifMessage.length > 255) {
      notifMessage = notifMessage.substring(0, 252) + '...';
    }
    const notifications = [];
    if (writer_id) {
      notifications.push([workspaceId, writer_id, notifMessage, false]);
    }
    if (analyst_id && analyst_id !== writer_id) {
      notifications.push([workspaceId, analyst_id, notifMessage, false]);
    }

    if (notifications.length > 0) {
      await pool.query(
        'INSERT INTO notifications (workspace_id, user_id, message, is_read) VALUES ?',
        [notifications]
      );
    }

    res.json({ message: 'Tugas berhasil disetujui.' });
  } catch (error) {
    console.error('Error approving task:', error);
    res.status(500).json({ message: 'Gagal menyetujui tugas.' });
  }
};

/**
 * PUT /api/approval/:taskId/reject
 * Reject the task (move to 'In Progress') with a note.
 */
exports.rejectTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const workspaceId = req.user.workspace_id;
    const { rejection_note } = req.body;

    if (!rejection_note) {
      return res.status(400).json({ message: 'Catatan penolakan diperlukan.' });
    }

    const [taskCheck] = await pool.query(
      'SELECT title, writer_id FROM tasks WHERE id = ? AND workspace_id = ?',
      [taskId, workspaceId]
    );

    if (taskCheck.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    const { title, writer_id } = taskCheck[0];

    await pool.query(
      "UPDATE tasks SET status = 'In Progress', rejection_note = ? WHERE id = ?",
      [rejection_note, taskId]
    );

    if (writer_id) {
      let notifMessage = `Draf "${title}" membutuhkan revisi. Catatan Manager: ${rejection_note}`;
      if (notifMessage.length > 255) {
        notifMessage = notifMessage.substring(0, 252) + '...';
      }
      await pool.query(
        'INSERT INTO notifications (workspace_id, user_id, message, is_read) VALUES (?, ?, ?, ?)',
        [workspaceId, writer_id, notifMessage, false]
      );
    }

    res.json({ message: 'Tugas berhasil ditolak dan dikembalikan untuk direvisi.' });
  } catch (error) {
    console.error('Error rejecting task:', error);
    res.status(500).json({ message: 'Gagal menolak tugas.' });
  }
};
