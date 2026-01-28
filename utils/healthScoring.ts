
import { Pet, VaccineRecord, Medication, Activity } from '../types';
import { differenceInDays } from 'date-fns';

/**
 * Waggli Health Score Algorithm v1.0
 * Based on: spec/05-pet-passport/health-score-algorithm-spec.md
 * 
 * Weighted Components:
 * - Preventive Care: 30% (Annual checkup)
 * - Vaccination: 25% (Core vaccines valid)
 * - Weight: 20% (Within ideal range)
 * - Data Completeness: 15% (Microchip, DOB, Photo)
 * - Recent Wellness: 10% (Activity logs in last 14 days)
 */

// Core vaccines by species (simplified set)
const CORE_VACCINES = {
    Dog: ['Rabies', 'DHPP', 'Distemper', 'Parvo'],
    Cat: ['Rabies', 'FVRCP', 'Feline Distemper']
};

/**
 * 1. PREVENTIVE CARE SCORE (30%)
 * Logic: 100 points if annual checkup exists within last 365 days
 */
const calculatePreventiveCareScore = (activities: Activity[]): number => {
    const now = new Date();
    const checkups = activities.filter(a =>
        a.type === 'checkup' ||
        a.type === 'checkup-visit' ||
        a.title?.toLowerCase().includes('checkup') ||
        a.title?.toLowerCase().includes('visit') ||
        a.title?.toLowerCase().includes('exam')
    );

    if (checkups.length === 0) return 0;

    // Find most recent checkup
    const latestCheckup = checkups.reduce((latest, current) => {
        const currentDate = new Date(current.date);
        const latestDate = new Date(latest.date);
        return currentDate > latestDate ? current : latest;
    });

    const daysSinceCheckup = differenceInDays(now, new Date(latestCheckup.date));

    // Annual checkup logic
    if (daysSinceCheckup <= 365) return 100;
    if (daysSinceCheckup <= 400) return 80; // Slight grace
    if (daysSinceCheckup <= 550) return 50; // Late
    return 0;
};

/**
 * 2. VACCINATION SCORE (25%)
 * Logic: Percentage of core vaccines currently valid (not overdue)
 */
const calculateVaccinationScore = (pet: Pet, vaccines: VaccineRecord[]): number => {
    const petType = pet.type || 'Dog';
    const coreVaccineNames = CORE_VACCINES[petType as keyof typeof CORE_VACCINES] || CORE_VACCINES.Dog;

    // Find valid core vaccines
    const validCoreVaccines = vaccines.filter(v => {
        const isCore = coreVaccineNames.some(coreName =>
            v.name?.toLowerCase().includes(coreName.toLowerCase()) ||
            v.type?.toLowerCase().includes(coreName.toLowerCase())
        );
        // Valid status or recent date if status missing
        const isValid = v.status === 'Valid' || (v.nextDueDate && new Date(v.nextDueDate) > new Date());
        return isCore && isValid;
    });

    const coreCount = coreVaccineNames.length;
    if (coreCount === 0) return 100;

    // Cap at 100 if more vaccines found
    const validCount = Math.min(validCoreVaccines.length, coreCount);
    return Math.round((validCount / coreCount) * 100);
};

/**
 * 3. WEIGHT SCORE (20%)
 * Logic: Is latest weight within breed/age ideal range?
 * Simplified: Check if weight exists and has been updated recently
 */
const calculateWeightScore = (pet: Pet, activities: Activity[]): number => {
    // Check if weight exists in profile
    if (!pet.weight) return 0;

    // Look for recent weight logs in activities
    const weightLogs = activities.filter(a =>
        a.type === 'vitals' ||
        a.title?.toLowerCase().includes('weight') ||
        a.description?.toLowerCase().includes('weight')
    );

    if (weightLogs.length === 0) {
        // Has weight in profile but no recent logs
        return 50; // Baseline points for having data
    }

    const latestLog = weightLogs.reduce((latest, current) => {
        const currentDate = new Date(current.date);
        const latestDate = new Date(latest.date);
        return currentDate > latestDate ? current : latest;
    });

    const daysSinceWeightCheck = differenceInDays(new Date(), new Date(latestLog.date));

    // Score based on recency
    if (daysSinceWeightCheck <= 30) return 100; // Monthly checks ideal for puppies/monitoring
    if (daysSinceWeightCheck <= 90) return 90;
    if (daysSinceWeightCheck <= 180) return 70;
    if (daysSinceWeightCheck <= 365) return 50;
    return 30; // Old data
};

/**
 * 4. DATA COMPLETENESS SCORE (15%)
 * Logic: Microchip, DOB, Photo present?
 */
