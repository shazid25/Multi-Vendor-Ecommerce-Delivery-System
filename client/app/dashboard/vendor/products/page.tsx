"use client";

import React, { useEffect, useState } from "react";
import { Plus, Package, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { GlassCard, PageTransition, StatCard, BentoGrid } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getProducts, createProduct, updateProduct, deleteProduct, getVendorStats } from "@/app/actions/mart-actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/shared/file-upload";

export default function VendorProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discountPrice: 0,
    category: "",
    stock: 0,
    image: "",
    unit: "piece",
    unitValue: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [prodRes, statsRes] = await Promise.all([
      getProducts(),
      getVendorStats(),
    ]);
    if (prodRes.success) setProducts(prodRes.data || []);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const res = await createProduct({
      ...formData,
      discountPrice: formData.discountPrice || undefined,
    });
    setActionLoading(false);
    if (res.success) {
      toast.success("Product created successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: "", description: "", price: 0, discountPrice: 0, category: "", stock: 0, image: "", unit: "piece", unitValue: 1 });
      loadData();
    } else {
      toast.error(res.error || "Failed to create product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setActionLoading(true);
    const res = await deleteProduct(id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Product deleted");
      loadData();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
            <p className="text-muted-foreground mt-1">Add, edit, and manage your inventory</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (৳)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitValue">Unit Value</Label>
                    <Input id="unitValue" type="number" value={formData.unitValue} onChange={e => setFormData({...formData, unitValue: parseInt(e.target.value)})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit (kg/pc/etc)</Label>
                    <Input id="unit" placeholder="kg, piece, etc" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (৳)</Label>
                    <Input id="discount" type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock (Units)</Label>
                    <Input id="stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <FileUpload 
                    value={formData.image} 
                    onChange={url => setFormData({...formData, image: url})} 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="gradient" disabled={actionLoading} className="w-full">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <BentoGrid columns={3}>
          <StatCard title="Total Products" value={stats?._count?.products || 0} icon={<Package className="w-6 h-6" />} gradient="from-blue-500/10 to-indigo-500/10" />
          <StatCard title="Active Listings" value={products.filter(p => p.isActive).length} icon={<Package className="w-6 h-6" />} gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard title="Out of Stock" value={products.filter(p => p.stock === 0).length} icon={<Package className="w-6 h-6 text-destructive" />} gradient="from-red-500/10 to-pink-500/10" />
        </BentoGrid>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products or categories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                        {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-2.5 text-muted-foreground" />}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(product.discountPrice || product.price)}
                        <span className="text-xs text-muted-foreground font-normal">/{product.unitValue}{product.unit}</span>
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={product.stock === 0 ? "text-destructive font-bold" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "success" : "secondary"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No products found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
