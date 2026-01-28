// =====================================================
// MEDICAL RECORDS DATABASE SERVICES
// =====================================================
// This file contains all database operations for the
// restructured medical records system
// =====================================================

import { supabase } from './supabase';
import type {
  VaccinationRecord,
  TreatmentRecord,
  TreatmentDoseRecord,
  MedicalVisitRecord,
  HealthMetricRecord,
  AllergyRecord,
  ConditionRecord,
  ReferenceVaccine,
  ReferenceMedication,
  VaccinationFormData,
  TreatmentFormData,
  MedicalVisitFormData,
  HealthMetricFormData,
  VaccinationResponse,
  TreatmentResponse,
  MedicalVisitResponse,
  HealthMetricResponse
} from '../types/medical-records';

// =====================================================
// REFERENCE DATA OPERATIONS
// =====================================================

export const getReferenceVaccines = async (speciesId?: string): Promise<ReferenceVaccine[]> => {
  let query = supabase
    .from('reference_vaccines')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (speciesId) {
    query = query.eq('species_id', speciesId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getReferenceMedications = async (speciesId?: string): Promise<ReferenceMedication[]> => {
  let query = supabase
    .from('reference_medications')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (speciesId) {
    query = query.eq('species_id', speciesId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// =====================================================
// VACCINATION OPERATIONS
// =====================================================

export const getVaccinationsByPetId = async (petId: string): Promise<VaccinationRecord[]> => {
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      *,
      reference_vaccine:reference_vaccine_id (
        id,
        name,
        vaccine_type,
        frequency_recommendation
      )
    `)
    .eq('pet_id', petId)
    .order('date_administered', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getUpcomingVaccinations = async (petIds: string[]): Promise<VaccinationRecord[]> => {
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      *,
      reference_vaccine:reference_vaccine_id (
        id,
        name,
        vaccine_type,
        frequency_recommendation
      ),
      pets!inner (
        id,
        name,
        owner_id
      )
    `)
    .in('pet_id', petIds)
    .gte('date_next_due', new Date().toISOString().split('T')[0])
    .order('date_next_due', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addVaccination = async (vaccination: VaccinationFormData & { petId: string }): Promise<VaccinationRecord> => {
  const dbVaccination = {
    pet_id: vaccination.petId,
    reference_vaccine_id: vaccination.referenceVaccineId || null,
    vaccine_name_other: vaccination.vaccineNameOther || null,
    date_administered: vaccination.dateAdministered,
    date_expires: vaccination.dateExpires || null,
    date_next_due: vaccination.dateNextDue || null,
    batch_number: vaccination.batchNumber || null,
    manufacturer: vaccination.manufacturer || null,
    administered_by: vaccination.administeredBy || null,
    clinic_name: vaccination.clinicName || null,
    is_verified: false
  };

  const { data, error } = await supabase
    .from('vaccinations')
    .insert(dbVaccination)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVaccination = async (id: string, vaccination: Partial<VaccinationFormData>): Promise<VaccinationRecord> => {
  const updateData = {
    reference_vaccine_id: vaccination.referenceVaccineId || null,
    vaccine_name_other: vaccination.vaccineNameOther || null,
    date_administered: vaccination.dateAdministered,
    date_expires: vaccination.dateExpires || null,
    date_next_due: vaccination.dateNextDue || null,
    batch_number: vaccination.batchNumber || null,
    manufacturer: vaccination.manufacturer || null,
    administered_by: vaccination.administeredBy || null,
    clinic_name: vaccination.clinicName || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('vaccinations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteVaccination = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vaccinations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// =====================================================
// TREATMENT OPERATIONS
// =====================================================

export const getTreatmentsByPetId = async (petId: string): Promise<TreatmentRecord[]> => {
  const { data, error } = await supabase
    .from('treatments')
    .select(`
      *,
      reference_medication:reference_medication_id (
        id,
        name,
        category,
        is_prescription
      )
    `)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getActiveTreatments = async (petIds: string[]): Promise<TreatmentRecord[]> => {
  const { data, error } = await supabase
    .from('treatments')
    .select(`
      *,
      reference_medication:reference_medication_id (
        id,
        name,
        category,
        is_prescription
      ),
      pets!inner (
        id,
        name,
        owner_id
      )
    `)
    .in('pet_id', petIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addTreatment = async (treatment: TreatmentFormData & { petId: string }): Promise<TreatmentRecord> => {
  const dbTreatment = {
    pet_id: treatment.petId,
    reference_medication_id: treatment.referenceMedicationId || null,
    name: treatment.name,
    type: treatment.type,
    dosage_amount: treatment.dosageAmount ? parseFloat(treatment.dosageAmount) : null,
    dosage_unit: treatment.dosageUnit || null,
    frequency_type: treatment.frequencyType || null,
    frequency_details: treatment.frequencyDetails || null,
    start_date: treatment.startDate,
    end_date: treatment.endDate || null,
    is_ongoing: treatment.isOngoing,
    inventory_remaining: treatment.inventoryRemaining ? parseFloat(treatment.inventoryRemaining) : null,
    inventory_alert_threshold: treatment.inventoryAlertThreshold ? parseFloat(treatment.inventoryAlertThreshold) : null,
    status: 'active'
  };

  const { data, error } = await supabase
    .from('treatments')
    .insert(dbTreatment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTreatment = async (id: string, treatment: Partial<TreatmentFormData>): Promise<TreatmentRecord> => {
  const updateData = {
    reference_medication_id: treatment.referenceMedicationId || null,
    name: treatment.name,
    type: treatment.type,
    dosage_amount: treatment.dosageAmount ? parseFloat(treatment.dosageAmount) : null,
    dosage_unit: treatment.dosageUnit || null,
    frequency_type: treatment.frequencyType || null,
    frequency_details: treatment.frequencyDetails || null,
    start_date: treatment.startDate,
    end_date: treatment.endDate || null,
    is_ongoing: treatment.isOngoing,
    inventory_remaining: treatment.inventoryRemaining ? parseFloat(treatment.inventoryRemaining) : null,
    inventory_alert_threshold: treatment.inventoryAlertThreshold ? parseFloat(treatment.inventoryAlertThreshold) : null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('treatments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTreatment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('treatments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// =====================================================
// TREATMENT DOSE OPERATIONS
// =====================================================

export const getTreatmentDoses = async (treatmentId: string): Promise<TreatmentDoseRecord[]> => {
  const { data, error } = await supabase
    .from('treatment_doses')
    .select('*')
    .eq('treatment_id', treatmentId)
    .order('scheduled_time', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addTreatmentDose = async (dose: Omit<TreatmentDoseRecord, 'id' | 'createdAt'>): Promise<TreatmentDoseRecord> => {
  const { data, error } = await supabase
    .from('treatment_doses')
    .insert(dose)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTreatmentDose = async (id: string, updates: Partial<TreatmentDoseRecord>): Promise<TreatmentDoseRecord> => {
  const { data, error } = await supabase
    .from('treatment_doses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// MEDICAL VISIT OPERATIONS
// =====================================================

export const getMedicalVisitsByPetId = async (petId: string): Promise<MedicalVisitRecord[]> => {
  const { data, error } = await supabase
    .from('medical_visits')
    .select(`
      *,
      service_provider:provider_id (
        id,
        name,
        specialty
      )
    `)
    .eq('pet_id', petId)
    .order('visit_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addMedicalVisit = async (visit: MedicalVisitFormData & { petId: string }): Promise<MedicalVisitRecord> => {
  const dbVisit = {
    pet_id: visit.petId,
    visit_type: visit.visitType,
    visit_date: visit.visitDate,
    clinic_name: visit.clinicName || null,
    veterinarian_name: visit.veterinarianName || null,
    reason_for_visit: visit.reasonForVisit,
    diagnosis: visit.diagnosis || null,
    treatment_summary: visit.treatmentSummary || null,
    follow_up_required: visit.followUpRequired,
    follow_up_date: visit.followUpDate || null,
    follow_up_notes: visit.followUpNotes || null,
    cost_total: visit.costTotal ? parseFloat(visit.costTotal) : null,
    currency_code: visit.currencyCode || 'USD',
    insurance_covered: visit.insuranceCovered,
    notes: visit.notes || null
  };

  const { data, error } = await supabase
    .from('medical_visits')
    .insert(dbVisit)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMedicalVisit = async (id: string, visit: Partial<MedicalVisitFormData>): Promise<MedicalVisitRecord> => {
  const updateData = {
    visit_type: visit.visitType,
    visit_date: visit.visitDate,
    clinic_name: visit.clinicName || null,
    veterinarian_name: visit.veterinarianName || null,
    reason_for_visit: visit.reasonForVisit,
    diagnosis: visit.diagnosis || null,
    treatment_summary: visit.treatmentSummary || null,
    follow_up_required: visit.followUpRequired,
    follow_up_date: visit.followUpDate || null,
    follow_up_notes: visit.followUpNotes || null,
    cost_total: visit.costTotal ? parseFloat(visit.costTotal) : null,
    currency_code: visit.currencyCode || 'USD',
    insurance_covered: visit.insuranceCovered,
    notes: visit.notes || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('medical_visits')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMedicalVisit = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medical_visits')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// =====================================================
// HEALTH METRICS OPERATIONS
// =====================================================

export const getHealthMetricsByPetId = async (petId: string, limit?: number): Promise<HealthMetricRecord[]> => {
  let query = supabase
    .from('health_metrics')
    .select('*')
    .eq('pet_id', petId)
    .order('recorded_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const addHealthMetric = async (metric: HealthMetricFormData & { petId: string }): Promise<HealthMetricRecord> => {
  const dbMetric = {
    pet_id: metric.petId,
    weight_kg: metric.weightKg ? parseFloat(metric.weightKg) : null,
    body_condition_score: metric.bodyConditionScore ? parseInt(metric.bodyConditionScore) : null,
    temperature_celsius: metric.temperatureCelsius ? parseFloat(metric.temperatureCelsius) : null,
    heart_rate_bpm: metric.heartRateBpm ? parseInt(metric.heartRateBpm) : null,
    respiratory_rate_rpm: metric.respiratoryRateRpm ? parseInt(metric.respiratoryRateRpm) : null,
    notes: metric.notes || null,
    recorded_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('health_metrics')
    .insert(dbMetric)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteHealthMetric = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('health_metrics')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// =====================================================
// ALLERGY & CONDITION OPERATIONS
// =====================================================

export const getAllergiesByPetId = async (petId: string): Promise<AllergyRecord[]> => {
  const { data, error } = await supabase
    .from('allergies')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addAllergy = async (allergy: Omit<AllergyRecord, 'id' | 'createdAt'>): Promise<AllergyRecord> => {
  const { data, error } = await supabase
    .from('allergies')
    .insert(allergy)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAllergy = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('allergies')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getConditionsByPetId = async (petId: string): Promise<ConditionRecord[]> => {
  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addCondition = async (condition: Omit<ConditionRecord, 'id' | 'createdAt'>): Promise<ConditionRecord> => {
  const { data, error } = await supabase
    .from('conditions')
    .insert(condition)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCondition = async (id: string, updates: Partial<ConditionRecord>): Promise<ConditionRecord> => {
  const { data, error } = await supabase
    .from('conditions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCondition = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('conditions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// =====================================================
// SUBSCRIPTION HELPERS
// =====================================================

export const subscribeToPetVaccinations = (petId: string, callback: (vaccinations: VaccinationRecord[]) => void) => {
  return supabase
    .channel(`vaccinations-${petId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'vaccinations', filter: `pet_id=eq.${petId}` },
      async () => {
        const vaccinations = await getVaccinationsByPetId(petId);
        callback(vaccinations);
      }
    )
    .subscribe();
};

export const subscribeToPetTreatments = (petId: string, callback: (treatments: TreatmentRecord[]) => void) => {
  return supabase
    .channel(`treatments-${petId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'treatments', filter: `pet_id=eq.${petId}` },
      async () => {
        const treatments = await getTreatmentsByPetId(petId);
        callback(treatments);
      }
    )
    .subscribe();
};

export const subscribeToPetHealthMetrics = (petId: string, callback: (metrics: HealthMetricRecord[]) => void) => {
  return supabase
    .channel(`health-metrics-${petId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'health_metrics', filter: `pet_id=eq.${petId}` },
      async () => {
        const metrics = await getHealthMetricsByPetId(petId);
        callback(metrics);
      }
    )
    .subscribe();
};
