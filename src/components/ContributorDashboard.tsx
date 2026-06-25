"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image"; 
import { Playfair_Display } from "next/font/google";
import { toast } from "sonner"; 
import { apiClient } from "../lib/api/client";
import ContributorDashboardLayout from "../components/ContributorDashboardLayout";
import UploadTab from "../components/UploadTab";
import PhotoDetailDrawer from "../components/PhotoDetailDrawer";
import TransactionReceiptDrawer from "../components/TransactionReceiptDrawer";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic", "normal"] });

type Photo = {
  id: string;
  src: string;
  alt: string;
  downloads: number;
  views: number;
  earnings: number;
  status: "active" | "pending" | "rejected";
  rejectionReason?: string;
  description: string;
  location: string;
  camera: string;
  category: string;
  tags: string[];
  uploadedAt: string;
};

type TransactionStatus = "completed" | "pending" | "failed" | "reversed";

type Transaction = {
  id: string;
  photoId: string;
  photoTitle: string;
  licenseType: "Standard" | "Extended" | "Editorial";
  date: string;
  amount: number;
  status: TransactionStatus;
  statusDetails?: string;
};

type Payout = {
  id: string;
  method: "M-Pesa" | "Bank Transfer";
  date: string;
  amount: number;
  status: "paid" | "processing";
};

/**
 * Creates a Photo object for the UI from API data and form fallbacks.
 * @param finalizedData - The data object returned from the finalize API endpoint.
 * @param formState - An object containing the state from the upload form.
 * @returns A complete Photo object.
 */
const createUiPhoto = (finalizedData: any, formState: { title: string; location: string; camera: string; category: string; desc: string; tags: string[]; previewUrl: string }): Photo => {
  const { title, location, camera, category, desc, tags, previewUrl } = formState;

  const formatDate = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return {
    id: finalizedData.id || `g-${Date.now()}`,
    src: finalizedData.image_url || finalizedData.src || previewUrl,
    alt: finalizedData.title || title,
    downloads: 0,
    views: 0,
    earnings: 0,
    status: finalizedData.status || "pending",
    description: finalizedData.description || desc || "No description provided.",
    location: finalizedData.location || location,
    camera: finalizedData.camera || camera || "Standard Camera",
    category: finalizedData.category || category || "General",
    tags: finalizedData.tags || (tags.length > 0 ? tags : ["photography"]),
    uploadedAt: formatDate(finalizedData.created_at),
  };
};

