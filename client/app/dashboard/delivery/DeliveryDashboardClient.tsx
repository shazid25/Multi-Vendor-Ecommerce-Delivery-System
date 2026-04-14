"use client";

import React, { useEffect, useState } from "react";
import { Truck, DollarSign, Package, Clock, CheckCircle, Play, Loader2 } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { getDeliveryJobs, getDeliveryPartnerStats, markAsDelivered, startTransit } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DeliveryDashboardClient() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [s, j] = await Promise.all([getDeliveryPartnerStats(), getDeliveryJobs()]);
      if (s.success) setStats(s.data as Record<string, unknown>);
      if (j.success) setJobs((j.data || []) as Record<string, unknown>[]);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const handleStartTransit = async (orderId: string) => {
    setActionLoading(orderId);
    const result = await startTransit(orderId);
    setActionLoading(null);
    if (result.success) { toast.success("Delivery started!"); loadData(); }
    else toast.error(result.error || "Failed");
  };

  const handleMarkDelivered = async (orderId: string) => {
    setActionLoading(`deliver-${orderId}`);
    const result = await markAsDelivered(orderId);
    setActionLoading(null);
    if (result.success) { toast.success("Order marked as delivered! Earnings updated."); loadData(); }
    else toast.error(result.error || "Failed");
  };

  if (loading) return <SkeletonDashboard />;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your deliveries and track earnings</p>
        </div>

        {/* Stats */}
        <BentoGrid columns={4}>
          <StatCard title="Total Deliveries" value={(stats?.totalDeliveries as number) || 0} icon={<Truck className="w-6 h-6" />} gradient="from-blue-500/10 to-cyan-500/10" />
          <StatCard title="Today's Earnings" value={formatCurrency((stats?.todayEarnings as number) || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Month Earnings" value={formatCurrency((stats?.monthEarnings as number) || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
          <StatCard title="Total Earnings" value={formatCurrency((stats?.totalEarnings as number) || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
        </BentoGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings breakdown */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Earnings Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Today</span>
                <span className="font-semibold text-emerald-500">{formatCurrency((stats?.todayEarnings as number) || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-semibold text-blue-500">{formatCurrency((stats?.monthEarnings as number) || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">All Time</span>
                <span className="font-semibold text-purple-500">{formatCurrency((stats?.totalEarnings as number) || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Today&apos;s Deliveries</span>
                <span className="font-semibold">{(stats?.todayDeliveries as number) || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Rating</span>
                <span className="font-semibold text-amber-500">⭐ {(stats?.rating as number)?.toFixed(1) || "5.0"}</span>
              </div>
            </div>
          </GlassCard>

          {/* Jobs Table */}
          <GlassCard className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Assigned Jobs</h2>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">No assigned deliveries yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Net Earning</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    const user = job.user as Record<string, string>;
                    const status = job.status as string;
                    const orderId = job.id as string;
                    const netEarning = (job.shippingCharge as number) * 0.95;
                    return (
                      <TableRow key={orderId}>
                        <TableCell className="font-medium">#{(job.orderNumber as string || "").slice(-8)}</TableCell>
                        <TableCell>{user?.name}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-sm">{job.shippingAddress as string}</TableCell>
                        <TableCell className="font-bold text-emerald-600">{formatCurrency(netEarning)}</TableCell>
                        <TableCell>
                          <Badge variant={status === "DELIVERED" ? "success" : status === "SHIPPED" ? "info" : "warning"}>
                            {status === "SHIPPED" ? "IN TRANSIT" : status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {status === "CONFIRMED" && (
                              <Button size="sm" onClick={() => handleStartTransit(orderId)} disabled={actionLoading === orderId}>
                                {actionLoading === orderId ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-1" /> Start</>}
                              </Button>
                            )}
                            {status === "SHIPPED" && (
                              <Button size="sm" variant="success" onClick={() => handleMarkDelivered(orderId)} disabled={actionLoading === `deliver-${orderId}`}>
                                {actionLoading === `deliver-${orderId}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" /> Delivered</>}
                              </Button>
                            )}
                            {status === "DELIVERED" && <span className="text-xs text-emerald-500">✓ Done</span>}
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
      </div>
    </PageTransition>
  );
}
