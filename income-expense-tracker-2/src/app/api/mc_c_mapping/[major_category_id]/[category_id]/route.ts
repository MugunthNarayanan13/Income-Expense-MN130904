import pool from '@/lib/postgres';

// Define the expected shape of the mc_c_mapping data
interface MCCMapping {
    major_category_id: number;
    category_id: number;
}

// Get a single mapping
export async function GET(request: Request, { params }: { params: { major_category_id: string, category_id: string } }) {
    try {
        const { major_category_id, category_id } = await params;
        const result = await pool.query(
            'SELECT * FROM mc_c_mapping WHERE major_category_id = $1 AND category_id = $2',
            [major_category_id, category_id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Mapping not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to fetch mapping' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Delete a mapping
export async function DELETE(request: Request, { params }: { params: { major_category_id: string, category_id: string } }) {
    try {
        const { major_category_id, category_id } = params;
        const result = await pool.query(
            'DELETE FROM mc_c_mapping WHERE major_category_id = $1 AND category_id = $2 RETURNING *',
            [major_category_id, category_id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Mapping not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to delete mapping' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Update a mapping
export async function PUT(request: Request, { params }: { params: { major_category_id: string, category_id: string } }) {
    try {
        const { major_category_id, category_id } = params;
        const body: MCCMapping = await request.json();

        if (!body.major_category_id || !body.category_id) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ensure the new major_category_id exists
        const newMajorCategoryCheck = await pool.query('SELECT 1 FROM major_category WHERE major_category_id = $1', [body.major_category_id]);
        if (newMajorCategoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid new major_category_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ensure the new category_id exists
        const newCategoryCheck = await pool.query('SELECT 1 FROM category WHERE category_id = $1', [body.category_id]);
        if (newCategoryCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Invalid new category_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Ensure the old mapping exists
        const currentmappingCheck = await pool.query(
            'SELECT 1 FROM mc_c_mapping WHERE major_category_id = $1 AND category_id = $2',
            [major_category_id, category_id]
        );
        if (currentmappingCheck.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Mapping not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if the new mapping already exists
        const mappingCheck = await pool.query(
            'SELECT 1 FROM mc_c_mapping WHERE major_category_id = $1 AND category_id = $2',
            [body.major_category_id, body.category_id]
        );
        if (mappingCheck.rowCount > 0) {
            return new Response(JSON.stringify({ error: 'Mapping already exists' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await pool.query(
            'UPDATE mc_c_mapping SET major_category_id = $1, category_id = $2 WHERE major_category_id = $3 AND category_id = $4 RETURNING *',
            [body.major_category_id, body.category_id, major_category_id, category_id]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Mapping not found' }), {
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
        return new Response(JSON.stringify({ error: 'Failed to update mapping' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
