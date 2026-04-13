// "use client";

// import React, { useEffect, useState } from "react";
// import { ShoppingBag, Package, Truck, CheckCircle, Loader2, Star } from "lucide-react";
// import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { getOrders, getCustomerStats } from "@/app/actions/mart-actions";
// import { formatCurrency, formatDate } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";

// export default function CustomerOrders() {
//   const [orders, setOrders] = useState<any[]>([]);
//   const [stats, setStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [ratingLoading, setRatingLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [rating, setRating] = useState(5);
//   const [feedback, setFeedback] = useState("");

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function loadData() {
//     setLoading(true);
//     const [ordersRes, statsRes] = await Promise.all([
//       getOrders(),
//       getCustomerStats(),
//     ]);
//     if (ordersRes.success) setOrders(ordersRes.data || []);
//     if (statsRes.success) setStats(statsRes.data);
//     setLoading(false);
//   }

//   const handleRate = async () => {
//     if (!selectedOrder) return;
//     setRatingLoading(true);
//     // In a real app, you'd call a rateOrder action here
//     await new Promise(r => setTimeout(r, 1000));
//     setRatingLoading(false);
//     toast.success("Thank you for your feedback!");
//     setSelectedOrder(null);
//     setFeedback("");
//     setRating(5);
//   };

//   if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

//   return (
//     <PageTransition>
//       <div className="space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
//           <p className="text-muted-foreground mt-1">Track and manage your recent purchases</p>
//         </div>

//         <BentoGrid columns={3}>
//           <StatCard title="Active Orders" value={stats?.activeOrders || 0} icon={<Package className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
//           <StatCard title="Total Spent" value={formatCurrency(stats?.user?.totalSpent || 0)} icon={<ShoppingBag className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
//           <StatCard title="Completed" value={orders.filter(o => o.status === "DELIVERED").length} icon={<CheckCircle className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
//         </BentoGrid>

//         <GlassCard className="p-6">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Order #</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Items</TableHead>
//                 <TableHead>Total</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {orders.map((order) => (
//                 <TableRow key={order.id}>
//                   <TableCell className="font-medium">#{order.orderNumber}</TableCell>
//                   <TableCell className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
//                   <TableCell>
//                     <div className="flex flex-col text-xs">
//                       {order.items.map((item: any, i: number) => (
//                         <span key={i} className="line-clamp-1">{item.quantity}x {item.product.name}</span>
//                       ))}
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-bold">{formatCurrency(order.totalAmount)}</TableCell>
//                   <TableCell>
//                     <Badge variant={
//                       order.status === "DELIVERED" ? "success" :
//                       order.status === "SHIPPED" ? "info" :
//                       order.status === "CONFIRMED" ? "warning" : "secondary"
//                     }>
//                       {order.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     {order.status === "DELIVERED" && (
//                       <Dialog open={selectedOrder?.id === order.id} onOpenChange={(o) => !o && setSelectedOrder(null)}>
//                         <DialogTrigger asChild>
//                           <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
//                             Rate Items
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>Rate your experience</DialogTitle>
//                           </DialogHeader>
//                           <div className="space-y-4 py-4">
//                             <div className="flex justify-center gap-2">
//                               {[1, 2, 3, 4, 5].map((s) => (
//                                 <Star
//                                   key={s}
//                                   className={`w-8 h-8 cursor-pointer transition-colors ${s <= rating ? "text-amber-500 fill-amber-500" : "text-muted"}`}
//                                   onClick={() => setRating(s)}
//                                 />
//                               ))}
//                             </div>
//                             <div className="space-y-2">
//                               <Label>Feedback (Optional)</Label>
//                               <Textarea
//                                 placeholder="Tell us what you liked or how we can improve..."
//                                 value={feedback}
//                                 onChange={(e) => setFeedback(e.target.value)}
//                               />
//                             </div>
//                           </div>
//                           <DialogFooter>
//                             <Button onClick={handleRate} disabled={ratingLoading} className="w-full" variant="gradient">
//                               {ratingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Submit Review"}
//                             </Button>
//                           </DialogFooter>
//                         </DialogContent>
//                       </Dialog>
//                     )}
//                     <Button size="sm" variant="ghost">Details</Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {orders.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No orders found</TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </GlassCard>
//       </div>
//     </PageTransition>
//   );
// }
//        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No orders found</TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </GlassCard>
//       </div>
//     </PageTransition>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Package, Truck, CheckCircle, Loader2, Star } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOrders, getCustomerStats } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadData();
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful! Your order has been placed.");
      // Remove the query param without refreshing the page
      window.history.replaceState({}, '', window.location.pathname);
    } else if (searchParams.get("cancelled") === "true") {
      toast.error("Payment cancelled.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  async function loadData() {
    setLoading(true);
    const [ordersRes, statsRes] = await Promise.all([
      getOrders(),
      getCustomerStats(),
    ]);
    if (ordersRes.success) setOrders(ordersRes.data || []);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }

  const handleRate = async () => {
    if (!selectedOrder) return;
    setRatingLoading(true);
    // In a real app, you'd call a rateOrder action here
    await new Promise(r => setTimeout(r, 1000));
    setRatingLoading(false);
    toast.success("Thank you for your feedback!");
    setSelectedOrder(null);
    setFeedback("");
    setRating(5);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage your recent purchases</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Active Orders" value={stats?.activeOrders || 0} icon={<Package className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Total Spent" value={formatCurrency(stats?.user?.totalSpent || 0)} icon={<ShoppingBag className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Completed" value={orders.filter(o => o.status === "DELIVERED").length} icon={<CheckCircle className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
        </BentoGrid>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        {order.items.map((item: any, i: number) => (
                          <span key={i} className="line-clamp-1">{item.quantity}x {item.product.name}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {order.paymentMethod?.replace(/_/g, " ") || "STRIPE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === "DELIVERED" ? "success" :
                        order.status === "SHIPPED" ? "info" :
                        order.status === "CONFIRMED" ? "warning" : "secondary"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "DELIVERED" && (
                        <Dialog open={selectedOrder?.id === order.id} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                              Rate Items
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rate your experience</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-8 h-8 cursor-pointer transition-colors ${s <= rating ? "text-amber-500 fill-amber-500" : "text-muted"}`}
                                    onClick={() => setRating(s)}
                                  />
                                ))}
                              </div>
                              <div className="space-y-2">
                                <Label>Feedback (Optional)</Label>
                                <Textarea
                                  placeholder="Tell us what you liked or how we can improve..."
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleRate} disabled={ratingLoading} className="w-full" variant="gradient">
                                {ratingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Submit Review"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button size="sm" variant="ghost">Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
