# Scheduled Publishing Setup Guide

## Overview

The scheduled publishing feature allows you to schedule answers to appear at specific dates and times in Egypt timezone (Africa/Cairo). Answers can be in three states:

- **DRAFT**: Not visible to students
- **SCHEDULED**: Will be automatically published at the specified date/time
- **PUBLISHED**: Currently visible to students

## Features Implemented

✅ **Scheduling UI**: React DatePicker with Egypt timezone support
✅ **Status Management**: Draft, Scheduled, Published states with visual badges
✅ **Auto-Publishing**: Cron job that runs every 10 minutes to publish scheduled content
✅ **Visibility Control**: Manual visibility toggle for additional control
✅ **Publish Now**: Quick action to immediately publish answers
✅ **Reschedule Logic**: Automatically reverts PUBLISHED answers to SCHEDULED when publishAt changes
✅ **Activity Logging**: Tracks scheduling events (SCHEDULE, PUBLISH, RESCHEDULE)
✅ **Timezone Conversion**: All dates stored as UTC, displayed in Egypt time

## Environment Setup

### 1. Set Environment Variables

Add the following to your `.env` file (or Netlify environment variables):

```env
# Cron job secret for auto-publish endpoint security
CRON_SECRET=your-random-secret-key-here

# OR it will fall back to NEXTAUTH_SECRET if CRON_SECRET is not set
NEXTAUTH_SECRET=your-existing-nextauth-secret
```

**Generate a secure secret:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any password generator for a strong random string
```

### 2. Netlify Scheduled Functions

The cron job is configured in `netlify.toml`:

```toml
[[scheduled_functions]]
  path = "/api/cron/publish-answers"
  schedule = "*/10 * * * *"  # Every 10 minutes
```

**Alternative: Using Netlify Build Hooks**

If Netlify scheduled functions don't work, you can use an external service like:

1. **EasyCron** (https://www.easycron.com/)
2. **Cron-job.org** (https://cron-job.org/)
3. **GitHub Actions** (free with GitHub)

Configure the cron service to call:

```
GET https://your-domain.com/api/cron/publish-answers
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
```

### 3. Test the Cron Endpoint

You can manually test the auto-publish endpoint:

```bash
# Replace with your actual secret and domain
curl -X GET https://your-domain.com/api/cron/publish-answers \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Expected response:
# {
#   "success": true,
#   "message": "Successfully published X answer(s)",
#   "published": 0,
#   "timestamp": "2026-01-29T12:00:00.000Z"
# }
```

## Usage Guide

### Creating a Scheduled Answer

1. Navigate to Admin → Answers → Add New Answer
2. Fill in the answer details (title, type, files, etc.)
3. In the **Publishing Schedule** section:
   - Select status: **SCHEDULED**
   - Choose a future date/time in the date picker (Egypt timezone)
   - Ensure **Visible** is checked
4. Click **Save Answer**

### Publishing Immediately

1. Create/edit an answer
2. Click the **Publish Now** button (green button with checkmark)
3. This sets `status=PUBLISHED`, `publishAt=null`, and `isVisible=true`

### Rescheduling a Published Answer

1. Edit a PUBLISHED answer
2. Change the `publishAt` date to a future time
3. Save - the system automatically reverts it to SCHEDULED status

### Filtering Answers by Status

Use the filter dropdowns in the admin answers page:

- **Status Filter**: DRAFT / SCHEDULED / PUBLISHED
- View countdown timers for scheduled answers
- See publish dates in Egypt time

## Database Schema

```prisma
model Answer {
  // ... existing fields
  publishAt    DateTime?     // Scheduled publish date/time (UTC)
  status       PublishStatus @default(DRAFT)
  isVisible    Boolean       @default(true)
}

enum PublishStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
}
```

## API Behavior

### Public API (`/api/answers`)

- Non-authenticated users only see:
  - `isVisible = true`
  - AND (`publishAt IS NULL` OR `publishAt <= now()`)

### Admin API

- Authenticated admins see all answers regardless of status/visibility
- Can filter by status, create drafts, schedule future content

## Timezone Handling

- **Storage**: All dates stored as UTC in PostgreSQL
- **Display**: All dates displayed in Egypt timezone (Africa/Cairo)
- **Conversion**: Handled automatically by `dateUtils.ts` helpers
  - `toUTC()`: Converts Egypt time to UTC for storage
  - `toEgyptTime()`: Converts UTC to Egypt time for display
  - `formatEgyptDate()`: Formats dates in Egypt timezone

## Activity Logging

New activity types tracked:

- **SCHEDULE**: When an answer is scheduled with a future `publishAt`
- **PUBLISH**: Manual "Publish Now" action
- **RESCHEDULE**: When a published answer's `publishAt` is changed
- **CREATE/UPDATE**: Standard creation and updates

## Troubleshooting

### Scheduled answers not publishing automatically

1. **Check cron job is running**: Monitor Netlify function logs
2. **Verify CRON_SECRET**: Ensure it's set in Netlify environment variables
3. **Test endpoint manually**: Use curl to test the cron endpoint
4. **Check answer status**: Ensure answers are in SCHEDULED state
5. **Verify publishAt**: Date should be in the past when cron runs

### DatePicker not displaying correctly

1. **Check CSS import**: Ensure `react-datepicker/dist/react-datepicker.css` is imported
2. **Verify globals.css**: Custom DatePicker styles should be present
3. **Browser compatibility**: Use modern browsers (Chrome, Firefox, Safari, Edge)

### Times showing incorrectly

1. **Verify timezone constant**: Should be `Africa/Cairo` in `dateUtils.ts`
2. **Check date-fns-tz**: Ensure package is installed correctly
3. **Server timezone**: UTC times in database are converted correctly

## Future Enhancements (Optional)

- [ ] Bulk scheduling actions
- [ ] Student notifications when content is published
- [ ] Schedule conflicts warning
- [ ] Unpublish action (revert PUBLISHED to DRAFT)
- [ ] Date validation (business hours only)
- [ ] Preview mode for scheduled content

## Support

For issues or questions:

1. Check Netlify function logs
2. Review browser console for errors
3. Test the cron endpoint manually
4. Verify environment variables are set correctly
