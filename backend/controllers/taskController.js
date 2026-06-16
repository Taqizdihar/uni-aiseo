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

    res.json({ totalProjects, totalTeam, avgSeoScore });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
