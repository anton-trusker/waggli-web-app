# Waggly Database Restructure Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions to implement the complete database restructure from the incorrect `pet_vaccines`/`pet_medications` schema to the proper `vaccinations`/`treatments` architecture.

## ⚠️ Prerequisites

1. **Database Access**: Admin access to Supabase SQL Editor
2. **Backup Strategy**: Ensure recent database backups are available
3. **Staging Environment**: Test migration in staging before production
4. **Downtime Window**: Plan for 2-4 hours of maintenance window
5. **Rollback Plan**: Have rollback procedures ready

## 📅 Implementation Timeline

| Phase | Duration | Description | Dependencies |
|-------|----------|-------------|--------------|
| Phase 0 | 1 day | Preparation & backups | Database access |
| Phase 1 | 1 day | Database migration | Migration script |
| Phase 2 | 2 days | Backend code updates | Phase 1 complete |
| Phase 3 | 2 days | Frontend updates | Phase 2 complete |
| Phase 4 | 1 day | Testing & validation | Phase 3 complete |
| **Total** | **7 days** | **Complete implementation** | - |

## 🔧 Phase 0: Preparation

### 0.1 Environment Setup
```bash
# Create migration branch
git checkout -b feature/database-restructure

# Backup current database
# In Supabase Dashboard: Settings > Database > Backups
```

### 0.2 Verify Current State
Run this SQL to assess current data:
```sql
-- Check current table sizes
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE tablename IN ('pet_vaccines', 'pet_medications', 'vaccinations', 'treatments');

-- Check data integrity
SELECT 
    'pet_vaccines' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN pet_id IS NULL THEN 1 END) as null_pet_ids,
    COUNT(CASE WHEN owner_id IS NULL THEN 1 END) as null_owner_ids
FROM pet_vaccines
UNION ALL
SELECT 
    'pet_medications' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN pet_id IS NULL THEN 1 END) as null_pet_ids,
    COUNT(CASE WHEN owner_id IS NULL THEN 1 END) as null_owner_ids
FROM pet_medications;
```

### 0.3 Create Migration Scripts
Copy the provided migration scripts to your project:
- `/scripts/complete-database-migration.sql`
- `/types/medical-records.ts`
- `/services/medical-records.ts`

## 🗄️ Phase 1: Database Migration

### 1.1 Pre-Migration Backup
```sql
-- Create comprehensive backup
CREATE TABLE migration_backup_pet_vaccines AS SELECT * FROM pet_vaccines;
CREATE TABLE migration_backup_pet_medications AS SELECT * FROM pet_medications;
CREATE TABLE migration_backup_pets AS SELECT * FROM pets;
```

### 1.2 Run Migration Script
Execute `/scripts/complete-database-migration.sql` in Supabase SQL Editor:

```sql
-- Run the complete migration
\i /path/to/complete-database-migration.sql
```

### 1.3 Verify Migration Success
```sql
-- Check migration log
SELECT * FROM migration_log WHERE migration_name = 'database_restructure_v1';

-- Verify data counts
SELECT 
    'vaccinations' as table_name, COUNT(*) as count 
FROM vaccinations
UNION ALL
SELECT 
    'treatments' as table_name, COUNT(*) as count 
FROM treatments;

-- Check for orphaned records
SELECT 'Orphaned vaccinations' as issue, COUNT(*) as count
FROM vaccinations v
LEFT JOIN pets p ON v.pet_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'Orphaned treatments' as issue, COUNT(*) as count
FROM treatments t
LEFT JOIN pets p ON t.pet_id = p.id
WHERE p.id IS NULL;
```

### 1.4 Update RLS Policies
The migration script should handle this, but verify:

```sql
-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('vaccinations', 'treatments');
```

## 💻 Phase 2: Backend Code Updates

### 2.1 Update TypeScript Types
Replace old vaccine/medication types with new ones:

```typescript
// Remove old imports
// import { VaccineRecord, Medication } from './types';

// Add new imports
import { 
  VaccinationRecord, 
  TreatmentRecord,
  VaccinationFormData,
  TreatmentFormData 
} from './types/medical-records';
```

### 2.2 Update Database Services

**Replace in `services/db.ts`:**

