
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SECRET_KEY; // Use secret key for admin bypass

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SECRET_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CsvRow {
    Breed_Name: string;
    FCI_Group: string;
    AKC_Group: string;
    Origin_Country: string;
    Size_Category: string;
    Average_Height_cm: string;
    Average_Weight_kg: string;
    Life_Expectancy_Years: string;
    Temperament: string;
    Primary_Purpose: string;
    Coat_Type: string;
    Color_Varieties: string;
    Training_Difficulty: string;
    Exercise_Needs: string;
    Grooming_Needs: string;
    Good_With_Families: string;
    Good_With_Children: string;
    Shedding_Level: string;
    Health_Concerns: string;
}

// Parse range string "25-30" -> [25, 30]
const parseRange = (rangeStr: string): { min: number; max: number } => {
    if (!rangeStr) return { min: 0, max: 0 };
    const parts = rangeStr.split('-').map(s => parseFloat(s.trim()));
    if (parts.length === 2) return { min: parts[0], max: parts[1] };
    if (parts.length === 1 && !isNaN(parts[0])) return { min: parts[0], max: parts[0] };
    return { min: 0, max: 0 };
};

// Split string and clean "Confident; Curious" -> ["Confident", "Curious"]
const parseArray = (str: string): string[] => {
    if (!str) return [];
    return str.split(';').map(s => s.trim()).filter(s => s.length > 0);
};

const importBreeds = async () => {
    console.log('Starting breed import...');

    // 1. Get Dog Species ID
    const { data: speciesData, error: speciesError } = await supabase
        .from('species')
        .select('id')
        .eq('code', 'dog')
        .single();

    if (speciesError || !speciesData) {
        console.error('Error: Could not find "dog" species. Run seeds first.');
        return;
    }
    const dogId = speciesData.id;
    console.log(`Found Dog Species ID: ${dogId}`);

    // 2. Read CSV
    const csvPath = path.resolve(__dirname, '../doc/all_dog_breeds_comprehensive_expanded.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records: CsvRow[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`Parsed ${records.length} records. Preparing insert...`);

    // 3. Transform Data
    const inserts = records.map(row => {
        const height = parseRange(row.Average_Height_cm);
        const weight = parseRange(row.Average_Weight_kg);
        const life = parseRange(row.Life_Expectancy_Years);

        return {
            species_id: dogId,
            name: row.Breed_Name,
            slug: row.Breed_Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),

            // Groups
            fci_group: row.FCI_Group,
            akc_group: row.AKC_Group,
            origin_country: row.Origin_Country,
            size_category: row.Size_Category,

            // Physical
            average_height_cm_min: height.min,
            average_height_cm_max: height.max,
            average_weight_kg_min: weight.min,
            average_weight_kg_max: weight.max,
            life_expectancy_years_min: life.min,
            life_expectancy_years_max: life.max,

            // Arrays
            temperament: parseArray(row.Temperament),
            health_concerns: parseArray(row.Health_Concerns),

            // Descriptive
            primary_purpose: row.Primary_Purpose,
            training_difficulty: row.Training_Difficulty,
            exercise_needs: row.Exercise_Needs,
            grooming_needs: row.Grooming_Needs,
            coat_type: row.Coat_Type,
            shedding_level: row.Shedding_Level,

            // Booleans (Simple string check)
            good_with_families: row.Good_With_Families?.toLowerCase().includes('yes'),
            good_with_children: row.Good_With_Children?.toLowerCase().includes('yes')
        };
    });

    // 4. Batch Insert
    const batchSize = 50;
    for (let i = 0; i < inserts.length; i += batchSize) {
        const batch = inserts.slice(i, i + batchSize);
        const { error } = await supabase.from('breeds').upsert(batch, {
            onConflict: 'species_id,name',
            ignoreDuplicates: false
        });

        if (error) {
            console.error(`Error inserting batch ${i}:`, error.message);
        } else {
            console.log(`Inserted batch ${i} - ${i + batch.length}`);
        }
    }

    console.log('Import complete!');
};

importBreeds();
