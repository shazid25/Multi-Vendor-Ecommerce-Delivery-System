"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, BookOpen, Image as ImageIcon } from "lucide-react";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAllBlogs, createBlog, updateBlog, deleteBlog } from "@/app/actions/mart-actions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", content: "", image: "", slug: "" });

  useEffect(() => { loadBlogs(); }, []);

  async function loadBlogs() {
    const res = await getAllBlogs();
    if (res.success) setBlogs(res.data || []);
    setLoading(false);
  }

  const handleCreate = async () => {
    if (!newBlog.title || !newBlog.content) return toast.error("Title and Content are required");
    setActionLoading(true);
    const res = await createBlog(newBlog);
    setActionLoading(false);
    if (res.success) {
      toast.success("Blog post created");
      setNewBlog({ title: "", content: "", image: "", slug: "" });
      loadBlogs();
    } else toast.error(res.error || "Failed");
  };

  const handleUpdate = async (id: string, data: any) => {
    setActionLoading(true);
    const res = await updateBlog(id, data);
    setActionLoading(false);
    if (res.success) {
      toast.success("Blog post updated");
      setEditingId(null);
      loadBlogs();
    } else toast.error(res.error || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    setActionLoading(true);
    const res = await deleteBlog(id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Blog post deleted");
      loadBlogs();
    } else toast.error(res.error || "Failed");
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground mt-1">Write and manage your store's blog posts</p>
          </div>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Write New Post
          </h2>
          <div className="space-y-4">
            <Input 
              placeholder="Blog Title" 
              value={newBlog.title} 
              onChange={e => {
                const title = e.target.value;
                const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                setNewBlog({...newBlog, title, slug});
              }} 
            />
            <Input 
              placeholder="Slug (auto-generated)" 
              value={newBlog.slug} 
              onChange={e => setNewBlog({...newBlog, slug: e.target.value})} 
            />
            <Input 
              placeholder="Image URL" 
              value={newBlog.image} 
              onChange={e => setNewBlog({...newBlog, image: e.target.value})} 
            />
            <Textarea 
              placeholder="Content (HTML supported)" 
              className="min-h-[200px]"
              value={newBlog.content} 
              onChange={e => setNewBlog({...newBlog, content: e.target.value})} 
            />
            <Button onClick={handleCreate} disabled={actionLoading} className="w-full md:w-auto">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Publish Post
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium max-w-[300px]">
                    {editingId === blog.id ? (
                      <Input value={blog.title} onChange={e => {
                        const newBlogs = blogs.map(b => b.id === blog.id ? {...b, title: e.target.value} : b);
                        setBlogs(newBlogs);
                      }} />
                    ) : (
                      <div className="flex items-center gap-3">
                        {blog.image && <img src={blog.image} className="w-10 h-10 rounded object-cover" alt="" />}
                        <span className="truncate">{blog.title}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === blog.id ? (
                      <Input value={blog.slug} onChange={e => {
                        const newBlogs = blogs.map(b => b.id === blog.id ? {...b, slug: e.target.value} : b);
                        setBlogs(newBlogs);
                      }} />
                    ) : (
                      <span className="text-xs text-muted-foreground">{blog.slug}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(blog.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === blog.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdate(blog.id, blog)}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(blog.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(blog.id)}>
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
