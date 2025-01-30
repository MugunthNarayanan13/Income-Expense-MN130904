import pool from '@/lib/postgres';

// Define the expected shape of the major category data
interface MajorCategory {
  major_category_name: string;
}

// Get a single major category
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM major_category WHERE major_category_id = $1', [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Major category not found' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to fetch major category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update a major category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body: MajorCategory = await request.json();
    const { major_category_name } = body;

    const result = await pool.query(
      'UPDATE major_category SET major_category_name = $1 WHERE major_category_id = $2 RETURNING *',
      [major_category_name, id]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Major category not found' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to update major category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Delete a major category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query('DELETE FROM major_category WHERE major_category_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Major category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Major category deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to delete major category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
