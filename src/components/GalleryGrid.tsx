"use client";

import GalleryCard from "./GalleryCard";
import { galleryImages } from "../data/galleryImages";

export default function GalleryGrid() {
  return (
    <section className="w-full bg-[color:var(--color-background)] py-4 px-4 md:px-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-1 space-y-1">
          {galleryImages.map((image, index) => (
            <div key={image.id} className="break-inside-avoid mb-1">
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
      </div>
    </section>
  );
}
