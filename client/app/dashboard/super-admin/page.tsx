"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, DollarSign, ShoppingCart, Store, Truck, Shield, Trash2, Loader2 } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { getGlobalAnalytics, getAllUsers, updateUserRole, deleteUser } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const ROLES = ["CUSTOMER", "VENDOR", "DELIVERY_PARTNER", "ADMIN", "SUPER_ADMIN"];
const roleBadge: Record<string, { variant: "default" | "info" | "success" | "warning" | "destructive"; label: string }> = {
  CUSTOMER: { variant: "default", label: "Customer" },
  VENDOR: { variant: "info", label: "Vendor" },
  DELIVERY_PARTNER: { variant: "success", label: "Delivery" },
  ADMIN: { variant: "warning", label: "Admin" },
  SUPER_ADMIN: { variant: "destructive", label: "Super Admin" },
};

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [a, u] = await Promise.all([getGlobalAnalytics(), getAllUsers()]);
      if (a.success) setAnalytics(a.data as Record<string, unknown>);
      if (u.success) setUsers((u.data || []) as Record<string, unknown>[]);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(`role-${userId}`);
    const result = await updateUserRole(userId, newRole);
    setActionLoading(null);
    if (result.success) { toast.success("Role updated!"); loadData(); }
    else toast.error(result.error || "Failed");
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setActionLoading(`del-${userId}`);
    const result = await deleteUser(userId);
    setActionLoading(null);
    if (result.success) { toast.success("User deleted"); loadData(); }
    else toast.error(result.error || "Failed");
  };

  if (loading) return <SkeletonDashboard />;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Super Admin — God View 🔮</h1>
            <p className="text-muted-foreground mt-1">Complete platform oversight and control</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/super-admin/banners">
              <Button variant="outline" className="gap-2">
                <Store className="w-4 h-4" /> Banners
              </Button>
            </Link>
            <Link href="/dashboard/super-admin/faqs">
              <Button variant="outline" className="gap-2">
                <Shield className="w-4 h-4" /> FAQs
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Stats */}
        <BentoGrid columns={3}>
          <StatCard title="Total Users" value={(analytics?.totalUsers as number) || 0} icon={<Users className="w-6 h-6" />} gradient="from-blue-500/10 to-cyan-500/10" />
          <StatCard title="Vendors" value={(analytics?.totalVendors as number) || 0} icon={<Store className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
          <StatCard title="Delivery Partners" value={(analytics?.totalDeliveryPartners as number) || 0} icon={<Truck className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
        </BentoGrid>

        <BentoGrid columns={3}>
          <StatCard title="Total Orders" value={(analytics?.totalOrders as number) || 0} icon={<ShoppingCart className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
          <StatCard title="Platform Revenue" value={formatCurrency((analytics?.platformRevenue as number) || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Customer Spend" value={formatCurrency((analytics?.totalCustomerSpend as number) || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-blue-500/10 to-purple-500/10" />
        </BentoGrid>

        {/* Master Users Table */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Master User Table</h2>
            <Badge variant="secondary">{users.length} users</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const role = user.role as string;
                const vendor = user.vendor as Record<string, unknown> | null;
                const dp = user.deliveryPartner as Record<string, unknown> | null;
                const orderCount = (user._count as Record<string, number>)?.orders || 0;
                const badge = roleBadge[role] || roleBadge.CUSTOMER;
                return (
                  <TableRow key={user.id as string}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full mart-gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(user.name as string)?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{user.name as string}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email as string}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {vendor && <span>Shop: {vendor.shopName as string} | ৳{(vendor.totalEarnings as number)?.toFixed(0)}</span>}
                      {dp && <span>Deliveries: {dp.totalDeliveries as number} | ৳{(dp.totalEarnings as number)?.toFixed(0)}</span>}
                      {!vendor && !dp && <span>{orderCount} orders | ৳{(user.totalSpent as number)?.toFixed(0)}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(user.createdAt as string)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <select
                          value={role}
                          onChange={(e) => handleRoleChange(user.id as string, e.target.value)}
                          disabled={actionLoading === `role-${user.id}`}
                          className="text-xs border rounded px-1.5 py-1 bg-background"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(user.id as string, user.name as string)}
                          disabled={actionLoading === `del-${user.id}`}
                          className="text-destructive hover:text-destructive"
                        >
                          {actionLoading === `del-${user.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

