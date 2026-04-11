"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { submitDeliveryRequest } from "@/app/actions/nexus-actions";

interface DeliveryRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DeliveryRequestForm({ onSuccess, onCancel }: DeliveryRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    vehicleType: "Motorcycle",
    licenseNumber: "",
    nidNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phoneNumber || !formData.vehicleType || !formData.licenseNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await submitDeliveryRequest(formData);
      if (result.success) {
        toast.success("Delivery partner request submitted successfully!");
        onSuccess?.();
        setFormData({
          phoneNumber: "",
          vehicleType: "Motorcycle",
          licenseNumber: "",
          nidNumber: "",
        });
      } else {
        toast.error(result.error || "Failed to submit request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Become a Delivery Partner</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Join our delivery network and earn money by delivering orders. Fill out the form to apply.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+880123456789"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
          />
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type *</Label>
          <select
            id="vehicleType"
            className="w-full px-3 py-2 border rounded-md bg-background"
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            required
          >
            <option value="Motorcycle">Motorcycle/Bike</option>
            <option value="Bicycle">Bicycle</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input
            id="licenseNumber"
            placeholder="DL-XXXX-XXXXX-XXXXX"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            required
          />
        </div>

        {/* NID Number */}
        <div className="space-y-2">
          <Label htmlFor="nidNumber">NID/ID Number</Label>
          <Input
            id="nidNumber"
            placeholder="Your NID or Passport Number"
            value={formData.nidNumber}
            onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="gradient"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md flex gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-200">
          Earn money by delivering orders in your area. Your application will be verified by our team.
        </div>
      </div>
    </motion.div>
  );
}
