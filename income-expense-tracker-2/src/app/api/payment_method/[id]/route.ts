import pool from "@/lib/postgres";

// Define the expected shape of the payment method data
interface PaymentMethod {
    payment_method_name: string;
}

// Get a single payment method
export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const result = await pool.query('SELECT * FROM payment_method WHERE payment_method_id = $1', [id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Payment method not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to fetch payment method' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Update a payment method
export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const body: PaymentMethod = await request.json();
        const { payment_method_name } = body;

        const result = await pool.query(
            'UPDATE payment_method SET payment_method_name = $1 WHERE payment_method_id = $2 RETURNING *',
            [payment_method_name, id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Payment method not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to update payment method' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Delete a payment method
export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const result = await pool.query('DELETE FROM payment_method WHERE payment_method_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Payment method not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to delete payment method' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}