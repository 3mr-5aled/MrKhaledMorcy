"use client";

import QRCode from "qrcode";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
            width: 120,
            errorCorrectionLevel: "M",
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
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            width: auto !important;
            min-height: auto !important;
          }

          .code-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="no-print max-w-5xl mx-auto px-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Print Codes</h1>
          <p className="text-gray-600">
            {payload.session.title} - {payload.session.grade.name}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white rounded-xl font-bold"
        >
          Print Cards
        </button>
      </div>

      <main className="print-sheet max-w-5xl mx-auto bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
          {payload.codes.map((item) => (
            <article
              key={item.id}
              className="code-card border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[190px] flex flex-col items-center justify-between text-center"
            >
              <div>
                <p className="text-sm font-bold text-gray-700">
                  {payload.session.grade.name}
                </p>
                <h2 className="text-base font-bold text-gray-900 mt-1 line-clamp-2">
                  {payload.session.title}
                </h2>
              </div>

              {qrCodes[item.code] && (
                <img
                  src={qrCodes[item.code]}
                  alt={item.code}
                  className="w-24 h-24"
                />
              )}

              <div>
                <p className="font-mono text-lg font-bold text-gray-900" dir="ltr">
                  {item.code}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Scan QR or enter code
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
