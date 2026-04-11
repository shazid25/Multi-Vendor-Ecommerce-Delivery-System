"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Store, Truck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { submitVendorRequest, submitDeliveryRequest } from "@/app/actions/mart-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RequestType = "vendor" | "delivery" | null;

export default function BecomePartnerPage() {
  const [type, setType] = useState<RequestType>(null);
  const [loading, setLoading] = useState(false);

  // Vendor fields
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Delivery fields
  const [vehicleType, setVehicleType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [dpPhone, setDpPhone] = useState("");

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitVendorRequest({ shopName, shopDescription, businessType, phoneNumber });
    setLoading(false);
    if (result.success) {
      toast.success("Vendor application submitted! You'll be notified when reviewed.");
      setType(null);
    } else {
      toast.error(result.error || "Failed to submit");
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitDeliveryRequest({ phoneNumber: dpPhone, vehicleType, licenseNumber, nidNumber });
    setLoading(false);
    if (result.success) {
      toast.success("Delivery partner application submitted!");
      setType(null);
    } else {
      toast.error(result.error || "Failed to submit");
    }
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Become a Partner</h1>
          <p className="text-muted-foreground mt-1">Choose your path and start earning with Green Mart</p>
        </div>

        {!type ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Option */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setType("vendor")}
              className="cursor-pointer"
            >
              <GlassCard className="p-8 text-center h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Become a Vendor</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Sell your products, manage orders, and grow your business
                </p>
                <Button variant="gradient" className="group">
                  Apply as Vendor <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </GlassCard>
            </motion.div>

            {/* Delivery Partner Option */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setType("delivery")}
              className="cursor-pointer"
            >
              <GlassCard className="p-8 text-center h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Become a Delivery Partner</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Deliver orders, earn per delivery, flexible schedule
                </p>
                <Button variant="gradient" className="group">
                  Apply as Delivery <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </GlassCard>
            </motion.div>
          </div>
        ) : type === "vendor" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Vendor Application</h2>
                  <p className="text-sm text-muted-foreground">Tell us about your business</p>
                </div>
              </div>

              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop Name *</Label>
                    <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="My Awesome Shop" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type *</Label>
                    <Input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Electronics, Fashion, etc." required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Shop Description</Label>
                  <Textarea value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} placeholder="Describe your shop..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+880 1XXX-XXXXXX" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setType(null)}>Back</Button>
                  <Button type="submit" variant="gradient" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Delivery Partner Application</h2>
                  <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                </div>
              </div>

              <form onSubmit={handleDeliverySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input value={dpPhone} onChange={(e) => setDpPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type *</Label>
                    <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="Motorcycle, Bicycle, etc." required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>License Number *</Label>
                    <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DL-XXXXXXXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label>NID Number</Label>
                    <Input value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} placeholder="National ID" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setType(null)}>Back</Button>
                  <Button type="submit" variant="gradient" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

