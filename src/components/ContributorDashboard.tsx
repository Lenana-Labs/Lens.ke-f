"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { toast } from "sonner";

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

// --- Mock Data (will be replaced with CONTRIBUTOR.DASHBOARD API) ---
const initialMockPhotos: Photo[] = [
  { id: "g2", src: "/images/gallery/savannah_green.png", alt: "Acacia Tree", downloads: 124, views: 3820, earnings: 620, status: "active", description: "A lone acacia tree stands tall against the vibrant green savannah of the Maasai Mara.", location: "Maasai Mara, Kenya", camera: "Sony A7R IV", category: "Nature", tags: ["savannah", "tree", "green", "landscape"], uploadedAt: "Oct 12, 2023" },
  { id: "g5", src: "/images/gallery/rift_valley_gold.png", alt: "Golden Hour", downloads: 87, views: 2241, earnings: 435, status: "active", description: "The sun sets over the Great Rift Valley, casting a golden hue over the escarpment.", location: "Rift Valley, Kenya", camera: "Canon EOS R5", category: "Landscape", tags: ["sunset", "golden hour", "valley", "rift valley"], uploadedAt: "Sep 28, 2023" },
  { id: "g9", src: "/images/gallery/swahili_blue.png", alt: "Coastal Blue", downloads: 45, views: 1105, earnings: 225, status: "active", description: "The pristine blue waters of the Indian Ocean off the coast of Diani Beach.", location: "Diani Beach, Kenya", camera: "DJI Mavic 3", category: "Aerial", tags: ["ocean", "blue", "coast", "diani"], uploadedAt: "Aug 15, 2023" },
  { id: "g13", src: "/images/gallery/city_lights_charcoal.png", alt: "City Streets", downloads: 31, views: 890, earnings: 155, status: "rejected", rejectionReason: "Image contains a visible watermark in the bottom right corner. Please remove it and resubmit.", description: "Nairobi city streets at night, capturing the vibrant energy and glowing lights.", location: "Nairobi, Kenya", camera: "Nikon Z7 II", category: "Urban", tags: ["city", "night", "lights", "nairobi"], uploadedAt: "Nov 02, 2023" },
];

const mockTransactions: Transaction[] = [
  { id: "t1", photoId: "g2", photoTitle: "Acacia Tree", licenseType: "Standard", date: "Jun 3, 2025", amount: 155, status: "completed" },
  { id: "t2", photoId: "g5", photoTitle: "Golden Hour",  licenseType: "Extended", date: "Jun 1, 2025", amount: 435, status: "pending", statusDetails: "Clears in 24 hrs" },
  { id: "t3", photoId: "g9", photoTitle: "Coastal Blue", licenseType: "Standard", date: "May 28, 2025", amount: 225, status: "reversed", statusDetails: "Refunded: License Cancelled" },
  { id: "t4", photoId: "g2", photoTitle: "Acacia Tree",  licenseType: "Editorial", date: "May 25, 2025", amount: 80, status: "completed" },
  { id: "t5", photoId: "g5", photoTitle: "Golden Hour",  licenseType: "Standard", date: "May 20, 2025", amount: 155, status: "failed", statusDetails: "Card declined by cardholder bank" },
];

