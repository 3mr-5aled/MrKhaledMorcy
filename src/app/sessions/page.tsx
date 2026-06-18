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
