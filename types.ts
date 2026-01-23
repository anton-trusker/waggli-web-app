
export type UserRole = 'pet_owner' | 'provider' | 'admin' | 'vet';

export interface PlatformSettings {
  id: string;
  platformName: string;
  logo_url: string;
  favicon_url: string;
  icon_url: string; // App Icon
  ai_icon_url?: string; // Custom AI Assistant Icon
  primaryColor?: string;
  modules?: {
    ai_chat: boolean;
    ai_features: boolean; // General AI features
    ai_feed: boolean;
    ocr: boolean;
    services_module: boolean;
    providers_module: boolean;
    subscription_module: boolean;
    community_module: boolean;
  };
  features?: Record<string, boolean>; // Generic extensibility
  updatedAt?: string;
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
  petId?: string;
  ownerId?: string;
  title: string;
  subtitle: string;
  date: string;
  day: string;
  month: string;
  colorClass: string;
  textClass: string;
  bgClass: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  notes?: string;
  providerId?: string;
  status?: AppointmentStatus;
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

export interface Document {
  id: string;
  petId?: string;
  ownerId?: string;
  name: string;
  type: string;
  date: string;
  size: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  url?: string;
  notes?: string;
  storagePath?: string; // Firebase Storage Path
  linkedTo?: string;
}

export interface VaccineRecord {
  id: string;
  petId?: string;
  date: string;
  type: string;
  manufacturer: string;
  batchNo: string;
  expiryDate: string;
  status: 'Valid' | 'Overdue' | 'Expiring Soon';
  providerName?: string;
  providerId?: string;
  providerAddress?: string;
}

export interface Medication {
  id: string;
  petId?: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
  frequency?: string;
  active: boolean;
  providerName?: string;
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
  ownerId?: string;
  name: string;
  type?: 'Individual' | 'Business';
  category: 'Vet' | 'Grooming' | 'Store' | 'Training' | 'Boarding' | 'Pet Sitting' | 'Walking' | 'Other';
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  image: string;
  isOpen: boolean;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  tags: string[];
  description?: string;
  servicesList?: string[];
  documents?: Document[];
  sourceUrl?: string;
  status?: 'Verified' | 'Pending' | 'Rejected';
  isVerified?: boolean;
  joinedDate?: string;
  ownerName?: string;
  // Google Integration
  googlePlaceId?: string;
  source?: 'waggli' | 'google';
  reviewsList?: { id: string; user: string; date: string; rating: number; text: string; }[];
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
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'reminder' | 'info';
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  description: string;
  features: string[];
  limits: any;
  currency_code?: string;
  ai_features?: any;
}
