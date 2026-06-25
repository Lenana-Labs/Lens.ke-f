"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner"; 
import { apiClient } from "../lib/api/client";

// This should probably be in a central types file later
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

export default function UploadTab({ onUploadSuccess }: { onUploadSuccess: (newPhoto: Photo) => void }) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadLocation, setUploadLocation] = useState("");
  const [uploadCamera, setUploadCamera] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [detectedResolution, setDetectedResolution] = useState("");
  const [detectedOrientation, setDetectedOrientation] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = (file: File, inputElement?: HTMLInputElement) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", { description: "Please select an image file (JPG, PNG, etc.)." });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      const finalWidth = width < 800 ? width * 6 : width;
      const finalHeight = height < 800 ? height * 6 : height;
      const longestSide = Math.max(finalWidth, finalHeight);
      const shortestSide = Math.min(finalWidth, finalHeight);

      if (longestSide < 3840 || shortestSide < 2160) {
        toast.error("Low Resolution", {
          description: `This image is ${finalWidth}x${finalHeight}. Photos must be at least 4K (3840px on the longest side).`
        });
        URL.revokeObjectURL(url);
        if (inputElement) inputElement.value = "";
        return;
      }

      setUploadFile(file);
      setPreviewUrl(url);
      const megapixels = ((finalWidth * finalHeight) / 1_000_000).toFixed(1);
      setDetectedResolution(`${finalWidth} x ${finalHeight} (${megapixels} MP)`);
      setDetectedOrientation(finalWidth > finalHeight ? "Landscape" : "Portrait");
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0], e.target);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePhotoSubmit = async () => {
    if (!uploadFile || !uploadTitle || !uploadLocation || !uploadCategory || selectedTags.length === 0) {
      toast.error("Validation failed", { description: "Please fill all required fields." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const intentEndpoint = process.env.NEXT_PUBLIC_PHOTO_UPLOAD_INTENT;
      const finalizeEndpoint = process.env.NEXT_PUBLIC_PHOTO_FINALIZE;

      if (!intentEndpoint || !finalizeEndpoint) {
        throw new Error("Upload API endpoints are not configured in environment variables.");
      }

      // Step 1: Call the intent API to get the presigned URL & fileKey
      const intentRes = await apiClient.post(intentEndpoint, {
        title: uploadTitle,
        filename: uploadFile.name,
        file_type: uploadFile.type,
        file_size: uploadFile.size,
        location: uploadLocation,
        //camera: uploadCamera,
        //category: uploadCategory,
        //description: uploadDesc,
        //tags: selectedTags,
      });

      console.log("Intent API response:", intentRes.data);

      const { upload_url, photo_id } = intentRes.data.data;
      const uploadUrl = upload_url;
      const fileKey = photo_id;

      setUploadProgress(40);

      console.log("Presigned URL:", uploadUrl);
      console.log("File Key:", fileKey);


      // Step 2: Upload the actual file directly to the provided URL (e.g., S3 presigned URL)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadFile.type },
        body: uploadFile,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload the file to storage.");
      setUploadProgress(80);

      // Step 3: Finalize the upload
      const finalizeRes = await apiClient.post(finalizeEndpoint, { file_key });
      setUploadProgress(100);

      const newPhoto = createUiPhoto(finalizeRes.data, {
        title: uploadTitle, location: uploadLocation, camera: uploadCamera, category: uploadCategory, desc: uploadDesc, tags: selectedTags, previewUrl,
      });

      onUploadSuccess(newPhoto);

      // Reset form
      setUploadFile(null);
      setPreviewUrl("");
      setUploadTitle("");
      setUploadLocation("");
      // ... reset other states
    } catch (error: any) {
      toast.error("Upload Failed", { description: error.response?.data?.detail || error.message || "An unexpected error occurred." });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-5">
      {/* Upload Form JSX (same as original, but without API calls) */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm">
        <div className="space-y-8">
          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5" : "border-gray-200 hover:border-[color:var(--color-primary)]/40"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="relative aspect-video w-full max-w-lg mx-auto overflow-hidden rounded-xl">
                <Image src={previewUrl} alt="Preview" fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ) : (
              <>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mx-auto text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="text-sm text-gray-500 mt-4">Drag and drop your image here, or</p>
                <label className="inline-block mt-3 px-6 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl cursor-pointer hover:bg-[#1a553a] transition-all text-sm">
                  Browse Files
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, WebP – 4K minimum</p>
              </>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Title *</label>
              <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Location *</label>
              <input type="text" value={uploadLocation} onChange={(e) => setUploadLocation(e.target.value)} placeholder="e.g. Maasai Mara, Kenya" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Camera</label>
              <input type="text" value={uploadCamera} onChange={(e) => setUploadCamera(e.target.value)} placeholder="e.g. Sony A7R IV" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category *</label>
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm appearance-none">
                <option value="">Select a category</option>
                <option value="Nature">Nature</option>
                <option value="Landscape">Landscape</option>
                <option value="Aerial">Aerial</option>
                <option value="Urban">Urban</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Portrait">Portrait</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="Describe your photograph..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tags *</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                  {tag}
                  <button onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} className="hover:text-red-500 rounded-full p-0.5 transition-colors">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const tag = tagInput.trim(); if (tag && !selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]); setTagInput(""); } }} placeholder="Add a tag..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
              <button onClick={() => { const tag = tagInput.trim(); if (tag && !selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]); setTagInput(""); }} className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">Add</button>
            </div>
          </div>

          {detectedResolution && (
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl text-sm">
              <div><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Resolution</span><span className="font-mono font-semibold">{detectedResolution}</span></div>
              <div><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Orientation</span><span className="font-semibold">{detectedOrientation}</span></div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button onClick={() => setShowGuidelines(!showGuidelines)} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Guidelines</button>
            <button onClick={handlePhotoSubmit} disabled={isUploading} className="px-8 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 min-w-[160px]">
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{uploadProgress}%</span>
                </div>
              ) : "Submit for Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}