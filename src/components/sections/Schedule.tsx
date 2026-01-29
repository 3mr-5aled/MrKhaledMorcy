"use client";

import scheduleData from "@/data/schedule.json";
import { useState } from "react";

type GradeSession = {
  center: string;
  hall: string;
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
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {session.center}
                    </h3>
                    <p className="text-gray-500 text-sm">{session.hall}</p>
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
                      ? "bg-[#EF476F] text-white hover:bg-[#d63a5c] hover:scale-105"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => !session.location && e.preventDefault()}
                >
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
            <span className="font-semibold text-[#1B9AAA]">27 يناير 2026</span>
          </p>
        </div>
      </div>
    </section>
  );
}
