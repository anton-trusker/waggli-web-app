import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { key, text, targetLanguage, category } = await req.json()

        if (!key || !text || !targetLanguage) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: key, text, targetLanguage' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Step 1: Check if translation already exists in database
        const { data: existingTranslation } = await supabase
            .from('translations')
            .select('translations')
            .eq('key', key)
            .single()

        // If translation exists and has the target language, return cached version
        if (existingTranslation?.translations?.[targetLanguage]) {
            console.log(`Cache hit for key: ${key}, language: ${targetLanguage}`)
            return new Response(
                JSON.stringify({
                    translation: existingTranslation.translations[targetLanguage],
                    cached: true
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Step 2: Translation not found, call Gemini API
        console.log(`Cache miss for key: ${key}, language: ${targetLanguage}. Calling Gemini API...`)

        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const languageMap: Record<string, string> = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'tr': 'Turkish',
            'pl': 'Polish',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish'
        }

        const languageName = languageMap[targetLanguage] || targetLanguage

        const prompt = `Translate the following text to ${languageName}. Return ONLY the translated text, nothing else:\n\n"${text}"`

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', errorText)
            return new Response(
                JSON.stringify({ error: 'Translation API failed', details: errorText }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const geminiData = await geminiResponse.json()
        const translation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!translation) {
            return new Response(
                JSON.stringify({ error: 'No translation returned from API' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Step 3: Store translation in database
        const translationsUpdate: Record<string, any> = existingTranslation?.translations || {}
        translationsUpdate[targetLanguage] = translation

        await supabase
            .from('translations')
            .upsert({
                key,
                translations: translationsUpdate,
                category: category || 'general',
                updated_at: new Date().toISOString()
            })

        console.log(`Stored new translation for key: ${key}, language: ${targetLanguage}`)

        return new Response(
            JSON.stringify({
                translation,
                cached: false
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error in ai-translate function:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
