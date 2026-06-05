"use client";

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 h-full w-full">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-500 text-sm mb-8">
          A part of this page crashed. Don't worry, you can try reloading this section.
        </p>
        <button
          onClick={() => reset()}
          className="bg-white text-gray-900 border border-gray-200 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
