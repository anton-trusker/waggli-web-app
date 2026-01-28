
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Need to generate this

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if already subscribed in this browser
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, []);

    const subscribeToPush = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Request Permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                throw new Error('Notification permission denied');
            }

            if (!VAPID_PUBLIC_KEY) {
                console.warn("VAPID Key missing, skipping real push subscription");
                // Mock success for demo if no key
                setIsSubscribed(true);
                return;
            }

            // 2. Register SW & Subscribe
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // 3. Save to Supabase
            const { error: dbError } = await supabase.from('push_subscriptions').upsert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                endpoint: subscription.endpoint,
                p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') as ArrayBuffer)))),
                auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') as ArrayBuffer)))),
                user_agent: navigator.userAgent
            }, { onConflict: 'user_id, endpoint' });

            if (dbError) throw dbError;

            setIsSubscribed(true);

        } catch (err: any) {
            console.error('Push Subscription Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                // Optionally remove from DB...
                // await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
            }
            setIsSubscribed(false);
        } catch (err) {
            console.error("Unsubscribe error", err);
        }
    };

    return { permission, isSubscribed, loading, error, subscribeToPush, unsubscribeFromPush };
};
