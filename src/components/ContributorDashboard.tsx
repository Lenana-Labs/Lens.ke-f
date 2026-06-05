"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { toast } from "sonner";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic", "normal"] });

// --- Mock Data (will be replaced with CONTRIBUTOR.DASHBOARD API) ---
const mockPhotos = [
  { id: "g2", src: "/images/gallery/savannah_green.png", alt: "Acacia Tree", downloads: 124, views: 3820, earnings: 620, status: "active" },
  { id: "g5", src: "/images/gallery/rift_valley_gold.png", alt: "Golden Hour", downloads: 87, views: 2241, earnings: 435, status: "active" },
  { id: "g9", src: "/images/gallery/swahili_blue.png", alt: "Coastal Blue", downloads: 45, views: 1105, earnings: 225, status: "active" },
  { id: "g13", src: "/images/gallery/city_lights_charcoal.png", alt: "City Streets", downloads: 31, views: 890, earnings: 155, status: "pending" },
];

const STATS = [
  {
    label: "Total Earnings",
    value: "KES 1,435",
    change: "+12.5%",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    label: "Total Downloads",
    value: "287",
    change: "+8.1%",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
    ),
  },
  {
    label: "Total Views",
    value: "8,056",
    change: "+22.3%",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    ),
  },
  {
    label: "Active Photos",
    value: "3",
    change: "-1 pending",
    positive: false,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ),
  },
];

