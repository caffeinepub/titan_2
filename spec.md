# Titan

## Current State
The app has a registration flow that generates a UUID as `principalId` and stores it in localStorage via `titanRegistration.ts`. However:
- `ChatView` reads the user's identity from `useInternetIdentity()` which returns anonymous/undefined since II login is not used
- There is no guarantee a returning user (who skips registration because `isRegistered()` is true) has a principalKey assigned and available in session context
- Nothing ensures the principalKey is propagated to all actions
- If localStorage is cleared, returning users get no principalKey regenerated

## Requested Changes (Diff)

### Add
- `ensurePrincipalKey()` utility that always returns a valid UUID principalKey — retrieving from localStorage or generating+saving a new one if missing
- A React context/hook `usePrincipalKey()` that provides the current user's principalKey across the whole app
- Call `ensurePrincipalKey()` at app startup so every session always has a key

### Modify
- `App.tsx` — call `ensurePrincipalKey()` on mount; pass the principalKey down or provide via context
- `ChatView.tsx` — replace `identity?.getPrincipal().toString()` with the stored UUID principalKey from localStorage; show it as "Your Principal Key"
- `titanRegistration.ts` — add `ensurePrincipalKey()` export
- `RegistrationModal.tsx` — use `ensurePrincipalKey()` instead of raw `crypto.randomUUID()` so the key is always consistent

### Remove
- The dependency on `useInternetIdentity` in `ChatView` for displaying the user's own principal (it showed anonymous ICP principal which is meaningless here)

## Implementation Plan
1. Add `ensurePrincipalKey()` to `titanRegistration.ts`
2. Update `RegistrationModal.tsx` to use `ensurePrincipalKey()` instead of raw `crypto.randomUUID()`
3. Update `App.tsx` to call `ensurePrincipalKey()` on mount
4. Update `ChatView.tsx` to use `getRegistrationId()` / `ensurePrincipalKey()` for displaying the user's own key, removing the II identity dependency for this purpose
