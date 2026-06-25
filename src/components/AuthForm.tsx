"use client";

import { useState } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["italic", "normal"] });

export default function AuthForm() {
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  // Password strength logic
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength === 1) return "bg-red-400";
    if (strength === 2) return "bg-yellow-400";
    if (strength === 3) return "bg-blue-400";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "Too weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ email, password });
        toast.success("Welcome back!", { description: "You have successfully logged in." });
      } else {
        await register({ firstName, lastName, phone, email, password });
        toast.success("Welcome to Lens.ke!", { description: "Your contributor account has been created." });
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || err.message || "An authentication error occurred. Please try again.";
      toast.error(isLogin ? "Login Failed" : "Registration Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 animate-fade-in-up">
      {/* Container - using glassmorphism but slightly more opaque for readability against light bg */}
      <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl md:text-3xl font-bold text-[color:var(--color-text)] mb-2 ${playfair.className}`}>
            {isLogin ? "Welcome Back" : "Join the Archive"}
          </h2>
          <p className="text-gray-600 text-sm font-medium">
            {isLogin ? "Enter your details to access your account." : "Create an account to curate your African visual journey."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Animated height container for signup fields */}
          <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${isLogin ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"}`}>
            {!isLogin && (
              <>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-4 py-3 bg-white/60 border border-black/5 rounded-2xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/40 focus:bg-white transition-all duration-300"
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-4 py-3 bg-white/60 border border-black/5 rounded-2xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/40 focus:bg-white transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 bg-white/60 border border-black/5 rounded-2xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/40 focus:bg-white transition-all duration-300"
                  />
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-white/60 border border-black/5 rounded-2xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/40 focus:bg-white transition-all duration-300"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 bg-white/60 border border-black/5 rounded-2xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/40 focus:bg-white transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[color:var(--color-primary)] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {!isLogin && password.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 px-1 pt-1">
              <div className="flex gap-1.5 mb-1.5 h-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-full flex-1 rounded-full transition-colors duration-500 ease-out ${
                      strength >= level ? getStrengthColor() : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-bold text-right uppercase tracking-wider transition-colors duration-300 ${
                strength === 0 ? "text-gray-400" :
                strength === 1 ? "text-red-500" :
                strength === 2 ? "text-yellow-600" :
                strength === 3 ? "text-blue-500" :
                "text-green-600"
              }`}>
                {getStrengthLabel()}
              </p>
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end mt-2 animate-fade-in-up">
              <Link href="#" className="text-sm text-[color:var(--color-primary)] hover:underline font-semibold transition-all">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-[color:var(--color-primary)] text-white font-bold rounded-2xl hover:bg-[#1a553a] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? "Log In" : "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-transparent px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold backdrop-blur-sm">
            Or continue with
          </div>
        </div>

        {/* Social Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 bg-white/70 hover:bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 bg-white/70 hover:bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18px" height="18px">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-[color:var(--color-primary)] font-bold hover:underline focus:outline-none transition-all"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
