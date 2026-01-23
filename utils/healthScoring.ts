
import { Pet, VaccineRecord, Medication, Activity } from '../types';
import { differenceInMonths, differenceInDays } from 'date-fns';

/**
 * Calculates the Pet Health Score (0-100) based on the PRD specification.
 * 
 * Component Weightings:
 * - Vaccination Status: 30%
 * - Body Condition (Weight check frequency): 20%
 * - Recent Vet Visits: 15%
 * - Medication Adherence: 15%
 * - Age Factor: 10%
 * - Breed/Profile Completeness (Proxy for Risk Management): 10%
 */
export const calculateHealthScore = (
    pet: Pet,
    vaccines: VaccineRecord[],
    medications: Medication[],
    activities: Activity[] // Used for weight checks/vet visits logs
): number => {

    // 1. Vaccination Score (30 pts)
    const activeVaccines = vaccines.filter(v => v.status === 'Valid');
    // Basic logic: If at least 1 core vaccine (Rabies/DHPP) is valid -> High score
    // In reality, we'd check against specific core list. 
    // Here: 1 valid vax = 15pts, 2+ = 30pts.
    let vaccinationScore = 0;
    if (activeVaccines.length >= 2) vaccinationScore = 100;
    else if (activeVaccines.length === 1) vaccinationScore = 50;
    else vaccinationScore = 0;

    // 2. Body Condition / Weight Monitoring (20 pts)
    // Check if weight logged in last 3 months
    const latestWeight = activities.find(a => a.type === 'vitals' && a.description.toLowerCase().includes('weight'));
    let bodyScore = 0;
    if (latestWeight) {
        const monthsSinceWeight = differenceInMonths(new Date(), new Date(latestWeight.date));
        if (monthsSinceWeight <= 1) bodyScore = 100;
        else if (monthsSinceWeight <= 3) bodyScore = 70;
        else if (monthsSinceWeight <= 6) bodyScore = 40;
    } else if (pet.weight) {
        // Fallback to profile weight
        bodyScore = 50;
    }

    // 3. Recent Vet Visits (15 pts)
    // Looking for 'checkup' or 'medical' records in last 12 months
    const lastVisit = activities.find(a => a.type === 'checkup' || a.title.toLowerCase().includes('visit'));
    let visitScore = 0;
    if (lastVisit) {
        const monthsSinceVisit = differenceInMonths(new Date(), new Date(lastVisit.date));
        if (monthsSinceVisit <= 6) visitScore = 100;
        else if (monthsSinceVisit <= 12) visitScore = 80;
        else visitScore = 40;
    } else {
        // If profile allows manual 'last visit' field? Not currently.
        visitScore = 0;
    }

    // 4. Medication Adherence (15 pts)
    // If has active meds, assume adhering unless flagged otherwise?
    // PRD says "Active treatments followed". 
    // Proxy: If pet has meds, and we are tracking them, give points. 
    // If no meds needed, full score (healthy).
    const activeMeds = medications.filter(m => m.active);
    let medScore = 100; // Default to perfect if no meds needed
    if (activeMeds.length > 0) {
        // If we have active meds, check if we have recent logs? 
        // For mvp, just assign 100 for "Managing".
        medScore = 100;
    }

    // 5. Age Factor (10 pts)
    // Seniors need more care. If senior and no recent visit -> lower score.
    // Young need vaccines. 
    // Implementation: Just give 100 for now as 'Biological Factor'
    let ageScore = 100;

    // 6. Profile Completeness / Risk (10 pts)
    const requiredFields = ['name', 'breed', 'weight', 'age', 'chipId'];
    let filled = 0;
    if (pet.name) filled++;
    if (pet.breed) filled++;
    if (pet.weight) filled++;
    if (pet.age) filled++;
    if (pet.microchipId) filled++;
    const profileScore = (filled / 5) * 100;

    // Calculate Total Weighted Score
    const total = (
        (vaccinationScore * 0.30) +
        (bodyScore * 0.20) +
        (visitScore * 0.15) +
        (medScore * 0.15) +
        (ageScore * 0.10) +
        (profileScore * 0.10)
    );

    return Math.round(total);
};

export const getHealthlabel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100' };
};
