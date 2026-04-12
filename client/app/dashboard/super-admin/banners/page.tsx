"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, Image as ImageIcon } from "lucide-react";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAllBanners, createBanner, updateBanner, deleteBanner } from "@/app/actions/mart-actions";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { Badge } from "@/components/ui/badge";

export default function BannerManagement() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newBanner, setNewBanner] = useState({ image: "", title: "", link: "", order: 0 });

  useEffect(() => { loadBanners(); }, []);

  async function loadBanners() {
    const res = await getAllBanners();
    if (res.success) setBanners(res.data || []);
    setLoading(false);
  }

  const handleCreate = async () => {
    if (!newBanner.image) return toast.error("Image URL is required");
    setActionLoading(true);
    const res = await createBanner(newBanner);
    setActionLoading(false);
    if (res.success) {
      toast.success("Banner created");
      setNewBanner({ image: "", title: "", link: "", order: 0 });
      loadBanners();
    } else toast.error(res.error || "Failed");
  };

  const handleUpdate = async (id: string, data: any) => {
    setActionLoading(true);
    const res = await updateBanner(id, data);
    setActionLoading(false);
    if (res.success) {
      toast.success("Banner updated");
      setEditingId(null);
      loadBanners();
    } else toast.error(res.error || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    setActionLoading(true);
    const res = await deleteBanner(id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Banner deleted");
      loadBanners();
    } else toast.error(res.error || "Failed");
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground mt-1">Manage the homepage hero carousel</p>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New Banner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-xs font-medium mb-1 block text-muted-foreground">Banner Image</label>
              <FileUpload value={newBanner.image} onChange={url => setNewBanner({...newBanner, image: url})} />
            </div>
            <Input placeholder="Title (optional)" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
            <Input placeholder="Link (optional)" value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} />
            <Input type="number" placeholder="Order" value={newBanner.order} onChange={e => setNewBanner({...newBanner, order: parseInt(e.target.value)})} />
          </div>
          <Button onClick={handleCreate} disabled={actionLoading} className="mt-4 w-full md:w-auto">
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Banner
          </Button>
        </GlassCard>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="w-20 h-12 rounded bg-muted overflow-hidden">
                      <img src={banner.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === banner.id ? (
                      <Input value={banner.title || ""} onChange={e => {
                        const newBanners = banners.map(b => b.id === banner.id ? {...b, title: e.target.value} : b);
                        setBanners(newBanners);
                      }} />
                    ) : (
                      banner.title || <span className="text-muted-foreground italic text-xs">No title</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === banner.id ? (
                      <Input value={banner.link || ""} onChange={e => {
                        const newBanners = banners.map(b => b.id === banner.id ? {...b, link: e.target.value} : b);
                        setBanners(newBanners);
                      }} />
                    ) : (
                      <span className="text-xs truncate max-w-[100px] block">{banner.link || "-"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === banner.id ? (
                      <Input type="number" className="w-20" value={banner.order} onChange={e => {
                        const newBanners = banners.map(b => b.id === banner.id ? {...b, order: parseInt(e.target.value)} : b);
                        setBanners(newBanners);
                      }} />
                    ) : (
                      banner.order
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.isActive ? "success" : "secondary"}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === banner.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdate(banner.id, banner)}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(banner.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(banner.id)}>
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
