import { User, Pet, VaccineRecord, Medication, Appointment, Reminder, MedicalVisit, Notification } from '../types';

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

export const mapAppUserToDbUser = (user: User): any => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        bio: user.bio,
        avatar_url: user.image, // DB uses avatar_url, app uses image
        roles: user.roles,
        onboarding_completed: user.onboardingCompleted,
        plan: user.plan,
        latitude: user.latitude,
        longitude: user.longitude,
        preferences: user.preferences
    };
};


export const mapDbPetToAppPet = (dbPet: any): Pet => {
    return {
        id: dbPet.id,
        ownerId: dbPet.owner_id,
        name: dbPet.name,
        breed: dbPet.breed,
        type: dbPet.type || dbPet.species, // Support both type and species columns
        weight: dbPet.weight,
        age: dbPet.age,
        image: dbPet.image_url || dbPet.image,
        status: dbPet.status,
        color: dbPet.color,
        gender: dbPet.gender,
        birthday: dbPet.birth_date || dbPet.birthday,
        microchipId: dbPet.microchip_id,
        microchipType: dbPet.microchip_type,
        bloodType: dbPet.blood_type,
        allergies: dbPet.allergies,
        personality: dbPet.personality,
        height: dbPet.height,
        passportNumber: dbPet.passport_number,
        passportIssuer: dbPet.passport_issuer,
        passportDate: dbPet.passport_date,
        registrationNumber: dbPet.registration_number,
        veterinarian: dbPet.veterinarian,
        veterinarianContact: dbPet.veterinarian_contact,
        distinguishingMarks: dbPet.distinguishing_marks,
        coatType: dbPet.coat_type,
        tailType: dbPet.tail_type,
        eyeColor: dbPet.eye_color,
        earType: dbPet.ear_type,
        neutered: dbPet.neutered
    };
};

export const mapAppPetToDbPet = (pet: Pet): any => {
    return {
        id: pet.id,
        owner_id: pet.ownerId,
        name: pet.name,
        breed: pet.breed,
        type: pet.type,

        species: pet.type, // Map type to species for database NOT NULL constraint
        species_id: pet.species_id,
        weight: pet.weight,
        age: pet.age,
        image_url: pet.image,
        status: pet.status,
        color: pet.color,
        gender: pet.gender,
        birth_date: pet.birthday,
        microchip_id: pet.microchipId,
        microchip_type: pet.microchipType,
        blood_type: pet.bloodType,
        allergies: pet.allergies,
        personality: pet.personality,
        height: pet.height,
        passport_number: pet.passportNumber,
        passport_issuer: pet.passportIssuer,
        passport_date: pet.passportDate,
        registration_number: pet.registrationNumber,
        veterinarian: pet.veterinarian,
        veterinarian_contact: pet.veterinarianContact,
        distinguishing_marks: pet.distinguishingMarks,
        coat_type: pet.coatType,
        tail_type: pet.tailType,
        eye_color: pet.eyeColor,
        ear_type: pet.earType,
        neutered: pet.neutered
    };
};

export const mapDbVaccineToAppVaccine = (dbVax: any): VaccineRecord => {
    return {
        id: dbVax.id,
        petId: dbVax.pet_id,
        ownerId: dbVax.owner_id,
        name: dbVax.name,
        type: dbVax.type || dbVax.name,
        date: dbVax.date,
        expiryDate: dbVax.expiry_date,
        nextDueDate: dbVax.next_due_date,
        manufacturer: dbVax.manufacturer,
        batchNo: dbVax.batch_no,
        status: dbVax.status,
        providerName: dbVax.provider_name,
        providerId: dbVax.provider_id,
        providerAddress: dbVax.provider_address,
        notes: dbVax.notes,
        certificateUrl: dbVax.certificate_url,
        documentId: dbVax.document_id,
        referenceVaccineId: dbVax.reference_vaccine_id, // Phase 4: Reference Data
        createdAt: dbVax.created_at,
        updatedAt: dbVax.updated_at
    };
};

