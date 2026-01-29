"use client";

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

type Grade = {
  id: string;
  name: string;
  order: number;
};

type Unit = {
  id: string;
  name: string;
  gradeId: string;
  order: number;
  grade?: Grade;
};

type Lesson = {
  id: string;
  name: string;
  unitId: string;
  order: number;
  unit?: Unit & { grade?: Grade };
  _count?: { answers: number };
};

function SortableLessonItem({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-1 items-center gap-4">
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
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{lesson.name}</h3>
          <p className="text-sm text-gray-500">
            {lesson.unit?.grade?.name} • {lesson.unit?.name} •{" "}
            {lesson._count?.answers || 0} إجابة
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(lesson)}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          title="تعديل"
        >
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(lesson.id)}
          className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          title="حذف"
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    gradeId: "",
    unitId: "",
  });
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("");

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
      const [lessonsRes, unitsRes, gradesRes] = await Promise.all([
        fetch("/api/lessons"),
        fetch("/api/units"),
        fetch("/api/grades"),
      ]);

      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData);
      }

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData);
      }

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        setGrades(gradesData);
      }
    } catch (error) {
      showToast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const filteredLessons = getFilteredLessons();
    const oldIndex = filteredLessons.findIndex((l) => l.id === active.id);
    const newIndex = filteredLessons.findIndex((l) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(filteredLessons, oldIndex, newIndex);

    // Optimistically update UI
    setLessons((prev) => {
      const otherLessons = prev.filter(
        (l) => !filteredLessons.some((fl) => fl.id === l.id),
      );
      return [...otherLessons, ...newOrder];
    });

    // Update server
    try {
      const updates = newOrder.map((lesson, index) => ({
        id: lesson.id,
        order: index,
      }));

      const promises = updates.map((update) =>
        fetch(`/api/lessons/${update.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: update.order }),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unitId) {
      showToast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      const method = editingLesson ? "PUT" : "POST";
      const url = editingLesson
        ? `/api/lessons/${editingLesson.id}`
        : "/api/lessons";

      const unitLessons = lessons.filter((l) => l.unitId === formData.unitId);
      const maxOrder =
        unitLessons.length > 0
          ? Math.max(...unitLessons.map((l) => l.order))
          : -1;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          unitId: formData.unitId,
          order: editingLesson ? editingLesson.order : maxOrder + 1,
        }),
      });

      if (!response.ok) throw new Error();

      showToast.success(editingLesson ? "تم تحديث الدرس" : "تم إضافة الدرس");
      setShowModal(false);
      setEditingLesson(null);
      setFormData({ name: "", gradeId: "", unitId: "" });
      fetchData();
    } catch (error) {
      showToast.error("حدث خطأ");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await showToast.promise(
        fetch(`/api/lessons/${id}`, { method: "DELETE" }),
        {
          loading: "جاري الحذف...",
          success: "تم حذف الدرس",
          error: "فشل حذف الدرس",
        },
      );
      fetchData();
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    const gradeId = lesson.unit?.gradeId || "";
    setFormData({
      name: lesson.name,
      gradeId,
      unitId: lesson.unitId,
    });
    setShowModal(true);
  };

  const getFilteredLessons = () => {
    let filtered = lessons;
    if (selectedUnitFilter) {
      filtered = filtered.filter((l) => l.unitId === selectedUnitFilter);
    } else if (selectedGradeFilter) {
      const gradeUnitIds = units
        .filter((u) => u.gradeId === selectedGradeFilter)
        .map((u) => u.id);
      filtered = filtered.filter((l) => gradeUnitIds.includes(l.unitId));
    }
    return filtered.sort((a, b) => a.order - b.order);
  };

  const groupedLessons = units.map((unit) => ({
    unit,
    lessons: lessons
      .filter((l) => l.unitId === unit.id)
      .sort((a, b) => a.order - b.order),
  }));

  const filteredUnits = formData.gradeId
    ? units.filter((u) => u.gradeId === formData.gradeId)
    : [];

  const filteredUnitsForFilter = selectedGradeFilter
    ? units.filter((u) => u.gradeId === selectedGradeFilter)
    : [];

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
        title="الدروس"
        description="إدارة الدروس لكل الوحدات"
        action={
          <button
            onClick={() => {
              setEditingLesson(null);
              setFormData({ name: "", gradeId: "", unitId: "" });
              setShowModal(true);
            }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            إضافة درس
          </button>
        }
      />

      {/* Filter */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              تصفية حسب المرحلة
            </label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => {
                setSelectedGradeFilter(e.target.value);
                setSelectedUnitFilter("");
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">جميع المراحل</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              تصفية حسب الوحدة
            </label>
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={!selectedGradeFilter}
            >
              <option value="">جميع الوحدات</option>
              {filteredUnitsForFilter.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      {selectedUnitFilter || selectedGradeFilter ? (
        <div className="rounded-lg bg-white p-4 shadow">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={getFilteredLessons().map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {getFilteredLessons().map((lesson) => (
                  <SortableLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {getFilteredLessons().length === 0 && (
            <p className="text-center text-gray-500">لا توجد دروس</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLessons
            .filter(({ lessons }) => lessons.length > 0)
            .map(({ unit, lessons: unitLessons }) => (
              <div key={unit.id} className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  {unit.grade?.name} - {unit.name} ({unitLessons.length} درس)
                </h2>
                <div className="space-y-3">
                  {unitLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {lesson.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {lesson._count?.answers || 0} إجابة
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                          title="تعديل"
                        >
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, id: lesson.id })
                          }
                          className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                          title="حذف"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => {
            setShowModal(false);
            setEditingLesson(null);
            setFormData({ name: "", gradeId: "", unitId: "" });
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingLesson ? "تعديل الدرس" : "إضافة درس جديد"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingLesson(null);
                    setFormData({ name: "", gradeId: "", unitId: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  اسم الدرس
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
                  المرحلة الدراسية
                </label>
                <select
                  value={formData.gradeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gradeId: e.target.value,
                      unitId: "",
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">اختر المرحلة</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الوحدة
                </label>
                <select
                  value={formData.unitId}
                  onChange={(e) =>
                    setFormData({ ...formData, unitId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  disabled={!formData.gradeId}
                >
                  <option value="">اختر الوحدة</option>
                  {filteredUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 -mx-6 -mb-6 rounded-b-2xl">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] px-4 py-3 font-bold text-white hover:shadow-lg transition-all"
                >
                  {editingLesson ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLesson(null);
                    setFormData({ name: "", gradeId: "", unitId: "" });
                  }}
                  className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
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
                هل أنت متأكد من حذف هذا الدرس؟ سيتم حذف جميع الإجابات المرتبطة
                به.
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
    </div>
  );
}
