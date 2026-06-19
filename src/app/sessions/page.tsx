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
                      className="w-7 h-7"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.909-6.996-1.878-1.879-4.361-2.914-6.998-2.915-5.443 0-9.869 4.42-9.873 9.863-.001 1.705.452 3.37 1.31 4.8l-.348 1.272 1.32-.346zm11.3-3.486c-.274-.137-1.62-.8-1.87-.891-.252-.093-.437-.137-.62.137-.183.274-.707.891-.868 1.074-.16.183-.32.206-.594.069-.274-.137-1.158-.427-2.208-1.363-.817-.729-1.37-1.63-1.53-1.905-.16-.274-.017-.422.12-.558.124-.122.274-.32.411-.48.137-.16.183-.274.274-.457.09-.183.046-.343-.023-.48-.069-.137-.62-1.492-.85-2.043-.224-.54-.47-.466-.62-.474-.15-.008-.32-.01-.49-.01-.17 0-.447.064-.68.32-.233.256-.89.87-8.9 2.122 0 1.25.045 2.457.172 2.64.127.184.274.207.548.344zm0 0" />
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
              <a
                href={session.sessionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-[#FFC43D] to-[#EF476F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                رابط الحصة
              </a>
            ) : (
              <div className="rounded-xl border border-[#FFC43D]/30 bg-[#FFC43D]/10 p-4 text-gray-800 font-semibold">
                رابط الحصة هيتفتح قبل معاد الحصة بـ 20 دقيقة.
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
