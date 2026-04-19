"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Send, CheckCircle, XCircle, Ban, Upload, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { voucherService } from "@/lib/api/services/voucherService";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { Voucher } from "@/lib/types";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
  PENDING_APPROVE: { label: "Chờ duyệt", variant: "outline" },
  INIT: { label: "Khởi tạo", variant: "secondary" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  FAILED: { label: "Thất bại", variant: "destructive" },
  FINISHED: { label: "Hoàn thành", variant: "default" },
};

const CUSTOMER_TIERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "DIAMOND", label: "Diamond" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PENDING_APPROVE", label: "Chờ duyệt" },
  { value: "INIT", label: "Khởi tạo" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "FAILED", label: "Thất bại" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FINISHED", label: "Hoàn thành" },
];

interface CreateForm {
  voucherName: string;
  description: string;
  customerTier: string;
  discountType: string;
  discountValue: string;
  maxDiscount: string;
  minOrderValue: string;
  totalStock: string;
  maxCollect: string;
  startDate: string;
  endDate: string;
}

const defaultForm: CreateForm = {
  voucherName: "", description: "", customerTier: "ALL",
  discountType: "FIXED", discountValue: "", maxDiscount: "",
  minOrderValue: "", totalStock: "", maxCollect: "1",
  startDate: "", endDate: "",
};

