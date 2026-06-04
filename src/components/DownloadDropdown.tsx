"use client";

import { useState } from "react";

export default function DownloadDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"Original" | "Large" | "Medium" | "Small" | "Custom">("Original");
  
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const handleDownload = () => {
    // In a real app, this would trigger the actual file download logic
    if (selectedSize === "Custom") {
      alert(`Downloading Custom Size: ${customWidth}x${customHeight}`);
    } else {
      alert(`Downloading ${selectedSize} Size`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-[color:var(--color-text)] px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <span>Download</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-2 animate-fade-in-up">
          <div className="flex flex-col space-y-1">
            {["Original", "Large", "Medium", "Small"].map((size) => (
              <label key={size} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input 
                  type="radio" 
                  name="downloadSize" 
                  checked={selectedSize === size}
                  onChange={() => setSelectedSize(size as any)}
                  className="mr-3 accent-[color:var(--color-primary)]" 
                />
                <span className="text-sm font-medium text-[color:var(--color-text)]">{size}</span>
              </label>
            ))}
            
            <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input 
                type="radio" 
                name="downloadSize" 
                checked={selectedSize === "Custom"}
                onChange={() => setSelectedSize("Custom")}
                className="mr-3 accent-[color:var(--color-primary)]" 
              />
              <span className="text-sm font-medium text-[color:var(--color-text)]">Custom</span>
            </label>

            {/* Custom Dimensions Inputs */}
            {selectedSize === "Custom" && (
              <div className="flex items-center space-x-2 p-2 pt-0">
                <input 
                  type="number" 
                  placeholder="W" 
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-1/2 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[color:var(--color-primary)]"
                />
                <span className="text-gray-400">x</span>
                <input 
                  type="number" 
                  placeholder="H" 
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="w-1/2 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[color:var(--color-primary)]"
                />
              </div>
            )}
            
            <div className="pt-2 mt-2 border-t border-gray-100">
              <button 
                onClick={handleDownload}
                className="w-full bg-[color:var(--color-primary)] text-white py-2 rounded font-semibold hover:bg-[#1c5d3f] transition-colors"
              >
                Download Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
