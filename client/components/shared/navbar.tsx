"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

export function Navbar() {
  const { data: session } = useSession();
  const { state } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
  ];

  const getDashboardPath = () => {
    if (!session?.user) return "/dashboard";
    const role = (session.user as Record<string, unknown>).role as string;
    const roleMap: Record<string, string> = {
      CUSTOMER: "/dashboard/customer",
      VENDOR: "/dashboard/vendor",
      DELIVERY_PARTNER: "/dashboard/delivery",
      ADMIN: "/dashboard/admin",
      SUPER_ADMIN: "/dashboard/super-admin",
    };
    return roleMap[role] || "/dashboard/customer";
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "mart-glass-strong shadow-lg"
          : "bg-background/80 backdrop-blur-md border-b border-border/50"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-9 h-9 rounded-lg mart-gradient-bg flex items-center justify-center shadow-lg"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold mart-gradient-text">
              Green Mart
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/checkout">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {state.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {state.totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <ThemeToggle />

            {session?.user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full mart-gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover p-2 shadow-xl z-50"
                      >
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <Link
                          href={getDashboardPath()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/login?mode=register">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-background"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-2 rounded-lg text-sm font-medium",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!session?.user && (
                <div className="pt-2 space-y-2 border-t border-border mt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/login?mode=register">
                    <Button variant="gradient" className="w-full" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

