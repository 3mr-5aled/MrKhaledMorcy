import Sidebar from "@/components/admin/Sidebar";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "لوحة التحكم | مستر خالد مرسي",
  description: "لوحة تحكم المعلم لإدارة المحتوى التعليمي",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row-reverse">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
