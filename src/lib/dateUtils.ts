/**
 * Date and timezone utilities for scheduling features
 * All dates are stored in UTC in the database but displayed/managed in Egypt timezone
 */

import { format, formatDistanceToNow, isPast } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { ar } from "date-fns/locale";

export const EGYPT_TZ = "Africa/Cairo";

/**
 * Convert UTC date to Egypt timezone
 */
export function toEgyptTime(date: Date | string | null): Date | null {
  if (!date) return null;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return toZonedTime(dateObj, EGYPT_TZ);
}

/**
 * Convert Egypt timezone date to UTC for database storage
 */
export function toUTC(date: Date | string | null): Date | null {
  if (!date) return null;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return fromZonedTime(dateObj, EGYPT_TZ);
}

/**
 * Format date in Egypt timezone for display
 */
export function formatEgyptDate(
  date: Date | string | null,
  formatString: string = "dd/MM/yyyy HH:mm",
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, EGYPT_TZ, formatString, { locale: ar });
}

/**
 * Format date for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function formatForDateTimeInput(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const egyptTime = toEgyptTime(dateObj);
  if (!egyptTime) return "";
  return format(egyptTime, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Check if a date is in the past (in Egypt timezone)
 */
export function isDateInPast(date: Date | string | null): boolean {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return isPast(dateObj);
}

/**
 * Get time remaining until date (in Egypt timezone)
 */
export function getTimeRemaining(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isDateInPast(dateObj)) {
    return "منذ " + formatDistanceToNow(dateObj, { locale: ar });
  }

  return "خلال " + formatDistanceToNow(dateObj, { locale: ar });
}

/**
 * Calculate status based on publishAt date and current status
 */
export function calculateStatus(
  publishAt: Date | string | null,
  currentStatus?: string,
): "DRAFT" | "SCHEDULED" | "PUBLISHED" {
  if (!publishAt) return "DRAFT";

  const dateObj =
    typeof publishAt === "string" ? new Date(publishAt) : publishAt;
  const now = new Date();

  if (dateObj <= now) {
    return "PUBLISHED";
  }

  return "SCHEDULED";
}

/**
 * Get current date/time in Egypt timezone
 */
export function getNowInEgypt(): Date {
  return toZonedTime(new Date(), EGYPT_TZ);
}