const mockPayouts: Payout[] = [
  { id: "p1", method: "M-Pesa", date: "Jun 1, 2025", amount: 800, status: "paid" },
  { id: "p2", method: "Bank Transfer", date: "May 1, 2025", amount: 1200, status: "paid" },
  { id: "p3", method: "M-Pesa", date: "Apr 1, 2025", amount: 650, status: "paid" },
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
  const [photosView, setPhotosView] = useState<"grid" | "list">("grid");
  const [photosList, setPhotosList] = useState<Photo[]>(initialMockPhotos);
  const [portfolioFilter, setPortfolioFilter] = useState<"All" | "Active" | "Pending" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolioSort, setPortfolioSort] = useState<"uploadedAt" | "downloads" | "views" | "earnings">("uploadedAt");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Scroll Refs for Earnings
  const txnScrollRef = useRef<HTMLDivElement>(null);
  const payoutScrollRef = useRef<HTMLDivElement>(null);

  // Transactions State
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(mockTransactions);
  const [txnFilter, setTxnFilter] = useState<"all" | "completed" | "pending" | "failed_reversed">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Payouts & Balance State
  const [availableBalance, setAvailableBalance] = useState(1435);
  const [payoutsList, setPayoutsList] = useState<Payout[]>(mockPayouts);

  // Drawer state
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerDesc, setDrawerDesc] = useState("");
  const [drawerLocation, setDrawerLocation] = useState("");
  const [drawerTags, setDrawerTags] = useState<string[]>([]);
  const [drawerTagInput, setDrawerTagInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"mpesa" | "bank">("mpesa");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("+254 712 345 678");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Payment Details Settings State
  const [paymentMethodState, setPaymentMethodState] = useState<"empty" | "editing" | "saved">("empty");
  const [selectedPaymentType, setSelectedPaymentType] = useState<"mpesa" | "bank" | null>(null);
  const [savedPaymentData, setSavedPaymentData] = useState<any>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);
  
  // Payment Form States
  const [paymentPhone, setPaymentPhone] = useState("+254 ");
  const [paymentMpesaName, setPaymentMpesaName] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountNum, setPaymentAccountNum] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");
  const [paymentBranch, setPaymentBranch] = useState("");

  const pendingClearance = transactionsList
    .filter(t => t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalEarnings = availableBalance + pendingClearance;

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

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 500 || amount > availableBalance) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      // Deduct from available balance
      setAvailableBalance(prev => prev - amount);

      // Prepend a new payout history item
      const newPayout: Payout = {
        id: `p-${Date.now()}`,
        method: withdrawMethod === "mpesa" ? "M-Pesa" : "Bank Transfer",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        amount: amount,
        status: "processing"
      };
      setPayoutsList(prev => [newPayout, ...prev]);

      toast.success("Withdrawal Requested", { description: `KES ${withdrawAmount} will be sent via ${withdrawMethod === "mpesa" ? "M-Pesa" : "Bank Transfer"} within 24 hours.` });
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
    }, 1500);
  };

  // Sync drawer fields when photo is selected
  useEffect(() => {
    if (selectedPhoto) {
      setDrawerTitle(selectedPhoto.alt);
      setDrawerDesc(selectedPhoto.description);
      setDrawerLocation(selectedPhoto.location);
      setDrawerTags([...selectedPhoto.tags]);
      setDrawerTagInput("");
      setShowDeleteConfirm(false);
    }
  }, [selectedPhoto]);

  // Handle escape key
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

  const handleSavePhotoDetails = () => {
    if (!selectedPhoto) return;
    const isResubmitting = selectedPhoto.status === "rejected";
    setPhotosList(prev => prev.map(p => 
      p.id === selectedPhoto.id 
        ? { 
            ...p, 
            alt: drawerTitle, 
            description: drawerDesc, 
            location: drawerLocation, 
            tags: drawerTags,
            status: isResubmitting ? "pending" : p.status
          }
        : p
    ));
    if (isResubmitting) {
      toast.success("Changes Saved & Resubmitted", { 
        description: `"${drawerTitle}" has been resubmitted for approval.` 
      });
    } else {
      toast.success("Changes Saved", { 
        description: `Updates to '${drawerTitle}' have been saved.` 
      });
    }
    setSelectedPhoto(null);
  };

  const handleDeletePhoto = () => {
    if (!selectedPhoto) return;
    setPhotosList(prev => prev.filter(p => p.id !== selectedPhoto.id));
    toast.error("Photo Deleted", { description: `'${drawerTitle}' has been removed from your portfolio.` });
    setSelectedPhoto(null);
  };

  const handleAddDrawerTag = (tagToAdd?: string) => {
    const cleanTag = (tagToAdd || drawerTagInput).trim();
    if (cleanTag && !drawerTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
      setDrawerTags([...drawerTags, cleanTag]);
      setDrawerTagInput("");
    }
  };
  
  const handleRemoveDrawerTag = (tagToRemove: string) => {
    setDrawerTags(drawerTags.filter(t => t !== tagToRemove));
  };
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

  const handlePhotoSubmit = async () => {
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

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const intentUrl = process.env.NEXT_PUBLIC_PHOTO_UPLOAD_INTENT || "";
      const finalizeUrl = process.env.NEXT_PUBLIC_PHOTO_FINALIZE || "";

      if (!intentUrl || !finalizeUrl) {
        throw new Error("Upload API endpoints are not configured in environment variables.");
      }

      // Step 1: Call the intent API to get the presigned URL & fileKey
      const intentRes = await fetch(intentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.name,
          fileType: uploadFile.type,
          fileSize: uploadFile.size,
          title: uploadTitle,
          location: uploadLocation,
          camera: uploadCamera,
          category: uploadCategory,
          description: uploadDesc,
          tags: selectedTags,
        }),
      });

      if (!intentRes.ok) throw new Error("Failed to initialize upload intent.");
      
      const { uploadUrl, fileKey } = await intentRes.json();
      setUploadProgress(40);

      // Step 2: Upload the actual file directly to the provided URL (e.g. S3 presigned URL)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": uploadFile.type,
        },
        body: uploadFile,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload the file to storage.");
      setUploadProgress(80);

      // Step 3: Finalize the upload
      const finalizeRes = await fetch(finalizeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey }),
      });

      if (!finalizeRes.ok) throw new Error("Failed to finalize upload.");
      setUploadProgress(100);

      // Success - Add new photo item to the dashboard portfolio
      const newPhoto: Photo = {
        id: `g-${Date.now()}`,
        src: previewUrl || "/images/gallery/savannah_green.png",
        alt: uploadTitle,
        downloads: 0,
        views: 0,
        earnings: 0,
        status: "pending",
        description: uploadDesc || "No description provided.",
        location: uploadLocation,
        camera: uploadCamera || "Standard Camera",
        category: uploadCategory || "General",
        tags: selectedTags.length > 0 ? selectedTags : ["photography"],
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setPhotosList((prev) => [newPhoto, ...prev]);

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

    } catch (error: any) {
      toast.error("Upload failed", {
        description: error.message || "An unexpected error occurred during upload.",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
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
            <h1 className={`text-3xl tracking-tight text-[color:var(--color-text)] ${playfair.className}`}>
              {activeNav === "overview" && <span>Good morning, <span className="font-bold italic text-[color:var(--color-primary)]">Wanjiku ✦</span></span>}
              {activeNav === "photos" && <span>Your <span className="italic text-gray-400">Portfolio</span></span>}
              {activeNav === "upload" && <span>Upload <span className="italic text-gray-400">Photograph</span></span>}
              {activeNav === "earnings" && <span>Earnings <span className="italic text-gray-400">Summary</span></span>}
              {activeNav === "settings" && <span>Profile <span className="italic text-gray-400">Settings</span></span>}
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
                    <p className={`text-4xl font-bold ${playfair.className} text-[color:var(--color-primary)] mt-2`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Top Performing Photos */}
              <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                  <h2 className={`text-3xl ${playfair.className} text-[color:var(--color-text)]`}>Top Performing <span className="italic text-gray-400">Photos</span></h2>
                  <button onClick={() => setActiveNav("photos")} className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-[color:var(--color-primary)] transition-colors">View all →</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {photosList.map((photo) => (
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
              {/* Header Row: Filters + Search + View Toggle */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter Pills */}
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

                    {/* Category Filter Pills */}
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

                  {/* Search Bar */}
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
                  {/* Sort Dropdown */}
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

                  {/* View Toggle */}
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
                  // 1. Status Filter
                  if (portfolioFilter !== "All" && photo.status !== portfolioFilter.toLowerCase()) {
                    return false;
                  }
                  // 2. Category Filter
                  if (categoryFilter !== "All" && photo.category.toLowerCase() !== categoryFilter.toLowerCase()) {
                    return false;
                  }
                  // 3. Search Query Filter
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    const matchesAlt = photo.alt.toLowerCase().includes(q);
                    const matchesLoc = photo.location.toLowerCase().includes(q);
                    const matchesTags = photo.tags.some(t => t.toLowerCase().includes(q));
                    return matchesAlt || matchesLoc || matchesTags;
                  }
                  return true;
                });

                // Sort photos
                const sortedPhotos = [...filteredPhotos].sort((a, b) => {
                  if (portfolioSort === "uploadedAt") {
                    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
                  }
                  if (portfolioSort === "downloads") {
                    return b.downloads - a.downloads;
                  }
                  if (portfolioSort === "views") {
                    return b.views - a.views;
                  }
                  if (portfolioSort === "earnings") {
                    return b.earnings - a.earnings;
                  }
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
                        onClick={() => {
                          setPortfolioFilter("All");
                          setCategoryFilter("All");
                          setSearchQuery("");
                        }}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  );
                }

                return photosView === "grid" ? (
                  /* Grid View */
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
                    {/* Upload CTA card */}
                    <button onClick={() => setActiveNav("upload")} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/30 transition-all hover:bg-[color:var(--color-primary)]/5">
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <span className="text-xs font-bold">Upload New</span>
                    </button>
                  </div>
                ) : (
                  /* List View */
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
                    
                    {/* Upload CTA Row */}
                    <button onClick={() => setActiveNav("upload")} className="w-full flex items-center justify-center gap-3 p-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]/30 transition-all hover:bg-[color:var(--color-primary)]/5">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <span className="text-sm font-bold">Upload New Photo</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ---- UPLOAD TAB ---- */}
          {activeNav === "upload" && (
            <div className="max-w-4xl mx-auto animate-fade-in-up space-y-5">

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
                  <h2 className={`text-3xl ${playfair.className} text-[color:var(--color-text)] mb-1`}>Upload <span className="italic text-gray-400">Photograph</span></h2>
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
                        <p className={`font-bold text-2xl ${playfair.className} transition-colors ${isDragging ? "text-[color:var(--color-primary)]" : "text-gray-700"}`}>
                          {isDragging ? <span>Release to <span className="italic text-gray-400">upload</span></span> : <span>Drag & drop <span className="italic text-gray-400">high-res file</span> here</span>}
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
            <div className="space-y-20 animate-fade-in-up max-w-5xl mx-auto">
              
              {/* Cinematic Reward Hero */}
              <div className="relative bg-gray-900 rounded-[32px] p-10 md:p-16 text-white overflow-hidden shadow-2xl">
                {/* Subtle background texture/glow */}
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
                        <p className="text-lg font-bold">KES {totalEarnings}</p>
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
                {/* Transactions Row */}
                <div className="space-y-6 relative">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className={`text-3xl ${playfair.className}`}>Recent <span className="italic text-gray-400">Transactions</span></h3>
                      <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">The Registry of Sales</p>
                    </div>
                    {/* Navigation Buttons */}
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

                  {/* Status Filter Pills */}
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
                      <p className="text-gray-400 text-sm italic">No transactions found in this category.</p>
                    </div>
                  ) : (
                    <div 
                      ref={txnScrollRef}
                      className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory"
                    >
                      {transactionsList
                        .filter(txn => {
                          if (txnFilter === "completed") return txn.status === "completed";
                          if (txnFilter === "pending") return txn.status === "pending";
                          if (txnFilter === "failed_reversed") return txn.status === "reversed" || txn.status === "failed";
                          return true;
                        })
                        .map((txn, idx) => {
                          const photo = photosList.find(p => p.id === txn.photoId) || photosList[0];
                          
                          // Status styling mapping
                          let badge = {
                            bg: "bg-green-50 border-green-100/60",
                            text: "text-green-600",
                            dot: "bg-green-500",
                            label: "Completed"
                          };
                          if (txn.status === "pending") {
                            badge = {
                              bg: "bg-amber-50 border-amber-100/60",
                              text: "text-amber-600",
                              dot: "bg-amber-500",
                              label: "Pending"
                            };
                          } else if (txn.status === "failed") {
                            badge = {
                              bg: "bg-red-50 border-red-100/60",
                              text: "text-red-500",
                              dot: "bg-red-500",
                              label: "Failed"
                            };
                          } else if (txn.status === "reversed") {
                            badge = {
                              bg: "bg-slate-50 border-slate-100",
                              text: "text-slate-600",
                              dot: "bg-slate-500",
                              label: "Reversed"
                            };
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
                                  <Image src={photo.src} alt={txn.photoTitle} fill className="object-cover" sizes="80px" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[color:var(--color-text)] truncate uppercase tracking-tight">{txn.photoTitle}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-widest">{txn.date}</p>
                                  {txn.statusDetails && (
                                    <p className={`text-[10px] font-medium mt-1 truncate ${
                                      txn.status === "failed" ? "text-red-500" :
                                      txn.status === "pending" ? "text-amber-500" :
                                      "text-gray-400 italic"
                                    }`}>
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

                {/* Payouts Row */}
                <div className="space-y-8 relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className={`text-3xl ${playfair.className}`}>Payout <span className="italic text-gray-400">History</span></h3>
                      <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">Settled Accounts</p>
                    </div>
                    {/* Navigation Buttons */}
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
                  
                  <div 
                    ref={payoutScrollRef}
                    className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory"
                  >
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
                    
                    {/* Final Insight Card */}
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

          {/* ---- SETTINGS TAB ---- */}
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

              {/* Payment Details Section */}
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

                {/* Method Selector */}
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

                {/* Forms */}
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

                {/* Saved Method Card */}
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

                {/* Minimum Payout Info Block */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Payouts are processed once your balance reaches <strong>KES 2,000</strong>. Payments are made on the 15th of each month.</p>
                </div>

                {/* Save / Update CTA */}
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

      {/* ---- PHOTO DETAIL DRAWER ---- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${selectedPhoto ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedPhoto(null)}
      />
      
      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 sm:right-0 bottom-0 sm:bottom-auto w-full sm:w-[600px] bg-white rounded-t-3xl sm:rounded-t-none sm:rounded-tl-3xl overflow-hidden shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          selectedPhoto ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
        style={{ height: "100dvh" }}
      >
        {selectedPhoto && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-[color:var(--color-text)]">Photo Details</h2>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close photo details"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* Image Preview */}
              <div className="relative w-full aspect-video bg-gray-950">
                <Image src={selectedPhoto.src} alt={selectedPhoto.alt} fill className="object-contain" sizes="600px" />
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm ${
                    selectedPhoto.status === "active" ? "bg-green-900/50 text-green-300" : 
                    selectedPhoto.status === "rejected" ? "bg-red-900/50 text-red-300" : 
                    "bg-yellow-900/50 text-yellow-300"
                  }`}>
                    {selectedPhoto.status}
                  </span>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50/50">
                <div className="px-6 py-4 text-center">
                  <p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-text)]`}>{selectedPhoto.downloads}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Downloads</p>
                </div>
                <div className="px-6 py-4 text-center border-l border-gray-100">
                  <p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-text)]`}>{(selectedPhoto.views / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Views</p>
                </div>
                <div className="px-6 py-4 text-center border-l border-gray-100">
                  <p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-primary)]`}>KES {selectedPhoto.earnings}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Earned</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Rejection Banner */}
                {selectedPhoto.status === "rejected" && selectedPhoto.rejectionReason && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-500 mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                      <p className="font-bold text-red-700 text-sm">Reviewer Note</p>
                      <p className="text-red-600 text-xs mt-1 leading-relaxed">{selectedPhoto.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Read-only Info Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Camera</p>
                    <p className="text-sm font-semibold text-[color:var(--color-text)] mt-1">{selectedPhoto.camera}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</p>
                    <p className="text-sm font-semibold text-[color:var(--color-text)] mt-1">{selectedPhoto.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</p>
                    <p className="text-sm font-semibold text-[color:var(--color-text)] mt-1">{selectedPhoto.uploadedAt}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Editable Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
                    <input type="text" value={drawerTitle} onChange={(e) => setDrawerTitle(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-xl font-bold ${playfair.className}`} />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea rows={3} value={drawerDesc} onChange={(e) => setDrawerDesc(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm resize-none" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Location</label>
                    <input type="text" value={drawerLocation} onChange={(e) => setDrawerLocation(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {drawerTags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                          {tag}
                          <button onClick={() => handleRemoveDrawerTag(tag)} className="hover:text-red-500 hover:bg-gray-200 rounded-full p-0.5 transition-colors">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={drawerTagInput} 
                        onChange={(e) => setDrawerTagInput(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddDrawerTag(); } }}
                        placeholder="Add a tag..." 
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" 
                      />
                      <button onClick={() => handleAddDrawerTag()} className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Actions (non-sticky) */}
                <div className="pt-6 border-t border-gray-100">
                  {showDeleteConfirm ? (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <p className="text-sm font-bold text-gray-700 text-center">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                          Cancel
                        </button>
                        <button onClick={handleDeletePhoto} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm hover:shadow-md">
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm">
                        Delete
                      </button>
                      <button onClick={handleSavePhotoDetails} className="flex-1 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---- TRANSACTION RECEIPT DRAWER ---- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${selectedTransaction ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedTransaction(null)}
      />
      
      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 sm:right-0 bottom-0 sm:bottom-auto w-full sm:w-[600px] bg-white rounded-t-3xl sm:rounded-t-none sm:rounded-tl-3xl overflow-hidden shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          selectedTransaction ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
        style={{ height: "100dvh" }}
      >
        {selectedTransaction && (
          <>
             {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h2 className="font-bold text-[color:var(--color-text)]">Transaction Receipt</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transaction Audit Slip</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full font-sans tracking-wider uppercase">KES</span>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close receipt details"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
              {/* Photograph sold preview */}
              {(() => {
                const photo = photosList.find(p => p.id === selectedTransaction.photoId) || photosList[0];
                return (
                  <div className="relative w-full aspect-video bg-gray-950 rounded-2xl overflow-hidden shadow-md border border-gray-850">
                    <Image src={photo.src} alt={selectedTransaction.photoTitle} fill className="object-contain" sizes="600px" />
                  </div>
                );
              })()}

              {/* Status Badge Block */}
              {(() => {
                let badge = {
                  bg: "bg-green-50 border-green-150 text-green-600",
                  dot: "bg-green-500",
                  label: "Completed",
                  desc: "This transaction has cleared and is added to your available portfolio balance. It will be settled in the next payout cycle."
                };
                if (selectedTransaction.status === "pending") {
                  badge = {
                    bg: "bg-amber-50 border-amber-150 text-amber-600",
                    dot: "bg-amber-500",
                    label: "Pending Clearance",
                    desc: "This transaction is currently clearing and is held in escrow. Funds will clear within 24 hours."
                  };
                } else if (selectedTransaction.status === "failed") {
                  badge = {
                    bg: "bg-red-50 border-red-150 text-red-600",
                    dot: "bg-red-500",
                    label: "Failed Payment",
                    desc: "The buyer's payment was declined by the cardholder bank. No download license was issued."
                  };
                } else if (selectedTransaction.status === "reversed") {
                  badge = {
                    bg: "bg-slate-50 border-slate-200 text-slate-600",
                    dot: "bg-slate-500",
                    label: "Reversed / Refunded",
                    desc: "This transaction has been refunded. The license has been revoked and the amount deducted from your earnings balance."
                  };
                }

                return (
                  <div className={`p-5 rounded-2xl border ${badge.bg} space-y-2`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{badge.desc}</p>
                    {selectedTransaction.statusDetails && (
                      <p className="text-xs font-mono font-semibold pt-1 border-t border-black/5 opacity-85">
                        Details: {selectedTransaction.statusDetails}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Receipt Grid */}
              <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">Receipt Metadata</span>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference Code</span>
                    <p className="font-mono font-semibold text-[color:var(--color-text)] mt-0.5">{selectedTransaction.id.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date of Sale</span>
                    <p className="font-semibold text-[color:var(--color-text)] mt-0.5">{selectedTransaction.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Photograph Title</span>
                    <p className={`font-semibold text-[color:var(--color-text)] mt-0.5 ${playfair.className} text-base`}>{selectedTransaction.photoTitle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Type</span>
                    <p className="font-semibold text-[color:var(--color-text)] mt-0.5">{selectedTransaction.licenseType} License</p>
                  </div>
                </div>
              </div>

              {/* Financial Calculation breakdown */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">Earnings Breakdown</span>
                
                <div className="space-y-2 text-sm">
                  {/* Gross Price */}
                  <div className="flex justify-between text-gray-500">
                    <span>Gross License Price</span>
                    <span className="font-medium text-[color:var(--color-text)]">KES {Math.round(selectedTransaction.amount / 0.8)}</span>
                  </div>
                  
                  {/* Platform Commission Fee (20%) */}
                  <div className="flex justify-between text-gray-500">
                    <span>Platform Commission (20%)</span>
                    <span className="text-red-500 font-medium">-KES {Math.round(selectedTransaction.amount / 0.8) - selectedTransaction.amount}</span>
                  </div>

                  <hr className="border-gray-100 my-2" />

                  {/* Net Earnings */}
                  <div className="flex justify-between items-center text-base font-bold text-[color:var(--color-text)]">
                    <span>Net Contributor Earnings</span>
                    <span className={`text-xl ${playfair.className} text-[color:var(--color-primary)]`}>KES {selectedTransaction.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer download action (non-sticky) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <button 
                onClick={() => {
                  toast.success("Receipt PDF Generated", {
                    description: `Invoice PDF for transaction ${selectedTransaction.id.toUpperCase()} has been saved.`
                  });
                }}
                className="w-full py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF Receipt
              </button>
            </div>
          </>
        )}
      </div>

      {/* ---- WITHDRAW MODAL ---- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[color:var(--color-text)] text-lg">Withdraw Funds</h3>
              <button 
                onClick={() => !isWithdrawing && setShowWithdrawModal(false)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isWithdrawing}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="500"
                    min="500"
                    max={availableBalance}
                    disabled={isWithdrawing}
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 font-medium">Balance: KES {availableBalance.toLocaleString()}</p>
                  {parseFloat(withdrawAmount) < 500 && withdrawAmount !== "" && (
                    <p className="text-xs text-amber-600 font-bold">Min. withdrawal is KES 500</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("mpesa")}
                    disabled={isWithdrawing}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${withdrawMethod === "mpesa" ? "bg-white text-[color:var(--color-text)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("bank")}
                    disabled={isWithdrawing}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${withdrawMethod === "bank" ? "bg-white text-[color:var(--color-text)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Bank Transfer
                  </button>
                </div>

                {withdrawMethod === "mpesa" ? (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">M-Pesa Number</label>
                    <input
                      type="text"
                      value={withdrawPhone}
                      onChange={(e) => setWithdrawPhone(e.target.value)}
                      disabled={isWithdrawing}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all font-mono text-sm tracking-wide"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={withdrawBank}
                        onChange={(e) => setWithdrawBank(e.target.value)}
                        placeholder="e.g. Equity Bank"
                        disabled={isWithdrawing}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Number</label>
                      <input
                        type="text"
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        disabled={isWithdrawing}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all font-mono text-sm tracking-wide"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={isWithdrawing}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || parseFloat(withdrawAmount) < 500 || (withdrawMethod === "mpesa" ? withdrawPhone.length < 10 : (!withdrawBank || !withdrawAccount))}
                  className="flex-[2] py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  {isWithdrawing ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