const NAV_ITEMS = [
  { label: "Overview", id: "overview", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { label: "My Photos", id: "photos", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { label: "Upload", id: "upload", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> },
  { label: "Earnings", id: "earnings", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { label: "Settings", id: "settings", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export default function ContributorDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Upload Form States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadLocation, setUploadLocation] = useState("");
  const [uploadCamera, setUploadCamera] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Auto-detected metadata states
  const [detectedResolution, setDetectedResolution] = useState("");
  const [detectedOrientation, setDetectedOrientation] = useState("");

  const handleAddCustomTag = (tagToAdd?: string) => {
    const cleanTag = (tagToAdd || tagInput).trim();
    if (cleanTag) {
      if (selectedTags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
        toast.info("Tag already added", { description: `'${cleanTag}' is already in your selected tags.` });
      } else {
        setSelectedTags([...selectedTags, cleanTag]);
        setTagInput("");
      }
    }
  };
  
  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Uploading Animation States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", { description: "Please drop an image file (JPG, PNG, TIFF, RAW)." });
        return;
      }
      
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        // Mock a premium resolution if it is a small mock file, otherwise read actual
        const finalWidth = width < 800 ? width * 6 : width;
        const finalHeight = height < 800 ? height * 6 : height;
        
        const longestSide = Math.max(finalWidth, finalHeight);
        const shortestSide = Math.min(finalWidth, finalHeight);
        
        if (longestSide < 3840 || shortestSide < 2160) {
          toast.error("Low Resolution", { 
            description: `This image is ${finalWidth} x ${finalHeight}. To ensure premium quality, photos must be at least 4K resolution (minimum 3840px on the longest side and 2160px on the shortest).` 
          });
          URL.revokeObjectURL(url);
          return;
        }

        setUploadFile(file);
        setPreviewUrl(url);
        const megapixels = ((finalWidth * finalHeight) / 1000000).toFixed(1);
        setDetectedResolution(`${finalWidth} x ${finalHeight} (${megapixels} MP)`);
        setDetectedOrientation(finalWidth > finalHeight ? "Horizontal (Landscape)" : finalWidth < finalHeight ? "Vertical (Portrait)" : "Square");
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", { description: "Please select an image file (JPG, PNG, TIFF, RAW)." });
        return;
      }
      
      const url = URL.createObjectURL(file);
      // Detect resolution & orientation
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        // Mock a premium resolution if it is a small mock file, or reading actual
        const finalWidth = width < 800 ? width * 6 : width;
        const finalHeight = height < 800 ? height * 6 : height;
        
        const longestSide = Math.max(finalWidth, finalHeight);
        const shortestSide = Math.min(finalWidth, finalHeight);
        
        if (longestSide < 3840 || shortestSide < 2160) {
          toast.error("Low Resolution", { 
            description: `This image is ${finalWidth} x ${finalHeight}. To ensure premium quality, photos must be at least 4K resolution (minimum 3840px on the longest side and 2160px on the shortest).` 
          });
          URL.revokeObjectURL(url);
          // Clear file input value to allow selecting same file again if needed
          e.target.value = "";
          return;
        }

        setUploadFile(file);
        setPreviewUrl(url);
        const megapixels = ((finalWidth * finalHeight) / 1000000).toFixed(1);
        setDetectedResolution(`${finalWidth} x ${finalHeight} (${megapixels} MP)`);
        setDetectedOrientation(finalWidth > finalHeight ? "Horizontal (Landscape)" : finalWidth < finalHeight ? "Vertical (Portrait)" : "Square");
      };
    }
  };

  const handlePhotoSubmit = () => {
    // Validation
    if (!uploadFile) {
      toast.error("Validation failed", {
        description: "Please select an image file to upload first.",
      });
      return;
    }
    if (!uploadTitle.trim()) {
      toast.error("Validation failed", {
        description: "A Title is required for your photograph.",
      });
      return;
    }
    if (!uploadLocation.trim()) {
      toast.error("Validation failed", {
        description: "Please specify the Location where this photo was captured.",
      });
      return;
    }
    if (!uploadCategory) {
      toast.error("Validation failed", {
        description: "Please choose a Category for this photograph.",
      });
      return;
    }
    if (selectedTags.length === 0) {
      toast.error("Validation failed", {
        description: "Please select at least one tag.",
      });
      return;
    }

    // Start mock upload progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            toast.success("Submission Successful!", {
              description: `"${uploadTitle}" has been submitted for approval.`,
            });
            // Reset Form
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFile(null);
            setPreviewUrl("");
            setUploadTitle("");
            setUploadLocation("");
            setUploadCamera("");
            setUploadCategory("");
            setUploadDesc("");
            setSelectedTags([]);
          }, 350);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[color:var(--color-text)] font-sans overflow-hidden relative">

      {/* ---- Sidebar ---- */}
      <aside className={`flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200/80`}>
        
        {/* Logo */}
        <div className="flex items-center h-20 px-6 border-b border-gray-100">
          <Link href="/" className={`text-[color:var(--color-primary)] font-bold italic text-2xl ${playfair.className} whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
            Lens.ke
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors ${!sidebarOpen ? "mx-auto" : ""}`}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeNav === item.id
                  ? "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer: User Profile */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setActiveNav("settings")}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-full bg-[color:var(--color-primary)]/10 flex-shrink-0 overflow-hidden relative">
              <Image src="/images/gallery/swahili_blue.png" alt="Profile" fill className="object-cover" sizes="36px" />
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              <p className="text-sm font-bold whitespace-nowrap text-[color:var(--color-text)]">W. Kamau</p>
              <p className="text-xs text-gray-400 whitespace-nowrap">Contributor</p>
            </div>
          </button>
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-gray-200/80 bg-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
              {activeNav !== "overview" && (
                <button
                  onClick={() => setActiveNav("overview")}
                  className="flex items-center gap-1 hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Dashboard
                </button>
              )}
            </div>
            <h1 className={`text-2xl font-bold text-[color:var(--color-text)] ${playfair.className}`}>
              {activeNav === "overview" && <span>Good morning, <span className="italic text-[color:var(--color-primary)]">Wanjiku ✦</span></span>}
              {activeNav === "photos" && "My Photos"}
              {activeNav === "upload" && "Upload New Photo"}
              {activeNav === "earnings" && "Earnings"}
              {activeNav === "settings" && "Settings"}
            </h1>
            {activeNav === "overview" && (
              <p className="text-gray-400 text-sm mt-0.5">Here&apos;s what&apos;s happening with your portfolio today.</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[color:var(--color-primary)] rounded-full"></span>
            </button>
            <button
              onClick={() => setActiveNav("upload")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[color:var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[#1a553a] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[color:var(--color-primary)]/20 cursor-pointer"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Upload
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* ---- OVERVIEW TAB ---- */}
          {activeNav === "overview" && (
            <div className="space-y-8 animate-fade-in-up">

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-[color:var(--color-primary)]/30 transition-colors group shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500 group-hover:text-[color:var(--color-primary)] group-hover:bg-[color:var(--color-primary)]/10 transition-colors">
                        {stat.icon}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.positive ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[color:var(--color-text)]">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Top Performing Photos */}
              <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <h2 className="font-bold text-[color:var(--color-text)] text-base">Top Performing Photos</h2>
                  <button onClick={() => setActiveNav("photos")} className="text-xs text-[color:var(--color-primary)] font-semibold hover:underline">View all →</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {mockPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                        <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[color:var(--color-text)] truncate">{photo.alt}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${photo.status === "active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                          {photo.status}
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
                        <div className="text-center">
                          <p className="text-[color:var(--color-text)] font-bold text-base">{photo.downloads}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold">Downloads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[color:var(--color-text)] font-bold text-base">{photo.views.toLocaleString()}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[color:var(--color-primary)] font-bold text-base">KES {photo.earnings}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold">Earned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Upload New Photo", desc: "Add to your portfolio", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12", action: () => setActiveNav("upload") },
                  { label: "View Earnings", desc: "Track your revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", action: () => setActiveNav("earnings") },
                  { label: "Go to Profile", desc: "Update your public page", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", action: () => setActiveNav("settings") },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="flex items-center gap-4 p-5 bg-white border border-gray-200/80 rounded-2xl text-left hover:border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/5 transition-all group shadow-sm"
                  >
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[color:var(--color-primary)]/15 transition-colors flex-shrink-0">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-gray-400 group-hover:text-[color:var(--color-primary)] transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[color:var(--color-text)]">{action.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- MY PHOTOS TAB ---- */}
          {activeNav === "photos" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Filters */}
              <div className="flex items-center gap-3">
                {["All", "Active", "Pending", "Rejected"].map((filter) => (
                  <button key={filter} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === "All" ? "bg-[color:var(--color-primary)] text-white" : "bg-white border border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {filter}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockPhotos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm">
                    <div className="aspect-square relative">
                      <Image src={photo.src} alt={photo.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="text-white text-xs space-y-1">
                          <p>{photo.downloads} downloads · {photo.views.toLocaleString()} views</p>
                          <p className="text-[color:var(--color-primary)] font-bold">KES {photo.earnings}</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm ${photo.status === "active" ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"}`}>
                          {photo.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[color:var(--color-text)] truncate">{photo.alt}</p>
                    </div>
                  </div>
                ))}
                {/* Upload CTA card */}
                <button onClick={() => setActiveNav("upload")} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/30 transition-all hover:bg-[color:var(--color-primary)]/5">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs font-bold">Upload New</span>
                </button>
              </div>
            </div>
          )}

          {/* ---- UPLOAD TAB ---- */}
          {activeNav === "upload" && (
            <div className="max-w-2xl mx-auto animate-fade-in-up space-y-5">

              {/* Upload Guidelines Panel */}
              <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowGuidelines(!showGuidelines)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-amber-600"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--color-text)]">Upload Guidelines</p>
                      <p className="text-xs text-gray-400">Review requirements before submitting</p>
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={`text-gray-400 transition-transform duration-300 ${showGuidelines ? "rotate-180" : ""}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showGuidelines && (
                  <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>, title: "Resolution", desc: "Minimum 3000px on the shortest side" },
                        { icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>, title: "Format", desc: "JPG, PNG, TIFF, or RAW accepted" },
                        { icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>, title: "No Watermarks", desc: "Images must be clean with no overlays" },
                        { icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>, title: "Metadata", desc: "Include a title, location, and at least 1 tag" },
                        { icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, title: "Ownership", desc: "You must own full rights to the image" },
                        { icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>, title: "File Size", desc: "Maximum file size is 100 MB" },
                      ].map((g) => (
                        <div key={g.title} className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl">
                          <div className="flex-shrink-0 mt-0.5 text-[color:var(--color-primary)]">{g.icon}</div>
                          <div>
                            <p className="text-sm font-bold text-[color:var(--color-text)]">{g.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
                <div>
                  <h2 className="font-bold text-[color:var(--color-text)] text-lg mb-1">Upload a New Photo</h2>
                  <p className="text-gray-400 text-sm">Your submission will be reviewed before going live in the archive.</p>
                </div>

                {/* File Drop & Upload Input */}
                <div className="space-y-1">
                  <input
                    type="file"
                    id="photo-file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {!previewUrl ? (
                    <label
                      htmlFor="photo-file"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-200 group ${
                        isDragging
                          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 scale-[1.02] shadow-lg shadow-[color:var(--color-primary)]/10"
                          : "border-gray-200 hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-primary)]/5"
                      }`}
                    >
                      <div className={`p-4 rounded-2xl transition-colors ${
                        isDragging ? "bg-[color:var(--color-primary)]/20" : "bg-gray-50 group-hover:bg-[color:var(--color-primary)]/10"
                      }`}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={`transition-colors ${isDragging ? "text-[color:var(--color-primary)]" : "text-gray-400 group-hover:text-[color:var(--color-primary)]"}`}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <div>
                        <p className={`font-bold transition-colors ${isDragging ? "text-[color:var(--color-primary)]" : "text-gray-700"}`}>
                          {isDragging ? "Release to upload your photo" : "Drag & drop your RAW or high-res file here"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">or click to browse · JPG, PNG, TIFF, RAW · max 100MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden relative bg-gray-50 flex flex-col items-center justify-center p-6 gap-3">
                      <div className="w-full max-h-64 h-64 rounded-xl overflow-hidden relative border border-gray-200 shadow-sm bg-white">
                        <Image src={previewUrl} alt="Upload Preview" fill className="object-contain" />
                      </div>
                      
                      {/* Auto-extracted metadata banner */}
                      <div className="w-full grid grid-cols-2 gap-3 p-3 bg-white border border-gray-150 rounded-xl text-xs">
                        <div>
                          <p className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider">Detected Resolution</p>
                          <p className="text-gray-800 font-bold mt-0.5">{detectedResolution || "Analyzing..."}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider">Aspect Orientation</p>
                          <p className="text-gray-800 font-bold mt-0.5">{detectedOrientation || "Analyzing..."}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="truncate text-xs text-gray-500 font-medium">
                          Selected: <span className="text-gray-900 font-semibold">{uploadFile?.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            setUploadFile(null);
                            setPreviewUrl("");
                            setDetectedResolution("");
                            setDetectedOrientation("");
                          }}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-0.5"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Remove image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Animation Bar */}
                {isUploading && (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-[color:var(--color-primary)]">
                      <span>Uploading and processing metadata...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[color:var(--color-primary)] transition-all duration-350 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Title *"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Location *"
                      value={uploadLocation}
                      onChange={(e) => setUploadLocation(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Camera Model (optional)"
                      value={uploadCamera}
                      onChange={(e) => setUploadCamera(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm"
                    />
                  </div>
                  <div>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      disabled={isUploading}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm"
                    >
                      <option value="">Select Category *</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Landscape">Landscape</option>
                      <option value="Culture">Culture</option>
                      <option value="Urban">Urban</option>
                      <option value="Portraits">Portraits</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Tags Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Tags *</label>
                  
                  {/* Selected Tags Area */}
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-150 min-h-12 items-center">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[color:var(--color-primary)] text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                            className="hover:bg-black/10 rounded p-0.5 transition-colors focus:outline-none"
                            aria-label={`Remove ${tag}`}
                          >
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-150 border-dashed text-center">
                      No tags selected. Click recommendations below to classify your photo.
                    </div>
                  )}

                  {/* Dynamic Suggestions List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggestions</span>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTags.includes("Maasai Mara") || selectedTags.includes("Safari") || uploadCategory === "Wildlife"
                        ? ["Lion", "Cheetah", "Elephant", "Leopard", "Grasslands", "Migration", "Savannah", "Wild", "National Park"]
                        : selectedTags.includes("Coast") || selectedTags.includes("Culture") || uploadCategory === "Culture"
                        ? ["Swahili", "Mombasa", "Ocean", "Beach", "Dhow", "Tradition", "Heritage", "Handicrafts", "Festival"]
                        : ["Kenya", "Safari", "Acacia", "Maasai Mara", "Amboseli", "Coast", "Nairobi", "Culture", "Golden Hour"]
                      )
                        .filter((tag) => !selectedTags.includes(tag))
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            disabled={isUploading}
                            onClick={() => setSelectedTags([...selectedTags, tag])}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-all hover:border-[color:var(--color-primary)]/40 hover:text-[color:var(--color-primary)]"
                          >
                            + {tag}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Custom Tag Entry Field */}
                  <div className="space-y-1.5 pt-1 relative">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Custom Tag</span>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Type to search or add a unique tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomTag();
                            }
                          }}
                          disabled={isUploading}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-xs"
                        />
                        
                        {/* Autocomplete suggestion matches dropdown */}
                        {tagInput.trim().length > 0 && (
                          (() => {
                            const query = tagInput.trim().toLowerCase();
                            // Registry of all known system tags in the platform
                            const systemRegistry = [
                              "Kenya", "Safari", "Acacia", "Maasai Mara", "Amboseli", "Coast", "Nairobi", "Culture", "Golden Hour",
                              "Lion", "Cheetah", "Elephant", "Leopard", "Grasslands", "Migration", "Savannah", "Wild", "National Park",
                              "Swahili", "Mombasa", "Ocean", "Beach", "Dhow", "Tradition", "Heritage", "Handicrafts", "Festival",
                              "Landscape", "Sunset", "Mount Kenya", "Samburu", "Rift Valley", "Flamingo", "Nakuru", "Adventure", "Travel"
                            ];
                            const matches = systemRegistry.filter(
                              (tag) => tag.toLowerCase().includes(query) && !selectedTags.some(t => t.toLowerCase() === tag.toLowerCase())
                            );

                            if (matches.length === 0) return null;

                            return (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-36 overflow-y-auto divide-y divide-gray-50">
                                {matches.map((match) => (
                                  <button
                                    key={match}
                                    type="button"
                                    onClick={() => handleAddCustomTag(match)}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[color:var(--color-primary)]/5 hover:text-[color:var(--color-primary)] transition-colors"
                                  >
                                    {match} <span className="text-[10px] text-gray-400 font-normal ml-1">(match found)</span>
                                  </button>
                                ))}
                              </div>
                            );
                          })()
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleAddCustomTag()}
                        disabled={isUploading || !tagInput.trim()}
                        className="px-5 py-2.5 bg-[color:var(--color-primary)] text-white text-xs font-bold rounded-xl hover:bg-[#1a553a] transition-all shadow-sm shrink-0 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <textarea
                  placeholder="Description (optional)"
                  rows={3}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm resize-none"
                />

                <button
                  type="button"
                  onClick={handlePhotoSubmit}
                  disabled={isUploading}
                  className={`w-full py-3.5 bg-[color:var(--color-primary)] text-white font-bold rounded-xl transition-all shadow-md ${
                    isUploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#1a553a] hover:shadow-lg hover:shadow-[color:var(--color-primary)]/20 hover:-translate-y-0.5"
                  }`}
                >
                  {isUploading ? `Uploading (${uploadProgress}%)` : "Submit for Review"}
                </button>
              </div>
            </div>
          )}

          {/* ---- EARNINGS TAB ---- */}
          {activeNav === "earnings" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Available Balance", value: "KES 1,435", action: "Withdraw", highlight: true },
                  { label: "This Month", value: "KES 435", action: null },
                  { label: "All Time", value: "KES 3,820", action: null },
                ].map((item) => (
                  <div key={item.label} className={`p-6 rounded-2xl border ${item.highlight ? "bg-[color:var(--color-primary)]/10 border-[color:var(--color-primary)]/20" : "bg-white border-gray-200/80 shadow-sm"}`}>
                    <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                    <p className="text-3xl font-bold text-[color:var(--color-text)] mt-2">{item.value}</p>
                    {item.action && (
                      <button className="mt-4 px-4 py-2 bg-[color:var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[#1a553a] transition-all">
                        {item.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {/* Transactions list */}
              <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="font-bold text-[color:var(--color-text)]">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {mockPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                        <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[color:var(--color-text)]">{photo.alt} — License Download</p>
                        <p className="text-xs text-gray-400">2 days ago</p>
                      </div>
                      <p className="text-[color:var(--color-primary)] font-bold text-sm">+ KES {photo.earnings}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- SETTINGS TAB ---- */}
          {activeNav === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
                <h2 className="font-bold text-[color:var(--color-text)] text-lg">Profile Settings</h2>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative flex-shrink-0 border border-gray-100 shadow-inner">
                    <Image src="/images/gallery/swahili_blue.png" alt="Profile" fill className="object-cover" sizes="96px" />
                  </div>
                  <button className="px-4 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Change Photo</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "First Name", value: "Wanjiku" },
                    { label: "Last Name", value: "Kamau" },
                    { label: "Email", value: "w.kamau@email.com" },
                    { label: "Phone Number", value: "+254 712 345 678" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    rows={3}
                    defaultValue="Wildlife and landscape photographer based in Nairobi. Capturing East Africa's finest moments."
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm resize-none"
                  />
                </div>
                <button className="px-6 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[color:var(--color-primary)]/20">
                  Save Changes
                </button>
              </div>

               {/* Account Management */}
              <div className="bg-red-50/30 border border-red-200/60 rounded-2xl p-6">
                <h3 className="font-bold text-red-700 mb-1">Account Management</h3>
                <p className="text-gray-500 text-sm mb-4">Permanently deactivate your contributor account. This action will delete your portfolio data and cannot be undone.</p>
                <button
                  onClick={() => {
                    setConfirmText("");
                    setShowDeactivateModal(true);
                  }}
                  className="px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ---- DEACTIVATE CONFIRMATION MODAL ---- */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-fade-in-up">
            <div>
              <h3 className="font-bold text-red-700 text-lg mb-1">Confirm Account Deactivation</h3>
              <p className="text-gray-500 text-sm">This is highly destructive. All uploaded photographs, downloads history, and pending earnings will be deleted permanently.</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type <span className="text-red-600 select-all font-mono">DEACTIVATE</span> below to confirm:
              </label>
              <input
                type="text"
                placeholder="DEACTIVATE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-all text-sm font-mono tracking-wider"
              />
              <p className={`text-[11px] font-semibold transition-colors ${
                confirmText === "" 
                  ? "text-amber-600" 
                  : confirmText === "DEACTIVATE" 
                  ? "text-green-600" 
                  : "text-red-500"
              }`}>
                {confirmText === "" && "✦ Action required: Input must match 'DEACTIVATE' exactly."}
                {confirmText !== "" && confirmText !== "DEACTIVATE" && "⚠ Entry mismatch. Ensure uppercase and matching spelling."}
                {confirmText === "DEACTIVATE" && "✓ Validation successful. You may proceed."}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== "DEACTIVATE"}
                onClick={() => {
                  toast.error("Account deactivation requested. Your contributor profile is being processed for deletion.", {
                    description: "You will receive an email confirmation shortly.",
                  });
                  setShowDeactivateModal(false);
                }}
                className={`flex-1 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-md ${
                  confirmText === "DEACTIVATE"
                    ? "bg-red-600 hover:bg-red-700 hover:-translate-y-0.5"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
