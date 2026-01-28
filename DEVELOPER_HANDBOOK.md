
# Waggly Developer Handbook

Welcome to the **Waggly** codebase! This document serves as a guide for developers working on the Waggly Pet Health & Wellness platform.

## 1. Tech Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS
-   **Backend / Database**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
-   **State Management**: React Context (AppContext)
-   **Notifications**: Web Push API + Service Workers
-   **Icons**: Material Icons (Outlined/Round)

## 2. Project Structure

```text
/
├── components/          # Reusable UI components
│   ├── pet-profile/     # Components specific to Pet Profile (vaccines, meds, etc.)
│   └── ...
├── pages/               # Route endpoints (Dashboard, PetProfile, Reminders, etc.)
├── context/             #/AppContext.tsx (Global State)
├── hooks/               # Custom hooks (usePushNotifications, useReferenceData)
├── types.ts             # Global TypeScript interfaces
├── public/              # Static assets and sw.js (Service Worker)
├── supabase/
│   ├── functions/       # Edge Functions (send-push, etc.)
│   └── migrations/      # Database schema changes
└── tailwind.config.js   # Style configuration
```

## 3. Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create `.env.local` with the following:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
    VITE_VAPID_PUBLIC_KEY=your_vapid_public_key (for push notifications)
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 4. Key Workflows

### Database Updates
We use Supabase Migrations.
-   SQL files are located in `supabase/migrations/`.
-   Types should be manually synced in `types.ts` to reflect DB changes.

### Notifications
-   **Frontend**: `hooks/usePushNotifications.ts` manages subscriptions.
-   **Backend**: `supabase/functions/send-push` handles delivery.
-   **Service Worker**: `public/sw.js` listens for push events.

### Authentication
-   Handled via Supabase Auth.
-   `ProtectedRoutes` in `App.tsx` guards authenticated pages.

## 5. Deployment
-   **Frontend**: Deployed to Vercel/Netlify (Static Site).
-   **Functions**: Deployed via Supabase CLI:
    ```bash
    supabase functions deploy send-push
    ```
