import pool from '@/lib/postgres';

// Define the expected shape of the category data
interface Category {
  category_name: string;
  associated_with: 'income' | 'expense';
}

// Get all categories with optional filtering by associated_with
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const associatedWith = url.searchParams.get('associated_with');

    let query = 'SELECT * FROM category';
    const queryParams: string[] = [];

    if (associatedWith) {
      query += ' WHERE associated_with = $1';
      queryParams.push(associatedWith);
    }

    query += ' ORDER BY category_id';

    const result = await pool.query(query, queryParams);
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
    const { category_name, associated_with } = body;

    const result = await pool.query(
      'INSERT INTO category (category_name, associated_with) VALUES ($1, $2) RETURNING *',
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