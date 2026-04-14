"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TiltCard, PageTransition } from "@/components/shared/mart-ui";
import { getProducts } from "@/app/actions/mart-actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const result = await getProducts({ search: search || undefined, category: category || undefined });
    if (result.success) setProducts((result.data || []) as Record<string, unknown>[]);
    else toast.error("Failed to load products");
    setLoading(false);
  }

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      image: product.image,
      vendorId: product.vendorId,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const categories = [...new Set(products.map((p) => p.category as string))].filter(Boolean);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Explore <span className="mart-gradient-text">Products</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Discover amazing products from trusted vendors
            </motion.p>
          </div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={category === "" ? "default" : "outline"}
                size="sm"
                onClick={() => { setCategory(""); loadProducts(); }}
              >
                All
              </Button>
              {categories.slice(0, 5).map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setCategory(cat); loadProducts(); }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-4 space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground">Check back later for new arrivals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => {
                const vendor = product.vendor as Record<string, unknown>;
                const vendorUser = vendor?.user as Record<string, unknown>;
                return (
                  <motion.div
                    key={product.id as string}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TiltCard>
                      <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                        {/* Image */}
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
                            <Badge className="absolute top-3 right-3 bg-red-500">
                              SALE
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{product.name as string}</h3>
                            <p className="text-xs text-muted-foreground">
                              by {vendorUser?.name as string || "Unknown"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.category as string}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              {(product.rating as number)?.toFixed(1) || "0.0"}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              {product.discountPrice ? (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold mart-gradient-text">
                                    {formatCurrency(product.discountPrice as number)}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    {formatCurrency(product.price as number)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold">
                                  {formatCurrency(product.price as number)}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                per {product.unitValue as number}{product.unit as string}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${(product.stock as number) > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                              {(product.stock as number) > 0 ? `${product.stock} available` : "Out of stock"}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Link href={`/shop/${product.id}`} className="flex-1">
                              <Button variant="outline" className="w-full" size="sm">
                                Details
                              </Button>
                            </Link>
                            <Button
                              variant="gradient"
                              className="flex-1"
                              size="sm"
                              disabled={(product.stock as number) <= 0}
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

