import Link from "next/link";

const quickLinks = [
  {
    href: "/sessions",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "الحصص المباشرة",
    description: "ادخل بكود الحصة وقت اللايف",
    color: "#FFC43D",
    bgGradient: "from-[#FFC43D] to-[#d9a328]",
    external: false,
  },
  {
    href: "/quizzes",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    title: "الاختبارات",
    description: "اختبر نفسك وقيّم مستواك",
    color: "#1B9AAA",
    bgGradient: "from-[#1B9AAA] to-[#157a87]",
    external: false,
  },
  {
    href: "https://sema3ny.vercel.app/",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 14a2 2 0 100-4 2 2 0 000 4z"
        />
      </svg>
    ),
    title: "نطق الكلمات",
    description: "استمع للنطق الصحيح للكلمات",
    color: "#06D6A0",
    bgGradient: "from-[#06D6A0] to-[#05b588]",
    external: true,
  },
  {
    href: "/answers",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "إجابات الكتب",
    description: "إجابات الكتب والامتحانات",
    color: "#EF476F",
    bgGradient: "from-[#EF476F] to-[#d63a5c]",
    external: false,
  },
];

export default function QuickLinks() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#EF476F]/10 text-[#EF476F] rounded-full text-sm font-semibold mb-4">
            روابط سريعة
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            أدوات مساعدة للطلاب
          </h2>
          <p className="text-lg text-gray-600">
            مصادر تعليمية إضافية لمساعدتك في رحلة التعلم
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, index) => {
            const Component = link.external ? "a" : Link;
            const extraProps = link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Component
                key={index}
                href={link.href}
                {...extraProps}
                className="group relative overflow-hidden rounded-3xl p-8 text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${link.color}, ${link.color}dd)`,
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <pattern
                        id={`pattern-${index}`}
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="10" cy="10" r="2" fill="white" />
                      </pattern>
                    </defs>
                    <rect
                      width="100"
                      height="100"
                      fill={`url(#pattern-${index})`}
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </div>

                  {/* Text */}
                  <h3 className="text-2xl font-bold mb-2">{link.title}</h3>
                  <p className="text-white/80">{link.description}</p>

                  {/* Arrow */}
                  <div className="mt-6 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <span>{link.external ? "افتح الموقع" : "اذهب الآن"}</span>
                    <svg
                      className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500"></div>
              </Component>
            );
          })}
        </div>
      </div>
    </section>
  );
}
