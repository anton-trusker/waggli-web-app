// =====================================================
// MEDICAL RECORDS TYPE DEFINITIONS
// =====================================================
// This file contains proper TypeScript interfaces for the
// restructured medical records system
// =====================================================

// Reference Data Types
export interface ReferenceVaccine {
  id: string;
  speciesId: string;
  name: string;
  vaccineType: 'Core' | 'Non-Core' | 'Optional';
  frequencyRecommendation?: string;
  descriptionKey?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReferenceMedication {
  id: string;
  speciesId: string;
  name: string;
  category?: string;
  isPrescription: boolean;
  isActive: boolean;
  createdAt: string;
}

// User-Specific Medical Records
export interface VaccinationRecord {
  id: string;
  petId: string;
  referenceVaccineId?: string;
  vaccineNameOther?: string; // For custom vaccines not in reference
  dateAdministered: string;
  dateExpires?: string;
  dateNextDue?: string;
  batchNumber?: string;
  manufacturer?: string;
  siteOfInjection?: string;
  doseSequence?: string;
  isVerified: boolean;
  certificateAssetId?: string;
  administeredBy?: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentRecord {
  id: string;
  petId: string;
  referenceMedicationId?: string;
  name: string;
  type: 'medication' | 'supplement' | 'therapy' | 'prevention';
  dosageAmount?: number;
  dosageUnit?: string;
  frequencyType?: string; // 'daily', 'weekly', 'monthly', 'prn'
  frequencyDetails?: {
    times?: string[]; // ["08:00", "20:00"]
    days?: string[];  // ["Mon", "Wed", "Fri"]
    interval?: number; // Every X days
  };
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  inventoryRemaining?: number;
  inventoryAlertThreshold?: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentDoseRecord {
  id: string;
  treatmentId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'pending' | 'taken' | 'skipped' | 'late';
  skippedReason?: string;
  givenByUserId?: string;
  createdAt: string;
}

export interface MedicalVisitRecord {
  id: string;
  petId: string;
  visitType: 'routine_checkup' | 'vaccination' | 'sick_visit' | 'emergency' | 
            'surgery' | 'specialist' | 'follow_up' | 'dental' | 'lab_work';
  visitDate: string;
  clinicName?: string;
  providerId?: string;
  veterinarianName?: string;
  reasonForVisit: string;
  diagnosis?: string;
  treatmentSummary?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  costTotal?: number;
  currencyCode?: string;
  insuranceCovered: boolean;
  notes?: string;
  attachments?: string[]; // Array of media asset IDs
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetricRecord {
  id: string;
  petId: string;
  recordedAt: string;
  weightKg?: number;
  bodyConditionScore?: number; // 1-9 scale
  temperatureCelsius?: number;
  heartRateBpm?: number;
  respiratoryRateRpm?: number;
  notes?: string;
  recordedByUserId?: string;
  createdAt: string;
}

export interface AllergyRecord {
  id: string;
  petId: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  createdAt: string;
}

export interface ConditionRecord {
  id: string;
  petId: string;
  name: string;
  diagnosisDate?: string;
  status: 'active' | 'remission' | 'resolved';
  notes?: string;
  createdAt: string;
}

// Form Types for Adding/Editing
export interface VaccinationFormData {
  referenceVaccineId?: string;
  vaccineNameOther?: string;
  dateAdministered: string;
  dateExpires?: string;
  dateNextDue?: string;
  batchNumber?: string;
  manufacturer?: string;
  administeredBy?: string;
  clinicName?: string;
  certificateFile?: File;
}

export interface TreatmentFormData {
  referenceMedicationId?: string;
  name: string;
  type: 'medication' | 'supplement' | 'therapy' | 'prevention';
  dosageAmount?: string;
  dosageUnit?: string;
  frequencyType?: string;
  frequencyDetails?: {
    times?: string[];
    days?: string[];
  };
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  inventoryRemaining?: string;
  inventoryAlertThreshold?: string;
}

export interface MedicalVisitFormData {
  visitType: MedicalVisitRecord['visitType'];
  visitDate: string;
  clinicName?: string;
  veterinarianName?: string;
  reasonForVisit: string;
  diagnosis?: string;
  treatmentSummary?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  costTotal?: string;
  currencyCode?: string;
  insuranceCovered: boolean;
  notes?: string;
  attachments?: File[];
}

export interface HealthMetricFormData {
  weightKg?: string;
  bodyConditionScore?: string;
  temperatureCelsius?: string;
  heartRateBpm?: string;
  respiratoryRateRpm?: string;
  notes?: string;
}

// API Response Types
export interface VaccinationResponse {
  data: VaccinationRecord[];
  count: number;
}

export interface TreatmentResponse {
  data: TreatmentRecord[];
  count: number;
}

export interface MedicalVisitResponse {
  data: MedicalVisitRecord[];
  count: number;
}

export interface HealthMetricResponse {
  data: HealthMetricRecord[];
  count: number;
}

// Dashboard Summary Types
export interface PetMedicalSummary {
  petId: string;
  upcomingVaccinations: VaccinationRecord[];
  activeTreatments: TreatmentRecord[];
  recentVisits: MedicalVisitRecord[];
  latestMetrics: HealthMetricRecord[];
  allergies: AllergyRecord[];
  conditions: ConditionRecord[];
}

// Notification Types
export interface VaccinationReminder {
  type: 'vaccination_due';
  petId: string;
  petName: string;
  vaccinationId: string;
  vaccineName: string;
  dueDate: string;
  daysUntilDue: number;
}

export interface TreatmentReminder {
  type: 'treatment_dose';
  petId: string;
  petName: string;
  treatmentId: string;
  treatmentName: string;
  scheduledTime: string;
  doseDetails: string;
}

// Export all medical record types
export type {
  ReferenceVaccine,
  ReferenceMedication,
  VaccinationRecord,
  TreatmentRecord,
  TreatmentDoseRecord,
  MedicalVisitRecord,
  HealthMetricRecord,
  AllergyRecord,
  ConditionRecord,
  VaccinationFormData,
  TreatmentFormData,
  MedicalVisitFormData,
  HealthMetricFormData,
  VaccinationResponse,
  TreatmentResponse,
  MedicalVisitResponse,
  HealthMetricResponse,
  PetMedicalSummary,
  VaccinationReminder,
  TreatmentReminder
};
