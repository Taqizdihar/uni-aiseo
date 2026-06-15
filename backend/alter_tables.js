const pool = require('./config/db');

async function run() {
  try {
    await pool.query('ALTER TABLE Users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL');
    console.log('Added profile_picture to Users');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('profile_picture already exists');
    else console.error(e);
  }
  
  try {
    await pool.query('ALTER TABLE Workspaces ADD COLUMN background_image VARCHAR(255) DEFAULT NULL');
    console.log('Added background_image to Workspaces');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('background_image already exists');
    else console.error(e);
  }
  process.exit(0);
}

run();
