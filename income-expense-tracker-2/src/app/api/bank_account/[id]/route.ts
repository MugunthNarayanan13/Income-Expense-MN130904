import pool from '@/lib/postgres';

// Define the expected shape of the bank account data
interface BankAccount {
    account_name: string;
    balance: number;
}

// Get a single bank account
export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const result = await pool.query('SELECT * FROM bank_account WHERE bank_account_id = $1', [id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Bank account not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to fetch bank account' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Update a bank account
export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const body: BankAccount = await request.json();
        const { account_name, balance } = body;

        const result = await pool.query(
            'UPDATE bank_account SET account_name = $1, balance = $2, updated_at = NOW() WHERE bank_account_id = $3 RETURNING *',
            [account_name, balance, id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Bank account not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to update bank account' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Delete a bank account
export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const result = await pool.query('DELETE FROM bank_account WHERE bank_account_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Bank account not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to delete bank account' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
