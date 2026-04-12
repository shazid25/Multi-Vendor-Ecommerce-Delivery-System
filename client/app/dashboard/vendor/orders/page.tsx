"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, Truck, Loader2, User, Phone, MapPin } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getVendorOrders, acceptOrder, assignDeliveryPartner, getAvailableDeliveryPartners } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VendorOrders() {
  const [vendorOrders, setVendorOrders] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [ordersRes, dpRes] = await Promise.all([
      getVendorOrders(),
      getAvailableDeliveryPartners(),
    ]);
    if (ordersRes.success) setVendorOrders(ordersRes.data || []);
    if (dpRes.success) setDeliveryPartners(dpRes.data || []);
    setLoading(false);
  }

  const handleAcceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    const res = await acceptOrder(orderId);
    setActionLoading(null);
    if (res.success) {
      toast.success("Order accepted");
      loadData();
    } else {
      toast.error(res.error || "Failed to accept order");
    }
  };

  const handleAssignDP = async (dpId: string) => {
    if (!selectedOrderId) return;
    setActionLoading(`assign-${dpId}`);
    const res = await assignDeliveryPartner(selectedOrderId, dpId);
    setActionLoading(null);
    if (res.success) {
      toast.success("Delivery partner assigned");
      setIsAssignDialogOpen(false);
      setSelectedOrderId(null);
      loadData();
    } else {
      toast.error(res.error || "Failed to assign partner");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const pendingCount = vendorOrders.filter(vo => vo.status === "PENDING").length;
  const activeCount = vendorOrders.filter(vo => vo.status === "CONFIRMED" || vo.status === "SHIPPED").length;
  const deliveredCount = vendorOrders.filter(vo => vo.status === "DELIVERED").length;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-1">Accept orders and assign delivery partners</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Pending Orders" value={pendingCount} icon={<ShoppingCart className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
          <StatCard title="In Progress" value={activeCount} icon={<Truck className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Completed" value={deliveredCount} icon={<CheckCircle className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
        </BentoGrid>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorOrders.map((vo) => {
                const order = vo.order;
                const user = order.user;
                const dp = order.deliveryAssignment?.deliveryPartner?.user?.name;

                return (
                  <TableRow key={vo.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-sm">{user?.name}</span>
                        <span className="text-muted-foreground">{user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(vo.vendorAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        vo.status === "DELIVERED" ? "success" :
                        vo.status === "SHIPPED" ? "info" :
                        vo.status === "CONFIRMED" ? "warning" : "secondary"
                      }>
                        {vo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dp ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Truck className="w-3 h-3" /> {dp}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {vo.status === "PENDING" && (
                        <Button size="sm" variant="success" onClick={() => handleAcceptOrder(order.id)} disabled={actionLoading === order.id}>
                          {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                        </Button>
                      )}
                      {vo.status === "CONFIRMED" && (
                        <Dialog open={isAssignDialogOpen && selectedOrderId === order.id} onOpenChange={(open) => {
                          setIsAssignDialogOpen(open);
                          if (!open) setSelectedOrderId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="gradient" onClick={() => setSelectedOrderId(order.id)}>
                              Assign Partner
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[450px]">
                            <DialogHeader>
                              <DialogTitle>Assign Delivery Partner</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[300px] py-4">
                              <div className="space-y-3">
                                {deliveryPartners.length === 0 ? (
                                  <p className="text-center text-muted-foreground py-8">No available partners found</p>
                                ) : (
                                  deliveryPartners.map((partner) => (
                                    <div key={partner.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full mart-gradient-bg flex items-center justify-center text-white font-bold">
                                          {partner.user.name[0]}
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold">{partner.user.name}</p>
                                          <p className="text-xs text-muted-foreground">{partner.vehicleType}</p>
                                        </div>
                                      </div>
                                      <Button size="sm" onClick={() => handleAssignDP(partner.id)} disabled={actionLoading === `assign-${partner.id}`}>
                                        {actionLoading === `assign-${partner.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : "Assign"}
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {vendorOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No orders found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
