
import { User } from '../types';

export const mapDbUserToAppUser = (dbUser: any): User => {
    return {
        id: dbUser.id,
        name: dbUser.name || dbUser.full_name || '',
        email: dbUser.email || '',
        phone: dbUser.phone || '',
        address: dbUser.address || '',
        city: dbUser.city || '',
        country: dbUser.country || '',
        bio: dbUser.bio || '',
        image: dbUser.image || dbUser.avatar_url || '',
        roles: dbUser.roles || ['pet_owner'],
        providerProfileId: dbUser.provider_profile_id,
        onboardingCompleted: dbUser.onboarding_completed,
        plan: dbUser.plan,
        latitude: dbUser.latitude,
        longitude: dbUser.longitude,
        preferences: dbUser.preferences,
        createdAt: dbUser.created_at,
        lastLogin: dbUser.last_login,
        status: dbUser.status
    };
};
