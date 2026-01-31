import { BookOpen, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black text-primary/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 rounded-full p-8 animate-pulse">
              <Search className="w-16 h-16 md:w-24 md:h-24 text-primary" />
            </div>
          </div>
        </div>

        {/* Arabic Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          عذراً، الصفحة غير موجودة
        </h2>

        {/* English Subtitle */}
        <p className="text-lg md:text-xl text-foreground/70 mb-2">
          Page Not Found
        </p>

        {/* Description */}
        <p className="text-foreground/60 mb-8 max-w-md mx-auto">
          الصفحة التي تبحث عنها قد تكون قد تم نقلها أو حذفها أو لم تكن موجودة من
          الأساس.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
          >
            <Home className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </Link>

          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
          >
            <BookOpen className="w-5 h-5" />
            تصفح الدروس
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-12 pt-8 border-t border-foreground/10">
          <p className="text-foreground/50 text-sm mb-4">روابط مفيدة:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/quizzes"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              الاختبارات
            </Link>
            <Link
              href="/answers"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              الإجابات
            </Link>
            <Link
              href="/pronunciation"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              النطق
            </Link>
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
