"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic", "normal"] });

const NAV_ITEMS = [
    { label: "Overview", id: "overview", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { label: "My Photos", id: "photos", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { label: "Upload", id: "upload", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> },
    { label: "Earnings", id: "earnings", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Settings", id: "settings", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface ContributorDashboardLayoutProps {
    children: ReactNode;
    activeNav: string;
    setActiveNav: (navId: string) => void;
}

export default function ContributorDashboardLayout({ children, activeNav, setActiveNav }: ContributorDashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <>
            {/* Sidebar */}
            <aside className={`flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200/80`}>
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

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveNav(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeNav === item.id
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
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

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </>
    );
}