# Waggly Database Restructure Plan

## 🚨 Executive Summary

This document provides a comprehensive analysis and solution for the current database structure issues in the Waggly pet management application. The primary issue is a fundamental architectural misunderstanding between **reference data** and **user-specific medical records**.

## 📊 Current State Analysis

### ❌ Critical Issues Identified

1. **Schema Inconsistency**: Application code uses `pet_vaccines`/`pet_medications` but proper schema defines `vaccinations`/`treatments`
2. **Data Architecture Confusion**: Mixing reference data with user-specific records
3. **Redundant owner_id Fields**: Incorrectly adding `owner_id` to medical record tables
4. **Broken Relationships**: Missing proper foreign key constraints to reference tables
5. **RLS Policy Conflicts**: Inconsistent security policies between old and new schemas

### 🏗️ Current (Incorrect) Structure

```sql
-- ❌ WRONG - Mixing reference and user data
pet_vaccines (
  id, owner_id, pet_id, type, name, date, status...
)
pet_medications (
  id, owner_id, pet_id, name, category, start_date...
)
```

### ✅ Correct Structure (Already Defined in Schema)

```sql
-- ✅ CORRECT - Proper separation
reference_vaccines (id, species_id, name, vaccine_type, frequency...)
vaccinations (id, pet_id, reference_vaccine_id, date_administered...)

reference_medications (id, species_id, name, category...)
treatments (id, pet_id, reference_medication_id, dosage, start_date...)
```

## 🎯 Recommended Solution

### Phase 1: Data Architecture Clarification

#### Reference Data vs User Data

**Reference Data** (Global, Read-only):
- `reference_vaccines` - All available vaccine types
- `reference_medications` - All available medication types  
- `breeds`, `species`, `colors`, `blood_types`

**User-Specific Data** (Per-pet medical records):
- `vaccinations` - Actual vaccines administered to specific pets
- `treatments` - Actual medications/treatments for specific pets
- `medical_visits` - Vet visit records
- `health_metrics` - Weight, vitals tracking

### Phase 2: Complete Migration Strategy

#### 2.1 Database Migration Script

```sql
-- Step 1: Create migration mapping table
CREATE TABLE vaccination_migration (
    old_pet_vaccine_id UUID,
    new_vaccination_id UUID,
    pet_id UUID,
    reference_vaccine_id UUID,
    migration_status VARCHAR(20)
);

-- Step 2: Migrate data from pet_vaccines to vaccinations
INSERT INTO vaccinations (
    id, pet_id, reference_vaccine_id, date_administered,
    batch_number, manufacturer, clinic_name, created_at
)
SELECT 
    gen_random_uuid(),
    pv.pet_id,
    rv.id,
    pv.date,
    pv.batch_no,
    pv.manufacturer,
    pv.provider_name,
    NOW()
FROM pet_vaccines pv
LEFT JOIN reference_vaccines rv ON rv.name = pv.type
WHERE pv.pet_id IS NOT NULL;

-- Step 3: Migrate treatments from pet_medications  
INSERT INTO treatments (
    id, pet_id, reference_medication_id, name,
    start_date, end_date, frequency_type, status, created_at
)
SELECT
    gen_random_uuid(),
    pm.pet_id,
    rm.id,
    pm.name,
    pm.start_date,
    pm.end_date,
    pm.frequency,
    CASE WHEN pm.active THEN 'active' ELSE 'completed' END,
    NOW()
FROM pet_medications pm
LEFT JOIN reference_medications rm ON rm.name = pm.name
WHERE pm.pet_id IS NOT NULL;

-- Step 4: Backup and drop old tables
CREATE TABLE pet_vaccines_backup AS SELECT * FROM pet_vaccines;
CREATE TABLE pet_medications_backup AS SELECT * FROM pet_medications;

DROP TABLE IF EXISTS pet_vaccines CASCADE;
DROP TABLE IF EXISTS pet_medications CASCADE;
```

#### 2.2 Application Code Updates

**services/db.ts Changes:**

