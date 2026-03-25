# Titan

## Current State
App shows a RoleModal popup after registration (and on reset) asking users to select "Continue as User", "Admin Access", or "Owner Access". The role state in App.tsx is initialized to `"user"` instead of reading from localStorage on load.

## Requested Changes (Diff)

### Add
- Auto-load saved role from `localStorage` on app startup (via `getTitanRole()`)
- Logout / Switch Account option in ProfileView that clears role and registration data, returning to registration screen

### Modify
- `App.tsx`: Initialize role state from `getTitanRole()` instead of hardcoded `"user"`. After registration, skip RoleModal — default to user role. Remove RoleModal usage entirely.
- `ProfileView.tsx`: Add a "Log Out / Switch Account" section with a button that clears stored role + registration data and triggers re-registration.
- `Sidebar.tsx`: Replace "Switch Role" (RefreshCw) with "Log Out" button that calls the same clear handler.

### Remove
- `RoleModal` from `App.tsx` rendering and state
- `showRoleModal` state and `handleRegistrationComplete`/`handleRoleSelected` functions

## Implementation Plan
1. Update `App.tsx` — init role from getTitanRole(), remove RoleModal, after registration just close modal without popup
2. Update `ProfileView.tsx` — add logout/switch account section
3. Update `Sidebar.tsx` — replace switch role button with logout button
4. Pass logout callback through App → Sidebar/ProfileView
