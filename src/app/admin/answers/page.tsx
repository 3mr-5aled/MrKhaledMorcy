"use client";

import PageHeader from "@/components/admin/PageHeader";
import { formatEgyptDate, getTimeRemaining } from "@/lib/dateUtils";
import showToast from "@/lib/toast";
import Image from "next/image";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminAnswersPage() {
  const [answers, setAnswers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });

  const [previewModal, setPreviewModal] = useState<{
    show: boolean;
    type: "PDF" | "IMAGE" | "YOUTUBE" | null;
    url: string;
    images: string[];
    title: string;
  }>({ show: false, type: null, url: "", images: [], title: "" });

  const [imageLightbox, setImageLightbox] = useState<{
    show: boolean;
    imagePath: string;
  }>({ show: false, imagePath: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PDF" as "PDF" | "IMAGE" | "YOUTUBE" | "DRIVE",
    url: "",
    images: [] as string[],
    thumbnails: [] as string[],
    driveUrl: "",
    lessonId: "",
    categoryType: "LESSON" as "LESSON" | "UNIT_EXERCISE" | "EXAM" | "OTHER",
    customTitle: "",
    order: 0,
    publishAt: null as Date | null,
    status: "DRAFT" as "DRAFT" | "SCHEDULED" | "PUBLISHED",
    isVisible: true,
  });

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const itemsPerPage = 10;

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [answersRes, gradesRes] = await Promise.all([
        fetch("/api/answers"),
        fetch("/api/grades"),
      ]);

      const [answersData, gradesData] = await Promise.all([
        answersRes.json(),
        gradesRes.json(),
      ]);

      setAnswers(answersData);
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

    if (gradeId) {
      const res = await fetch(`/api/units?gradeId=${gradeId}`);
      const data = await res.json();
      setUnits(data);
    } else {
      setUnits([]);
      setLessons([]);
    }
  };

  const handleUnitChange = async (unitId: string) => {
    setSelectedUnit(unitId);
    setFormData({ ...formData, lessonId: "" });

    if (unitId) {
      const res = await fetch(`/api/lessons?unitId=${unitId}`);
      const data = await res.json();
      setLessons(data);
    } else {
      setLessons([]);
    }
  };

  const handleFileUpload = async (file: File) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("gradeId", selectedGrade);
    uploadFormData.append("unitId", selectedUnit);
    uploadFormData.append("type", formData.type === "PDF" ? "pdf" : "image");

    try {
      setUploadProgress(0);

      // Simulate progress (since fetch doesn't support upload progress directly)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل رفع الملف");
      }

      // For IMAGE type, add to images array; for PDF/YOUTUBE, use url
      if (formData.type === "IMAGE") {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.path],
          thumbnails: [...prev.thumbnails, data.thumbnail || data.path],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          url: data.path,
        }));
      }

      showToast.success("تم رفع الملف بنجاح");

      // Reset progress after 1 second
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      setUploadProgress(0);
      showToast.error(error.message || "حدث خطأ أثناء رفع الملف");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingAnswer ? "PUT" : "POST";
      const url = editingAnswer
        ? `/api/answers/${editingAnswer.id}`
        : "/api/answers";

      // Convert publishAt to ISO string for API
      const submitData = {
        ...formData,
        publishAt: formData.publishAt ? formData.publishAt.toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الإجابة");
      }

      showToast.success(
        editingAnswer ? "تم تحديث الإجابة بنجاح" : "تم إضافة الإجابة بنجاح",
      );
      setShowForm(false);
      setEditingAnswer(null);
      fetchData();
      resetForm();
    } catch (error: any) {
      showToast.error(error.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "PDF",
      url: "",
      images: [],
      thumbnails: [],
      driveUrl: "",
      lessonId: "",
      categoryType: "LESSON",
      customTitle: "",
      order: 0,
      publishAt: null,
      status: "DRAFT",
      isVisible: true,
    });
    setSelectedGrade("");
    setSelectedUnit("");
  };

  const handleDelete = async (id: string) => {
    try {
      await showToast.promise(
        fetch(`/api/answers/${id}`, { method: "DELETE" }),
        {
          loading: "جاري الحذف...",
          success: "تم حذف الإجابة بنجاح",
          error: "فشل حذف الإجابة",
        },
      );
      fetchData();
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = async (answer: any) => {
    setEditingAnswer(answer);

    // Load the grade and unit for the answer's lesson
    const gradeId = answer.lesson?.unit?.gradeId;
    const unitId = answer.lesson?.unitId;

    if (gradeId) {
      setSelectedGrade(gradeId);
      const unitsRes = await fetch(`/api/units?gradeId=${gradeId}`);
      const unitsData = await unitsRes.json();
      setUnits(unitsData);
    }

    if (unitId) {
      setSelectedUnit(unitId);
      const lessonsRes = await fetch(`/api/lessons?unitId=${unitId}`);
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);
    }

    setFormData({
      title: answer.title,
      description: answer.description || "",
      type: answer.type,
      url: answer.url,
      images: answer.images || [],
      thumbnails: answer.thumbnails || [],
      driveUrl: answer.driveUrl || "",
      lessonId: answer.lessonId || "",
      categoryType: answer.categoryType,
      customTitle: answer.customTitle || "",
      order: answer.order,
      publishAt: answer.publishAt ? new Date(answer.publishAt) : null,
      status: answer.status || "DRAFT",
      isVisible: answer.isVisible !== undefined ? answer.isVisible : true,
    });
    setShowForm(true);
  };

  // Filter and pagination logic
  const getFilteredAnswers = () => {
    const filtered = answers.filter((answer: any) => {
      const matchesSearch =
        answer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        answer.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || answer.type === filterType;
      const matchesCategory =
        !filterCategory || answer.categoryType === filterCategory;
      const matchesStatus = !filterStatus || answer.status === filterStatus;
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
    return filtered;
  };

  const getPaginatedAnswers = () => {
    const filtered = getFilteredAnswers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredAnswers().length / itemsPerPage);

  if (isLoading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div>
      <PageHeader
        title="إدارة الإجابات"
        description="إضافة وإدارة إجابات الدروس والامتحانات"
        action={
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingAnswer(null);
                resetForm();
              }
            }}
            className="bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            {showForm ? "إلغاء" : "+ إضافة إجابة جديدة"}
          </button>
        }
      />

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => {
            setShowForm(false);
            setEditingAnswer(null);
            resetForm();
          }}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAnswer ? "تعديل الإجابة" : "إضافة إجابة جديدة"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAnswer(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    نوع الفئة
                  </label>
                  <select
                    value={formData.categoryType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    required
                  >
                    <option value="LESSON">درس</option>
                    <option value="UNIT_EXERCISE">تمارين على الوحدة</option>
                    <option value="EXAM">امتحان</option>
                    <option value="OTHER">أخرى (مخصص)</option>
                  </select>
                </div>
              </div>

              {formData.categoryType === "OTHER" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    عنوان مخصص
                  </label>
                  <input
                    type="text"
                    value={formData.customTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, customTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    placeholder="مثال: تمارين على الوحدة 1 و 2 و 3"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المرحلة الدراسية
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    required
                  >
                    <option value="">اختر المرحلة</option>
                    {grades.map((grade: any) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الوحدة
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    disabled={!selectedGrade}
                    required
                  >
                    <option value="">اختر الوحدة</option>
                    {units.map((unit: any) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الدرس
                  </label>
                  <select
                    value={formData.lessonId}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    disabled={!selectedUnit}
                  >
                    <option value="">اختر الدرس (اختياري)</option>
                    {lessons.map((lesson: any) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نوع الإجابة
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  required
                >
                  <option value="PDF">PDF</option>
                  <option value="IMAGE">صورة</option>
                  <option value="YOUTUBE">فيديو يوتيوب</option>
                  <option value="DRIVE">Google Drive</option>
                </select>
              </div>

              {formData.type === "YOUTUBE" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رابط فيديو يوتيوب
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  {formData.url && getYouTubeEmbedUrl(formData.url) && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        معاينة الفيديو
                      </p>
                      <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src={getYouTubeEmbedUrl(formData.url)}
                          className="w-full h-64"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube Preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : formData.type === "DRIVE" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#1B9AAA]"
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
                      رابط Google Drive
                    </div>
                  </label>
                  <input
                    type="url"
                    value={formData.driveUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, driveUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    placeholder="https://drive.google.com/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    أدخل رابط ملف أو مجلد Google Drive
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رفع ملف (
                    {formData.type === "PDF" ? "PDF ≤ 10MB" : "صورة ≤ 5MB"})
                  </label>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    id="file-upload"
                    accept={
                      formData.type === "PDF"
                        ? ".pdf"
                        : ".jpg,.jpeg,.png,.gif,.webp"
                    }
                    multiple={formData.type === "IMAGE"}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        // For IMAGE type, upload multiple files
                        if (formData.type === "IMAGE") {
                          Array.from(files).forEach((file) =>
                            handleFileUpload(file),
                          );
                        } else {
                          // For PDF, upload single file
                          handleFileUpload(files[0]);
                        }
                      }
                    }}
                    className="hidden"
                    required={!formData.url && formData.images.length === 0}
                    disabled={
                      !selectedGrade || !selectedUnit || uploadProgress > 0
                    }
                  />

                  {/* Custom upload button */}
                  <label
                    htmlFor="file-upload"
                    className={`
                      flex items-center justify-center gap-3 w-full px-6 py-4 
                      border-2 border-dashed rounded-xl transition-all duration-200
                      ${
                        !selectedGrade || !selectedUnit || uploadProgress > 0
                          ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                          : "border-[#1B9AAA] bg-gradient-to-br from-[#1B9AAA]/5 to-[#06D6A0]/5 hover:from-[#1B9AAA]/10 hover:to-[#06D6A0]/10 cursor-pointer hover:border-[#06D6A0] hover:shadow-md"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className={`w-10 h-10 ${
                          !selectedGrade || !selectedUnit || uploadProgress > 0
                            ? "text-gray-400"
                            : "text-[#1B9AAA]"
                        }`}
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
                      <div className="text-center">
                        <p
                          className={`text-sm font-semibold ${
                            !selectedGrade ||
                            !selectedUnit ||
                            uploadProgress > 0
                              ? "text-gray-500"
                              : "text-[#1B9AAA]"
                          }`}
                        >
                          {formData.type === "IMAGE"
                            ? "اضغط لاختيار صور متعددة أو اسحبها هنا"
                            : "اضغط لاختيار ملف أو اسحب الملف هنا"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.type === "PDF"
                            ? "PDF حتى 10 ميجابايت"
                            : "صور متعددة - JPG, PNG, GIF, WEBP حتى 5 ميجابايت لكل صورة"}
                        </p>
                      </div>
                    </div>
                  </label>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>جاري الرفع...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Success message for PDF/YouTube */}
                  {formData.type !== "IMAGE" &&
                    formData.url &&
                    uploadProgress === 0 && (
                      <div className="mt-3 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-green-600"
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
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-800">
                              تم رفع الملف بنجاح
                            </p>
                            <p className="text-xs text-green-600 mt-0.5 truncate max-w-xs">
                              {formData.url.split("/").pop()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {formData.type === "PDF" && (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(formData.url, "_blank")
                              }
                              className="flex-shrink-0 text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg hover:shadow-md transition-all duration-200 border border-blue-200 hover:border-blue-600"
                              title="معاينة"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                // Delete the physical file from server
                                const response = await fetch(
                                  `/api/upload?path=${encodeURIComponent(formData.url)}`,
                                  { method: "DELETE" },
                                );

                                if (!response.ok) {
                                  throw new Error("فشل حذف الملف");
                                }

                                // Clear the URL from form state
                                setFormData((prev) => ({ ...prev, url: "" }));
                                showToast.success("تم حذف الملف بنجاح");
                              } catch (error) {
                                console.error("Error deleting file:", error);
                                showToast.error("حدث خطأ أثناء حذف الملف");
                              }
                            }}
                            className="flex-shrink-0 text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg hover:shadow-md transition-all duration-200 border border-red-200 hover:border-red-600"
                            title="حذف الملف"
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
                        </div>
                      </div>
                    )}

                  {/* Display uploaded images for IMAGE type */}
                  {formData.type === "IMAGE" &&
                    formData.images.length > 0 &&
                    uploadProgress === 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">
                          الصور المرفوعة ({formData.images.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {formData.images.map((imagePath, index) => (
                            <div
                              key={index}
                              className="relative group bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                              <div
                                className="relative w-full h-32 cursor-pointer bg-gray-200"
                                onClick={() =>
                                  setImageLightbox({ show: true, imagePath })
                                }
                              >
                                <img
                                  src={formData.thumbnails[index] || imagePath}
                                  alt={`صورة ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  title="اضغط للعرض بالحجم الكامل"
                                  onError={(e) => {
                                    // Fallback to main image if thumbnail fails
                                    e.currentTarget.src = imagePath;
                                  }}
                                />
                              </div>
                              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageLightbox({ show: true, imagePath });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg"
                                  title="معاينة"
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const response = await fetch(
                                        `/api/upload?path=${encodeURIComponent(imagePath)}`,
                                        { method: "DELETE" },
                                      );

                                      if (!response.ok) {
                                        throw new Error("فشل حذف الصورة");
                                      }

                                      setFormData((prev) => ({
                                        ...prev,
                                        images: prev.images.filter(
                                          (_, i) => i !== index,
                                        ),
                                        thumbnails: prev.thumbnails.filter(
                                          (_, i) => i !== index,
                                        ),
                                      }));
                                      showToast.success("تم حذف الصورة بنجاح");
                                    } catch (error) {
                                      console.error(
                                        "Error deleting image:",
                                        error,
                                      );
                                      showToast.error(
                                        "حدث خطأ أثناء حذف الصورة",
                                      );
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg"
                                  title="حذف الصورة"
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
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-xs text-white font-medium truncate">
                                  {imagePath.split("/").pop()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              {formData.type !== "DRIVE" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-[#1B9AAA]"
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
                      رابط Google Drive (اختياري)
                    </div>
                  </label>
                  <input
                    type="url"
                    value={formData.driveUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, driveUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك إضافة رابط لملف أو مجلد على Google Drive كمرجع إضافي
                  </p>
                </div>
              )}

              {/* Publishing Schedule Section */}
              <div className="bg-gradient-to-br from-[#FFC43D]/10 to-[#EF476F]/10 rounded-xl p-6 border-2 border-[#FFC43D]/30 space-y-4">
                <div className="flex items-center gap-2 text-[#EF476F] font-bold text-lg">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  إعدادات الجدولة والنشر
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      حالة النشر
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-white">
                        <input
                          type="radio"
                          name="status"
                          value="DRAFT"
                          checked={formData.status === "DRAFT"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as any,
                            })
                          }
                          className="w-5 h-5 text-[#1B9AAA] focus:ring-[#1B9AAA]"
                        />
                        <div>
                          <div className="font-semibold text-gray-700">
                            مسودة
                          </div>
                          <div className="text-xs text-gray-500">
                            غير مرئي للطلاب
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-white">
                        <input
                          type="radio"
                          name="status"
                          value="SCHEDULED"
                          checked={formData.status === "SCHEDULED"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as any,
                            })
                          }
                          className="w-5 h-5 text-[#FFC43D] focus:ring-[#FFC43D]"
                        />
                        <div>
                          <div className="font-semibold text-gray-700">
                            مجدول
                          </div>
                          <div className="text-xs text-gray-500">
                            سيُنشر في الموعد المحدد
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:bg-white">
                        <input
                          type="radio"
                          name="status"
                          value="PUBLISHED"
                          checked={formData.status === "PUBLISHED"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as any,
                            })
                          }
                          className="w-5 h-5 text-[#06D6A0] focus:ring-[#06D6A0]"
                        />
                        <div>
                          <div className="font-semibold text-gray-700">
                            منشور
                          </div>
                          <div className="text-xs text-gray-500">
                            مرئي للطلاب الآن
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        موعد النشر (توقيت مصر)
                      </label>
                      <DatePicker
                        selected={formData.publishAt}
                        onChange={(date: Date | null) =>
                          setFormData({ ...formData, publishAt: date })
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy - HH:mm"
                        timeCaption="الوقت"
                        minDate={new Date()}
                        placeholderText="اختر موعد النشر (اختياري)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                        isClearable
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        اترك فارغاً للنشر الفوري أو حدد موعد مستقبلي
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.isVisible}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isVisible: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-[#06D6A0] focus:ring-[#06D6A0] rounded"
                        />
                        <div>
                          <div className="font-semibold text-gray-700">
                            مرئي
                          </div>
                          <div className="text-xs text-gray-500">
                            إظهار هذه الإجابة للطلاب (يعتمد على حالة النشر
                            والموعد)
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={async () => {
                    // Set to published and submit immediately
                    const publishNowData = {
                      ...formData,
                      status: "PUBLISHED",
                      publishAt: null,
                      isVisible: true,
                    };

                    try {
                      const method = editingAnswer ? "PUT" : "POST";
                      const url = editingAnswer
                        ? `/api/answers/${editingAnswer.id}`
                        : "/api/answers";

                      const res = await fetch(url, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(publishNowData),
                      });

                      const data = await res.json();

                      if (!res.ok) {
                        throw new Error(data.error || "فشل النشر");
                      }

                      showToast.success("تم نشر الإجابة بنجاح!");
                      setShowForm(false);
                      setEditingAnswer(null);
                      fetchData();
                      resetForm();
                    } catch (error: any) {
                      showToast.error(error.message || "حدث خطأ");
                    }
                  }}
                  className="bg-gradient-to-r from-[#06D6A0] to-[#1B9AAA] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  نشر الآن
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {editingAnswer ? "تحديث الإجابة" : "حفظ الإجابة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAnswer(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm({ show: false, id: null })}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
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
              <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                تأكيد الحذف
              </h3>
              <p className="text-gray-600 text-center mb-6">
                هل أنت متأكد من حذف هذه الإجابة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    deleteConfirm.id && handleDelete(deleteConfirm.id)
                  }
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
                >
                  حذف
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بحث
            </label>
            <input
              type="text"
              placeholder="ابحث بالعنوان أو الوصف..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الملف
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
            >
              <option value="">الكل</option>
              <option value="PDF">PDF</option>
              <option value="IMAGE">صورة</option>
              <option value="YOUTUBE">يوتيوب</option>
              <option value="DRIVE">Google Drive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
            >
              <option value="">الكل</option>
              <option value="LESSON">درس</option>
              <option value="UNIT_EXERCISE">تمارين وحدة</option>
              <option value="EXAM">امتحان</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة النشر
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
            >
              <option value="">الكل</option>
              <option value="DRAFT">مسودة</option>
              <option value="SCHEDULED">مجدول</option>
              <option value="PUBLISHED">منشور</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  العنوان
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  النوع
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  الفئة
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  حالة النشر
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  المرحلة / الوحدة
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getPaginatedAnswers().length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchQuery || filterType || filterCategory || filterStatus
                      ? "لا توجد نتائج للبحث"
                      : "لا توجد إجابات حالياً"}
                  </td>
                </tr>
              ) : (
                getPaginatedAnswers().map((answer: any) => (
                  <tr key={answer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {answer.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          answer.type === "PDF"
                            ? "bg-red-100 text-red-700"
                            : answer.type === "IMAGE"
                              ? "bg-blue-100 text-blue-700"
                              : answer.type === "DRIVE"
                                ? "bg-teal-100 text-teal-700"
                                : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {answer.type}
                        {answer.type === "IMAGE" &&
                          answer.images?.length > 0 && (
                            <span className="mr-1">
                              ({answer.images.length})
                            </span>
                          )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {answer.categoryType === "LESSON"
                        ? "درس"
                        : answer.categoryType === "UNIT_EXERCISE"
                          ? "تمارين وحدة"
                          : answer.categoryType === "EXAM"
                            ? "امتحان"
                            : answer.customTitle || "أخرى"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            answer.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : answer.status === "SCHEDULED"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {answer.status === "PUBLISHED" ? (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              منشور
                            </>
                          ) : answer.status === "SCHEDULED" ? (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              مجدول
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              مسودة
                            </>
                          )}
                        </span>
                        {answer.publishAt && (
                          <div className="text-xs text-gray-500">
                            {answer.status === "SCHEDULED" ? (
                              <span className="font-medium text-yellow-600">
                                {getTimeRemaining(answer.publishAt)}
                              </span>
                            ) : (
                              <span>
                                {formatEgyptDate(
                                  answer.publishAt,
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        {!answer.isVisible && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                            مخفي
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {answer.lesson?.unit?.grade?.name} /{" "}
                      {answer.lesson?.unit?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(answer.type === "PDF" || answer.type === "IMAGE") && (
                          <button
                            onClick={() =>
                              setPreviewModal({
                                show: true,
                                type: answer.type,
                                url: answer.url || "",
                                images: answer.images || [],
                                title: answer.title,
                              })
                            }
                            className="text-green-600 hover:text-green-800 p-1"
                            title="معاينة"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        )}
                        {answer.driveUrl && (
                          <button
                            onClick={() =>
                              window.open(answer.driveUrl, "_blank")
                            }
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="فتح Google Drive"
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
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (
                              !answer.lesson?.unit?.grade?.slug ||
                              !answer.lesson?.unit?.slug
                            ) {
                              alert(
                                "لا يمكن مشاركة هذه الإجابة - معلومات المرحلة أو الوحدة مفقودة",
                              );
                              return;
                            }
                            const params = new URLSearchParams();
                            params.set("grade", answer.lesson.unit.grade.slug);
                            params.set("unit", answer.lesson.unit.slug);
                            const url = `${window.location.origin}/answers?${params.toString()}`;

                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: answer.title,
                                  url: url,
                                });
                              } catch (err) {
                                console.log("Share cancelled");
                              }
                            } else {
                              try {
                                await navigator.clipboard.writeText(url);
                                alert("تم نسخ الرابط!");
                              } catch (err) {
                                console.error("Failed to copy:", err);
                              }
                            }
                          }}
                          className="text-teal-600 hover:text-teal-800 p-1"
                          title="مشاركة رابط الإجابة"
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
                          onClick={() => handleEdit(answer)}
                          className="text-blue-600 hover:text-blue-800 p-1"
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
                          onClick={() =>
                            setDeleteConfirm({ show: true, id: answer.id })
                          }
                          className="text-red-600 hover:text-red-800 p-1"
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              عرض {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getFilteredAnswers().length,
              )}{" "}
              من {getFilteredAnswers().length} نتيجة
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1,
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex gap-1">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? "bg-[#1B9AAA] text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.show && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setPreviewModal({
              show: false,
              type: null,
              url: "",
              images: [],
              title: "",
            })
          }
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0]">
              <h3 className="text-xl font-bold text-white">
                {previewModal.title}
              </h3>
              <button
                onClick={() =>
                  setPreviewModal({
                    show: false,
                    type: null,
                    url: "",
                    images: [],
                    title: "",
                  })
                }
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
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
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {previewModal.type === "PDF" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <a
                      href={previewModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
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
                        فتح في نافذة جديدة
                      </div>
                    </a>
                  </div>
                  <iframe
                    src={previewModal.url}
                    className="w-full h-[70vh] border-2 border-gray-200 rounded-xl"
                    title="PDF Preview"
                  />
                </div>
              )}

              {previewModal.type === "IMAGE" &&
                previewModal.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                      عدد الصور: {previewModal.images.length}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {previewModal.images.map((imagePath, index) => (
                        <div
                          key={index}
                          className="relative group bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          <img
                            src={imagePath}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-auto object-contain max-h-96"
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                            {index + 1} / {previewModal.images.length}
                          </div>
                          <a
                            href={imagePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 left-2 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <div className="flex items-center gap-2">
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
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              فتح
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {imageLightbox.show && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={() => setImageLightbox({ show: false, imagePath: "" })}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setImageLightbox({ show: false, imagePath: "" })}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
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
            <div className="relative max-w-full max-h-full">
              <Image
                src={imageLightbox.imagePath}
                alt="Preview"
                width={1920}
                height={1080}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <a
              href={imageLightbox.imagePath}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
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
              فتح في نافذة جديدة
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
