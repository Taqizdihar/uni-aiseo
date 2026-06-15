const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Registers a new user with a new workspace using a database transaction.
 */
const register = async (req, res) => {
  const { workspace_name, name, email, password } = req.body;

  // Validation
  if (!workspace_name || !name || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
    }

    // 1. Insert workspace
    const [workspaceResult] = await connection.execute(
      'INSERT INTO workspaces (name) VALUES (?)',
      [workspace_name]
    );
    const workspaceId = workspaceResult.insertId;

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Insert user with default role 'SEO Manager' and status 'Aktif'
    const [userResult] = await connection.execute(
      'INSERT INTO users (workspace_id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, name, email, hashedPassword, 'SEO Manager', 'Aktif']
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Registrasi berhasil! Silakan login.',
      user: {
        id: userResult.insertId,
        name,
        email,
        role: 'SEO Manager',
        workspace_id: workspaceId,
        workspace_name,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token with user profile data.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    // Fetch user with workspace info via JOIN
    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.status, u.workspace_id, w.name AS workspace_name
       FROM users u
       LEFT JOIN workspaces w ON u.workspace_id = w.id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'Aktif') {
      return res.status(403).json({ message: 'Akun Anda tidak aktif. Hubungi administrator.' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Generate JWT
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspace_id: user.workspace_id,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.status(200).json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspace_id: user.workspace_id,
        workspace_name: user.workspace_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
  }
};

module.exports = { register, login };
