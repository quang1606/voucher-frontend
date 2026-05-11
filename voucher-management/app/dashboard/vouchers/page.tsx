"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Loader2, Send, CheckCircle, XCircle, Ban,
  Upload, Download, FileSpreadsheet, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { voucherService } from "@/lib/api/services/voucherService";
import { useToast } from "@/hooks/use-toast";
import { useRoles } from "@/hooks/use-roles";
import { formatDateTime } from "@/lib/utils";
import type { Voucher, VoucherDetail } from "@/lib/types";

/* ========================================================================= */
/*  Constants                                                                */
/* ========================================================================= */

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  INIT: { label: "Khởi tạo", variant: "secondary" },
  PENDING_APPROVE: { label: "Chờ duyệt", variant: "outline" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
  FAILED: { label: "Thất bại", variant: "destructive" },
  FINISHED: { label: "Hoàn thành", variant: "default" },
};

const VOUCHER_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ACTIVE: { label: "Hoạt động", variant: "default" },
  INACTIVE: { label: "Ngừng", variant: "secondary" },
  EXPIRED: { label: "Hết hạn", variant: "destructive" },
};

const STATUS_COUNT_MAP: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
  INIT: { variant: "secondary" },
  PENDING_APPROVE: { variant: "outline" },
  APPROVED: { variant: "default" },
  SUCCESS: { variant: "default" },
  REJECTED: { variant: "destructive" },
  FAILED: { variant: "destructive" },
  CANCELLED: { variant: "destructive" },
  FINISHED: { variant: "default" },
  DRAFT: { variant: "secondary" },
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "INIT", label: "Khởi tạo" },
  { value: "PENDING_APPROVE", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "FAILED", label: "Thất bại" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FINISHED", label: "Hoàn thành" },
];

const REQUEST_MODE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "SINGLE", label: "Đơn lẻ" },
  { value: "EXCEL", label: "Excel" },
];

const CREATOR_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả nguồn" },
  { value: "PARTNER", label: "Đối tác" },
  { value: "SYSTEM", label: "Hệ thống" },
];

const VOUCHER_PURPOSE_OPTIONS = [
  { value: "all", label: "Tất cả mục đích" },
  { value: "REWARD", label: "Reward" },
  { value: "HUNT", label: "Hunt" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại giảm" },
  { value: "FIXED", label: "Cố định" },
  { value: "PERCENT", label: "Phần trăm" },
];

const DETAIL_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngừng" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "APPROVED", label: "Đã duyệt" },
];

const CUSTOMER_TIER_OPTIONS = [
  { value: "all", label: "Tất cả hạng" },
  { value: "ALL", label: "Tất cả KH" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "DIAMOND", label: "Diamond" },
];

const CUSTOMER_TIERS_FORM = [
  { value: "ALL", label: "Tất cả" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "DIAMOND", label: "Diamond" },
];

/* ========================================================================= */
/*  Create form                                                              */
/* ========================================================================= */

interface CreateForm {
  voucherName: string;
  description: string;
  voucherPurpose: string;
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
  voucherName: "", description: "", voucherPurpose: "REWARD",
  customerTier: "ALL", discountType: "FIXED", discountValue: "",
  maxDiscount: "", minOrderValue: "", totalStock: "",
  maxCollect: "1", startDate: "", endDate: "",
};

/* ========================================================================= */
/*  Helpers                                                                  */
/* ========================================================================= */

