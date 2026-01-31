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

// Safely get the base URL for metadata
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
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
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    images: [
      {
        url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/images/og-banner.jpg`,
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
    images: [
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/images/og-banner.jpg`,
    ],
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
