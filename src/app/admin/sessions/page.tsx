"use client";

import PageHeader from "@/components/admin/PageHeader";
import showToast from "@/lib/toast";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

type Grade = {
  id: string;
  name: string;
  stage: string;
};

type SessionAnalytics = {
  totalGenerated: number;
  redeemedCodes: number;
  unusedCodes: number;
  attendanceRate: number;
};

type LiveSession = {
  id: string;
  title: string;
  description?: string | null;
  sessionLink?: string;
  sessionDateTime: string;
  formattedSessionDateTime: string;
  durationMinutes: number;
  gradeId: string;
  grade: Grade;
  status: "Upcoming" | "Live" | "Finished";
  analytics: SessionAnalytics;
};

type SessionCode = {
  id: string;
  code: string;
  isRedeemed: boolean;
  redeemedAt?: string | null;
  createdAt: string;
  attendance?: {
    enteredAt: string;
  } | null;
};

type ExportCodeRow = {
  code: string;
  isRedeemed: boolean;
  redeemedAt: string;
  enteredAt: string;
};

const emptyForm = {
  title: "",
  description: "",
  sessionLink: "",
  sessionDateTime: "",
  durationMinutes: 120,
  gradeId: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatForInput(date: string) {
  const value = new Date(date);
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function statusLabel(status: LiveSession["status"]) {
  switch (status) {
    case "Upcoming":
      return "قادمة";
    case "Live":
      return "مباشرة";
    case "Finished":
      return "انتهت";
  }
}

function statusClass(status: LiveSession["status"]) {
  switch (status) {
    case "Upcoming":
      return "bg-[#FFC43D]/10 text-[#B7791F]";
    case "Live":
      return "bg-[#06D6A0]/10 text-[#047857]";
    case "Finished":
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [codes, setCodes] = useState<SessionCode[]>([]);
  const [codeAnalytics, setCodeAnalytics] = useState<SessionAnalytics | null>(
    null,
  );
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(
    null,
  );
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCodesLoading, setIsCodesLoading] = useState(false);
  const [filterGrade, setFilterGrade] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customCodeCount, setCustomCodeCount] = useState(50);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesGrade = !filterGrade || session.gradeId === filterGrade;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        session.title.toLowerCase().includes(query) ||
        session.description?.toLowerCase().includes(query);

      return matchesGrade && matchesSearch;
    });
  }, [sessions, filterGrade, searchQuery]);

  const fetchInitialData = async () => {
    try {
      const [sessionsRes, gradesRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/grades"),
      ]);
      const [sessionsData, gradesData] = await Promise.all([
        sessionsRes.json(),
        gradesRes.json(),
      ]);

      setSessions(sessionsData);
      setGrades(gradesData);
    } catch {
      showToast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingSession(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (session: LiveSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      sessionLink: session.sessionLink || "",
      sessionDateTime: formatForInput(session.sessionDateTime),
      durationMinutes: session.durationMinutes,
      gradeId: session.gradeId,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      showToast.error("عنوان الحصة مطلوب");
      return;
    }

    if (!formData.gradeId) {
      showToast.error("الصف الدراسي مطلوب");
      return;
    }

    try {
      new URL(formData.sessionLink);
    } catch {
      showToast.error("رابط الحصة غير صالح");
      return;
    }

    const payload = {
      ...formData,
      description: formData.description || null,
      durationMinutes: Number(formData.durationMinutes),
      sessionDateTime: new Date(formData.sessionDateTime).toISOString(),
    };

    try {
      const response = await fetch(
        editingSession ? `/api/sessions/${editingSession.id}` : "/api/sessions",
        {
          method: editingSession ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء حفظ الحصة");
      }

      showToast.success(
        editingSession
          ? "تم تحديث الحصة بنجاح"
          : "تم إنشاء الحصة بنجاح",
      );
      setShowForm(false);
      resetForm();
      fetchInitialData();
    } catch (error) {
      showToast.error(getErrorMessage(error, "حدث خطأ أثناء حفظ الحصة"));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/sessions/${deleteConfirm}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("فشل حذف الحصة");

      showToast.success("تم حذف الحصة بنجاح");
      setDeleteConfirm(null);
      if (selectedSession?.id === deleteConfirm) {
        setSelectedSession(null);
        setCodes([]);
      }
      fetchInitialData();
    } catch {
      showToast.error("حدث خطأ أثناء حذف الحصة");
    }
  };

  const loadCodes = async (session: LiveSession) => {
    setSelectedSession(session);
    setIsCodesLoading(true);

    try {
      const response = await fetch(`/api/sessions/${session.id}/codes`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء جلب الأكواد");
      }

      setCodes(data.codes);
      setCodeAnalytics(data.analytics);
    } catch (error) {
      showToast.error(getErrorMessage(error, "حدث خطأ أثناء جلب الأكواد"));
    } finally {
      setIsCodesLoading(false);
    }
  };

  const generateCodes = async (count: number) => {
    if (!selectedSession) {
      showToast.error("اختر الحصة أولاً");
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء إنشاء الأكواد");
      }

      setCodes(data.codes);
      setCodeAnalytics(data.analytics);
      showToast.success(`تم إنشاء ${count} كود بنجاح`);
      fetchInitialData();
    } catch (error) {
      showToast.error(getErrorMessage(error, "حدث خطأ أثناء إنشاء الأكواد"));
    }
  };

  const exportExcel = async () => {
    if (!selectedSession) return;

    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}/export`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء التصدير");
      }

      const summaryRows = [
        ["Session", data.session.title],
        ["Grade", data.session.grade],
        ["Date", data.session.sessionDateTime],
        ["Generated Codes", data.analytics.totalGenerated],
        ["Redeemed Codes", data.analytics.redeemedCodes],
        ["Unused Codes", data.analytics.unusedCodes],
        ["Attendance Rate", `${data.analytics.attendanceRate}%`],
      ];
      const codeRows = data.codes.map((item: ExportCodeRow) => ({
        Code: item.code,
        Redeemed: item.isRedeemed ? "Yes" : "No",
        "Redeemed At": item.redeemedAt,
        "Entered At": item.enteredAt,
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(summaryRows),
        "Summary",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(codeRows),
        "Codes",
      );
      XLSX.writeFile(workbook, `${selectedSession.title}-codes.xlsx`);
    } catch (error) {
      showToast.error(getErrorMessage(error, "حدث خطأ أثناء التصدير"));
    }
  };

  const printCards = () => {
    if (!selectedSession) return;
    window.open(`/admin/sessions/${selectedSession.id}/print`, "_blank");
  };

  const exportPdf = () => {
    printCards();
    showToast.success("استخدم أمر الطباعة واختر Save as PDF");
  };

  return (
    <div>
      <PageHeader
        title="إدارة الحصص المباشرة"
        description="إنشاء حصص مباشرة وتوليد أكواد دخول للطلاب"
        action={
          <button
            onClick={openCreateForm}
            className="px-6 py-3 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            إضافة حصة جديدة
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Generated Codes</p>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.reduce(
              (total, session) => total + session.analytics.totalGenerated,
              0,
            )}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Redeemed Codes</p>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.reduce(
              (total, session) => total + session.analytics.redeemedCodes,
              0,
            )}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Live Sessions</p>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.filter((session) => session.status === "Live").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
          />
          <select
            value={filterGrade}
            onChange={(event) => setFilterGrade(event.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
          >
            <option value="">كل الصفوف</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    الحصة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    الصف
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    الميعاد
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    الحضور
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
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      لا توجد حصص مباشرة
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {session.title}
                        </div>
                        {session.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {session.description.substring(0, 60)}
                            {session.description.length > 60 && "..."}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.grade.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.formattedSessionDateTime}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(session.status)}`}
                        >
                          {statusLabel(session.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.analytics.redeemedCodes}/
                        {session.analytics.totalGenerated} (
                        {session.analytics.attendanceRate}%)
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadCodes(session)}
                            className="text-[#1B9AAA] hover:text-[#06D6A0] font-semibold"
                          >
                            تفاصيل
                          </button>
                          <button
                            onClick={() => openEditForm(session)}
                            className="text-[#9B59B6] hover:text-[#8E44AD] font-semibold"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(session.id)}
                            className="text-[#EF476F] hover:text-red-600 font-semibold"
                          >
                            حذف
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

        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          {!selectedSession ? (
            <div className="text-center py-10 text-gray-500">
              اختر حصة لعرض الأكواد والإحصائيات
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {selectedSession.title}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                {selectedSession.grade.name} -{" "}
                {selectedSession.formattedSessionDateTime}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Generated Codes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {codeAnalytics?.totalGenerated ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Redeemed Codes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {codeAnalytics?.redeemedCodes ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Unused Codes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {codeAnalytics?.unusedCodes ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Attendance Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {codeAnalytics?.attendanceRate ?? 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 200].map((count) => (
                    <button
                      key={count}
                      onClick={() => generateCodes(count)}
                      className="px-3 py-2 rounded-xl bg-[#1B9AAA]/10 text-[#1B9AAA] font-bold hover:bg-[#1B9AAA]/20"
                    >
                      Generate {count}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={customCodeCount}
                    onChange={(event) =>
                      setCustomCodeCount(Number(event.target.value))
                    }
                    className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-xl"
                  />
                  <button
                    onClick={() => generateCodes(customCodeCount)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white font-bold"
                  >
                    Generate
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={printCards}
                    className="px-3 py-2 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                  >
                    Print Cards
                  </button>
                  <button
                    onClick={exportExcel}
                    className="px-3 py-2 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={exportPdf}
                    className="px-3 py-2 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                  >
                    Export PDF
                  </button>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">
                {isCodesLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    جاري التحميل...
                  </div>
                ) : codes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    لم يتم إنشاء أكواد بعد
                  </div>
                ) : (
                  codes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="font-mono text-sm" dir="ltr">
                        {code.code}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          code.isRedeemed
                            ? "bg-[#06D6A0]/10 text-[#047857]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {code.isRedeemed ? "مستخدم" : "غير مستخدم"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] p-6 text-white">
              <h2 className="text-2xl font-bold">
                {editingSession ? "تعديل الحصة" : "إضافة حصة جديدة"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Session Link *
                </label>
                <input
                  type="url"
                  value={formData.sessionLink}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      sessionLink: event.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Session Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.sessionDateTime}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        sessionDateTime: event.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.durationMinutes}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        durationMinutes: Number(event.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Grade *
                  </label>
                  <select
                    value={formData.gradeId}
                    onChange={(event) =>
                      setFormData({ ...formData, gradeId: event.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B9AAA] focus:border-transparent outline-none"
                  >
                    <option value="">-- اختر --</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  {editingSession ? "تحديث الحصة" : "إنشاء الحصة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 text-center mb-6">
              هل أنت متأكد من حذف هذه الحصة؟ سيتم حذف الأكواد والحضور معها.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
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
