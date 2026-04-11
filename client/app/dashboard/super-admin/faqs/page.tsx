"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, HelpCircle } from "lucide-react";
import { GlassCard, PageTransition } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from "@/app/actions/mart-actions";
import { toast } from "sonner";

export default function FAQManagement() {
  const [faqs, setFAQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "", order: 0 });

  useEffect(() => { loadFAQs(); }, []);

  async function loadFAQs() {
    const res = await getAllFAQs();
    if (res.success) setFAQs(res.data || []);
    setLoading(false);
  }

  const handleCreate = async () => {
    if (!newFAQ.question || !newFAQ.answer) return toast.error("Question and Answer are required");
    setActionLoading(true);
    const res = await createFAQ(newFAQ);
    setActionLoading(false);
    if (res.success) {
      toast.success("FAQ created");
      setNewFAQ({ question: "", answer: "", order: 0 });
      loadFAQs();
    } else toast.error(res.error || "Failed");
  };

  const handleUpdate = async (id: string, data: any) => {
    setActionLoading(true);
    const res = await updateFAQ(id, data);
    setActionLoading(false);
    if (res.success) {
      toast.success("FAQ updated");
      setEditingId(null);
      loadFAQs();
    } else toast.error(res.error || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    setActionLoading(true);
    const res = await deleteFAQ(id);
    setActionLoading(false);
    if (res.success) {
      toast.success("FAQ deleted");
      loadFAQs();
    } else toast.error(res.error || "Failed");
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New FAQ
          </h2>
          <div className="space-y-4">
            <Input placeholder="Question" value={newFAQ.question} onChange={e => setNewFAQ({...newFAQ, question: e.target.value})} />
            <Textarea placeholder="Answer" value={newFAQ.answer} onChange={e => setNewFAQ({...newFAQ, answer: e.target.value})} />
            <Input type="number" placeholder="Order" className="w-32" value={newFAQ.order} onChange={e => setNewFAQ({...newFAQ, order: parseInt(e.target.value)})} />
            <Button onClick={handleCreate} disabled={actionLoading} className="w-full md:w-auto">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create FAQ
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">
                    {editingId === faq.id ? (
                      <Input value={faq.question} onChange={e => {
                        const newFAQs = faqs.map(f => f.id === faq.id ? {...f, question: e.target.value} : f);
                        setFAQs(newFAQs);
                      }} />
                    ) : (
                      faq.question
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === faq.id ? (
                      <Textarea value={faq.answer} onChange={e => {
                        const newFAQs = faqs.map(f => f.id === faq.id ? {...f, answer: e.target.value} : f);
                        setFAQs(newFAQs);
                      }} />
                    ) : (
                      <span className="text-xs line-clamp-2">{faq.answer}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === faq.id ? (
                      <Input type="number" className="w-20" value={faq.order} onChange={e => {
                        const newFAQs = faqs.map(f => f.id === faq.id ? {...f, order: parseInt(e.target.value)} : f);
                        setFAQs(newFAQs);
                      }} />
                    ) : (
                      faq.order
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === faq.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdate(faq.id, faq)}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(faq.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(faq.id)}>
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
