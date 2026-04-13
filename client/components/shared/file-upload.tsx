"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
}

export function FileUpload({ value, onChange, onRemove }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Get session to send auth headers if needed
      // Better Auth usually handles cookies, but if the server is on a different port/domain, 
      // we might need to send the token explicitly or use credentials: include.
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:5000'}/api/upload/upload`, {
        method: "POST",
        body: formData,
        // If using Better Auth session tokens in headers:
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("better-auth.session-token") || ""}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        onChange(data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              onChange("");
              onRemove?.();
            }}
            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-80 transition"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition border-muted-foreground/25"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-full">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm font-medium">Click to upload image</div>
              <div className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</div>
            </>
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}
