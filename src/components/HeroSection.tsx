"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const heroImages = [
  { src: "/images/hero-bg.png", alt: "Golden Kenyan Savannah" },
  { src: "/images/gallery/savannah_green.png", alt: "Lush Savannah" },
  { src: "/images/gallery/rift_valley_gold.png", alt: "Golden Rift Valley" },
  { src: "/images/gallery/swahili_blue.png", alt: "Swahili Coast" },
  { src: "/images/gallery/city_lights_charcoal.png", alt: "Nairobi City Lights" }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000); // Change image every 6 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero-section" className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 w-full h-full">
        {heroImages.map((image, index) => (
          <div
            key={image.src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={true}
              className="object-cover object-center"
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}
        {/* Subtle overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Floating Glassmorphic Card */}
      <div className="relative z-10 w-[90%] max-w-[800px] glass rounded-[24px] p-8 md:p-12 shadow-2xl animate-fade-in-up">
        
        <div className="text-center mb-8">
          <p className="text-[color:var(--color-primary)] font-bold italic text-2xl mb-4 font-[family-name:var(--font-playfair)]">Lens.ke</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[color:var(--color-text)] tracking-tight leading-tight">
            Kenya's Premium Visual Archive & Stock Photography
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-5 text-lg border-2 border-transparent rounded-full shadow-lg bg-white/95 placeholder-gray-400 focus:outline-none focus:border-[color:var(--color-primary)] transition-colors"
            placeholder="Search for lions, Nairobi streets, or Maasai culture..."
            aria-label="Search images"
          />
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-[color:var(--color-text)] opacity-80">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-[color:var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Royalty-Free
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-[color:var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Support Local Creators
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-[color:var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            High-Res RAW/PNG
          </div>
        </div>
      </div>
    </section>
  );
}
