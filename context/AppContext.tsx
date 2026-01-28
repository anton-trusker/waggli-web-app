
import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { MedicalVisit, User, Pet, Appointment, PetDocument, VaccineRecord, Medication, Activity, HealthStat, Reminder, Notification, ServiceProvider, AppointmentStatus, StaticData, UserRole } from '../types';
import { supabase, getUserProfile as getSupabaseUserProfile, updateUserProfile as updateSupabaseUserProfile } from '../services/supabase';
import {
    createUserProfile,
    getUserProfile,
    subscribeToPets,
    subscribeToCollection,
    addPetToDB,
    updatePetInDB,
    deletePetDB,
    getStaticData,
    registerProviderDB,
    getProviderByOwnerId,
    updateUserProfileDB,
    saveAIInsightDB,
    fetchAIInsightsDB,
    getAllServices,
    addAppointmentDB, updateAppointmentDB, deleteAppointmentDB,
    addVaccineDB, updateVaccineDB, deleteVaccineDB,
    addMedicationDB, updateMedicationDB, deleteMedicationDB,
    addReminderDB, updateReminderDB, deleteReminderDB,

    getNotifications, createNotification, updateNotification, markNotificationRead as markNotificationReadDB, markAllNotificationsRead as markAllNotificationsReadDB, deleteNotification,
    addActivityDB,
    addMedicalVisitDB, updateMedicalVisitDB, deleteMedicalVisitDB,
    addDocumentDB, deleteDocumentDB
} from '../services/db';
import { uploadBase64, deleteFile } from '../services/storage';
import {
    mapDbUserToAppUser,
    mapAppUserToDbUser,
    mapDbPetToAppPet,
    mapDbAppointmentToAppAppointment,
    mapDbVaccineToAppVaccine,
    mapDbMedicationToAppMedication,
    mapDbReminderToAppReminder
} from '../utils/mappers';
import { checkVaccineDueNotifications, checkMedicationRefillNotifications, checkAppointmentNotifications, generateAllNotifications } from '../utils/notificationGenerator';
import type { Session } from '@supabase/supabase-js';

interface AppContextType {
    isAuthenticated: boolean;
    user: User;
    staticData: StaticData | null;
    pets: Pet[];
    appointments: Appointment[];
    providerAppointments: Appointment[];
    reminders: Reminder[];
    documents: PetDocument[];
    vaccines: VaccineRecord[];
    medications: Medication[];
    activities: Activity[];
    healthStats: HealthStat[];
    notifications: Notification[];
    medicalVisits: MedicalVisit[];
    services: ServiceProvider[];
    favoriteServiceIds: string[];
    providerProfile: ServiceProvider | null;
    isAdminMode: boolean;

    login: (email: string, pass: string) => Promise<void>;
    register: (name: string, email: string, pass: string) => Promise<void>;
    completeOnboarding: (userData: Partial<User>) => Promise<void>;
    logout: () => void;

    addPet: (pet: Pet) => Promise<Pet>;
    updatePet: (pet: Pet) => Promise<void | Pet>;
    deletePet: (id: string) => Promise<void>;

    toggleAdminMode: () => void;
    providerLogin: (email: string, pass: string) => Promise<void>;
    registerAsProvider: (provider: ServiceProvider) => Promise<void>;
    updateProviderProfile: (provider: ServiceProvider) => Promise<void>;
    updateUser: (user: User) => Promise<void>;

    addAppointment: (appt: Appointment) => void;
    updateAppointment: (appt: Appointment) => void;
    updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
    deleteAppointment: (id: string) => void;

    addDocument: (doc: PetDocument) => void;
    deleteDocument: (id: string) => void;

    addVaccine: (vax: VaccineRecord) => void;
    updateVaccine: (vax: VaccineRecord) => void;

    addMedication: (med: Medication) => void;
    updateMedication: (med: Medication) => void;

    addActivity: (act: Activity) => void;
    addMedicalVisit: (visit: MedicalVisit) => Promise<void>;
    saveHealthRecord: (petId: string, type: string, title: string, data: any) => Promise<void>;

    fetchPetAIInsights: (petId: string, type?: string) => Promise<any[]>;

