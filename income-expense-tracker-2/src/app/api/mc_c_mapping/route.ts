import pool from '@/lib/postgres';

// Define the expected shape of the mc_c_mapping data
interface MCCMapping {
    major_category_id: number;
    category_id: number;
}

// Get all mappings with optional filtration
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const majorCategoryId = url.searchParams.get('major_category_id');
        const categoryId = url.searchParams.get('category_id');

        let query = 'SELECT * FROM mc_c_mapping';
        const queryParams: any[] = [];

        if (majorCategoryId || categoryId) {
            query += ' WHERE';
            if (majorCategoryId) {
                queryParams.push(majorCategoryId);
                query += ` major_category_id = $${queryParams.length}`;
            }
            if (categoryId) {
                if (queryParams.length > 0) query += ' AND';
                queryParams.push(categoryId);
                query += ` category_id = $${queryParams.length}`;
            }
        }

        query += ' ORDER BY major_category_id, category_id';

        const result = await pool.query(query, queryParams);
        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch mappings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Add a new mapping
export async function POST(request: Request) {
    try {
        const body: MCCMapping = await request.json();
        const { major_category_id, category_id } = body;

        if (!major_category_id || !category_id) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ensure the major_category_id exists
        const majorCategoryCheck = await pool.query('SELECT 1 FROM major_category WHERE major_category_id = $1', [major_category_id]);
        if (majorCategoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid major_category_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ensure the category_id exists
        const categoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [category_id]);
        if (categoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid category_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if the mapping already exists
        const mappingCheck = await pool.query('SELECT 1 FROM mc_c_mapping WHERE major_category_id = $1 AND category_id = $2', [major_category_id, category_id]);
        if (mappingCheck.rowCount > 0) {
            return new Response(JSON.stringify({ error: 'Mapping already exists' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'INSERT INTO mc_c_mapping (major_category_id, category_id) VALUES ($1, $2) RETURNING *',
            [major_category_id, category_id]
        );

        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to add mapping' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
