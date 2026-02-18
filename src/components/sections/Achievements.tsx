"use client";

import achievementsData from "@/data/achievements.json";
import Image from "next/image";
import { useState } from "react";

export default function Achievements() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="achievements" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#FFC43D]/10 text-[#FFC43D] rounded-full text-sm font-semibold mb-4">
            الشهادات والجوائز
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            بعض الشهادات والجوائز
          </h2>
          <p className="text-lg text-gray-600">
            شهادات دولية معتمدة في تدريس اللغة الإنجليزية والتنمية البشرية
          </p>
        </div>

        {/* Achievements Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementsData.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="group relative bg-gray-100 rounded-2xl overflow-hidden cursor-pointer card-hover"
              onClick={() => setSelectedImage(achievement.image)}
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={achievement.image}
                  alt={achievement.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  suppressHydrationWarning
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {achievement.description}
                  </p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative max-w-4xl max-h-[80vh] w-full">
              <Image
                src={selectedImage}
                alt="Certificate"
                width={800}
                height={600}
                className="object-contain w-full h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
                suppressHydrationWarning
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
