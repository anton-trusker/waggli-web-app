
# Waggly Database Schema

This document outlines the core tables and relationships in the Waggly Supabase database.

## Core Entities

### `pets`
Primary entity representing a user's pet.
-   `id` (UUID, PK)
-   `owner_id` (UUID, FK -> auth.users)
-   `name`, `breed`, `species_id` (FK), `gender`, `birth_date`
-   `computed_health_score` (Integer, 0-100)
-   `image_url` (Text)

### `medical_visits`
Logs interactions with vets or clinics.
-   `id` (UUID, PK)
-   `pet_id` (UUID, FK)
-   `date`, `clinic_name`, `provider_id`
-   `reason`, `diagnosis`, `notes`
-   `cost`, `currency`

### `vaccinations`
Track vaccine history.
-   `id` (UUID, PK)
-   `pet_id` (UUID, FK)
-   `vaccine_name`, `manufacturer`, `batch_no`
-   `date_administered`, `date_expires`

### `medications`
Active or past prescriptions.
-   `id` (UUID, PK)
-   `pet_id` (UUID, FK)
-   `name`, `dosage`, `frequency`
-   `start_date`, `end_date`

## Reference Data
Read-only tables for standardizing inputs.
-   `species` (Dog, Cat, etc.)
-   `breeds` (Linked to species)
-   `reference_vaccines` (Core/Non-core vaccines per species)
-   `reference_medications` (Common drugs)

## Sharing & Collaboration
-   `co_owners`: Users with access to a specific pet.
-   `invitations`: Pending invites for co-ownership.
-   `public_shares`: Config for public read-only links.

## Notifications
-   `push_subscriptions`: Stores VAPID endpoints for user devices.
-   `notification_logs`: History of sent push messages.
-   `reminders`: User-scheduled tasks (linked to pets).
