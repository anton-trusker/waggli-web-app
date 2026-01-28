
export type UserRole = 'pet_owner' | 'provider' | 'admin' | 'vet';

export interface PlatformSettings {
  id: string;
  platformName: string;
  logo_url: string;
  favicon_url: string;
  icon_url: string; // App Icon
  ai_icon_url?: string;
  primaryColor?: string;
  modules?: Record<string, boolean>;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    support_url?: string;
  };
  social_links?: Array<{ platform: string; url: string; icon: string }>;
  seo_defaults?: {
    title_template?: string;
    default_description?: string;
    og_image?: string;
  };
  features?: Record<string, boolean>;
  updatedAt?: string;
}

export interface FeatureFlag {
  module_key: string;
  module_name: string;
  description?: string;
  category?: 'core' | 'premium' | 'experimental' | 'beta';
  is_enabled: boolean;
  show_coming_soon: boolean;
  icon?: string;
  requires_subscription?: string[];
  requires_roles?: string[];
  dependencies?: string[];
  can_be_disabled?: boolean;
}


export type AdminRole = 'super_admin' | 'support' | 'content' | 'compliance' | 'finance';

export interface AdminProfile {
  user_id: string;
  role: AdminRole;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: any;
  ip_address?: string;
  created_at: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string; // Emoji
  isActive: boolean;
  isDefault: boolean;
}

export interface TranslationItem {
  key: string;
  translations: Record<string, string>; // { "en": "Hello", "es": "Hola" }
  category?: string; // 'navigation', 'auth', 'common'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  bio: string;
  image: string;
  roles: UserRole[];
  gender?: string;
  birthDate?: string;
  providerProfileId?: string;
  onboardingCompleted?: boolean;
  plan?: 'Free' | 'Premium' | 'Family';
  latitude?: number;
  longitude?: number;
  preferences?: {
    notifications: boolean;
    language: string;
    darkMode: boolean;
    distanceUnit?: 'mi' | 'km';
  };
  createdAt?: string;
  lastLogin?: string;
  // Admin & DB Compatibility
  status?: string;
  role?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  type: string;
  weight: string;
  age: string;
  image: string;
  status: 'Healthy' | 'Check-up' | 'Sick';
  color: string;
  gender?: string;
  birthday?: string;
  microchipId?: string;
  microchipType?: 'Chip' | 'Tattoo';
  bloodType?: string;
  allergies?: string[];
  personality?: string[];
  height?: string;
  passportNumber?: string;
  passportIssuer?: string;
  passportDate?: string;
  registrationNumber?: string;
  veterinarian?: string;
  veterinarianContact?: string;
  distinguishingMarks?: string;
  coatType?: string;
  tailType?: string;
  eyeColor?: string;
  earType?: string;
  neutered?: boolean;
  breedNotes?: string;
  species_id?: string;
  computed_health_score?: number;
}

export interface StaticData {
  breeds: { [species: string]: string[] };
  vaccines: { [species: string]: { name: string; type: 'Core' | 'Non-Core'; frequency: string }[] };
  medications: { [species: string]: string[] };
  colors: string[];
  bloodTypes: { [species: string]: string[] };
}

export interface Insight {
  id: string;
  petId: string;
  category: 'Nutrition' | 'Health' | 'Activity' | 'Training' | 'Grooming';
  title: string;
  summary: string;
  fullContent: string;
  date: string;
}

export type AppointmentStatus = 'Scheduled' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Appointment {
  id: string;
  title: string;
  date: string;
  petId?: string;
  ownerId?: string;
  providerId?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  status?: AppointmentStatus;
  location?: string;
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // UI metadata derived from core fields
  subtitle?: string;
  day?: string;
  month?: string;
  colorClass?: string;
  textClass?: string;
  bgClass?: string;
  petName?: string;
  ownerName?: string;
}

export interface HealthStat {
  label: string;
  count: string;
  total?: string;
  colorClass: string;
  bgClass: string;
  percent: number;
  subtext: string;
}

export interface PetDocument {
  id: string;
  ownerId?: string;
  petId?: string;
  name: string;
  type: string;
  category?: string;
  date?: string;
  size?: string;
  fileType?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  url?: string;
  storagePath?: string;
  notes?: string;
  linkedTo?: string;
  analyzedByAi?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaccineRecord {
  id: string;
  petId?: string;
  ownerId?: string;
  name?: string;
  type: string;
  date: string;
  expiryDate?: string;
  nextDueDate?: string;
  manufacturer?: string;
  batchNo?: string;
  status?: 'Valid' | 'Overdue' | 'Expiring Soon';
  providerName?: string;
  providerId?: string;
  providerAddress?: string;
  notes?: string;
  certificateUrl?: string;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  id: string;
  petId?: string;
  ownerId?: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
  refillDate?: string;
  frequency?: string;
  instructions?: string;
  notes?: string;
  active: boolean;
  providerName?: string;
  providerId?: string;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  petId?: string;
  type: string;
  title: string;
  date: string;
  description: string;
  icon: string;
  colorClass: string;
  providerName?: string;
  providerAddress?: string;
  providerId?: string;
  metadata?: any;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  description: string;
  image: string;
  isVerified: boolean;
  rating: number;
  reviews: number;
  services?: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
  }>;
  // Optional extended fields used in various views/API responses
  ownerId?: string;
  category?: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  isOpen?: boolean;
  source?: string;
  joinedDate?: string;
  servicesList?: string[];
  googlePlaceId?: string;
  documents?: PetDocument[];
  reviewsList?: { id: string; user: string; date: string; rating: number; text: string; }[];
  sourceUrl?: string;
  status?: string;
  owner_name?: string;
  created_at?: string;
}

export interface Reminder {
  id: string;
  ownerId?: string;
  petId?: string;
  title: string;
  date: string;
  time?: string;
  completed: boolean;
  repeat?: 'Daily' | 'Weekly' | 'Monthly' | 'Never';
  priority?: 'Low' | 'Medium' | 'High';
  category?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ... types.ts
export interface Allergy {
  id: string;
  petId: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Anaphylaxis';
  category: 'Food' | 'Environmental' | 'Medication' | 'Insect' | 'Other';
  reaction: string; // e.g. "Hives"
  notes?: string;
  dateIdentified?: string;
  emergencyPlan?: string; // "Use Epipen"
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'reminder' | 'info' | 'gap';
  actionPath?: string;
  actionLabel?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'Banner' | 'Notification' | 'Email';
  status: 'Active' | 'Scheduled' | 'Draft' | 'Ended';
  placement: string;
  content: {
    title: string;
    body?: string;
    image?: string;
    ctaLabel?: string;
    ctaLink?: string;
    animation?: string;
  };
  stats: { views: number; clicks: number; ctr: number };
  targeting: any;
  schedule: any;
}

export interface PlanLimit {
  feature: string; // e.g., 'ocr', 'ai_chat', 'storage'
  limit: number;   // -1 for unlimited
  period: 'daily' | 'monthly' | 'yearly' | 'lifetime';
}

export interface UserUsage {
  id: string;
  userId: string;
  feature: string;
  count: number;
  lastReset: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  price_lifetime?: number; // Added lifetime option
  currency: string;
  description: string;
  features: string[];
  limits: PlanLimit[]; // Structured limits
  isActive: boolean;
  // Legacy fields for backward compatibility
  currency_code?: string;
  ai_features?: any;
}

export interface MedicalVisit {
  id: string;
  petId: string;
  date: string;
  clinicName?: string;
  providerId?: string;
  reason: string;
  diagnosis?: string;
  notes?: string;
  cost?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}
