"use client";

import ImageEditor from "@/components/admin/ImageEditor";
import PageHeader from "@/components/admin/PageHeader";
import showToast from "@/lib/toast";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  grade: string;
  score: string;
  image: string;
  manualOrder: number | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

function SortableStudentItem({
  student,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  rank,
}: {
  student: Student;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  rank: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
          🥇 الأول
        </span>
      );
    if (rank === 2)
      return (
        <span className="inline-flex items-center rounded-full bg-gray-400 px-2 py-1 text-xs font-bold text-white">
          🥈 الثاني
        </span>
      );
    if (rank === 3)
      return (
        <span className="inline-flex items-center rounded-full bg-orange-600 px-2 py-1 text-xs font-bold text-white">
          🥉 الثالث
        </span>
      );
    return (
      <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
        #{rank}
      </span>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        title="اسحب لإعادة الترتيب"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </button>
      <img
        src={student.image}
        alt={student.name}
        className="h-16 w-16 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {getRankBadge(rank)}
          <h3 className="font-medium text-gray-900">{student.name}</h3>
          {!student.isVisible && (
            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
              مخفي
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {student.grade} • {student.score}
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
    grade: "",
    score: "",
    image: "",
    isVisible: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = students.findIndex((s) => s.id === active.id);
    const newIndex = students.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(students, oldIndex, newIndex);

    // Optimistically update UI
    setStudents(newOrder);

    // Update server with manual order
    try {
      const updates = newOrder.map((student, index) => ({
        id: student.id,
        manualOrder: index,
      }));

      const promises = updates.map((update) =>
        fetch(`/api/students/${update.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manualOrder: update.manualOrder }),
        }),
      );

      await showToast.promise(Promise.all(promises), {
        loading: "جاري تحديث الترتيب...",
        success: "تم تحديث الترتيب بنجاح",
        error: "فشل تحديث الترتيب",
      });

      fetchData();
    } catch (error) {
      showToast.error("فشل تحديث الترتيب");
      fetchData(); // Revert on error
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files for bulk upload
    if (files.length > 1) {
      handleBulkUpload(Array.from(files));
    } else {
      // Single file - open image editor
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditingImageUrl(e.target?.result as string);
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageEditorSave = async (blob: Blob) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "edited-image.jpg");
      formData.append("studentId", editingStudent?.id || "temp");

      const response = await fetch("/api/students/upload", {
        method: "POST",
        body: formData,
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

  const handleBulkUpload = async (files: File[]) => {
    showToast.success(`جاري رفع ${files.length} صورة...`);

    for (const file of files) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("studentId", "temp");

        const response = await fetch("/api/students/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          // Auto-create student with basic info from filename
          const studentName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

          await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: studentName,
              grade: "يرجى التحديث",
              score: "0%",
              image: data.path,
              isVisible: false, // Hidden until user completes info
            }),
          });
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}`, error);
      }
    }

    showToast.success("تم رفع الصور بنجاح");
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.grade ||
      !formData.score ||
      !formData.image
    ) {
      showToast.error("يرجى ملء جميع الحقول");
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
        grade: "",
        score: "",
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
      grade: student.grade,
      score: student.score,
      image: student.image,
      isVisible: student.isVisible,
    });
    setImagePreview(student.image);
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
                  grade: "",
                  score: "",
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
          <label className="cursor-pointer rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            رفع صور متعددة
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={students.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {students.map((student, index) => (
                  <SortableStudentItem
                    key={student.id}
                    student={student}
                    rank={index + 1}
                    isSelected={selectedStudents.includes(student.id)}
                    onSelect={handleSelectStudent}
                    onEdit={handleEdit}
                    onDelete={(id) =>
                      setDeleteConfirm({ show: true, ids: [id] })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {editingStudent ? "تعديل طالب" : "إضافة طالب"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  صورة الطالب
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover"
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
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  placeholder="مثال: الصف الثالث الثانوي"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الدرجة
                </label>
                <input
                  type="text"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: e.target.value })
                  }
                  placeholder="مثال: 100%"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
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
                      grade: "",
                      score: "",
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
