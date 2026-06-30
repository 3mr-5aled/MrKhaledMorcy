"use client";

import QRCode from "qrcode";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Printer, ArrowRight } from "lucide-react";
import Link from "next/link";

type PrintCode = {
  id: string;
  code: string;
  isRedeemed: boolean;
};

type PrintPayload = {
  session: {
    title: string;
    grade: {
      name: string;
    };
  };
  codes: PrintCode[];
};

export default function PrintSessionCodesPage() {
  const params = useParams();
  const [payload, setPayload] = useState<PrintPayload | null>(null);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCodes();
  }, [params.id]);

  const fetchCodes = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/codes`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setPayload(data);
      const origin = window.location.origin;
      const entries = await Promise.all(
        data.codes.map(async (item: PrintCode) => {
          const url = `${origin}/sessions?code=${encodeURIComponent(item.code)}`;
          const qr = await QRCode.toDataURL(url, {
            margin: 1,
            width: 200,
            errorCorrectionLevel: "H",
          });
          return [item.code, qr] as const;
        }),
      );

      setQrCodes(Object.fromEntries(entries));
    } catch (error) {
      console.error("Error loading print cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        جاري تجهيز الكروت...
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        تعذر تحميل الأكواد
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        /* Hide the sidebar and reset main layout padding when viewing print page */
        @media screen, print {
          aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }

        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .print-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            background: white !important;
          }

          .print-grid {
            display: grid !important;
            grid-template-columns: 90mm 90mm !important;
            gap: 10mm !important;
            justify-content: center !important;
            align-content: start !important;
          }

          .code-card {
            width: 90mm !important;
            height: 55mm !important;
            min-height: 55mm !important;
            max-height: 55mm !important;
            margin: 0 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 1px solid #e2e8f0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* Header toolbar on screen */}
      <div className="no-print max-w-5xl mx-auto px-4 mb-6 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm" dir="rtl">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/sessions"
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-200"
            title="العودة للحصص"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 font-cairo">طباعة كروت الحضور</h1>
            <p className="text-xs text-gray-500 font-bold mt-1 font-cairo">
              {payload.session.title} &bull; {payload.session.grade.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] hover:shadow-lg transition-all cursor-pointer text-white rounded-xl font-extrabold font-cairo"
        >
          <Printer className="w-5 h-5" />
          طباعة الكروت
        </button>
      </div>

      {/* Printable Sheet */}
      <main className="print-sheet max-w-5xl mx-auto bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm print:border-none print:p-0">
        <div className="print-grid grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-[10mm] print:justify-center">
          {payload.codes.map((item, index) => (
            <article
              key={item.id}
              className="code-card relative flex flex-row items-stretch justify-between p-4 bg-gradient-to-br from-white via-white to-gray-50/30 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden text-right select-none"
              dir="rtl"
            >
              {/* Brand Accent Side Bar */}
              <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#1B9AAA] to-[#06D6A0]" />

              {/* Right content area: info & code */}
              <div className="flex flex-col justify-between flex-1 pr-3.5 min-w-0">
                {/* Header branding */}
                <div className="flex items-center gap-1.5">
                  <div className="w-[26px] h-[26px] rounded-md bg-white p-0.5 flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0">
                    <img
                      src="/images/logo.png"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-[#1B9AAA] text-[10px] leading-none truncate font-cairo">مستر خالد مرسي</span>
                    <span className="text-[7.5px] text-[#06D6A0] font-black leading-none uppercase tracking-wide font-cairo">English Academy</span>
                  </div>
                </div>

                {/* Session detail & badges */}
                <div className="flex flex-col justify-center min-w-0 my-1.5">
                  <h2 className="text-[11px] font-black text-gray-800 line-clamp-2 leading-tight tracking-normal mb-1 font-cairo">
                    {payload.session.title}
                  </h2>
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="inline-block text-[8px] font-bold text-[#1B9AAA] bg-[#1B9AAA]/10 px-1.5 py-0.5 rounded">
                      {payload.session.grade.name}
                    </span>
                    <span className="inline-block text-[8px] font-bold text-[#06D6A0] bg-[#06D6A0]/10 px-1.5 py-0.5 rounded">
                      حصة تفاعلية
                    </span>
                  </div>
                </div>

                {/* Activation code */}
                <div>
                  <div className="text-[8px] text-[#475569] font-bold mb-0.5 font-cairo">كود تفعيل الحصة:</div>
                  <code className="font-mono text-xs font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 tracking-wider select-all inline-block" dir="ltr">
                    {item.code}
                  </code>
                </div>
              </div>

              {/* Left content area: QR Code & logo */}
              <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                <div className="relative w-[96px] h-[96px] bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                  {qrCodes[item.code] && (
                    <img
                      src={qrCodes[item.code]}
                      alt={item.code}
                      className="w-full h-full"
                    />
                  )}
                  {/* Central QR Code Logo Overlay */}
                  <div className="absolute inset-0 m-auto w-[24px] h-[24px] bg-white rounded-full p-0.5 shadow-md flex items-center justify-center border border-gray-100">
                    <img
                      src="/images/logo.png"
                      alt="Logo"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
                <span className="text-[7.5px] text-[#64748b] font-extrabold text-center font-cairo">
                  امسح الكود للتسجيل السريع
                </span>
              </div>

              {/* Serial Number at Bottom-Left */}
              <div className="absolute bottom-3 left-3 text-xs font-black text-slate-800 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 font-mono shadow-sm" dir="ltr">
                S/N: {index + 1}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
