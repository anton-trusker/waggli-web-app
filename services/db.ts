import { supabase } from "./supabase";
import { Pet, User, Appointment, StaticData, ServiceProvider, MarketingCampaign, SubscriptionPlan, Insight, PlatformSettings, SupportedLanguage, TranslationItem } from "../types";

// Fallback Data
const DEFAULT_STATIC_DATA: StaticData = {
    breeds: {
        Dog: ['Golden Retriever', 'Labrador', 'French Bulldog', 'German Shepherd', 'Poodle'],
        Cat: ['Siamese', 'Persian', 'Maine Coon', 'Ragdoll', 'Bengal']
    },
    vaccines: {
        Dog: [
            { name: 'Rabies', type: 'Core', frequency: 'Every 1-3 years' },
            { name: 'DHPP', type: 'Core', frequency: 'Every 3 years' }
        ],
        Cat: [
            { name: 'Rabies', type: 'Core', frequency: 'Every 1-3 years' },
            { name: 'FVRCP', type: 'Core', frequency: 'Every 3 years' }
        ]
    },
    medications: {
        Dog: ['Heartgard', 'NexGard', 'Apoquel'],
        Cat: ['Revolution', 'Frontline']
    },
    colors: ['Black', 'White', 'Brown', 'Golden', 'Spotted', 'Merle', 'Tricolor'],
    bloodTypes: {
        Dog: ['DEA 1.1 Positive', 'DEA 1.1 Negative'],
        Cat: ['A', 'B', 'AB']
    }
};

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
    id: 'global',
    platformName: 'Pawzly',
    logo_url: '',
    favicon_url: '',
    icon_url: '',
    primaryColor: '#7C5CFC',
    updatedAt: new Date().toISOString()
};

// Helper to check for offline error
const isOfflineError = (err: any) => {
    return err.message && (
        err.message.includes("offline") ||
        err.code === 'unavailable' ||
        err.message.includes("Failed to get document because the client is offline")
    );
};

// --- GLOBAL STATIC DATA ---
export const getStaticData = async (): Promise<StaticData | null> => {
    try {
        // Using default static data - breeds/vaccines/meds now in dedicated tables
        return DEFAULT_STATIC_DATA;
    } catch (error: any) {
        console.warn("Using default static data:", error.message);
        return DEFAULT_STATIC_DATA;
    }
};

// --- PLATFORM SETTINGS ---
export const getPlatformSettings = async (): Promise<PlatformSettings | null> => {
    try {
        const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .eq('id', 'global')
            .single();

        if (error || !data) return DEFAULT_PLATFORM_SETTINGS;
        return data as PlatformSettings;
    } catch (e: any) {
        console.warn("Using default settings:", e.message);
        return DEFAULT_PLATFORM_SETTINGS;
    }
};

export const updatePlatformSettings = async (settings: Partial<PlatformSettings>) => {
    try {
        const { error } = await supabase
            .from('platform_settings')
            .upsert({ id: 'global', ...settings });

        if (error) throw error;
    } catch (e) {
        console.error("Failed to update settings", e);
    }
};

// --- LOCALIZATION (Stubbed) ---
// Moved to bottom of file


// --- USER OPERATIONS ---
export const createUserProfile = async (uid: string, userData: Partial<User>) => {
    const { error } = await supabase
        .from('users')
        .upsert({
            ...userData,
            id: uid,
            roles: userData.roles || ['pet_owner'],
            onboarding_completed: false,
            preferences: { language: 'en', darkMode: false, notifications: true },
            created_at: new Date().toISOString()
        });

    if (error) throw error;
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        return error ? null : (data as User);
    } catch (e) {
        // Return null quietly on error to allow app to use fallback profile from Auth
        return null;
    }
};

export const updateUserProfileDB = async (userId: string, updates: Partial<User> | any) => {
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

    if (error) throw error;
};

