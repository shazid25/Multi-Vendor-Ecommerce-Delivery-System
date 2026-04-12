"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, Store, ShieldCheck, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { getProducts } from "@/app/actions/mart-actions";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      const res = await getProducts();
      if (res.success) {
        const found = res.data?.find((p: any) => p.id === id);
        setProduct(found);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <GlassCard className="aspect-square overflow-hidden" hover={false}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </GlassCard>
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="px-3 py-1">{product.category}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-lg">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">(24 Reviews)</span>
                </div>
              </div>

              <div className="space-y-2">
                {product.discountPrice ? (
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold mart-gradient-text">{formatCurrency(product.discountPrice)}</span>
                    <span className="text-xl text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold mart-gradient-text">{formatCurrency(product.price)}</span>
                )}
                <p className="text-emerald-500 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> In Stock: {product.stock} units available
                </p>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-white/5">
                  <Store className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Sold by</p>
                    <p className="font-semibold">{product.vendor.shopName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-white/5">
                  <Truck className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Delivery</p>
                    <p className="font-semibold">Fast Shipping</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  size="lg" 
                  variant="gradient" 
                  className="flex-1 text-lg h-14" 
                  disabled={product.stock <= 0}
                  onClick={() => {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.discountPrice || product.price,
                      quantity: 1,
                      image: product.image,
                      vendorId: product.vendorId
                    });
                    toast.success("Added to cart");
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
