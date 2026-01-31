"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  grade: string;
  score: string;
  image: string;
  isVisible: boolean;
};

export default function BestStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students?visibleOnly=true");
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <section id="best-students" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </section>
    );
  }

  if (students.length === 0) {
    return null; // Don't show section if no students
  }

  return (
    <section id="best-students" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#FFC43D]/10 text-[#FFC43D] rounded-full text-sm font-semibold mb-4">
            لوحة الشرف
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            الطلاب المتفوقين
          </h2>
          <p className="text-lg text-gray-600">
            نفتخر بطلابنا المتفوقين الذين حققوا أعلى الدرجات بفضل جهدهم
            واجتهادهم
          </p>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {students.map((student, index) => (
            <div
              key={student.id}
              className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 card-hover text-center group"
            >
              {/* Rank Badge */}
              {index < 3 && (
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                    index === 0
                      ? "bg-[#FFC43D]"
                      : index === 1
                        ? "bg-gray-400"
                        : "bg-amber-600"
                  }`}
                >
                  {index + 1}
                </div>
              )}

              {/* Student Image */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                      <Image
                        src={student.image}
                        alt={student.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                {student.name}
              </h3>
              <p className="text-gray-500 text-xs mb-3">{student.grade}</p>

              {/* Score Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#06D6A0]/10 to-[#1B9AAA]/10 rounded-full">
                <svg
                  className="w-4 h-4 text-[#FFC43D]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold text-[#1B9AAA]">
                  {student.score}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-[#FFC43D]/10 to-[#06D6A0]/10 rounded-2xl">
            <div className="text-center sm:text-right">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                هل تريد أن تكون من المتفوقين؟
              </h3>
              <p className="text-gray-600">انضم إلينا الآن وابدأ رحلة التفوق</p>
            </div>
            <a
              href="https://wa.me/201023144722"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary whitespace-nowrap"
            >
              سجل الآن
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
