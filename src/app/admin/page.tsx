import PageHeader from "@/components/admin/PageHeader";
import StatsCard from "@/components/admin/StatsCard";
import { getActivityMessage, getRecentActivities } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Fetch statistics
  const [
    gradesCount,
    unitsCount,
    lessonsCount,
    answersCount,
    quizzesCount,
    sessionsCount,
    filesCount,
    recentActivities,
  ] = await Promise.all([
    db.grade.count(),
    db.unit.count(),
    db.lesson.count(),
    db.answer.count(),
    db.quiz.count(),
    db.liveSession.count(),
    db.file.count({ where: { isActive: true } }),
    getRecentActivities(10),
  ]);

  return (
    <div>
      <PageHeader
        title={`مرحباً، ${(session as any)?.user?.name || "المعلم"}`}
        description="نظرة عامة على المحتوى التعليمي والإحصائيات"
      />

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
        <StatsCard
          title="المراحل الدراسية"
          value={gradesCount}
          color="#1B9AAA"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />
        <StatsCard
          title="الوحدات"
          value={unitsCount}
          color="#06D6A0"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatsCard
          title="الدروس"
          value={lessonsCount}
          color="#FFC43D"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
        />
        <StatsCard
          title="الإجابات"
          value={answersCount}
          color="#EF476F"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="الاختبارات"
          value={quizzesCount}
          color="#9B59B6"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
        <StatsCard
          title="Sessions"
          value={sessionsCount}
          color="#F59E0B"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatsCard
          title="الملفات"
          value={filesCount}
          color="#3B82F6"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/grades"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إضافة مرحلة دراسية</h3>
              <p className="text-sm text-gray-600">إعدادي - ثانوي - جامعي</p>
            </div>
          </a>

          <a
            href="/admin/units"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#06D6A0]/10 to-[#FFC43D]/10 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#06D6A0] to-[#FFC43D] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إضافة وحدة</h3>
              <p className="text-sm text-gray-600">وحدة جديدة للمنهج</p>
            </div>
          </a>

          <a
            href="/admin/answers"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FFC43D]/10 to-[#EF476F]/10 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFC43D] to-[#EF476F] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">رفع إجابات</h3>
              <p className="text-sm text-gray-600">PDF، صور، أو فيديو</p>
            </div>
          </a>

          <a
            href="/admin/files"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#3B82F6]/10 to-[#2563EB]/10 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إدارة الملفات</h3>
              <p className="text-sm text-gray-600">تتبع وحذف الملفات</p>
            </div>
          </a>

          <a
            href="/admin/quizzes"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#9B59B6]/10 to-[#8E44AD]/10 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إضافة اختبار</h3>
              <p className="text-sm text-gray-600">Google Forms اختبار</p>
            </div>
          </a>

          <a
            href="/admin/sessions"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FFC43D]/10 to-[#F59E0B]/10 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFC43D] to-[#F59E0B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إضافة حصة مباشرة</h3>
              <p className="text-sm text-gray-600">Zoom أو رابط بث مباشر</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">النشاط الأخير</h2>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            لا توجد أنشطة حديثة لعرضها
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.action === "CREATE"
                      ? "bg-green-100 text-green-600"
                      : activity.action === "UPDATE"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {activity.action === "CREATE" && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  )}
                  {activity.action === "UPDATE" && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  )}
                  {activity.action === "DELETE" && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">
                    {activity.user.name || activity.user.email}{" "}
                    <span className="font-normal">
                      {getActivityMessage(
                        activity.action,
                        activity.entityType,
                        activity.entityName,
                      )}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
