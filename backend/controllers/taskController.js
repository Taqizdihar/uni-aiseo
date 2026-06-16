const pool = require('../config/db');
const logAudit = require('../utils/auditLogger');

exports.getTasks = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const query = `
      SELECT t.*, 
             a.name as analyst_name, 
             w.name as writer_name 
      FROM tasks t
      LEFT JOIN users a ON t.analyst_id = a.id
      LEFT JOIN users w ON t.writer_id = w.id
      WHERE t.workspace_id = ?
      ORDER BY t.created_at DESC
    `;
    const [rows] = await pool.query(query, [workspaceId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;
    const { title, description, analyst_id, writer_id } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO tasks (workspace_id, title, description, analyst_id, writer_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, title, description, analyst_id || null, writer_id || null, 'To Do']
    );

    // Insert notifications for assigned analyst and writer
    const notifMessage = `Tugas baru '${title}' telah ditugaskan.`;
    if (analyst_id) {
      await pool.query(
        'INSERT INTO notifications (workspace_id, user_id, message, is_read) VALUES (?, ?, ?, ?)',
        [workspaceId, analyst_id, notifMessage, false]
      );
    }
    if (writer_id) {
      await pool.query(
        'INSERT INTO notifications (workspace_id, user_id, message, is_read) VALUES (?, ?, ?, ?)',
        [workspaceId, writer_id, notifMessage, false]
      );
    }

    const [newTask] = await pool.query(
      `SELECT t.*, a.name as analyst_name, w.name as writer_name 
       FROM tasks t
       LEFT JOIN users a ON t.analyst_id = a.id
       LEFT JOIN users w ON t.writer_id = w.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    // Audit log
    await logAudit(userId, `Membuat Tugas Baru: ${title}`, req.ip);

    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const taskId = req.params.id;
    const { status } = req.body;
    const userRole = req.user.role;

    // Validate the target status value
    const validStatuses = ['To Do', 'In Progress', 'Waiting Approval', 'Done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    // Fetch current task to know its current status
    const [taskRows] = await pool.query(
      'SELECT status FROM tasks WHERE id = ? AND workspace_id = ?',
      [taskId, workspaceId]
    );
    if (taskRows.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }
    const currentStatus = taskRows[0].status;

    // Role-based enforcement
    if (userRole === 'Content Writer') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk memindahkan tugas ini.' });
    }

    if (userRole === 'SEO Analyst') {
      // Analyst can ONLY drag from 'To Do' to 'In Progress'
      if (!(currentStatus === 'To Do' && status === 'In Progress')) {
        return res.status(403).json({ message: 'Anda tidak memiliki izin untuk memindahkan tugas ini.' });
      }
    }

    if (userRole === 'SEO Manager') {
      // Manager cannot drag to 'Waiting Approval' or 'Done'
      if (status === 'Waiting Approval' || status === 'Done') {
        return res.status(403).json({ message: 'Status ini diperbarui otomatis melalui sistem Validasi AI dan Persetujuan Konten.' });
      }
    }

    const [result] = await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ? AND workspace_id = ?',
      [status, taskId, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan atau tidak berwenang.' });
    }

    res.json({ message: 'Status tugas berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const taskId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND workspace_id = ?',
      [taskId, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    res.json({ message: 'Tugas berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getArchive = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const query = `
      SELECT t.*, 
             a.name as analyst_name, 
             w.name as writer_name 
      FROM tasks t
      LEFT JOIN users a ON t.analyst_id = a.id
      LEFT JOIN users w ON t.writer_id = w.id
      WHERE t.workspace_id = ? AND t.status = 'Done'
    `;
    const [rows] = await pool.query(query, [workspaceId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching archived tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    
    // Query 1: Total Tasks
    const [taskRows] = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE workspace_id = ?', [workspaceId]);
    const totalProjects = taskRows[0].count;

    // Query 2: Total Team (excluding SEO Manager)
    const [teamRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE workspace_id = ? AND role != "SEO Manager"', [workspaceId]);
    const totalTeam = teamRows[0].count;

    // Query 3: Average SEO Score
    const [scoreRows] = await pool.query(`
      SELECT AVG(tc.seo_score) as avgScore 
      FROM task_contents tc 
      JOIN tasks t ON tc.task_id = t.id 
      WHERE t.workspace_id = ?
    `, [workspaceId]);
    const avgSeoScore = scoreRows[0].avgScore ? Math.round(scoreRows[0].avgScore) : 0;

    // --- Chart Data ---

    // 1. Content Optimization Status (Donut Chart)
    const [optRows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN tc.seo_score > 80 THEN 1 ELSE 0 END) as optimized,
        SUM(CASE WHEN tc.seo_score >= 50 AND tc.seo_score <= 80 THEN 1 ELSE 0 END) as needs_fix,
        SUM(CASE WHEN tc.seo_score < 50 THEN 1 ELSE 0 END) as critical,
        COUNT(*) as total
      FROM task_contents tc
      JOIN tasks t ON tc.task_id = t.id
      WHERE t.workspace_id = ?
    `, [workspaceId]);

    const optTotal = optRows[0].total || 0;
    const optimizationData = optTotal > 0 ? [
      { name: "Dioptimalkan", value: Math.round((optRows[0].optimized / optTotal) * 100), color: "#fad02c" },
      { name: "Perlu Perbaikan", value: Math.round((optRows[0].needs_fix / optTotal) * 100), color: "#e0b820" },
      { name: "Kritis", value: Math.round((optRows[0].critical / optTotal) * 100), color: "#ff4444" },
    ] : [
      { name: "Dioptimalkan", value: 0, color: "#fad02c" },
      { name: "Perlu Perbaikan", value: 0, color: "#e0b820" },
      { name: "Kritis", value: 0, color: "#ff4444" },
    ];

    // 2. Performance Trend (Line Chart) - avg seo_score grouped by week over last 4 weeks
    const [trendRows] = await pool.query(`
      SELECT 
        YEARWEEK(t.updated_at, 1) as yw,
        ROUND(AVG(tc.seo_score)) as score,
        MIN(DATE(t.updated_at)) as week_start
      FROM task_contents tc
      JOIN tasks t ON tc.task_id = t.id
      WHERE t.workspace_id = ? AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY yw
      ORDER BY yw ASC
      LIMIT 4
    `, [workspaceId]);

    const performanceData = trendRows.length > 0
      ? trendRows.map((r, i) => ({ day: `W${i + 1}`, score: r.score || 0 }))
      : [{ day: "W1", score: 0 }, { day: "W2", score: 0 }, { day: "W3", score: 0 }, { day: "W4", score: 0 }];

    // 3. Keywords Generated (Bar Chart) - count per week over last 4 weeks
    const [kwRows] = await pool.query(`
      SELECT
        YEARWEEK(tk.created_at, 1) as yw,
        COUNT(*) as generated
      FROM task_keywords tk
      JOIN tasks t ON tk.task_id = t.id
      WHERE t.workspace_id = ? AND tk.created_at >= DATE_SUB(NOW(), INTERVAL 28 DAY)
      GROUP BY yw
      ORDER BY yw ASC
      LIMIT 4
    `, [workspaceId]);

    const keywordData = kwRows.length > 0
      ? kwRows.map((r, i) => ({ week: `Minggu ${i + 1}`, generated: r.generated || 0 }))
      : [
          { week: "Minggu 1", generated: 0 },
          { week: "Minggu 2", generated: 0 },
          { week: "Minggu 3", generated: 0 },
          { week: "Minggu 4", generated: 0 },
        ];

    res.json({
      totalProjects,
      totalTeam,
      avgSeoScore,
      optimizationData,
      performanceData,
      keywordData,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
