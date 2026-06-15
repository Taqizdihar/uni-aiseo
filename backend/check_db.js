const pool = require('./config/db');

async function check() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', tables);

    for (let row of tables) {
      let tableName = Object.values(row)[0];
      const [desc] = await pool.query(`DESCRIBE ${tableName}`);
      console.log(`\nTable ${tableName}:`);
      console.log(desc.map(c => `${c.Field} (${c.Type})`).join(', '));
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
