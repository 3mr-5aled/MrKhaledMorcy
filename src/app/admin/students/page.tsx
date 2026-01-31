"use client";

import ImageEditor from "@/components/admin/ImageEditor";
import PageHeader from "@/components/admin/PageHeader";
import showToast from "@/lib/toast";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  gradeId: string;
  studentGrade: number;
  testGrade: number;
  position: "FIRST" | "SECOND" | "THIRD" | "NONE";
  image: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  grade: {
    id: string;
    name: string;
    slug: string;
    stage: string;
    color: string | null;
  };
};

type Grade = {
  id: string;
  name: string;
  slug: string;
  stage: string;
  color: string | null;
  order: number;
};

function StudentItem({
  student,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  student: Student;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}) {
  const getPositionBadge = (position: string) => {
    if (position === "FIRST")
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
          🥇 الأول
        </span>
      );
    if (position === "SECOND")
      return (
        <span className="inline-flex items-center rounded-full bg-gray-400 px-2 py-1 text-xs font-bold text-white">
          🥈 الثاني
        </span>
      );
    if (position === "THIRD")
      return (
        <span className="inline-flex items-center rounded-full bg-orange-600 px-2 py-1 text-xs font-bold text-white">
          🥉 الثالث
        </span>
      );
    return null;
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(student.id)}
        className="h-5 w-5 rounded border-gray-300"
      />
      {student.image ? (
        <img
          src={student.image}
          alt={student.name}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
          {student.name.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {getPositionBadge(student.position)}
          <h3 className="font-medium text-gray-900">{student.name}</h3>
          {!student.isVisible && (
            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
              مخفي
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {student.grade.name} • {student.studentGrade}/{student.testGrade}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(student)}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          title="تعديل"
        >
          <svg
            className="h-4 w-4"
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
          onClick={() => onDelete(student.id)}
          className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          title="حذف"
        >
          <svg
            className="h-4 w-4"
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
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    ids: string[];
  }>({ show: false, ids: [] });
  const [formData, setFormData] = useState({
    name: "",
    gradeId: "",
    studentGrade: 0,
    testGrade: 0,
    position: "NONE" as "FIRST" | "SECOND" | "THIRD" | "NONE",
    image: "",
    isVisible: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(
    indexOfFirstStudent,
    indexOfLastStudent,
  );
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsResponse, gradesResponse] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/grades"),
      ]);

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
      }

      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setGrades(gradesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Always open image editor for single file
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingImageUrl(e.target?.result as string);
      setShowImageEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageEditorSave = async (blob: Blob) => {
    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", blob, "edited-image.jpg");
      uploadFormData.append("studentId", editingStudent?.id || "temp");

      const response = await fetch("/api/students/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.path }));
      setImagePreview(data.path);
      setShowImageEditor(false);
      showToast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast.error("فشل رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.gradeId ||
      formData.studentGrade === undefined ||
      formData.testGrade === undefined ||
      formData.testGrade < 1
    ) {
      showToast.error("يرجى ملء جميع الحقول المطلوبة بشكل صحيح");
      return;
    }

    try {
      const method = editingStudent ? "PUT" : "POST";
      const url = editingStudent
        ? `/api/students/${editingStudent.id}`
        : "/api/students";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      showToast.success(
        editingStudent ? "تم تحديث بيانات الطالب" : "تم إضافة الطالب",
      );
      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        name: "",
        gradeId: "",
        studentGrade: 0,
        testGrade: 0,
        position: "NONE",
        image: "",
        isVisible: true,
      });
      setImagePreview("");
      fetchData();
    } catch (error) {
      console.error("Error saving student:", error);
      showToast.error("حدث خطأ");
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      const promises = ids.map((id) =>
        fetch(`/api/students/${id}`, { method: "DELETE" }),
      );

      await showToast.promise(Promise.all(promises), {
        loading: "جاري الحذف...",
        success: `تم حذف ${ids.length} طالب`,
        error: "فشل حذف بعض الطلاب",
      });

      fetchData();
      setSelectedStudents([]);
      setDeleteConfirm({ show: false, ids: [] });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      gradeId: student.gradeId,
      studentGrade: student.studentGrade,
      testGrade: student.testGrade,
      position: student.position,
      image: student.image || "",
      isVisible: student.isVisible,
    });
    setImagePreview(student.image || "");
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  // Group grades by stage
  const gradesByStage = grades.reduce(
    (acc, grade) => {
      if (!acc[grade.stage]) {
        acc[grade.stage] = [];
      }
      acc[grade.stage].push(grade);
      return acc;
    },
    {} as Record<string, Grade[]>,
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة الشرف"
        description="إدارة الطلاب المتميزين"
        action={
          <div className="flex gap-2">
            {selectedStudents.length > 0 && (
              <button
                onClick={() =>
                  setDeleteConfirm({ show: true, ids: selectedStudents })
                }
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                حذف المحدد ({selectedStudents.length})
              </button>
            )}
            <button
              onClick={() => {
                setEditingStudent(null);
                setFormData({
                  name: "",
                  gradeId: "",
                  studentGrade: 0,
                  testGrade: 0,
                  position: "NONE",
                  image: "",
                  isVisible: true,
                });
                setImagePreview("");
                setShowModal(true);
              }}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              إضافة طالب
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الطلاب</h3>
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">الظاهرين</h3>
          <p className="text-2xl font-bold text-green-600">
            {students.filter((s) => s.isVisible).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">المخفيين</h3>
          <p className="text-2xl font-bold text-red-600">
            {students.filter((s) => !s.isVisible).length}
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedStudents.length === students.length}
              onChange={handleSelectAll}
              className="h-5 w-5 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              تحديد الكل ({students.length})
            </span>
          </label>
        </div>
      </div>

      {/* Students List */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          الطلاب ({students.length})
        </h2>
        {students.length === 0 ? (
          <p className="py-8 text-center text-gray-500">لا يوجد طلاب بعد</p>
        ) : (
          <>
            <div className="space-y-2">
              {currentStudents.map((student) => (
                <StudentItem
                  key={student.id}
                  student={student}
                  isSelected={selectedStudents.includes(student.id)}
                  onSelect={handleSelectStudent}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteConfirm({ show: true, ids: [id] })}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                  }`}
                >
                  السابق
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                  }`}
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              {editingStudent ? "تعديل طالب" : "إضافة طالب"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  صورة الطالب
                </label>
                <div className="mt-1 flex items-center gap-3">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <label className="cursor-pointer rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {uploadingImage ? "جاري الرفع..." : "اختر صورة"}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  اسم الطالب
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الصف الدراسي
                </label>
                <select
                  value={formData.gradeId}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">اختر الصف</option>
                  {Object.entries(gradesByStage).map(([stage, stageGrades]) => (
                    <optgroup key={stage} label={stage}>
                      {stageGrades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  درجة الطالب
                </label>
                <input
                  type="number"
                  value={formData.studentGrade || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentGrade: e.target.value
                        ? parseInt(e.target.value, 10)
                        : 0,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  min="0"
                  placeholder="أدخل درجة الطالب"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  درجة الاختبار
                </label>
                <input
                  type="number"
                  value={formData.testGrade || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      testGrade: e.target.value
                        ? parseInt(e.target.value, 10)
                        : 0,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  min="1"
                  placeholder="أدخل درجة الاختبار"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الترتيب
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="position"
                      value="FIRST"
                      checked={formData.position === "FIRST"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: e.target.value as
                            | "FIRST"
                            | "SECOND"
                            | "THIRD"
                            | "NONE",
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">🥇 الأول</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="position"
                      value="SECOND"
                      checked={formData.position === "SECOND"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: e.target.value as
                            | "FIRST"
                            | "SECOND"
                            | "THIRD"
                            | "NONE",
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">🥈 الثاني</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="position"
                      value="THIRD"
                      checked={formData.position === "THIRD"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: e.target.value as
                            | "FIRST"
                            | "SECOND"
                            | "THIRD"
                            | "NONE",
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">🥉 الثالث</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="position"
                      value="NONE"
                      checked={formData.position === "NONE"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: e.target.value as
                            | "FIRST"
                            | "SECOND"
                            | "THIRD"
                            | "NONE",
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">بدون ترتيب</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) =>
                    setFormData({ ...formData, isVisible: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  إظهار في لوحة الشرف
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                    setFormData({
                      name: "",
                      gradeId: "",
                      studentGrade: 0,
                      testGrade: 0,
                      position: "NONE",
                      image: "",
                      isVisible: true,
                    });
                    setImagePreview("");
                  }}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  disabled={uploadingImage}
                >
                  {editingStudent ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              تأكيد الحذف
            </h2>
            <p className="mb-6 text-gray-600">
              هل أنت متأكد من حذف {deleteConfirm.ids.length} طالب؟ لا يمكن
              التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm({ show: false, ids: [] })}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.ids)}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {showImageEditor && (
        <ImageEditor
          imageUrl={editingImageUrl}
          onSave={handleImageEditorSave}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
}
