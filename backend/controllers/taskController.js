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
    const query = \`
      SELECT t.*, 
             a.name as analyst_name, 
             w.name as writer_name 
      FROM Tasks t
      LEFT JOIN Users a ON t.analyst_id = a.id
      LEFT JOIN Users w ON t.writer_id = w.id
      WHERE t.workspace_id = ? AND t.status = 'Done'
    \`;
    const [rows] = await pool.query(query, [workspaceId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching archived tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    
    const [taskRows] = await pool.query('SELECT COUNT(*) as count FROM Tasks WHERE workspace_id = ?', [workspaceId]);
    const totalTasks = taskRows[0].count;

    const [teamRows] = await pool.query('SELECT COUNT(*) as count FROM Users WHERE workspace_id = ?', [workspaceId]);
    const totalTeam = teamRows[0].count;

    res.json({ totalTasks, totalTeamMembers: totalTeam });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
