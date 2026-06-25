"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

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

interface PhotoDetailDrawerProps {
    photo: Photo | null;
    onClose: () => void;
    onSave: (updatedPhoto: Photo) => void;
    onDelete: (photoId: string) => void;
}

export default function PhotoDetailDrawer({ photo, onClose, onSave, onDelete }: PhotoDetailDrawerProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (photo) {
            setTitle(photo.alt);
            setDescription(photo.description);
            setLocation(photo.location);
            setTags([...photo.tags]);
            setTagInput("");
            setShowDeleteConfirm(false);
        }
    }, [photo]);

    const handleSave = () => {
        if (!photo) return;
        const isResubmitting = photo.status === 'rejected';
        onSave({
            ...photo,
            alt: title,
            description,
            location,
            tags,
            status: isResubmitting ? 'pending' : photo.status,
        });
    };

    const handleDelete = () => {
        if (!photo) return;
        onDelete(photo.id);
    };

    const handleAddTag = () => {
        const cleanTag = tagInput.trim();
        if (cleanTag && !tags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
            setTags([...tags, cleanTag]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${photo ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />
            <div
                className={`fixed inset-y-0 right-0 sm:right-0 bottom-0 sm:bottom-auto w-full sm:w-[600px] bg-white rounded-t-3xl sm:rounded-t-none sm:rounded-tl-3xl overflow-hidden shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${photo ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
                style={{ height: "100dvh" }}
            >
                {photo && (
                    <>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h2 className="font-bold text-[color:var(--color-text)]">Photo Details</h2>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close photo details">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="relative w-full aspect-video bg-gray-950">
                                <Image src={photo.src} alt={photo.alt} fill className="object-contain" sizes="600px" />
                                <div className="absolute top-4 right-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm ${photo.status === "active" ? "bg-green-900/50 text-green-300" : photo.status === "rejected" ? "bg-red-900/50 text-red-300" : "bg-yellow-900/50 text-yellow-300"}`}>
                                        {photo.status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50/50">
                                <div className="px-6 py-4 text-center"><p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-text)]`}>{photo.downloads}</p><p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Downloads</p></div>
                                <div className="px-6 py-4 text-center border-l border-gray-100"><p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-text)]`}>{(photo.views / 1000).toFixed(1)}k</p><p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Views</p></div>
                                <div className="px-6 py-4 text-center border-l border-gray-100"><p className={`text-2xl font-bold ${playfair.className} text-[color:var(--color-primary)]`}>KES {photo.earnings}</p><p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Earned</p></div>
                            </div>
                            <div className="p-6 space-y-6">
                                {photo.status === "rejected" && photo.rejectionReason && (
                                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-500 mt-0.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div><p className="font-bold text-red-700 text-sm">Reviewer Note</p><p className="text-red-600 text-xs mt-1 leading-relaxed">{photo.rejectionReason}</p></div>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-4">
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Camera</p><p className="text-sm font-semibold text-[color:var(--color-text)] mt-1">{photo.camera}</p></div>
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</p><p className="text-sm font-semibold text-[color:var(--color-text)] mt-1">{photo.category}</p></div>
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</p><p className="text-sm font-semibold text-[color:var(--color-text)] mt-1">{photo.uploadedAt}</p></div>
                                </div>
                                <hr className="border-gray-100" />
                                <div className="space-y-4">
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-xl font-bold ${playfair.className}`} /></div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm resize-none" /></div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" /></div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">{tag}<button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 hover:bg-gray-200 rounded-full p-0.5 transition-colors"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></span>))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} placeholder="Add a tag..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
                                            <button onClick={handleAddTag} className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">Add</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-100">
                                    {showDeleteConfirm ? (
                                        <div className="flex flex-col gap-3 animate-fade-in">
                                            <p className="text-sm font-bold text-gray-700 text-center">Are you sure? This cannot be undone.</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                                                <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm hover:shadow-md">Yes, Delete</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm">Delete</button>
                                            <button onClick={handleSave} className="flex-1 py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5">Save Changes</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}