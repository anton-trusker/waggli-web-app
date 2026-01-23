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
        const { petId, symptoms, imageBase64 } = await req.json()

        if (!petId || !symptoms) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: petId, symptoms' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get Gemini API key
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get pet details for context
        const { data: pet } = await supabase
            .from('pets')
            .select('name, species, breed, age, weight_value, weight_unit')
            .eq('id', petId)
            .single()

        const petContext = pet
            ? `Pet: ${pet.name}, ${pet.species}${pet.breed ? ` (${pet.breed})` : ''}, ${pet.age || 'Unknown age'}${pet.weight_value ? `, ${pet.weight_value}${pet.weight_unit}` : ''}`
            : 'Pet details not available'

        // Build prompt for Gemini
        const prompt = `You are a veterinary AI assistant. Analyze the following pet symptoms and provide a structured assessment.

${petContext}

Symptoms: ${symptoms}

Provide your analysis in the following JSON format:
{
  "conditionName": "Most likely condition or symptom description",
  "severity": "Low|Moderate|High|Critical",
  "explanation": "Detailed explanation of the condition and why these symptoms are concerning",
  "immediateActions": ["Action 1", "Action 2", "..."],
  "shouldSeeVet": true|false,
  "whenToSeeVet": "Immediately|Within 24 hours|Within a week|Monitor at home",
  "additionalNotes": "Any other relevant information or observations"
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or extra text.`

        // Prepare request body for Gemini API
        const parts: any[] = [{ text: prompt }]

        // Add image if provided
        if (imageBase64) {
            parts.unshift({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64
                }
            })
        }

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', errorText)
            return new Response(
                JSON.stringify({ error: 'AI analysis failed', details: errorText }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const geminiData = await geminiResponse.json()
        const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!analysisText) {
            return new Response(
                JSON.stringify({ error: 'No analysis returned from AI' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse JSON response (remove markdown code blocks if present)
        let analysis
        try {
            const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            analysis = JSON.parse(cleanedText)
        } catch (e) {
            console.error('Failed to parse AI response:', analysisText)
            return new Response(
                JSON.stringify({ error: 'Failed to parse AI response', raw: analysisText }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get owner_id for the pet
        const { data: petOwner } = await supabase
            .from('pets')
            .select('owner_id')
            .eq('id', petId)
            .single()

        if (!petOwner) {
            return new Response(
                JSON.stringify({ error: 'Pet not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Save analysis to database as health record
        const { data: healthRecord, error: insertError } = await supabase
            .from('health_records')
            .insert({
                owner_id: petOwner.owner_id,
                pet_id: petId,
                type: 'ai_insight',
                title: `AI Symptom Analysis: ${analysis.conditionName}`,
                description: analysis.explanation,
                date_recorded: new Date().toISOString().split('T')[0],
                metadata: {
                    symptoms,
                    severity: analysis.severity,
                    immediateActions: analysis.immediateActions,
                    shouldSeeVet: analysis.shouldSeeVet,
                    whenToSeeVet: analysis.whenToSeeVet,
                    additionalNotes: analysis.additionalNotes,
                    hasImage: !!imageBase64,
                    analyzedAt: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error saving health record:', insertError)
        } else {
            console.log('Saved AI analysis as health record:', healthRecord.id)
        }

        return new Response(
            JSON.stringify({
                ...analysis,
                recordId: healthRecord?.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error in ai-symptom-analysis function:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
