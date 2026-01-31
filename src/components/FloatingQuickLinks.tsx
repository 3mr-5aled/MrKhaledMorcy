"use client";

import Link from "next/link";

export default function FloatingQuickLinks() {
  const links = [
    {
      id: "quizzes",
      href: "/quizzes",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      label: "الاختبارات",
      color: "#1B9AAA",
    },
    {
      id: "pronunciation",
      href: "https://sema3ny.vercel.app/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
      label: "نطق الكلمات",
      color: "#06D6A0",
    },
    {
      id: "answers",
      href: "/answers",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      label: "اجابات الكتب",
      color: "#EF476F",
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 space-y-3">
        {/* Header */}
        <div className="text-center pb-2 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-700 whitespace-nowrap">
            روابط سريعة
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          {/* Link Buttons */}
          {links.map((link) => (
            <div key={link.id} className="group relative">
              <Link
                href={link.href}
                {...(link.id === "pronunciation" && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className="w-12 h-12 flex items-center justify-center rounded-xl text-white hover:shadow-lg hover:scale-110 transition-all duration-300"
                style={{
                  background: `linear-gradient(to bottom right, ${link.color}, ${link.color}dd)`,
                }}
                aria-label={link.label}
              >
                {link.icon}
              </Link>

              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <div className="bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                  {link.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