export default function VouchersPage() {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"single" | "excel">("single");
  const [form, setForm] = useState<CreateForm>(defaultForm);

  // Excel upload
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelDiscountType, setExcelDiscountType] = useState("FIXED");
  const [excelRequestId, setExcelRequestId] = useState("");

  // Action dialogs
  const [actionVoucher, setActionVoucher] = useState<Voucher | null>(null);
  const [actionType, setActionType] = useState<"submit" | "approve" | "reject" | "cancel" | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 20, sort: "createdTime,desc" };
      if (statusFilter !== "all") params.status = statusFilter;
      if (discountTypeFilter !== "all") params.requestType = discountTypeFilter;
      if (fromDate) params.fromDate = fromDate.includes("T") ? fromDate : `${fromDate}T00:00:00`;
      if (toDate) params.toDate = toDate.includes("T") ? toDate : `${toDate}T23:59:59`;
      const res = await voucherService.list(params);
      const data = res.data || res;
      setVouchers(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setVouchers([]);
    }
    setLoading(false);
  }, [page, statusFilter, discountTypeFilter, fromDate, toDate]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  // Create single voucher
  const handleCreateSingle = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        voucherName: form.voucherName,
        description: form.description,
        customerTier: form.customerTier,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        totalStock: Number(form.totalStock),
        maxCollect: form.maxCollect ? Number(form.maxCollect) : null,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      if (form.discountType === "FIXED") {
        body.minOrderValue = Number(form.minOrderValue);
      } else {
        body.maxDiscount = Number(form.maxDiscount);
      }
      await voucherService.create(body);
      toast({ title: "Thành công", description: "Đã tạo voucher request" });
      setCreateOpen(false);
      setForm(defaultForm);
      await fetchVouchers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Không thể tạo voucher", variant: "destructive" });
    }
    setSaving(false);
  };

  // Upload excel
  const handleUploadExcel = async () => {
    if (!excelFile) return;
    setSaving(true);
    try {
      await voucherService.uploadExcel(excelFile, excelDiscountType, excelRequestId);
      toast({ title: "Thành công", description: "Đã upload file Excel" });
      setCreateOpen(false);
      setExcelFile(null);
      setExcelRequestId("");
      await fetchVouchers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Không thể upload file", variant: "destructive" });
    }
    setSaving(false);
  };

  // Actions
  const handleAction = async () => {
    if (!actionVoucher || !actionType) return;
    setSaving(true);
    try {
      switch (actionType) {
        case "submit": await voucherService.submit(actionVoucher.id); break;
        case "approve": await voucherService.confirm(actionVoucher.id, "APPROVED"); break;
        case "reject": await voucherService.confirm(actionVoucher.id, "REJECTED"); break;
        case "cancel": await voucherService.cancel(actionVoucher.id); break;
      }
      const messages = { submit: "Đã gửi duyệt", approve: "Đã duyệt", reject: "Đã từ chối", cancel: "Đã hủy" };
      toast({ title: "Thành công", description: messages[actionType] });
      setActionVoucher(null);
      setActionType(null);
      await fetchVouchers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Thao tác thất bại", variant: "destructive" });
    }
    setSaving(false);
  };

  const openAction = (v: Voucher, type: "submit" | "approve" | "reject" | "cancel") => {
    setActionVoucher(v);
    setActionType(type);
  };

  return (
    <AuthGuard pageKey="vouchers">
      <div className="space-y-4">
        <PageHeader title="Quản lý Voucher" description="Tạo và quản lý voucher request">
          <Button onClick={() => { setForm(defaultForm); setExcelFile(null); setCreateMode("single"); setCreateOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Tạo voucher
          </Button>
        </PageHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Trạng thái</Label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Loại giảm giá</Label>
            <Select value={discountTypeFilter} onValueChange={(v) => { setDiscountTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="FIXED">Cố định</SelectItem>
                <SelectItem value="PERCENT">Phần trăm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Từ ngày</Label>
            <Input type="date" className="w-40" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(0); }} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Đến ngày</Label>
            <Input type="date" className="w-40" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(0); }} />
          </div>
          {(statusFilter !== "all" || discountTypeFilter !== "all" || fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setDiscountTypeFilter("all"); setFromDate(""); setToDate(""); setPage(0); }}>
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Người duyệt</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : vouchers.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Chưa có voucher request nào</TableCell></TableRow>
            ) : vouchers.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-sm">{v.requestId}</TableCell>
                <TableCell>
                  <Badge variant="outline">{v.requestMode === "SINGLE" ? "Đơn lẻ" : "Excel"}</Badge>
                </TableCell>
                <TableCell>{v.creatorType === "SYSTEM" ? "Hệ thống" : "Đối tác"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_MAP[v.status]?.variant || "secondary"}>
                    {STATUS_MAP[v.status]?.label || v.status}
                  </Badge>
                </TableCell>
                <TableCell>{v.createdBy}</TableCell>
                <TableCell className="text-sm">{formatDateTime(v.createdTime)}</TableCell>
                <TableCell>{v.confirmedBy || "—"}</TableCell>
                <TableCell className="text-right space-x-1">
                  {v.status === "DRAFT" && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => openAction(v, "submit")} title="Gửi duyệt"><Send className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openAction(v, "cancel")} title="Hủy"><Ban className="h-4 w-4 text-destructive" /></Button>
                    </>
                  )}
                  {v.status === "PENDING_APPROVE" && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => openAction(v, "approve")} title="Duyệt"><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openAction(v, "reject")} title="Từ chối"><XCircle className="h-4 w-4 text-destructive" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />

        {/* Create voucher dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Voucher Request</DialogTitle>
              <DialogDescription>Chọn cách tạo voucher</DialogDescription>
            </DialogHeader>
            <Tabs value={createMode} onValueChange={(v) => setCreateMode(v as "single" | "excel")}>
              <TabsList className="w-full">
                <TabsTrigger value="single" className="flex-1">Tạo đơn lẻ</TabsTrigger>
                <TabsTrigger value="excel" className="flex-1">Upload Excel</TabsTrigger>
              </TabsList>

              {/* Single mode */}
              <TabsContent value="single" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Tên voucher *</Label>
                  <Input value={form.voucherName} onChange={(e) => setForm((p) => ({ ...p, voucherName: e.target.value }))} placeholder="VD: Giảm 50K" />
                </div>
                <div className="grid gap-2">
                  <Label>Mô tả *</Label>
                  <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Mô tả voucher" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Loại giảm giá *</Label>
                    <Select value={form.discountType} onValueChange={(v) => setForm((p) => ({ ...p, discountType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Cố định (VNĐ)</SelectItem>
                        <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Hạng khách hàng</Label>
                    <Select value={form.customerTier} onValueChange={(v) => setForm((p) => ({ ...p, customerTier: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CUSTOMER_TIERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{form.discountType === "FIXED" ? "Số tiền giảm (VNĐ) *" : "Phần trăm giảm (%) *"}</Label>
                    <Input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
                  </div>
                  {form.discountType === "FIXED" ? (
                    <div className="grid gap-2">
                      <Label>Giá trị đơn tối thiểu (VNĐ) *</Label>
                      <Input type="number" value={form.minOrderValue} onChange={(e) => setForm((p) => ({ ...p, minOrderValue: e.target.value }))} />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label>Giảm tối đa (VNĐ) *</Label>
                      <Input type="number" value={form.maxDiscount} onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))} />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tổng số lượng *</Label>
                    <Input type="number" value={form.totalStock} onChange={(e) => setForm((p) => ({ ...p, totalStock: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Giới hạn thu thập/người</Label>
                    <Input type="number" value={form.maxCollect} onChange={(e) => setForm((p) => ({ ...p, maxCollect: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Ngày bắt đầu *</Label>
                    <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ngày kết thúc *</Label>
                    <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
                  <Button onClick={handleCreateSingle} disabled={saving || !form.voucherName || !form.discountValue || !form.totalStock || !form.startDate || !form.endDate}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo
                  </Button>
                </DialogFooter>
              </TabsContent>

              {/* Excel mode */}
              <TabsContent value="excel" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label>Request ID *</Label>
                  <Input value={excelRequestId} onChange={(e) => setExcelRequestId(e.target.value)} placeholder="VD: REQ-20250701-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Loại giảm giá *</Label>
                  <Select value={excelDiscountType} onValueChange={setExcelDiscountType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Cố định (VNĐ)</SelectItem>
                      <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Tải file mẫu tương ứng với loại giảm giá đã chọn:</p>
                    <div className="flex gap-2">
                      <a href={`/api/vouchers/template?type=${excelDiscountType}`} download>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Tải template {excelDiscountType === "FIXED" ? "FIXED" : "PERCENT"} (.xlsx)
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-2">
                  <Label>Upload file Excel (.xlsx) *</Label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-input px-4 py-3 hover:bg-muted/50 flex-1">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {excelFile ? excelFile.name : "Chọn file từ thiết bị..."}
                      </span>
                      <input type="file" accept=".xlsx" className="hidden" onChange={(e) => setExcelFile(e.target.files?.[0] || null)} />
                    </label>
                    {excelFile && (
                      <Button variant="ghost" size="sm" onClick={() => setExcelFile(null)}>Xóa</Button>
                    )}
                  </div>
                  {excelFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileSpreadsheet className="h-4 w-4" />
                      {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
                  <Button onClick={handleUploadExcel} disabled={saving || !excelFile || !excelRequestId}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Action confirm dialog */}
        <AlertDialog open={!!actionType} onOpenChange={(open) => { if (!open) { setActionType(null); setActionVoucher(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "submit" && "Gửi duyệt request?"}
                {actionType === "approve" && "Duyệt request?"}
                {actionType === "reject" && "Từ chối request?"}
                {actionType === "cancel" && "Hủy request?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Request: {actionVoucher?.requestId}
                {actionType === "cancel" && " — Hành động này không thể hoàn tác."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAction}
                disabled={saving}
                className={actionType === "reject" || actionType === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {actionType === "submit" && "Gửi duyệt"}
                {actionType === "approve" && "Duyệt"}
                {actionType === "reject" && "Từ chối"}
                {actionType === "cancel" && "Hủy"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
