import pool from '@/lib/postgres';

// Define the expected shape of the expense data
interface Expense {
    amount: number;
    date: string;
    category_id: number;
    payment_method_id: number;
    description?: string;
    recurring?: boolean;
}

// Get all expenses
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category_id = searchParams.get('category_id');
        const payment_method_id = searchParams.get('payment_method_id');
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const recurring = searchParams.get('recurring');

        let query = 'SELECT expense_id, amount, TO_CHAR(date, \'YYYY-MM-DD\') AS date, category_id, payment_method_id, description, recurring FROM expense';
        const conditions: string[] = [];
        const values: any[] = [];

        if (year) {
            conditions.push('EXTRACT(YEAR FROM date) = $' + (values.length + 1));
            values.push(year);
        }

        if (month) {
            conditions.push('EXTRACT(MONTH FROM date) = $' + (values.length + 1));
            values.push(month);
        }

        if (date) {
            conditions.push('date = $' + (values.length + 1));
            values.push(date);
        }

        if (payment_method_id) {
            conditions.push('payment_method_id = $' + (values.length + 1));
            values.push(payment_method_id);
        }

        if (category_id) {
            conditions.push('category_id = $' + (values.length + 1));
            values.push(category_id);
        }

        if (recurring !== null) {
            conditions.push('recurring = $' + (values.length + 1));
            values.push(recurring === 'true');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY date DESC';

        const result = await pool.query(query, values);

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch expenses' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Add a new expense
export async function POST(request: Request) {
    try {
        const body: Expense = await request.json();
        const { amount, date, category_id, payment_method_id, description } = body;
        const recurring = body.recurring ?? false; // Default to false if not provided

        if (!amount || !date || !category_id || !payment_method_id) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if category_id exists
        const categoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [category_id]);
        if (categoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid category_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if payment_method_id exists
        const paymentMethodCheck = await pool.query('SELECT 1 FROM payment_method WHERE payment_method_id = $1', [payment_method_id]);
        if (paymentMethodCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid payment_method_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'INSERT INTO expense (amount, date, category_id, payment_method_id, description, recurring) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [amount, date, category_id, payment_method_id, description, recurring]
        );
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        let errorMessage = 'Failed to add expense';
        if (error instanceof SyntaxError) {
            errorMessage = 'Invalid JSON format';
        } else if ((error as any).code === '23505') {
            errorMessage = 'Duplicate entry';
        }
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
