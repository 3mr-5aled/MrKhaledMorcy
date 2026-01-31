import { ConditionalLayout } from "@/components/ConditionalLayout";
import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "مستر خالد مرسي | مدرس لغة إنجليزية معتمد من Cambridge",
  description:
    "مستر خالد مرسي - مدرس معتمد من جامعة Cambridge البريطانية بخبرة 26 سنة في تدريس اللغة الإنجليزية. حصص لايف، مسجلة، واوفلاين.",
  keywords: [
    "مستر خالد مرسي",
    "تعليم انجليزي",
    "Cambridge",
    "IELTS",
    "CELTA",
    "دروس انجليزي",
  ],
  authors: [{ name: "مستر خالد مرسي" }],
  icons: {
    icon: "/images/logo.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "مستر خالد مرسي | مدرس لغة إنجليزية معتمد من Cambridge",
    description:
      "مستر خالد مرسي - مدرس معتمد من جامعة Cambridge البريطانية بخبرة 26 سنة في تدريس اللغة الإنجليزية.",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "مستر خالد مرسي - مدرس لغة إنجليزية معتمد من Cambridge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مستر خالد مرسي | مدرس لغة إنجليزية معتمد من Cambridge",
    description:
      "مستر خالد مرسي - مدرس معتمد من جامعة Cambridge البريطانية بخبرة 26 سنة في تدريس اللغة الإنجليزية.",
    images: ["/images/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} font-cairo antialiased bg-white text-gray-900`}
      >
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
