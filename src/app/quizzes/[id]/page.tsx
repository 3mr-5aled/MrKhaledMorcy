"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizContainerRef = useRef<HTMLDivElement>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [params.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${params.id}`);
      if (!res.ok) {
        throw new Error("لم يتم العثور على الاختبار");
      }
      const data = await res.json();
      setQuiz(data);
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء تحميل الاختبار");
    } finally {
      setIsLoading(false);
    }
  };

  const getGoogleFormEmbedUrl = (url: string) => {
    // Convert regular Google Forms URL to embed URL
    if (url.includes("/viewform")) {
      return url.replace("/viewform", "/viewform?embedded=true");
    }
    return url;
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (quizContainerRef.current) {
          await quizContainerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFC43D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">خطأ</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFC43D] to-[#EF476F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            العودة إلى الاختبارات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Branding */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FFC43D] transition-colors"
              >
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="font-semibold">رجوع</span>
              </button>

              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">م</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900">
                    مستر خالد مرسي
                  </h1>
                  <p className="text-xs text-gray-500">معلم اللغة الإنجليزية</p>
                </div>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all"
                title={isFullscreen ? "إنهاء وضع ملء الشاشة" : "وضع ملء الشاشة"}
              >
                {isFullscreen ? (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
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
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {isFullscreen ? "إنهاء" : "ملء الشاشة"}
                </span>
              </button>

              {/* Quiz Info Badge */}
              {quiz.duration && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFC43D]/10 to-[#EF476F]/10 px-4 py-2 rounded-xl border border-[#FFC43D]/20">
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
                  <span className="font-semibold text-gray-700">
                    {quiz.duration} دقيقة
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Title Section */}
      <div className="bg-gradient-to-r from-[#FFC43D] to-[#EF476F] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-white/90 text-lg">{quiz.description}</p>
              )}
            </div>
          </div>

          {/* Quiz Meta Info */}
          <div className="flex flex-wrap gap-3 mt-4">
            {quiz.lesson && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="font-medium">
                  {quiz.lesson.unit.grade.name} - {quiz.lesson.unit.name}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">اختبار تفاعلي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Form Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          ref={quizContainerRef}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 relative"
        >
          {/* Exit Fullscreen Button - Only visible in fullscreen */}
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all font-semibold"
              title="إنهاء وضع ملء الشاشة"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>إنهاء ملء الشاشة</span>
            </button>
          )}

          {/* Instructions Banner */}
          <div className="bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 border-b border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center flex-shrink-0">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  تعليمات الاختبار
                </h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B9AAA]"></span>
                    اقرأ كل سؤال بعناية قبل الإجابة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B9AAA]"></span>
                    تأكد من إرسال إجاباتك قبل انتهاء الوقت
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B9AAA]"></span>
                    يمكنك العودة لمراجعة إجاباتك قبل الإرسال
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Google Form Iframe */}
          <div
            className="relative"
            style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
          >
            <iframe
              src={getGoogleFormEmbedUrl(quiz.googleFormUrl)}
              className="w-full h-full border-0"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
            >
              جاري التحميل...
            </iframe>
          </div>
        </div>

        {/* Help Footer */}
        <div className="mt-8 bg-gradient-to-br from-[#FFC43D]/10 to-[#EF476F]/10 rounded-3xl p-6 border border-[#FFC43D]/20">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                بحاجة للمساعدة؟
              </h3>
              <p className="text-gray-600">
                إذا واجهت أي مشكلة في الاختبار، تواصل معنا عبر واتساب
              </p>
            </div>
            <a
              href="https://wa.me/201023144722"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFC43D] to-[#EF476F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
