import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | مستر خالد مرسي",
  description: "تسجيل دخول المعلم إلى لوحة التحكم",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
