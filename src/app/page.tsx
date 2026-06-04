import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import GalleryGrid from "../components/GalleryGrid";
import HeroFooter from "../components/HeroFooter";
import CartDrawer from "../components/CartDrawer";
import ImageModal from "../components/ImageModal";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <GalleryGrid />
      <HeroFooter />
      <CartDrawer />
      <Suspense fallback={null}>
        <ImageModal />
      </Suspense>
    </main>
  );
}
