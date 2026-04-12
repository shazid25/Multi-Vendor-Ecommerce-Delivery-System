"use client";

import React, { useEffect, useState } from "react";
import { Users, DollarSign, ShoppingCart, Truck, Loader2, ArrowRight } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { getGlobalAnalytics } from "@/app/actions/mart-actions";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getGlobalAnalytics();
      if (res.success) setAnalytics(res.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform performance and system status</p>
        </div>

        <BentoGrid columns={4}>
          <StatCard title="Total Users" value={analytics?.totalUsers || 0} icon={<Users className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Total Orders" value={analytics?.totalOrders || 0} icon={<ShoppingCart className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
          <StatCard title="Vendors" value={analytics?.totalVendors || 0} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Delivery Partners" value={analytics?.totalDeliveryPartners || 0} icon={<Truck className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
        </BentoGrid>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/dashboard/admin/requests">
                <Button variant="outline" className="w-full justify-between group">
                  Review Role Requests <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full justify-between group">
                  Manage Users <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-white/10">
                <span className="text-muted-foreground">Total Customer Spending</span>
                <span className="text-xl font-bold">{formatCurrency(analytics?.totalCustomerSpend || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue metrics are calculated from completed orders across all vendors.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
