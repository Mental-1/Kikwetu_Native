import {supabase} from '@/lib/supabase'
import type {Category} from '@/types/types'

// GET handler for /api/listings
export async function GET(request: Request) {
    try {
        // Fetch paginated data from Supabase
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, icon');

        if (error) {
            console.error('Supabase error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Return  data and total for client-side display
        return new Response(
            JSON.stringify({
                data: data as Category[],
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (err) {
        console.error('Server error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}