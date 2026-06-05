"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic", "normal"] });

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
      <div className="relative z-10 w-[95%] max-w-[900px] glass rounded-[32px] px-8 py-[35px] md:px-10 md:py-[43px] mt-16 shadow-2xl animate-fade-in-up">
        
        <div className="text-center mb-8 space-y-4">
          <span className="text-[color:var(--color-primary)] font-bold tracking-[0.3em] uppercase text-xs">
            The Premium Archive
          </span>
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-[color:var(--color-text)] leading-[1.1] tracking-tight ${playfair.className}`}>
            The Soul of <span className="italic font-normal text-gray-800">Kenya,</span> <br/>
            Captured in <span className="italic font-normal text-[color:var(--color-primary)]">High-Res.</span>
          </h1>
          <p className="text-gray-800 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Discover the definitive visual record of East Africa. Curated for storytellers, powered by local creators.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8 group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400 group-focus-within:text-[color:var(--color-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-16 pr-8 py-5 text-lg border-none rounded-2xl shadow-2xl bg-white/95 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all"
            placeholder="Search for lions, Nairobi streets, or coastal beauty..."
            aria-label="Search images"
          />
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-xs font-bold tracking-widest uppercase text-gray-800">
          <div className="flex items-center group">
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-primary)] mr-3 opacity-50 group-hover:opacity-100 transition-opacity"></span>
            Royalty-Free
          </div>
          <div className="flex items-center group">
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-primary)] mr-3 opacity-50 group-hover:opacity-100 transition-opacity"></span>
            Local Creators
          </div>
          <div className="flex items-center group">
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-primary)] mr-3 opacity-50 group-hover:opacity-100 transition-opacity"></span>
            4K RAW Archive
          </div>
        </div>
      </div>
    </section>
  );
}
