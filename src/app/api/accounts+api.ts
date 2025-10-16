import {supabase} from '@/lib/supabase'
import type { User} from '@/types/types'

// GET handler for /api/account
export async function GET(request: Request) {
    try {

        // Fetch paginated data from Supabase
        const { data, error } = await supabase
            .from('profile')
            .select('*')
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
                data: data as User[],
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