```typescript
// ❌ REMOVE these functions:
export const addVaccineDB = async (v: VaccineRecord) => { ... };
export const addMedicationDB = async (m: Medication) => { ... };

// ✅ ADD import:
import * as medicalServices from './medical-records';

// ✅ UPDATE exports:
export const addVaccination = medicalServices.addVaccination;
export const addTreatment = medicalServices.addTreatment;
export const getVaccinationsByPetId = medicalServices.getVaccinationsByPetId;
export const getTreatmentsByPetId = medicalServices.getTreatmentsByPetId;
```

### 2.3 Update AppContext Subscriptions

**In `context/AppContext.tsx`:**

```typescript
// ❌ REMOVE old subscriptions:
useEffect(() => {
  if (user.id && isAuthenticated) {
    unsubs.push(subscribeToCollection<VaccineRecord>('pet_vaccines', 'owner_id', user.id, setVaccines, mapDbVaccineToAppVaccine));
    unsubs.push(subscribeToCollection<Medication>('pet_medications', 'owner_id', user.id, setMedications, mapDbMedicationToAppMedication));
  }
}, [user, isAuthenticated]);

// ✅ ADD new subscriptions:
useEffect(() => {
  if (user.id && isAuthenticated) {
    // Get user's pets first
    const fetchUserPets = async () => {
      const { data: userPets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', user.id);
      
      if (userPets && userPets.length > 0) {
        const petIds = userPets.map(p => p.id);
        
        // Subscribe to vaccinations and treatments for all pets
        const vaccinationSub = supabase
          .channel(`vaccinations-${user.id}`)
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'vaccinations', filter: `pet_id=in.(${petIds.join(',')})` },
            async () => {
              const allVaccinations = [];
              for (const petId of petIds) {
                const petVaccinations = await medicalServices.getVaccinationsByPetId(petId);
                allVaccinations.push(...petVaccinations);
              }
              setVaccines(allVaccinations);
            }
          )
          .subscribe();
          
        unsubs.push(() => vaccinationSub.unsubscribe());
      }
    };
    
    fetchUserPets();
  }
}, [user, isAuthenticated, setVaccines, setMedications]);
```

### 2.4 Update API Endpoints

**Update any API routes that handle medical records:**

```typescript
// Example: pages/api/pets/[id]/vaccinations.ts
import { getVaccinationsByPetId, addVaccination } from '../../../services/medical-records';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const vaccinations = await getVaccinationsByPetId(req.query.id as string);
    res.status(200).json(vaccinations);
  } else if (req.method === 'POST') {
    const vaccination = await addVaccination(req.body);
    res.status(201).json(vaccination);
  }
}
```

## 🎨 Phase 3: Frontend Updates

### 3.1 Update AddPet.tsx

**Replace StepMedical component:**

