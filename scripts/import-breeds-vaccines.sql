-- Import Dog Breeds
INSERT INTO reference_breeds (species, name) 
SELECT 'Dog', breed_name 
FROM (
    SELECT 
        unnest(ARRAY[
            'Golden Retriever', 'Labrador Retriever', 'French Bulldog', 'German Shepherd', 
            'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Dachshund', 'Corgi', 
            'Husky', 'Other', 'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 
            'Akita', 'Alaskan Malamute', 'American Bulldog', 'American Eskimo Dog', 
            'Australian Shepherd', 'Australian Terrier', 'Basenji', 'Basset Hound', 
            'Beagle', 'Bernese Mountain Dog', 'Bichon Frise', 'Bloodhound', 
            'Border Collie', 'Boston Terrier', 'Boxer', 'Briard', 'Brittany', 
            'Brussels Griffon', 'Bull Terrier', 'Cairn Terrier', 'Canaan Dog', 
            'Cavalier King Charles Spaniel', 'Chesapeake Bay Retriever', 'Chihuahua', 
            'Chinese Crested', 'Chow Chow', 'Clumber Spaniel', 'Cocker Spaniel', 
            'Collie', 'Dandie Dinmont Terrier', 'Doberman Pinscher', 'English Cocker Spaniel', 
            'English Foxhound', 'English Setter', 'English Springer Spaniel', 'Field Spaniel', 
            'Finnish Spitz', 'Flat-Coated Retriever', 'French Bulldog', 'German Pinscher', 
            'German Shorthaired Pointer', 'German Wirehaired Pointer', 'Giant Schnauzer', 
            'Glen of Imaal Terrier', 'Golden Retriever', 'Gordon Setter', 'Great Dane', 
            'Greater Swiss Mountain Dog', 'Greyhound', 'Harrier', 'Havanese', 'Ibizan Hound', 
            'Irish Setter', 'Irish Terrier', 'Irish Water Spaniel', 'Irish Wolfhound', 
            'Jack Russell Terrier', 'Japanese Chin', 'Keeshond', 'Kerry Blue Terrier', 
            'Komondor', 'Kuvasz', 'Labrador Retriever', 'Lakeland Terrier', 'Lhasa Apso', 
            'Maltese', 'Manchester Terrier', 'Mastiff', 'Miniature Pinscher', 'Miniature Schnauzer', 
            'Neapolitan Mastiff', 'Newfoundland', 'Norfolk Terrier', 'Norwegian Elkhound', 
            'Norwich Terrier', 'Old English Sheepdog', 'Papillon', 'Pekingese', 'Pembroke Welsh Corgi', 
            'Petit Basset Griffon Vendeen', 'Pharaoh Hound', 'Pointer', 'Pomeranian', 'Poodle', 
            'Portuguese Water Dog', 'Pug', 'Puli', 'Rhodesian Ridgeback', 'Rottweiler', 
            'Saluki', 'Samoyed', 'Schipperke', 'Scottish Deerhound', 'Scottish Terrier', 
            'Sealyham Terrier', 'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 
            'Silky Terrier', 'Skye Terrier', 'Smooth Fox Terrier', 'Soft Coated Wheaten Terrier', 
            'Staffordshire Bull Terrier', 'Sussex Spaniel', 'Tibetan Mastiff', 'Tibetan Spaniel', 
            'Tibetan Terrier', 'Vizsla', 'Weimaraner', 'Welsh Springer Spaniel', 'Welsh Terrier', 
            'West Highland White Terrier', 'Whippet', 'Wire Fox Terrier', 'Wirehaired Pointing Griffon', 
            'Yorkshire Terrier'
        ]) as breed_name
) breeds
WHERE NOT EXISTS (
    SELECT 1 FROM reference_breeds rb 
    WHERE rb.species = 'Dog' AND rb.name = breeds.breed_name
);

-- Import Cat Breeds
INSERT INTO reference_breeds (species, name) 
SELECT 'Cat', breed_name 
FROM (
    SELECT 
        unnest(ARRAY[
            'Siamese', 'Persian', 'Maine Coon', 'Ragdoll', 'Bengal', 'Sphynx', 
            'British Shorthair', 'Abyssinian', 'Scottish Fold', 'Other', 'Abyssinian', 
            'American Bobtail', 'American Curl', 'American Shorthair', 'American Wirehair', 
            'Australian Mist', 'Balinese', 'Bengal', 'Birman', 'Bombay', 'British Longhair', 
            'British Shorthair', 'Burmese', 'Burmilla', 'Chartreux', 'Chausie', 'Cornish Rex', 
            'Cymric', 'Devon Rex', 'Egyptian Mau', 'European Burmese', 'Exotic Shorthair', 
            'Havana Brown', 'Japanese Bobtail', 'Javanese', 'Korat', 'Kurilian Bobtail', 
            'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung', 'Norwegian Forest Cat', 
            'Ocicat', 'Ojos Azules', 'Oriental Longhair', 'Oriental Shorthair', 'Persian', 
            'Peterbald', 'Pixie-bob', 'Ragamuffin', 'Ragdoll', 'Russian Blue', 'Savannah', 
            'Scottish Fold', 'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura', 'Snowshoe', 
            'Sokoke', 'Somali', 'Sphynx', 'Thai', 'Tonkinese', 'Toyger', 'Turkish Angora', 
            'Turkish Van'
        ]) as breed_name
) breeds
WHERE NOT EXISTS (
    SELECT 1 FROM reference_breeds rb 
    WHERE rb.species = 'Cat' AND rb.name = breeds.breed_name
);

-- Import Dog Vaccines
INSERT INTO reference_vaccines (species, name, type, frequency) 
SELECT 'Dog', vaccine_name, vaccine_type, vaccine_frequency
FROM (
    SELECT 
        unnest(ARRAY[
            ('Rabies', 'Core', 'Every 1-3 years'),
            ('DHPP', 'Core', 'Every 3 years'),
            ('Bordetella', 'Non-Core', 'Every 6 months'),
            ('Lyme Disease', 'Non-Core', 'Annually'),
            ('Leptospirosis', 'Non-Core', 'Annually'),
            ('Canine Influenza', 'Non-Core', 'Annually')
        ]) as vaccine_data
) vaccines,
LATERAL (
    SELECT 
        vaccine_data[1] as vaccine_name,
        vaccine_data[2] as vaccine_type,
        vaccine_data[3] as vaccine_frequency
) sub
WHERE NOT EXISTS (
    SELECT 1 FROM reference_vaccines rv 
    WHERE rv.species = 'Dog' AND rv.name = sub.vaccine_name
);

-- Import Cat Vaccines
INSERT INTO reference_vaccines (species, name, type, frequency) 
SELECT 'Cat', vaccine_name, vaccine_type, vaccine_frequency
FROM (
    SELECT 
        unnest(ARRAY[
            ('Rabies', 'Core', 'Every 1-3 years'),
            ('FVRCP', 'Core', 'Every 3 years'),
            ('FeLV', 'Non-Core', 'Annually'),
            ('FIP', 'Non-Core', 'Annually'),
            ('Chlamydia', 'Non-Core', 'Annually')
        ]) as vaccine_data
) vaccines,
LATERAL (
    SELECT 
        vaccine_data[1] as vaccine_name,
        vaccine_data[2] as vaccine_type,
        vaccine_data[3] as vaccine_frequency
) sub
WHERE NOT EXISTS (
    SELECT 1 FROM reference_vaccines rv 
    WHERE rv.species = 'Cat' AND rv.name = sub.vaccine_name
);
