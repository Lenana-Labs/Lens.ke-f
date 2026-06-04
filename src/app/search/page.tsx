"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import GalleryCard from "../../components/GalleryCard";
import { galleryImages } from "../../data/galleryImages";
import Navbar from "../../components/Navbar";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["700"] });

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const category = searchParams.get("category");

  const [filteredImages, setFilteredImages] = useState<typeof galleryImages>([]);
  const [displayedImages, setDisplayedImages] = useState<typeof galleryImages>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("trending");
  const [resolution, setResolution] = useState("all");
  const [orientation, setOrientation] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 12;

  // 1. Filter logic
  useEffect(() => {
    setIsLoading(true);
    let results = galleryImages;

    if (q) {
      const query = q.toLowerCase();
      results = galleryImages.filter(
        (img) =>
          img.alt.toLowerCase().includes(query) ||
          img.location.toLowerCase().includes(query) ||
          img.photographer.toLowerCase().includes(query)
      );
    } else if (category) {
      const cat = category.toLowerCase();
      // Map category to keywords
      const categoryKeywords: Record<string, string[]> = {
        wildlife: ["safari", "lion", "elephant", "cheetah", "leopard", "maasai mara", "wildlife", "animal"],
        coastal: ["diani", "beach", "ocean", "mombasa", "coast", "swahili"],
        city: ["nairobi", "city", "urban", "skyline", "street", "downtown"],
        culture: ["maasai", "culture", "tribe", "people", "heritage", "traditional"],
      };
      
      const keywords = categoryKeywords[cat] || [cat];
      results = galleryImages.filter((img) =>
        keywords.some(
          (kw) => img.alt.toLowerCase().includes(kw) || img.location.toLowerCase().includes(kw)
        )
      );
    }

    setFilteredImages(results);
    setDisplayedImages(results.slice(0, ITEMS_PER_PAGE));
    setIsLoading(false);
  }, [q, category]);

  // 2. Infinite Scroll logic
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
      if (displayedImages.length < filteredImages.length) {
        setDisplayedImages((prev) => [
          ...prev,
          ...filteredImages.slice(prev.length, prev.length + ITEMS_PER_PAGE),
        ]);
      } else if (filteredImages.length > 0) {
        // Mock infinite loop by repeating the filtered results if we run out
        setDisplayedImages((prev) => [
          ...prev,
          ...filteredImages.slice(0, ITEMS_PER_PAGE).map(img => ({ ...img, id: img.id + "-" + prev.length }))
        ]);
      }
    }
  }, [displayedImages, filteredImages]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Dynamic Header Text
  const headerText = q ? `Results for "${q}"` : category ? `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}` : "All Categories";

  return (
    <main className="min-h-screen bg-[color:var(--color-background)] pt-24 pb-12">
      {/* We need to render the Navbar here since the main layout might not have it if it's customized, 
          but actually Next.js root layout probably has it. Wait, the main page has Navbar inside it.
          Let's include Navbar so it's visible. */}
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* Header & Local Search Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 mt-8 space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <h1 className={`text-4xl md:text-5xl font-bold text-[color:var(--color-text)] mb-4 ${quicksand.className}`}>
              {headerText}
            </h1>
            <p className="text-gray-500 text-lg">
              {isLoading ? "Searching..." : `${filteredImages.length} premium images found`}
            </p>
          </div>
          
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <form 
              className="relative w-full md:w-[450px]"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("q") as string;
                if (query.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                name="q"
                type="text"
                defaultValue={q || ""}
                placeholder="Search within gallery..."
                className="w-full pl-11 pr-4 py-3 rounded-full text-sm font-medium border border-gray-200 focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)] outline-none transition-all shadow-sm"
              />
            </form>
          </div>
        </div>

        {/* Filters / Chips & Filter Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-2 space-y-4 sm:space-y-0 border-b border-gray-100/50 relative">
          
          {/* Scrollable Chips Container with Indicator */}
          <div className="relative flex-1 min-w-0 sm:mr-4 w-full">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-3 hide-scrollbar scroll-smooth pr-16" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {["All", "Wildlife", "Coastal", "City", "Culture", "Nature", "Abstract", "Architecture", "Aerial", "People", "Travel", "Fashion", "Sports", "Technology", "Food"].map((chip) => {
                const isSelected = category?.toLowerCase() === chip.toLowerCase() || (!category && !q && chip === "All");
                return (
                  <a
                    key={chip}
                    href={chip === "All" ? "/search" : `/search?category=${chip.toLowerCase()}`}
                    className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected 
                        ? "bg-[color:var(--color-primary)] text-white shadow-md" 
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                    }`}
                  >
                    {chip}
                  </a>
                );
              })}
            </div>

            {/* Visual Scroll Indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[color:var(--color-background)] to-transparent pointer-events-none flex justify-end items-center pr-2">
              <button 
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
                className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md text-gray-500 hover:text-[color:var(--color-primary)] hover:scale-110 transition-all pointer-events-auto cursor-pointer focus:outline-none"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 animate-pulse hover:animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors whitespace-nowrap bg-white shadow-sm font-medium text-sm ${
                isFilterOpen ? "border-[color:var(--color-primary)] text-[color:var(--color-primary)]" : "border-gray-200 text-gray-700 hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <span>Filters</span>
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-5 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Sort By */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSortBy("trending")}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${sortBy === "trending" ? "bg-[color:var(--color-primary)] text-white border border-[color:var(--color-primary)]" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
                    >
                      Trending
                    </button>
                    <button 
                      onClick={() => setSortBy("newest")}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${sortBy === "newest" ? "bg-[color:var(--color-primary)] text-white border border-[color:var(--color-primary)]" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
                    >
                      Newest
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resolution</h4>
                  <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[color:var(--color-text)] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)] transition-all cursor-pointer"
                  >
                    <option value="all">All Resolutions</option>
                    <option value="4k">4K & Above</option>
                    <option value="1080p">High Res (1080p+)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Orientation</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setOrientation("all")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${orientation === "all" ? "bg-[color:var(--color-primary)] text-white border border-[color:var(--color-primary)]" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setOrientation("portrait")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex justify-center items-center ${orientation === "portrait" ? "bg-[color:var(--color-primary)] text-white border border-[color:var(--color-primary)]" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-3 h-4 border-2 border-current rounded-sm mr-1"></div> Portrait
                    </button>
                    <button 
                      onClick={() => setOrientation("landscape")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors flex justify-center items-center ${orientation === "landscape" ? "bg-[color:var(--color-primary)] text-white border border-[color:var(--color-primary)]" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-4 h-3 border-2 border-current rounded-sm mr-1"></div> Landscape
                    </button>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-2.5 bg-[color:var(--color-primary)] text-white rounded-lg font-semibold hover:bg-green-800 transition-colors shadow-md"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[color:var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        ) : displayedImages.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-1 space-y-1">
            {displayedImages.map((image, index) => (
              <div key={image.id + index} className="break-inside-avoid mb-1">
                <GalleryCard
                  id={image.id}
                  src={image.src}
                  alt={image.alt}
                  photographer={image.photographer}
                  location={image.location}
                  aspectRatio={image.aspectRatio}
                  priority={index < 8}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[color:var(--color-text)] mb-3">No results found</h2>
            <p className="text-gray-500 max-w-md mb-8">
              We couldn't find any images matching your search. Try checking your spelling or using more general terms.
            </p>
            <a 
              href="/search"
              className="px-8 py-3 bg-[color:var(--color-primary)] text-white rounded-full font-semibold hover:bg-green-800 transition-colors shadow-lg"
            >
              Browse All Categories
            </a>
          </div>
        )}

        {/* Loading Spinner for Infinite Scroll */}
        {!isLoading && displayedImages.length > 0 && (
          <div className="w-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[color:var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