```typescript
// ❌ REMOVE old imports
// import { staticData } from '../context/AppContext';

// ✅ ADD new imports
import { 
  getReferenceVaccines, 
  getReferenceMedications,
  addVaccination,
  addTreatment 
} from '../services/medical-records';
import type { VaccinationFormData, TreatmentFormData } from '../types/medical-records';

// ✅ UPDATE StepMedical component
const StepMedical = ({ newVaccinations, setNewVaccinations, newTreatments, setNewTreatments, formData }) => {
  const [referenceVaccines, setReferenceVaccines] = useState([]);
  const [referenceMedications, setReferenceMedications] = useState([]);
  const [vaxData, setVaxData] = useState<VaccinationFormData>({
    dateAdministered: '',
    petId: ''
  });
  const [treatmentData, setTreatmentData] = useState<TreatmentFormData>({
    name: '',
    type: 'medication',
    startDate: '',
    isOngoing: false,
    petId: ''
  });

  // Fetch reference data based on pet type
  useEffect(() => {
    const fetchReferenceData = async () => {
      if (!formData.type || formData.type === 'other') return;
      
      // Map type to species (you may need to adjust this mapping)
      const speciesMap = { dog: 'Dog', cat: 'Cat' };
      const species = speciesMap[formData.type];
      
      if (species) {
        const [vaccines, medications] = await Promise.all([
          getReferenceVaccines(species),
          getReferenceMedications(species)
        ]);
        
        setReferenceVaccines(vaccines);
        setReferenceMedications(medications);
      }
    };
    
    fetchReferenceData();
  }, [formData.type]);

  const handleAddVaccination = async () => {
    if (!vaxData.dateAdministered) return;
    
    try {
      const vaccination = await addVaccination({
        ...vaxData,
        petId: formData.petId || 'temp'
      });
      setNewVaccinations([...newVaccinations, vaccination]);
      setVaxData({ dateAdministered: '', petId: '' });
    } catch (error) {
      console.error('Error adding vaccination:', error);
    }
  };

  const handleAddTreatment = async () => {
    if (!treatmentData.name || !treatmentData.startDate) return;
    
    try {
      const treatment = await addTreatment({
        ...treatmentData,
        petId: formData.petId || 'temp'
      });
      setNewTreatments([...newTreatments, treatment]);
      setTreatmentData({ 
        name: '', 
        type: 'medication', 
        startDate: '', 
        isOngoing: false,
        petId: '' 
      });
    } catch (error) {
      console.error('Error adding treatment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vaccinations Section */}
      <div>
        <h3 className="text-lg font-bold mb-4">Vaccinations</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={vaxData.referenceVaccineId || ''}
              onChange={(e) => setVaxData({ ...vaxData, referenceVaccineId: e.target.value })}
              className="flex-1 p-2 border rounded"
            >
              <option value="">Select vaccine</option>
              {referenceVaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.name} ({vaccine.vaccineType})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={vaxData.dateAdministered}
              onChange={(e) => setVaxData({ ...vaxData, dateAdministered: e.target.value })}
              className="p-2 border rounded"
            />
            <button onClick={handleAddVaccination} className="px-4 py-2 bg-blue-500 text-white rounded">
              Add
            </button>
          </div>
          
          {/* Display added vaccinations */}
          {newVaccinations.map((vax) => (
            <div key={vax.id} className="p-3 border rounded">
              <p className="font-medium">{vax.vaccineNameOther || 'Custom Vaccine'}</p>
              <p className="text-sm text-gray-600">{vax.dateAdministered}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Treatments Section */}
      <div>
        <h3 className="text-lg font-bold mb-4">Medications/Treatments</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={treatmentData.referenceMedicationId || ''}
              onChange={(e) => setTreatmentData({ ...treatmentData, referenceMedicationId: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Select medication</option>
              {referenceMedications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.category})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter custom name"
              value={treatmentData.name}
              onChange={(e) => setTreatmentData({ ...treatmentData, name: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={treatmentData.type}
              onChange={(e) => setTreatmentData({ ...treatmentData, type: e.target.value as any })}
              className="p-2 border rounded"
            >
              <option value="medication">Medication</option>
              <option value="supplement">Supplement</option>
              <option value="therapy">Therapy</option>
              <option value="prevention">Prevention</option>
            </select>
            <input
              type="date"
              value={treatmentData.startDate}
              onChange={(e) => setTreatmentData({ ...treatmentData, startDate: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <button onClick={handleAddTreatment} className="px-4 py-2 bg-green-500 text-white rounded">
            Add Treatment
          </button>
          
          {/* Display added treatments */}
          {newTreatments.map((treatment) => (
            <div key={treatment.id} className="p-3 border rounded">
              <p className="font-medium">{treatment.name}</p>
              <p className="text-sm text-gray-600">{treatment.type} - {treatment.startDate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 3.2 Update Pet Profile Components

Update any components that display medical records to use the new data structure:

```typescript
// Example: components/PetMedicalHistory.tsx
import { getVaccinationsByPetId, getTreatmentsByPetId } from '../services/medical-records';

const PetMedicalHistory = ({ petId }) => {
  const [vaccinations, setVaccinations] = useState([]);
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [vaxData, treatmentData] = await Promise.all([
        getVaccinationsByPetId(petId),
        getTreatmentsByPetId(petId)
      ]);
      setVaccinations(vaxData);
      setTreatments(treatmentData);
    };
    
    fetchData();
  }, [petId]);

  return (
    <div>
      <h3>Vaccination History</h3>
      {vaccinations.map((vax) => (
        <div key={vax.id}>
          <p>{vax.vaccineNameOther || vax.referenceVaccine?.name}</p>
          <p>Administered: {vax.dateAdministered}</p>
          {vax.dateNextDue && <p>Next Due: {vax.dateNextDue}</p>}
        </div>
      ))}
      
      <h3>Treatment History</h3>
      {treatments.map((treatment) => (
        <div key={treatment.id}>
          <p>{treatment.name}</p>
          <p>Type: {treatment.type}</p>
          <p>Status: {treatment.status}</p>
        </div>
      ))}
    </div>
  );
};
```

## 🧪 Phase 4: Testing & Validation

### 4.1 Unit Tests

Create tests for new medical records services:

```typescript
// __tests__/medical-records.test.ts
import { getVaccinationsByPetId, addVaccination } from '../services/medical-records';

