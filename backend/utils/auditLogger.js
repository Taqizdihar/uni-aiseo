const pool = require('../config/db');

/**
 * Log user action to audit_logs table
 * @param {number|null} userId - The ID of the user performing the action
 * @param {string} actionDetail - Description of the action (e.g., 'Log Masuk (Login)')
 * @param {string} ipAddress - IP address of the user (from req.ip)
 */
async function logAudit(userId, actionDetail, ipAddress) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
      [userId || null, actionDetail, ipAddress || null]
    );
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}

module.exports = logAudit;
