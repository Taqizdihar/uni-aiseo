const pool = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const query = `
      SELECT t.*, 
             a.name as analyst_name, 
             w.name as writer_name 
      FROM Tasks t
      LEFT JOIN Users a ON t.analyst_id = a.id
      LEFT JOIN Users w ON t.writer_id = w.id
      WHERE t.workspace_id = ?
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
    const { title, description, analyst_id, writer_id } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO Tasks (workspace_id, title, description, analyst_id, writer_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, title, description, analyst_id || null, writer_id || null, 'To Do']
    );

    const [newTask] = await pool.query(
      `SELECT t.*, a.name as analyst_name, w.name as writer_name 
       FROM Tasks t
       LEFT JOIN Users a ON t.analyst_id = a.id
       LEFT JOIN Users w ON t.writer_id = w.id
       WHERE t.id = ?`,
      [result.insertId]
    );

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

    const [result] = await pool.query(
      'UPDATE Tasks SET status = ? WHERE id = ? AND workspace_id = ?',
      [status, taskId, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task status updated' });
  } catch (error) {
    console.error('Error updating task status:', error);
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
      FROM Tasks t
      LEFT JOIN Users a ON t.analyst_id = a.id
      LEFT JOIN Users w ON t.writer_id = w.id
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
