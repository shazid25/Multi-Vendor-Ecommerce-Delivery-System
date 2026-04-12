"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, Truck, Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { getGlobalAnalytics } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminAnalytics() {
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
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time insights across the entire system</p>
        </div>

        <BentoGrid columns={4}>
          <StatCard title="Total Revenue" value={formatCurrency(analytics?.totalCustomerSpend || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Orders" value={analytics?.totalOrders || 0} icon={<ShoppingCart className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Platform Users" value={analytics?.totalUsers || 0} icon={<Users className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
          <StatCard title="Vendors" value={analytics?.totalVendors || 0} icon={<TrendingUp className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
        </BentoGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Recent Orders
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.recentOrders?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">#{order.orderNumber}</TableCell>
                    <TableCell className="text-xs">{order.user.name}</TableCell>
                    <TableCell className="font-bold text-xs">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "DELIVERED" ? "success" : "secondary"} className="text-[10px] px-1 h-4">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-6">Partner Distribution</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendors</span>
                  <span className="font-bold">{analytics?.totalVendors}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(analytics?.totalVendors / analytics?.totalUsers) * 100}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Partners</span>
                  <span className="font-bold">{analytics?.totalDeliveryPartners}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(analytics?.totalDeliveryPartners / analytics?.totalUsers) * 100}%` }} 
                  />
                </div>
              </div>
              <div className="pt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Partner growth is up <span className="text-emerald-500 font-bold">12%</span> compared to last month. 
                  Consider running a promotion for new vendors in the Dhaka zone.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
