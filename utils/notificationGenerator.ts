import { VaccineRecord, Medication, Appointment } from '../types';
import { createNotification } from '../services/db';

/**
 * Notification Generation Utilities
 * Auto-generates smart notifications based on pet health data
 */

// Generate vaccine due reminders (7 days before)
export const checkVaccineDueNotifications = async (
    vaccines: VaccineRecord[],
    ownerId: string
): Promise<void> => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    for (const vaccine of vaccines) {
        if (!vaccine.nextDueDate) continue;

        const dueDate = new Date(vaccine.nextDueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Notify 7 days before, 1 day before, and on due date
        if (diffDays === 7 || diffDays === 1 || diffDays === 0) {
            await createNotification({
                ownerId,
                title: `${vaccine.name} Vaccine ${diffDays === 0 ? 'Due Today' : `Due in ${diffDays} Day${diffDays > 1 ? 's' : ''}`}`,
                message: `${vaccine.petId ? 'Your pet' : ''} needs the ${vaccine.name} vaccine${diffDays === 0 ? ' today' : ` on ${dueDate.toLocaleDateString()}`}. Don't forget to schedule!`,
                type: 'reminder'
            });
        }
    }
};

// Generate medication refill alerts
export const checkMedicationRefillNotifications = async (
    medications: Medication[],
    ownerId: string
): Promise<void> => {
    for (const med of medications) {
        if (!med.refillDate) continue;

        const today = new Date();
        const refillDate = new Date(med.refillDate);
        const diffTime = refillDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Notify 3 days before refill date
        if (diffDays === 3) {
            await createNotification({
                ownerId,
                title: '💊 Medication Refill Reminder',
                message: `Time to refill ${med.name}. Refill date: ${refillDate.toLocaleDateString()}`,
                type: 'reminder'
            });
        }
    }
};

// Generate appointment reminders (24 hours before)
export const checkAppointmentNotifications = async (
    appointments: Appointment[],
    ownerId: string
): Promise<void> => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    for (const appt of appointments) {
        if (appt.status === 'Cancelled' || appt.status === 'Completed') continue;

        const apptDate = new Date(appt.date);
        const diffTime = apptDate.getTime() - today.getTime();
        const diffHours = diffTime / (1000 * 60 * 60);

        // Notify 24 hours before
        if (diffHours > 23 && diffHours <= 24) {
            await createNotification({
                ownerId,
                title: '📅 Appointment Tomorrow',
                message: `Reminder: ${appt.title} appointment at ${appt.time || 'scheduled time'} with ${appt.location || 'your vet'}`,
                type: 'reminder'
            });
        }
    }
};

// Generate health score drop alerts
export const checkHealthScoreNotification = async (
    currentScore: number,
    previousScore: number,
    ownerId: string
): Promise<void> => {
    const scoreDrop = previousScore - currentScore;

    // Alert if score drops by 10 or more points
    if (scoreDrop >= 10) {
        await createNotification({
            ownerId,
            title: '⚠️ Health Score Alert',
            message: `Your pet's health score has dropped by ${scoreDrop} points. Review recent activities and schedule a checkup if needed.`,
            type: 'alert'
        });
    }
};

// Generate weight tracking nudges (if no logs for 30 days)
export const checkWeightTrackingNudge = async (
    lastWeightLogDate: string | null,
    ownerId: string
): Promise<void> => {
    if (!lastWeightLogDate) return;

    const today = new Date();
    const lastLog = new Date(lastWeightLogDate);
    const daysSinceLog = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLog >= 30) {
        await createNotification({
            ownerId,
            title: '⚖️ Weight Tracking Reminder',
            message: `It's been ${daysSinceLog} days since your last weight log. Regular weight tracking helps monitor your pet's health!`,
            type: 'info'
        });
    }
};

// Generate gap analysis alerts (Missing Info)
export const checkPetHealthGaps = async (
    pet: any, // Typed as any to avoid import cycles, but relies on Pet structure
    vaccines: VaccineRecord[],
    ownerId: string
): Promise<void> => {
    // 1. Missing Weight
    if (!pet.weight) {
        await createNotification({
            ownerId,
            title: '⚠️ Missing Growth Data',
            message: `We don't have a recent weight for ${pet.name}. Log it to track growth!`,
            type: 'gap',
            actionPath: `/pet/${pet.id}/add-record?type=vitals`,
            actionLabel: 'Add Weight',
            priority: 'high'
        });
    }

    // 2. Missing Core Identity
    if (!pet.microchipId) {
        await createNotification({
            ownerId,
            title: '🆔 Microchip Missing',
            message: `Protect ${pet.name} by adding a microchip ID. It's crucial for recovery if lost.`,
            type: 'gap',
            actionPath: `/pet/${pet.id}/passport`, // Direct to passport tab
            actionLabel: 'Update Passport',
            priority: 'medium'
        });
    }

    // 3. Missing Core Vaccinations (Simple heuristic: look for "Rabies")
    const hasRabies = vaccines.some(v => v.type.toLowerCase().includes('rabies') || v.name?.toLowerCase().includes('rabies'));
    if (!hasRabies && parseInt(pet.age || '0') > 0) { // Only checking if age > 0 (roughly) to avoid newborns
        await createNotification({
            ownerId,
            title: '💉 Missing Rabies Vaccine',
            message: `Rabies vaccination is required by law in most regions. Please log it or schedule a visit.`,
            type: 'gap',
            actionPath: `/pet/${pet.id}/add-record?type=vaccination`,
            actionLabel: 'Add Vaccine',
            priority: 'high'
        });
    }
};

// Master function to run all notification checks
export const generateAllNotifications = async (
    data: {
        pet?: any;
        vaccines: VaccineRecord[];
        medications: Medication[];
        appointments: Appointment[];
        currentHealthScore?: number;
        previousHealthScore?: number;
        lastWeightLogDate?: string | null;
    },
    ownerId: string
): Promise<void> => {
    try {
        await Promise.all([
            checkVaccineDueNotifications(data.vaccines, ownerId),
            checkMedicationRefillNotifications(data.medications, ownerId),
            checkAppointmentNotifications(data.appointments, ownerId),
            data.currentHealthScore !== undefined && data.previousHealthScore !== undefined
                ? checkHealthScoreNotification(data.currentHealthScore, data.previousHealthScore, ownerId)
                : Promise.resolve(),
            data.lastWeightLogDate
                ? checkWeightTrackingNudge(data.lastWeightLogDate, ownerId)
                : Promise.resolve(),
            data.pet
                ? checkPetHealthGaps(data.pet, data.vaccines, ownerId)
                : Promise.resolve()
        ]);
    } catch (error) {
        console.error('Error generating notifications:', error);
    }
};
