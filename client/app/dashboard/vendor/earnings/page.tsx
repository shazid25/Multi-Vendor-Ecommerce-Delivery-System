"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, Loader2, ArrowUpRight } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getVendorStats, getVendorOrders } from "@/app/actions/mart-actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function VendorEarnings() {
  const [vendor, setVendor] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [statsRes, ordersRes] = await Promise.all([
      getVendorStats(),
      getVendorOrders(),
    ]);
    if (statsRes.success) setVendor(statsRes.data);
    if (ordersRes.success) setHistory(ordersRes.data || []);
    setLoading(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings Overview</h1>
          <p className="text-muted-foreground mt-1">Track your sales and withdrawal history</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Available Balance" value={formatCurrency(vendor?.balance || 0)} icon={<DollarSign className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Total Sales" value={formatCurrency(vendor?.totalSales || 0)} icon={<TrendingUp className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Commission Rate" value={`${vendor?.platformCommission || 5}%`} icon={<ArrowUpRight className="w-6 h-6" />} gradient="from-amber-500/10 to-orange-500/10" />
        </BentoGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Recent Transactions
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((vo) => (
                  <TableRow key={vo.id}>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(vo.createdAt)}</TableCell>
                    <TableCell className="font-medium">#{vo.order.orderNumber}</TableCell>
                    <TableCell className="font-bold text-emerald-600">+{formatCurrency(vo.vendorAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={vo.status === "DELIVERED" ? "success" : "secondary"}>
                        {vo.status === "DELIVERED" ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No transaction history</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payout Information</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Bank Name</p>
                <p className="font-medium">{vendor?.bankName || "Not Provided"}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Account Holder</p>
                <p className="font-medium">{vendor?.bankAccountName || "Not Provided"}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Account Number</p>
                <p className="font-medium">{vendor?.bankAccountNumber || "**** **** ****"}</p>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Withdrawals are processed every Monday. Minimum withdrawal amount is ৳1,000.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
