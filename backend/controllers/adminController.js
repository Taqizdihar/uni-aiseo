const pool = require('../config/db');

// --- Admin Dashboard Metrics ---
exports.getMetrics = async (req, res) => {
  try {
    // Total Workspaces
    const [workspaceRows] = await pool.query('SELECT COUNT(*) as count FROM workspaces');
    const totalWorkspaces = workspaceRows[0].count;

    // Total Users
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = userRows[0].count;

    // Total API Credits
    const [creditsRows] = await pool.query('SELECT SUM(api_credits_used) as totalCredits FROM workspaces');
    const totalApiCredits = creditsRows[0].totalCredits || 0;

    // Active Sessions (Logins in last 24 hours)
    const [activeSessionRows] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM audit_logs 
      WHERE action = 'Log Masuk (Login)' AND created_at >= NOW() - INTERVAL 1 DAY
    `);
    const activeSessions = activeSessionRows[0].count;

    res.json({
      totalWorkspaces,
      totalUsers,
      totalApiCredits,
      activeSessions
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ message: 'Gagal memuat metrik dasbor.' });
  }
};

// --- User Management ---
exports.getUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, w.name as workspace_name
      FROM users u
      LEFT JOIN workspaces w ON u.workspace_id = w.id
      ORDER BY u.created_at DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Gagal memuat pengguna.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Aktif', 'Ditangguhkan'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ message: 'Tidak dapat menangguhkan akun Anda sendiri.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status pengguna berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Gagal memperbarui status pengguna.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(403).json({ message: 'Tidak dapat menghapus akun Anda sendiri.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Pengguna berhasil dihapus permanen.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Gagal menghapus pengguna.' });
  }
};

// --- Workspace Management ---
exports.getWorkspaces = async (req, res) => {
  try {
    const query = `
      SELECT 
        w.id, w.name, w.status, w.api_credits_used, w.created_at,
        (SELECT COUNT(*) FROM users u WHERE u.workspace_id = w.id) as total_members,
        (SELECT name FROM users u2 WHERE u2.workspace_id = w.id AND u2.role = 'SEO Manager' LIMIT 1) as owner_name
      FROM workspaces w
      ORDER BY w.created_at DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Gagal memuat workspace.' });
  }
};

exports.updateWorkspaceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Aktif', 'Ditangguhkan'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    await pool.query('UPDATE workspaces SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status workspace berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating workspace status:', error);
    res.status(500).json({ message: 'Gagal memperbarui status workspace.' });
  }
};

// --- Audit Trail ---
exports.getAuditLogs = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT a.id, a.action, a.ip_address, a.created_at, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE u.email LIKE ? OR a.action LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT 100`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Gagal memuat jejak audit.' });
  }
};
