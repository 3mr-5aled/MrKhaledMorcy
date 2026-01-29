"use client";

import PageHeader from "@/components/admin/PageHeader";
import showToast from "@/lib/toast";
import { useEffect, useState } from "react";

type Grade = {
  id: string;
  name: string;
  stage: string;
  color: string;
  order: number;
  _count?: { units: number };
};

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string | null;
  }>({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    stage: "",
    color: "#1B9AAA",
    order: 0,
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await fetch("/api/grades");
      const data = await res.json();
      setGrades(data);
    } catch (error) {
      showToast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingGrade ? "PUT" : "POST";
      const url = editingGrade
        ? `/api/grades/${editingGrade.id}`
        : "/api/grades";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      showToast.success(editingGrade ? "تم تحديث المرحلة" : "تم إضافة المرحلة");
      setShowForm(false);
      setEditingGrade(null);
      fetchGrades();
      setFormData({ name: "", stage: "", color: "#1B9AAA", order: 0 });
    } catch (error) {
      showToast.error("حدث خطأ");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await showToast.promise(
        fetch(`/api/grades/${id}`, { method: "DELETE" }),
        {
          loading: "جاري الحذف...",
          success: "تم حذف المرحلة",
          error: "فشل حذف المرحلة",
        },
      );
      fetchGrades();
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      name: grade.name,
      stage: grade.stage,
      color: grade.color,
      order: grade.order,
    });
    setShowForm(true);
  };

  if (isLoading)
    return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <PageHeader
        title="إدارة المراحل الدراسية"
        description="إضافة وإدارة المراحل الدراسية (إعدادي - ثانوي - جامعي)"
        action={
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingGrade(null);
              setFormData({ name: "", stage: "", color: "#1B9AAA", order: 0 });
            }}
            className="bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            {showForm ? "إلغاء" : "+ إضافة مرحلة جديدة"}
          </button>
        }
      />

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => {
            setShowForm(false);
            setEditingGrade(null);
            setFormData({ name: "", stage: "", color: "#1B9AAA", order: 0 });
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingGrade ? "تعديل المرحلة" : "إضافة مرحلة جديدة"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingGrade(null);
                    setFormData({
                      name: "",
                      stage: "",
                      color: "#1B9AAA",
                      order: 0,
                    });
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
                    اسم المرحلة
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] outline-none"
                    placeholder="مثال: أولى إعدادي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المستوى
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] outline-none"
                    required
                  >
                    <option value="">اختر المستوى</option>
                    <option value="المرحلة الإعدادية">المرحلة الإعدادية</option>
                    <option value="المرحلة الثانوية">المرحلة الثانوية</option>
                    <option value="المرحلة الجامعية">المرحلة الجامعية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اللون (hex)
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-12 px-2 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {editingGrade ? "تحديث المرحلة" : "حفظ المرحلة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGrade(null);
                    setFormData({
                      name: "",
                      stage: "",
                      color: "#1B9AAA",
                      order: 0,
                    });
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
                هل أنت متأكد من حذف هذه المرحلة؟ سيتم حذف جميع الوحدات والدروس
                المرتبطة بها.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: grade.color }}
              >
                {grade.order}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(grade)}
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
                  onClick={() => setDeleteConfirm({ show: true, id: grade.id })}
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {grade.name}
            </h3>
            <p className="text-gray-600 mb-2">{grade.stage}</p>
            <p className="text-sm text-gray-500">
              {grade._count?.units || 0} وحدة
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
