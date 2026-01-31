"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  gradeId: string;
  studentGrade: number;
  testGrade: number;
  position: "FIRST" | "SECOND" | "THIRD" | "NONE";
  image: string | null;
  isVisible: boolean;
  grade: {
    id: string;
    name: string;
    slug: string;
    stage: string;
    color: string | null;
  };
};

type Grade = {
  id: string;
  name: string;
  slug: string;
  stage: string;
  color: string | null;
  order: number;
};

export default function BestStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grades
        const gradesResponse = await fetch("/api/grades");
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          console.log("[BestStudents] Fetched grades:", gradesData);
          // Sort grades by order
          const sortedGrades = gradesData.sort(
            (a: Grade, b: Grade) => a.order - b.order,
          );
          setGrades(sortedGrades);
          // Set first grade as default
          if (sortedGrades.length > 0) {
            setSelectedGradeId(sortedGrades[0].id);
          }
        } else {
          console.error(
            "[BestStudents] Failed to fetch grades:",
            gradesResponse.status,
          );
        }
      } catch (error) {
        console.error("[BestStudents] Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedGradeId) return;

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const url = `/api/students?visibleOnly=true&gradeId=${selectedGradeId}`;
        console.log("[BestStudents] Fetching students from:", url);
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log(
            `[BestStudents] Fetched ${data.length} students for grade ${selectedGradeId}`,
          );
          setStudents(data);
          setCurrentPage(1); // Reset to first page when grade changes
        } else {
          console.error(
            "[BestStudents] Failed to fetch students:",
            response.status,
          );
        }
      } catch (error) {
        console.error("[BestStudents] Error fetching students:", error);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedGradeId]);

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(
    indexOfFirstStudent,
    indexOfLastStudent,
  );
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of section
    document
      .getElementById("best-students")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <section id="best-students" className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B9AAA] mb-4"></div>
            <p className="text-gray-600">جاري تحميل لوحة الشرف...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no grades exist at all
  if (grades.length === 0) {
    return null;
  }

  return (
    <section id="best-students" className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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

        {/* Grade Filter */}
        {grades.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGradeId(grade.id)}
                  disabled={studentsLoading}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedGradeId === grade.id
                      ? "bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                  style={
                    selectedGradeId === grade.id && grade.color
                      ? {
                          background: `linear-gradient(135deg, ${grade.color} 0%, ${grade.color}dd 100%)`,
                        }
                      : {}
                  }
                >
                  {grade.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Students Grid or Empty Message */}
        {studentsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B9AAA] mb-4"></div>
            <p className="text-gray-600">جاري تحميل الطلاب...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              لا يوجد طلاب في هذا الصف حالياً
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {currentStudents.map((student) => {
                // Determine badge based on position
                const getPositionBadge = () => {
                  if (student.position === "FIRST") {
                    return { emoji: "🥇", color: "bg-[#FFC43D]" };
                  } else if (student.position === "SECOND") {
                    return { emoji: "🥈", color: "bg-gray-400" };
                  } else if (student.position === "THIRD") {
                    return { emoji: "🥉", color: "bg-amber-600" };
                  }
                  return null;
                };

                const positionBadge = getPositionBadge();

                return (
                  <div
                    key={student.id}
                    className="relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 card-hover text-center group"
                  >
                    {/* Position Badge */}
                    {positionBadge && (
                      <div
                        className={`absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${positionBadge.color}`}
                      >
                        {positionBadge.emoji}
                      </div>
                    )}

                    {/* Student Image */}
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] p-0.5">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
                            {student.image ? (
                              <Image
                                src={student.image}
                                alt={student.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-3xl">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                      {student.name}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3">
                      {student.grade.name}
                    </p>

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
                        {student.studentGrade}/{student.testGrade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-[#1B9AAA] hover:text-white shadow-sm"
                  }`}
                >
                  السابق
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-[#1B9AAA] hover:text-white shadow-sm"
                  }`}
                >
                  التالي
                </button>
              </div>
            )}

            {/* CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-[#FFC43D]/10 to-[#06D6A0]/10 rounded-2xl">
                <div className="text-center sm:text-right">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    هل تريد أن تكون من المتفوقين؟
                  </h3>
                  <p className="text-gray-600">
                    انضم إلينا الآن وابدأ رحلة التفوق
                  </p>
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
          </>
        )}
      </div>
    </section>
  );
}