export const subscribeToPets = (userId: string, callback: (pets: Pet[]) => void) => {
    // Initial fetch
    supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .then(({ data, error }) => {
            if (!error && data) {
                callback(data as Pet[]);
            } else {
                callback([]);
            }
        });

    // Subscribe to changes
    const subscription = supabase
        .channel(`pets-${userId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'pets', filter: `owner_id=eq.${userId}` },
            () => {
                // Re-fetch on any change
                supabase
                    .from('pets')
                    .select('*')
                    .eq('owner_id', userId)
                    .then(({ data }) => {
                        if (data) callback(data as Pet[]);
                    });
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
};

export const addPetToDB = async (pet: Pet) => {
    const { id, ...petData } = pet;

    if (id && id.length > 20) {
        // Update existing
        const { error } = await supabase
            .from('pets')
            .upsert({ id, ...petData });

        if (error) throw error;
    } else {
        // Insert new
        const { error } = await supabase
            .from('pets')
            .insert(petData);

        if (error) throw error;
    }
};

export const updatePetInDB = async (pet: Pet) => {
    const { error } = await supabase
        .from('pets')
        .update(pet)
        .eq('id', pet.id);

    if (error) throw error;
};

export const deletePetDB = async (id: string) => {
    const { error } = await supabase.from('pets').delete().eq('id', id);
    if (error) throw error;
};

// --- GENERIC REALTIME SUBSCRIPTION ---
export const subscribeToCollection = <T>(
    tableName: string,
    fieldName: string,
    value: string,
    callback: (data: T[]) => void
) => {
    // Initial fetch
    supabase
        .from(tableName)
        .select('*')
        .eq(fieldName, value)
        .then(({ data, error }) => {
            if (!error && data) {
                callback(data as T[]);
            } else {
                console.error(`Error fetching ${tableName}:`, error);
                callback([]);
            }
        });

    // Subscribe to changes
    const subscription = supabase
        .channel(`${tableName}-${value}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: tableName, filter: `${fieldName}=eq.${value}` },
            (payload) => {
                // For simplicity, we re-fetch the list on any change. 
                // Optimization: Handle INSERT/UPDATE/DELETE payload locally.
                supabase
                    .from(tableName)
                    .select('*')
                    .eq(fieldName, value)
                    .then(({ data }) => {
                        if (data) callback(data as T[]);
                    });
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
};

// --- APPOINTMENTS ---
export const addAppointmentDB = async (appt: Appointment) => {
    const { id, ...data } = appt;
    const { error } = await supabase.from('appointments').upsert({ id, ...data });
    if (error) throw error;
};
export const updateAppointmentDB = async (appt: Appointment) => {
    const { error } = await supabase.from('appointments').update(appt).eq('id', appt.id);
    if (error) throw error;
};
export const deleteAppointmentDB = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
};

// --- VACCINES ---
export const addVaccineDB = async (v: VaccineRecord) => {
    const { id, ...data } = v;
    const { error } = await supabase.from('vaccines').upsert({ id, ...data });
    if (error) throw error;
};
export const updateVaccineDB = async (v: VaccineRecord) => {
    const { error } = await supabase.from('vaccines').update(v).eq('id', v.id);
    if (error) throw error;
};
export const deleteVaccineDB = async (id: string) => {
    const { error } = await supabase.from('vaccines').delete().eq('id', id);
    if (error) throw error;
};

// --- MEDICATIONS ---
export const addMedicationDB = async (m: Medication) => {
    const { id, ...data } = m;
    const { error } = await supabase.from('medications').upsert({ id, ...data });
    if (error) throw error;
};
export const updateMedicationDB = async (m: Medication) => {
    const { error } = await supabase.from('medications').update(m).eq('id', m.id);
    if (error) throw error;
};
export const deleteMedicationDB = async (id: string) => {
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (error) throw error;
};

// --- REMINDERS ---
export const addReminderDB = async (r: Reminder) => {
    const { id, ...data } = r;
    const { error } = await supabase.from('reminders').upsert({ id, ...data });
    if (error) throw error;
};
export const updateReminderDB = async (r: Reminder) => {
    const { error } = await supabase.from('reminders').update(r).eq('id', r.id);
    if (error) throw error;
};
export const deleteReminderDB = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) throw error;
};

// --- ACTIVITIES ---
export const addActivityDB = async (a: Activity) => {
    const { id, ...data } = a;
    const { error } = await supabase.from('activities').upsert({ id, ...data });
    if (error) throw error;
};

// --- DOCUMENTS ---
export const addDocumentDB = async (d: Document) => {
    const { id, ...data } = d;
    const { error } = await supabase.from('documents').upsert({ id, ...data });
    if (error) throw error;
};
export const deleteDocumentDB = async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
};