    addReminder: (reminder: Reminder) => void;
    updateReminder: (reminder: Reminder) => void;
    deleteReminder: (id: string) => void;

    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    toggleServiceFavorite: (id: string) => void;
    searchServices: (category: string, location: string, lat: number, lng: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: User = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    image: '',
    roles: []
};

export const AppProvider = ({ children }: PropsWithChildren<{}>) => {
    const [user, setUser] = useState<User>(DEFAULT_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [staticData, setStaticData] = useState<StaticData | null>(null);

    // Data States
    const [pets, setPets] = useState<Pet[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [providerAppointments, setProviderAppointments] = useState<Appointment[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [documents, setDocuments] = useState<PetDocument[]>([]);

    const [healthStats, setHealthStats] = useState<HealthStat[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [services, setServices] = useState<ServiceProvider[]>([]);
    const [favoriteServiceIds, setFavoriteServiceIds] = useState<string[]>([]);
    const [providerProfile, setProviderProfile] = useState<ServiceProvider | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);

    // Initialize Data
    useEffect(() => {
        // Fetch Global Static Data
        getStaticData().then(data => { if (data) setStaticData(data); });

        // Fetch Services for Discovery
        getAllServices().then(data => setServices(data));

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                handleUserSession(session);
            }
        });

        // Listen to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);

            if (session) {
                handleUserSession(session);
            } else {
                setUser(DEFAULT_USER);
                setIsAuthenticated(false);
                setPets([]);
                setAppointments([]);
                setProviderProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Subscribe to Pets
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (user.id && isAuthenticated) {
            unsubscribe = subscribeToPets(user.id, (data) => {
                setPets(data);
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user.id, isAuthenticated]);

    // Subscribe to Appointments
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (user.id && isAuthenticated) {
            unsubscribe = subscribeToCollection<Appointment>('appointments', 'owner_id', user.id, (data) => {
                setAppointments(data);
            }, mapDbAppointmentToAppAppointment);
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user.id, isAuthenticated]);

    // Subscribe to Provider Appointments when profile is loaded
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (providerProfile?.id) {
            unsubscribe = subscribeToCollection<Appointment>('appointments', 'provider_id', providerProfile.id, (data) => {
                setProviderAppointments(data);
            }, mapDbAppointmentToAppAppointment);
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [providerProfile]);

    // Subscribe to Notifications when user is authenticated
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (user.id && isAuthenticated) {
            // Use user_id as confirmed by DB schema check
            unsubscribe = subscribeToCollection<Notification>('notifications', 'user_id', user.id, (data) => {
                setNotifications(data);
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user.id, isAuthenticated]);

    // Subscribe to Reminders
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (user.id && isAuthenticated) {
            unsubscribe = subscribeToCollection<Reminder>('reminders', 'owner_id', user.id, setReminders, mapDbReminderToAppReminder);
        }
        return () => { if (unsubscribe) unsubscribe(); };
    }, [user.id, isAuthenticated]);

    // INTELLIGENT NOTIFICATION SYSTEM
    useEffect(() => {
        if (user.id && isAuthenticated && pets.length > 0) {
            // Run health gap analysis
            generateAllNotifications({
                pet: pets[0], // Focus on primary pet for now, or iterate all in future
                vaccines,
                medications,
                appointments,
                lastWeightLogDate: activities.find(a => a.type === 'vitals')?.date
            }, user.id);
        }
    }, [user.id, isAuthenticated, pets, vaccines, medications, appointments, activities]);

    // Helper function to handle user session

    // ... (in handleUserSession)
    const handleUserSession = async (session: Session) => {
        try {
            const { data: profile, error } = await getSupabaseUserProfile(session.user.id);

            if (profile) {
                // Map DB user to App User (snake_case -> camelCase)
                const appUser = mapDbUserToAppUser(profile);
                setUser(appUser);
                setIsAuthenticated(true);

                // Check for provider profile
                const prov = await getProviderByOwnerId(session.user.id);
                if (prov) setProviderProfile(prov);
            } else if (error) {
                console.error('Profile fetch failed:', error);
                // Temporary fallback if profile not created yet
                setUser({
                    ...DEFAULT_USER,
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || ''
                });
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Error handling user session:', e);
            setUser({ ...DEFAULT_USER, id: session.user.id, email: session.user.email || '' });
            setIsAuthenticated(true);
        }
    };

    // --- Auth Functions ---

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
    };

    const register = async (name: string, email: string, pass: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { name } // Store name in user metadata
            }
        });

        if (error) throw error;
        // Profile creation is handled by handle_new_user trigger in Supabase
    };

