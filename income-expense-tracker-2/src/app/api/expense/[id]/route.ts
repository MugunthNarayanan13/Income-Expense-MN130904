import pool from '@/lib/postgres';

// Define the expected shape of the expense data
interface Expense {
    amount: number;
    date: string;
    category_id: number;
    payment_method_id: number;
    recurring?: boolean;
    description?: string;
}

// Get a single expense
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const result = await pool.query('SELECT * FROM expense WHERE expense_id = $1', [id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Expense not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to fetch expense' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Update an expense
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const body: Expense = await request.json();
        const { amount, date, category_id, payment_method_id, recurring = false, description } = body;

        const result = await pool.query(
            'UPDATE expense SET amount = $1, date = $2, category_id = $3, payment_method_id = $4, recurring = $5, description = $6 WHERE expense_id = $7 RETURNING *',
            [amount, date, category_id, payment_method_id, recurring, description, id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Expense not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to update expense' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Delete an expense
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const result = await pool.query('DELETE FROM expense WHERE expense_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Expense not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to delete expense' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
