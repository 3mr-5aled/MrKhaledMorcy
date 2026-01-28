"use client";

import testimonialsData from "@/data/testimonials.json";
import { useEffect, useState } from "react";

export default function Feedback() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = testimonialsData.testimonials;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section id="feedback" className="section-padding bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#EF476F]/10 text-[#EF476F] rounded-full text-sm font-semibold mb-4">
            آراء الطلاب
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ماذا يقول طلابنا؟
          </h2>
          <p className="text-lg text-gray-600">
            آراء حقيقية من طلاب استفادوا من الحصص والدورات التعليمية
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Main Testimonial */}
          <div className="relative bg-gradient-to-br from-[#1B9AAA]/5 to-[#06D6A0]/5 rounded-3xl p-8 sm:p-12 mb-8">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 text-[#1B9AAA]/20">
              <svg
                className="w-16 h-16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Testimonial Content */}
              <div className="min-h-[200px] flex flex-col justify-center">
                <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed mb-8 text-center">
                  &ldquo;{testimonials[currentIndex].quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center text-white text-2xl font-bold">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-gray-500">
                      {testimonials[currentIndex].grade}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[#1B9AAA]"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="text-3xl font-bold text-[#1B9AAA] mb-2">1000+</div>
            <div className="text-gray-600">طالب سعيد</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="text-3xl font-bold text-[#06D6A0] mb-2">98%</div>
            <div className="text-gray-600">نسبة الرضا</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="text-3xl font-bold text-[#FFC43D] mb-2">500+</div>
            <div className="text-gray-600">حصة مسجلة</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="text-3xl font-bold text-[#EF476F] mb-2">26</div>
            <div className="text-gray-600">سنة خبرة</div>
          </div>
        </div>
      </div>
    </section>
  );
}
