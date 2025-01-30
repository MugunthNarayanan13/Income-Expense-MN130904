import pool from "@/lib/postgres";

// Define the expected shape of the budget data
interface Budget {
    category_id: number;
    allocated_amount: number;
    start_date: string;
    end_date: string;
    description?: string; // Make description optional
}

// Get all budgets with optional filtration
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('category_id');
        const startDate = url.searchParams.get('start_date');
        const endDate = url.searchParams.get('end_date');

        let query = 'SELECT budget_id, category_id, allocated_amount, TO_CHAR(start_date, \'YYYY-MM-DD\') AS start_date, TO_CHAR(end_date, \'YYYY-MM-DD\') AS end_date, description FROM budget';
        const queryParams: any[] = [];

        if (categoryId || startDate || endDate) {
            query += ' WHERE';
            if (categoryId) {
                queryParams.push(categoryId);
                query += ` category_id = $${queryParams.length}`;
            }
            if (startDate) {
                if (queryParams.length > 0) query += ' AND';
                queryParams.push(startDate);
                query += ` start_date = $${queryParams.length}`;
            }
            if (endDate) {
                if (queryParams.length > 0) query += ' AND';
                queryParams.push(endDate);
                query += ` end_date = $${queryParams.length}`;
            }
        }

        query += ' ORDER BY category_id, start_date, end_date';

        const result = await pool.query(query, queryParams);
        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch budgets' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Add a new budget
export async function POST(request: Request) {
    try {
        const body: Budget = await request.json();
        const { category_id, allocated_amount, start_date, end_date, description } = body;

        if (!category_id || !allocated_amount || !start_date || !end_date) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return new Response(JSON.stringify({ error: 'Start date must be before end date' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if category_id exists
        const categoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [category_id]);
        if (categoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Category ID does not exist' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'INSERT INTO budget (category_id, allocated_amount, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [category_id, allocated_amount, start_date, end_date, description || null]
        );

        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add budget' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}