const calculateDataCompletenessScore = (pet: Pet): number => {
    let points = 0;
    const maxPoints = 3;

    // Check microchip (most important for identification)
    if (pet.microchipId && pet.microchipId.length > 0) points++;

    // Check DOB/Birthday
    if (pet.birthday || pet.age) points++;

    // Check Photo
    if (pet.image && !pet.image.includes('placeholder')) points++;

    return (points / maxPoints) * 100;
};

/**
 * 5. RECENT WELLNESS SCORE (10%)
 * Logic: Subjective logs (Activity, Notes) in last 14 days
 */
const calculateRecentWellnessScore = (activities: Activity[]): number => {
    const now = new Date();
    const recentActivities = activities.filter(a => {
        const daysSince = differenceInDays(now, new Date(a.date));
        return daysSince <= 14;
    });

    if (recentActivities.length === 0) return 0;
    if (recentActivities.length >= 3) return 100;
    if (recentActivities.length === 2) return 70;
    return 40;
};

/**
 * 6. DECAY FACTOR
 * Healthcare Participation decays if no activity
 */
const calculateDecayFactor = (activities: Activity[]): number => {
    if (activities.length === 0) return 0;

    const now = new Date();
    const latestActivity = activities.reduce((latest, current) => {
        const currentDate = new Date(current.date);
        const latestDate = new Date(latest.date);
        return currentDate > latestDate ? current : latest;
    });

    const daysSinceActivity = differenceInDays(now, new Date(latestActivity.date));

    // 100% value for 30 days
    if (daysSinceActivity <= 30) return 1.0;

    // 80% value for 30-90 days
    if (daysSinceActivity <= 90) return 0.8;

    // 60% value for 90-180 days
    if (daysSinceActivity <= 180) return 0.6;

    // 0% value for >180 days (triggers warning)
    return 0.1;
};

/**
 * MAIN CALCULATION
 */
export const calculateHealthScore = (
    pet: Pet,
    vaccines: VaccineRecord[],
    medications: Medication[],
    activities: Activity[]
): number => {

    // Calculate individual component scores
    const preventiveCare = calculatePreventiveCareScore(activities);
    const vaccination = calculateVaccinationScore(pet, vaccines);
    const weight = calculateWeightScore(pet, activities);
    const dataCompleteness = calculateDataCompletenessScore(pet);
    const recentWellness = calculateRecentWellnessScore(activities);

    // Apply weights (total = 100%)
    const rawScore = (
        (preventiveCare * 0.30) +
        (vaccination * 0.25) +
        (weight * 0.20) +
        (dataCompleteness * 0.15) +
        (recentWellness * 0.10)
    );

    // Apply decay factor for inactive accounts
    const decayFactor = calculateDecayFactor(activities);
    const finalScore = Math.round(rawScore * decayFactor);

    return Math.max(0, Math.min(100, finalScore));
};

/**
 * HEALTH LABEL & BADGE
 */
export const getHealthLabel = (score: number) => {
    if (score >= 90) return {
        label: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/30',
        badge: '🏆 Elite Caregiver'
    };
    if (score >= 75) return {
        label: 'Good',
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/30'
    };
    if (score >= 60) return {
        label: 'Fair',
        color: 'text-yellow-600',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30'
    };
    return {
        label: 'Needs Attention',
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/30',
        warning: '⚠️ Records Outdated or Missing',
        status: 'Check-up'
    };
};

/**
 * SUGGESTED STATUS (For automated updates)
 */
export const getSuggestedStatus = (score: number, vaccines: VaccineRecord[]): 'Healthy' | 'Check-up' | 'Sick' => {
    // Critical overrides
    const hasExpiredVaccines = vaccines.some(v => v.status === 'Overdue' || (v.nextDueDate && new Date(v.nextDueDate) < new Date()));

    if (hasExpiredVaccines) return 'Check-up';
    if (score < 50) return 'Check-up'; // Low health score calls for a vet visit
    // Note: 'Sick' should generally be manually set by user, AI shouldn't assume 'Sick' based on missing data.

    return 'Healthy';
};

/**
 * BREAKDOWN FOR UI
 */
export const getScoreBreakdown = (
    pet: Pet,
    vaccines: VaccineRecord[],
    medications: Medication[],
    activities: Activity[]
) => {
    return {
        preventiveCare: calculatePreventiveCareScore(activities),
        vaccination: calculateVaccinationScore(pet, vaccines),
        weight: calculateWeightScore(pet, activities),
        dataCompleteness: calculateDataCompletenessScore(pet),
        recentWellness: calculateRecentWellnessScore(activities),
        decayFactor: calculateDecayFactor(activities)
    };
};
