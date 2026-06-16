const pool = require('./config/db');

async function setupAdminSchema() {
  try {
    // 1. users table: add status column if not exists
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN status ENUM('Aktif', 'Ditangguhkan') DEFAULT 'Aktif'
    `).catch(e => { if(!e.message.includes('Duplicate column')) throw e; });

    // 2. workspaces table: add api_credits_used and status if not exists
    await pool.query(`
      ALTER TABLE workspaces 
      ADD COLUMN api_credits_used INT DEFAULT 0,
      ADD COLUMN status ENUM('Aktif', 'Ditangguhkan') DEFAULT 'Aktif'
    `).catch(e => { if(!e.message.includes('Duplicate column')) throw e; });

    // 3. Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('Admin schema setup complete');
    process.exit(0);
  } catch (err) {
    console.error('Error in schema setup:', err);
    process.exit(1);
  }
}

setupAdminSchema();
