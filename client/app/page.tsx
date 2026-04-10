"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Truck,
  Star,
  Store,
  Users,
  BarChart3,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { getProducts } from "@/app/actions/nexus-actions";
import { TiltCard } from "@/components/shared/nexus-ui";
import { formatCurrency } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HomePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getProducts();
      if (res.success) setProducts((res.data || []).slice(0, 8) as Record<string, unknown>[]);
      setLoadingProducts(false);
    }
    load();
  }, []);

  const features = [
    { icon: Store, title: "Multi-Vendor Marketplace", desc: "Hundreds of trusted vendors in one place", gradient: "from-blue-500 to-cyan-500" },
    { icon: Truck, title: "Smart Delivery", desc: "Vendor-controlled delivery partner assignment", gradient: "from-purple-500 to-pink-500" },
    { icon: Shield, title: "Secure Payments", desc: "Enterprise-grade security with Stripe integration", gradient: "from-emerald-500 to-teal-500" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Track earnings, spending, and platform metrics", gradient: "from-amber-500 to-orange-500" },
  ];

  const stats = [
    { label: "Active Vendors", value: "1,000+" },
    { label: "Products", value: "50K+" },
    { label: "Happy Customers", value: "100K+" },
    { label: "Orders Delivered", value: "500K+" },
  ];

  const roles = [
    { title: "Customer", desc: "Shop from trusted vendors, track orders in real-time", icon: Users, color: "text-blue-500" },
    { title: "Vendor", desc: "Manage products, accept orders, assign delivery partners", icon: Store, color: "text-purple-500" },
    { title: "Delivery Partner", desc: "Accept deliveries, earn per order, track your income", icon: Truck, color: "text-emerald-500" },
  ];

  const getDashboardPath = () => {
    if (!session?.user) return "/dashboard";
    const role = (session.user as Record<string, unknown>).role as string;
    const map: Record<string, string> = {
      CUSTOMER: "/dashboard/customer",
      VENDOR: "/dashboard/vendor",
      DELIVERY_PARTNER: "/dashboard/delivery",
      ADMIN: "/dashboard/admin",
      SUPER_ADMIN: "/dashboard/super-admin",
    };
    return map[role] || "/dashboard/customer";
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
        {/* Animated orbs */}
        <motion.div
          animate={{ y: [0, -40, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-80 h-80 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 40, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={container} initial="hidden" animate="visible" className="text-center">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Built with Next.js 15 & Prisma</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
              Welcome to{" "}
              <span className="nexus-gradient-text">Nexus</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={item} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The ultimate multi-vendor marketplace connecting vendors, customers, and delivery partners in one seamless, beautiful platform.
            </motion.p>

            {/* CTA */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
              {session?.user ? (
                <Link href={getDashboardPath()}>
                  <Button variant="gradient" size="xl" className="group">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button variant="gradient" size="xl" className="group shadow-xl shadow-primary/25">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button variant="outline" size="xl">
                      Browse Products
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="text-center p-6 rounded-2xl nexus-glass hover:shadow-xl transition-all duration-300"
              >
                <p className="text-3xl md:text-4xl font-bold nexus-gradient-text mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Display */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10 text-center md:text-left">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Latest <span className="nexus-gradient-text">Products</span>
              </h2>
              <p className="text-muted-foreground">Shop from our top vendors</p>
            </div>
            <Link href="/shop" className="hidden md:block">
              <Button variant="outline">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-4 space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => {
                const vendor = product.vendor as Record<string, unknown>;
                const vendorUser = vendor?.user as Record<string, unknown>;
                return (
                  <motion.div
                    key={product.id as string}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <TiltCard>
                      <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                        <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image as string}
                              alt={product.name as string}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          {Boolean(product.discountPrice) && (
                            <Badge className="absolute top-3 right-3 bg-red-500">SALE</Badge>
                          )}
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{product.name as string}</h3>
                            <p className="text-xs text-muted-foreground">by {vendorUser?.name as string || "Unknown"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{product.category as string}</Badge>
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              {(product.rating as number)?.toFixed(1) || "0.0"}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              {Boolean(product.discountPrice) ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-primary">{formatCurrency(product.discountPrice as number)}</span>
                                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price as number)}</span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold">{formatCurrency(product.price as number)}</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {(product.stock as number) > 0 ? `${product.stock} left` : "Out"}
                            </span>
                          </div>
                          <Link href="/shop">
                            <Button variant="gradient" className="w-full mt-3" size="sm" disabled={(product.stock as number) <= 0}>
                              <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <Link href="/shop">
              <Button variant="outline">View All Products <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="nexus-gradient-text">Nexus</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a complete e-commerce ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="p-8 rounded-2xl nexus-glass group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              One Platform, <span className="nexus-gradient-text">Multiple Roles</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start as a customer and grow into a vendor or delivery partner
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${role.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{role.desc}</p>
                  <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl nexus-gradient-bg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience Nexus?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of users and experience the future of multi-vendor commerce
            </p>
            {!session?.user && (
              <Link href="/register">
                <Button size="xl" className="bg-white text-gray-900 hover:bg-white/90 shadow-xl group">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
