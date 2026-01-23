
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.VITE_SUPABASE_SECRET_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migratePets() {
    console.log('🔄 Starting Pet Data Migration...')

    // Fetch all pets - generic select to get all columns including potential legacy ones if they exist and return JSON
    const { data: pets, error } = await supabase.from('pets').select('*')

    if (error) {
        console.error('Error fetching pets:', error)
        return
    }

    console.log(`Found ${pets.length} pets. Checking for legacy data...`)

    let updatedCount = 0

    for (const pet of pets) {
        let updates: any = {}
        let needsUpdate = false

        // Check for birthday -> birth_date
        // Note: 'birthday' might not be in the returned object if the column doesn't exist in DB.
        // But if it does, we migrate it.
        // Also check if birth_date is missing but we have age or something else? No, just column mapping.

        // Use 'birthday' from the record if it exists (TS ignores extra props usually, but 'any' helps)
        const p = pet as any

        if (!p.birth_date && p.birthday) {
            console.log(`Migrating birthday for pet ${p.id}: ${p.birthday}`)
            updates.birth_date = p.birthday
            needsUpdate = true
        }

        // Check for image -> image_url
        if (!p.image_url && p.image) {
            console.log(`Migrating image for pet ${p.id}`)
            updates.image_url = p.image
            needsUpdate = true
        }

        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('pets')
                .update(updates)
                .eq('id', p.id)

            if (updateError) {
                console.error(`Failed to update pet ${p.id}:`, updateError)
            } else {
                updatedCount++
            }
        }
    }

    console.log(`✅ Migration complete. Updated ${updatedCount} pets.`)
}

migratePets()