function formatDiscountValue(type: string, value: number) {
  if (type === "PERCENT") return `${value}%`;
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function SelectFilter({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ========================================================================= */
/*  Component                                                                */
/* ========================================================================= */

export default function VouchersPage() {
  const { toast } = useToast();
  const { isPartner } = useRoles();
  const [activeTab, setActiveTab] = useState("requests");

  // --- Tab 1: Voucher Requests state ---
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqPage, setReqPage] = useState(0);
  const [reqTotalPages, setReqTotalPages] = useState(1);
  const [reqFilters, setReqFilters] = useState({
    status: "all", requestMode: "all", creatorType: "all",
    voucherPurpose: "all", storeName: "", fromDate: "", toDate: "",
  });

  // --- Tab 2: Voucher Details state ---
  const [details, setDetails] = useState<VoucherDetail[]>([]);
  const [detLoading, setDetLoading] = useState(true);
  const [detPage, setDetPage] = useState(0);
  const [detTotalPages, setDetTotalPages] = useState(1);
  const [detFilters, setDetFilters] = useState({
    discountType: "all", voucherStatus: "all", customerTier: "all",
    creatorType: "all", voucherPurpose: "all", storeName: "", fromDate: "", toDate: "",
  });

  // --- Shared state ---
  const [saving, setSaving] = useState(false);
  const [reqSearchTrigger, setReqSearchTrigger] = useState(0);
  const [detSearchTrigger, setDetSearchTrigger] = useState(0);

  // Create dialog
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
  const [rejectReason, setRejectReason] = useState("");

  // Request detail dialog
  const [reqDetailOpen, setReqDetailOpen] = useState(false);
  const [reqDetailLoading, setReqDetailLoading] = useState(false);
  const [reqDetailData, setReqDetailData] = useState<Record<string, unknown> | null>(null);
  const [reqDetailVouchers, setReqDetailVouchers] = useState<VoucherDetail[]>([]);

  // Voucher detail dialog
  const [voucherDetailOpen, setVoucherDetailOpen] = useState(false);
  const [selectedVoucherDetail, setSelectedVoucherDetail] = useState<VoucherDetail | null>(null);

  /* ----------------------------------------------------------------------- */
  /*  Data fetching                                                          */
  /* ----------------------------------------------------------------------- */

  const fetchRequests = useCallback(async () => {
    setReqLoading(true);
    try {
      const params: Record<string, unknown> = { page: reqPage, size: 20, sort: "createdTime,desc" };
      if (reqFilters.status !== "all") params.status = reqFilters.status;
      if (reqFilters.requestMode !== "all") params.requestMode = reqFilters.requestMode;
      if (reqFilters.creatorType !== "all") params.creatorType = reqFilters.creatorType;
      if (reqFilters.voucherPurpose !== "all") params.voucherPurpose = reqFilters.voucherPurpose;
      if (reqFilters.storeName) params.storeName = reqFilters.storeName;
      if (reqFilters.fromDate) params.fromDate = reqFilters.fromDate.includes("T") ? reqFilters.fromDate : `${reqFilters.fromDate}T00:00:00`;
      if (reqFilters.toDate) params.toDate = reqFilters.toDate.includes("T") ? reqFilters.toDate : `${reqFilters.toDate}T23:59:59`;
      const res = await voucherService.list(params);
      // Response: { status, data: { content: [...] | data: [...], totalPages, ... } }
      const wrapper = res?.data?.content !== undefined ? res.data : res?.data?.data !== undefined ? res.data : res;
      setVouchers(wrapper.content || wrapper.data || []);
      setReqTotalPages(wrapper.totalPages || 1);
    } catch {
      setVouchers([]);
    }
    setReqLoading(false);
  }, [reqPage, reqSearchTrigger]);

  const fetchDetails = useCallback(async () => {
    setDetLoading(true);
    try {
      const params: Record<string, unknown> = { page: detPage, size: 20 };
      if (detFilters.discountType !== "all") params.discountType = detFilters.discountType;
      if (detFilters.voucherStatus !== "all") params.voucherStatus = detFilters.voucherStatus;
      if (detFilters.customerTier !== "all") params.customerTier = detFilters.customerTier;
      if (detFilters.creatorType !== "all") params.creatorType = detFilters.creatorType;
      if (detFilters.voucherPurpose !== "all") params.voucherPurpose = detFilters.voucherPurpose;
      if (detFilters.storeName) params.storeName = detFilters.storeName;
      if (detFilters.fromDate) params.fromDate = detFilters.fromDate.includes("T") ? detFilters.fromDate : `${detFilters.fromDate}T00:00:00`;
      if (detFilters.toDate) params.toDate = detFilters.toDate.includes("T") ? detFilters.toDate : `${detFilters.toDate}T23:59:59`;
      const res = await voucherService.details(params);
      // Response: { status, data: { data: [...], totalPages, ... } }
      const wrapper = res?.data?.data !== undefined ? res.data : res?.data?.content !== undefined ? res.data : res;
      setDetails(wrapper.data || wrapper.content || []);
      setDetTotalPages(wrapper.totalPages || 1);
    } catch {
      setDetails([]);
    }
    setDetLoading(false);
  }, [detPage, detSearchTrigger]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  /* ----------------------------------------------------------------------- */
  /*  Handlers                                                               */
  /* ----------------------------------------------------------------------- */

  const handleCreateSingle = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        voucherName: form.voucherName,
        description: form.description,
        customerTier: isPartner ? undefined : form.customerTier,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        totalStock: Number(form.totalStock),
        maxCollect: form.maxCollect ? Number(form.maxCollect) : null,
        startDate: form.startDate ? `${form.startDate}T00:00:00` : "",
        endDate: form.endDate ? `${form.endDate}T23:59:59` : "",
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
      await fetchRequests();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Không thể tạo voucher", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleUploadExcel = async () => {
    if (!excelFile) return;
    setSaving(true);
    try {
      await voucherService.uploadExcel(excelFile, excelDiscountType, excelRequestId);
      toast({ title: "Thành công", description: "Đã upload file Excel" });
      setCreateOpen(false);
      setExcelFile(null);
      setExcelRequestId("");
      await fetchRequests();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Không thể upload file", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleAction = async () => {
    if (!actionVoucher || !actionType) return;
    setSaving(true);
    try {
      switch (actionType) {
        case "submit":
          await voucherService.submit(actionVoucher.id);
          break;
        case "approve":
          await voucherService.confirm(actionVoucher.id, "APPROVED");
          break;
        case "reject":
          await voucherService.confirm(actionVoucher.id, "REJECTED", rejectReason || undefined);
          break;
        case "cancel":
          await voucherService.cancel(actionVoucher.id);
          break;
      }
      const messages = { submit: "Đã gửi duyệt", approve: "Đã duyệt", reject: "Đã từ chối", cancel: "Đã hủy" };
      toast({ title: "Thành công", description: messages[actionType] });
      setActionVoucher(null);
      setActionType(null);
      setRejectReason("");
      await fetchRequests();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Thao tác thất bại", variant: "destructive" });
    }
    setSaving(false);
  };

  const openAction = (v: Voucher, type: "submit" | "approve" | "reject" | "cancel") => {
    setActionVoucher(v);
    setActionType(type);
    setRejectReason("");
  };

  // View request detail
  const handleViewRequest = async (v: Voucher) => {
    setReqDetailOpen(true);
    setReqDetailLoading(true);
    setReqDetailData(v as unknown as Record<string, unknown>);
    setReqDetailVouchers([]);
    try {
      const res = await voucherService.getById(String(v.id));
      const payload = res?.data || res;
      // payload may have voucherDetailResponses or nested data
      const details = payload.voucherDetailResponses || payload.data || [];
      setReqDetailVouchers(Array.isArray(details) ? details : []);
    } catch { /* keep empty */ }
    setReqDetailLoading(false);
  };

  // View voucher detail
  const handleViewVoucherDetail = (d: VoucherDetail) => {
    setSelectedVoucherDetail(d);
    setVoucherDetailOpen(true);
  };

  const clearReqFilters = () => {
    setReqFilters({ status: "all", requestMode: "all", creatorType: "all", voucherPurpose: "all", storeName: "", fromDate: "", toDate: "" });
    setReqPage(0);
    setReqSearchTrigger((p) => p + 1);
  };

  const clearDetFilters = () => {
    setDetFilters({ discountType: "all", voucherStatus: "all", customerTier: "all", creatorType: "all", voucherPurpose: "all", storeName: "", fromDate: "", toDate: "" });
    setDetPage(0);
    setDetSearchTrigger((p) => p + 1);
  };

  const hasReqFilters = reqFilters.status !== "all" || reqFilters.requestMode !== "all" || reqFilters.creatorType !== "all" || reqFilters.voucherPurpose !== "all" || reqFilters.storeName !== "" || reqFilters.fromDate !== "" || reqFilters.toDate !== "";
  const hasDetFilters = detFilters.discountType !== "all" || detFilters.voucherStatus !== "all" || detFilters.customerTier !== "all" || detFilters.creatorType !== "all" || detFilters.voucherPurpose !== "all" || detFilters.storeName !== "" || detFilters.fromDate !== "" || detFilters.toDate !== "";

  /* ----------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ----------------------------------------------------------------------- */

  return (
    <AuthGuard pageKey="vouchers">
      <div className="space-y-4">
        <PageHeader title="Quản lý Voucher" description="Tạo và quản lý voucher request">
          <Button onClick={() => { setForm(defaultForm); setExcelFile(null); setCreateMode("single"); setCreateOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Tạo voucher
          </Button>
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requests">Voucher Requests</TabsTrigger>
            <TabsTrigger value="details">Voucher Details</TabsTrigger>
          </TabsList>

          {/* ============================================================= */}
          {/*  Tab 1 – Voucher Requests                                     */}
          {/* ============================================================= */}
          <TabsContent value="requests" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <SelectFilter label="Trạng thái" value={reqFilters.status} onChange={(v) => setReqFilters((p) => ({ ...p, status: v }))} options={STATUS_OPTIONS} />
              <SelectFilter label="Loại" value={reqFilters.requestMode} onChange={(v) => setReqFilters((p) => ({ ...p, requestMode: v }))} options={REQUEST_MODE_OPTIONS} />
              {!isPartner && <SelectFilter label="Nguồn" value={reqFilters.creatorType} onChange={(v) => setReqFilters((p) => ({ ...p, creatorType: v }))} options={CREATOR_TYPE_OPTIONS} />}
              {!isPartner && <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Cửa hàng</Label>
                <Input className="w-40" placeholder="Tên cửa hàng" value={reqFilters.storeName} onChange={(e) => setReqFilters((p) => ({ ...p, storeName: e.target.value }))} />
              </div>}
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                <Input type="date" className="w-40" value={reqFilters.fromDate} onChange={(e) => setReqFilters((p) => ({ ...p, fromDate: e.target.value }))} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Đến ngày</Label>
                <Input type="date" className="w-40" value={reqFilters.toDate} onChange={(e) => setReqFilters((p) => ({ ...p, toDate: e.target.value }))} />
              </div>
              <Button size="sm" onClick={() => { setReqPage(0); setReqSearchTrigger((p) => p + 1); }}><Search className="mr-2 h-4 w-4" />Tìm kiếm</Button>
              {hasReqFilters && (
                <Button variant="ghost" size="sm" onClick={clearReqFilters}>
                  <X className="mr-1 h-4 w-4" />Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Requests Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tổng voucher</TableHead>
                  <TableHead>Cửa hàng</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Người duyệt</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reqLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Chưa có voucher request nào
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.map((v) => (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewRequest(v)}>
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
                      <TableCell>
                        {v.totalVoucher}
                        {v.statusCounts && v.statusCounts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.statusCounts.map((sc) => (
                              <Badge key={sc.requestStatus} variant={STATUS_COUNT_MAP[sc.requestStatus]?.variant || "secondary"} className="text-xs">
                                {sc.requestStatus}: {sc.count}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{v.storeName || "—"}</TableCell>
                      <TableCell>{v.createdBy}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(v.createdTime)}</TableCell>
                      <TableCell>{v.confirmedBy || "—"}</TableCell>
                      <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        {(v.status === "INIT" || v.status === "DRAFT") && v.voucherPurpose !== "REWARD" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openAction(v, "submit")} title="Gửi duyệt">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openAction(v, "cancel")} title="Hủy">
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {v.status === "PENDING_APPROVE" && !isPartner && v.voucherPurpose !== "REWARD" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openAction(v, "approve")} title="Duyệt">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openAction(v, "reject")} title="Từ chối">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Pagination currentPage={reqPage + 1} totalPages={reqTotalPages} onPageChange={(p) => setReqPage(p - 1)} />
          </TabsContent>

          {/* ============================================================= */}
          {/*  Tab 2 – Voucher Details                                      */}
          {/* ============================================================= */}
          <TabsContent value="details" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <SelectFilter label="Loại giảm" value={detFilters.discountType} onChange={(v) => setDetFilters((p) => ({ ...p, discountType: v }))} options={DISCOUNT_TYPE_OPTIONS} />
              <SelectFilter label="Trạng thái" value={detFilters.voucherStatus} onChange={(v) => setDetFilters((p) => ({ ...p, voucherStatus: v }))} options={DETAIL_STATUS_OPTIONS} />
              <SelectFilter label="Hạng KH" value={detFilters.customerTier} onChange={(v) => setDetFilters((p) => ({ ...p, customerTier: v }))} options={CUSTOMER_TIER_OPTIONS} />
              {!isPartner && <SelectFilter label="Nguồn" value={detFilters.creatorType} onChange={(v) => setDetFilters((p) => ({ ...p, creatorType: v }))} options={CREATOR_TYPE_OPTIONS} />}
              {!isPartner && <SelectFilter label="Mục đích" value={detFilters.voucherPurpose} onChange={(v) => setDetFilters((p) => ({ ...p, voucherPurpose: v }))} options={VOUCHER_PURPOSE_OPTIONS} />}
              {!isPartner && <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Cửa hàng</Label>
                <Input className="w-40" placeholder="Tên cửa hàng" value={detFilters.storeName} onChange={(e) => setDetFilters((p) => ({ ...p, storeName: e.target.value }))} />
              </div>}
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                <Input type="date" className="w-40" value={detFilters.fromDate} onChange={(e) => setDetFilters((p) => ({ ...p, fromDate: e.target.value }))} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Đến ngày</Label>
                <Input type="date" className="w-40" value={detFilters.toDate} onChange={(e) => setDetFilters((p) => ({ ...p, toDate: e.target.value }))} />
              </div>
              <Button size="sm" onClick={() => { setDetPage(0); setDetSearchTrigger((p) => p + 1); }}><Search className="mr-2 h-4 w-4" />Tìm kiếm</Button>
              {hasDetFilters && (
                <Button variant="ghost" size="sm" onClick={clearDetFilters}>
                  <X className="mr-1 h-4 w-4" />Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Details Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã voucher</TableHead>
                  <TableHead>Tên voucher</TableHead>
                  <TableHead>Loại giảm</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chưa có voucher detail nào
                    </TableCell>
                  </TableRow>
                ) : (
                  details.map((d) => (
                    <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewVoucherDetail(d)}>
                      <TableCell className="font-mono text-sm">{d.voucherCode}</TableCell>
                      <TableCell>{d.voucherName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{d.discountType === "FIXED" ? "Cố định" : "Phần trăm"}</Badge>
                      </TableCell>
                      <TableCell>{formatDiscountValue(d.discountType, d.discountValue)}</TableCell>
                      <TableCell>{d.availableStock}/{d.totalStock}</TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(d.startDate)} – {formatDateTime(d.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={VOUCHER_STATUS_MAP[d.status]?.variant || "secondary"}>
                          {VOUCHER_STATUS_MAP[d.status]?.label || d.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Pagination currentPage={detPage + 1} totalPages={detTotalPages} onPageChange={(p) => setDetPage(p - 1)} />
          </TabsContent>
        </Tabs>

        {/* =============================================================== */}
        {/*  Create Voucher Dialog                                          */}
        {/* =============================================================== */}
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
                  {!isPartner && (
                    <div className="grid gap-2">
                      <Label>Hạng khách hàng</Label>
                      <Select value={form.customerTier} onValueChange={(v) => setForm((p) => ({ ...p, customerTier: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CUSTOMER_TIERS_FORM.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{form.discountType === "FIXED" ? "Số tiền giảm (VNĐ) *" : "Phần trăm giảm (%) *"}</Label>
                    <Input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid gap-2">
                    <Label>Tổng số lượng *</Label>
                    <Input type="number" value={form.totalStock} onChange={(e) => setForm((p) => ({ ...p, totalStock: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Giới hạn thu thập/người</Label>
                    <Input type="number" value={form.maxCollect} onChange={(e) => setForm((p) => ({ ...p, maxCollect: e.target.value }))} />
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Ngày bắt đầu *</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ngày kết thúc *</Label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
                  <Button onClick={handleCreateSingle} disabled={saving || !form.voucherName || !form.discountValue || !form.totalStock || !form.startDate || !form.endDate}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Tạo
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
                          Tải template {excelDiscountType} (.xlsx)
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
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* =============================================================== */}
        {/*  Action Confirm Dialog                                          */}
        {/* =============================================================== */}
        <AlertDialog
          open={!!actionType}
          onOpenChange={(open) => {
            if (!open) { setActionType(null); setActionVoucher(null); setRejectReason(""); }
          }}
        >
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

            {actionType === "reject" && (
              <div className="grid gap-2 py-2">
                <Label>Lý do từ chối</Label>
                <Textarea
                  placeholder="Nhập lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAction}
                disabled={saving}
                className={
                  actionType === "reject" || actionType === "cancel"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }
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

        {/* Request Detail Dialog */}
        <Dialog open={reqDetailOpen} onOpenChange={setReqDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết Voucher Request</DialogTitle>
              <DialogDescription>Thông tin request và danh sách voucher</DialogDescription>
            </DialogHeader>
            {reqDetailData && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div><Label className="text-xs text-muted-foreground">Request ID</Label><p className="text-sm font-mono">{String(reqDetailData.requestId || "—")}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Loại</Label><p className="text-sm"><Badge variant="outline">{reqDetailData.requestMode === "SINGLE" ? "Đơn lẻ" : "Excel"}</Badge></p></div>
                  <div><Label className="text-xs text-muted-foreground">Nguồn</Label><p className="text-sm">{reqDetailData.creatorType === "SYSTEM" ? "Hệ thống" : "Đối tác"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Trạng thái</Label><p className="text-sm"><Badge variant={STATUS_MAP[String(reqDetailData.status)]?.variant || "secondary"}>{STATUS_MAP[String(reqDetailData.status)]?.label || String(reqDetailData.status)}</Badge></p></div>
                  <div><Label className="text-xs text-muted-foreground">Cửa hàng</Label><p className="text-sm">{String(reqDetailData.storeName || "—")}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Tổng voucher</Label><p className="text-sm">{String(reqDetailData.totalVoucher || 0)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Người tạo</Label><p className="text-sm">{String(reqDetailData.createdBy || "—")}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Ngày tạo</Label><p className="text-sm">{reqDetailData.createdTime ? formatDateTime(String(reqDetailData.createdTime)) : "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Người duyệt</Label><p className="text-sm">{String(reqDetailData.confirmedBy || "—")}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Ngày duyệt</Label><p className="text-sm">{reqDetailData.confirmedTime ? formatDateTime(String(reqDetailData.confirmedTime)) : "—"}</p></div>
                  {reqDetailData.reason ? <div className="col-span-2"><Label className="text-xs text-muted-foreground">Lý do</Label><p className="text-sm text-destructive">{String(reqDetailData.reason)}</p></div> : null}
                </div>

                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Danh sách Voucher</Label>
                  {reqDetailLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : reqDetailVouchers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">Chưa có voucher detail</p>
                  ) : (
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Mã voucher</TableHead><TableHead>Tên</TableHead><TableHead>Loại giảm</TableHead><TableHead>Giá trị</TableHead><TableHead>Tồn kho</TableHead><TableHead>Trạng thái</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {reqDetailVouchers.map((rv) => (
                          <TableRow key={rv.id}>
                            <TableCell className="font-mono text-sm">{rv.voucherCode}</TableCell>
                            <TableCell>{rv.voucherName}</TableCell>
                            <TableCell><Badge variant="outline">{rv.discountType === "FIXED" ? "Cố định" : "Phần trăm"}</Badge></TableCell>
                            <TableCell>{formatDiscountValue(rv.discountType, rv.discountValue)}</TableCell>
                            <TableCell>{rv.availableStock}/{rv.totalStock}</TableCell>
                            <TableCell><Badge variant={VOUCHER_STATUS_MAP[rv.status]?.variant || "secondary"}>{VOUCHER_STATUS_MAP[rv.status]?.label || rv.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Voucher Detail Dialog */}
        <Dialog open={voucherDetailOpen} onOpenChange={setVoucherDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chi tiết Voucher</DialogTitle>
              <DialogDescription>{selectedVoucherDetail?.voucherCode}</DialogDescription>
            </DialogHeader>
            {selectedVoucherDetail && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-2">
                <div><Label className="text-xs text-muted-foreground">Mã voucher</Label><p className="text-sm font-mono">{selectedVoucherDetail.voucherCode}</p></div>
                <div><Label className="text-xs text-muted-foreground">Request ID</Label><p className="text-sm font-mono">{selectedVoucherDetail.requestId}</p></div>
                <div className="col-span-2"><Label className="text-xs text-muted-foreground">Tên voucher</Label><p className="text-sm font-medium">{selectedVoucherDetail.voucherName}</p></div>
                <div className="col-span-2"><Label className="text-xs text-muted-foreground">Mô tả</Label><p className="text-sm">{selectedVoucherDetail.description}</p></div>
                <div><Label className="text-xs text-muted-foreground">Loại giảm</Label><p className="text-sm"><Badge variant="outline">{selectedVoucherDetail.discountType === "FIXED" ? "Cố định" : "Phần trăm"}</Badge></p></div>
                <div><Label className="text-xs text-muted-foreground">Giá trị</Label><p className="text-sm">{formatDiscountValue(selectedVoucherDetail.discountType, selectedVoucherDetail.discountValue)}</p></div>
                {selectedVoucherDetail.maxDiscount != null && <div><Label className="text-xs text-muted-foreground">Giảm tối đa</Label><p className="text-sm">{new Intl.NumberFormat("vi-VN").format(selectedVoucherDetail.maxDiscount)}đ</p></div>}
                {selectedVoucherDetail.minOrderValue != null && <div><Label className="text-xs text-muted-foreground">Đơn tối thiểu</Label><p className="text-sm">{new Intl.NumberFormat("vi-VN").format(selectedVoucherDetail.minOrderValue)}đ</p></div>}
                <div><Label className="text-xs text-muted-foreground">Hạng KH</Label><p className="text-sm">{selectedVoucherDetail.customerTier}</p></div>
                <div><Label className="text-xs text-muted-foreground">Giới hạn thu thập</Label><p className="text-sm">{selectedVoucherDetail.maxCollect}</p></div>
                <div><Label className="text-xs text-muted-foreground">Tồn kho</Label><p className="text-sm">{selectedVoucherDetail.availableStock}/{selectedVoucherDetail.totalStock}</p></div>
                <div><Label className="text-xs text-muted-foreground">Trạng thái</Label><p className="text-sm"><Badge variant={VOUCHER_STATUS_MAP[selectedVoucherDetail.status]?.variant || "secondary"}>{VOUCHER_STATUS_MAP[selectedVoucherDetail.status]?.label || selectedVoucherDetail.status}</Badge></p></div>
                <div><Label className="text-xs text-muted-foreground">Bắt đầu</Label><p className="text-sm">{formatDateTime(selectedVoucherDetail.startDate)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Kết thúc</Label><p className="text-sm">{formatDateTime(selectedVoucherDetail.endDate)}</p></div>
                {selectedVoucherDetail.errorMessage && <div className="col-span-2"><Label className="text-xs text-muted-foreground">Lỗi</Label><p className="text-sm text-destructive">{selectedVoucherDetail.errorMessage}</p></div>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
