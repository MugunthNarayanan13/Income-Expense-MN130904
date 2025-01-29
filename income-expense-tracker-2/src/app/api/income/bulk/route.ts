import pool from '@/lib/postgres';

// Define the expected shape of the income data
interface Income {
    amount: number;
    date: string;
    category_id: number;
    payment_method_id: number;
    description?: string;
}

// Bulk add incomes
export async function POST(request: Request) {
    try {
        const incomes: Income[] = await request.json(); // Expect an array of income objects

        // Check if the array is empty
        if (!incomes || incomes.length === 0) {
            return new Response(JSON.stringify({ error: 'No incomes provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const successfulInserts: Income[] = [];
        const failedInserts: { income: Income, error: string }[] = [];

        for (const income of incomes) {
            const { amount, date, category_id, payment_method_id, description } = income;

            // Make sure each income has required fields
            if (!amount || !date || !category_id || !payment_method_id) {
                failedInserts.push({
                    income,
                    error: 'Missing required fields'
                });
                continue;
            }

            // Check if category_id exists
            const categoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [category_id]);
            if (categoryCheck.rowCount === 0) {
                failedInserts.push({
                    income,
                    error: 'Invalid category_id'
                });
                continue;
            }

            // Check if payment_method_id exists
            const paymentMethodCheck = await pool.query('SELECT 1 FROM payment_method WHERE payment_method_id = $1', [payment_method_id]);
            if (paymentMethodCheck.rowCount === 0) {
                failedInserts.push({
                    income,
                    error: 'Invalid payment_method_id'
                });
                continue;
            }

            try {
                const result = await pool.query(
                    'INSERT INTO income (amount, date, category_id, payment_method_id, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [amount, date, category_id, payment_method_id, description]
                );
                successfulInserts.push(result.rows[0]);
            } catch (error) {
                console.error(`Failed to insert income: ${JSON.stringify(income)}`, error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                failedInserts.push({ income, error: errorMessage });
            }
        }

        return new Response(JSON.stringify({ successfulInserts, failedInserts }), {
            status: 207, // Multi-Status
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add incomes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


/*
Sample JSON for bulk adding incomes:
[
    {
        "amount": 1000,
        "date": "2023-10-01",
        "category_id": 1,
        "payment_method_id": 2,
        "description": "Salary for October"
    },
    {
        "amount": 200,
        "date": "2023-10-02",
        "category_id": 2,
        "payment_method_id": 1,
        "description": "Freelance work"
    }
]

To test bulk addition with Postman:
1. Set the request method to POST.
2. Set the URL to /api/income/bulk.
3. In the Body tab, select raw and JSON format.
4. Paste the sample JSON for bulk adding incomes.
5. Send the request.
*/

// To upload incomes from an Excel file, you can convert the Excel data to JSON format on the client side using libraries like `xlsx` and then send the JSON data to the bulk addition endpoint.