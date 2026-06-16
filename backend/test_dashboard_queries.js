const pool = require('./config/db');

async function testQueries() {
  try {
    const workspaceId = 1; // Assuming workspace 1 exists
    
    console.log("Query 1: Total Tasks");
    await pool.query('SELECT COUNT(*) as count FROM tasks WHERE workspace_id = ?', [workspaceId]);
    console.log("Q1 success");

    console.log("Query 2: Total Team");
    await pool.query('SELECT COUNT(*) as count FROM users WHERE workspace_id = ? AND role != "SEO Manager"', [workspaceId]);
    console.log("Q2 success");

    console.log("Query 3: Average SEO Score");
    await pool.query(`
      SELECT AVG(tc.seo_score) as avgScore 
      FROM task_contents tc 
      JOIN tasks t ON tc.task_id = t.id 
      WHERE t.workspace_id = ?
    `, [workspaceId]);
    console.log("Q3 success");

    console.log("Query 4: Optimization Data");
    await pool.query(`
      SELECT 
        SUM(CASE WHEN tc.seo_score > 80 THEN 1 ELSE 0 END) as optimized,
        SUM(CASE WHEN tc.seo_score >= 50 AND tc.seo_score <= 80 THEN 1 ELSE 0 END) as needs_fix,
        SUM(CASE WHEN tc.seo_score < 50 THEN 1 ELSE 0 END) as critical,
        COUNT(*) as total
      FROM task_contents tc
      JOIN tasks t ON tc.task_id = t.id
      WHERE t.workspace_id = ?
    `, [workspaceId]);
    console.log("Q4 success");

    console.log("Query 5: Performance Trend");
    await pool.query(`
      SELECT 
        YEARWEEK(t.created_at, 1) as yw,
        ROUND(AVG(tc.seo_score)) as score,
        MIN(DATE(t.created_at)) as week_start
      FROM task_contents tc
      JOIN tasks t ON tc.task_id = t.id
      WHERE t.workspace_id = ? AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY yw
      ORDER BY yw ASC
      LIMIT 4
    `, [workspaceId]);
    console.log("Q5 success");

    console.log("Query 6: Keywords Generated");
    await pool.query(`
      SELECT
        YEARWEEK(t.created_at, 1) as yw,
        COUNT(*) as generated
      FROM task_keywords tk
      JOIN tasks t ON tk.task_id = t.id
      WHERE t.workspace_id = ? AND t.created_at >= DATE_SUB(NOW(), INTERVAL 28 DAY)
      GROUP BY yw
      ORDER BY yw ASC
      LIMIT 4
    `, [workspaceId]);
    console.log("Q6 success");

  } catch (err) {
    console.error("SQL Error:", err);
  } finally {
    process.exit();
  }
}

testQueries();
