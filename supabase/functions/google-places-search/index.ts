import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
        const { category, lat, lng, radius = 5000 } = await req.json()

        if (!category || lat === undefined || lng === undefined) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: category, lat, lng' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
        if (!googleMapsApiKey) {
            return new Response(
                JSON.stringify({ error: 'GOOGLE_MAPS_API_KEY not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Map category to Google Places type
        const categoryTypeMap: Record<string, string> = {
            'Vet': 'veterinary_care',
            'Grooming': 'pet_store',
            'Store': 'pet_store',
            'Training': 'pet_store',
            'Boarding': 'pet_store',
            'Pet Sitting': 'pet_store',
            'Walking': 'park',
            'Other': 'pet_store'
        }

        const placeType = categoryTypeMap[category] || 'pet_store'

        // Step 1: Nearby Search to find places
        const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${placeType}&keyword=${category}&key=${googleMapsApiKey}`

        const nearbyResponse = await fetch(nearbySearchUrl)
        const nearbyData = await nearbyResponse.json()

        if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
            console.error('Google Places Nearby Search error:', nearbyData)
            return new Response(
                JSON.stringify({ error: 'Google Places API error', status: nearbyData.status }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (nearbyData.status === 'ZERO_RESULTS' || !nearbyData.results?.length) {
            return new Response(
                JSON.stringify({ results: [] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Step 2: For each place, get detailed information using Place Details API
        const detailedResults = await Promise.all(
            nearbyData.results.slice(0, 20).map(async (place: any) => {
                try {
                    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total,price_level,photos,types,address_components,geometry&key=${googleMapsApiKey}`

                    const detailsResponse = await fetch(detailsUrl)
                    const detailsData = await detailsResponse.json()

                    if (detailsData.status !== 'OK') {
                        console.warn(`Failed to get details for place ${place.place_id}:`, detailsData.status)
                        return null
                    }

                    const details = detailsData.result

                    // Parse address components
                    const addressComponents = details.address_components || []
                    const getComponent = (type: string) => {
                        const component = addressComponents.find((c: any) => c.types.includes(type))
                        return component?.long_name || ''
                    }

                    return {
                        place_id: place.place_id,
                        name: details.name,
                        rating: details.rating || 0,
                        review_count: details.user_ratings_total || 0,

                        // Address details
                        address: details.formatted_address || '',
                        address_components: {
                            street_number: getComponent('street_number'),
                            street: getComponent('route'),
                            city: getComponent('locality') || getComponent('administrative_area_level_2'),
                            state: getComponent('administrative_area_level_1'),
                            postal_code: getComponent('postal_code'),
                            country: getComponent('country')
                        },

                        // Contact information
                        phone: details.international_phone_number || '',
                        formatted_phone: details.formatted_phone_number || '',
                        website: details.website || '',

                        // Location
                        lat: details.geometry?.location?.lat || place.geometry?.location?.lat,
                        lng: details.geometry?.location?.lng || place.geometry?.location?.lng,

                        // Opening hours
                        opening_hours: details.opening_hours ? {
                            open_now: details.opening_hours.open_now || false,
                            weekday_text: details.opening_hours.weekday_text || []
                        } : null,

                        // Photos (return photo references)
                        photos: details.photos?.slice(0, 5).map((photo: any) => photo.photo_reference) || [],

                        // Types and categories
                        types: details.types || [],
                        price_level: details.price_level,

                        // Source
                        source: 'google'
                    }
                } catch (error) {
                    console.error(`Error fetching details for place ${place.place_id}:`, error)
                    return null
                }
            })
        )

        // Filter out null results (failed detail fetches)
        const validResults = detailedResults.filter(result => result !== null)

        console.log(`Found ${validResults.length} places for category: ${category}`)

        return new Response(
            JSON.stringify({
                results: validResults,
                count: validResults.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error in google-places-search function:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
