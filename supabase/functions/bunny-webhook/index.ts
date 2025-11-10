import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-secret',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Optional: Verify with a secret header (set this in Bunny as a custom header if supported, or hardcode)
    const secret = req.headers.get('webhook-secret') || req.headers.get('X-Webhook-Secret')
    if (secret !== Deno.env.get('BUNNY_WEBHOOK_SECRET')) {  // Set this env var in Supabase dashboard
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const payload = await req.json()
    const { VideoLibraryId, VideoGuid, Status } = payload

    if (Status !== 3) {
      console.log(`Ignoring non-finished status: ${Status}`)
      return new Response('OK (ignored)', { status: 200, headers: corsHeaders })
    }

    // Fetch video details from Bunny API
    const bunnyApiKey = Deno.env.get('BUNNY_API_KEY') || '' 
    const libraryId = VideoLibraryId
    const response = await fetch(`https://video.bunnycdn.com/public/api/v1/videoLibrary/${libraryId}/video/${VideoGuid}`, {
      headers: { 'AccessKey': bunnyApiKey }
    })

    if (!response.ok) {
      throw new Error(`Bunny API error: ${response.status}`)
    }

    const videoData = await response.json()
    const hlsUrl = videoData.hls_master_playlist_url  // Or videoData.mp4_url if you prefer direct MP4

    // Insert into Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabase
      .from('videos')
      .insert({ bunny_guid: VideoGuid, hls_url: hlsUrl, status: 'encoded', library_id: libraryId })

    if (error) throw error

    console.log(`Video ${VideoGuid} added to DB with URL: ${hlsUrl}`)
    return new Response('OK', { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})