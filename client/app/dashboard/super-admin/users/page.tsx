"use client";

import React, { useEffect, useState } from "react";
import { Users, Shield, Edit2, Trash2, Loader2, Check, X, Search } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllUsers, updateUserRole, deleteUser } from "@/app/actions/mart-actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success) setUsers(res.data || []);
    setLoading(false);
  }

  const handleUpdateRole = async (userId: string) => {
    if (!selectedRole) return;
    setActionLoading(true);
    const res = await updateUserRole(userId, selectedRole);
    setActionLoading(false);
    if (res.success) {
      toast.success("User role updated");
      setEditingId(null);
      loadUsers();
    } else {
      toast.error(res.error || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is IRREVERSIBLE.")) return;
    setActionLoading(true);
    const res = await deleteUser(userId);
    setActionLoading(false);
    if (res.success) {
      toast.success("User deleted");
      loadUsers();
    } else {
      toast.error(res.error || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Role Management</h1>
          <p className="text-muted-foreground mt-1">Manage all system users and their administrative roles</p>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Total Users" value={users.length} icon={<Users className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Admins" value={users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length} icon={<Shield className="w-6 h-6" />} gradient="from-purple-500/10 to-pink-500/10" />
          <StatCard title="Partners" value={users.filter(u => u.role === "VENDOR" || u.role === "DELIVERY_PARTNER").length} icon={<Users className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
        </BentoGrid>

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
                <TableHead className="text-right">Actions</TableHead>
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
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                          <SelectItem value="DELIVERY_PARTNER">Delivery</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={
                        user.role === "SUPER_ADMIN" ? "destructive" :
                        user.role === "ADMIN" ? "default" :
                        user.role === "VENDOR" ? "success" :
                        user.role === "DELIVERY_PARTNER" ? "info" : "secondary"
                      }>
                        {user.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === user.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdateRole(user.id)} disabled={actionLoading}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} disabled={actionLoading}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(user.id); setSelectedRole(user.role); }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id)} disabled={user.role === "SUPER_ADMIN"}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
