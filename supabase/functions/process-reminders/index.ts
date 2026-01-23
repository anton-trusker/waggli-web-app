
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase Client (Service Role needed to read all users' reminders)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get due reminders that haven't been notified (assuming we track 'notified' flag or check time window)
        // For simplicity, we'll check for reminders due in the next hour created/updated recently?
        // Better strategy: Add 'last_notified_at' to reminders or use a separate log. 
        // For this V1, let's assume we fetch all reminders for "Today" that match current hour, 
        // and relying on client state or a 'processed' flag. 
        // A robust system would need a 'notification_sent' flag on the reminder or a separate job table.

        // Let's assume we want to push notifications for reminders due in the next 15 mins
        const now = new Date()
        const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

        // Fetch users with reminders due now
        // (This query is simplified; real logic needs timezone handling)
        const { data: dueReminders, error } = await supabaseClient
            .from('reminders')
            .select('*, users(preferences)') // Join user to check notification prefs
            .eq('date', now.toISOString().split('T')[0])
            .eq('completed', false)
        // .eq('time', timeStr) // Strict equality might miss checks. 
        // In reality, run every 10 mins and check range.

        if (error) throw error;

        console.log(`Checking reminders: found ${dueReminders?.length || 0}`);

        // Loop and notify
        const notifications = [];
        for (const r of dueReminders || []) {
            // Mock sending push
            console.log(`Sending alert for: ${r.title} to User ${r.user_id}`);

            // Insert into Notifications table
            notifications.push({
                user_id: r.user_id,
                title: 'Reminder Due',
                message: `It's time for: ${r.title}`,
                type: 'reminder',
                read: false
            })
        }

        if (notifications.length > 0) {
            await supabaseClient.from('notifications').insert(notifications);
        }

        return new Response(JSON.stringify({ success: true, count: notifications.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
