"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, X, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { invoiceService } from "@/lib/api/services/invoiceService";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

interface Invoice {
  id: number;
  title: string;
  nameStore: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ nameStore: "", title: "" });
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", nameStore: "", amount: "" });

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 20, sort: "createdAt,desc" };
      if (filters.nameStore) params.nameStore = filters.nameStore;
      if (filters.title) params.title = filters.title;
      const res = await invoiceService.list(params);
      const wrapper = res?.data?.data !== undefined ? res.data : res?.data?.content !== undefined ? res.data : res;
      setInvoices(wrapper.data || wrapper.content || []);
      setTotalPages(wrapper.totalPages || 1);
    } catch { setInvoices([]); }
    setLoading(false);
  }, [page, searchTrigger]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await invoiceService.create({ title: form.title, nameStore: form.nameStore, amount: Number(form.amount) });
      toast({ title: "Thành công", description: "Đã tạo hóa đơn" });
      setCreateOpen(false);
      setForm({ title: "", nameStore: "", amount: "" });
      setSearchTrigger((p) => p + 1);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Không thể tạo hóa đơn", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSearch = () => { setPage(0); setSearchTrigger((p) => p + 1); };
  const hasFilters = filters.nameStore || filters.title;
  const clearFilters = () => { setFilters({ nameStore: "", title: "" }); setPage(0); setSearchTrigger((p) => p + 1); };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  return (
    <AuthGuard pageKey="invoices">
      <div className="space-y-4">
        <PageHeader title="Hóa đơn giả lập" description="Tạo và quản lý hóa đơn mẫu cho testing">
          <Button onClick={() => { setForm({ title: "", nameStore: "", amount: "" }); setCreateOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Tạo hóa đơn
          </Button>
        </PageHeader>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Cửa hàng</Label>
            <Input className="w-44" placeholder="Tên cửa hàng" value={filters.nameStore} onChange={(e) => setFilters((p) => ({ ...p, nameStore: e.target.value }))} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Tiêu đề</Label>
            <Input className="w-44" placeholder="Tiêu đề hóa đơn" value={filters.title} onChange={(e) => setFilters((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <Button size="sm" onClick={handleSearch}><Search className="mr-2 h-4 w-4" />Tìm kiếm</Button>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="mr-1 h-4 w-4" />Xóa bộ lọc</Button>}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có hóa đơn nào</TableCell></TableRow>
            ) : invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono">{inv.id}</TableCell>
                <TableCell className="font-medium">{inv.title}</TableCell>
                <TableCell>{inv.nameStore}</TableCell>
                <TableCell>{formatCurrency(inv.amount)}</TableCell>
                <TableCell className="text-sm">{formatDateTime(inv.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(inv); setDetailOpen(true); }} title="Xem chi tiết">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />

        {/* Create Invoice Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn giả lập</DialogTitle>
              <DialogDescription>Tạo hóa đơn mẫu để customer thanh toán</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tiêu đề *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="VD: Cà phê sáng" />
              </div>
              <div className="grid gap-2">
                <Label>Tên cửa hàng *</Label>
                <Input value={form.nameStore} onChange={(e) => setForm((p) => ({ ...p, nameStore: e.target.value }))} placeholder="VD: Coffee House" />
              </div>
              <div className="grid gap-2">
                <Label>Số tiền (VNĐ) *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="VD: 150000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
              <Button onClick={handleCreate} disabled={saving || !form.title || !form.nameStore || !form.amount}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết hóa đơn</DialogTitle>
              <DialogDescription>#{selectedInvoice?.id}</DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-2">
                <div><Label className="text-xs text-muted-foreground">ID</Label><p className="text-sm font-mono">{selectedInvoice.id}</p></div>
                <div><Label className="text-xs text-muted-foreground">Tiêu đề</Label><p className="text-sm font-medium">{selectedInvoice.title}</p></div>
                <div><Label className="text-xs text-muted-foreground">Cửa hàng</Label><p className="text-sm">{selectedInvoice.nameStore}</p></div>
                <div><Label className="text-xs text-muted-foreground">Số tiền</Label><p className="text-sm font-medium">{formatCurrency(selectedInvoice.amount)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Ngày tạo</Label><p className="text-sm">{formatDateTime(selectedInvoice.createdAt)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Cập nhật</Label><p className="text-sm">{formatDateTime(selectedInvoice.updatedAt)}</p></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
