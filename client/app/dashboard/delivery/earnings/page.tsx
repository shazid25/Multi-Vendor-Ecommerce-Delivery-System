"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Calendar, Loader2, Award, TrendingUp } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDeliveryPartnerStats, getDeliveryEarnings } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DeliveryEarnings() {
  const [stats, setStats] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [statsRes, earningsRes] = await Promise.all([
      getDeliveryPartnerStats(),
      getDeliveryEarnings(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (earningsRes.success) setEarnings(earningsRes.data || []);
    setLoading(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings History</h1>
          <p className="text-muted-foreground mt-1">Track your income and delivery performance</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Available Balance" value={formatCurrency(stats?.availableBalance || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Earned (Net)" value={formatCurrency(stats?.totalEarnings || 0)} icon={<TrendingUp className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
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
                <TableHead>Gross</TableHead>
                <TableHead>Fee (5%)</TableHead>
                <TableHead>Net Earning</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(earning.earnedAt)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(earning.amount)}</TableCell>
                  <TableCell className="text-red-500">-{formatCurrency(earning.commissionAmount)}</TableCell>
                  <TableCell className="font-bold text-emerald-600">{formatCurrency(earning.netAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {earnings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No earnings recorded yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
