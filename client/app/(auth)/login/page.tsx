// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Mail, 
//   Lock, 
//   User as UserIcon, 
//   Eye,
//   EyeOff, 
//   ShoppingBag, 
//   Loader2,
//   ArrowRight
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { signIn, signUp } from "@/lib/auth-client";
// import { toast } from "sonner";

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
  
//   // States
//   const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // Form fields
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: ""
//   });

//   useEffect(() => {
//     setIsRegister(searchParams.get("mode") === "register");
//   }, [searchParams]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
//   };

//   const handleCredentialsAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.email || !formData.password || (isRegister && !formData.name)) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     // Gmail-only restriction as per user request
//     if (!formData.email.endsWith("@gmail.com")) {
//       toast.error("Only Gmail addresses are allowed for manual login.");
//       return;
//     }

//     setLoading(true);
//     try {
//       if (isRegister) {
//         // --- Registration Flow ---
//         const { error } = await signUp.email({
//           email: formData.email,
//           password: formData.password,
//           name: formData.name,
//           callbackURL: "/"
//         });

//         if (error) {
//           toast.error(error.message || "Registration failed. Please check your details.");
//         } else {
//           toast.success("Welcome aboard! Your account is ready.");
//           router.push("/");
//           router.refresh();
//         }
//       } else {
//         // --- Login Flow ---
//         const { error } = await signIn.email({
//           email: formData.email,
//           password: formData.password,
//           callbackURL: "/"
//         });

//         if (error) {
//           // Check for "User not found" to suggest registration
//           if (error.code === "USER_NOT_FOUND" || error.status === 404) {
//              toast.error("Account not found. Redirecting to signup...");
//              setIsRegister(true);
//           } else {
//             toast.error(error.message || "Invalid email or password");
//           }
//         } else {
//           toast.success("Welcome back!");
//           router.push("/");
//           router.refresh();
//         }
//       }
//     } catch (err: any) {
//       console.error("Auth Error:", err);
//       toast.error("An unexpected error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-20 relative bg-background">
//       {/* Dynamic Background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
//         <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full max-w-md relative z-10"
//       >
//         <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-2xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)]">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
//               <div className="w-12 h-12 rounded-2xl mart-gradient-bg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
//                 <ShoppingBag className="w-6 h-6 text-white" />
//               </div>
//               <span className="text-3xl font-black mart-gradient-text tracking-tighter">GREEN MART</span>
//             </Link>
//             <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
//               {isRegister ? "Start Your Journey" : "Welcome Back"}
//             </h1>
//             <p className="text-muted-foreground mt-2 font-medium">
//               {isRegister ? "Create a premium account in seconds" : "Enter your credentials to continue"}
//             </p>
//           </div>

//           <form onSubmit={handleCredentialsAuth} className="space-y-5">
//             <AnimatePresence mode="wait">
//               {isRegister && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   className="space-y-2"
//                 >
//                   <Label htmlFor="name" className="text-foreground/80 font-medium">Full Name</Label>
//                   <div className="relative">
//                     <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                     <Input
//                       id="name"
//                       placeholder="Enter your name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="pl-11 h-12 bg-background border-border focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
//                       required={isRegister}
//                     />
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-foreground/80 font-medium">Email Address</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="name@company.com"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="pl-11 h-12 bg-background border-border focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
//                 {!isRegister && (
//                   <Link href="#" className="text-xs text-primary hover:underline transition-colors font-semibold">
//                     Forgot password?
//                   </Link>
//                 )}
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="pl-11 pr-12 h-12 bg-background border-border focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               variant="gradient"
//               className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 active:scale-95 transition-transform"
//               disabled={loading}
//             >
//               {loading ? (
//                 <Loader2 className="w-6 h-6 animate-spin" />
//               ) : (
//                 <>
//                   {isRegister ? "Create Premium Account" : "Sign In to Green Mart"}
//                   <ArrowRight className="w-5 h-5 ml-2" />
//                 </>
//               )}
//             </Button>
//           </form>

//           <div className="mt-8 text-center">
//             <button
//               onClick={() => setIsRegister(!isRegister)}
//               className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto font-medium"
//             >
//               {isRegister ? (
//                 <>Already have an account? <span className="text-primary font-bold">Sign In</span></>
//               ) : (
//                 <>New to GREEN MART? <span className="text-primary font-bold">Create Account</span></>
//               )}
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }




"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
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

function LoginContent() {
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

    if (!formData.email.endsWith("@gmail.com")) {
      toast.error("Only Gmail addresses are allowed for manual login.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
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
        const { error } = await signIn.email({
          email: formData.email,
          password: formData.password,
          callbackURL: "/"
        });

        if (error) {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md relative z-10"
    >
      <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-2xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl mart-gradient-bg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black mart-gradient-text tracking-tighter">GREEN MART</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {isRegister ? "Start Your Journey" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {isRegister ? "Create a premium account in seconds" : "Enter your credentials to continue"}
          </p>
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
                <Label htmlFor="name" className="text-foreground/80 font-medium">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-background border-border focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                    required={isRegister}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80 font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-11 h-12 bg-background border-border focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
              {!isRegister && (
                <Link href="#" className="text-xs text-primary hover:underline transition-colors font-semibold">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-11 pr-12 h-12 bg-background border-border focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 active:scale-95 transition-transform"
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
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto font-medium"
          >
            {isRegister ? (
              <>Already have an account? <span className="text-primary font-bold">Sign In</span></>
            ) : (
              <>New to GREEN MART? <span className="text-primary font-bold">Create Account</span></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-primary" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}