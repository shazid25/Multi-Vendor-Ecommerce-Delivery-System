// "use client";

// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Users, CheckCircle, XCircle, Clock, Loader2, Search, Filter } from "lucide-react";
// import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { SkeletonDashboard } from "@/components/ui/skeleton";
// import { getRoleRequests, approveRoleRequest, rejectRoleRequest } from "@/app/actions/mart-actions";
// import { formatDate } from "@/lib/utils";
// import { toast } from "sonner";

// export default function AdminRequests() {
//   const [requests, setRequests] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [rejectId, setRejectId] = useState<string | null>(null);
//   const [rejectReason, setRejectReason] = useState("");
//   const [filter, setFilter] = useState<string>("PENDING");

//   useEffect(() => { loadRequests(); }, [filter]);

//   async function loadRequests() {
//     setLoading(true);
//     const result = await getRoleRequests(filter);
//     if (result.success) setRequests(result.data || []);
//     setLoading(false);
//   }

//   const handleApprove = async (id: string) => {
//     setActionLoading(id);
//     const result = await approveRoleRequest(id);
//     setActionLoading(null);
//     if (result.success) { toast.success("Request approved!"); loadRequests(); }
//     else toast.error(result.error || "Failed to approve");
//   };

//   const handleReject = async (id: string) => {
//     if (!rejectReason.trim()) { toast.error("Please provide a reason"); return; }
//     setActionLoading(`reject-${id}`);
//     const result = await rejectRoleRequest(id, rejectReason);
//     setActionLoading(null);
//     if (result.success) { toast.success("Request rejected"); setRejectId(null); setRejectReason(""); loadRequests(); }
//     else toast.error(result.error || "Failed to reject");
//   };

//   if (loading && requests.length === 0) return <SkeletonDashboard />;

//   return (
//     <PageTransition>
//       <div className="space-y-8">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Role Requests</h1>
//             <p className="text-muted-foreground mt-1">Review and manage vendor and delivery partner applications</p>
//           </div>
//           <div className="flex gap-2">
//             {["PENDING", "APPROVED", "REJECTED"].map((s) => (
//               <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
//                 {s}
//               </Button>
//             ))}
//             <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => setFilter("")}>
//               ALL
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 gap-4">
//           {requests.length === 0 ? (
//             <GlassCard className="p-12 text-center" hover={false}>
//               <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
//               <h3 className="text-lg font-medium">No {filter.toLowerCase()} requests</h3>
//               <p className="text-muted-foreground">Applications from users will appear here.</p>
//             </GlassCard>
//           ) : (
//             requests.map((req, i) => {
//               const user = req.user;
//               return (
//                 <motion.div
//                   key={req.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.05 }}
//                 >
//                   <GlassCard className="p-6">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//                       <div className="flex items-center gap-4">
//                         <div className="w-14 h-14 rounded-full mart-gradient-bg flex items-center justify-center text-white text-xl font-bold border-4 border-white/20 shadow-lg">
//                           {user?.name?.[0]?.toUpperCase() || "U"}
//                         </div>
//                         <div>
//                           <p className="font-bold text-lg">{user?.name}</p>
//                           <p className="text-sm text-muted-foreground">{user?.email}</p>
//                           <div className="flex items-center gap-2 mt-2">
//                             <Badge variant={req.requestType === "VENDOR" ? "default" : "info"}>
//                               {req.requestType}
//                             </Badge>
//                             <Badge variant={
//                               req.status === "PENDING" ? "warning" : 
//                               req.status === "APPROVED" ? "success" : "destructive"
//                             }>
//                               {req.status}
//                             </Badge>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-white/10">
//                         {req.requestType === "VENDOR" ? (
//                           <>
//                             <div className="space-y-1">
//                               <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Shop Name</p>
//                               <p className="text-sm font-semibold">{req.shopName}</p>
//                             </div>
//                             <div className="space-y-1">
//                               <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Business Type</p>
//                               <p className="text-sm font-semibold">{req.businessType}</p>
//                             </div>
//                           </>
//                         ) : (
//                           <>
//                             <div className="space-y-1">
//                               <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Vehicle Type</p>
//                               <p className="text-sm font-semibold">{req.vehicleType}</p>
//                             </div>
//                             <div className="space-y-1">
//                               <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">License #</p>
//                               <p className="text-sm font-semibold">{req.licenseNumber}</p>
//                             </div>
//                           </>
//                         )}
//                         <div className="space-y-1">
//                           <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Phone Number</p>
//                           <p className="text-sm font-semibold">{req.phoneNumber}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Applied On</p>
//                           <p className="text-sm font-semibold">{formatDate(req.createdAt)}</p>
//                         </div>
//                       </div>

