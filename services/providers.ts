import { supabase } from './supabase';
import { ServiceProvider } from '../types';

export const getServiceProviders = async (category?: string): Promise<ServiceProvider[]> => {
    let query = supabase.from('service_providers').select(`
        *,
        services (*)
    `);

    if (category && category !== 'All') {
        // This is a simplified filter. In valid generic schema we might filter by services.
        // Or if provider has a 'type' column.
        query = query.contains('services', JSON.stringify([{ category }])); // Depending on schema
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching providers:', error);
        return [];
    }

    // Map DB to Type
    return (data || []).map((p: any): ServiceProvider => ({
        id: p.id,
        ownerId: p.owner_id,
        name: p.name,
        type: p.type,
        category: p.category,
        rating: p.rating,
        reviews: p.reviews,
        distance: p.distance,
        address: p.address,
        phone: p.phone,
        email: p.email,
        description: p.description,
        image: p.image_url || 'https://via.placeholder.com/150',
        website: p.website,
        googlePlaceId: p.google_place_id,
        isVerified: p.is_verified,
        servicesList: p.services?.map((s: any) => ({
            id: s.id,
            name: s.name,
            providerId: p.id,
            price: s.price,
            duration: s.duration,
            description: s.description,
            category: s.category
        })) || [],
        latitude: p.latitude,
        longitude: p.longitude,
        isOpen: p.is_open,
        tags: p.tags,
        source: p.source,
        joinedDate: p.joined_date
    }));
};

export const getProviderById = async (id: string): Promise<ServiceProvider | null> => {
    const { data, error } = await supabase
        .from('service_providers')
        .select(`*, services (*)`)
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        id: data.id,
        ownerId: data.owner_id,
        name: data.name,
        type: data.type,
        category: data.category,
        rating: data.rating,
        reviews: data.reviews,
        distance: data.distance,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description,
        image: data.image_url || 'https://via.placeholder.com/150',
        website: data.website,
        googlePlaceId: data.google_place_id,
        isVerified: data.is_verified,
        servicesList: data.services?.map((s: any) => ({
            id: s.id,
            name: s.name,
            providerId: data.id,
            price: s.price,
            duration: s.duration,
            description: s.description,
            category: s.category
        })) || [],
        latitude: data.latitude,
        longitude: data.longitude,
        isOpen: data.is_open,
        tags: data.tags,
        source: data.source,
        joinedDate: data.joined_date
    } as ServiceProvider;
};

export const registerProvider = async (providerData: Partial<ServiceProvider>, userId: string) => {
    const { data, error } = await supabase
        .from('service_providers')
        .insert({
            owner_id: userId,
            name: providerData.name,
            type: providerData.type,
            address: providerData.address,
            phone: providerData.phone,
            email: providerData.email,
            description: providerData.description,
            website: providerData.website,
            google_place_id: providerData.googlePlaceId,
            image_url: providerData.image
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
