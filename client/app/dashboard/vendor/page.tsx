"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, ShoppingCart, TrendingUp, Truck, Plus, Loader2, Check } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/nexus-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import {
  getVendorStats,
  getVendorOrders,
  getProducts,
  createProduct,
  acceptOrder,
  getAvailableDeliveryPartners,
  assignDeliveryPartner,
} from "@/app/actions/nexus-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export default function VendorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [vendorOrders, setVendorOrders] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [partners, setPartners] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Product form
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", stock: "", category: "", image: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, o, p, dp] = await Promise.all([
        getVendorStats(),
        getVendorOrders(),
        getProducts(),
        getAvailableDeliveryPartners(),
      ]);
      if (s.success) setStats(s.data as Record<string, unknown>);
      if (o.success) setVendorOrders((o.data || []) as Record<string, unknown>[]);
      if (p.success) setProducts((p.data || []) as Record<string, unknown>[]);
      if (dp.success) setPartners((dp.data || []) as Record<string, unknown>[]);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("create-product");
    const result = await createProduct({
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category: productForm.category,
      image: productForm.image || undefined,
    });
    setActionLoading(null);
    if (result.success) {
      toast.success("Product created!");
      setShowAddProduct(false);
      setProductForm({ name: "", description: "", price: "", stock: "", category: "", image: "" });
      loadData();
    } else {
      toast.error(result.error || "Failed to create product");
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    const result = await acceptOrder(orderId);
    setActionLoading(null);
    if (result.success) {
      toast.success("Order accepted!");
      loadData();
    } else {
      toast.error(result.error || "Failed to accept");
    }
  };

  const handleAssignPartner = async (orderId: string, partnerId: string) => {
    setActionLoading(`assign-${orderId}`);
    const result = await assignDeliveryPartner(orderId, partnerId);
    setActionLoading(null);
    if (result.success) {
      toast.success("Delivery partner assigned!");
      loadData();
    } else {
      toast.error(result.error || "Failed to assign");
    }
  };

  if (loading) return <SkeletonDashboard />;

  const countData = stats?._count as Record<string, number> | undefined;
  const totalProducts = countData?.products || 0;
  const totalOrders = countData?.orders || 0;
  const balance = (stats?.balance as number) || 0;
  const totalEarnings = (stats?.totalEarnings as number) || 0;
  const pendingOrders = (stats?.pendingOrders as number) || 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground mt-1">{(stats?.shopName as string) || "My Shop"}</p>
          </div>
          <Button variant="gradient" onClick={() => setShowAddProduct(!showAddProduct)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Stats */}
        <BentoGrid columns={4}>
          <StatCard title="Products" value={totalProducts} icon={<Package className="w-6 h-6" />} gradient="from-blue-500/10 to-cyan-500/10" />
          <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingCart className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
          <StatCard title="Balance" value={formatCurrency(balance)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Earnings" value={formatCurrency(totalEarnings)} icon={<TrendingUp className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
        </BentoGrid>

        {/* Add Product Form */}
        {showAddProduct && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">New Product</h2>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (BDT) *</Label>
                    <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock *</Label>
                    <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" disabled={actionLoading === "create-product"}>
                    {actionLoading === "create-product" ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Product"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Orders Table */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Orders ({pendingOrders} pending)</h2>
          {vendorOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorOrders.slice(0, 10).map((vo) => {
                  const order = vo.order as Record<string, unknown>;
                  const user = order?.user as Record<string, unknown>;
                  const status = (order?.status || vo.status) as string;
                  const orderId = order?.id as string;
                  return (
                    <TableRow key={vo.id as string}>
                      <TableCell className="font-medium">#{(order?.orderNumber as string || "").slice(-8)}</TableCell>
                      <TableCell>{user?.name as string}</TableCell>
                      <TableCell>{formatCurrency(vo.subtotal as number)}</TableCell>
                      <TableCell>
                        <Badge variant={status === "DELIVERED" ? "success" : status === "PENDING" ? "warning" : "info"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {status === "PENDING" && (
                            <Button size="sm" variant="success" onClick={() => handleAcceptOrder(orderId)} disabled={actionLoading === orderId}>
                              {actionLoading === orderId ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" /> Accept</>}
                            </Button>
                          )}
                          {status === "ACCEPTED" && partners.length > 0 && (
                            <select
                              className="text-xs border rounded px-2 py-1 bg-background"
                              onChange={(e) => {
                                if (e.target.value) handleAssignPartner(orderId, e.target.value);
                              }}
                              defaultValue=""
                              disabled={actionLoading === `assign-${orderId}`}
                            >
                              <option value="">Assign Delivery</option>
                              {partners.map((p) => (
                                <option key={p.id as string} value={p.id as string}>
                                  {(p.user as Record<string, string>)?.name} ({p.vehicleType as string})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  );
}
