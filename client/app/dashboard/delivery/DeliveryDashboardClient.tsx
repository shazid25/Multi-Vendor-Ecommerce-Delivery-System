"use client";

import React, { useEffect, useState } from "react";
import { Truck, DollarSign, Package, Clock, CheckCircle, Play, Loader2, Eye, Phone, MapPin, User } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { getDeliveryJobs, getDeliveryPartnerStats, markAsDelivered, startTransit } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DeliveryDashboardClient() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);

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
              <Table className="table-fixed min-w-[1240px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] whitespace-nowrap">Order</TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap">Customer</TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap">Phone</TableHead>
                    <TableHead className="w-[260px] whitespace-nowrap">Address</TableHead>
                    <TableHead className="w-[120px] whitespace-nowrap">Amount</TableHead>
                    <TableHead className="w-[130px] whitespace-nowrap">Delivery Fee</TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap">Status</TableHead>
                    <TableHead className="w-[120px] whitespace-nowrap">Details</TableHead>
                    <TableHead className="w-[190px] whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    const user = job.user as Record<string, string>;
                    const items = job.items as Record<string, unknown>[];
                    const orderStatus = job.status as string;
                    const delivery = job.delivery as Record<string, unknown> | undefined;
                    const status = (delivery?.status as string) || orderStatus;
                    const orderId = job.id as string;
                    const shippingCharge = job.shippingCharge as number;
                    const totalAmount = job.totalAmount as number;
                    const netEarning = shippingCharge * 0.95;
                    const customerName = (job.customerName as string) || user?.name;
                    const customerPhone = job.customerPhone as string;
                    const shippingAddress = job.shippingAddress as string;
                    const city = job.city as string;
                    const zone = job.zone as string;
                    
                    return (
                      <TableRow key={orderId}>
                        <TableCell className="font-medium">#{(job.orderNumber as string || "").slice(-8)}</TableCell>
                        <TableCell className="truncate">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm truncate">{customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{customerPhone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-xs min-w-0">
                              <p className="truncate">{shippingAddress}</p>
                              <p className="text-muted-foreground truncate">{city} ({zone})</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold whitespace-nowrap">{formatCurrency(totalAmount)}</TableCell>
                        <TableCell className="font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(netEarning)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={status === "DELIVERED" ? "success" : status === "SHIPPED" ? "info" : "warning"}>
                            {status === "SHIPPED" ? "IN TRANSIT" : status === "DELIVERED" ? "DELIVERED" : status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="whitespace-nowrap">
                                <Eye className="w-3 h-3 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Order Details #{String(job.orderNumber)}</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-[400px]">
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs font-bold uppercase text-muted-foreground">Customer Name</p>
                                      <p className="text-sm font-semibold flex items-center gap-1">
                                        <User className="w-4 h-4 text-primary" />
                                        {customerName}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold uppercase text-muted-foreground">Phone Number</p>
                                      <p className="text-sm font-semibold flex items-center gap-1">
                                        <Phone className="w-4 h-4 text-primary" />
                                        {customerPhone}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Shipping Address</p>
                                    <div className="flex gap-2 text-sm">
                                      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-semibold">{shippingAddress}</p>
                                        <p className="text-xs text-muted-foreground">{city} ({zone})</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Items ({items?.length || 0})</p>
                                    <div className="space-y-2">
                                      {items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                                          <div className="flex items-center gap-2">
                                            <img 
                                              src={item.product?.images?.[0] || '/placeholder.png'} 
                                              alt={item.product?.name} 
                                              className="w-8 h-8 rounded object-cover"
                                            />
                                            <div>
                                              <span className="font-medium">{item.product?.name}</span>
                                              <span className="text-muted-foreground ml-2">x {item.quantity}</span>
                                            </div>
                                          </div>
                                          <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Subtotal</span>
                                      <span className="font-semibold">{formatCurrency((totalAmount - shippingCharge))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Shipping Charge</span>
                                      <span className="font-semibold">{formatCurrency(shippingCharge)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg">
                                      <span>Total Amount</span>
                                      <span>{formatCurrency(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-600">
                                      <span className="text-sm font-medium">Your Earnings (95% of delivery fee)</span>
                                      <span className="font-bold">{formatCurrency(netEarning)}</span>
                                    </div>
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex gap-2 items-center">
                            {(status === "ASSIGNED" || status === "PICKED_UP" || status === "CONFIRMED") && (
                              <Button size="sm" onClick={() => handleStartTransit(orderId)} disabled={actionLoading === orderId} className="whitespace-nowrap">
                                {actionLoading === orderId ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-1" /> Start</>}
                              </Button>
                            )}
                            {(status === "IN_TRANSIT" || status === "SHIPPED") && (
                              <Button size="sm" variant="success" onClick={() => handleMarkDelivered(orderId)} disabled={actionLoading === `deliver-${orderId}`} className="whitespace-nowrap">
                                {actionLoading === `deliver-${orderId}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" /> Mark Delivered</>}
                              </Button>
                            )}
                            {status === "DELIVERED" && <span className="text-xs text-emerald-500 font-medium whitespace-nowrap">✓ Delivered</span>}
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
