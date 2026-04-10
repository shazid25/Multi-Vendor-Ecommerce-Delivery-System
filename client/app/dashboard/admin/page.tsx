"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { BentoGrid, StatCard, GlassCard, PageTransition } from "@/components/shared/nexus-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { getRoleRequests, approveRoleRequest, rejectRoleRequest } from "@/app/actions/nexus-actions";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<string>("PENDING");

  useEffect(() => { loadRequests(); }, [filter]);

  async function loadRequests() {
    setLoading(true);
    const result = await getRoleRequests(filter);
    if (result.success) setRequests((result.data || []) as Record<string, unknown>[]);
    setLoading(false);
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const result = await approveRoleRequest(id);
    setActionLoading(null);
    if (result.success) { toast.success("Request approved! User role updated."); loadRequests(); }
    else toast.error(result.error || "Failed to approve");
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error("Please provide a reason"); return; }
    setActionLoading(`reject-${id}`);
    const result = await rejectRoleRequest(id, rejectReason);
    setActionLoading(null);
    if (result.success) { toast.success("Request rejected"); setRejectId(null); setRejectReason(""); loadRequests(); }
    else toast.error(result.error || "Failed to reject");
  };

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  if (loading && requests.length === 0) return <SkeletonDashboard />;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review and manage role requests</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Pending" value={pending} icon={<Clock className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
          <StatCard title="Approved" value={approved} icon={<CheckCircle className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Rejected" value={rejected} icon={<XCircle className="w-6 h-6" />} gradient="from-red-500/10 to-pink-500/10" />
        </BentoGrid>

        {/* Filter */}
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

        {/* Requests */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">No {filter.toLowerCase()} requests</p>
            </GlassCard>
          ) : (
            requests.map((req, i) => {
              const user = req.user as Record<string, unknown>;
              return (
                <motion.div
                  key={req.id as string}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full nexus-gradient-bg flex items-center justify-center text-white font-bold">
                          {(user?.name as string)?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold">{user?.name as string}</p>
                          <p className="text-sm text-muted-foreground">{user?.email as string}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={req.type === "VENDOR" ? "default" : "info"}>
                              {req.type as string}
                            </Badge>
                            <Badge variant={req.status === "PENDING" ? "warning" : req.status === "APPROVED" ? "success" : "destructive"}>
                              {req.status as string}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(req.createdAt as string)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="text-sm text-muted-foreground space-y-1">
                        {(req.shopName as string) && <p><strong>Shop:</strong> {req.shopName as string}</p>}
                        {(req.businessType as string) && <p><strong>Type:</strong> {req.businessType as string}</p>}
                        {(req.vehicleType as string) && <p><strong>Vehicle:</strong> {req.vehicleType as string}</p>}
                        {(req.phoneNumber as string) && <p><strong>Phone:</strong> {req.phoneNumber as string}</p>}
                      </div>

                      {/* Actions */}
                      {req.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(req.id as string)}
                            disabled={actionLoading === (req.id as string)}
                          >
                            {actionLoading === (req.id as string) ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" /> Approve</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectId(req.id as string)}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Reject reason input */}
                    {rejectId === (req.id as string) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 flex gap-2">
                        <Input
                          placeholder="Reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.id as string)} disabled={actionLoading === `reject-${req.id}`}>
                          {actionLoading === `reject-${req.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                          Cancel
                        </Button>
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
