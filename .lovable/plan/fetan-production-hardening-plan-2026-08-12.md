# Fetan: production hardening plan

## Audit summary

**Already real and working**
- Auth: email/password sign up + sign in, role selection at signup, trigger creates profile and role.
- Roles: `user_roles` table + `has_role()` security-definer function, role-routed dashboards (customer / provider / admin).
- Real data: providers listing, bookings, quotations, reviews, admin stats — all query the database, no mock data.
- MCP agent integration with OAuth consent.
- AI edge functions (chat, recommendations, form helper) and contact submission.

**Partially done / weak**
- Auth is missing: password reset, change password, email-verified state handling, logout everywhere, account deletion, Google sign-in.
- No protected-route wrapper — each page hand-rolls its own redirect; a flash of unauthorized UI is possible.
- No profile edit page, no avatar upload (the `avatars` bucket exists but is unused).
- Dashboard buttons that do nothing: "Edit Profile", "Settings", "Create Service Listing", "Manage Availability", "Leave Review".
- No notifications system.
- No dark mode toggle, no mobile bottom navigation, several desktop-first layouts.
- Data fetching is hand-written `useEffect` + `useState` in each page (React Query is installed but unused): no caching, no skeletons, inconsistent error handling.
- No pagination on providers/bookings/admin lists.
- No shared service layer, validation schemas, or typed entities.

## Proposed work, in order

### 1. Foundation (no visible change, everything else builds on it)
- `src/services/` data layer per domain (auth, profiles, providers, bookings, quotations, reviews, notifications) with typed returns from the generated database types.
- Zod validation schemas in `src/lib/validation/`.
- React Query hooks in `src/hooks/` replacing ad-hoc `useEffect` fetching; centralized error-to-toast handling that never leaks database errors.
- `AuthProvider` context + `<ProtectedRoute role={...}>` wrapper; route-level lazy loading.
- Reusable `PageState` components: skeleton, empty, error-with-retry.

### 2. Authentication completion
- Forgot password, `/reset-password` page, change password, sign-out everywhere, session-expiry handling, account deletion (edge function using admin privileges).
- Google sign-in via managed OAuth, configured the same turn.
- Clear "verify your email" state after signup.

### 3. Profile system
- `/profile` page: view/edit name, phone, address, avatar upload to the private `avatars` bucket with signed URLs, type/size validation, preview, replace, delete.
- Notification preferences stored in the database.

### 4. Core feature completion
- Provider: create/edit service listing, availability management, quotation flow polish.
- Customer: booking detail, cancel, leave review (wired to the existing reviews table + rating trigger).
- Search/filter/sort/pagination on providers and all dashboard lists, with database indexes to match.
- In-app notifications table + notification center with read/unread, triggered on booking and quotation events.

### 5. Admin dashboard
- Real user management (list, search, filter, change role, disable), booking/provider management, CRUD with confirmation dialogs, pagination, audit log table.

### 6. UI/UX, mobile, PWA, accessibility
- Consolidate the design system in `index.css` + Tailwind tokens; remove hardcoded colors.
- Mobile bottom navigation, touch targets, responsive tables → cards, mobile dialogs and forms.
- Dark mode with system preference and persistence.
- Semantic HTML, focus states, ARIA on dialogs/menus, contrast pass.
- Manifest + icons for home-screen installability (offline caching only if you want it).

### 7. Security, performance, QA
- Migration adding indexes, missing constraints, soft-delete columns, notifications/audit tables with GRANTs and RLS.
- Full security scan; fix every finding tied to these changes.
- Browser-driven QA of the critical journeys: signup → booking → quotation → review, admin flows, and unauthorized-access attempts.
- README with setup, environment variables, database, deploy, and mobile packaging instructions.

## Technical notes
- Backend stays Lovable Cloud (Supabase). Every new table ships with GRANTs, RLS enabled, and policies scoped through `has_role()`.
- Mobile packaging: the plan keeps a single backend and a responsive PWA. Native Android/iOS packaging via Capacitor is a separate step that requires exporting the project to GitHub and building locally — it cannot be completed inside Lovable.
- Requires your action later: Google OAuth is configured automatically; a custom email sender domain and any push-notification certificates would need your credentials.

## Scope note
This is several sessions of work. I will execute it in the order above, checking in after each numbered section, unless you want a different order or a smaller cut.
