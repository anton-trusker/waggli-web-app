
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SECRET_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migratePets = async () => {
    console.log('Starting pet migration...');

    // 1. Fetch all pets
    const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .is('species_id', null); // Only migrate pending

    if (petsError) {
        console.error('Error fetching pets:', petsError);
        return;
    }

    console.log(`Found ${pets.length} pets to migrate.`);

    // 2. Cache Reference Data
    const { data: speciesRef } = await supabase.from('species').select('id, code, name_key');
    const { data: breedsRef } = await supabase.from('breeds').select('id, name, species_id');

    if (!speciesRef || !breedsRef) {
        console.error('Reference data missing.');
        return;
    }

    // Helper to find species ID
    const findSpeciesId = (text: string) => {
        if (!text) return null;
        const lower = text.toLowerCase();
        const match = speciesRef.find(s => s.code === lower || s.name_key.includes(lower));
        return match ? match.id : null;
    };

    // Helper to find breed ID
    const findBreedId = (text: string, speciesId: string | null) => {
        if (!text) return null;
        const lower = text.toLowerCase();
        // Filter by species if known
        const candidates = speciesId
            ? breedsRef.filter(b => b.species_id === speciesId)
            : breedsRef;

        const match = candidates.find(b => b.name.toLowerCase() === lower);
        return match ? match.id : null;
    };

    // 3. Update each pet
    let updatedCount = 0;
    for (const pet of pets) {
        const speciesId = findSpeciesId(pet.species || pet.type); // Handle legacy column name variants
        const breedId = findBreedId(pet.breed, speciesId);

        if (speciesId || breedId) {
            const { error } = await supabase
                .from('pets')
                .update({
                    species_id: speciesId,
                    breed_id: breedId
                })
                .eq('id', pet.id);

            if (error) {
                console.error(`Failed to update pet ${pet.id}:`, error.message);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} pets.`);
};

migratePets();
