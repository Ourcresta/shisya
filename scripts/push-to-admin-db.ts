import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const ADMIN_DATABASE_URL = process.env.ADMIN_DATABASE_URL;

if (!ADMIN_DATABASE_URL) {
  console.error('ADMIN_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: ADMIN_DATABASE_URL,
});

async function pushData() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to Admin Database');
    
    // Read all course JSON files
    const sampleDataDir = path.join(process.cwd(), 'sample-data');
    const files = fs.readdirSync(sampleDataDir).filter(f => f.endsWith('.json'));
    
    console.log(`Found ${files.length} course files to process`);
    
    for (const file of files) {
      const filePath = path.join(sampleDataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      console.log(`\nProcessing: ${data.course.title}`);
      
      // Insert Course
      const courseResult = await client.query(`
        INSERT INTO courses (id, title, description, level, duration, skills, status, is_free, credit_cost, test_required, project_required, language, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          level = EXCLUDED.level,
          duration = EXCLUDED.duration,
          skills = EXCLUDED.skills,
          status = EXCLUDED.status,
          is_free = EXCLUDED.is_free,
          credit_cost = EXCLUDED.credit_cost,
          test_required = EXCLUDED.test_required,
          project_required = EXCLUDED.project_required,
          updated_at = NOW()
        RETURNING id
      `, [
        data.course.id,
        data.course.title,
        data.course.description,
        data.course.level,
        data.course.duration,
        data.course.skills.join(','),
        data.course.status,
        data.course.isFree,
        data.course.creditCost,
        data.course.testRequired,
        data.course.projectRequired,
        data.course.language || 'en'
      ]);
      
      console.log(`  ✓ Course inserted/updated: ${data.course.title}`);
      
      // Insert Modules
      for (const module of data.modules) {
        await client.query(`
          INSERT INTO modules (id, course_id, title, description, order_index, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            order_index = EXCLUDED.order_index
        `, [
          module.id,
          data.course.id,
          module.title,
          module.description,
          module.orderIndex
        ]);
        
        // Insert Lessons for this module
        for (const lesson of module.lessons) {
          await client.query(`
            INSERT INTO lessons (id, module_id, course_id, title, content, duration_minutes, order_index, is_preview, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (id) DO UPDATE SET 
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              duration_minutes = EXCLUDED.duration_minutes,
              order_index = EXCLUDED.order_index,
              is_preview = EXCLUDED.is_preview
          `, [
            lesson.id,
            module.id,
            data.course.id,
            lesson.title,
            lesson.content,
            lesson.durationMinutes,
            lesson.orderIndex,
            lesson.isPreview
          ]);
        }
        
        console.log(`  ✓ Module: ${module.title} (${module.lessons.length} lessons)`);
      }
      
      // Insert Labs
      for (const lab of data.labs) {
        await client.query(`
          INSERT INTO labs (id, course_id, lesson_id, title, instructions, starter_code, expected_output, language, order_index, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title,
            instructions = EXCLUDED.instructions,
            starter_code = EXCLUDED.starter_code,
            expected_output = EXCLUDED.expected_output,
            language = EXCLUDED.language,
            order_index = EXCLUDED.order_index
        `, [
          lab.id,
          data.course.id,
          lab.lessonId,
          lab.title,
          lab.instructions,
          lab.starterCode,
          lab.expectedOutput,
          lab.language,
          lab.orderIndex
        ]);
      }
      console.log(`  ✓ Labs: ${data.labs.length} inserted`);
      
      // Insert Test
      if (data.test) {
        await client.query(`
          INSERT INTO tests (id, course_id, title, description, duration_minutes, passing_percentage, questions, max_attempts, shuffle_questions, show_correct_answers, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false, NOW())
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            duration_minutes = EXCLUDED.duration_minutes,
            passing_percentage = EXCLUDED.passing_percentage,
            questions = EXCLUDED.questions,
            max_attempts = EXCLUDED.max_attempts
        `, [
          data.test.id,
          data.course.id,
          data.test.title,
          data.test.description,
          data.test.durationMinutes,
          data.test.passingPercentage,
          JSON.stringify(data.test.questions),
          data.test.maxAttempts
        ]);
        console.log(`  ✓ Test: ${data.test.title}`);
      }
      
      // Insert Project
      if (data.project) {
        await client.query(`
          INSERT INTO projects (id, course_id, title, description, difficulty, requirements, resources, estimated_hours, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            difficulty = EXCLUDED.difficulty,
            requirements = EXCLUDED.requirements,
            resources = EXCLUDED.resources,
            estimated_hours = EXCLUDED.estimated_hours
        `, [
          data.project.id,
          data.course.id,
          data.project.title,
          data.project.description,
          data.project.difficulty,
          JSON.stringify(data.project.requirements),
          JSON.stringify(data.project.resources),
          data.project.estimatedHours
        ]);
        console.log(`  ✓ Project: ${data.project.title}`);
      }
    }
    
    console.log('\n========================================');
    console.log('All data pushed to Admin Database successfully!');
    console.log('========================================');
    
  } catch (error) {
    console.error('Error pushing data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

pushData().catch(console.error);