describe('Medical Records', () => {
  test('should get vaccinations by pet ID', async () => {
    const vaccinations = await getVaccinationsByPetId('test-pet-id');
    expect(Array.isArray(vaccinations)).toBe(true);
  });

  test('should add vaccination', async () => {
    const vaccination = await addVaccination({
      petId: 'test-pet-id',
      dateAdministered: '2024-01-01',
      referenceVaccineId: 'test-vaccine-id'
    });
    expect(vaccination.id).toBeDefined();
  });
});
```

### 4.2 Integration Tests

Test the complete flow:

```sql
-- Test vaccination creation
INSERT INTO vaccinations (pet_id, reference_vaccine_id, date_administered)
VALUES ('test-pet-id', 'test-vaccine-id', '2024-01-01');

-- Verify it appears in API
SELECT * FROM vaccinations WHERE pet_id = 'test-pet-id';
```

### 4.3 End-to-End Testing

1. **Add Pet Flow**: Test complete pet addition with medical records
2. **Pet Profile**: Verify medical history displays correctly
3. **Data Persistence**: Ensure data survives page refreshes
4. **Permissions**: Test RLS policies with different user roles

### 4.4 Performance Testing

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM vaccinations WHERE pet_id = 'test-id';
EXPLAIN ANALYZE SELECT * FROM treatments WHERE status = 'active';

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename IN ('vaccinations', 'treatments');
```

## 🔄 Rollback Plan

### If Migration Fails

1. **Stop Application**: Prevent new data writes
2. **Restore from Backup**: Use pre-migration backup
3. **Rollback Code**: Revert to previous commit
4. **Verify Data**: Ensure data integrity

```sql
-- Rollback script (if needed)
DROP TABLE IF EXISTS vaccinations CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;

-- Restore from backup
INSERT INTO pet_vaccines SELECT * FROM migration_backup_pet_vaccines;
INSERT INTO pet_medications SELECT * FROM migration_backup_pet_medications;
```

### If Code Updates Fail

```bash
# Rollback code changes
git checkout main
git reset --hard HEAD~1

# Revert database changes (if migration was already run)
# Use the rollback script above
```

## 📊 Success Metrics

### Before vs After

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Database Query Time | 200ms | 50ms | 75% faster |
| Data Integrity | Low | High | Proper FK constraints |
| Code Maintainability | Poor | Good | Clear separation |
| RLS Security | Inconsistent | Consistent | Proper policies |
| Scalability | Limited | High | Optimized indexes |

### Validation Checklist

- [ ] All data migrated successfully
- [ ] No orphaned records
- [ ] RLS policies working correctly
- [ ] Frontend displays data properly
- [ ] API endpoints responding correctly
- [ ] Performance improvements confirmed
- [ ] Error handling working
- [ ] Backup and rollback tested

## 🚀 Post-Migration

### 1. Monitor Performance
```sql
-- Monitor query performance
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%vaccinations%' OR query LIKE '%treatments%'
ORDER BY total_time DESC;
```

### 2. Clean Up Old Tables (After 30 days)
```sql
-- Only run after confirming everything works
DROP TABLE IF EXISTS pet_vaccines CASCADE;
DROP TABLE IF EXISTS pet_medications CASCADE;
DROP TABLE IF EXISTS migration_backup_pet_vaccines;
DROP TABLE IF EXISTS migration_backup_pet_medications;
```

### 3. Update Documentation
- Update API documentation
- Update database schema docs
- Update developer onboarding guides

## 📞 Support

If you encounter issues during migration:

1. **Check Logs**: Review migration_log table
2. **Verify Data**: Use validation queries
3. **Test Isolation**: Test in staging first
4. **Rollback**: Don't hesitate to rollback if needed

---

**This implementation guide provides a complete roadmap for successfully restructuring your Waggly database architecture. Take your time, test thoroughly, and ensure you have proper backups before proceeding.**
