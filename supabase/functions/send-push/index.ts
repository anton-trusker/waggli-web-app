
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push'

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// VAPID Keys should be env vars
const vapidCategory = {
    publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
    privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
    email: 'admin@waggly.app'
}

webpush.setVapidDetails(
    `mailto:${vapidCategory.email}`,
    vapidCategory.publicKey,
    vapidCategory.privateKey
);

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { user_id, title, body, url } = await req.json()

        // 1. Get User Subscriptions
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', user_id)

        if (error) throw error

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // 2. Send Push to each
        const results = await Promise.all(subscriptions.map(async (sub) => {
            try {
                const pushConfig = {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: sub.auth,
                        p256dh: sub.p256dh
                    }
                }

                const payload = JSON.stringify({
                    title,
                    body,
                    url,
                    icon: '/icon-192x192.png'
                })

                await webpush.sendNotification(pushConfig, payload)
                return { status: 'fulfilled', id: sub.id }
            } catch (err: any) {
                if (err.statusCode === 410) {
                    // Subscription gone, delete
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id)
                }
                return { status: 'rejected', error: err }
            }
        }))

        // 3. Log Notification
        await supabase.from('notification_logs').insert({
            user_id,
            title,
            body,
            type: 'push',
            sent_at: new Date().toISOString()
        })

        return new Response(
            JSON.stringify({ success: true, results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
