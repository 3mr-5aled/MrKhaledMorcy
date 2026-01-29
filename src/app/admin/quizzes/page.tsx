"use client";

import PageHeader from "@/components/admin/PageHeader";
import { getTimeRemaining } from "@/lib/dateUtils";
import showToast from "@/lib/toast";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    googleFormUrl: "",
    lessonId: "",
    categoryType: "LESSON" as "LESSON" | "UNIT_EXERCISE" | "EXAM" | "OTHER",
    customTitle: "",
    duration: null as number | null,
    order: 0,
    publishAt: null as Date | null,
    status: "DRAFT" as "DRAFT" | "SCHEDULED" | "PUBLISHED",
    isVisible: true,
  });

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesRes, gradesRes] = await Promise.all([
        fetch("/api/quizzes"),
        fetch("/api/grades"),
      ]);

      const [quizzesData, gradesData] = await Promise.all([
        quizzesRes.json(),
        gradesRes.json(),
      ]);

      setQuizzes(quizzesData);
      setGrades(gradesData);
    } catch (error) {
      showToast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = async (gradeId: string) => {
    setSelectedGrade(gradeId);
    setSelectedUnit("");
    setFormData({ ...formData, lessonId: "" });

    if (!gradeId) {
      setUnits([]);
      setLessons([]);
      return;
    }

    try {
      const res = await fetch(`/api/units?gradeId=${gradeId}`);
      const data = await res.json();
      setUnits(data);
      setLessons([]);
    } catch (error) {
      showToast.error("حدث خطأ أثناء جلب الوحدات");
    }
  };

  const handleUnitChange = async (unitId: string) => {
    setSelectedUnit(unitId);
    setFormData({ ...formData, lessonId: "" });

    if (!unitId) {
      setLessons([]);
      return;
    }

    try {
      const res = await fetch(`/api/lessons?unitId=${unitId}`);
      const data = await res.json();
      setLessons(data);
    } catch (error) {
      showToast.error("حدث خطأ أثناء جلب الدروس");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      googleFormUrl: "",
      lessonId: "",
      categoryType: "LESSON",
      customTitle: "",
      duration: null,
      order: 0,
      publishAt: null,
      status: "DRAFT",
      isVisible: true,
    });
    setSelectedGrade("");
    setSelectedUnit("");
    setUnits([]);
    setLessons([]);
    setEditingQuiz(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showToast.error("العنوان مطلوب");
      return;
    }

    if (!formData.googleFormUrl.trim()) {
      showToast.error("رابط Google Form مطلوب");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.googleFormUrl);
    } catch {
      showToast.error("رابط Google Form غير صالح");
      return;
    }

    const submitData = {
      ...formData,
      lessonId: formData.lessonId || null,
      customTitle:
        formData.categoryType === "OTHER" ? formData.customTitle : null,
      publishAt: formData.publishAt ? formData.publishAt.toISOString() : null,
    };

    try {
      const url = editingQuiz
        ? `/api/quizzes/${editingQuiz.id}`
        : "/api/quizzes";
      const method = editingQuiz ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "حدث خطأ");
      }

      showToast.success(
        editingQuiz ? "تم تحديث الاختبار بنجاح" : "تم إنشاء الاختبار بنجاح",
      );
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      showToast.error(error.message || "حدث خطأ أثناء حفظ الاختبار");
    }
  };

  const handleEdit = async (quiz: any) => {
    setEditingQuiz(quiz);

    // Load grade, unit, lessons if lesson is selected
    if (quiz.lessonId && quiz.lesson) {
      const gradeId = quiz.lesson.unit.gradeId;
      const unitId = quiz.lesson.unitId;

      setSelectedGrade(gradeId);
      const unitsRes = await fetch(`/api/units?gradeId=${gradeId}`);
      const unitsData = await unitsRes.json();
      setUnits(unitsData);

      setSelectedUnit(unitId);
      const lessonsRes = await fetch(`/api/lessons?unitId=${unitId}`);
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);
    }

    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      googleFormUrl: quiz.googleFormUrl,
      lessonId: quiz.lessonId || "",
      categoryType: quiz.categoryType,
      customTitle: quiz.customTitle || "",
      duration: quiz.duration,
      order: quiz.order,
      publishAt: quiz.publishAt ? new Date(quiz.publishAt) : null,
      status: quiz.status,
      isVisible: quiz.isVisible,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const res = await fetch(`/api/quizzes/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("فشل الحذف");

      showToast.success("تم حذف الاختبار بنجاح");
      setDeleteConfirm({ show: false, id: null });
      fetchData();
    } catch (error) {
      showToast.error("حدث خطأ أثناء حذف الاختبار");
    }
  };

  const handleShare = (quizId: string) => {
    const url = `${window.location.origin}/quizzes/${quizId}`;

    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: "اختبار",
          text: "شارك هذا الاختبار مع الطلاب",
          url: url,
        })
        .catch((error) => {
          // If share fails, fallback to copy
          copyToClipboard(url);
        });
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showToast.success("تم نسخ رابط الاختبار بنجاح!");
      },
      () => {
        showToast.error("فشل نسخ الرابط");
      },
    );
  };

  // Filter and pagination
  const filteredQuizzes = quizzes.filter((quiz: any) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !filterCategory || quiz.categoryType === filterCategory;
    const matchesStatus = !filterStatus || quiz.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getCategoryLabel = (category: string, customTitle?: string) => {
    switch (category) {
      case "LESSON":
        return "درس";
      case "UNIT_EXERCISE":
        return "تمارين وحدة";
      case "EXAM":
        return "امتحان";
      case "OTHER":
        return customTitle || "أخرى";
      default:
        return category;
    }
  };

  const getStatusBadge = (status: string, publishAt?: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700",
      SCHEDULED: "bg-[#FFC43D]/10 text-[#FFC43D]",
      PUBLISHED: "bg-[#06D6A0]/10 text-[#06D6A0]",
    };

    let label =
      status === "DRAFT" ? "مسودة" : status === "SCHEDULED" ? "مجدول" : "منشور";

    if (status === "SCHEDULED" && publishAt) {
      const remaining = getTimeRemaining(new Date(publishAt));
      label = remaining;
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status as keyof typeof colors]}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div>
      <PageHeader
        title="إدارة الاختبارات"
        description="إضافة وتعديل الاختبارات التفاعلية"
        action={
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            إضافة اختبار جديد
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
          >
            <option value="">كل الفئات</option>
            <option value="LESSON">درس</option>
            <option value="UNIT_EXERCISE">تمارين وحدة</option>
            <option value="EXAM">امتحان</option>
            <option value="OTHER">أخرى</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
          >
            <option value="">كل الحالات</option>
            <option value="DRAFT">مسودة</option>
            <option value="SCHEDULED">مجدول</option>
            <option value="PUBLISHED">منشور</option>
          </select>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  العنوان
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  الفئة
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  المدة
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  حالة النشر
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  المرحلة/الوحدة
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    جاري التحميل...
                  </td>
                </tr>
              ) : paginatedQuizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    لا توجد اختبارات
                  </td>
                </tr>
              ) : (
                paginatedQuizzes.map((quiz: any) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {quiz.title}
                      </div>
                      {quiz.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {quiz.description.substring(0, 60)}
                          {quiz.description.length > 60 && "..."}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getCategoryLabel(quiz.categoryType, quiz.customTitle)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quiz.duration ? `${quiz.duration} دقيقة` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(quiz.status, quiz.publishAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quiz.lesson
                        ? `${quiz.lesson.unit.grade.name} - ${quiz.lesson.unit.name}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(quiz)}
                          className="text-[#1B9AAA] hover:text-[#06D6A0] transition-colors"
                          title="تعديل"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleShare(quiz.id)}
                          className="text-[#9B59B6] hover:text-[#8E44AD] transition-colors"
                          title="مشاركة"
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
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, id: quiz.id })
                          }
                          className="text-[#EF476F] hover:text-red-600 transition-colors"
                          title="حذف"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        <a
                          href={quiz.googleFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FFC43D] hover:text-[#EF476F] transition-colors"
                          title="فتح النموذج"
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              صفحة {currentPage} من {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                السابق
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] p-6 text-white">
              <h2 className="text-2xl font-bold">
                {editingQuiz ? "تعديل الاختبار" : "إضافة اختبار جديد"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                />
              </div>

              {/* Google Form URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رابط Google Form *
                </label>
                <input
                  type="url"
                  value={formData.googleFormUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleFormUrl: e.target.value })
                  }
                  placeholder="https://docs.google.com/forms/d/..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Category Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نوع الفئة *
                </label>
                <select
                  value={formData.categoryType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryType: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                >
                  <option value="LESSON">درس</option>
                  <option value="UNIT_EXERCISE">تمارين على الوحدة</option>
                  <option value="EXAM">امتحان</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>

              {/* Custom Title (shown only for OTHER) */}
              {formData.categoryType === "OTHER" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    العنوان المخصص *
                  </label>
                  <input
                    type="text"
                    value={formData.customTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, customTitle: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    required
                  />
                </div>
              )}

              {/* Grade, Unit, Lesson Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المرحلة الدراسية
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  >
                    <option value="">-- اختياري --</option>
                    {grades.map((grade: any) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الوحدة
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    disabled={!selectedGrade}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">-- اختياري --</option>
                    {units.map((unit: any) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الدرس
                  </label>
                  <select
                    value={formData.lessonId}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonId: e.target.value })
                    }
                    disabled={!selectedUnit}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">-- اختياري --</option>
                    {lessons.map((lesson: any) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration and Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المدة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Publishing */}
              <div className="bg-[#FFC43D]/5 border border-[#FFC43D]/20 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-gray-900">إعدادات النشر</h3>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    حالة النشر
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  >
                    <option value="DRAFT">مسودة</option>
                    <option value="SCHEDULED">مجدول</option>
                    <option value="PUBLISHED">منشور</option>
                  </select>
                </div>

                {formData.status === "SCHEDULED" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      تاريخ النشر (توقيت مصر)
                    </label>
                    <DatePicker
                      selected={formData.publishAt}
                      onChange={(date: Date | null) =>
                        setFormData({ ...formData, publishAt: date })
                      }
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy-MM-dd h:mm aa"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                      placeholderText="اختر تاريخ ووقت النشر"
                      minDate={new Date()}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisible}
                    onChange={(e) =>
                      setFormData({ ...formData, isVisible: e.target.checked })
                    }
                    className="w-5 h-5 text-[#1B9AAA] border-gray-300 rounded focus:ring-[#1B9AAA]"
                  />
                  <label htmlFor="isVisible" className="text-sm text-gray-700">
                    مرئي للطلاب
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {editingQuiz ? "تحديث الاختبار" : "إنشاء الاختبار"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm({ show: false, id: null })}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-[#EF476F]/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#EF476F]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 text-center mb-6">
              هل أنت متأكد من حذف هذا الاختبار؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-[#EF476F] text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
