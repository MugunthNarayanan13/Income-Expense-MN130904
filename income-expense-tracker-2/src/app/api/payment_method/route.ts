import pool from "@/lib/postgres";

// Define the expected shape of the payment method data
interface PaymentMethod {
    payment_method_name: string;
}

// Get all payment methods
export async function GET(request: Request) {
    try {
        const result = await pool.query('SELECT * FROM payment_method ORDER BY payment_method_id ASC');
        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch payment methods' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Add a new payment method
export async function POST(request: Request) {
    try {
        const body: PaymentMethod = await request.json();
        const { payment_method_name } = body;

        if (!payment_method_name) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'INSERT INTO payment_method (payment_method_name) VALUES ($1) RETURNING *',
            [payment_method_name]
        );

        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add payment method' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}