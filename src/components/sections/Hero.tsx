import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B9AAA]/5 via-white to-[#06D6A0]/5"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#1B9AAA]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#06D6A0]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFC43D]/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Profile Image */}
          <div className="relative animate-float">
            <div className="w-96 h-96 sm:w-[450px] sm:h-[450px] lg:w-[550px] lg:h-[550px] relative">
              <Image
                src="/images/profile-picture.png"
                alt="مستر خالد مرسي"
                fill
                sizes="(max-width: 640px) 384px, (max-width: 1024px) 450px, 550px"
                className="object-contain"
                priority
                suppressHydrationWarning
              />
              {/* Badge */}
              <div className="absolute bottom-8 right-8 bg-white rounded-full px-6 py-3 shadow-xl flex items-center gap-3 z-10">
                <div className="w-3 h-3 bg-[#06D6A0] rounded-full animate-pulse"></div>
                <span className="text-base font-semibold text-gray-700">
                  26 سنة خبرة
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-right flex-1 space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-4 py-2 bg-[#1B9AAA]/10 text-[#1B9AAA] rounded-full text-sm font-semibold">
                مدرس لغة إنجليزية معتمد
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              مستر <span className="gradient-text">خالد مرسي</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 font-medium flex items-center justify-center lg:justify-start gap-3">
              <svg
                className="w-6 h-6 text-[#FFC43D]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              مدرس معتمد من جامعة Cambridge البريطانية
            </p>

            <p className="text-lg text-gray-500 max-w-xl mx-auto lg:mx-0">
              متخصص في تدريس اللغة الإنجليزية للمراحل الإعدادية والثانوية بأحدث
              طرق التعليم التفاعلي
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="https://wa.me/201023144722"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#20bd5a] transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                واتساب
              </a>

              <a
                href="https://t.me/Khaled_Morcy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-[#0088cc] text-white rounded-full font-semibold hover:bg-[#0077b5] transition-all hover:scale-105 shadow-lg shadow-[#0088cc]/30"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                تليجرام
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1B9AAA]">26+</div>
                <div className="text-sm text-gray-500">سنة خبرة</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06D6A0]">1000+</div>
                <div className="text-sm text-gray-500">طالب متفوق</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFC43D]">5+</div>
                <div className="text-sm text-gray-500">شهادات دولية</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-gray-400 hover:text-[#1B9AAA] transition-colors"
        >
          <span className="text-sm">اكتشف المزيد</span>
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
