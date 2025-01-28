import pool from '@/lib/postgres';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW()');
    return new Response(
      JSON.stringify({ message: 'Database connected successfully', time: result.rows[0].now }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Database connection failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
