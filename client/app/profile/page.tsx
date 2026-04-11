"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Camera, 
  Loader2, 
  CheckCircle2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard, PageTransition } from "@/components/shared/nexus-ui";
import { updateUserProfile, updateUserRole } from "@/app/actions/nexus-actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user as any;
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [session, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateUserProfile({ name, phone });
    setLoading(false);
    if (result.success) {
      toast.success("Profile updated successfully");
      setEditing(false);
      await refetch();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  const handleRoleSwitch = async (newRole: string) => {
    if (!user) return;
    setLoading(true);
    const result = await updateUserRole(user.id, newRole);
    setLoading(false);
    if (result.success) {
      toast.success(`Role switched to ${newRole}`);
      await refetch();
      // Give it a moment for the session to refresh since we reduced updateAge
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error(result.error || "Failed to switch role");
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Please log in to view your profile</h2>
        <Button className="mt-4" onClick={() => window.location.href = "/login"}>Go to Login</Button>
      </div>
    );
  }

  const role = user.role as string;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight nexus-gradient-text">Account Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your identity and role on the Nexus platform.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Avatar */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-8 text-center">
              <div className="relative inline-block group mb-6">
                <div className="w-32 h-32 rounded-3xl nexus-gradient-bg flex items-center justify-center text-4xl font-bold text-white shadow-2xl relative overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase()
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-background border shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {role}
              </div>
              <p className="text-sm text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Security Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email Verified</span>
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="text-emerald-500 font-medium">Active</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold border-l-4 border-primary pl-4">Personal Information</h3>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    Edit Details
                  </Button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground/70">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        disabled={!editing} 
                        className="pl-10" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground/70">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input disabled className="pl-10 opacity-70" value={user.email} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground/70">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        disabled={!editing} 
                        className="pl-10" 
                        placeholder="Add phone number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground/70">Joined On</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input disabled className="pl-10 opacity-70" value={new Date(user.createdAt).toDateString()} />
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" variant="gradient" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                )}
              </form>
            </GlassCard>

            <GlassCard className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold border-l-4 border-yellow-500 pl-4">Switch Role (Developer Tools)</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Easily switch between roles to test different dashboard functionalities. 
                  Changing to VENDOR or DELIVERY_PARTNER will automatically initialize your profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {["CUSTOMER", "VENDOR", "DELIVERY_PARTNER", "ADMIN"].map((r) => (
                  <Button
                    key={r}
                    variant={role === r ? "gradient" : "outline"}
                    className={cn(
                      "min-w-[120px] shadow-sm",
                      role === r && "scale-105"
                    )}
                    disabled={loading}
                    onClick={() => handleRoleSwitch(r)}
                  >
                    {r.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
