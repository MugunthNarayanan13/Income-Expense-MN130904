import pool from '@/lib/postgres';

// Define the expected shape of the category data
interface Category {
  category_name: string;
  associated_with: 'income' | 'expense';
}

// Get a single category
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update a category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body: Category = await request.json();
    const { category_name: category_name, associated_with } = body;

    const result = await pool.query(
      'UPDATE categories SET category_name = $1, associated_with = $2 WHERE category_id = $3 RETURNING *',
      [category_name, associated_with, id]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to update category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Delete a category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
