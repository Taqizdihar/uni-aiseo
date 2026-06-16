const pool = require('../config/db');

/**
 * POST /api/team/invite
 * Pre-register a team member. Only accessible by SEO Manager.
 */
const sendInvite = async (req, res) => {
  const { email, role } = req.body;

  // Validation
  if (!email || !role) {
    return res.status(400).json({ message: 'Email dan role wajib diisi.' });
  }

  // Only allow inviting analyst/writer roles
  const allowedRoles = ['SEO Analyst', 'Content Writer'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid. Pilih SEO Analyst atau Content Writer.' });
  }

  try {
    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id, status FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Pengguna dengan email ini sudah terdaftar atau sedang dalam status tertunda.' });
    }

    // Insert pending user into Users table
    // Using a dummy string for password that can never be matched if password is required
    const [insertResult] = await pool.execute(
      `INSERT INTO users (name, email, role, workspace_id, status, password)
       VALUES ('Menunggu Pendaftaran', ?, ?, ?, 'Tertunda', 'PENDING_USER_NO_LOGIN')`,
      [email, role, req.user.workspace_id]
    );

    return res.status(200).json({
      message: 'Anggota berhasil didaftarkan ke sistem',
      user: {
        id: insertResult.insertId,
        email,
        role,
        status: 'Tertunda',
      },
    });
  } catch (error) {
    console.error('Pre-register invite error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat mendaftarkan anggota.' });
  }
};

module.exports = { sendInvite };
