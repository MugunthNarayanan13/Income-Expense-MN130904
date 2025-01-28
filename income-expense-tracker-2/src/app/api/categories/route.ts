import pool from '@/lib/postgres';

// Define the expected shape of the category data
interface Category {
  category_name: string;
  associated_with: 'income' | 'expense';
}

// Get all categories
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_id');
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

// Add a new category
export async function POST(request: Request) {
  try {
    const body: Category = await request.json();
    const { category_name: category_name, associated_with: associated_with } = body;

    const result = await pool.query(
      'INSERT INTO categories (category_name, associated_with) VALUES ($1, $2) RETURNING *',
      [category_name, associated_with]
    );
    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to add category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}