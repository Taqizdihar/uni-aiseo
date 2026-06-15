const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from the Authorization header.
 * Attaches the decoded payload to req.user if valid.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
  }
};

/**
 * Middleware to restrict access based on user role.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || (!allowedRoles.includes(req.user.role) && !allowedRoles.includes('admin') && req.user.role !== 'Administrator')) {
      // Direct exact match check
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.' });
      }
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
