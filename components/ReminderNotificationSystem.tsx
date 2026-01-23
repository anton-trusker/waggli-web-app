
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const ReminderNotificationSystem: React.FC = () => {
    const { reminders, updateReminder, pets } = useApp();
    const [lastChecked, setLastChecked] = useState<number>(Date.now());

    useEffect(() => {
        // Request notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkReminders = () => {
            const now = new Date();
            const currentString = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM

            reminders.forEach(reminder => {
                if (reminder.completed) return;

                // Simple check: strict equality on date and time
                // In production, you'd want a "leeway" or check if within last minute
                const isDue = reminder.date === currentString && reminder.time === currentTime;

                // To prevent double-firing in the same minute, we could store "fired" state or just rely on 'completed' if it's a one-off.
                // For repeating reminders, logic is more complex.

                // Let's use a session-storage approach to avoid duplicate alerts in the same minute if re-rendered
                const alertKey = `reminder-${reminder.id}-${currentString}-${currentTime}`;
                const alreadyFired = sessionStorage.getItem(alertKey);

                if (isDue && !alreadyFired) {
                    sessionStorage.setItem(alertKey, 'true');

                    const pet = pets.find(p => p.id === reminder.petId);
                    const petName = pet ? pet.name : 'General Task';

                    // Browser Notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(`Reminder: ${reminder.title}`, {
                            body: `${petName} - ${reminder.time}`,
                            icon: '/icons/icon-192x192.png' // Ensure this exists or use logo
                        });
                    }

                    // In-App Toast
                    toast((t) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <span className="material-icons-round">alarm</span>
                            </div>
                            <div>
                                <p className="font-bold">{reminder.title}</p>
                                <p className="text-xs text-gray-500">{petName} is due now!</p>
                            </div>
                            <button
                                onClick={() => {
                                    updateReminder({ ...reminder, completed: true });
                                    toast.dismiss(t.id);
                                }}
                                className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg ml-2"
                            >
                                Done
                            </button>
                        </div>
                    ), { duration: 10000, position: 'top-right' });
                }
            });
            setLastChecked(Date.now());
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [reminders, pets, updateReminder]);

    return null; // Logic only component
};

export default ReminderNotificationSystem;
