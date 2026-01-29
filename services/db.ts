import { supabase } from "./supabase";
import { MedicalVisit, Pet, User, Appointment, StaticData, ServiceProvider, MarketingCampaign, SubscriptionPlan, Insight, PlatformSettings, SupportedLanguage, TranslationItem, Notification, VaccineRecord, Medication, PetDocument, Reminder, Activity } from "../types";
import {
    mapDbPetToAppPet,
    mapAppPetToDbPet,
    mapDbVaccineToAppVaccine,
    mapDbMedicationToAppMedication,
    mapDbAppointmentToAppAppointment,
    mapDbUserToAppUser,
    mapDbReminderToAppReminder,
    mapAppReminderToDbReminder,
    mapAppMedicalVisitToDbMedicalVisit
} from "../utils/mappers";


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
        const dbPayload: any = {
            id: 'global',
            ...settings
        };

        // Explicitly map camelCase to snake_case for DB
        if (settings.platformName) dbPayload.platform_name = settings.platformName;
        if (settings.primaryColor) dbPayload.primary_color = settings.primaryColor;

        // Remove camelCase keys that don't exist in DB
        delete dbPayload.platformName;
        delete dbPayload.primaryColor;

        const { error } = await supabase
            .from('platform_settings')
            .upsert(dbPayload);

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
                callback((data || []).map(mapDbPetToAppPet));
            } else {
                callback([]);
            }
        });

    // Subscribe to changes
    const subscription = supabase
        .channel(`pets-${userId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'pets', filter: `owner_id=eq.${userId}` },
            async () => {
                // Re-fetch on any change
                const { data, error } = await supabase
                    .from('pets')
                    .select('*')
                    .eq('owner_id', userId);

                if (!error && data) {
                    callback((data || []).map(mapDbPetToAppPet));
                }
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
};

export const addPetToDB = async (pet: Pet): Promise<Pet> => {
    const dbPetData = mapAppPetToDbPet(pet);
    const { id, ...petData } = dbPetData;

    if (id && id.length > 20) {
        // Update existing
        const { data, error } = await supabase
            .from('pets')
            .upsert({ id, ...petData })
            .select()
            .single();

        if (error) throw error;
        return mapDbPetToAppPet(data);
    } else {
        // Insert new
        const { data, error } = await supabase
            .from('pets')
            .insert(petData)
            .select()
            .single();

        if (error) throw error;
        return mapDbPetToAppPet(data);
    }
};

export const updatePetInDB = async (pet: Pet) => {
    const dbPet = mapAppPetToDbPet(pet);
    const { error } = await supabase
        .from('pets')
        .update(dbPet)
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
    callback: (data: T[]) => void,
    mapper?: (item: any) => T
) => {
    // Initial fetch
    supabase
        .from(tableName)
        .select('*')
        .eq(fieldName, value)
        .then(({ data, error }) => {
            if (!error && data) {
                const mappedData = mapper ? data.map(mapper) : (data as T[]);
                callback(mappedData);
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
            async () => {
                // Re-fetch on any change
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq(fieldName, value);

                if (!error && data) {
                    const mappedData = mapper ? data.map(mapper) : (data as T[]);
                    callback(mappedData);
                }
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
};


// --- APPOINTMENTS ---
export const addAppointmentDB = async (appt: Appointment) => {
    const dbAppt = {
        id: appt.id,
        pet_id: appt.petId,
        owner_id: appt.ownerId,
        provider_id: appt.providerId,
        title: appt.title,
        date: appt.date,
        start_time: appt.startTime || appt.time,
        end_time: appt.endTime,
        status: appt.status,
        location: appt.location,
        location_name: appt.locationName,
        address: appt.address,
        latitude: appt.latitude,
        longitude: appt.longitude,
        google_place_id: appt.googlePlaceId,
        notes: appt.notes,
        type: appt.type
    };
    const { id, ...data } = dbAppt;
    const { error } = await supabase.from('appointments').upsert({ id, ...data });
    if (error) throw error;
};
export const updateAppointmentDB = async (appt: Appointment) => {
    const dbAppt = {
        id: appt.id,
        pet_id: appt.petId,
        owner_id: appt.ownerId,
        provider_id: appt.providerId,
        title: appt.title,
        date: appt.date,
        start_time: appt.startTime || appt.time,
        end_time: appt.endTime,
        status: appt.status,
        location: appt.location,
        location_name: appt.locationName,
        address: appt.address,
        latitude: appt.latitude,
        longitude: appt.longitude,
        google_place_id: appt.googlePlaceId,
        notes: appt.notes,
        type: appt.type
    };
    const { error } = await supabase.from('appointments').update(dbAppt).eq('id', appt.id);
    if (error) throw error;
};
export const deleteAppointmentDB = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
};

// --- VACCINES ---
export const addVaccineDB = async (v: VaccineRecord) => {
    const dbVax = {
        id: v.id,
        pet_id: v.petId,
        owner_id: (v as any).ownerId,
        reference_vaccine_id: v.referenceVaccineId, // Map to DB
        type: v.type,
        date: v.date,
        name: v.name,
        expiry_date: v.expiryDate,
        next_due_date: v.nextDueDate,
        manufacturer: v.manufacturer,
        batch_no: v.batchNo,
        status: v.status,
        provider_name: v.providerName,
        provider_id: v.providerId,
        provider_address: v.providerAddress,
        certificate_url: v.certificateUrl,
        document_id: v.documentId,
        notes: v.notes
    };
    const { id, ...data } = dbVax;
    const { error } = await supabase.from('pet_vaccines').upsert({ id, ...data });
    if (error) throw error;
};
export const updateVaccineDB = async (v: VaccineRecord) => {
    const dbVax = {
        id: v.id,
        pet_id: v.petId,
        owner_id: (v as any).ownerId,
        type: v.type,
        date: v.date,
        name: v.name,
        expiry_date: v.expiryDate,
        next_due_date: v.nextDueDate,
        manufacturer: v.manufacturer,
        batch_no: v.batchNo,
        status: v.status,
        provider_name: v.providerName,
        provider_id: v.providerId,
        provider_address: v.providerAddress,
        certificate_url: v.certificateUrl,
        document_id: v.documentId,
        notes: v.notes
    };
    const { error } = await supabase.from('pet_vaccines').update(dbVax).eq('id', v.id);
    if (error) throw error;
};
export const deleteVaccineDB = async (id: string) => {
    const { error } = await supabase.from('pet_vaccines').delete().eq('id', id);
    if (error) throw error;
};

// --- MEDICATIONS ---
export const addMedicationDB = async (m: Medication) => {
    const dbMed = {
        id: m.id,
        pet_id: m.petId,
        owner_id: (m as any).ownerId,
        name: m.name,
        category: m.category,
        start_date: m.startDate,
        end_date: m.endDate,
        refill_date: m.refillDate,
        frequency: m.frequency,
        active: m.active,
        instructions: m.instructions,
        notes: m.notes,
        provider_name: m.providerName,
        provider_id: m.providerId,
        document_id: m.documentId
    };
    const { id, ...data } = dbMed;
    const { error } = await supabase.from('pet_medications').upsert({ id, ...data });
    if (error) throw error;
};
export const updateMedicationDB = async (m: Medication) => {
    const dbMed = {
        id: m.id,
        pet_id: m.petId,
        owner_id: (m as any).ownerId,
        name: m.name,
        category: m.category,
        start_date: m.startDate,
        end_date: m.endDate,
        refill_date: m.refillDate,
        frequency: m.frequency,
        active: m.active,
        instructions: m.instructions,
        notes: m.notes,
        provider_name: m.providerName,
        provider_id: m.providerId,
        document_id: m.documentId
    };
    const { error } = await supabase.from('pet_medications').update(dbMed).eq('id', m.id);
    if (error) throw error;
};
export const deleteMedicationDB = async (id: string) => {
    const { error } = await supabase.from('pet_medications').delete().eq('id', id);
    if (error) throw error;
};

// --- REMINDERS ---
export const addReminderDB = async (r: Reminder) => {
    const dbRem = mapAppReminderToDbReminder(r);
    const { id, ...data } = dbRem;
    const { error } = await supabase.from('reminders').upsert({ id, ...data });
    if (error) throw error;
};
export const updateReminderDB = async (r: Reminder) => {
    const dbRem = mapAppReminderToDbReminder(r);
    const { error } = await supabase.from('reminders').update(dbRem).eq('id', r.id);
    if (error) throw error;
};

export const deleteReminderDB = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) throw error;
};

// --- NOTIFICATIONS ---
export const getNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('id, user_id, title, body, created_at, resource_type, read, action_url, priority')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        // Map database fields to app interface
        // We can reuse the mapper if imported or inline map correctly
        return (data || []).map(n => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.body || '', // Map body to message
            time: new Date(n.created_at).toLocaleString(),
            read: n.read || false,
            type: (n.resource_type as any) || 'info', // resource_type is the new type field
            actionPath: n.action_url,
            priority: (n.priority as any) || 'low'
        }));
    } catch (e) {
        console.error('Failed to fetch notifications:', e);
        return [];
    }
};

export const createNotification = async (notification: Partial<Notification> & { ownerId: string }) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: notification.ownerId,
                title: notification.title,
                body: notification.message, // Map message to body
                resource_type: notification.type || 'info', // type -> resource_type
                // We might want to set template_id if available, or just raw body
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Failed to create notification:', e);
        throw e;
    }
};

export const updateNotification = async (id: string, updates: Partial<Notification>) => {
    try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.message !== undefined) dbUpdates.message = updates.message;
        if (updates.read !== undefined) dbUpdates.read = updates.read;
        if (updates.type !== undefined) dbUpdates.type = updates.type;

        const { error } = await supabase
            .from('notifications')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    } catch (e) {
        console.error('Failed to update notification:', e);
        throw e;
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) throw error;
    } catch (e) {
        console.error('Failed to mark notification as read:', e);
        throw e;
    }
};

export const markAllNotificationsRead = async (userId: string) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;
    } catch (e) {
        console.error('Failed to mark all notifications as read:', e);
        throw e;
    }
};

export const deleteNotification = async (id: string) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (e) {
        console.error('Failed to delete notification:', e);
        throw e;
    }
};


// --- ACTIVITIES ---
export const addActivityDB = async (a: Activity) => {
    const { id, ...data } = a;
    const { error } = await supabase.from('activities').upsert({ id, ...data });
    if (error) throw error;
};

// --- DOCUMENTS ---
export const addDocumentDB = async (d: PetDocument) => {
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
        // TODO: marketing_campaigns table doesn't exist
        console.warn('Marketing campaigns disabled - table does not exist');
        return [];
        // const { data, error } = await supabase
        //     .from('marketing_campaigns')
        //     .select('*')
        //     .order('created_at', { ascending: false });
        // if (error) throw error;
        // return data as unknown as MarketingCampaign[];
    } catch (e) {
        return [];
    }
};

// --- ADMIN STATS (REAL DATA) ---

export const fetchAllPets = async (): Promise<Pet[]> => {
    try {
        const { data, error } = await supabase
            .from('pets')
            .select('*');

        if (error) throw error;
        return data as Pet[];
    } catch (e) {
        console.error("Fetch All Pets Failed", e);
        return [];
    }
};

export const calculateAdminStats = async (users: User[], pets: Pet[]) => {
    // Calculate real revenue from paid plans
    const paidUsers = users.filter(user => user.plan !== 'Free');
    const revenue = paidUsers.reduce((sum, user) => {
        if (user.plan === 'Premium') return sum + 10;  // $10/month
        if (user.plan === 'Family') return sum + 15;   // $15/month
        return sum;
    }, 0);

    // Calculate average pets per user
    const avgPetsPerUser = users.length > 0 ? pets.length / users.length : 0;

    return {
        totalUsers: users.length,
        totalPets: pets.length,
        totalRevenue: revenue,
        activeSubs: paidUsers.length,
        avgPetsPerUser: avgPetsPerUser.toFixed(1)
    };
};

export const getTrends = async () => {
    try {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Users: compare this week to last week
        const { count: totalUsersCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: usersThisWeek } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastWeek.toISOString());

        const { count: usersLastWeek } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', lastWeek.toISOString())
            .gte('created_at', new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const userGrowth = usersLastWeek && usersLastWeek > 0
            ? ((usersThisWeek || 0) - usersLastWeek) / usersLastWeek * 100
            : usersThisWeek ? 100 : 0;

        // Pets: similar calculation
        const { count: petsThisWeek } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastWeek.toISOString());

        const { count: petsLastWeek } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', lastWeek.toISOString())
            .gte('created_at', new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const petGrowth = petsLastWeek && petsLastWeek > 0
            ? ((petsThisWeek || 0) - petsLastWeek) / petsLastWeek * 100
            : petsThisWeek ? 100 : 0;

        // Revenue growth (simplified - based on user growth)
        const revenueGrowth = userGrowth * 0.7; // Approximate

        // Sub growth = paid users this week vs last week
        const { data: paidThisWeek } = await supabase
            .from('users')
            .select('plan')
            .neq('plan', 'Free')
            .gte('created_at', lastWeek.toISOString());

        const { data: paidLastWeek } = await supabase
            .from('users')
            .select('plan')
            .neq('plan', 'Free')
            .lt('created_at', lastWeek.toISOString())
            .gte('created_at', new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const subGrowth = (paidLastWeek?.length || 0) > 0
            ? ((paidThisWeek?.length || 0) - (paidLastWeek?.length || 0)) / (paidLastWeek?.length || 1) * 100
            : (paidThisWeek?.length || 0) > 0 ? 100 : 0;

        return {
            userGrowth: parseFloat(userGrowth.toFixed(1)),
            petGrowth: parseFloat(petGrowth.toFixed(1)),
            revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
            subGrowth: parseFloat(subGrowth.toFixed(1))
        };
    } catch (error) {
        console.error("Get Trends Failed", error);
        return {
            userGrowth: 0,
            petGrowth: 0,
            revenueGrowth: 0,
            subGrowth: 0
        };
    }
};

export const saveCampaignDB = async (campaign: Partial<MarketingCampaign>) => {
    // TODO: marketing_campaigns table doesn't exist
    console.warn('Marketing campaign save disabled - table does not exist');
    // const { id, ...data } = campaign;
    // const { error } = await supabase
    //     .from('marketing_campaigns')
    //     .upsert({ id, ...data });
    // if (error) throw error;
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
export const saveAIInsightDB = async (petId: string, insight: any, type: string = 'ai_insight') => {
    const { data: pet } = await supabase.from('pets').select('owner_id').eq('id', petId).single();
    if (!pet) throw new Error("Pet not found");

    const { error } = await supabase.from('health_records').insert({
        pet_id: petId,
        owner_id: pet.owner_id,
        type: type,
        title: insight.title || 'AI Health Analysis',
        description: insight.summary || insight.explanation || '',
        date_recorded: new Date().toISOString().split('T')[0],
        metadata: insight
    });

    if (error) throw error;
};

export const fetchAIInsightsDB = async (petId: string, type: string = 'ai_insight') => {
    const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .eq('type', type)
        .order('date_recorded', { ascending: false });

    if (error) throw error;
    return data || [];
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

export const saveTranslationsBulk = async (items: { key: string, translations: Record<string, string> }[]) => {
    const { error } = await supabase
        .from('translations')
        .upsert(items.map(i => ({
            key: i.key,
            translations: i.translations,
            updated_at: new Date().toISOString()
        })), { onConflict: 'key' });

    if (error) throw error;
};

// --- MEDICAL VISITS ---
export const addMedicalVisitDB = async (visit: MedicalVisit) => {
    const dbVisit = mapAppMedicalVisitToDbMedicalVisit(visit);
    const { error } = await supabase.from('medical_visits').insert(dbVisit);
    if (error) throw error;
};

export const updateMedicalVisitDB = async (visit: MedicalVisit) => {
    const dbVisit = mapAppMedicalVisitToDbMedicalVisit(visit);
    const { error } = await supabase.from('medical_visits').update(dbVisit).eq('id', visit.id);
    if (error) throw error;
};

export const deleteMedicalVisitDB = async (id: string) => {
    const { error } = await supabase.from('medical_visits').delete().eq('id', id);
    if (error) throw error;
};
