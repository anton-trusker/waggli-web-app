import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.VITE_SUPABASE_SECRET_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SECRET_KEY environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to read and parse CSV
function readCSV(filename: string): any[] {
    const filePath = path.join(__dirname, '..', 'doc', filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    })
}

// Convert CSV boolean strings to actual booleans
function parseBoolean(value: string): boolean | null {
    if (!value || value === '') return null
    const lower = value.toLowerCase()
    return lower === 'yes' || lower === 'true' || lower === '1'
}

// Import dog breeds
async function importDogBreeds() {
    console.log('📦 Importing dog breeds...')
    const records = readCSV('all_dog_breeds_comprehensive_expanded.csv')

    const dogBreeds = records.map(record => ({
        breed_name: record.Breed_Name,
        fci_group: record.FCI_Group || null,
        akc_group: record.AKC_Group || null,
        origin_country: record.Origin_Country || null,
        size_category: record.Size_Category || null,
        average_height_cm: record.Average_Height_cm || null,
        average_weight_kg: record.Average_Weight_kg || null,
        life_expectancy_years: record.Life_Expectancy_Years || null,
        temperament: record.Temperament || null,
        primary_purpose: record.Primary_Purpose || null,
        coat_type: record.Coat_Type || null,
        color_varieties: record.Color_Varieties || null,
        training_difficulty: record.Training_Difficulty || null,
        exercise_needs: record.Exercise_Needs || null,
        grooming_needs: record.Grooming_Needs || null,
        good_with_families: parseBoolean(record.Good_With_Families),
        good_with_children: parseBoolean(record.Good_With_Children),
        shedding_level: record.Shedding_Level || null,
        health_concerns: record.Health_Concerns || null
    }))

    // Insert into legacy table
    const { error: legacyError } = await supabase
        .from('dog_breeds')
        .upsert(dogBreeds, { onConflict: 'breed_name', ignoreDuplicates: false })

    if (legacyError) {
        console.error('❌ Error importing dog breeds (legacy):', legacyError)
    } else {
        console.log(`✅ Imported ${dogBreeds.length} dog breeds (Legacy)`)
    }

    // Insert into Unified reference_breeds
    const unifiedBreeds = dogBreeds.map(b => ({
        species: 'Dog',
        name: b.breed_name
    }))

    const { error: unifiedError } = await supabase
        .from('reference_breeds')
        .upsert(unifiedBreeds, { onConflict: 'name', ignoreDuplicates: true }) // Using name as conflict target might be risky if cat/dog share names, but simpler for now. Ideally composite (species, name).

    if (unifiedError) {
        console.error('❌ Error importing dog breeds (Unified):', unifiedError)
    } else {
        console.log(`✅ Imported ${unifiedBreeds.length} dog breeds (Unified)`)
    }
}

// Import cat breeds
async function importCatBreeds() {
    console.log('📦 Importing cat breeds...')
    const records = readCSV('all_cat_breeds_comprehensive_expanded.csv')

    const catBreeds = records.map(record => ({
        breed_name: record.Breed_Name?.replace('np', '').trim() || record.Breed_Name, // Remove 'np' prefix if exists
        registry_groups: record.Registry_Groups || null,
        origin_country: record.Origin_Country || null,
        size_category: record.Size_Category || null,
        average_height_cm: record.Average_Height_cm || null,
        average_weight_kg: record.Average_Weight_kg || null,
        life_expectancy_years: record.Life_Expectancy_Years || null,
        temperament: record.Temperament || null,
        coat_type: record.Coat_Type || null,
        color_varieties: record.Color_Varieties || null,
        coat_length: record.Coat_Length || null,
        training_difficulty: record.Training_Difficulty || null,
        activity_level: record.Activity_Level || null,
        grooming_needs: record.Grooming_Needs || null,
        good_with_families: parseBoolean(record.Good_With_Families),
        good_with_children: parseBoolean(record.Good_With_Children),
        shedding_level: record.Shedding_Level || null,
        health_concerns: record.Health_Concerns || null,
        unique_traits: record.Unique_Traits || null
    }))

    // Insert into legacy table
    const { error: legacyError } = await supabase
        .from('cat_breeds')
        .upsert(catBreeds, { onConflict: 'breed_name', ignoreDuplicates: false })

    if (legacyError) {
        console.error('❌ Error importing cat breeds (legacy):', legacyError)
    } else {
        console.log(`✅ Imported ${catBreeds.length} cat breeds (Legacy)`)
    }

    // Insert into Unified reference_breeds
    const unifiedBreeds = catBreeds.map(b => ({
        species: 'Cat',
        name: b.breed_name
    }))

    const { error: unifiedError } = await supabase
        .from('reference_breeds')
        .upsert(unifiedBreeds, { onConflict: 'name', ignoreDuplicates: true })

    if (unifiedError) {
        console.error('❌ Error importing cat breeds (Unified):', unifiedError)
    } else {
        console.log(`✅ Imported ${unifiedBreeds.length} cat breeds (Unified)`)
    }
}