export const mapDbMedicationToAppMedication = (dbMed: any): Medication => {
    return {
        id: dbMed.id,
        petId: dbMed.pet_id,
        ownerId: dbMed.owner_id,
        name: dbMed.name,
        category: dbMed.category,
        startDate: dbMed.start_date,
        endDate: dbMed.end_date,
        refillDate: dbMed.refill_date,
        frequency: dbMed.frequency,
        instructions: dbMed.instructions,
        notes: dbMed.notes,
        active: dbMed.active,
        providerName: dbMed.provider_name,
        providerId: dbMed.provider_id,
        documentId: dbMed.document_id,
        createdAt: dbMed.created_at,
        updatedAt: dbMed.updated_at
    };
};

export const mapDbAppointmentToAppAppointment = (dbAppt: any): Appointment => {
    return {
        id: dbAppt.id,
        petId: dbAppt.pet_id,
        providerId: dbAppt.provider_id,
        title: dbAppt.title,
        date: dbAppt.date,
        time: dbAppt.time || (dbAppt.start_time ? new Date(dbAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
        startTime: dbAppt.start_time,
        endTime: dbAppt.end_time,
        status: dbAppt.status,
        location: dbAppt.location,
        locationName: dbAppt.location_name,
        address: dbAppt.address,
        latitude: dbAppt.latitude,
        longitude: dbAppt.longitude,
        googlePlaceId: dbAppt.google_place_id,
        type: dbAppt.type,
        notes: dbAppt.notes,
    };
};

export const mapDbReminderToAppReminder = (dbRem: any): Reminder => {
    return {
        id: dbRem.id,
        petId: dbRem.pet_id,
        ownerId: dbRem.owner_id,
        title: dbRem.title,
        date: dbRem.date,
        time: dbRem.time,
        priority: dbRem.priority,
        repeat: dbRem.repeat,
        category: dbRem.category,
        notes: dbRem.notes,
        completed: dbRem.completed
    };
};

export const mapAppReminderToDbReminder = (rem: Reminder): any => {
    return {
        id: rem.id,
        pet_id: rem.petId,
        owner_id: rem.ownerId,
        title: rem.title,
        date: rem.date,
        time: rem.time,
        priority: rem.priority,
        repeat: rem.repeat,
        category: rem.category,
        notes: rem.notes,
        completed: rem.completed
    };
};

export const mapDbMedicalVisitToAppMedicalVisit = (dbVisit: any): MedicalVisit => {
    return {
        id: dbVisit.id,
        petId: dbVisit.pet_id,
        date: dbVisit.date,
        clinicName: dbVisit.clinic_name,
        providerId: dbVisit.provider_id,
        reason: dbVisit.reason,
        diagnosis: dbVisit.diagnosis,
        notes: dbVisit.notes,
        cost: dbVisit.cost,
        currency: dbVisit.currency,
        createdAt: dbVisit.created_at,
        updatedAt: dbVisit.updated_at
    };
};

export const mapAppMedicalVisitToDbMedicalVisit = (visit: MedicalVisit): any => {
    return {
        id: visit.id,
        pet_id: visit.petId,
        date: visit.date,
        clinic_name: visit.clinicName,
        provider_id: visit.providerId,
        reason: visit.reason,
        diagnosis: visit.diagnosis,
        notes: visit.notes,
        cost: visit.cost,
        currency: visit.currency
    };
};


export const mapDbNotificationToAppNotification = (dbNotif: any): Notification => {
    return {
        id: dbNotif.id,
        userId: dbNotif.user_id,
        title: dbNotif.title,
        message: dbNotif.body || dbNotif.data?.message || '',
        time: dbNotif.created_at || new Date().toISOString(),
        read: dbNotif.read || false,
        type: (dbNotif.resource_type as any) || 'info', // Map resource_type to App type
        actionPath: dbNotif.action_url,
        actionLabel: dbNotif.action_text,
        priority: (dbNotif.priority as any) || 'medium'
    };
};
