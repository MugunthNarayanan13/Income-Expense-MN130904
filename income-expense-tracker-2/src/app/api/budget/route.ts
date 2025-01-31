import pool from '@/lib/postgres';

// Define the expected shape of the budget data
interface Budget {
    category_id: number;
    allocated_amount: number;
    start_date: string;
    end_date: string;
    description?: string;
    recurring?: boolean;
    expense_id?: number;
}

// Get all budgets with optional filtration
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('category_id');
        const startDate = url.searchParams.get('start_date');
        const endDate = url.searchParams.get('end_date');
        const recurring = url.searchParams.get('recurring');
        let query = 'SELECT budget_id, category_id, allocated_amount, TO_CHAR(start_date, \'YYYY-MM-DD\') AS start_date, TO_CHAR(end_date, \'YYYY-MM-DD\') AS end_date, description, recurring, expense_id FROM budget';
        const queryParams = [] as any[];

        if (categoryId) {
            query += ` WHERE category_id = $${queryParams.length + 1}`;
            queryParams.push(categoryId);
        }
        if (startDate) {
            query += `${queryParams.length ? ' AND' : ' WHERE'} start_date >= $${queryParams.length + 1}`;
            queryParams.push(startDate);
        }
        if (endDate) {
            query += `${queryParams.length ? ' AND' : ' WHERE'} end_date <= $${queryParams.length + 1}`;
            queryParams.push(endDate);
        }
        if (recurring) {
            query += `${queryParams.length ? ' AND' : ' WHERE'} recurring = $${queryParams.length + 1}`;
            queryParams.push(recurring);
        }

        query += ' ORDER BY start_date ASC, end_date ASC, category_id ASC';

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
        const { category_id, allocated_amount, start_date, end_date, description, recurring, expense_id } = body;

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
            'INSERT INTO budget (category_id, allocated_amount, start_date, end_date, description, recurring, expense_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [category_id, allocated_amount, start_date, end_date, description || null, recurring || false, expense_id || null]
        );

        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add budget' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
