import {supabase} from '@/lib/supabase'
import type {Listing} from '@/types/types'

// GET handler for /api/listings
export async function GET(request: Request) {
    try {
        // Extract pagination params from query string
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = 20;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Fetch paginated data from Supabase
        const { data, error, count } = await supabase
            .from('listings')
            .select('*', { count: 'exact' })
            .range(from, to)
            .order('id', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Return paginated data and total count for client-side pagination
        return new Response(
            JSON.stringify({
                data: data as Listing[],
                total: count,
                page,
                pageSize,
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

// What this file should do:
// 1. Initiate a supabase client , which involves getting the supabase client from the supabase instance.
// 2. Create a function to fetch the data and return it as a json string,
// 3. Fetch it in chunks of 20 for pagination.
// 4. Use React query to manage the different lifecycle points for loading and error states,