import pool from '@/lib/postgres';

// Define the expected shape of the major category data
interface MajorCategory {
  major_category_name: string;
}

// Get all major categories
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM major_category ORDER BY major_category_id');
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Add a new major category
export async function POST(request: Request) {
  try {
    const body: MajorCategory = await request.json();
    const { major_category_name } = body;

    const result = await pool.query(
      'INSERT INTO major_category (major_category_name) VALUES ($1) RETURNING *',
      [major_category_name]
    );
    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to add major category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}