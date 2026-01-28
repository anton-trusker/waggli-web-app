-- Check if reference_breeds table exists and has data
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'reference_breeds';

-- Check breed data
SELECT 
    species,
    COUNT(*) as breed_count,
    STRING_AGG(name, ', ' ORDER BY name) as sample_breeds
FROM reference_breeds 
GROUP BY species
ORDER BY species;

-- Check if reference_vaccines table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'reference_vaccines';

-- Check vaccine data if table exists
SELECT 
    species,
    COUNT(*) as vaccine_count,
    STRING_AGG(name, ', ' ORDER BY name) as sample_vaccines
FROM reference_vaccines 
GROUP BY species
ORDER BY species;
