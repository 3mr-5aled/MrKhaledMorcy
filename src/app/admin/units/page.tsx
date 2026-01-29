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
  _count?: { lessons: number };
};

function SortableUnitItem({
  unit,
  onEdit,
  onDelete,
}: {
  unit: Unit;
  onEdit: (unit: Unit) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: unit.id });

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
          <h3 className="font-medium text-gray-900">{unit.name}</h3>
          <p className="text-sm text-gray-500">
            {unit.grade?.name} • {unit._count?.lessons || 0} درس
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(unit)}
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
          onClick={() => onDelete(unit.id)}
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

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    gradeId: "",
  });
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("");

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
      const [unitsRes, gradesRes] = await Promise.all([
        fetch("/api/units"),
        fetch("/api/grades"),
      ]);

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

    const filteredUnits = getFilteredUnits();
    const oldIndex = filteredUnits.findIndex((u) => u.id === active.id);
    const newIndex = filteredUnits.findIndex((u) => u.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(filteredUnits, oldIndex, newIndex);

    // Optimistically update UI
    setUnits((prev) => {
      const otherUnits = prev.filter(
        (u) => !filteredUnits.some((fu) => fu.id === u.id),
      );
      return [...otherUnits, ...newOrder];
    });

    // Update server
    try {
      const updates = newOrder.map((unit, index) => ({
        id: unit.id,
        order: index,
      }));

      const promises = updates.map((update) =>
        fetch(`/api/units/${update.id}`, {
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

    if (!formData.name || !formData.gradeId) {
      showToast.error("يرجى ملء جميع الحقول");
      return;
    }

    try {
      const method = editingUnit ? "PUT" : "POST";
      const url = editingUnit ? `/api/units/${editingUnit.id}` : "/api/units";

      const gradeUnits = units.filter((u) => u.gradeId === formData.gradeId);
      const maxOrder =
        gradeUnits.length > 0
          ? Math.max(...gradeUnits.map((u) => u.order))
          : -1;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: editingUnit ? editingUnit.order : maxOrder + 1,
        }),
      });

      if (!response.ok) throw new Error();

      showToast.success(editingUnit ? "تم تحديث الوحدة" : "تم إضافة الوحدة");
      setShowModal(false);
      setEditingUnit(null);
      setFormData({ name: "", gradeId: "" });
      fetchData();
    } catch (error) {
      showToast.error("حدث خطأ");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await showToast.promise(fetch(`/api/units/${id}`, { method: "DELETE" }), {
        loading: "جاري الحذف...",
        success: "تم حذف الوحدة",
        error: "فشل حذف الوحدة",
      });
      setDeleteConfirm({ show: false, id: null });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      gradeId: unit.gradeId,
    });
    setShowModal(true);
  };

  const getFilteredUnits = () => {
    let filtered = units;
    if (selectedGradeFilter) {
      filtered = filtered.filter((u) => u.gradeId === selectedGradeFilter);
    }
    return filtered.sort((a, b) => a.order - b.order);
  };

  const groupedUnits = grades.map((grade) => ({
    grade,
    units: units
      .filter((u) => u.gradeId === grade.id)
      .sort((a, b) => a.order - b.order),
  }));

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
        title="الوحدات"
        description="إدارة الوحدات الدراسية لكل المراحل"
        action={
          <button
            onClick={() => {
              setEditingUnit(null);
              setFormData({ name: "", gradeId: "" });
              setShowModal(true);
            }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            إضافة وحدة
          </button>
        }
      />

      {/* Filter */}
      <div className="rounded-lg bg-white p-4 shadow">
        <label className="block text-sm font-medium text-gray-700">
          تصفية حسب المرحلة
        </label>
        <select
          value={selectedGradeFilter}
          onChange={(e) => setSelectedGradeFilter(e.target.value)}
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

      {/* Units List */}
      {selectedGradeFilter ? (
        <div className="rounded-lg bg-white p-4 shadow">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={getFilteredUnits().map((u) => u.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {getFilteredUnits().map((unit) => (
                  <SortableUnitItem
                    key={unit.id}
                    unit={unit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {getFilteredUnits().length === 0 && (
            <p className="text-center text-gray-500">لا توجد وحدات</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedUnits.map(({ grade, units: gradeUnits }) => (
            <div key={grade.id} className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {grade.name} ({gradeUnits.length} وحدة)
              </h2>
              {gradeUnits.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={gradeUnits.map((u) => u.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {gradeUnits.map((unit) => (
                        <SortableUnitItem
                          key={unit.id}
                          unit={unit}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="text-center text-gray-500">لا توجد وحدات</p>
              )}
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
            setEditingUnit(null);
            setFormData({ name: "", gradeId: "" });
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingUnit ? "تعديل الوحدة" : "إضافة وحدة جديدة"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingUnit(null);
                    setFormData({ name: "", gradeId: "" });
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
                  اسم الوحدة
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
                    setFormData({ ...formData, gradeId: e.target.value })
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
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 -mx-6 -mb-6 rounded-b-2xl">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] px-4 py-3 font-bold text-white hover:shadow-lg transition-all"
                >
                  {editingUnit ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUnit(null);
                    setFormData({ name: "", gradeId: "" });
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
                هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف جميع الدروس المرتبطة
                بها.
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
