"use client";

import FloatingQuickLinks from "@/components/FloatingQuickLinks";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname?.startsWith("/admin") || pathname?.startsWith("/login");
  const isQuizPage = pathname?.match(/^\/quizzes\/[^\/]+$/);
  const isMaintenancePage = pathname === "/maintenance";

  return (
    <>
      {!isAdminPage && !isQuizPage && !isMaintenancePage && <Header />}
      <main>{children}</main>
      {!isAdminPage && !isQuizPage && !isMaintenancePage && <Footer />}
      {!isAdminPage && !isQuizPage && !isMaintenancePage && (
        <FloatingWhatsApp />
      )}
      {!isAdminPage && !isQuizPage && !isMaintenancePage && (
        <FloatingQuickLinks />
      )}
    </>
  );
}
