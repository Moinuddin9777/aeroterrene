# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny Safety Net**: Every path not explicitly matched under `/databases/{database}/documents` is unconditionally denied (`allow read, write: if false;`).
2. **Strict Tenant Ownership (`/trips/{tripId}`)**: Every `Trip` document must belong to a single authenticated user (`ownerId == request.auth.uid`). No user may read, list, create, update, or delete another user's trip documents.
3. **Verified Email Requirement**: All mutating operations (`create`, `update`, `delete`) require `request.auth != null && request.auth.token.email_verified == true`.
4. **Schema & Volumetric Enforcement (`isValidTrip`)**: Every `create` and `update` must pass `isValidTrip(incoming())`, enforcing exact key sets (`hasAll` and `hasOnly`), string length bounds, coordinate bounds (`-90..90` and `-180..180`), `travelDate` regex (`^\d{4}-\d{2}-\d{2}$`), and bounded `photos` list (`size() <= 4`).
5. **Temporal & Identity Immutability**: On `create`, `createdAt == request.time` and `updatedAt == request.time`. On `update`, `ownerId` and `createdAt` are strictly immutable (`incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`) and `updatedAt == request.time`.
6. **Secure List Queries**: `allow list` enforces `resource.data.ownerId == request.auth.uid`, rejecting any query that does not filter by the caller's `ownerId`.

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing on Create**: Authenticated user `user_A` creates `/trips/trip_1` with `ownerId: "user_B"`. -> `PERMISSION_DENIED`
2. **Unverified Email Write**: Authenticated user `user_A` with `email_verified: false` creates `/trips/trip_1`. -> `PERMISSION_DENIED`
3. **Shadow Field Injection on Create**: Payload includes all valid fields plus `"isAdmin": true`. -> `PERMISSION_DENIED`
4. **ID Poisoning Attack**: Document ID contains illegal characters or exceeds 128 chars (`/trips/bad$id!`). -> `PERMISSION_DENIED`
5. **Memory Journal Overflow (Denial of Wallet)**: `goodMemories` is a 5,000-character string (exceeds `maxLength: 2000`). -> `PERMISSION_DENIED`
6. **Photo Array Overflow**: `photos` contains 5 items (exceeds max size 4). -> `PERMISSION_DENIED`
7. **Photo Element Type Poisoning**: `photos` contains `[12345]` (non-string first element). -> `PERMISSION_DENIED`
8. **Invalid Travel Date Format**: `travelDate` is `"October 4, 2026"` instead of `YYYY-MM-DD`. -> `PERMISSION_DENIED`
9. **Out-of-Bounds Geodesic Coordinates**: `originLat` is `145.0` (exceeds `[-90, 90]`). -> `PERMISSION_DENIED`
10. **Forged Client Timestamp on Create**: `createdAt` is set to a past timestamp instead of `request.time`. -> `PERMISSION_DENIED`
11. **Owner Takeover / Immutable Field Mutation on Update**: User attempts to change `ownerId` or `createdAt` during an update. -> `PERMISSION_DENIED`
12. **Cross-Tenant List Scraping**: User `user_A` executes an unconstrained `getDocs(collection(db, 'trips'))` across documents owned by `user_B`. -> `PERMISSION_DENIED`