// --- SERVICES DISCOVERY ---
export const getAllServices = async (): Promise<ServiceProvider[]> => {
    try {
        const { data, error } = await supabase
            .from('service_providers') // Assuming table name
            .select('*');
        if (error) return [];
        return data as unknown as ServiceProvider[];
    } catch (e) {
        return [];
    }
};

export const registerProviderDB = async (provider: ServiceProvider) => {
    // Removing ID from provider object might be needed if it's auto-generated, 
    // but here we likely want to keep the UUID we generated in frontend or let DB handle it.
    // Assuming upsert with ID is fine.
    const { id, ...data } = provider;
    // Ensure owner_id is set
    const { error } = await supabase.from('service_providers').upsert({ id, ...data });
    if (error) throw error;
};





// --- ADMIN: USER MANAGEMENT ---
export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as User[];
    } catch (e) {
        console.error("Fetch Users Failed", e);
        return [];
    }
};

export const deleteUserAccount = async (userId: string) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) throw error;
};

export const updateUserStatus = async (userId: string, status: string) => {
    const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

    if (error) throw error;
};

// --- ADMIN: PROVIDER MANAGEMENT ---
export const fetchAllProviders = async (): Promise<ServiceProvider[]> => {
    try {
        const { data, error } = await supabase
            .from('service_providers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as ServiceProvider[];
    } catch (e) {
        console.error("Fetch Providers Failed", e);
        return [];
    }
};

export const updateProviderVerification = async (providerId: string, status: string) => {
    const { error } = await supabase
        .from('service_providers')
        .update({
            status,
            is_verified: status === 'Verified'
        })
        .eq('id', providerId);

    if (error) throw error;
};

// --- ADMIN: MARKETING ---
export const fetchCampaigns = async (): Promise<MarketingCampaign[]> => {
    try {
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as unknown as MarketingCampaign[];
    } catch (e) {
        return [];
    }
};

export const saveCampaignDB = async (campaign: Partial<MarketingCampaign>) => {
    const { id, ...data } = campaign;
    const { error } = await supabase
        .from('marketing_campaigns')
        .upsert({ id, ...data });

    if (error) throw error;
};

// --- ADMIN: SUBSCRIPTIONS ---
export const fetchPlans = async (): Promise<SubscriptionPlan[]> => {
    try {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price_monthly', { ascending: true });

        if (error) throw error;
        return data as SubscriptionPlan[];
    } catch (e) {
        return [];
    }
};

export const savePlanDB = async (plan: Partial<SubscriptionPlan>) => {
    const { id, ...data } = plan;
    const { error } = await supabase
        .from('subscription_plans')
        .upsert({ id, ...data });

    if (error) throw error;
};

// --- PROVIDER PORTAL ---

export const getProviderByOwnerId = async (userId: string): Promise<ServiceProvider | null> => {
    try {
        const { data, error } = await supabase
            .from('service_providers')
            .select('*')
            .eq('owner_id', userId)
            .limit(1)
            .maybeSingle();

        if (error || !data) return null;
        return data as unknown as ServiceProvider; // Type casting for now
    } catch (e) {
        return null;
    }
};

export const getProviderAppointmentsDB = async (providerId: string): Promise<Appointment[]> => {
    try {
        // Fetch appointments for this provider
        // Assuming appointments table has a 'provider_id' column
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('provider_id', providerId)
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (error) throw error;
        return data as Appointment[];
    } catch (e) {
        console.error("Fetch Provider Appointments Failed", e);
        return [];
    }
};

export const saveProviderServiceDB = async (providerId: string, serviceList: string[]) => {
    // Updates the servicesList array for a provider
    const { error } = await supabase
        .from('service_providers')
        .update({ servicesList: serviceList })
        .eq('id', providerId);

    if (error) throw error;
};

// --- GOOGLE MAPS SERVICE CACHING ---
// --- GOOGLE MAPS SERVICE CACHING ---
export const upsertGoogleService = async (place: any): Promise<ServiceProvider> => {
    // Construct minimal provider object from Google Place result (Autocomplete or Search)
    const provider: ServiceProvider = {
        id: 'google-' + (place.placeId || place.place_id),
        name: place.name,
        type: 'Business',
        category: 'Vet', // Default, logic should ideally determine this or pass as arg
        description: `Located at ${place.address}`,
        address: place.address,
        isVerified: false,
        source: 'google',
        joinedDate: new Date().toISOString(),
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        latitude: place.latitude || (place.geometry?.location?.lat && place.geometry.location.lat()) || 0,
        longitude: place.longitude || (place.geometry?.location?.lng && place.geometry.location.lng()) || 0,
        phone: place.phone || place.formatted_phone_number || '',
        website: place.website || '',
        image: place.photos && place.photos.length > 0
            ? (typeof place.photos[0] === 'string' ? place.photos[0] : place.photos[0].getUrl({ maxWidth: 400 }))
            : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300&auto=format&fit=crop',
        isOpen: place.isOpen || (place.opening_hours && place.opening_hours.isOpen ? place.opening_hours.isOpen() : false) || false,
        tags: ['Google Place'],
        googlePlaceId: place.placeId || place.place_id
    };

    // Upsert into Supabase to cache/persist
    // We handle this gracefully if it fails (e.g. RLS), simply returning the object for UI use
    try {
        const { error } = await supabase
            .from('service_providers')
            .upsert({
                id: provider.id,
                name: provider.name,
                category: provider.category,
                address: provider.address,
                phone: provider.phone,
                website: provider.website,
                image: provider.image,
                rating: provider.rating,
                reviews: provider.reviews,
                latitude: provider.latitude,
                longitude: provider.longitude,
                google_place_id: provider.googlePlaceId,
                source: 'google',
                is_open: provider.isOpen,
                description: provider.description
            }, { onConflict: 'id' });

        if (error) console.warn("Cache to DB failed, using local object:", error.message);
    } catch (e) {
        console.warn("Cache to DB failed:", e);
    }

    return provider;
};

// --- AI DATA PERSISTENCE ---
export const saveAIInsightDB = async (petId: string, insight: Insight | any) => {
    console.warn("saveAIInsightDB not implemented");
};

export const fetchAIInsightsDB = async (petId: string) => {
    // Stubbed for Supabase migration
    return [];
};

// --- LOCALIZATION  ---
// --- LOCALIZATION  ---
export const getSupportedLanguages = async (): Promise<SupportedLanguage[]> => {
    try {
        const { data, error } = await supabase
            .from('supported_languages')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        // Map snake_case is_active to camelCase isActive
        return data.map(l => ({
            code: l.code,
            name: l.name,
            flag: l.flag,
            isActive: l.is_active,
            isDefault: l.is_default
        })) as SupportedLanguage[];
    } catch (e) {
        console.error("Fetch languages failed", e);
        // Fallback default
        return [{ code: 'en', name: 'English', flag: '🇺🇸', isActive: true, isDefault: true }];
    }
};

export const getAllLanguages = async (): Promise<SupportedLanguage[]> => {
    try {
        const { data, error } = await supabase
            .from('supported_languages')
            .select('*')
            .order('name');

        if (error) throw error;
        return data.map(l => ({
            code: l.code,
            name: l.name,
            flag: l.flag,
            isActive: l.is_active,
            isDefault: l.is_default
        })) as SupportedLanguage[];
    } catch (e) {
        return [];
    }
};

export const updateLanguageStatus = async (code: string, isActive: boolean) => {
    const { error } = await supabase
        .from('supported_languages')
        .update({ is_active: isActive })
        .eq('code', code);
    if (error) throw error;
};

export const getTranslations = async (): Promise<Record<string, TranslationItem>> => {
    try {
        const { data, error } = await supabase
            .from('translations')
            .select('*');

        if (error) throw error;

        // Convert array to Record<key, TranslationItem>
        const map: Record<string, TranslationItem> = {};
        if (data) {
            data.forEach((row: any) => {
                map[row.key] = {
                    key: row.key,
                    translations: row.translations,
                    category: row.category
                };
            });
        }
        return map;
    } catch (e) {
        console.error("Fetch translations failed", e);
        return {};
    }
};

export const saveTranslation = async (key: string, translations: Record<string, string>) => {
    const { error } = await supabase
        .from('translations')
        .upsert({
            key,
            translations,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

    if (error) throw error;
};
