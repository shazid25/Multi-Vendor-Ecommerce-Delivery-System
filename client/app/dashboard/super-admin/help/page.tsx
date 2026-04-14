"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, HelpCircle } from "lucide-react";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAllHelpEntries, createHelpEntry, updateHelpEntry, deleteHelpEntry } from "@/app/actions/mart-actions";
import { toast } from "sonner";

export default function HelpManagement() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", content: "", category: "General", order: 0 });

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    const res = await getAllHelpEntries();
    if (res.success) setEntries(res.data || []);
    setLoading(false);
  }

  const handleCreate = async () => {
    if (!newEntry.title || !newEntry.content) return toast.error("Title and Content are required");
    setActionLoading(true);
    const res = await createHelpEntry(newEntry);
    setActionLoading(false);
    if (res.success) {
      toast.success("Help entry created");
      setNewEntry({ title: "", content: "", category: "General", order: 0 });
      loadEntries();
    } else toast.error(res.error || "Failed");
  };

  const handleUpdate = async (id: string, data: any) => {
    setActionLoading(true);
    const res = await updateHelpEntry(id, data);
    setActionLoading(false);
    if (res.success) {
      toast.success("Help entry updated");
      setEditingId(null);
      loadEntries();
    } else toast.error(res.error || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this help entry?")) return;
    setActionLoading(true);
    const res = await deleteHelpEntry(id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Help entry deleted");
      loadEntries();
    } else toast.error(res.error || "Failed");
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Center Management</h1>
          <p className="text-muted-foreground mt-1">Manage help articles and guides</p>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New Help Entry
          </h2>
          <div className="space-y-4">
            <Input placeholder="Title" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
            <Input placeholder="Category" value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})} />
            <Textarea placeholder="Content (HTML supported)" value={newEntry.content} onChange={e => setNewEntry({...newEntry, content: e.target.value})} />
            <Input type="number" placeholder="Order" className="w-32" value={newEntry.order} onChange={e => setNewEntry({...newEntry, order: parseInt(e.target.value)})} />
            <Button onClick={handleCreate} disabled={actionLoading} className="w-full md:w-auto">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Entry
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {editingId === entry.id ? (
                      <Input value={entry.title} onChange={e => {
                        const newEntries = entries.map(e_item => e_item.id === entry.id ? {...e_item, title: e.target.value} : e_item);
                        setEntries(newEntries);
                      }} />
                    ) : (
                      entry.title
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === entry.id ? (
                      <Input value={entry.category} onChange={e => {
                        const newEntries = entries.map(e_item => e_item.id === entry.id ? {...e_item, category: e.target.value} : e_item);
                        setEntries(newEntries);
                      }} />
                    ) : (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{entry.category}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === entry.id ? (
                      <Input type="number" className="w-20" value={entry.order} onChange={e => {
                        const newEntries = entries.map(e_item => e_item.id === entry.id ? {...e_item, order: parseInt(e.target.value)} : e_item);
                        setEntries(newEntries);
                      }} />
                    ) : (
                      entry.order
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === entry.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdate(entry.id, entry)}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(entry.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
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
