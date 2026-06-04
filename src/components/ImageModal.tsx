"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { galleryImages } from "../data/galleryImages";
import DownloadDropdown from "./DownloadDropdown";

export default function ImageModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const photoId = searchParams.get("photo");
  
  const [isMagnified, setIsMagnified] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [relatedImages, setRelatedImages] = useState([...galleryImages].sort(() => 0.5 - Math.random()).slice(0, 10));

  // When modal is open, prevent background scrolling
  useEffect(() => {
    if (photoId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [photoId]);

  if (!photoId) return null;

  const photo = galleryImages.find(p => p.id === photoId) || galleryImages[0];

  const handleClose = () => {
    // Navigate back to the same page without the query param
    router.push("/", { scroll: false });
  };

  // Mock infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
    if (bottom) {
      // Add more random images to simulate infinite scroll
      // TODO: Replace with real backend pagination
      setRelatedImages(prev => [
        ...prev, 
        ...([...galleryImages].sort(() => 0.5 - Math.random()).slice(0, 4))
      ]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnified) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-start overflow-y-auto" onClick={handleClose} onScroll={handleScroll}>
      
      {/* Fixed Close Button (Outside Container) */}
      <button 
        onClick={handleClose}
        className="fixed top-4 left-4 md:top-8 md:left-8 z-[110] p-2 bg-black/20 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all text-white/80 hover:text-white"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-[1200px] min-h-screen bg-white md:my-10 md:rounded-2xl flex flex-col shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b border-gray-100">
          
          {/* Top Left: Photographer */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-500 shadow-inner">
              {photo.photographer.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-text)] leading-tight">{photo.photographer}</h3>
              <p className="text-sm font-medium text-gray-500">{photo.location}</p>
            </div>
          </div>

          {/* Top Right: Actions */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg text-gray-600 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{(photo as any).likes || 142}</span>
            </button>

            <DownloadDropdown />
          </div>
        </div>

        {/* Content Split: Image & Info */}
        <div className="w-full flex flex-col md:flex-row border-b border-gray-100">
          
          {/* Left Side: Image Container */}
          <div className="w-full md:w-2/3 bg-gray-50 flex items-center justify-center p-4 md:p-8 relative border-r border-gray-100">
            <div 
              className={`relative rounded-lg shadow-xl overflow-hidden ${isMagnified ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              style={{ 
                aspectRatio: photo.aspectRatio,
                height: "80vh",
                maxWidth: "100%",
                maxHeight: "80vh"
              }}
              onClick={() => setIsMagnified(!isMagnified)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
            >
              <div 
                className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out pointer-events-none"
                style={{
                  transform: isMagnified ? "scale(2.5)" : "scale(1)",
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                }}
              >
                <Image 
                  src={photo.src} 
                  alt={photo.alt} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Side: Info Panel */}
          <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col space-y-8 bg-white">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location</h4>
              <div className="flex items-center space-x-2 text-[color:var(--color-text)]">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="font-medium text-lg">{photo.location}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                A stunning capture showcasing the essence of {photo.location}. The composition, lighting, and subject matter make this a premium choice for editorial and commercial storytelling. Shot by {photo.photographer}.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Image Details</h4>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex justify-between border-b border-gray-100 pb-2"><span>Format</span> <span className="font-medium text-[color:var(--color-text)]">JPEG</span></li>
                <li className="flex justify-between border-b border-gray-100 pb-2"><span>Resolution</span> <span className="font-medium text-[color:var(--color-text)]">High Resolution</span></li>
                <li className="flex justify-between border-b border-gray-100 pb-2"><span>Orientation</span> <span className="font-medium text-[color:var(--color-text)]">{photo.aspectRatio === "1/1" ? "Square" : parseInt(photo.aspectRatio.split('/')[0]) > parseInt(photo.aspectRatio.split('/')[1]) ? "Landscape" : "Portrait"}</span></li>
                <li className="flex justify-between pb-2"><span>License Type</span> <span className="font-medium text-[color:var(--color-text)]">Commercial / Editorial</span></li>
              </ul>
            </div>
            
            <div className="pt-4 flex items-center justify-between mt-auto">
              <button className="flex items-center space-x-2 text-gray-500 hover:text-[color:var(--color-text)] transition-colors text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span>Share</span>
              </button>
              <button className="text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1" title="Flag image">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                <span className="text-sm">Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Infinite Scroll: Similar Images */}
        <div className="p-4 md:p-8 bg-white">
          <h4 className="text-xl font-bold mb-6 text-[color:var(--color-text)]">Similar Images</h4>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {relatedImages.map((img, i) => (
              <div 
                key={`${img.id}-${i}`}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => router.push(`/?photo=${img.id}`, { scroll: false })}
              >
                <div className="relative w-full h-full" style={{ aspectRatio: img.aspectRatio }}>
                  <Image 
                    src={img.src} 
                    alt={img.alt} 
                    fill 
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
          {/* Loading Indicator for Infinite Scroll */}
          <div className="w-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[color:var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
