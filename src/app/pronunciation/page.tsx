import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "نطق الكلمات | مستر خالد مرسي",
  description: "تعلم النطق الصحيح للكلمات الإنجليزية مع مستر خالد مرسي",
};

const grades = [
  {
    id: "prep-1",
    name: "أولى إعدادي",
    stage: "المرحلة الإعدادية",
    color: "#1B9AAA",
  },
  {
    id: "prep-2",
    name: "تانية إعدادي",
    stage: "المرحلة الإعدادية",
    color: "#1B9AAA",
  },
  {
    id: "prep-3",
    name: "تالتة إعدادي",
    stage: "المرحلة الإعدادية",
    color: "#1B9AAA",
  },
  {
    id: "sec-1",
    name: "أولى ثانوي",
    stage: "المرحلة الثانوية",
    color: "#06D6A0",
  },
  {
    id: "sec-2",
    name: "تانية ثانوي",
    stage: "المرحلة الثانوية",
    color: "#06D6A0",
  },
  {
    id: "sec-3",
    name: "تالتة ثانوي",
    stage: "المرحلة الثانوية",
    color: "#06D6A0",
  },
];

export default function PronunciationPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B9AAA] transition-colors mb-8"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span>العودة للرئيسية</span>
        </Link>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#1B9AAA]/10 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[#1B9AAA]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            نطق الكلمات
          </h1>
          <p className="text-lg text-gray-600">
            اختر صفك الدراسي لتعلم النطق الصحيح للكلمات الإنجليزية
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-br from-[#FFC43D]/10 to-[#FFC43D]/5 rounded-3xl p-8 mb-12 border border-[#FFC43D]/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFC43D]/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-7 h-7 text-[#FFC43D]"
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
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">قريباً</h3>
              <p className="text-gray-600">
                يتم حالياً إعداد دروس النطق التفاعلية. ترقبوا التحديثات قريباً!
              </p>
            </div>
          </div>
        </div>

        {/* Grades Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 card-hover border border-gray-100 opacity-60 cursor-not-allowed"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${grade.color}15` }}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke={grade.color}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>

              <span
                className="text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block"
                style={{
                  backgroundColor: `${grade.color}15`,
                  color: grade.color,
                }}
              >
                {grade.stage}
              </span>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {grade.name}
              </h3>

              <p className="text-gray-500 text-sm mb-4">
                دروس النطق ستكون متاحة قريباً
              </p>

              <div className="w-full py-3 rounded-xl text-center font-semibold text-gray-400 bg-gray-100">
                قريباً
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">هل تحتاج مساعدة أو لديك استفسار؟</p>
          <a
            href="https://wa.me/201023144722"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#20bd5a] transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>تواصل عبر واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
}
