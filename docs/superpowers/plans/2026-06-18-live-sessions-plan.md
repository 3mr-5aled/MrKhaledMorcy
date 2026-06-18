# Implementation Plan: Live Sessions Refinement

**Date:** 2026-06-18  
**Feature:** Live Sessions  
**Design Spec:** [2026-06-18-live-sessions-design.md](file:///D:/02-Projects/03-Vibe-Coding/MrKhaledMorcy/docs/superpowers/specs/2026-06-18-live-sessions-design.md)  
**Status:** Ready for Execution  

---

## Phase 1: Database Migration & Schema Sync

### Step 1.1: Apply Schema Migrations
- We will register the existing SQL migration from `prisma/migrations/20260617000000_add_live_sessions/migration.sql` or generate a new migration to ensure the local database schema aligns with `schema.prisma`.
- **Command:** `npx prisma migrate dev`
- **Output Validation:** Verify the `live_sessions`, `session_codes`, and `session_attendance` tables are successfully created in the PostgreSQL database.

---

## Phase 2: API Redeem Route Refinement

### Step 2.1: Update `/api/sessions/redeem/route.ts`
- Edit [route.ts](file:///D:/02-Projects/03-Vibe-Coding/MrKhaledMorcy/src/app/api/sessions/redeem/route.ts).
- Modify the `isRedeemed` condition block.
- **Old Behavior:** Immediately return `409` indicating "الكود تم استخدامه قبل كده" (This code has already been used).
- **New Behavior:**
  1. Retrieve the session status via `getLiveSessionStatus(...)`.
  2. If the status is `"Finished"`, return `409` error indicating the session has completed.
  3. If the status is `"Upcoming"` or `"Live"`, bypass database writes, calculate whether to include the session link via `canRevealSessionLink(...)`, and return a `200` response with session details.

---

## Phase 3: Student Sessions Page Refinement

### Step 3.1: Extract Check-In Logic in `/sessions/page.tsx`
- Edit [page.tsx](file:///D:/02-Projects/03-Vibe-Coding/MrKhaledMorcy/src/app/sessions/page.tsx).
- Extract the fetch call inside `handleSubmit` into a reusable `handleCheckIn(targetCode: string)` function.

### Step 3.2: Implement Auto-Submit Hook
- In the existing `useEffect` block that reads from search parameters, extract the `code` query parameter.
- If present, sanitize the string, set the `code` input state, and invoke `handleCheckIn(sanitizedCode)` immediately on component mount.

---

## Phase 4: Manual Verification & Testing

### Step 4.1: Test Fresh Code Checkout
- Generate a new session and codes in the Admin Dashboard.
- Submit a fresh code on the `/sessions` page. Verify the student registers attendance and is presented with the session details.

### Step 4.2: Test Early Check-In Persistence & Link Transition
- Enter the code before the session starts (e.g. 30 minutes early). Verify the link is hidden.
- Close the page, then open it again and submit the same code. Verify the page successfully displays check-in details without error.
- Wait until 20 minutes before the session starts, submit the code again, and verify the live session link button appears.

### Step 4.3: Test Finished Session Lock
- Wait until after the session's duration is over, then enter the code. Verify the page returns a `409` error indicating the session is over.

### Step 4.4: Test QR/URL Auto-Submit
- Navigate to `/sessions?code=<CODE>`. Verify the input box pre-fills and the request is sent automatically without clicking the submit button.
