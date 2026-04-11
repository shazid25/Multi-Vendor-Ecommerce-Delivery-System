"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitVendorRequest } from "@/app/actions/nexus-actions";

interface VendorRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VendorRequestForm({ onSuccess, onCancel }: VendorRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    shopDescription: "",
    businessType: "",
    phoneNumber: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shopName || !formData.businessType || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await submitVendorRequest(formData);
      if (result.success) {
        toast.success("Vendor request submitted successfully!");
        onSuccess?.();
        setFormData({
          shopName: "",
          shopDescription: "",
          businessType: "",
          phoneNumber: "",
          bankName: "",
          bankAccountName: "",
          bankAccountNumber: "",
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
      <h3 className="text-lg font-semibold mb-4">Become a Vendor</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Fill out the form below to apply for a vendor account. Our team will review your application and get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop Name *</Label>
          <Input
            id="shopName"
            placeholder="My Awesome Shop"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            required
          />
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type *</Label>
          <select
            id="businessType"
            className="w-full px-3 py-2 border rounded-md bg-background"
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            required
          >
            <option value="">Select business type</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Food">Food & Beverages</option>
            <option value="Grocery">Grocery</option>
            <option value="Books">Books</option>
            <option value="Home">Home & Garden</option>
            <option value="Beauty">Beauty & Health</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Shop Description */}
        <div className="space-y-2">
          <Label htmlFor="shopDescription">Shop Description</Label>
          <Textarea
            id="shopDescription"
            placeholder="Tell us about your shop..."
            value={formData.shopDescription}
            onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
            rows={3}
          />
        </div>

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

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-4 text-sm">Bank Details (Optional)</h4>
          
          <div className="space-y-4">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Your Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="bankAccountName">Account Name</Label>
              <Input
                id="bankAccountName"
                placeholder="Account Name"
                value={formData.bankAccountName}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input
                id="bankAccountNumber"
                placeholder="Account Number"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
            </div>
          </div>
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

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md flex gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 dark:text-blue-200">
          Your application will be reviewed by our admin team. Once approved, you can start selling on our platform.
        </div>
      </div>
    </motion.div>
  );
}
