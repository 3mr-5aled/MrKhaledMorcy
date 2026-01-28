const credentials = [
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "خبرة 26 سنة",
    description: "تدريس بالمدارس الحكومية والخاصة والجامعات الخاصة",
    color: "#1B9AAA",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
        />
      </svg>
    ),
    title: "كلية التربية",
    description: "خريج كلية تربية قسم اللغة الإنجليزية",
    color: "#06D6A0",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    title: "شهادة CELTA",
    description: "معتمد من جامعة Cambridge البريطانية",
    color: "#EF476F",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "مدرب TOT معتمد",
    description: "مدرب تنمية بشرية معتمد دولياً من جامعة عين شمس",
    color: "#FFC43D",
  },
  {
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
    ),
    title: "شهادات IELTS",
    description: "حاصل على شهادات IELTS من British Council",
    color: "#1B9AAA",
  },
];

export default function About() {
  return (
    <section id="about" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#1B9AAA]/10 text-[#1B9AAA] rounded-full text-sm font-semibold mb-4">
            من أنا
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            خبرة وشهادات دولية في تعليم اللغة الإنجليزية
          </h2>
          <p className="text-lg text-gray-600">
            أكثر من ربع قرن من التفاني في تعليم اللغة الإنجليزية بأحدث الطرق
            العلمية والتفاعلية
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((credential, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-gray-100"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${credential.color}15`,
                  color: credential.color,
                }}
              >
                {credential.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {credential.title}
              </h3>
              <p className="text-gray-600">{credential.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-right">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                رسالتي في التعليم
              </h3>
              <p className="text-white/90 text-lg leading-relaxed">
                أؤمن بأن كل طالب يستحق تعليماً متميزاً يناسب قدراته ويطور
                مهاراته. هدفي هو جعل تعلم اللغة الإنجليزية تجربة ممتعة ومثمرة
                تفتح آفاقاً جديدة للطلاب.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#contact"
                className="px-8 py-4 bg-white text-[#1B9AAA] rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
              >
                تواصل معي
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
