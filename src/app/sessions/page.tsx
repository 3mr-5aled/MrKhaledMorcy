"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type RedeemedSession = {
  title: string;
  description?: string | null;
  grade: string;
  formattedSessionDateTime: string;
  sessionLink: string | null;
  whatsappLink?: string | null;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function SessionsContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<RedeemedSession | null>(null);

  const handleCheckIn = useCallback(async (targetCode: string) => {
    setError("");
    setSession(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/sessions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "الكود غير صحيح");
      }

      setSession(data);
    } catch (error) {
      setError(getErrorMessage(error, "الكود غير صحيح"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      const sanitized = codeParam.trim().toUpperCase();
      setCode(sanitized);
      handleCheckIn(sanitized);
    }
  }, [searchParams, handleCheckIn]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!code.trim()) {
      setError("اكتب الكود هنا");
      return;
    }

    await handleCheckIn(code.trim());
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="text-center max-w-2xl mx-auto mb-10">
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            الحصص المباشرة
          </h1>
          <p className="text-lg text-gray-600">
            اكتب كود الحصة عشان تدخل على بيانات الحصة والرابط لما يفتح.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <label className="block text-sm font-bold text-gray-700 mb-3">
            كود الحصة
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="اكتب الكود هنا"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none text-left disabled:opacity-50 disabled:cursor-not-allowed"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-60"
            >
              {isLoading ? "جاري الدخول..." : "دخول"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm font-semibold text-[#EF476F]">
              {error}
            </p>
          )}
        </form>

        {session && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {session.title}
                </h2>
                {session.description && (
                  <p className="text-gray-600">{session.description}</p>
                )}
              </div>
              <span className="px-3 py-1 rounded-full bg-[#06D6A0]/10 text-[#059669] text-sm font-bold whitespace-nowrap">
                تم تسجيل الحضور
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">الصف الدراسي</p>
                <p className="font-bold text-gray-900">{session.grade}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">ميعاد الحصة</p>
                <p className="font-bold text-gray-900">
                  {session.formattedSessionDateTime}
                </p>
              </div>
            </div>

            {session.whatsappLink && (
              <div className="mb-6 rounded-2xl border-2 border-[#25D366]/30 bg-[#25D366]/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-md">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">مجموعة الواتساب للمراجعة</h3>
                    <p className="text-xs sm:text-sm text-gray-500">اشترك الآن في جروب الواتساب لمتابعة حصص المراجعة النهائية</p>
                  </div>
                </div>
                <a
                  href={session.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba56] text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap text-sm"
                >
                  <span>دخول الجروب</span>
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </a>
              </div>
            )}

            {session.sessionLink ? (
              <div className="mb-6 rounded-2xl border-2 border-[#1B9AAA]/30 bg-[#1B9AAA]/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center text-white shrink-0 shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">رابط الحصة المباشرة</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">الحصة بدأت الآن، اضغط على الزر للانضمام والتفاعل</p>
                  </div>
                </div>
                <a
                  href={session.sessionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] hover:shadow-lg text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-all whitespace-nowrap text-sm cursor-pointer"
                >
                  <span>دخول الحصة</span>
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border-2 border-[#FFC43D]/30 bg-[#FFC43D]/5 p-5 flex flex-col sm:flex-row items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-[#FFC43D] flex items-center justify-center text-white shrink-0 shadow-md">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">رابط الحصة لم يفتح بعد</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">رابط الحصة هيتفتح تلقائياً قبل معاد الحصة بـ 20 دقيقة.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          جاري التحميل...
        </div>
      }
    >
      <SessionsContent />
    </Suspense>
  );
}
