"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { getRoleRequests, approveRoleRequest, rejectRoleRequest } from "@/app/actions/mart-actions";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function SuperAdminRequests() {
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
    if (result.success) { toast.success("Approved!"); loadRequests(); }
    else toast.error(result.error || "Failed");
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error("Reason required"); return; }
    setActionLoading(`reject-${id}`);
    const result = await rejectRoleRequest(id, rejectReason);
    setActionLoading(null);
    if (result.success) { toast.success("Rejected"); setRejectId(null); setRejectReason(""); loadRequests(); }
    else toast.error(result.error || "Failed");
  };

  if (loading && requests.length === 0) return <SkeletonDashboard />;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Global Role Requests</h1>
            <p className="text-muted-foreground mt-1">Review vendor and delivery partner applications across the platform</p>
          </div>
          <div className="flex gap-2">
            {["PENDING", "APPROVED", "REJECTED"].map((s) => (
              <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full mart-gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {req.user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{req.user.name}</p>
                      <p className="text-xs text-muted-foreground">{req.user.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-xl text-xs">
                    <div><p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Type</p><Badge variant="secondary">{req.requestType}</Badge></div>
                    {req.requestType === "VENDOR" ? (
                      <>
                        <div><p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Shop</p><p className="font-semibold">{req.shopName}</p></div>
                        <div><p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Category</p><p className="font-semibold">{req.businessType}</p></div>
                      </>
                    ) : (
                      <>
                        <div><p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Vehicle</p><p className="font-semibold">{req.vehicleType}</p></div>
                        <div><p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">License</p><p className="font-semibold truncate max-w-[80px]">{req.licenseNumber}</p></div>
                      </>
                    )}
                    <div><p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Date</p><p className="font-semibold">{new Date(req.createdAt).toLocaleDateString()}</p></div>
                  </div>

                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(req.id)} disabled={actionLoading === req.id}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejectId(req.id)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
                {rejectId === req.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex gap-2">
                    <Input placeholder="Rejection reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                    <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          ))}
          {requests.length === 0 && (
            <div className="p-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
              No {filter.toLowerCase()} requests found
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
