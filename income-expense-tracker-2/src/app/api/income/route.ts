import pool from '@/lib/postgres';
import { parse } from 'url';

// Define the expected shape of the income data
interface Income {
    amount: number;
    date: string; // Can be ISO string or a specific date format
    category_id: number;
    payment_method_id: number;
    description?: string;
}

// Get all incomes
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category_id = searchParams.get('category_id');
        const payment_method_id = searchParams.get('payment_method_id');
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        let query = 'SELECT * FROM income';
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
        return new Response(JSON.stringify({ error: 'Failed to fetch incomes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

/*
Sample queries for testing with Postman:

1. Get all incomes:
   GET /api/income

2. Get incomes for a specific year:
   GET /api/income?year=2023

3. Get incomes for a specific month:
   GET /api/income?year=2023&month=10

4. Get incomes for a specific date:
   GET /api/income?date=2023-10-01

5. Get incomes for a specific category:
   GET /api/income?category_id=1

6. Get incomes for a specific payment method:
   GET /api/income?payment_method_id=2

7. Get incomes for a specific year and category:
   GET /api/income?year=2023&category_id=1

8. Get incomes for a specific month and payment method:
   GET /api/income?year=2023&month=10&payment_method_id=2
*/

// Add a new income
export async function POST(request: Request) {
    try {
        const body: Income = await request.json();
        const { amount, date, category_id, payment_method_id, description } = body;

        if (!amount || !date || !category_id || !payment_method_id) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if category_id exist
        const categoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [category_id]);
        
        if (categoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid category_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if payment_method_id exist
        const paymentMethodCheck = await pool.query('SELECT 1 FROM payment_method WHERE payment_method_id = $1', [payment_method_id]);
        
        if (paymentMethodCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid payment_method_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'INSERT INTO income (amount, date, category_id, payment_method_id, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [amount, date, category_id, payment_method_id, description]
        );
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        let errorMessage = 'Failed to add income';
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

/*
Sample JSON for adding a new income:
{
    "amount": 1000,
    "date": "2023-10-01",
    "category_id": 1,
    "payment_method_id": 2,
    "description": "Salary for October"
}

To handle bulk addition of incomes, you can create a new endpoint that accepts an array of income objects. For example:

export async function POST_BULK(request: Request) {
    try {
        const incomes: Income[] = await request.json();

        const values = incomes.map(({ amount, date, category_id, payment_method_id, description }) => 
            `(${amount}, '${date}', ${category_id}, ${payment_method_id}, '${description}')`
        ).join(',');

        const query = `
            INSERT INTO income (amount, date, category_id, payment_method_id, description)
            VALUES ${values}
            RETURNING *;
        `;

        const result = await pool.query(query);
        return new Response(JSON.stringify(result.rows), {
            status: 201,
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

To upload incomes from an Excel file, you can convert the Excel data to JSON format on the client side using libraries like `xlsx` and then send the JSON data to the bulk addition endpoint.
*/
