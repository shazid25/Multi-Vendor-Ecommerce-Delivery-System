"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Calendar, Loader2, Award, TrendingUp } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDeliveryPartnerStats, getDeliveryJobs } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DeliveryEarnings() {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [statsRes, jobsRes] = await Promise.all([
      getDeliveryPartnerStats(),
      getDeliveryJobs(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (jobsRes.success) setHistory(jobsRes.data || []);
    setLoading(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const deliveredJobs = history.filter(j => j.status === "DELIVERED");

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings History</h1>
          <p className="text-muted-foreground mt-1">Track your income and delivery performance</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Available Balance" value={formatCurrency(stats?.availableBalance || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Earned" value={formatCurrency(stats?.totalEarnings || 0)} icon={<TrendingUp className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Total Deliveries" value={stats?.totalDeliveries || 0} icon={<Award className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
        </BentoGrid>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Delivery Log
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Earning</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(job.updatedAt)}</TableCell>
                  <TableCell className="font-medium">#{job.orderNumber}</TableCell>
                  <TableCell className="font-bold text-emerald-600">+{formatCurrency(job.shippingCharge)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {deliveredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No completed deliveries yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
