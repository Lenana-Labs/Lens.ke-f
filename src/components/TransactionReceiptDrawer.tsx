"use client";

import Image from "next/image";
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

interface TransactionReceiptDrawerProps {
    transaction: Transaction | null;
    photos: Photo[];
    onClose: () => void;
}

export default function TransactionReceiptDrawer({ transaction, photos, onClose }: TransactionReceiptDrawerProps) {
    if (!transaction) return null;

    const photo = photos.find(p => p.id === transaction.photoId) || photos[0];

    let badge = {
        bg: "bg-green-50 border-green-150 text-green-600",
        dot: "bg-green-500",
        label: "Completed",
        desc: "This transaction has cleared and is added to your available portfolio balance. It will be settled in the next payout cycle."
    };
    if (transaction.status === "pending") {
        badge = { bg: "bg-amber-50 border-amber-150 text-amber-600", dot: "bg-amber-500", label: "Pending Clearance", desc: "This transaction is currently clearing and is held in escrow. Funds will clear within 24 hours." };
    } else if (transaction.status === "failed") {
        badge = { bg: "bg-red-50 border-red-150 text-red-600", dot: "bg-red-500", label: "Failed Payment", desc: "The buyer's payment was declined by the cardholder bank. No download license was issued." };
    } else if (transaction.status === "reversed") {
        badge = { bg: "bg-slate-50 border-slate-200 text-slate-600", dot: "bg-slate-500", label: "Reversed / Refunded", desc: "This transaction has been refunded. The license has been revoked and the amount deducted from your earnings balance." };
    }

    return (
        <>
            <div
                className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${transaction ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />
            <div
                className={`fixed inset-y-0 right-0 sm:right-0 bottom-0 sm:bottom-auto w-full sm:w-[600px] bg-white rounded-t-3xl sm:rounded-t-none sm:rounded-tl-3xl overflow-hidden shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${transaction ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
                style={{ height: "100dvh" }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <div><h2 className="font-bold text-[color:var(--color-text)]">Transaction Receipt</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transaction Audit Slip</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full font-sans tracking-wider uppercase">KES</span>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close receipt details">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
                    <div className="relative w-full aspect-video bg-gray-950 rounded-2xl overflow-hidden shadow-md border border-gray-850">
                        <Image src={photo ? photo.src : "/placeholder.png"} alt={transaction.photoTitle} fill className="object-contain" sizes="600px" />
                    </div>
                    <div className={`p-5 rounded-2xl border ${badge.bg} space-y-2`}>
                        <div className="flex items-center gap-2 font-bold text-sm"><span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>{badge.label}</div>
                        <p className="text-xs leading-relaxed opacity-90">{badge.desc}</p>
                        {transaction.statusDetails && (<p className="text-xs font-mono font-semibold pt-1 border-t border-black/5 opacity-85">Details: {transaction.statusDetails}</p>)}
                    </div>
                    <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-5 space-y-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">Receipt Metadata</span>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                            <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference Code</span><p className="font-mono font-semibold text-[color:var(--color-text)] mt-0.5">{transaction.id.toUpperCase()}</p></div>
                            <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date of Sale</span><p className="font-semibold text-[color:var(--color-text)] mt-0.5">{transaction.date}</p></div>
                            <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Photograph Title</span><p className={`font-semibold text-[color:var(--color-text)] mt-0.5 ${playfair.className} text-base`}>{transaction.photoTitle}</p></div>
                            <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Type</span><p className="font-semibold text-[color:var(--color-text)] mt-0.5">{transaction.licenseType} License</p></div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">Earnings Breakdown</span>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500"><span>Gross License Price</span><span className="font-medium text-[color:var(--color-text)]">KES {Math.round(transaction.amount / 0.8)}</span></div>
                            <div className="flex justify-between text-gray-500"><span>Platform Commission (20%)</span><span className="text-red-500 font-medium">-KES {Math.round(transaction.amount / 0.8) - transaction.amount}</span></div>
                            <hr className="border-gray-100 my-2" />
                            <div className="flex justify-between items-center text-base font-bold text-[color:var(--color-text)]"><span>Net Contributor Earnings</span><span className={`text-xl ${playfair.className} text-[color:var(--color-primary)]`}>KES {transaction.amount}</span></div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={() => {
                            toast.success("Receipt PDF Generated", {
                                description: `Invoice PDF for transaction ${transaction.id.toUpperCase()} has been saved.`
                            });
                        }}
                        className="w-full py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download PDF Receipt
                    </button>
                </div>
            </div>
        </>
    );
}