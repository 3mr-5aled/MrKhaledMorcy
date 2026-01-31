"use client";

import ConfirmBulkDeleteModal from "@/components/admin/ConfirmBulkDeleteModal";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface FileRecord {
  id: string;
  path: string;
  type: string;
  size: number;
  originalName: string;
  mimeType: string | null;
  usedIn: string;
  linkedRecordId: string | null;
  uploadedBy: string | null;
  uploader: { id: string; name: string | null; email: string } | null;
  isOrphaned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  versions: Array<{
    id: string;
    versionNumber: number;
    createdAt: string;
  }>;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  orphanedFiles: number;
  orphanedSize: number;
}

interface FileResponse {
  files: FileRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: FileStats;
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [stats, setStats] = useState<FileStats>({
    totalFiles: 0,
    totalSize: 0,
    orphanedFiles: 0,
    orphanedSize: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterUsedIn, setFilterUsedIn] = useState("");
  const [filterOrphaned, setFilterOrphaned] = useState("");
  const [filterActive, setFilterActive] = useState("true");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Version modal
  const [selectedFileForVersions, setSelectedFileForVersions] =
    useState<FileRecord | null>(null);
  const [showVersionsModal, setShowVersionsModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [
    pagination.page,
    filterType,
    filterUsedIn,
    filterOrphaned,
    filterActive,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (filterType) params.append("type", filterType);
      if (filterUsedIn) params.append("usedIn", filterUsedIn);
      if (filterOrphaned) params.append("isOrphaned", filterOrphaned);
      if (filterActive) params.append("isActive", filterActive);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/files?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch files");

      const data: FileResponse = await res.json();
      setFiles(data.files);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("فشل تحميل الملفات");
    } finally {
      setLoading(false);
    }
  };

  const handleScanOrphans = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan" }),
      });

      if (!res.ok) throw new Error("Failed to scan");

      const data = await res.json();
      toast.success(
        `تم الفحص: ${data.results.newOrphans} ملف يتيم جديد، ${data.results.untrackedFiles} ملف غير مسجل`,
      );
      fetchFiles();
    } catch (error) {
      console.error("Error scanning:", error);
      toast.error("فشل فحص الملفات");
    } finally {
      setScanning(false);
    }
  };

  const handleBulkDelete = async (reason: string) => {
    setDeleting(true);
    try {
      const fileIds = Array.from(selectedFiles);
      const res = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds, reason }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      const data = await res.json();
      toast.success(data.message);
      setSelectedFiles(new Set());
      setShowDeleteModal(false);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error("فشل حذف الملفات");
    } finally {
      setDeleting(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const selectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSelectedFilesInfo = () => {
    return files.filter((f) => selectedFiles.has(f.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            📁 إدارة الملفات
          </h1>
          <p className="text-gray-600">
            إدارة شاملة لجميع الملفات المرفوعة مع إمكانية التتبع والتحكم
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">إجمالي الملفات</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.totalFiles}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatBytes(stats.totalSize)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">ملفات يتيمة</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.orphanedFiles}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatBytes(stats.orphanedSize)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">ملفات نشطة</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {stats.totalFiles - stats.orphanedFiles}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatBytes(stats.totalSize - stats.orphanedSize)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">محدد</div>
            <div className="mt-1 text-2xl font-bold text-purple-600">
              {selectedFiles.size}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatBytes(
                getSelectedFilesInfo().reduce((sum, f) => sum + f.size, 0),
              )}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow">
          <button
            onClick={handleScanOrphans}
            disabled={scanning}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <svg
                  className="ml-2 h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الفحص...
              </>
            ) : (
              <>
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                فحص الملفات اليتيمة
              </>
            )}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={selectedFiles.size === 0}
            className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="ml-2 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            حذف المحدد ({selectedFiles.size})
          </button>

          <div className="mr-auto flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-2 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-2 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow md:grid-cols-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              النوع
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              <option value="">الكل</option>
              <option value="PDF">PDF</option>
              <option value="IMAGE">صورة</option>
              <option value="THUMBNAIL">صورة مصغرة</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              الاستخدام
            </label>
            <select
              value={filterUsedIn}
              onChange={(e) => setFilterUsedIn(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              <option value="">الكل</option>
              <option value="ANSWER">إجابات</option>
              <option value="STUDENT">طلاب</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              الحالة
            </label>
            <select
              value={filterOrphaned}
              onChange={(e) => setFilterOrphaned(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              <option value="">الكل</option>
              <option value="false">مرتبط</option>
              <option value="true">يتيم</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              نشط
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              <option value="">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ترتيب حسب
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              <option value="createdAt">تاريخ الإنشاء</option>
              <option value="updatedAt">تاريخ التعديل</option>
              <option value="size">الحجم</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              الاتجاه
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <input
            type="text"
            placeholder="بحث في أسماء الملفات والمسارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>

        {/* Files List/Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 animate-spin text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-2 text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
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
            <p className="mt-4 text-lg text-gray-600">
              لا توجد ملفات تطابق المعايير المحددة
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.size === files.length}
                        onChange={selectAll}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      الملف
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      النوع
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      الحجم
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      الاستخدام
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      الحالة
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      التاريخ
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-700">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className={`transition-colors hover:bg-gray-50 ${
                        selectedFiles.has(file.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {file.type === "IMAGE" ? (
                            <img
                              src={file.path}
                              alt={file.originalName}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                              📄
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {file.originalName}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {file.path}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {file.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatBytes(file.size)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            file.usedIn === "ANSWER"
                              ? "bg-green-100 text-green-800"
                              : file.usedIn === "STUDENT"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {file.usedIn === "ANSWER"
                            ? "إجابة"
                            : file.usedIn === "STUDENT"
                              ? "طالب"
                              : "أخرى"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            file.isOrphaned
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {file.isOrphaned ? "يتيم" : "مرتبط"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {file.versions.length > 1 && (
                            <button
                              onClick={() => {
                                setSelectedFileForVersions(file);
                                setShowVersionsModal(true);
                              }}
                              className="rounded p-1 text-blue-600 hover:bg-blue-50"
                              title="عرض الإصدارات"
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          )}
                          <a
                            href={file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                            title="فتح الملف"
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {files.map((file) => (
              <div
                key={file.id}
                className={`relative rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                  selectedFiles.has(file.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="absolute left-2 top-2 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {file.type === "IMAGE" ? (
                  <img
                    src={file.path}
                    alt={file.originalName}
                    className="mb-2 h-32 w-full rounded object-cover"
                  />
                ) : (
                  <div className="mb-2 flex h-32 items-center justify-center rounded bg-gray-100 text-4xl">
                    📄
                  </div>
                )}
                <div className="truncate text-sm font-medium text-gray-900">
                  {file.originalName}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatBytes(file.size)}
                </div>
                <div className="mt-2 flex gap-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      file.isOrphaned
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {file.isOrphaned ? "يتيم" : "مرتبط"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">
              صفحة {pagination.page} من {pagination.totalPages} (
              {pagination.total} ملف)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                السابق
              </button>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmBulkDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
        files={getSelectedFilesInfo()}
        isDeleting={deleting}
      />

      {/* Versions Modal */}
      {showVersionsModal && selectedFileForVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                📚 إصدارات الملف
              </h2>
              <button
                onClick={() => setShowVersionsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
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
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-600">الملف الحالي:</div>
              <div className="mt-1 font-medium">
                {selectedFileForVersions.originalName}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {selectedFileForVersions.path}
              </div>
            </div>
            <div className="space-y-3">
              {selectedFileForVersions.versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        إصدار {version.versionNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(version.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `/api/files/${selectedFileForVersions.id}/versions`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                versionNumber: version.versionNumber,
                              }),
                            },
                          );
                          if (!res.ok) throw new Error("Failed to restore");
                          toast.success("تم استعادة الإصدار بنجاح");
                          setShowVersionsModal(false);
                          fetchFiles();
                        } catch (error) {
                          toast.error("فشل استعادة الإصدار");
                        }
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      استعادة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
