"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuizzesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [grades, setGrades] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    // Load grade and unit from URL parameters
    const gradeParam = searchParams.get("grade");
    const unitParam = searchParams.get("unit");

    if (gradeParam && grades.length > 0) {
      const loadData = async () => {
        const fetchedUnits = await handleGradeSelect(gradeParam, false);
        if (unitParam && fetchedUnits) {
          // Find the unit in the fetched units
          const unit = fetchedUnits.find((u: any) => u.slug === unitParam);
          if (unit) {
            handleUnitSelect(unitParam, false, fetchedUnits);
          }
        }
      };
      loadData();
    }
  }, [searchParams, grades]);

  const fetchGrades = async () => {
    try {
      const res = await fetch("/api/grades");
      const data = await res.json();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSelect = async (gradeSlug: string, updateUrl = true) => {
    const grade = grades.find((g) => g.slug === gradeSlug);
    if (!grade) return;

    setSelectedGrade(grade.id);
    setSelectedUnit("");
    setQuizzes([]);

    if (updateUrl) {
      const params = new URLSearchParams();
      if (gradeSlug) params.set("grade", gradeSlug);
      router.push(`/quizzes?${params.toString()}`, { scroll: false });
    }

    try {
      const res = await fetch(`/api/units?gradeId=${grade.id}`);
      const data = await res.json();
      setUnits(data);
      return data; // Return the units data
    } catch (error) {
      console.error("Error fetching units:", error);
      return [];
    }
  };

  const handleUnitSelect = async (
    unitSlug: string,
    updateUrl = true,
    unitsArray?: any[],
  ) => {
    // Use provided units array or fall back to state
    const availableUnits = unitsArray || units;
    const unit = availableUnits.find((u) => u.slug === unitSlug);
    if (!unit) return;

    setSelectedUnit(unit.id);

    if (updateUrl && selectedGrade) {
      const selectedGradeObj = grades.find((g) => g.id === selectedGrade);
      const params = new URLSearchParams();
      if (selectedGradeObj) params.set("grade", selectedGradeObj.slug);
      if (unitSlug) params.set("unit", unitSlug);
      router.push(`/quizzes?${params.toString()}`, { scroll: false });
    }

    try {
      const res = await fetch(`/api/quizzes?unitId=${unit.id}`);
      const data = await res.json();

      // Client-side filtering to ensure only published and visible quizzes are shown
      const publishedQuizzes = data.filter(
        (quiz: any) => quiz.status === "PUBLISHED" && quiz.isVisible === true,
      );

      setQuizzes(publishedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const groupedQuizzes = quizzes
    .filter(
      (quiz: any) => quiz.status === "PUBLISHED" && quiz.isVisible === true,
    )
    .reduce((acc: any, quiz: any) => {
      const category = quiz.categoryType;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(quiz);
      return acc;
    }, {});

  const getCategoryTitle = (category: string, quiz?: any) => {
    switch (category) {
      case "LESSON":
        return "اختبارات الدروس";
      case "UNIT_EXERCISE":
        return "اختبارات على الوحدة";
      case "EXAM":
        return "امتحانات";
      case "OTHER":
        return quiz?.customTitle || "أخرى";
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EF476F] transition-colors mb-8"
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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-20 h-20 rounded-2xl bg-[#FFC43D]/10 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[#FFC43D]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            الاختبارات التفاعلية
          </h1>
          <p className="text-lg text-gray-600">
            اختر المرحلة الدراسية ثم الوحدة للوصول إلى الاختبارات
          </p>
        </div>

        {/* Grade and Unit Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              اختر المرحلة الدراسية
            </label>
            <select
              value={grades.find((g) => g.id === selectedGrade)?.slug || ""}
              onChange={(e) => handleGradeSelect(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none transition-all"
            >
              <option value="">-- اختر المرحلة --</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.slug}>
                  {grade.name} - {grade.stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              اختر الوحدة
            </label>
            <select
              value={units.find((u) => u.id === selectedUnit)?.slug || ""}
              onChange={(e) => handleUnitSelect(e.target.value)}
              disabled={!selectedGrade}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- اختر الوحدة --</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.slug}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quizzes Display */}
        {selectedUnit && quizzes.length > 0 && (
          <div className="space-y-8">
            {Object.keys(groupedQuizzes).map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {getCategoryTitle(category, groupedQuizzes[category][0])}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedQuizzes[category]
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((quiz: any) => (
                      <div
                        key={quiz.id}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 flex-1">
                            {quiz.title}
                          </h3>
                          {quiz.duration && (
                            <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg mr-2">
                              <svg
                                className="w-4 h-4"
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
                              {quiz.duration} دقيقة
                            </span>
                          )}
                        </div>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 mb-4">
                            {quiz.description}
                          </p>
                        )}

                        <Link
                          href={`/quizzes/${quiz.id}`}
                          className="w-full inline-flex items-center gap-2 bg-gradient-to-r from-[#FFC43D] to-[#EF476F] text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all justify-center"
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          ابدأ الاختبار
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUnit && quizzes.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد اختبارات متاحة
            </h3>
            <p className="text-gray-600">
              لم يتم إضافة اختبارات لهذه الوحدة بعد. تحقق لاحقاً!
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-br from-[#FFC43D]/10 to-[#EF476F]/10 rounded-3xl p-8 border border-[#FFC43D]/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                بحاجة للمساعدة؟
              </h3>
              <p className="text-gray-600 mb-4">
                إذا كنت بحاجة لمساعدة في الوصول إلى الاختبارات أو لديك أي
                استفسار، تواصل معنا عبر واتساب
              </p>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFC43D] to-[#EF476F] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                تواصل معنا
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
