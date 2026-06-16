const pool = require('./config/db');

async function createFaqsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    console.log('FAQs table ensured');
    process.exit(0);
  } catch (err) {
    console.error('Error creating FAQs table:', err);
    process.exit(1);
  }
}

createFaqsTable();
