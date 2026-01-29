import { db } from "./db";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SCHEDULE"
  | "PUBLISH"
  | "RESCHEDULE";
export type EntityType = "grade" | "unit" | "lesson" | "answer" | "quiz";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  entityName: string;
  userId: string;
  metadata?: Record<string, any>;
}

export async function logActivity({
  action,
  entityType,
  entityId,
  entityName,
  userId,
}: LogActivityParams) {
  try {
    await db.activity.create({
      data: {
        action,
        entityType,
        entityId,
        entityName,
        userId,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging should not break the main operation
  }
}

export async function getRecentActivities(limit: number = 10) {
  try {
    return await db.activity.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
}

export function getActivityMessage(
  action: ActivityAction,
  entityType: EntityType,
  entityName: string,
): string {
  const entityTypeArabic: Record<EntityType, string> = {
    grade: "المرحلة",
    unit: "الوحدة",
    lesson: "الدرس",
    answer: "الإجابة",
    quiz: "الاختبار",
  };

  const actionArabic: Record<ActivityAction, string> = {
    CREATE: "أضاف",
    UPDATE: "حدّث",
    DELETE: "حذف",
    SCHEDULE: "جدول",
    PUBLISH: "نشر",
    RESCHEDULE: "أعاد جدولة",
  };

  return `${actionArabic[action]} ${entityTypeArabic[entityType]} "${entityName}"`;
}
