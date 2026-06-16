const pool = require('./config/db');

/**
 * Migration: Add invite_token and token_expires columns to users table.
 * Also update the status ENUM to include 'Tertunda' for pending invitations.
 */
async function migrateInviteColumns() {
  try {
    // Add invite_token column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN invite_token VARCHAR(255) DEFAULT NULL
    `).catch(e => { if (!e.message.includes('Duplicate column')) throw e; });

    // Add token_expires column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN token_expires DATETIME DEFAULT NULL
    `).catch(e => { if (!e.message.includes('Duplicate column')) throw e; });

    // Update status ENUM to include 'Tertunda'
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('Aktif', 'Ditangguhkan', 'Tertunda') DEFAULT 'Aktif'
    `).catch(e => { console.warn('Status ENUM update note:', e.message); });

    // Make password nullable for pending invited users
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN password VARCHAR(255) DEFAULT NULL
    `).catch(e => { console.warn('Password nullable update note:', e.message); });

    // Make name nullable for pending invited users
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN name VARCHAR(255) DEFAULT NULL
    `).catch(e => { console.warn('Name nullable update note:', e.message); });

    console.log('✅ Invite columns migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrateInviteColumns();
