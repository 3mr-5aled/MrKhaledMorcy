"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AnswersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [grades, setGrades] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    setAnswers([]);

    if (updateUrl) {
      const params = new URLSearchParams();
      if (gradeSlug) params.set("grade", gradeSlug);
      router.push(`/answers?${params.toString()}`, { scroll: false });
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
      router.push(`/answers?${params.toString()}`, { scroll: false });
    }

    try {
      const res = await fetch(`/api/answers?unitId=${unit.id}`);
      const data = await res.json();

      // Client-side filtering to ensure only published and visible answers are shown
      const publishedAnswers = data.filter(
        (answer: any) =>
          answer.status === "PUBLISHED" && answer.isVisible === true,
      );

      setAnswers(publishedAnswers);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const groupedAnswers = answers
    .filter(
      (answer: any) =>
        answer.status === "PUBLISHED" && answer.isVisible === true,
    )
    .reduce((acc: any, answer: any) => {
      const category = answer.categoryType;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(answer);
      return acc;
    }, {});

  const getCategoryTitle = (category: string, answer?: any) => {
    switch (category) {
      case "LESSON":
        return "إجابات الدروس";
      case "UNIT_EXERCISE":
        return "تمارين على الوحدة";
      case "EXAM":
        return "امتحانات";
      case "OTHER":
        return answer?.customTitle || "أخرى";
      default:
        return category;
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
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
          <div className="w-20 h-20 rounded-2xl bg-[#EF476F]/10 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[#EF476F]"
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
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            إجابات الكتب والامتحانات
          </h1>
          <p className="text-lg text-gray-600">
            اختر المرحلة الدراسية ثم الوحدة للوصول إلى الإجابات
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

        {/* Answers Display */}
        {selectedUnit && answers.length > 0 && (
          <div className="space-y-8">
            {Object.keys(groupedAnswers).map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {getCategoryTitle(category, groupedAnswers[category][0])}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedAnswers[category]
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((answer: any) => (
                      <div
                        key={answer.id}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {answer.title}
                        </h3>
                        {answer.description && (
                          <p className="text-sm text-gray-600 mb-4">
                            {answer.description}
                          </p>
                        )}

                        <div className="flex flex-col gap-2">
                          {answer.type === "PDF" && (
                            <a
                              href={answer.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EF476F] to-[#FFC43D] text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all justify-center"
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
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                              </svg>
                              تحميل PDF
                            </a>
                          )}

                          {answer.type === "DRIVE" && answer.driveUrl && (
                            <a
                              href={answer.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all justify-center"
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
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              فتح Google Drive
                            </a>
                          )}

                          {answer.driveUrl && answer.type !== "DRIVE" && (
                            <a
                              href={answer.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all justify-center"
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
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              فتح Google Drive
                            </a>
                          )}
                        </div>

                        {answer.type === "IMAGE" && (
                          <div className="space-y-3">
                            {answer.images && answer.images.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {answer.images.map(
                                  (imagePath: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="relative h-32 rounded-xl overflow-hidden cursor-pointer group"
                                      onClick={() =>
                                        setSelectedImage(imagePath)
                                      }
                                    >
                                      <Image
                                        src={
                                          answer.thumbnails?.[idx] || imagePath
                                        }
                                        alt={`${answer.title} - صورة ${idx + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                        <svg
                                          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <div
                                className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => setSelectedImage(answer.url)}
                              >
                                <Image
                                  src={answer.url}
                                  alt={answer.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                  <svg
                                    className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {answer.type === "YOUTUBE" && (
                          <div className="relative h-48 rounded-xl overflow-hidden">
                            <iframe
                              src={getYouTubeEmbedUrl(answer.url)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUnit && answers.length === 0 && (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد إجابات متاحة
            </h3>
            <p className="text-gray-600">
              لم يتم إضافة إجابات لهذه الوحدة بعد. تحقق لاحقاً!
            </p>
          </div>
        )}

        {/* Image Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <Image
                src={selectedImage}
                alt="Answer"
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-br from-[#1B9AAA]/10 to-[#06D6A0]/10 rounded-3xl p-8 border border-[#1B9AAA]/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                بحاجة للمساعدة؟
              </h3>
              <p className="text-gray-600 mb-4">
                إذا كنت بحاجة لمساعدة في الوصول إلى الإجابات أو لديك أي استفسار،
                تواصل معنا عبر واتساب
              </p>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
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

export default function AnswersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AnswersContent />
    </Suspense>
  );
}
