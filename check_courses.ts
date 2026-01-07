import pg from 'pg';

const adminUrl = process.env.ADMIN_DATABASE_URL;
const pool = new pg.Pool({ connectionString: adminUrl });

async function checkCourses() {
  try {
    // Look for any tables containing 'course', 'lesson', 'module', 'test', 'project', 'lab'
    const tablesResult = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND (
        lower(table_name) LIKE '%course%' OR
        lower(table_name) LIKE '%lesson%' OR
        lower(table_name) LIKE '%module%' OR
        lower(table_name) LIKE '%test%' OR
        lower(table_name) LIKE '%project%' OR
        lower(table_name) LIKE '%lab%' OR
        lower(table_name) LIKE '%quiz%' OR
        lower(table_name) LIKE '%content%'
      )
      ORDER BY table_name
    `);
    
    console.log("=== COURSE-RELATED TABLES ===\n");
    if (tablesResult.rows.length === 0) {
      console.log("No course content tables found.");
    } else {
      for (const row of tablesResult.rows) {
        console.log(`${row.table_schema}.${row.table_name}`);
      }
    }
    
    // Check all schemas
    const schemasResult = await pool.query(`
      SELECT schema_name FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    `);
    
    console.log("\n=== ALL SCHEMAS ===\n");
    for (const row of schemasResult.rows) {
      console.log(row.schema_name);
    }
    
    // Get all tables again
    const allTables = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);
    
    console.log("\n=== ALL TABLES (" + allTables.rows.length + " total) ===\n");
    for (const row of allTables.rows) {
      console.log(`${row.table_schema}.${row.table_name}`);
    }
    
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkCourses();
