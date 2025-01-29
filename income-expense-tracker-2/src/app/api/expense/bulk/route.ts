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

// Bulk add expenses
export async function POST(request: Request) {
    try {
        const expenses: Expense[] = await request.json(); // Expect an array of expense objects

        // Check if the array is empty
        if (!expenses || expenses.length === 0) {
            return new Response(JSON.stringify({ error: 'No expenses provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const successfulInserts: Expense[] = [];
        const failedInserts: { expense: Expense, error: string }[] = [];

        for (const expense of expenses) {
            const { amount, date, category_id, payment_method_id, description } = expense;
            const recurring = expense.recurring ?? false; // Default to false if not provided

            // Make sure each expense has required fields
            if (!amount || !date || !category_id || !payment_method_id) {
                failedInserts.push({
                    expense,
                    error: 'Missing required fields'
                });
                continue;
            }

            // Check if category_id exists
            const categoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [category_id]);
            if (categoryCheck.rowCount === 0) {
                failedInserts.push({
                    expense,
                    error: 'Invalid category_id'
                });
                continue;
            }

            // Check if payment_method_id exists
            const paymentMethodCheck = await pool.query('SELECT 1 FROM payment_method WHERE payment_method_id = $1', [payment_method_id]);
            if (paymentMethodCheck.rowCount === 0) {
                failedInserts.push({
                    expense,
                    error: 'Invalid payment_method_id'
                });
                continue;
            }

            try {
                const result = await pool.query(
                    'INSERT INTO expense (amount, date, category_id, payment_method_id, recurring, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [amount, date, category_id, payment_method_id, recurring, description]
                );
                successfulInserts.push(result.rows[0]);
            } catch (error) {
                console.error(`Failed to insert expense: ${JSON.stringify(expense)}`, error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                failedInserts.push({ expense, error: errorMessage });
            }
        }

        return new Response(JSON.stringify({ successfulInserts, failedInserts }), {
            status: 207, // Multi-Status
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add expenses' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
