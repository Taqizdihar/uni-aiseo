const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    // Fetch workspace notifications + manager's own audit logs merged as a unified feed
    const [rows] = await pool.query(`
      (
        SELECT n.id, n.message, n.created_at, u.name as user_name, u.role as user_role, n.is_read
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.id 
        WHERE n.workspace_id = ?
      )
      UNION ALL
      (
        SELECT a.id + 1000000 as id, a.action_detail as message, a.timestamp as created_at, u.name as user_name, u.role as user_role, 1 as is_read
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ? AND a.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      )
      ORDER BY created_at DESC
      LIMIT 15
    `, [workspaceId, userId]);
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
