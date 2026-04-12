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
import { getProducts, getBanners, getFAQs } from "@/app/actions/mart-actions";
import { TiltCard } from "@/components/shared/mart-ui";
import { formatCurrency } from "@/lib/utils";
import { BannerCarousel } from "@/components/shared/banner-carousel";
import { FAQSection } from "@/components/shared/faq-section";

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
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [faqs, setFAQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [productsRes, bannersRes, faqsRes] = await Promise.all([
        getProducts(),
        getBanners(),
        getFAQs(),
      ]);

      if (productsRes.success) setProducts((productsRes.data || []).slice(0, 8));
      
      if (bannersRes.success && bannersRes.data?.length) {
        setBanners(bannersRes.data);
      } else {
        // Fallback banners from assets
        setBanners([
          { id: "b1", image: "/assets/banner-1.png", title: "Fresh Groceries Delivered" },
          { id: "b2", image: "/assets/banner-2.png", title: "Quality Produce" },
          { id: "b3", image: "/assets/banner-3.png", title: "Best Prices in Town" },
          { id: "b4", image: "/assets/banner-4.png", title: "Fast Delivery Guarantee" },
        ]);
      }

      if (faqsRes.success && faqsRes.data?.length) {
        setFAQs(faqsRes.data);
      } else {
        // Fallback FAQs
        setFAQs([
          { id: "f1", question: "What is Green Mart?", answer: "Green Mart is a premium grocery delivery service connecting you with fresh produce and essentials." },
          { id: "f2", question: "How fast is delivery?", answer: "We aim for delivery within 60 minutes for local areas." },
          { id: "f3", question: "Is there a delivery fee?", answer: "Delivery is 80 BDT within Dhaka and 120 BDT outside Dhaka." },
        ]);
      }
      
      setLoading(false);
    }
    load();
  }, []);

  const features = [
    { icon: Store, title: "Fresh Grocery Marketplace", desc: "Trusted local vendors providing fresh produce", gradient: "from-green-500 to-emerald-500" },
    { icon: Truck, title: "Smart Delivery", desc: "Real-time tracking and fast delivery partners", gradient: "from-emerald-500 to-lime-500" },
    { icon: Shield, title: "Quality Guarantee", desc: "Hand-picked items with freshness guarantee", gradient: "from-green-600 to-teal-500" },
    { icon: BarChart3, title: "Transparent Pricing", desc: "Best prices with regular discounts and offers", gradient: "from-lime-500 to-green-500" },
  ];

  const stats = [
    { label: "Partner Shops", value: "200+" },
    { label: "Fresh Items", value: "5K+" },
    { label: "Daily Deliveries", value: "1K+" },
    { label: "Happy Shoppers", value: "50K+" },
  ];

  const getDashboardPath = () => {
    if (!session?.user) return "/dashboard";
    const role = (session.user as any).role as string;
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
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Hero Section with Banner Carousel */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium"
            >
              <Zap className="w-4 h-4" />
              <span>Premium Grocery Service</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight"
            >
              Freshness Delivered to <span className="mart-gradient-text">Your Doorstep</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Green Mart brings the freshest produce and household essentials from the best vendors straight to you. Healthy eating made easy and affordable.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              {session?.user ? (
                <Link href={getDashboardPath()}>
                  <Button variant="gradient" size="xl" className="group">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login?mode=register">
                    <Button variant="gradient" size="xl" className="group shadow-xl shadow-primary/25">
                      Start Shopping
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button variant="outline" size="xl">
                      Browse All
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
          
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <BannerCarousel banners={banners} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="text-center p-8 rounded-3xl mart-glass hover:shadow-2xl transition-all duration-300 border border-primary/10"
              >
                <p className="text-4xl font-bold mart-gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 text-center md:text-left gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Fresh <span className="mart-gradient-text">Pick of the Day</span>
              </h2>
              <p className="text-lg text-muted-foreground">Quality groceries selected just for you</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View Shop <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-3xl border bg-card p-4 space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TiltCard>
                    <div className="rounded-3xl border bg-card overflow-hidden hover:shadow-2xl transition-all duration-500 group relative">
                      <div className="relative h-64 bg-muted overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/20">
                            <ShoppingCart className="w-16 h-16 text-primary/20" />
                          </div>
                        )}
                        {Boolean(product.discountPrice) && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-red-500 text-white border-none px-3 py-1 text-xs font-bold rounded-full">
                              SAVE {(100 - (product.discountPrice / product.price) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Store className="w-3.5 h-3.5" />
                            {product.vendor?.shopName || "Green Mart Vendor"}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-current" />
                            {product.rating?.toFixed(1) || "5.0"}
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full">
                            {product.category}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-col">
                            {product.discountPrice ? (
                              <>
                                <span className="text-2xl font-black text-primary">{formatCurrency(product.discountPrice)}</span>
                                <span className="text-sm text-muted-foreground line-through decoration-red-500/50">{formatCurrency(product.price)}</span>
                              </>
                            ) : (
                              <span className="text-2xl font-black">{formatCurrency(product.price)}</span>
                            )}
                          </div>
                          <Link href="/shop">
                            <Button variant="gradient" className="rounded-full w-12 h-12 p-0 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                              <ShoppingCart className="w-5 h-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Premium <span className="mart-gradient-text">Grocery Experience</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've redefined how you shop for your daily essentials
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="p-10 rounded-3xl mart-glass border border-primary/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />

      {/* Roles Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our <span className="mart-gradient-text">Community</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you want to shop, sell, or deliver, Green Mart is for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Customer", desc: "Access the best grocery shops and get fresh produce delivered.", icon: Users, color: "bg-blue-500/10 text-blue-600" },
              { title: "Vendor", desc: "Grow your shop by reaching thousands of customers online.", icon: Store, color: "bg-emerald-500/10 text-emerald-600" },
              { title: "Delivery Partner", desc: "Join our fleet and earn on your own schedule with fast payouts.", icon: Truck, color: "bg-lime-500/10 text-lime-600" },
            ].map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="p-10 rounded-3xl border bg-card hover:shadow-2xl transition-all duration-500 group text-center"
                >
                  <div className={`w-16 h-16 rounded-3xl ${role.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{role.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{role.desc}</p>
                  <Link href="/login?mode=register" className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all">
                    Get Started <ChevronRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center p-16 rounded-[40px] mart-gradient-bg relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Ready to Shop <br /> Fresh & Healthy?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Create your Green Mart account today and get free delivery on your first order.
            </p>
            {!session?.user && (
              <Link href="/login?mode=register">
                <Button size="xl" className="bg-white text-emerald-600 hover:bg-white/90 shadow-2xl px-12 h-16 rounded-full text-xl font-bold group">
                  Join Green Mart Now
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
