import pool from '@/lib/postgres';

// Define the expected shape of the bank account data
interface BankAccount {
    account_name: string;
    balance: number;
}

// Get all bank accounts
export async function GET(request: Request) {
    try {
        const result = await pool.query('SELECT * FROM bank_account ORDER BY bank_account_id ASC');
        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch bank accounts' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Add a new bank account
export async function POST(request: Request) {
    try {
        const body: BankAccount = await request.json();
        const { account_name, balance } = body;

        if (!account_name || balance === undefined) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'INSERT INTO bank_account (account_name, balance, updated_at) VALUES ($1, $2, NOW()) RETURNING *',
            [account_name, balance]
        );

        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add bank account' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}