```typescript
// ❌ OLD - Remove these functions
export const addVaccineDB = async (v: VaccineRecord) => {
  const { error } = await supabase.from('pet_vaccines').upsert({...});
}

// ✅ NEW - Updated functions
export const addVaccinationDB = async (v: VaccinationRecord) => {
  const dbVaccination = {
    id: v.id,
    pet_id: v.petId,
    reference_vaccine_id: v.referenceVaccineId,
    date_administered: v.dateAdministered,
    date_next_due: v.dateNextDue,
    manufacturer: v.manufacturer,
    batch_number: v.batchNumber,
    clinic_name: v.clinicName,
    administered_by: v.administeredBy
  };
  
  const { error } = await supabase.from('vaccinations').upsert(dbVaccination);
  if (error) throw error;
}

export const addTreatmentDB = async (t: TreatmentRecord) => {
  const dbTreatment = {
    id: t.id,
    pet_id: t.petId,
    reference_medication_id: t.referenceMedicationId,
    name: t.name,
    dosage_amount: t.dosageAmount,
    dosage_unit: t.dosageUnit,
    frequency_type: t.frequencyType,
    start_date: t.startDate,
    end_date: t.endDate,
    status: t.status
  };
  
  const { error } = await supabase.from('treatments').upsert(dbTreatment);
  if (error) throw error;
}
```

#### 2.3 TypeScript Interface Updates

```typescript
// ✅ NEW - Proper interfaces
export interface VaccinationRecord {
  id: string;
  petId: string;
  referenceVaccineId?: string;
  vaccineNameOther?: string; // For custom vaccines
  dateAdministered: string;
  dateExpires?: string;
  dateNextDue?: string;
  manufacturer?: string;
  batchNumber?: string;
  clinicName?: string;
  administeredBy?: string;
  certificateAssetId?: string;
  createdAt: string;
}

export interface TreatmentRecord {
  id: string;
  petId: string;
  referenceMedicationId?: string;
  name: string;
  type: 'medication' | 'supplement' | 'therapy' | 'prevention';
  dosageAmount?: number;
  dosageUnit?: string;
  frequencyType?: string;
  frequencyDetails?: object;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  status: 'active' | 'completed' | 'paused';
  inventoryRemaining?: number;
  createdAt: string;
}
```

### Phase 3: Frontend Updates

#### 3.1 AddPet.tsx Updates

```typescript
// Update StepMedical component
const StepMedical = ({ newVaccinations, setNewVaccinations, newTreatments, setNewTreatments, formData }) => {
  const [referenceVaccines, setReferenceVaccines] = useState([]);
  const [referenceMedications, setReferenceMedications] = useState([]);

  // Fetch reference data based on pet type
  useEffect(() => {
    const fetchReferenceData = async () => {
      const species = formData.type.charAt(0).toUpperCase() + formData.type.slice(1);
      
      const { data: vaccines } = await supabase
        .from('reference_vaccines')
        .select('*')
        .eq('species_id', species);
      
      const { data: medications } = await supabase
        .from('reference_medications')
        .select('*')
        .eq('species_id', species);
      
      setReferenceVaccines(vaccines || []);
      setReferenceMedications(medications || []);
    };
    
    fetchReferenceData();
  }, [formData.type]);

  // Updated handlers
  const handleAddVaccination = () => {
    const newVaccination: Partial<VaccinationRecord> = {
      id: generateId(),
      referenceVaccineId: vaxData.referenceVaccineId,
      dateAdministered: vaxData.date,
      manufacturer: vaxData.manufacturer,
      clinicName: vaxData.clinicName
    };
    setNewVaccinations([...newVaccinations, newVaccination]);
  };
};
```

#### 3.2 AppContext.tsx Updates

```typescript
// Update subscriptions to use correct tables
useEffect(() => {
  if (user.id && isAuthenticated) {
    // Subscribe to user's pets first
    const petSubscription = supabase
      .channel(`pets-${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pets', filter: `owner_id=eq.${user.id}` },
        async () => {
          const { data: userPets } = await supabase
            .from('pets')
            .select('id')
            .eq('owner_id', user.id);
          
          if (userPets) {
            const petIds = userPets.map(p => p.id);
            
            // Subscribe to vaccinations for user's pets
            const vaccinationSubscription = supabase
              .channel(`vaccinations-${user.id}`)
              .on('postgres_changes',
                { event: '*', schema: 'public', table: 'vaccinations', filter: `pet_id=in.(${petIds.join(',')})` },
                () => fetchVaccinations(petIds)
              );
              
            vaccinationSubscription.subscribe();
          }
        }
      )
      .subscribe();
  }
}, [user, isAuthenticated]);
```

## 🔒 Security & RLS Policies

### Updated RLS Policies

```sql
-- ✅ CORRECT - Proper RLS for new schema
CREATE POLICY "Users manage pet vaccinations" 
ON vaccinations FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM pets 
  WHERE id = vaccinations.pet_id AND owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM pets 
  WHERE id = vaccinations.pet_id AND owner_id = auth.uid()
));

