import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { AuthProvider } from "@/context/AuthContext";

export default function AuthPage() {
  return (
    <AuthProvider>
      <div className="flex h-screen max-h-screen w-full bg-[#f8f9fa] relative overflow-hidden">
        
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full text-sm font-bold text-gray-800 hover:bg-white transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </Link>

        {/* Left side: Form Container */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10">
          
          {/* Subtle background abstract decorations */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[color:var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <AuthForm />
        </div>

      {/* Right side: Image Container */}
      <div className="hidden md:block w-1/2 relative bg-black">
        <Image
          src="/images/gallery/culture_background.png"
          alt="East African Culture"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
          quality={100}
        />
        {/* Gradients to ensure text readability and create drama */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-16 left-16 right-16 text-white animate-fade-in-up delay-200">
          <div className="mb-6 opacity-80">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.694 20 9.289L20 10.598C20 10.871 20.229 11.1 20.5 11.1L23.5 11.1C23.776 11.1 24 11.324 24 11.6L24 18L14.017 18ZM0 18L0 10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.694 6 9.289L6 10.598C6 10.871 6.229 11.1 6.5 11.1L9.5 11.1C9.776 11.1 10 11.324 10 11.6L10 18L0 18Z"/>
            </svg>
          </div>
          <p className="text-3xl lg:text-4xl font-light italic mb-8 leading-snug tracking-wide">
            "The Wild Archive is our window to the stunning landscapes and vibrant cultures of East Africa. A must-have resource for any creative professional."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[color:var(--color-primary)] overflow-hidden relative">
              <Image 
                src="/images/gallery/swahili_blue.png" 
                alt="Avatar" 
                fill 
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <p className="font-bold tracking-widest uppercase text-sm text-[color:var(--color-primary)]">
                Mwaniki D.
              </p>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mt-1">
                Lead Storyteller
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthProvider>
  );
}
