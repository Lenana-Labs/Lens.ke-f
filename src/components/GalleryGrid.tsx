"use client";

import useSWR from "swr";
import { useMemo } from "react";
import GalleryCard from "./GalleryCard";
import { galleryImages } from "../data/galleryImages";
import { apiClient } from "../lib/api/client";

// Use the pre-configured axios apiClient for SWR
const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function GalleryGrid() {
  const endpoint = process.env.NEXT_PUBLIC_PHOTO_LIST || "/api/v1/photos";

  // Fetch from the API endpoint using SWR. apiClient automatically applies the base URL.
  const { data: apiResponse, error, isLoading } = useSWR(
    endpoint,
    fetcher
  );

  const displayImages = useMemo(() => {
    // DRF Paginated responses typically return data in a "results" array.
    // We fallback to checking if the response itself is an array, or empty if still loading.
    const apiPhotos = apiResponse?.results || apiResponse || [];
    const localPhotos = galleryImages;

    const combined = [];
    let apiIndex = 0;
    let localIndex = 0;

    // Loop until both the API photos and Local photos have been fully mapped
    while (apiIndex < apiPhotos.length || localIndex < localPhotos.length) {
      // 1. Take up to 8 photos from the API
      for (let i = 0; i < 8 && apiIndex < apiPhotos.length; i++) {
        combined.push(apiPhotos[apiIndex]);
        apiIndex++;
      }
      
      // 2. Take up to 2 photos from the local static array
      for (let i = 0; i < 2 && localIndex < localPhotos.length; i++) {
        combined.push(localPhotos[localIndex]);
        localIndex++;
      }
    }

    return combined;
  }, [apiResponse]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load the gallery.
      </div>
    );
  }

  return (
    <section className="w-full bg-[color:var(--color-background)] py-4 px-4 md:px-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Optional: You can show a loading indicator, but bypassing it allows the local images to render immediately for faster perceived loading */}
        {isLoading && displayImages.length === 0 && (
          <div className="text-center py-4">Loading photos...</div>
        )}

        <div className="columns-2 md:columns-3 lg:columns-4 gap-1 space-y-1">
          {displayImages.map((image, index) => (
            <div key={`${image.id}-${index}`} className="break-inside-avoid mb-1">
              <GalleryCard
                id={image.id}
                // Fallbacks implemented depending on the DRF payload keys
                src={image.src || image.image_url || image.url}
                alt={image.alt || image.title || "Gallery Image"}
                photographer={image.photographer || "Unknown"}
                location={image.location}
                aspectRatio={image.aspectRatio || "4/5"} 
                priority={index < 8}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
