"use client";

import { useState } from "react";

interface FileDeleteInfo {
  id: string;
  path: string;
  size: number;
  type: string;
  usedIn: string;
  linkedRecordId: string | null;
  isOrphaned: boolean;
}

interface ConfirmBulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  files: FileDeleteInfo[];
  isDeleting: boolean;
}

export default function ConfirmBulkDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  files,
  isDeleting,
}: ConfirmBulkDeleteModalProps) {
  const [reason, setReason] = useState("");
  const [understood, setUnderstood] = useState(false);

  if (!isOpen) return null;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const orphanedCount = files.filter((f) => f.isOrphaned).length;
  const linkedCount = files.length - orphanedCount;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const typeBreakdown = files.reduce(
    (acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleConfirm = () => {
    if (!understood) return;
    onConfirm(reason || "حذف جماعي من إدارة الملفات");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-red-600">
            ⚠️ تأكيد حذف الملفات
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isDeleting}
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

        {/* Summary Stats */}
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <h3 className="mb-3 font-semibold text-red-900">ملخص العملية:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">عدد الملفات:</span>
              <span className="mr-2 font-bold text-red-700">
                {files.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">الحجم الإجمالي:</span>
              <span className="mr-2 font-bold text-red-700">
                {formatBytes(totalSize)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">ملفات يتيمة:</span>
              <span className="mr-2 font-bold text-green-700">
                {orphanedCount}
              </span>
            </div>
            <div>
              <span className="text-gray-600">ملفات مرتبطة:</span>
              <span className="mr-2 font-bold text-yellow-700">
                {linkedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">
            التقسيم حسب النوع:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <div
                key={type}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm"
              >
                <span className="font-medium">{type}:</span>{" "}
                <span className="text-blue-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {linkedCount > 0 && (
          <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
            <h3 className="mb-2 flex items-center font-semibold text-yellow-900">
              <svg
                className="ml-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              تحذير: ملفات مرتبطة بسجلات
            </h3>
            <p className="text-sm text-yellow-800">
              هناك {linkedCount} ملف مرتبط بإجابات أو طلاب. سيتم حفظ نسخة
              احتياطية من هذه الملفات (آخر 5 إصدارات) قبل الحذف. يمكنك استعادتها
              لاحقاً من قسم الإصدارات.
            </p>
          </div>
        )}

        {/* File List (max 10 shown) */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">
            الملفات المحددة:
            {files.length > 10 && (
              <span className="mr-2 text-sm text-gray-600">
                (عرض أول 10 من {files.length})
              </span>
            )}
          </h3>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {files.slice(0, 10).map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded border border-gray-200 bg-white p-2 text-sm"
              >
                <div className="flex-1 truncate">
                  <span
                    className={`ml-2 inline-block h-2 w-2 rounded-full ${
                      file.isOrphaned ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></span>
                  <span className="text-gray-700" title={file.path}>
                    {file.path}
                  </span>
                </div>
                <span className="mr-3 text-gray-500">
                  {formatBytes(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            سبب الحذف (اختياري):
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبب حذف هذه الملفات..."
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={3}
            disabled={isDeleting}
          />
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <label className="flex cursor-pointer items-start">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="ml-3 mt-1 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              disabled={isDeleting}
            />
            <span className="text-sm text-red-900">
              <strong>أنا أفهم</strong> أن هذه العملية ستقوم بحذف{" "}
              <strong>{files.length}</strong> ملف. سيتم حفظ نسخة احتياطية
              للملفات المرتبطة (آخر 5 إصدارات) ويمكن استعادتها لمدة محدودة.
              الملفات اليتيمة سيتم حذفها بشكل دائم بعد فترة.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            disabled={isDeleting}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!understood || isDeleting}
            className="flex items-center rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <svg
                  className="ml-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
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
                جاري الحذف...
              </>
            ) : (
              <>
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
                حذف {files.length} ملف
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
