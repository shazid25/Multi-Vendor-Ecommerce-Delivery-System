"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  BarChart3,
  Settings,
  UserPlus,
  Shield,
  DollarSign,
  ChevronLeft,
  Menu,
  LogOut,
  Store,
  ClipboardList,
  Bell,
  Image,
  HelpCircle,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const roleLinks: Record<string, SidebarLink[]> = {
  CUSTOMER: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/dashboard/customer/become-partner", label: "Become a Partner", icon: UserPlus },
  ],
  VENDOR: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/products", label: "Products", icon: Package },
    { href: "/dashboard/vendor/orders", label: "Orders", icon: ClipboardList },
    { href: "/dashboard/vendor/earnings", label: "Earnings", icon: DollarSign },
  ],
  DELIVERY_PARTNER: [
    { href: "/dashboard/delivery", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/delivery/jobs", label: "Assigned Jobs", icon: Truck },
    { href: "/dashboard/delivery/earnings", label: "Earnings", icon: DollarSign },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/requests", label: "Role Requests", icon: UserPlus },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
  ],
  SUPER_ADMIN: [
    { href: "/dashboard/super-admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/super-admin/users", label: "All Users", icon: Users },
    { href: "/dashboard/super-admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/super-admin/requests", label: "Role Requests", icon: Shield },
    { href: "/dashboard/super-admin/banners", label: "Banners", icon: Image },
    { href: "/dashboard/super-admin/faqs", label: "FAQs", icon: HelpCircle },
  ],
};

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const userRole = ((session?.user as Record<string, unknown>)?.role as string) || "CUSTOMER";
  const links = roleLinks[userRole] || roleLinks.CUSTOMER;

  const roleBadge: Record<string, { label: string; color: string }> = {
    CUSTOMER: { label: "Customer", color: "bg-blue-500" },
    VENDOR: { label: "Vendor", color: "bg-purple-500" },
    DELIVERY_PARTNER: { label: "Delivery", color: "bg-emerald-500" },
    ADMIN: { label: "Admin", color: "bg-amber-500" },
    SUPER_ADMIN: { label: "Super Admin", color: "bg-red-500" },
  };

  const badge = roleBadge[userRole] || roleBadge.CUSTOMER;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg mart-gradient-bg flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="font-bold mart-gradient-text text-lg whitespace-nowrap"
            >
              Green Mart
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full mart-gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white",
                  badge.color
                )}
              >
                {badge.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{link.label}</span>}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 rounded-r-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        <div className={cn("px-3 py-1", collapsed && "flex justify-center")}>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut()}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 h-full w-[280px] bg-background border-r border-border shadow-2xl lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:block fixed top-0 left-0 h-full bg-background border-r border-border z-30"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}