//                       {req.status === "PENDING" && (
//                         <div className="flex md:flex-col gap-2">
//                           <Button
//                             size="sm"
//                             variant="success"
//                             className="flex-1 shadow-md shadow-emerald-500/20"
//                             onClick={() => handleApprove(req.id)}
//                             disabled={actionLoading === req.id}
//                           >
//                             {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             className="flex-1"
//                             onClick={() => setRejectId(req.id)}
//                           >
//                             Reject
//                           </Button>
//                         </div>
//                       )}
//                     </div>

//                     {rejectId === req.id && (
//                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
//                         <Label className="text-xs font-bold uppercase mb-2 block">Rejection Reason</Label>
//                         <div className="flex gap-2">
//                           <Input
//                             placeholder="Enter reason for rejection..."
//                             value={rejectReason}
//                             onChange={(e) => setRejectReason(e.target.value)}
//                             className="bg-background"
//                           />
//                           <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} disabled={actionLoading === `reject-${req.id}`}>
//                             Confirm
//                           </Button>
//                           <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>
//                             Cancel
//                           </Button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </GlassCard>
//                 </motion.div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </PageTransition>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, Clock, Loader2, Search, Filter } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added this import
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { getRoleRequests, approveRoleRequest, rejectRoleRequest } from "@/app/actions/mart-actions";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<string>("PENDING");

  useEffect(() => { loadRequests(); }, [filter]);

  async function loadRequests() {
    setLoading(true);
    const result = await getRoleRequests(filter);
    if (result.success) setRequests(result.data || []);
    setLoading(false);
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const result = await approveRoleRequest(id);
    setActionLoading(null);
    if (result.success) { 
      toast.success("Request approved!"); 
      loadRequests(); 
    } else {
      toast.error(result.error || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { 
      toast.error("Please provide a reason"); 
      return; 
    }
    setActionLoading(`reject-${id}`);
    const result = await rejectRoleRequest(id, rejectReason);
    setActionLoading(null);
    if (result.success) { 
      toast.success("Request rejected"); 
      setRejectId(null); 
      setRejectReason(""); 
      loadRequests(); 
    } else {
      toast.error(result.error || "Failed to reject");
    }
  };

  if (loading && requests.length === 0) return <SkeletonDashboard />;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Requests</h1>
            <p className="text-muted-foreground mt-1">Review and manage vendor and delivery partner applications</p>
          </div>
          <div className="flex gap-2">
            {["PENDING", "APPROVED", "REJECTED"].map((s) => (
              <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
                {s}
              </Button>
            ))}
            <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => setFilter("")}>
              ALL
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.length === 0 ? (
            <GlassCard className="p-12 text-center" hover={false}>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No {filter.toLowerCase()} requests</h3>
              <p className="text-muted-foreground">Applications from users will appear here.</p>
            </GlassCard>
          ) : (
            requests.map((req, i) => {
              const user = req.user;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full mart-gradient-bg flex items-center justify-center text-white text-xl font-bold border-4 border-white/20 shadow-lg">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={req.requestType === "VENDOR" ? "default" : "info"}>
                              {req.requestType}
                            </Badge>
                            <Badge variant={
                              req.status === "PENDING" ? "warning" : 
                              req.status === "APPROVED" ? "success" : "destructive"
                            }>
                              {req.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-white/10">
                        {req.requestType === "VENDOR" ? (
                          <>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Shop Name</p>
                              <p className="text-sm font-semibold">{req.shopName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Business Type</p>
                              <p className="text-sm font-semibold">{req.businessType}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Vehicle Type</p>
                              <p className="text-sm font-semibold">{req.vehicleType}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">License #</p>
                              <p className="text-sm font-semibold">{req.licenseNumber}</p>
                            </div>
                          </>
                        )}
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Phone Number</p>
                          <p className="text-sm font-semibold">{req.phoneNumber}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Applied On</p>
                          <p className="text-sm font-semibold">{formatDate(req.createdAt)}</p>
                        </div>
                      </div>

                      {req.status === "PENDING" && (
                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            className="flex-1 shadow-md shadow-emerald-500/20"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setRejectId(req.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {rejectId === req.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                        <Label className="text-xs font-bold uppercase mb-2 block">Rejection Reason</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="bg-background"
                          />
                          <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} disabled={actionLoading === `reject-${req.id}`}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}