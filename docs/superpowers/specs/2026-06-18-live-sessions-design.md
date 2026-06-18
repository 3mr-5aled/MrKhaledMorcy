# Design Specification: Live Sessions Refinement

**Date:** 2026-06-18  
**Feature:** Live Sessions  
**Status:** Approved (Brainstorming Phase)  
**Author:** Antigravity (AI Coding Assistant)  

---

## 1. Executive Summary & Context

The **Mr. Khaled Morcy Educational Platform** includes a **Live Sessions** feature that allows the teacher to create live English lessons, generate unique entry codes, and print cards with QR codes for student checkout. Students scan the QR code (or type it in) to check in, register attendance, and access the live session link.

During initial development, two key user experience (UX) and logic issues were identified:
1. **Early Check-In / Code Lock:** When students check in early (before the session is live), the code is redeemed and attendance is registered, but the live link is not yet visible. If they close the browser tab and return when the session starts, entering the code again is rejected because it is already marked `isRedeemed`.
2. **Friction in QR Scan:** Scanning the QR code pre-fills the input box on the `/sessions` page but requires the student to manually click the submit button.

This design document outlines the implementation of **Approach 1 (Target Fixes)** to resolve these issues.

---

## 2. Requirements & Behavior

### 2.1 Code Reuse for Active Sessions (Early Redemption Fix)
- A code can only register attendance **once** (one `SessionAttendance` record per code).
- If a student submits a code that has **already been redeemed**:
  - The API will check the status of the associated `LiveSession`.
  - **If the session is "Upcoming" or "Live":** The request succeeds, returns the session details, and returns the session link (if the session has transitioned to "Live").
  - **If the session is "Finished":** The request fails with a `409 Conflict` error indicating the session has completed.

### 2.2 Auto-Submit on Query Parameter Detection
- When a student visits `/sessions?code=<CODE>` (via QR code scan or direct link):
  - The code is set in the input state.
  - The system automatically triggers the validation/redemption request immediately.
  - The loading spinner is displayed to provide visual feedback.

---

## 3. Technical Design & Integration

### 3.1 Database Schema (Prisma)
The database structure supports a strict 1-to-1 relationship between an attendance record and a generated code:

```prisma
model LiveSession {
  id              String              @id @default(cuid())
  title           String
  description     String?             @db.Text
  sessionLink     String
  sessionDateTime DateTime
  durationMinutes Int                 @default(120)
  gradeId         String
  grade           Grade               @relation(fields: [gradeId], references: [id], onDelete: Cascade)
  codes           SessionCode[]
  attendance      SessionAttendance[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@map("live_sessions")
}

model SessionCode {
  id           String              @id @default(cuid())
  sessionId    String
  session      LiveSession         @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  gradeId      String
  grade        Grade               @relation(fields: [gradeId], references: [id], onDelete: Cascade)
  code         String              @unique
  isRedeemed   Boolean             @default(false)
  redeemedAt   DateTime?
  attendance   SessionAttendance?
  createdAt    DateTime            @default(now())

  @@map("session_codes")
}

model SessionAttendance {
  id        String      @id @default(cuid())
  sessionId String
  session   LiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  codeId    String      @unique
  code      SessionCode @relation(fields: [codeId], references: [id], onDelete: Cascade)
  enteredAt DateTime    @default(now())

  @@map("session_attendance")
}
```

### 3.2 API Endpoint Refinement: `/api/sessions/redeem/route.ts`
Modify the `POST` handler to support code re-entry for non-finished sessions:

```typescript
// Pseudocode for API change
const sessionCode = await db.sessionCode.findUnique({
  where: { code: normalizedCode },
  include: { session: true }
});

if (!sessionCode) {
  return NextResponse.json({ error: "الكود غير صحيح" }, { status: 404 });
}

// Check if already redeemed
if (sessionCode.isRedeemed) {
  const sessionStatus = getLiveSessionStatus(
    sessionCode.session.sessionDateTime,
    sessionCode.session.durationMinutes
  );

  if (sessionStatus === "Finished") {
    return NextResponse.json(
      { error: "الكود تم استخدامه قبل كده والحصة انتهت" },
      { status: 409 }
    );
  }

  // Session is Upcoming or Live: Allow re-entry without updating database
  const includeLink = canRevealSessionLink(
    sessionCode.session.sessionDateTime,
    sessionCode.session.durationMinutes
  );

  return NextResponse.json({
    title: sessionCode.session.title,
    description: sessionCode.session.description,
    grade: sessionCode.grade.name,
    sessionDateTime: sessionCode.session.sessionDateTime,
    formattedSessionDateTime: formatEgyptDate(sessionCode.session.sessionDateTime),
    status: sessionStatus,
    sessionLink: includeLink ? sessionCode.session.sessionLink : null,
  });
}

// Standard check-in transaction for fresh codes
const redeemedCode = await db.$transaction(async (tx) => {
  // Update code to redeemed
  // Create attendance record
  // Return updated code details
});
```

### 3.3 Page Auto-Submit: `src/app/sessions/page.tsx`
Update the page logic to auto-trigger submission:

```typescript
function SessionsContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<RedeemedSession | null>(null);

  // Extract core redeem logic
  const handleCheckIn = async (targetCode: string) => {
    setIsLoading(true);
    setError("");
    setSession(null);
    try {
      const response = await fetch("/api/sessions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "الكود غير صحيح");
      setSession(data);
    } catch (err: any) {
      setError(err.message || "الكود غير صحيح");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      const sanitized = codeParam.trim().toUpperCase();
      setCode(sanitized);
      handleCheckIn(sanitized); // Auto-trigger check-in on load
    }
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("اكتب الكود هنا");
      return;
    }
    handleCheckIn(code.trim());
  };
  
  // Render structure...
}
```

---

## 4. Edge Cases & Validation Rules
1. **Timezones:** All times are handled in UTC in the database and translated to `Africa/Cairo` for student and admin display.
2. **Concurrency:** A transaction is used to set `isRedeemed` to prevent two students from checking in simultaneously with the same code.
3. **URL Validation:** The session links inputted by admin must be validated URLs.

---

## 5. Testing & Verification Plan
- **Test Case 1 (Fresh Code Check-in):** Enter a fresh code. Verify attendance is recorded in the database, `isRedeemed` becomes true, and the session info is shown.
- **Test Case 2 (Early Check-in persistence):** Enter a code for an upcoming session. Verify user sees "Link opens in..." screen. Close tab. Re-open page and enter the code again. Verify it succeeds and shows the same screen without creating a duplicate attendance row.
- **Test Case 3 (Transition to Live):** Using the same code from Test Case 2, once the time reaches 20 minutes before the session, re-enter the code. Verify the session link button is now visible and active.
- **Test Case 4 (Finished Session Lock):** Try to re-enter a code for a session that has completed (current time > sessionDateTime + duration). Verify it returns a 409 error message.
- **Test Case 5 (QR Code Scan):** Load `/sessions?code=<CODE>`. Verify check-in is initiated automatically on page load and loading UI is shown.
