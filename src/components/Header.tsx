"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/#hero", label: "الرئيسية" },
  { href: "/#about", label: "من أنا" },
  { href: "/#services", label: "الخدمات" },
  { href: "/#feedback", label: "آراء الطلاب" },
  { href: "/#best-students", label: "لوحة الشرف" },
  { href: "/#schedule", label: "المواعيد" },
  { href: "/#contact", label: "تواصل معنا" },
];

const quickLinks = [
  {
    href: "/sessions",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    label: "الحصص المباشرة",
    color: "#FFC43D",
  },
  {
    href: "/quizzes",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    label: "الاختبارات",
    color: "#1B9AAA",
  },
  {
    href: "https://sema3ny.vercel.app/",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    ),
    label: "نطق الكلمات",
    color: "#06D6A0",
    external: true,
  },
  {
    href: "/answers",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    label: "اجابات الكتب",
    color: "#EF476F",
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="مستر خالد مرسي"
              width={80}
              height={80}
              className="object-contain"
              priority
              suppressHydrationWarning
            />
            <span
              className={`font-bold text-lg hidden sm:block ${isScrolled ? "text-gray-900" : "text-gray-900"}`}
            >
              مستر خالد مرسي
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#1B9AAA]/10 hover:text-[#1B9AAA] ${
                  isScrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                {link.label}
              </a>
            ))}
            {status === "authenticated" ? (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white hover:shadow-lg"
              >
                لوحة التحكم
              </Link>
            ) : (
              <a
                href="/#quick-links"
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white hover:shadow-lg"
              >
                الروابط السريعة
              </a>
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="https://wa.me/201023144722"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-success flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>احجز الآن</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-2xl shadow-xl mt-2 p-4 animate-fadeInUp">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-[#1B9AAA]/10 hover:text-[#1B9AAA] transition-colors"
                >
                  {link.label}
                </a>
              ))}

              {status === "authenticated" ? (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all duration-300 text-center bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0]"
                >
                  لوحة التحكم
                </Link>
              ) : (
                <a
                  href="/#quick-links"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all duration-300 text-center bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0]"
                >
                  الروابط السريعة
                </a>
              )}

              {/* Quick Links Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-bold text-gray-700 px-4 mb-3">
                  الروابط السريعة
                </p>
                <div className="flex flex-col gap-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      {...(link.external && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-3"
                      style={{
                        background: `linear-gradient(to bottom right, ${link.color}, ${link.color}dd)`,
                      }}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <a
                href="https://wa.me/201023144722"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-success text-center mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                احجز الآن
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
