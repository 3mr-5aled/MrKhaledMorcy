const services = [
  {
    icon: (
      <svg
        className="w-12 h-12"
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
    title: "حصص لايف عبر الزووم",
    description:
      "حصص تفاعلية مباشرة عبر تطبيق Zoom مع إمكانية السؤال والمناقشة في الوقت الفعلي",
    features: ["تفاعل مباشر", "شرح تفصيلي", "إجابة الأسئلة فوراً"],
    color: "#1B9AAA",
    bgGradient: "from-[#1B9AAA]/10 to-[#1B9AAA]/5",
  },
  {
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "حصص مسجلة",
    description:
      "مكتبة ضخمة من الحصص المسجلة بجودة عالية يمكنك مشاهدتها في أي وقت ومن أي مكان",
    features: ["متاحة 24/7", "جودة HD", "إعادة المشاهدة"],
    color: "#06D6A0",
    bgGradient: "from-[#06D6A0]/10 to-[#06D6A0]/5",
  },
  {
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    title: "حصص أوفلاين بالسنتر",
    description:
      "حصص حضورية في السنتر مع بيئة تعليمية محفزة وتفاعل مباشر مع المدرس والزملاء",
    features: ["بيئة تفاعلية", "متابعة شخصية", "أنشطة جماعية"],
    color: "#EF476F",
    bgGradient: "from-[#EF476F]/10 to-[#EF476F]/5",
  },
];

export default function Services() {
  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#06D6A0]/10 text-[#06D6A0] rounded-full text-sm font-semibold mb-4">
            الخدمات
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            طرق متعددة للتعلم
          </h2>
          <p className="text-lg text-gray-600">
            اختر الطريقة المناسبة لك من بين مجموعة متنوعة من خيارات التعلم
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${service.bgGradient} rounded-3xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 card-hover group`}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${service.color}20`,
                  color: service.color,
                }}
              >
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke={service.color}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Decorative element */}
              <div
                className="absolute top-4 left-4 w-20 h-20 rounded-full opacity-10"
                style={{ backgroundColor: service.color }}
              ></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="https://wa.me/201023144722"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1B9AAA] text-white rounded-full font-bold hover:bg-[#157a87] transition-all hover:scale-105 shadow-lg shadow-[#1B9AAA]/30"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            احجز حصتك الآن
          </a>
        </div>
      </div>
    </section>
  );
}
