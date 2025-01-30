import pool from "@/lib/postgres";

// Define the expected shape of the budget data
interface Budget {
    category_id: number;
    allocated_amount: number;
    start_date: string;
    end_date: string;
    description?: string; // Make description optional
}

// Get a single budget
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const result = await pool.query(
            'SELECT budget_id, category_id, allocated_amount, TO_CHAR(start_date, \'YYYY-MM-DD\') AS start_date, TO_CHAR(end_date, \'YYYY-MM-DD\') AS end_date, description FROM budget WHERE budget_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Budget not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to fetch budget' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Update a budget
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const body: Budget = await request.json();
        const { category_id, allocated_amount, start_date, end_date, description } = body;

        if (!category_id || !allocated_amount || !start_date || !end_date) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if the category ID exists
        const categoryResult = await pool.query('SELECT category_id FROM category WHERE category_id = $1', [category_id]);
        if (categoryResult.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Category not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if start date is less than end date
        if (new Date(start_date) >= new Date(end_date)) {
            return new Response(JSON.stringify({ error: 'Start date must be less than end date' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'UPDATE budget SET category_id = $1, allocated_amount = $2, start_date = $3, end_date = $4, description = $5 WHERE budget_id = $6 RETURNING *',
            [category_id, allocated_amount, start_date, end_date, description, id]
        );

        return new Response(JSON.stringify(result.rows[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to update budget' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Delete a budget
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const result = await pool.query(
            'DELETE FROM budget WHERE budget_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Budget not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to delete budget' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}