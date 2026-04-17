// "use client";

// import React, { useEffect, useState } from "react";
// import { Package, MapPin, Phone, CheckCircle, Loader2, Navigation } from "lucide-react";
// import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { getDeliveryJobs, markAsDelivered, startTransit, getDeliveryPartnerStats } from "@/app/actions/mart-actions";
// import { formatCurrency, formatDate } from "@/lib/utils";
// import { toast } from "sonner";

// export default function DeliveryJobs() {
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [stats, setStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function loadData() {
//     setLoading(true);
//     const [jobsRes, statsRes] = await Promise.all([
//       getDeliveryJobs(),
//       getDeliveryPartnerStats(),
//     ]);
//     if (jobsRes.success) setJobs(jobsRes.data || []);
//     if (statsRes.success) setStats(statsRes.data);
//     setLoading(false);
//   }

//   const handleStartTransit = async (orderId: string) => {
//     setActionLoading(`transit-${orderId}`);
//     const res = await startTransit(orderId);
//     setActionLoading(null);
//     if (res.success) {
//       toast.success("Order is now in transit");
//       loadData();
//     } else {
//       toast.error(res.error || "Failed to update status");
//     }
//   };

//   const handleMarkDelivered = async (orderId: string) => {
//     setActionLoading(`delivered-${orderId}`);
//     const res = await markAsDelivered(orderId);
//     setActionLoading(null);
//     if (res.success) {
//       toast.success("Order marked as delivered! ৳80 added to your balance.");
//       loadData();
//     } else {
//       toast.error(res.error || "Failed to mark as delivered");
//     }
//   };

//   if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

//   const activeJobs = jobs.filter(j => j.status !== "DELIVERED" && j.status !== "CANCELLED");

//   return (
//     <PageTransition>
//       <div className="space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Delivery Jobs</h1>
//           <p className="text-muted-foreground mt-1">Manage your active and upcoming deliveries</p>
//         </div>

//         <BentoGrid columns={3}>
//           <StatCard title="Active Jobs" value={activeJobs.length} icon={<Navigation className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
//           <StatCard title="Today's Deliveries" value={stats?.todayDeliveries || 0} icon={<CheckCircle className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
//           <StatCard title="Total Earnings" value={formatCurrency(stats?.totalEarnings || 0)} icon={<Package className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
//         </BentoGrid>

//         <div className="space-y-6">
//           <h3 className="text-xl font-bold">Current Assignments</h3>
//           {activeJobs.length === 0 ? (
//             <GlassCard className="p-12 text-center" hover={false}>
//               <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
//               <p className="text-muted-foreground font-medium">No active delivery jobs</p>
//               <p className="text-sm text-muted-foreground">You'll be notified when a vendor assigns you a job.</p>
//             </GlassCard>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {activeJobs.map((job) => (
//                 <GlassCard key={job.id} className="p-6">
//                   <div className="flex justify-between items-start mb-6">
//                     <div>
//                       <Badge className="mb-2">{job.status}</Badge>
//                       <h4 className="text-lg font-bold">Order #{job.orderNumber}</h4>
//                       <p className="text-xs text-muted-foreground">Assigned {formatDate(job.updatedAt)}</p>
//                     </div>
//                     <div className="p-3 rounded-full bg-primary/10 text-primary">
//                       <Truck className="w-6 h-6" />
//                     </div>
//                   </div>

//                   <div className="space-y-4 mb-8">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 rounded-lg bg-muted text-muted-foreground">
//                         <MapPin className="w-4 h-4" />
//                       </div>
//                       <div>
//                         <p className="text-xs font-bold uppercase text-muted-foreground">Delivery Address</p>
//                         <p className="text-sm font-medium">{job.shippingAddress}</p>
//                         <p className="text-xs text-muted-foreground">{job.city}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 rounded-lg bg-muted text-muted-foreground">
//                         <Phone className="w-4 h-4" />
//                       </div>
//                       <div>
//                         <p className="text-xs font-bold uppercase text-muted-foreground">Customer Contact</p>
//                         <p className="text-sm font-medium">{job.user.name}</p>
//                         <p className="text-xs text-muted-foreground">{job.user.email}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-3">
//                     {job.status === "CONFIRMED" ? (
//                       <Button className="flex-1" variant="outline" onClick={() => handleStartTransit(job.id)} disabled={actionLoading === `transit-${job.id}`}>
//                         {actionLoading === `transit-${job.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Transit"}
//                       </Button>
//                     ) : (
//                       <Button className="flex-1" variant="success" onClick={() => handleMarkDelivered(job.id)} disabled={actionLoading === `delivered-${job.id}`}>
//                         {actionLoading === `delivered-${job.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Delivered"}
//                       </Button>
//                     )}
//                     <Button variant="outline" size="icon">
//                       <Navigation className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </GlassCard>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </PageTransition>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Loader2, 
  Navigation, 
  Truck // Added Truck import
} from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDeliveryJobs, markAsDelivered, startTransit, getDeliveryPartnerStats } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DeliveryJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [jobsRes, statsRes] = await Promise.all([
      getDeliveryJobs(),
      getDeliveryPartnerStats(),
    ]);
    if (jobsRes.success) setJobs(jobsRes.data || []);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }

  const handleStartTransit = async (orderId: string) => {
    setActionLoading(`transit-${orderId}`);
    const res = await startTransit(orderId);
    setActionLoading(null);
    if (res.success) {
      toast.success("Order is now in transit");
      loadData();
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setActionLoading(`delivered-${orderId}`);
    const res = await markAsDelivered(orderId);
    setActionLoading(null);
    if (res.success) {
      // Calculate net earnings after 5% fee
      const order = jobs.find(j => j.id === orderId);
      if (order) {
        const grossEarnings = order.shippingCharge;
        const netEarnings = grossEarnings * 0.95; // After 5% platform fee
        toast.success(`Order delivered! ${formatCurrency(netEarnings)} added to your wallet.`);
      } else {
        toast.success("Order marked as delivered!");
      }
      loadData();
    } else {
      toast.error(res.error || "Failed to mark as delivered");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const activeJobs = jobs.filter(j => {
    const deliveryStatus = j.delivery?.status || j.status;
    return deliveryStatus !== "DELIVERED" && deliveryStatus !== "CANCELLED" && deliveryStatus !== "FAILED";
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage your active and upcoming deliveries</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Active Jobs" value={activeJobs.length} icon={<Navigation className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Today's Deliveries" value={stats?.todayDeliveries || 0} icon={<CheckCircle className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Earnings" value={formatCurrency(stats?.totalEarnings || 0)} icon={<Package className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
        </BentoGrid>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Current Assignments</h3>
          {activeJobs.length === 0 ? (
            <GlassCard className="p-12 text-center" hover={false}>
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No active delivery jobs</p>
              <p className="text-sm text-muted-foreground">You'll be notified when a vendor assigns you a job.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeJobs.map((job) => {
                const deliveryStatus = job.delivery?.status || job.status;

                return (
                <GlassCard key={job.id} className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                      <Badge className="mb-2">{deliveryStatus}</Badge>
                      <h4 className="text-lg font-bold">Order #{job.orderNumber}</h4>
                      <p className="text-xs text-muted-foreground">Assigned {formatDate(job.createdAt)}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Delivery Charge</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(job.shippingCharge)}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Delivery Address</p>
                        <p className="text-sm font-medium">{job.shippingAddress}</p>
                        <p className="text-xs text-muted-foreground">{job.city} ({job.zone})</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Customer Contact</p>
                        <p className="text-sm font-medium">{job.customerName || job.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{job.customerPhone || job.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Items to Deliver</p>
                        <div className="space-y-1 mt-2">
                          {job.items?.map((item: any) => (
                            <div key={item.id} className="text-xs">
                              <span className="font-medium">{item.product?.name}</span>
                              <span className="text-muted-foreground"> × {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {(deliveryStatus === "ASSIGNED" || deliveryStatus === "PICKED_UP" || deliveryStatus === "CONFIRMED") ? (
                      <Button className="flex-1" variant="outline" onClick={() => handleStartTransit(job.id)} disabled={actionLoading === `transit-${job.id}`}>
                        {actionLoading === `transit-${job.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Transit"}
                      </Button>
                    ) : (deliveryStatus === "IN_TRANSIT" || deliveryStatus === "SHIPPED") ? (
                      <Button className="flex-1" variant="success" onClick={() => handleMarkDelivered(job.id)} disabled={actionLoading === `delivered-${job.id}`}>
                        {actionLoading === `delivered-${job.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Delivered"}
                      </Button>
                    ) : (
                      <Button className="flex-1" disabled variant="outline">
                        {deliveryStatus}
                      </Button>
                    )}
                    <Button variant="outline" size="icon" title="Open in Maps">
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassCard>
              )})}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}