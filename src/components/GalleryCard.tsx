"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

interface GalleryCardProps {
  id: string;
  src: string;
  alt: string;
  photographer: string;
  location: string;
  aspectRatio?: string;
  price?: number;
  priority?: boolean;
}

export default function GalleryCard({
  id,
  src,
  alt,
  photographer,
  location,
  aspectRatio = "1/1",
  price = 49,
  priority = false,
}: GalleryCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/?photo=${id}`, { scroll: false });
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      src,
      alt,
      price,
      license: "Commercial",
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative w-full overflow-hidden bg-gray-100 cursor-pointer"
      style={{ aspectRatio }}
    >
      {/* The Image */}
      <div className="absolute inset-0 w-full h-full z-10 transition-transform duration-700 ease-out group-hover:scale-105">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover"
        />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-between p-4 pointer-events-none">
        
        {/* Top Section */}
        <div className="flex justify-end space-x-2">
          {/* Bookmark Button */}
          <button
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors shadow-sm pointer-events-auto"
            aria-label="Bookmark"
            title="Bookmark"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Like Button */}
          <button
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors shadow-sm pointer-events-auto"
            aria-label="Like"
            title="Like"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          {/* Bottom Left: Photographer */}
          <div className="text-white pr-4">
            <p className="font-medium text-sm drop-shadow-md truncate">{photographer}</p>
          </div>

          {/* Bottom Right: Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors shadow-sm pointer-events-auto flex-shrink-0"
            aria-label="Download"
            title="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
