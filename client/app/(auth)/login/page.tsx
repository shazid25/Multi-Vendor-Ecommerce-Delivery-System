"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Github, 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  Loader2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    setIsRegister(searchParams.get("mode") === "register");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (isRegister && !formData.name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // --- Registration Flow ---
        const { error } = await signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: "/"
        });

        if (error) {
          toast.error(error.message || "Registration failed. Please check your details.");
        } else {
          toast.success("Welcome aboard! Your account is ready.");
          router.push("/");
          router.refresh();
        }
      } else {
        // --- Login Flow ---
        const { error } = await signIn.email({
          email: formData.email,
          password: formData.password,
          callbackURL: "/"
        });

        if (error) {
          // Check for "User not found" to suggest registration
          if (error.code === "USER_NOT_FOUND" || error.status === 404) {
             toast.error("Account not found. Redirecting to signup...");
             setIsRegister(true);
          } else {
            toast.error(error.message || "Invalid email or password");
          }
        } else {
          toast.success("Welcome back!");
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "github" | "google") => {
    try {
      setLoading(true);
      await signIn.social({
        provider,
        callbackURL: "/"
      });
    } catch (err) {
      toast.error(`Failed to connect with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative bg-[#020617]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-12 h-12 rounded-2xl mart-gradient-bg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black mart-gradient-text tracking-tighter">GREEN MART</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {isRegister ? "Start Your Journey" : "Welcome Back"}
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              {isRegister ? "Create a premium account in seconds" : "Enter your credentials to continue"}
            </p>
          </div>

          {/* Social Auth Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => handleSocialAuth("github")}
              className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all hover:border-white/20"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => handleSocialAuth("google")}
              className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all hover:border-white/20"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-[#0b1224] px-4 text-gray-500 rounded-full py-1">or use email</span>
            </div>
          </div>

          <form onSubmit={handleCredentialsAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-gray-300 font-medium">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-11 h-12 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all text-white placeholder:text-gray-600"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all text-white placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
                {!isRegister && (
                  <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-12 h-12 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all text-white placeholder:text-gray-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-transform"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isRegister ? "Create Premium Account" : "Sign In to Green Mart"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto font-medium"
            >
              {isRegister ? (
                <>Already have an account? <span className="text-blue-400 font-bold">Sign In</span></>
              ) : (
                <>New to GREEN MART? <span className="text-blue-400 font-bold">Create Account</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

