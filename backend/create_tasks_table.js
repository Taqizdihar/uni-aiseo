const pool = require('./config/db');

async function createTasksTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`Tasks\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`workspace_id\` INT NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`status\` ENUM('To Do', 'In Progress', 'In Review', 'Done') NOT NULL DEFAULT 'To Do',
        \`analyst_id\` INT,
        \`writer_id\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`workspace_id\`) REFERENCES \`Workspaces\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`analyst_id\`) REFERENCES \`Users\`(\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`writer_id\`) REFERENCES \`Users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tasks table created or already exists.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating Tasks table:', error);
    process.exit(1);
  }
}

createTasksTable();