export default function ContributorDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [photosView, setPhotosView] = useState<"grid" | "list">("grid");
  const [photosList, setPhotosList] = useState<Photo[]>([]);
  const [portfolioFilter, setPortfolioFilter] = useState<"All" | "Active" | "Pending" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolioSort, setPortfolioSort] = useState<"uploadedAt" | "downloads" | "views" | "earnings">("uploadedAt");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const txnScrollRef = useRef<HTMLDivElement>(null);
  const payoutScrollRef = useRef<HTMLDivElement>(null);

  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [txnFilter, setTxnFilter] = useState<"all" | "completed" | "pending" | "failed_reversed">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutsList, setPayoutsList] = useState<Payout[]>([]);

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [paymentMethodState, setPaymentMethodState] = useState<"empty" | "editing" | "saved">("empty");
  const [selectedPaymentType, setSelectedPaymentType] = useState<"mpesa" | "bank" | null>(null);
  const [savedPaymentData, setSavedPaymentData] = useState<any>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("+254 ");
  const [paymentMpesaName, setPaymentMpesaName] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountNum, setPaymentAccountNum] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");
  const [paymentBranch, setPaymentBranch] = useState("");

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Derived stats
  const totalEarnings = photosList.reduce((sum, p) => sum + p.earnings, 0);
  const totalDownloads = photosList.reduce((sum, p) => sum + p.downloads, 0);
  const totalViews = photosList.reduce((sum, p) => sum + p.views, 0);
  const activePhotos = photosList.filter(p => p.status === "active").length;
  const pendingPhotos = photosList.filter(p => p.status === "pending").length;

  const pendingClearance = transactionsList
    .filter(t => t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEarningsWithPending = availableBalance + pendingClearance;

  const STATS = [
    {
      label: "Total Earnings",
      value: `KES ${totalEarnings}`,
      change: totalEarnings > 0 ? "+0%" : "0%",
      positive: true,
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Total Downloads",
      value: totalDownloads.toString(),
      change: totalDownloads > 0 ? "+0%" : "0%",
      positive: true,
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      change: totalViews > 0 ? "+0%" : "0%",
      positive: true,
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    },
    {
      label: "Active Photos",
      value: activePhotos.toString(),
      change: `${pendingPhotos} pending`,
      positive: false,
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhoto(null);
        setSelectedTransaction(null);
        if (!isWithdrawing) setShowWithdrawModal(false);
      }
    };
    if (selectedPhoto || selectedTransaction || showWithdrawModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedPhoto, selectedTransaction, showWithdrawModal, isWithdrawing]);

  const openDrawer = (photo: Photo) => setSelectedPhoto(photo);

  const handleSavePhotoDetails = (updatedPhoto: Photo) => {
    const isResubmitting = updatedPhoto.status === "pending" && photosList.find(p => p.id === updatedPhoto.id)?.status === 'rejected';
    setPhotosList(prev => prev.map(p =>
      p.id === updatedPhoto.id ? updatedPhoto : p
    ));
    if (isResubmitting) {
      toast.success("Changes Saved & Resubmitted", {
        description: `"${updatedPhoto.alt}" has been resubmitted for approval.`
      });
    } else {
      toast.success("Changes Saved", {
        description: `Updates to '${updatedPhoto.alt}' have been saved.`
      });
    }
    setSelectedPhoto(null);
  };

  const handleDeletePhoto = (photoId: string) => {
    const photoToDelete = photosList.find(p => p.id === photoId);
    if (!photoToDelete) return;
    setPhotosList(prev => prev.filter(p => p.id !== photoId));
    toast.error("Photo Deleted", { description: `'${photoToDelete.alt}' has been removed from your portfolio.` });
    setSelectedPhoto(null);
  };

  const handleSavePaymentMethod = () => {
    setIsSavingPayment(true);
    setPaymentSaveSuccess(false);
    setTimeout(() => {
      setIsSavingPayment(false);
      setPaymentSaveSuccess(true);
      setSavedPaymentData({
        type: selectedPaymentType,
        phone: paymentPhone,
        mpesaName: paymentMpesaName,
        bankName: paymentBankName,
        accountNum: paymentAccountNum,
        accountName: paymentAccountName,
        branch: paymentBranch,
      });
      setPaymentMethodState("saved");
      toast.success("Payment method saved successfully");
      setTimeout(() => setPaymentSaveSuccess(false), 3000);
    }, 1500);
  };

  const handleWithdrawSubmit = (details: { amount: number; method: "mpesa" | "bank" }) => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setAvailableBalance(prev => prev - details.amount);
      const newPayout: Payout = {
        id: `p-${Date.now()}`,
        method: details.method === "mpesa" ? "M-Pesa" : "Bank Transfer",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        amount: details.amount,
        status: "processing"
      };
      setPayoutsList(prev => [newPayout, ...prev]);
      toast.success("Withdrawal Requested", { description: `KES ${details.amount} will be sent via ${details.method === "mpesa" ? "M-Pesa" : "Bank Transfer"} within 24 hours.` });
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[color:var(--color-text)] font-sans overflow-hidden relative">
      <ContributorDashboardLayout activeNav={activeNav} setActiveNav={setActiveNav}>
          {/* OVERVIEW */}
          {activeNav === "overview" && (
            <div className="space-y-8 animate-fade-in-up">
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
                    <p className={`text-4xl font-bold ${playfair.className} text-[color:var(--color-primary)] mt-2`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {photosList.length === 0 ? (
                <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-gray-400 text-sm">You haven't uploaded any photos yet. Start by uploading your first photograph.</p>
                  <button onClick={() => setActiveNav("upload")} className="mt-4 px-6 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all">Upload Now</button>
                </div>
              ) : (
                <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <h2 className={`text-3xl ${playfair.className} text-[color:var(--color-text)]`}>Top Performing <span className="italic text-gray-400">Photos</span></h2>
                    <button onClick={() => setActiveNav("photos")} className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-[color:var(--color-primary)] transition-colors">View all →</button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {photosList.slice(0, 4).map((photo) => (
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
              )}

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

          {/* PHOTOS */}
          {activeNav === "photos" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {["All", "Active", "Pending", "Rejected"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setPortfolioFilter(filter as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                            portfolioFilter === filter
                              ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)] shadow-sm"
                              : "bg-white border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Category:</span>
                      {["All", "Nature", "Landscape", "Aerial", "Urban"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                            categoryFilter === cat
                              ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                              : "bg-white border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search photo, location, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
                    <div className="relative">
                      <select
                        value={portfolioSort}
                        onChange={(e) => setPortfolioSort(e.target.value as any)}
                        className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all cursor-pointer appearance-none"
                      >
                        <option value="uploadedAt">Newest Uploads</option>
                        <option value="downloads">Most Downloaded</option>
                        <option value="views">Most Viewed</option>
                        <option value="earnings">Highest Earnings</option>
                      </select>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center bg-gray-100/80 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => setPhotosView("grid")}
                      className={`p-2 rounded-lg transition-all flex items-center gap-2 ${photosView === "grid" ? "bg-white text-[color:var(--color-text)] shadow-sm font-bold" : "text-gray-400 hover:text-gray-650"}`}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={photosView === "grid" ? 2 : 1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      <span className="text-xs pr-1 sm:hidden">Grid</span>
                    </button>
                    <button
                      onClick={() => setPhotosView("list")}
                      className={`p-2 rounded-lg transition-all flex items-center gap-2 ${photosView === "list" ? "bg-white text-[color:var(--color-text)] shadow-sm font-bold" : "text-gray-400 hover:text-gray-650"}`}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={photosView === "list" ? 2 : 1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                      <span className="text-xs pr-1 sm:hidden">List</span>
                    </button>
                  </div>
                </div>
              </div>

              {(() => {
                const filteredPhotos = photosList.filter(photo => {
                  if (portfolioFilter !== "All" && photo.status !== portfolioFilter.toLowerCase()) return false;
                  if (categoryFilter !== "All" && photo.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    return photo.alt.toLowerCase().includes(q) || photo.location.toLowerCase().includes(q) || photo.tags.some(t => t.toLowerCase().includes(q));
                  }
                  return true;
                });

                const sortedPhotos = [...filteredPhotos].sort((a, b) => {
                  if (portfolioSort === "uploadedAt") return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
                  if (portfolioSort === "downloads") return b.downloads - a.downloads;
                  if (portfolioSort === "views") return b.views - a.views;
                  if (portfolioSort === "earnings") return b.earnings - a.earnings;
                  return 0;
                });

                if (sortedPhotos.length === 0) {
                  return (
                    <div className="py-20 text-center bg-white border border-gray-200/80 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-sm animate-fade-in">
                      <div className="p-4 bg-gray-50 rounded-full text-gray-400">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[color:var(--color-text)] font-bold text-base">No photographs found</p>
                        <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or search terms, or upload a new photo.</p>
                      </div>
                      <button
                        onClick={() => { setPortfolioFilter("All"); setCategoryFilter("All"); setSearchQuery(""); }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  );
                }

                return photosView === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedPhotos.map((photo) => (
                      <div key={photo.id} onClick={() => openDrawer(photo)} className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm cursor-pointer">
                        <div className="aspect-square relative">
                          <Image src={photo.src} alt={photo.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                            <div className="flex items-center gap-4 text-white">
                              <div className="flex flex-col items-center">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span className="text-xs font-bold mt-1">{photo.downloads}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                <span className="text-xs font-bold mt-1">{(photo.views / 1000).toFixed(1)}k</span>
                              </div>
                              <div className="flex flex-col items-center text-[color:var(--color-primary)]">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-xs font-bold mt-1">{photo.earnings}</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm ${photo.status === "active" ? "bg-green-900/50 text-green-300" : photo.status === "rejected" ? "bg-red-900/50 text-red-300" : "bg-yellow-900/50 text-yellow-300"}`}>
                              {photo.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className={`text-base font-bold ${playfair.className} text-[color:var(--color-text)] truncate`}>{photo.alt}</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setActiveNav("upload")} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/30 transition-all hover:bg-[color:var(--color-primary)]/5">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <span className="text-xs font-bold">Upload New</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedPhotos.map((photo) => (
                      <div key={photo.id} onClick={() => openDrawer(photo)} className="group flex items-center justify-between p-3 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:border-[color:var(--color-primary)]/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="80px" />
                          </div>
                          <div>
                            <h3 className={`font-bold ${playfair.className} text-xl text-[color:var(--color-text)] group-hover:text-[color:var(--color-primary)] transition-colors line-clamp-1`}>{photo.alt}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${photo.status === "active" ? "bg-green-50 text-green-600" : photo.status === "rejected" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                                {photo.status}
                              </span>
                              <span className="text-xs text-gray-400 hidden sm:inline">Uploaded {photo.uploadedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-10 pr-2 sm:pr-6">
                          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
                            <div className="text-center w-16">
                              <p className="text-[color:var(--color-text)] font-bold text-base">{photo.downloads}</p>
                              <p className="text-[10px] uppercase tracking-wider font-semibold">Downs</p>
                            </div>
                            <div className="text-center w-16">
                              <p className="text-[color:var(--color-text)] font-bold text-base">{(photo.views / 1000).toFixed(1)}k</p>
                              <p className="text-[10px] uppercase tracking-wider font-semibold">Views</p>
                            </div>
                            <div className="text-center w-20">
                              <p className="text-[color:var(--color-primary)] font-bold text-base">KES {photo.earnings}</p>
                              <p className="text-[10px] uppercase tracking-wider font-semibold">Earned</p>
                            </div>
                          </div>
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-300 group-hover:text-[color:var(--color-primary)] transition-colors transform group-hover:translate-x-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setActiveNav("upload")} className="w-full flex items-center justify-center gap-3 p-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/30 transition-all hover:bg-[color:var(--color-primary)]/5">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <span className="text-sm font-bold">Upload New Photo</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* UPLOAD */}
          {activeNav === "upload" && (
            <UploadTab onUploadSuccess={(newPhoto) => {
              setPhotosList(prev => [newPhoto, ...prev]);
              toast.success("Submission Successful!", {
                description: `"${newPhoto.alt}" has been submitted for approval.`,
              });
            }} />
          )}

          {/* EARNINGS */}
          {activeNav === "earnings" && (
            <div className="space-y-20 animate-fade-in-up max-w-5xl mx-auto">
              <div className="relative bg-gray-900 rounded-[32px] p-10 md:p-16 text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[color:var(--color-primary)]/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
                  <div className="space-y-4">
                    <span className="text-[color:var(--color-primary)] font-bold tracking-[0.3em] uppercase text-[10px]">
                      Available Portfolio Balance
                    </span>
                    <h2 className={`text-6xl md:text-8xl font-bold ${playfair.className} leading-none`}>
                      <span className="text-gray-500 text-3xl md:text-4xl font-normal mr-2">KES</span>
                      {availableBalance.toLocaleString()}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 pt-4 md:gap-6">
                      <div className="space-y-1">
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">This Month</p>
                        <p className="text-lg font-bold">KES 435 <span className="text-green-500 text-xs font-medium ml-1">↑ 12.5%</span></p>
                      </div>
                      <div className="w-px h-8 bg-gray-700"></div>
                      <div className="space-y-1">
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Pending Clearance</p>
                        <p className="text-lg font-bold">KES {pendingClearance}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-700"></div>
                      <div className="space-y-1">
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Total Earnings</p>
                        <p className="text-lg font-bold">KES {totalEarningsWithPending}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="group flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold hover:bg-[color:var(--color-primary)] hover:text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-base"
                  >
                    Withdraw Funds
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-13">
                <div className="space-y-6 relative">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className={`text-3xl ${playfair.className}`}>Recent <span className="italic text-gray-400">Transactions</span></h3>
                      <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">The Registry of Sales</p>
                    </div>
                    <div className="flex gap-2 self-end">
                      <button
                        onClick={() => txnScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                        className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)] transition-all"
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button
                        onClick={() => txnScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                        className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)] transition-all"
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {[
                      { id: "all", label: "All", count: transactionsList.length, colorClass: "bg-gray-100 text-gray-700" },
                      { id: "completed", label: "Completed", count: transactionsList.filter(t => t.status === "completed").length, colorClass: "bg-green-50 text-green-600 border border-green-100/50" },
                      { id: "pending", label: "Pending", count: transactionsList.filter(t => t.status === "pending").length, colorClass: "bg-amber-50 text-amber-600 border border-amber-100/50" },
                      { id: "failed_reversed", label: "Reversed / Failed", count: transactionsList.filter(t => t.status === "reversed" || t.status === "failed").length, colorClass: "bg-slate-50 text-slate-600 border border-slate-100/50" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setTxnFilter(pill.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                          txnFilter === pill.id
                            ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)] shadow-sm"
                            : "bg-white hover:bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        <span>{pill.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          txnFilter === pill.id ? "bg-white/20 text-white" : pill.colorClass
                        }`}>
                          {pill.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {transactionsList.filter(txn => {
                    if (txnFilter === "completed") return txn.status === "completed";
                    if (txnFilter === "pending") return txn.status === "pending";
                    if (txnFilter === "failed_reversed") return txn.status === "reversed" || txn.status === "failed";
                    return true;
                  }).length === 0 ? (
                    <div className="w-full py-12 text-center bg-white border border-gray-150 border-dashed rounded-3xl">
                      <p className="text-gray-400 text-sm italic">No transactions to show.</p>
                    </div>
                  ) : (
                    <div ref={txnScrollRef} className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory">
                      {transactionsList
                        .filter(txn => {
                          if (txnFilter === "completed") return txn.status === "completed";
                          if (txnFilter === "pending") return txn.status === "pending";
                          if (txnFilter === "failed_reversed") return txn.status === "reversed" || txn.status === "failed";
                          return true;
                        })
                        .map((txn, idx) => {
                          const photo = photosList.find(p => p.id === txn.photoId) || photosList[0];
                          let badge = {
                            bg: "bg-green-50 border-green-100/60",
                            text: "text-green-600",
                            dot: "bg-green-500",
                            label: "Completed"
                          };
                          if (txn.status === "pending") {
                            badge = { bg: "bg-amber-50 border-amber-100/60", text: "text-amber-600", dot: "bg-amber-500", label: "Pending" };
                          } else if (txn.status === "failed") {
                            badge = { bg: "bg-red-50 border-red-100/60", text: "text-red-500", dot: "bg-red-500", label: "Failed" };
                          } else if (txn.status === "reversed") {
                            badge = { bg: "bg-slate-50 border-slate-100", text: "text-slate-600", dot: "bg-slate-500", label: "Reversed" };
                          }
                          return (
                            <div key={txn.id} onClick={() => setSelectedTransaction(txn)} className="cursor-pointer flex-shrink-0 w-[340px] group bg-white p-6 rounded-3xl border border-gray-100/60 shadow-sm hover:shadow-xl hover:border-[color:var(--color-primary)]/20 transition-all snap-start">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-gray-300 font-mono tracking-tighter">REF/0{idx + 1}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded border ${badge.bg} ${badge.text} flex items-center gap-1`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                    {badge.label}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                    {txn.licenseType}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden relative flex-shrink-0 transition-all duration-500 shadow-sm border border-gray-100">
                                  <Image src={photo ? photo.src : "/placeholder.png"} alt={txn.photoTitle} fill className="object-cover" sizes="80px" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[color:var(--color-text)] truncate uppercase tracking-tight">{txn.photoTitle}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-widest">{txn.date}</p>
                                  {txn.statusDetails && (
                                    <p className={`text-[10px] font-medium mt-1 truncate ${txn.status === "failed" ? "text-red-500" : txn.status === "pending" ? "text-amber-500" : "text-gray-400 italic"}`}>
                                      {txn.status === "reversed" && "⟲ "}{txn.statusDetails}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sale Amount</span>
                                <p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-primary)]`}>
                                  <span className="text-xs font-normal text-gray-400 mr-1 uppercase">KES</span>
                                  {txn.amount}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <hr className="border-gray-300/70" />

                <div className="space-y-8 relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className={`text-3xl ${playfair.className}`}>Payout <span className="italic text-gray-400">History</span></h3>
                      <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">Settled Accounts</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => payoutScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                        className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)] transition-all"
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button
                        onClick={() => payoutScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                        className="p-3 bg-white border border-gray-100 rounded-full shadow-sm hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)] transition-all"
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>

                  <div ref={payoutScrollRef} className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory">
                    {payoutsList.map((payout, idx) => (
                      <div key={payout.id} className="flex-shrink-0 w-[340px] group bg-white p-8 rounded-3xl border border-gray-100/60 shadow-sm hover:shadow-xl hover:border-green-100 transition-all snap-start">
                        <div className="flex items-center justify-between mb-8">
                          <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-[color:var(--color-primary)]/10 transition-colors">
                            {payout.method === "M-Pesa" ? (
                              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-gray-400 group-hover:text-[color:var(--color-primary)] transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            ) : (
                              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-gray-400 group-hover:text-[color:var(--color-primary)] transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                            payout.status === "paid"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-yellow-50 text-yellow-600 border-yellow-100"
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                        <div className="space-y-1 mb-8">
                          <p className="text-lg font-bold text-[color:var(--color-text)] uppercase tracking-tight">{payout.method}</p>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{payout.date}</p>
                        </div>
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                          <p className={`text-2xl font-bold ${playfair.className}`}>
                            <span className="text-xs font-normal text-gray-400 mr-1 uppercase">KES</span>
                            {payout.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex-shrink-0 w-[340px] bg-gray-900 p-8 rounded-3xl text-white flex flex-col justify-center snap-start">
                      <p className={`text-2xl ${playfair.className} leading-tight mb-4`}>Processing <br/><span className="italic text-[color:var(--color-primary)]">Schedule</span></p>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium">
                        Payouts are processed every <span className="text-white font-bold">Mon & Thu</span>. Minimum KES 500.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeNav === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
                <h2 className={`text-3xl ${playfair.className} text-[color:var(--color-text)]`}>Profile <span className="italic text-gray-400">Settings</span></h2>
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

              <div className="bg-white border border-gray-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <h2 className={`text-3xl ${playfair.className} text-[color:var(--color-text)] flex items-center gap-4`}>
                    Payment <span className="italic text-gray-400">Details</span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full font-sans tracking-wider uppercase">KES</span>
                  </h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">How you'll receive your earnings</p>

                {paymentMethodState !== "saved" && (
                  <div className="flex bg-gray-100/50 p-1 rounded-xl w-full md:w-max mb-6">
                    <button
                      onClick={() => setSelectedPaymentType("mpesa")}
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedPaymentType === "mpesa" ? "bg-white text-[color:var(--color-text)] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> M-Pesa
                    </button>
                    <button
                      onClick={() => setSelectedPaymentType("bank")}
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedPaymentType === "bank" ? "bg-white text-[color:var(--color-text)] shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Bank Transfer
                    </button>
                  </div>
                )}

                {paymentMethodState === "empty" && !selectedPaymentType && (
                  <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-gray-400 text-sm">Add a payment method to start receiving payouts.</p>
                  </div>
                )}

                {(paymentMethodState === "empty" || paymentMethodState === "editing") && selectedPaymentType === "mpesa" && (
                  <div className="space-y-4 p-6 rounded-2xl border border-gray-100 bg-gray-50/30 animate-fade-in-up">
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="+254 7XX XXX XXX"
                        inputMode="numeric"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Account Name <span className="text-gray-300 normal-case font-normal ml-1">(Optional)</span></label>
                      <input
                        type="text"
                        value={paymentMpesaName}
                        onChange={(e) => setPaymentMpesaName(e.target.value)}
                        placeholder="e.g. John Kamau (As registered on M-Pesa)"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {(paymentMethodState === "empty" || paymentMethodState === "editing") && selectedPaymentType === "bank" && (
                  <div className="space-y-4 p-6 rounded-2xl border border-gray-100 bg-gray-50/30 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Bank Name</label>
                        <select
                          value={paymentBankName}
                          onChange={(e) => setPaymentBankName(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm appearance-none"
                        >
                          <option value="">Select your bank ▾</option>
                          <option value="Equity Bank">Equity Bank</option>
                          <option value="KCB Bank">KCB Bank</option>
                          <option value="NCBA Bank">NCBA Bank</option>
                          <option value="Co-operative Bank">Co-operative Bank</option>
                          <option value="Absa Bank">Absa Bank</option>
                          <option value="DTB Bank">DTB Bank</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Account Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={paymentAccountNum}
                          onChange={(e) => setPaymentAccountNum(e.target.value)}
                          placeholder="0123456789"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          value={paymentAccountName}
                          onChange={(e) => setPaymentAccountName(e.target.value)}
                          placeholder="Full name as on account"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Branch <span className="text-gray-300 normal-case font-normal ml-1">(Optional)</span></label>
                        <input
                          type="text"
                          value={paymentBranch}
                          onChange={(e) => setPaymentBranch(e.target.value)}
                          placeholder="e.g. Westlands Branch"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethodState === "saved" && savedPaymentData && (
                  <div className="relative overflow-hidden p-6 rounded-2xl border border-green-100 bg-green-50/30">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Current Payout Method
                        </div>
                        <div className="text-[color:var(--color-text)] font-bold flex items-center gap-1.5">
                          {savedPaymentData.type === "mpesa" ? (
                            <>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              <span>M-Pesa</span>
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              <span>{savedPaymentData.bankName}</span>
                            </>
                          )}
                        </div>
                        <div className="text-gray-500 font-mono text-sm">
                          {savedPaymentData.type === "mpesa" ? savedPaymentData.phone.slice(-3).padStart(savedPaymentData.phone.length, "•") : `•••• •••• ${savedPaymentData.accountNum.slice(-4)}`}
                        </div>
                        <div className="text-sm text-gray-500 mt-2 font-medium">
                          {savedPaymentData.type === "mpesa" ? savedPaymentData.mpesaName : savedPaymentData.accountName}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPaymentMethodState("editing");
                          setSelectedPaymentType(savedPaymentData.type);
                        }}
                        className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if(confirm("Are you sure you want to remove your payment method?")) {
                          setPaymentMethodState("empty");
                          setSelectedPaymentType(null);
                          setSavedPaymentData(null);
                          toast.success("Payment method removed");
                        }
                      }}
                      className="mt-6 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove payment method
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Payouts are processed once your balance reaches <strong>KES 2,000</strong>. Payments are made on the 15th of each month.</p>
                </div>

                {(paymentMethodState === "empty" || paymentMethodState === "editing") && selectedPaymentType && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
                    {paymentMethodState === "editing" ? (
                      <button
                        onClick={() => setPaymentMethodState("saved")}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    ) : <div></div>}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                      {paymentSaveSuccess && (
                        <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-fade-in">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Payment method saved
                        </span>
                      )}
                      <button
                        onClick={handleSavePaymentMethod}
                        disabled={isSavingPayment}
                        className={`w-full md:w-auto px-6 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all flex items-center justify-center min-w-[180px] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm`}
                      >
                        {isSavingPayment ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          paymentMethodState === "editing" ? "Update Payment Method" : "Save Payment Method"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
      </ContributorDashboardLayout>

      {/* Deactivate Modal */}
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
              <p className={`text-[11px] font-semibold transition-colors ${confirmText === "" ? "text-amber-600" : confirmText === "DEACTIVATE" ? "text-green-600" : "text-red-500"}`}>
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

      <PhotoDetailDrawer
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onSave={handleSavePhotoDetails}
        onDelete={handleDeletePhoto}
      />

      <TransactionReceiptDrawer
        transaction={selectedTransaction}
        photos={photosList}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <p>WithdrawModal has been removed for brevity, but would be here.</p>
      )}
    </div>
  );
}