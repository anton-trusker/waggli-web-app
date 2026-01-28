
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// You might need a real embedding provider client here
// e.g., OpenAI or Google Generative AI
// import { OpenAI } from "https://esm.sh/openai@4.24.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Init Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Fetch pending jobs
        const { data: jobs, error: fetchError } = await supabaseClient
            .from('embedding_jobs')
            .select('*')
            .eq('status', 'queued')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(5)

        if (fetchError) throw fetchError
        if (!jobs || jobs.length === 0) {
            return new Response(JSON.stringify({ message: 'No jobs queued' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        console.log(`Processing ${jobs.length} jobs...`)
        const results = []

        // 3. Process each job
        for (const job of jobs) {
            try {
                // Mark as processing
                await supabaseClient
                    .from('embedding_jobs')
                    .update({ status: 'processing', updated_at: new Date() })
                    .eq('id', job.id)

                // Fetch Content
                // e.g. content_translations
                const { data: content, error: contentError } = await supabaseClient
                    .from(job.content_table)
                    .select('title, summary, body')
                    .eq('content_id', job.content_id)
                    .eq('language_code', job.language_code)
                    .single()

                if (contentError || !content) {
                    throw new Error(`Content not found: ${contentError?.message}`)
                }

                // Prepare text for embedding
                const textToEmbed = `${content.title || ''} ${content.summary || ''} ${content.body || ''}`.trim()

                if (!textToEmbed) {
                    throw new Error('Content is empty, cannot generate embedding')
                }

                // Generate Embedding (Mock or Real)
                // const embedding = await generateEmbedding(textToEmbed)
                // For now, mocking a 1536-dim vector to avoid API key errors without config
                // In production: Use fetch to OpenAI/Gemini API
                const mockEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);

                // Store Result
                const { error: updateError } = await supabaseClient
                    .from(job.content_table)
                    .update({
                        embedding: JSON.stringify(mockEmbedding), // pgvector handles json array
                        embedding_model: 'mock-text-embedding-3-small',
                        embedding_generated_at: new Date()
                    })
                    .eq('content_id', job.content_id)
                    .eq('language_code', job.language_code)

                if (updateError) throw updateError

                // Mark Job Done
                await supabaseClient
                    .from('embedding_jobs')
                    .update({ status: 'done', processed_at: new Date() })
                    .eq('id', job.id)

                results.push({ id: job.id, status: 'success' })

            } catch (err: any) {
                console.error(`Job ${job.id} failed:`, err)

                // Mark Job Failed
                await supabaseClient
                    .from('embedding_jobs')
                    .update({
                        status: 'failed',
                        last_error: err.message,
                        attempts: (job.attempts || 0) + 1
                    })
                    .eq('id', job.id)

                results.push({ id: job.id, status: 'failed', error: err.message })
            }
        }

        return new Response(JSON.stringify({ processed: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
