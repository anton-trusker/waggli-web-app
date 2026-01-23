import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =====================================================
// Authentication Helpers
// =====================================================

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name, // Store name in user metadata
            },
        },
    })

    return { data, error }
}

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    return { data, error }
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    return { data, error }
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

/**
 * Get the current user session
 */
export const getCurrentUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
}

/**
 * Get the current user profile from public.users table
 */
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    return { data, error }
}

/**
 * Update user profile in public.users table
 */
export const updateUserProfile = async (userId: string, updates: any) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    return { data, error }
}

/**
 * Reset password - send reset email
 */
export const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    })

    return { data, error }
}

/**
 * Update password for authenticated user
 */
export const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    return { data, error }
}

// =====================================================
// Data Helper Functions (for breeds, vaccines, etc.)
// =====================================================

/**
 * Get dog breeds for autocomplete/dropdown
 */
export const getDogBreeds = async (searchTerm?: string) => {
    let query = supabase
        .from('dog_breeds')
        .select('id, breed_name, size_category, temperament, health_concerns')
        .order('breed_name')

    if (searchTerm) {
        query = query.ilike('breed_name', `%${searchTerm}%`)
    }

    const { data, error } = await query

    return { data, error }
}

/**
 * Get cat breeds for autocomplete/dropdown
 */
export const getCatBreeds = async (searchTerm?: string) => {
    let query = supabase
        .from('cat_breeds')
        .select('id, breed_name, size_category, temperament, health_concerns')
        .order('breed_name')

    if (searchTerm) {
        query = query.ilike('breed_name', `%${searchTerm}%`)
    }

    const { data, error } = await query

    return { data, error }
}

/**
 * Get breed details by ID
 */
export const getDogBreedDetails = async (breedId: string) => {
    const { data, error } = await supabase
        .from('dog_breeds')
        .select('*')
        .eq('id', breedId)
        .single()

    return { data, error }
}

export const getCatBreedDetails = async (breedId: string) => {
    const { data, error } = await supabase
        .from('cat_breeds')
        .select('*')
        .eq('id', breedId)
        .single()

    return { data, error }
}

/**
 * Get vaccines for a specific pet type
 */
export const getVaccinesByPetType = async (petType: 'Dog' | 'Cat' | 'Both') => {
    const { data, error } = await supabase
        .from('pet_vaccines')
        .select('*')
        .or(`pet_type.eq.${petType},pet_type.eq.Both`)
        .order('brand_name')

    return { data, error }
}

/**
 * Get medications for a specific pet type
 */
export const getMedicationsByPetType = async (petType: string) => {
    const { data, error } = await supabase
        .from('pet_medications')
        .select('*')
        .or(`pet_type.ilike.%${petType}%,pet_type.eq.Dogs and Cats`)
        .order('brand_name')

    return { data, error }
}

/**
 * Get mandatory requirements for a pet type
 */
export const getRequirementsByPetType = async (petType: 'Dog' | 'Cat') => {
    const { data, error } = await supabase
        .from('pet_requirements')
        .select('*')
        .eq('pet_type', petType)
        .order('category, item_name')

    return { data, error }
}

// Export the supabase client as default for direct usage
export default supabase
