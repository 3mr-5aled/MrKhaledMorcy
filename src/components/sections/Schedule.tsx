"use client";

import scheduleData from "@/data/schedule.json";
import { useState } from "react";

type GradeSession = {
  center: string;
  day: string;
  time: string;
  location: string;
};

type Grade = {
  id: number;
  grade: string;
  gradeKey: string;
  sessions: GradeSession[];
};

export default function Schedule() {
  const allGrades: Grade[] = [
    ...(scheduleData as any).schedule.preparatory,
    ...(scheduleData as any).schedule.secondary,
  ];

  const [activeTab, setActiveTab] = useState(allGrades[0].gradeKey);

  const activeGrade = allGrades.find((g) => g.gradeKey === activeTab);

  return (
    <section id="schedule" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#1B9AAA]/10 text-[#1B9AAA] rounded-full text-sm font-semibold mb-4">
            مواعيد السنتر
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            جدول المواعيد
          </h2>
          <p className="text-lg text-gray-600">
            اختر صفك الدراسي لمعرفة مواعيد الحصص في السنتر
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          {/* Preparatory Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
              المرحلة الإعدادية
            </h3>
            <div className="flex flex-wrap gap-2">
              {(scheduleData as any).schedule.preparatory.map(
                (grade: Grade) => (
                  <button
                    key={grade.gradeKey}
                    onClick={() => setActiveTab(grade.gradeKey)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === grade.gradeKey
                        ? "tab-active shadow-lg shadow-[#1B9AAA]/30"
                        : "tab-inactive"
                    }`}
                  >
                    {grade.grade}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Secondary Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
              المرحلة الثانوية
            </h3>
            <div className="flex flex-wrap gap-2">
              {(scheduleData as any).schedule.secondary.map((grade: Grade) => (
                <button
                  key={grade.gradeKey}
                  onClick={() => setActiveTab(grade.gradeKey)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === grade.gradeKey
                      ? "tab-active shadow-lg shadow-[#1B9AAA]/30"
                      : "tab-inactive"
                  }`}
                >
                  {grade.grade}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Content */}
        {activeGrade && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGrade.sessions.map((session, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 card-hover"
              >
                {/* Center Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1B9AAA]/10 flex items-center justify-center">
                    {session.center === "Online" ? (
                      <svg
                        className="w-6 h-6 text-[#1B9AAA]"
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
                    ) : (
                      <svg
                        className="w-6 h-6 text-[#1B9AAA]"
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
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {session.center}
                    </h3>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-[#06D6A0]/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#06D6A0]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">{session.day}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-[#FFC43D]/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#FFC43D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">{session.time}</span>
                  </div>
                </div>

                {/* Location Button */}
                <a
                  href={session.location || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                    session.location
                      ? session.location.includes("wa.me")
                        ? "bg-[#06D6A0] text-white hover:bg-[#05c28f] hover:scale-105"
                        : "bg-[#EF476F] text-white hover:bg-[#d63a5c] hover:scale-105"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => !session.location && e.preventDefault()}
                >
                  {session.location?.includes("wa.me") ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>تواصل عبر واتساب</span>
                    </>
                  ) : (
                    <>
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>عرض الموقع</span>
                    </>
                  )}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="mt-12 p-6 bg-[#1B9AAA]/5 rounded-2xl border border-[#1B9AAA]/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1B9AAA]/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-[#1B9AAA]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">ملاحظة هامة</h4>
              <p className="text-gray-600">
                يمكن أن تتغير المواعيد. للتأكد من المواعيد المحدثة، يرجى التواصل
                معنا عبر الواتساب أو التليجرام.
              </p>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            آخر تحديث:{" "}
            <span className="font-semibold text-[#1B9AAA]">5 فبراير 2026</span>
          </p>
        </div>
      </div>
    </section>
  );
}
