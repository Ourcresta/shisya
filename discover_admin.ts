import pg from 'pg';

const adminUrl = process.env.ADMIN_DATABASE_URL;
console.log("Connecting to Admin database...");

const pool = new pg.Pool({ connectionString: adminUrl });

async function discoverSchema() {
  try {
    const tablesResult = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);
    
    console.log("\n=== TABLES IN ADMIN DATABASE ===\n");
    for (const row of tablesResult.rows) {
      console.log(`${row.table_schema}.${row.table_name}`);
    }
    
    const columnsResult = await pool.query(`
      SELECT table_schema, table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name, ordinal_position
    `);
    
    console.log("\n=== TABLE COLUMNS ===\n");
    let currentTable = '';
    for (const row of columnsResult.rows) {
      const tableFull = `${row.table_schema}.${row.table_name}`;
      if (tableFull !== currentTable) {
        console.log(`\n--- ${tableFull} ---`);
        currentTable = tableFull;
      }
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    }
    
  } catch (error: any) {
    console.error("Connection Error:", error.message);
  } finally {
    await pool.end();
  }
}

discoverSchema();
