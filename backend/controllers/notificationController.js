const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const [rows] = await pool.query(`
      SELECT n.*, u.name as user_name, u.role as user_role 
      FROM notifications n 
      LEFT JOIN users u ON n.user_id = u.id 
      WHERE n.workspace_id = ? 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `, [workspaceId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    await pool.query('UPDATE notifications SET is_read = true WHERE workspace_id = ?', [workspaceId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
