"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Loader2, Mail, Shield } from "lucide-react";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllUsers } from "@/app/actions/mart-actions";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await getAllUsers();
      if (res.success) setUsers(res.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all registered users</p>
        </div>

        <GlassCard className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary border">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === "SUPER_ADMIN" ? "destructive" :
                      user.role === "ADMIN" ? "default" :
                      user.role === "VENDOR" ? "success" :
                      user.role === "DELIVERY_PARTNER" ? "info" : "secondary"
                    } className="flex items-center gap-1 w-fit">
                      <Shield className="w-3 h-3" /> {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="text-muted-foreground">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user._count?.orders || 0} orders</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={user.isActive ? "success" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
