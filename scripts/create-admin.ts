import { supabase } from '../services/supabase';
import { updateUserProfileDB } from '../services/db';

async function createAdminUser() {
    const adminEmail = 'admin@pawzly.eu';
    const adminPass = 'Paw@2026';
    const adminName = 'Admin Paw';

    try {
        console.log('Creating admin user...');

        // Try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPass,
            options: {
                data: { name: adminName },
                emailRedirectTo: undefined // Skip email confirmation
            }
        });

        if (signUpError) {
            console.error('Signup error:', signUpError);

            // If user exists, just update the profile
            if (signUpError.message.includes('already registered')) {
                console.log('User exists, trying to sign in and update profile...');

                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: adminEmail,
                    password: adminPass
                });

                if (signInError) {
                    console.error('Sign in error:', signInError);
                    return;
                }

                if (signInData.user) {
                    await updateUserProfileDB({
                        id: signInData.user.id,
                        name: adminName,
                        email: adminEmail,
                        roles: ['admin'],
                        onboardingCompleted: true,
                        onboarding_completed: true,
                        plan: 'Premium'
                    } as any);

                    console.log(' Admin user updated successfully!');
                }
            }
        } else if (signUpData.user) {
            console.log('User created, updating profile...');

            // Update user profile to set admin role
            await updateUserProfileDB({
                id: signUpData.user.id,
                name: adminName,
                email: adminEmail,
                roles: ['admin'],
                onboardingCompleted: true,
                onboarding_completed: true,
                plan: 'Premium'
            } as any);

            console.log('✅ Admin user created successfully!');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPass);
        }
    } catch (e: any) {
        console.error('Error creating admin:', e);
    }
}

createAdminUser();
