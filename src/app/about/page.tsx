"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Navbar from "../../components/Navbar";
import HeroFooter from "../../components/HeroFooter";
import Image from "next/image";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic", "normal"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

// --- SUB-COMPONENTS --- //

function MissionContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      {/* Left: Narrative */}
      <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
        <div className="space-y-6">
          <span className="text-[color:var(--color-primary)] font-bold tracking-[0.2em] uppercase text-sm">Our Origin</span>
          <h2 className={`text-4xl md:text-6xl text-[color:var(--color-text)] leading-[1.1] ${playfair.className}`}>
            Capturing the <br/>
            <span className="italic">Soul of a Nation.</span>
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed max-w-xl">
            Lens.ke was established with a singular vision: to create a definitive visual record of Kenya that honors its complexity, beauty, and resilience. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-100 pt-12">
          <div className="space-y-4">
            <h4 className="font-bold text-lg">The "Getty" for Kenya</h4>
            <p className="text-gray-500 leading-relaxed">
              We aren't just a stock site. We are a curated archive. From the neon pulse of Nairobi to the silent majesty of the Mara, we provide the world with the authentic Kenyan perspective.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Local Empowerment</h4>
            <p className="text-gray-500 leading-relaxed">
              Every download supports a network of local photographers, ensuring that the stories of our land are told by the people who live them.
            </p>
          </div>
        </div>

        <div className="relative pt-8">
           <blockquote className={`text-2xl md:text-3xl text-gray-800 leading-relaxed italic border-l-2 border-[color:var(--color-primary)] pl-8 py-2 ${playfair.className}`}>
            "Photography is the bridge between seeing and understanding. Lens.ke is that bridge for the world to truly see Kenya."
          </blockquote>
        </div>
      </div>

      {/* Right: Creative Visuals */}
      <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl z-10 group">
          <Image 
            src="/images/gallery/rift_valley_gold.png" 
            alt="Rift Valley landscape" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
             <p className="text-white/80 text-sm font-medium tracking-widest uppercase">The Great Rift Valley</p>
          </div>
        </div>
        {/* Floating Accent Image */}
        <div className="absolute -bottom-12 -left-12 w-2/3 aspect-square rounded-2xl overflow-hidden shadow-xl border-8 border-white hidden md:block z-20">
          <Image 
            src="/images/gallery/savannah_green.png" 
            alt="Savannah Detail" 
            fill 
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function LicenseContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="text-center space-y-6">
        <span className="text-[color:var(--color-primary)] font-bold tracking-[0.3em] uppercase text-xs">The Lens.ke Manifesto</span>
        <h2 className={`text-5xl md:text-7xl text-[color:var(--color-text)] ${playfair.className}`}>
          License <span className="italic text-gray-400">&</span> Ethics
        </h2>
        <p className="text-gray-500 text-xl max-w-2xl mx-auto font-light leading-relaxed">
          We believe in radical openness balanced with profound respect for the artist. 
          Our license is designed to empower creators while removing barriers for storytellers.
        </p>
      </div>

      {/* Vertical Narrative: Dos and Donts */}
      <div className="space-y-40 relative">
        {/* Decorative Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 hidden lg:block"></div>

        {/* Section 01: Creative Freedom (The Dos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 lg:text-right">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 font-bold text-sm mb-4">01</div>
            <h3 className={`text-4xl md:text-5xl ${playfair.className}`}>Creative <span className="italic">Freedom</span></h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              We want your stories to travel. Lens.ke provides a license that clears the path for global commercial and personal usage without friction.
            </p>
            <ul className="space-y-6 text-gray-500 text-lg">
              <li className="flex items-center lg:justify-end gap-4">
                Unlimited commercial projects <span className="w-2 h-2 rounded-full bg-green-500/20"></span>
              </li>
              <li className="flex items-center lg:justify-end gap-4">
                Full modification & branding rights <span className="w-2 h-2 rounded-full bg-green-500/20"></span>
              </li>
              <li className="flex items-center lg:justify-end gap-4">
                No royalty payments, ever <span className="w-2 h-2 rounded-full bg-green-500/20"></span>
              </li>
              <li className="flex items-center lg:justify-end gap-4">
                Global distribution permitted <span className="w-2 h-2 rounded-full bg-green-500/20"></span>
              </li>
            </ul>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl order-first lg:order-last">
            <Image 
              src="/images/gallery/savannah_green.png" 
              alt="Freedom of the Savannah" 
              fill 
              className="object-cover"
            />
          </div>
        </div>

        {/* Section 02: Respecting the Craft (The Donts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="/images/gallery/city_lights_charcoal.png" 
              alt="Ethics of the City" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="space-y-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 font-bold text-sm mb-4">02</div>
            <h3 className={`text-4xl md:text-5xl ${playfair.className}`}>Respecting <span className="italic">the Craft</span></h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              To protect our local community and keep this archive sustainable, we enforce a few essential boundaries that prevent exploitation.
            </p>
            <ul className="space-y-6 text-gray-500 text-lg">
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-red-500/20"></span> Cannot sell unedited photos
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-red-500/20"></span> Cannot build a competing archive
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-red-500/20"></span> Cannot imply creator endorsement
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-red-500/20"></span> Respect for sacred/cultural sites
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Credit Section */}
      <div className="relative rounded-[40px] overflow-hidden group shadow-2xl">
        <Image 
          src="/images/gallery/swahili_blue.png" 
          alt="Kenyan Coastal Landscape" 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 p-16 md:p-24 text-white flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4">
            <h4 className={`text-4xl md:text-5xl ${playfair.className}`}>The Gift of Attribution</h4>
            <p className="text-white/80 text-xl max-w-xl font-light">While not required, a credit line like <span className="text-white font-mono bg-white/20 px-3 py-1 rounded-md text-base">Photo by Lens.ke</span> helps our local creators thrive and reach new storytellers.</p>
          </div>
          <button className="whitespace-nowrap bg-white text-black px-10 py-5 rounded-full font-bold hover:bg-[color:var(--color-primary)] hover:text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg">
            Download PDF License
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqContent() {
  const faqs = [
    { q: "Is Lens.ke really free?", a: "Yes. Our core archive is free for everyone. We believe in democratizing high-end imagery of Kenya to ensure the world sees our true story." },
    { q: "How do I join as a photographer?", a: "We look for a specific editorial eye. If you have a portfolio that showcases Kenya's depth, reach out to creators@lens.ke with your best work." },
    { q: "What is the 'Gold Archive'?", a: "Coming soon, the Gold Archive will feature RAW, ultra-high-resolution files and exclusive series for premium enterprise partners." },
    { q: "Can I use images for physical prints?", a: "Absolutely. Most of our files are 4000px+ and suitable for large-format gallery prints and merchandise." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className={`text-4xl md:text-5xl text-[color:var(--color-text)] ${playfair.className}`}>Frequently Asked</h2>
        <div className="h-px w-24 bg-[color:var(--color-primary)] mx-auto"></div>
      </div>

      <div className="grid gap-6">
        {faqs.map((faq, idx) => {
          const [isOpen, setIsOpen] = useState(false);
          return (
            <div key={idx} className="group border-b border-gray-100 last:border-0">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left py-8 flex justify-between items-center focus:outline-none transition-all"
              >
                <span className={`text-xl md:text-2xl font-medium text-gray-800 transition-colors group-hover:text-[color:var(--color-primary)] ${isOpen ? "text-[color:var(--color-primary)]" : ""}`}>
                  {faq.q}
                </span>
                <span className={`text-2xl transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 pb-8 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- MAIN PAGE CONTAINER --- //

function AboutPortal() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "mission";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["mission", "license", "faq"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: "mission", label: "01 / The Mission" },
    { id: "license", label: "02 / The License" },
    { id: "faq", label: "03 / The Details" }
  ];

  return (
    <main className={`min-h-screen bg-[color:var(--color-background)] pt-32 ${jakarta.className}`}>
      <Navbar />

      {/* Hero Header */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-24">
        <div className="max-w-4xl space-y-6">
          <h1 className={`text-6xl md:text-8xl lg:text-[10rem] font-bold text-[color:var(--color-text)] leading-[0.9] tracking-tighter ${playfair.className}`}>
            Defining the <br/>
            <span className="italic text-[color:var(--color-primary)]">Kenyan Look.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-light">
            Lens.ke is Kenya’s premium visual archive. We bridge the gap between global demand and local creative excellence.
          </p>
        </div>
      </div>

      {/* Elegant Tab Navigation */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 mb-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex justify-start space-x-12 overflow-x-auto hide-scrollbar py-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.pushState(null, "", `/about?tab=${tab.id}`);
                }}
                className={`group relative pb-2 whitespace-nowrap text-sm tracking-widest uppercase font-bold transition-all ${
                  activeTab === tab.id 
                    ? "text-[color:var(--color-primary)]" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[color:var(--color-primary)] transition-transform duration-300 origin-left ${
                  activeTab === tab.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 opacity-30"
                }`}></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 min-h-[600px] mb-32">
        <div className="animate-in fade-in duration-1000">
          {activeTab === "mission" && <MissionContent />}
          {activeTab === "license" && <LicenseContent />}
          {activeTab === "faq" && <FaqContent />}
        </div>
      </div>

      <HeroFooter />
    </main>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className={`text-2xl italic text-[color:var(--color-primary)] ${playfair.className} animate-pulse`}>Lens.ke</div>
      </div>
    }>
      <AboutPortal />
    </Suspense>
  );
}
