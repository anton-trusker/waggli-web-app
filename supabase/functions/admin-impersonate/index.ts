
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verify the requester is an admin
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        // Check admin_profiles table
        const { data: adminProfile } = await supabaseClient
            .from('admin_profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!adminProfile) {
            return new Response(JSON.stringify({ error: 'Not an admin' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 2. Get target user ID from body
        const { target_user_id } = await req.json();
        if (!target_user_id) throw new Error('Missing target_user_id');

        // 3. Create a magic link or token for the target user
        // Note: Supabase Admin API is needed here (Service Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Generate a signed-in session for the target user (valid for 1 hour)
        // We strictly shouldn't just "give" a token without 2FA in high sec auth, 
        // but for "Impersonate", we typically mint a new token.
        // However, Supabase simpler method: Admin `generateLink` type `magiclink` 
        // OR create a session manually if we want to be fancy.

        // Simplest: Create a magic link that auto-redirects? No, we want instant access.
        // We will use admin.auth.admin.generateLink or just sign a JWT manually if we had the secret.
        // Better: use `admin.auth.admin.getUserById` then something?

        // Actually, Supabase doesn't have a direct "mint token" API public yet commonly.
        // Workaround: We can't easily mint a token without internal keys.
        // ALT STRATEGY: We will use a "Shadow Session". 
        // BUT for now, let's assume we can use `admin.auth.admin.generateLink` for type `magiclink` 
        // and return that URL. The admin frontend will open it in a new window/tab?
        // Or we can try to return the `data.session` if we use `signInWithPassword` (not possible without pass).

        // Real Solution for Impersonation in Supabase:
        // There isn't a native "Impersonate" call. 
        // Providing a Magic Link is the standard secure way.

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: (await supabaseAdmin.auth.admin.getUserById(target_user_id)).data.user?.email!,
        });

        if (linkError) throw linkError;

        return new Response(JSON.stringify({
            impersonation_url: linkData.properties.action_link,
            message: 'Redirect to this URL to login as user'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