    // ... (in completeOnboarding)
    const completeOnboarding = async (userData: Partial<User>) => {
        if (!user.id) return;

        // Only update with columns that exist in users table
        const updateData: any = {
            onboarding_completed: true
        };

        // Add only supported fields
        if (userData.name) updateData.name = userData.name;
        if (userData.phone) updateData.phone = userData.phone;
        if (userData.country) updateData.country = userData.country;
        if (userData.city) updateData.city = userData.city;
        if (userData.image) updateData.image = userData.image;
        if (userData.bio) updateData.bio = userData.bio;


        try {
            await updateUserProfileDB(user.id, updateData);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }

        // Update local state with mapped values
        // We simulate the DB response by merging current state with mapped updates
        // Since updateData uses snake_case, but we want to set camelCase in state:
        const mappedUpdates = {
            name: updateData.name,
            phone: updateData.phone,
            city: updateData.city,
            country: updateData.country,
            image: updateData.image,
            bio: updateData.bio,
            onboardingCompleted: true // Explicitly set camelCase
        };

        setUser(prev => ({ ...prev, ...mappedUpdates }));
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error);
    };

    // --- Data Operations ---

    const addPet = async (pet: Pet): Promise<Pet> => {
        if (pet.image && pet.image.startsWith('data:')) {
            try {
                const url = await uploadBase64(pet.image, `pets/${user.id}/avatars`);
                pet.image = url;
            } catch (e) { console.error("Upload failed", e); }
        }
        const savedPet = await addPetToDB({ ...pet, ownerId: user.id });
        return savedPet;
    };

    const updatePet = async (pet: Pet): Promise<void | Pet> => {
        if (pet.image && pet.image.startsWith('data:')) {
            const url = await uploadBase64(pet.image, `pets/${pet.id}/avatars`);
            pet.image = url;
        }
        return await updatePetInDB(pet);
    };

    const deletePet = async (id: string): Promise<void> => {
        await deletePetDB(id);
    };

    const addDocument = async (d: PetDocument) => {
        await addDocumentDB({ ...d, ownerId: user.id });
    };

    const deleteDocument = async (id: string) => {
        const docData = documents.find(d => d.id === id);
        if (docData?.storagePath) await deleteFile(docData.storagePath);
        await deleteDocumentDB(id);
    };

    // Provider
    const providerLogin = login;
    const registerAsProvider = async (p: ServiceProvider) => {
        await registerProviderDB({ ...p, ownerId: user.id });

        const newRoles: UserRole[] = user.roles && user.roles.includes('provider')
            ? user.roles
            : [...(user.roles || []), 'provider'];
        await updateUserProfileDB(user.id, { roles: newRoles });

        setUser(prev => ({ ...(prev as User), roles: newRoles }));
        setProviderProfile(p);
    };

    const updateProviderProfile = async (p: ServiceProvider) => {
        await registerProviderDB(p);
        setProviderProfile(p);
    };

    // AI Persistence
    const saveHealthRecord = async (petId: string, type: string, title: string, data: any) => {
        if (type === 'ai_insight' || type === 'symptom_analysis' || type === 'ai_news') {
            await saveAIInsightDB(petId, { title, summary: data.summary || data.explanation, ...data }, type);
        } else {
            const act: Activity = {
                id: Date.now().toString(), petId, type, title,
                description: JSON.stringify(data), date: new Date().toISOString().split('T')[0],
                icon: 'note', colorClass: 'bg-gray-100'
            };
            addActivity(act);
        }
    };

    const fetchPetAIInsights = async (petId: string, type: string = 'ai_insight') => {
        return await fetchAIInsightsDB(petId, type);
    };

    // Standard CRUD Wrappers
    const updateUser = async (u: User) => {
        if (!u.id) return;
        const dbUser = mapAppUserToDbUser(u);
        await updateUserProfileDB(u.id, dbUser);
        setUser(u);
    };

    const addAppointment = async (a: Appointment) => {
        await addAppointmentDB({ ...a, ownerId: user.id });
        // Auto-generate appointment reminder notifications
        checkAppointmentNotifications([a], user.id).catch(console.error);
    };
    const updateAppointment = async (a: Appointment) => {
        await updateAppointmentDB(a);
        // Re-check appointment notifications
        checkAppointmentNotifications([a], user.id).catch(console.error);
    };
    const updateAppointmentStatus = async (id: string, status: 'Scheduled' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed') => {
        // We need to fetch the appointment first or just update the field. 
        // For now, simpler to assume we can partial update if our db function supported it, 
        // but our updateAppointmentDB takes full object. 
        // Let's modify updateAppointmentDB to take Partial or handle this.
        // Actually for now let's just use the updateAppointmentDB but we need the object.
        // Wait, standard Supabase update only needs ID and the changed field.
        // My updateAppointmentDB takes full 'Appointment'.
        // I will temporarily fetch from 'appointments' state to update.
        const appt = appointments.find(a => a.id === id);
        if (appt) {
            await updateAppointmentDB({ ...appt, status });
        }
    };
    const deleteAppointment = async (id: string) => {
        await deleteAppointmentDB(id);
    };

    const addVaccine = async (v: VaccineRecord) => {
        await addVaccineDB({ ...v, ownerId: user.id });
        // Auto-generate vaccine reminder notifications
        checkVaccineDueNotifications([v], user.id).catch(console.error);
    };
    const updateVaccine = async (v: VaccineRecord) => {
        await updateVaccineDB(v);
        // Re-check vaccine notifications
        checkVaccineDueNotifications([v], user.id).catch(console.error);
    };

    const addMedication = async (m: Medication) => {
        await addMedicationDB({ ...m, ownerId: user.id });
        // Auto-generate medication refill notifications
        checkMedicationRefillNotifications([m], user.id).catch(console.error);
    };
    const updateMedication = async (m: Medication) => {
        await updateMedicationDB(m);
        // Re-check medication notifications
        checkMedicationRefillNotifications([m], user.id).catch(console.error);
    };

    const addActivity = async (a: Activity) => {
        await addActivityDB({ ...a, ownerId: user.id } as any);
    };

    const addMedicalVisit = async (visit: MedicalVisit) => {
        await addMedicalVisitDB(visit);
        // Optimistic update or refetch logic here
    };

    const addReminder = async (r: Reminder) => {
        await addReminderDB({ ...r, ownerId: user.id });
    };
    const updateReminder = async (r: Reminder) => {
        await updateReminderDB(r);
    };
    const deleteReminder = async (id: string) => {
        await deleteReminderDB(id);
    };

    const toggleAdminMode = () => setIsAdminMode(!isAdminMode);

    const markNotificationRead = async (id: string) => {
        try {
            await markNotificationReadDB(id);
            // Subscription will update state automatically
        } catch (e) {
            console.error('Failed to mark notification as read:', e);
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            await markAllNotificationsReadDB(user.id);
            // Subscription will update state automatically
        } catch (e) {
            console.error('Failed to mark all notifications as read:', e);
        }
    };

    const toggleServiceFavorite = (id: string) => setFavoriteServiceIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    const searchServices = async (category: string, location: string, lat: number, lng: number) => {
        try {
            const { data, error } = await supabase.functions.invoke('google-places-search', {
                body: { category, lat, lng }
            });

            if (error) throw error;

            if (data?.results) {
                const mapped: ServiceProvider[] = data.results.map((r: any) => ({
                    id: 'google-' + r.place_id,
                    name: r.name,
                    category: category as any,
                    address: r.address,
                    phone: r.formatted_phone,
                    website: r.website,
                    rating: r.rating,
                    reviews: r.review_count,
                    latitude: r.lat,
                    longitude: r.lng,
                    image: r.photos?.length > 0 && typeof r.photos[0] === 'string'
                        ? r.photos[0]
                        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300&auto=format&fit=crop',
                    isOpen: r.opening_hours?.open_now || false,
                    source: 'google' as const,
                    isVerified: false,
                    joinedDate: new Date().toISOString(),
                    type: 'Business' as const,
                    tags: ['Google']
                }));

                setServices(prev => {
                    const ids = new Set(prev.map(s => s.id));
                    const newOnes = mapped.filter(m => !ids.has(m.id));
                    return [...prev, ...newOnes];
                });
            }
        } catch (e) {
            console.error("Search failed:", e);
        }
    };

    return (
        <AppContext.Provider value={{
            isAuthenticated, user, pets, staticData,
            appointments, providerAppointments, documents, vaccines, medications, medicalVisits, activities, healthStats, reminders, notifications, services, favoriteServiceIds,
            providerProfile, isAdminMode,
            login, register, completeOnboarding, logout,
            addPet, updatePet, deletePet,
            toggleAdminMode, providerLogin, registerAsProvider, updateProviderProfile, updateUser,
            addAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment,
            addDocument, deleteDocument, addVaccine, updateVaccine, addMedication, updateMedication,
            addActivity, addMedicalVisit, saveHealthRecord, fetchPetAIInsights,
            addReminder, updateReminder, deleteReminder,
            markNotificationRead, markAllNotificationsRead, toggleServiceFavorite, searchServices
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
};
