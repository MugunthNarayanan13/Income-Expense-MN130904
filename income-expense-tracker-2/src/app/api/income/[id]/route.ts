import pool from '@/lib/postgres';

// Define the expected shape of the income data
interface Income {
  amount: number;
  date: string;
  category_id: number;
  payment_method_id: number;
  description?: string;
}

// Get a single income
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM income WHERE income_id = $1', [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to fetch income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update an income
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body: Income = await request.json();
    const { amount, date, category_id, payment_method_id, description } = body;

    const result = await pool.query(
      'UPDATE income SET amount = $1, date = $2, category_id = $3, payment_method_id = $4, description = $5 WHERE income_id = $6 RETURNING *',
      [amount, date, category_id, payment_method_id, description, id]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to update income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Delete an income
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query('DELETE FROM income WHERE income_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Income not found' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to delete income' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}