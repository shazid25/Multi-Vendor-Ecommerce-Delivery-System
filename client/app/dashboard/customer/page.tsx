"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Package, UserPlus, Clock, ChevronRight } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, AnimatedTimeline, PageTransition } from "@/components/shared/nexus-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { getCustomerStats, getOrders } from "@/app/actions/nexus-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          getCustomerStats(),
          getOrders(),
        ]);
        if (statsRes.success) setStats(statsRes.data as Record<string, unknown>);
        if (ordersRes.success) setOrders((ordersRes.data || []) as Record<string, unknown>[]);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <SkeletonDashboard />;

  const user = stats?.user as Record<string, unknown> | undefined;
  const totalOrders = (user?._count as Record<string, number>)?.orders || 0;
  const activeOrders = (stats?.activeOrders as number) || 0;
  const totalSpent = (user?.totalSpent as number) || 0;
  const pendingRequest = stats?.pendingRequest as Record<string, unknown> | null;

  const statusColors: Record<string, string> = {
    PENDING: "warning",
    ACCEPTED: "info",
    ASSIGNED: "info",
    IN_TRANSIT: "default",
    DELIVERED: "success",
    CANCELLED: "destructive",
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your shopping overview</p>
        </div>

        {/* Stats Grid */}
        <BentoGrid columns={4}>
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart className="w-6 h-6" />}
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          <StatCard
            title="Active Orders"
            value={activeOrders}
            icon={<Package className="w-6 h-6" />}
            gradient="from-purple-500/10 to-pink-500/10"
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(totalSpent)}
            icon={<DollarSign className="w-6 h-6" />}
            gradient="from-emerald-500/10 to-teal-500/10"
          />
          <StatCard
            title="Partner Status"
            value={pendingRequest ? "Pending" : "Customer"}
            icon={<UserPlus className="w-6 h-6" />}
            gradient="from-amber-500/10 to-orange-500/10"
          />
        </BentoGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/dashboard/customer/orders">
                <Button variant="ghost" size="sm">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">No orders yet</p>
                <Link href="/shop">
                  <Button variant="gradient" size="sm" className="mt-3">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">#{(order.orderNumber as string)?.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt as string)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.totalAmount as number)}</p>
                      <Badge variant={statusColors[order.status as string] as "warning" | "info" | "success" | "destructive" | "default"}>
                        {order.status as string}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Order Timeline */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-6">Order Tracking</h2>
            {orders.length > 0 ? (
              <AnimatedTimeline
                items={[
                  { status: "Order Placed", description: "Your order has been placed successfully", timestamp: formatDate(orders[0]?.createdAt as string || new Date().toISOString()), completed: true },
                  { status: "Accepted", description: "Vendor has accepted your order", timestamp: "", completed: ["ACCEPTED", "ASSIGNED", "IN_TRANSIT", "DELIVERED"].includes(orders[0]?.status as string || "") },
                  { status: "Assigned", description: "Delivery partner has been assigned", timestamp: "", completed: ["ASSIGNED", "IN_TRANSIT", "DELIVERED"].includes(orders[0]?.status as string || "") },
                  { status: "In Transit", description: "Your order is on the way", timestamp: "", completed: ["IN_TRANSIT", "DELIVERED"].includes(orders[0]?.status as string || "") },
                  { status: "Delivered", description: "Order delivered successfully!", timestamp: "", completed: orders[0]?.status === "DELIVERED" },
                ]}
              />
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">No active orders to track</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Become a Partner CTA */}
        {!pendingRequest && (
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Want to earn with Nexus?</h2>
                <p className="text-muted-foreground text-sm mt-1">Apply to become a Vendor or Delivery Partner</p>
              </div>
              <Link href="/dashboard/customer/become-partner">
                <Button variant="gradient">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}
