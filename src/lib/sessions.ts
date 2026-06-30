import { formatEgyptDate } from "@/lib/dateUtils";

const LINK_OPEN_MINUTES = 20;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type LiveSessionStatus = "Upcoming" | "Live" | "Finished";

export function getLiveSessionStatus(
  sessionDateTime: Date | string,
  durationMinutes: number,
  now: Date = new Date(),
): LiveSessionStatus {
  const startsAt =
    typeof sessionDateTime === "string"
      ? new Date(sessionDateTime)
      : sessionDateTime;
  const linkOpensAt = new Date(
    startsAt.getTime() - LINK_OPEN_MINUTES * 60 * 1000,
  );
  const finishesAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  if (now < linkOpensAt) return "Upcoming";
  if (now <= finishesAt) return "Live";
  return "Finished";
}

export function canRevealSessionLink(
  sessionDateTime: Date | string,
  durationMinutes: number,
  now: Date = new Date(),
): boolean {
  return getLiveSessionStatus(sessionDateTime, durationMinutes, now) === "Live";
}

export function getSessionAnalytics(total: number, redeemed: number) {
  const unused = total - redeemed;
  const attendanceRate = total === 0 ? 0 : Math.round((redeemed / total) * 100);

  return {
    totalGenerated: total,
    redeemedCodes: redeemed,
    unusedCodes: unused,
    attendanceRate,
  };
}

export function getSessionNumber(id: string): string {
  const digits = id.replace(/\D/g, "");
  if (digits) return digits.slice(-3);
  return id.slice(-3).toUpperCase();
}

export function getGradeCode(slug: string): string {
  const known: Record<string, string> = {
    "prep-1": "PREP1",
    "prep-2": "PREP2",
    "prep-3": "PREP3",
    "sec-1": "SEC1",
    "sec-2": "SEC2",
    "sec-3": "SEC3",
  };

  return (
    known[slug] ||
    slug
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 8) ||
    "GRADE"
  );
}

export function generateCodeValue(
  gradeSlug: string,
  sessionId: string,
  sessionSlug?: string | null,
): string {
  let randomPart = "";

  for (let index = 0; index < 6; index += 1) {
    randomPart += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }

  const cleanSlug =
    sessionSlug && sessionSlug.trim() !== "" && sessionSlug !== "SESSION"
      ? sessionSlug.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 10)
      : "";

  if (cleanSlug) {
    return `${cleanSlug}#${getSessionNumber(sessionId)}#${randomPart}`;
  }

  return `${getSessionNumber(sessionId)}#${randomPart}`;
}

export function mapSessionForResponse<T extends {
  sessionDateTime: Date;
  durationMinutes: number;
  sessionLink?: string;
  _count?: { codes?: number; attendance?: number };
}>(
  session: T,
  options: { includeLink?: boolean } = {},
) {
  const total = session._count?.codes || 0;
  const redeemed = session._count?.attendance || 0;
  const analytics = getSessionAnalytics(total, redeemed);

  return {
    ...session,
    sessionLink: options.includeLink ? session.sessionLink : undefined,
    status: getLiveSessionStatus(
      session.sessionDateTime,
      session.durationMinutes,
    ),
    formattedSessionDateTime: formatEgyptDate(session.sessionDateTime),
    analytics,
  };
}
