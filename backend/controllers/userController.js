const pool = require('../config/db');

exports.getTeamMembers = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM Users WHERE workspace_id = ?',
      [workspaceId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const userIdToRemove = req.params.id;
    const currentUserId = req.user.id;

    if (currentUserId == userIdToRemove) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }

    const [result] = await pool.query(
      'DELETE FROM Users WHERE id = ? AND workspace_id = ?',
      [userIdToRemove, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or not in your workspace.' });
    }

    res.json({ message: 'User removed successfully.' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