// Import pet vaccines
async function importVaccines() {
    console.log('📦 Importing pet vaccines...')
    const records = readCSV('pet_vaccinations_comprehensive_expanded.csv')

    const vaccines = records.map(record => ({
        brand_name: record.Brand_Name,
        vaccine_type: record.Type || null,
        protects_against: record.Protects_Against || null,
        generic_name: record.Generic_Name || null,
        pet_type: record.Pet_Type,
        duration: record.Duration || null,
        description: record.Description || null,
        vaccine_category: record.Vaccine_Category || null,
        administration_route: record.Administration_Route || null,
        core_noncore: record.Core_NonCore || null
    }))

    const { data, error } = await supabase
        .from('pet_vaccines')
        .insert(vaccines)

    if (error) {
        console.error('❌ Error importing vaccines:', error)
    } else {
        console.log(`✅ Imported ${vaccines.length} vaccine records`)
    }
}

// Import pet medications
async function importMedications() {
    console.log('📦 Importing pet medications...')
    const records = readCSV('pet_medicines_comprehensive_expanded.csv')

    const medications = records.map(record => ({
        brand_name: record.Brand_Name,
        generic_name: record.Generic_Name || null,
        medication_type: record.Type || null,
        pet_type: record.Pet_Type,
        disease_treatment: record.Disease_Treatment || null,
        dosage: record.Dosage || null,
        dosage_unit: record.Dosage_Unit || null,
        administration_route: record.Administration_Route || null,
        duration_frequency: record.Duration_Frequency || null,
        description: record.Description || null,
        manufacturer: record.Manufacturer || null,
        common_side_effects: record.Common_Side_Effects || null
    }))

    const { data, error } = await supabase
        .from('pet_medications')
        .insert(medications)

    if (error) {
        console.error('❌ Error importing medications:', error)
    } else {
        console.log(`✅ Imported ${medications.length} medication records`)
    }
}

// Import pet requirements
async function importRequirements() {
    console.log('📦 Importing pet requirements...')
    const records = readCSV('pet_mandatory_requirements.csv')

    const requirements = records.map(record => ({
        pet_type: record.Pet_Type,
        category: record.Category || null,
        item_name: record.Item_Name,
        requirement_type: record.Type || null,
        frequency: record.Frequency || null,
        age_start: record.Age_Start || null,
        legal_status: record.Legal_Status || null,
        verification_method: record.Verification_Method || null,
        grace_period_days: record.Grace_Period_Days ? parseInt(record.Grace_Period_Days) : null,
        penalty_description: record.Penalty_Description || null
    }))

    const { data, error } = await supabase
        .from('pet_requirements')
        .insert(requirements)

    if (error) {
        console.error('❌ Error importing requirements:', error)
    } else {
        console.log(`✅ Imported ${requirements.length} requirement records`)
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting static data import...\n')

    try {
        await importDogBreeds()
        await importCatBreeds()
        await importVaccines()
        await importMedications()
        await importRequirements()

        console.log('\n✨ All data imported successfully!')
    } catch (error) {
        console.error('\n❌ Import failed:', error)
        process.exit(1)
    }
}

main()