CREATE POLICY "Users manage pet treatments" 
ON treatments FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM pets 
  WHERE id = treatments.pet_id AND owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM pets 
  WHERE id = treatments.pet_id AND owner_id = auth.uid()
));

-- Reference data - Public read access
CREATE POLICY "Public read reference vaccines" 
ON reference_vaccines FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public read reference medications" 
ON reference_medications FOR SELECT 
TO anon, authenticated 
USING (true);
```

## 📈 Performance Optimizations

### Recommended Indexes

```sql
-- Core performance indexes
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_due ON vaccinations(pet_id, date_next_due);
CREATE INDEX IF NOT EXISTS idx_vaccinations_reference ON vaccinations(reference_vaccine_id);
CREATE INDEX IF NOT EXISTS idx_treatments_pet_status ON treatments(pet_id, status);
CREATE INDEX IF NOT EXISTS idx_treatments_reference ON treatments(reference_medication_id);
CREATE INDEX IF NOT EXISTS idx_medical_visits_pet_date ON medical_visits(pet_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_metrics_pet_date ON health_metrics(pet_id, recorded_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_active ON vaccinations(pet_id, date_administered DESC) 
WHERE date_next_due >= CURRENT_DATE;
```

## 🔄 Data Flow Architecture

### Correct Data Flow

```
Reference Tables (Global)
├── reference_vaccines
├── reference_medications  
├── breeds
└── species
    ↓ (Select for forms)
User Interface (Add Pet)
    ↓ (Create records)
User-Specific Tables
├── vaccinations (links to reference_vaccines)
├── treatments (links to reference_medications)
├── medical_visits
└── health_metrics
    ↓ (Filter by pet ownership)
Display (Pet Profile)
```

### API Endpoints Structure

```typescript
// Reference data endpoints (public)
GET /api/reference/vaccines?species=dog
GET /api/reference/medications?species=cat
GET /api/reference/breeds?species=dog

// User-specific endpoints (authenticated)
GET /api/pets/:id/vaccinations
POST /api/pets/:id/vaccinations
GET /api/pets/:id/treatments  
POST /api/pets/:id/treatments
GET /api/pets/:id/medical-visits
```

## 📋 Implementation Checklist

### Phase 1: Database Migration
- [ ] Create migration scripts
- [ ] Backup existing data
- [ ] Migrate pet_vaccines → vaccinations
- [ ] Migrate pet_medications → treatments
- [ ] Drop old tables
- [ ] Update RLS policies
- [ ] Create performance indexes

### Phase 2: Backend Updates
- [ ] Update services/db.ts functions
- [ ] Update TypeScript interfaces
- [ ] Update AppContext subscriptions
- [ ] Update API endpoints
- [ ] Add data validation

### Phase 3: Frontend Updates
- [ ] Update AddPet.tsx StepMedical component
- [ ] Update pet profile medical sections
- [ ] Update vaccine/medication displays
- [ ] Add loading states for reference data
- [ ] Update error handling

### Phase 4: Testing & Validation
- [ ] Unit tests for database operations
- [ ] Integration tests for API endpoints
- [ ] Frontend component testing
- [ ] End-to-end testing
- [ ] Performance testing

## 🚀 Benefits of This Restructure

1. **Data Integrity**: Proper foreign key relationships
2. **Scalability**: Efficient queries with proper indexing
3. **Maintainability**: Clear separation of concerns
4. **Security**: Proper RLS policies
5. **Performance**: Optimized database structure
6. **Flexibility**: Easy to add new reference data
7. **Consistency**: Standardized data patterns

## ⚠️ Migration Risks & Mitigations

### Risks
1. **Data Loss**: During migration
2. **Downtime**: During schema changes
3. **Application Errors**: From code updates

### Mitigations
1. **Full Backups**: Before any changes
2. **Staged Migration**: Test environment first
3. **Rollback Plan**: Quick revert procedures
4. **Monitoring**: Track errors during deployment
5. **Feature Flags**: Toggle new/old implementations

## 📞 Support & Rollout Plan

### Recommended Rollout Strategy
1. **Week 1**: Database migration in staging
2. **Week 2**: Code updates and testing
3. **Week 3**: Production migration (low traffic period)
4. **Week 4**: Monitoring and optimization

### Success Metrics
- [ ] Zero data loss during migration
- [ ] Application performance improvement
- [ ] Reduced database query times
- [ ] No increase in error rates
- [ ] Successful user adoption

---

**This restructure will provide a solid foundation for the Waggly application's continued growth and scalability while ensuring data integrity and optimal performance.**
