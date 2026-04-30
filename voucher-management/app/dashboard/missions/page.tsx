"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Loader2, Send, CheckCircle, XCircle, Ban, X, Eye, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { missionService } from "@/lib/api/services/missionService";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { Mission } from "@/lib/types";

/* ========================================================================= */
/*  Constants                                                                */
/* ========================================================================= */

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  INIT: { label: "Khởi tạo", variant: "secondary" },
  PENDING_APPROVE: { label: "Chờ duyệt", variant: "outline" },
  APPROVED: { label: "Đã duyệt", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
  FAILED: { label: "Thất bại", variant: "destructive" },
  FINISH: { label: "Hoàn thành", variant: "default" },
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "INIT", label: "Khởi tạo" },
  { value: "PENDING_APPROVE", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "FAILED", label: "Thất bại" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FINISH", label: "Hoàn thành" },
];

const REWARD_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại thưởng" },
  { value: "POINT", label: "Điểm" },
  { value: "VOUCHER", label: "Voucher" },
];

/* ========================================================================= */
/*  Create form                                                              */
/* ========================================================================= */

interface CreateForm {
  missionName: string;
  missionDescription: string;
  targetValue: string;
  rewardType: string;
  rewardValue: string;
  partnerId: string;
  missionStartDate: string;
  missionEndDate: string;
  // Voucher fields
  voucherName: string;
  voucherDescription: string;
  discountType: string;
  discountValue: string;
  maxDiscount: string;
  minOrderValue: string;
  totalStock: string;
  maxCollect: string;
  voucherStartDate: string;
  voucherEndDate: string;
}

const defaultForm: CreateForm = {
  missionName: "", missionDescription: "", targetValue: "",
  rewardType: "POINT", rewardValue: "", partnerId: "",
  missionStartDate: "", missionEndDate: "",
  voucherName: "", voucherDescription: "", discountType: "FIXED",
  discountValue: "", maxDiscount: "", minOrderValue: "",
  totalStock: "", maxCollect: "1", voucherStartDate: "", voucherEndDate: "",
};

/* ========================================================================= */
/*  Helpers                                                                  */
/* ========================================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
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

export default function MissionsPage() {
  const { toast } = useToast();

  // --- List state ---
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    nameStore: "", rewardType: "all", taskStatus: "all",
  });

  // --- Shared state ---
  const [saving, setSaving] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(defaultForm);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMission, setDetailMission] = useState<Record<string, unknown> | null>(null);

  // Action dialogs
  const [actionMission, setActionMission] = useState<Mission | null>(null);
  const [actionType, setActionType] = useState<"submit" | "approve" | "reject" | "cancel" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  /* ----------------------------------------------------------------------- */
  /*  Data fetching                                                          */
  /* ----------------------------------------------------------------------- */

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 20 };
      if (filters.nameStore) params.nameStore = filters.nameStore;
      if (filters.rewardType !== "all") params.rewardType = filters.rewardType;
      if (filters.taskStatus !== "all") params.taskStatus = filters.taskStatus;
      const res = await missionService.search(params);
      // Response: { data: { data: [...], totalElements, totalPages, page, size } }
      // or { status, code, data: { data: [...] } }
      const payload = res?.data?.data ? res.data : res;
      setMissions(payload.data || []);
      setTotalPages(payload.totalPages || 1);
    } catch {
      setMissions([]);
    }
    setLoading(false);
  }, [page, searchTrigger]);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  /* ----------------------------------------------------------------------- */
  /*  Handlers                                                               */
  /* ----------------------------------------------------------------------- */

  const handleCreate = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        missionName: form.missionName,
        missionDescription: form.missionDescription,
        targetValue: Number(form.targetValue),
        rewardType: form.rewardType,
        rewardValue: form.rewardValue,
        missionStartDate: form.missionStartDate,
        missionEndDate: form.missionEndDate,
      };
      if (form.rewardType === "VOUCHER") {
        body.voucherName = form.voucherName;
        body.voucherDescription = form.voucherDescription;
        body.discountType = form.discountType;
        body.discountValue = Number(form.discountValue);
        body.maxDiscount = form.maxDiscount ? Number(form.maxDiscount) : null;
        body.minOrderValue = form.minOrderValue ? Number(form.minOrderValue) : null;
        body.totalStock = Number(form.totalStock);
        body.maxCollect = form.maxCollect ? Number(form.maxCollect) : null;
        body.voucherStartDate = form.voucherStartDate;
        body.voucherEndDate = form.voucherEndDate;
      }
      await missionService.create(body);
      toast({ title: "Thành công", description: "Đã tạo mission" });
      setCreateOpen(false);
      setForm(defaultForm);
      await fetchMissions();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Không thể tạo mission", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleViewDetail = async (mission: Mission) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await missionService.getById(mission.missionId);
      // Response: { data: { mission: {...}, voucherDetail: {...} } }
      const payload = res?.data || res;
      // Nếu có .mission thì dùng, nếu không thì payload chính là mission
      const missionData = payload.mission || payload;
      setDetailMission({ ...missionData, voucherDetail: payload.voucherDetail || null });
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải chi tiết mission", variant: "destructive" });
      setDetailOpen(false);
    }
    setDetailLoading(false);
  };

  const handleAction = async () => {
    if (!actionMission || !actionType) return;
    setSaving(true);
    try {
      switch (actionType) {
        case "submit":
          await missionService.submit(actionMission.missionId);
          break;
        case "approve":
          await missionService.confirm(actionMission.missionId, "APPROVED");
          break;
        case "reject":
          await missionService.confirm(actionMission.missionId, "REJECTED", rejectReason || undefined);
          break;
        case "cancel":
          await missionService.cancel(actionMission.missionId);
          break;
      }
      const messages = { submit: "Đã gửi duyệt", approve: "Đã duyệt", reject: "Đã từ chối", cancel: "Đã hủy" };
      toast({ title: "Thành công", description: messages[actionType] });
      setActionMission(null);
      setActionType(null);
      setRejectReason("");
      await fetchMissions();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({ title: "Lỗi", description: err?.response?.data?.message || "Thao tác thất bại", variant: "destructive" });
    }
    setSaving(false);
  };

  const openAction = (m: Mission, type: "submit" | "approve" | "reject" | "cancel") => {
    setActionMission(m);
    setActionType(type);
    setRejectReason("");
  };

  const clearFilters = () => {
    setFilters({ nameStore: "", rewardType: "all", taskStatus: "all" });
    setPage(0);
    setSearchTrigger((p) => p + 1);
  };

  const hasFilters = filters.nameStore !== "" || filters.rewardType !== "all" || filters.taskStatus !== "all";

  /* ----------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ----------------------------------------------------------------------- */

  return (
    <AuthGuard pageKey="missions">
      <div className="space-y-4">
        <PageHeader title="Quản lý Mission" description="Tạo và quản lý mission">
          <Button onClick={() => { setForm(defaultForm); setCreateOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Tạo mission
          </Button>
        </PageHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Tên cửa hàng</Label>
            <Input
              className="w-44"
              placeholder="Tìm theo tên..."
              value={filters.nameStore}
              onChange={(e) => setFilters((p) => ({ ...p, nameStore: e.target.value }))}
            />
          </div>
          <SelectFilter
            label="Loại thưởng"
            value={filters.rewardType}
            onChange={(v) => setFilters((p) => ({ ...p, rewardType: v }))}
            options={REWARD_TYPE_OPTIONS}
          />
          <SelectFilter
            label="Trạng thái"
            value={filters.taskStatus}
            onChange={(v) => setFilters((p) => ({ ...p, taskStatus: v }))}
            options={STATUS_OPTIONS}
          />
          <Button size="sm" onClick={() => { setPage(0); setSearchTrigger((p) => p + 1); }}><Search className="mr-2 h-4 w-4" />Tìm kiếm</Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Missions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên mission</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Mục tiêu</TableHead>
              <TableHead>Loại thưởng</TableHead>
              <TableHead>Giá trị thưởng</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : missions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Chưa có mission nào
                </TableCell>
              </TableRow>
            ) : (
              missions.map((m) => (
                <TableRow
                  key={m.missionId}
                  className="cursor-pointer"
                  onClick={() => handleViewDetail(m)}
                >
                  <TableCell className="font-medium">{m.missionName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{m.missionDescription}</TableCell>
                  <TableCell>{formatNumber(m.targetValue)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {m.rewardType === "POINT" ? "Điểm" : "Voucher"}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.rewardValue}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(m.startDate)} – {formatDateTime(m.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_MAP[m.status]?.variant || "secondary"}>
                      {STATUS_MAP[m.status]?.label || m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetail(m)} title="Xem chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {m.status === "INIT" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openAction(m, "submit")} title="Gửi duyệt">
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openAction(m, "cancel")} title="Hủy">
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    {m.status === "PENDING_APPROVE" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openAction(m, "approve")} title="Duyệt">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openAction(m, "reject")} title="Từ chối">
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
        <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />

        {/* =============================================================== */}
        {/*  Create Mission Dialog                                          */}
        {/* =============================================================== */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Mission</DialogTitle>
              <DialogDescription>Nhập thông tin mission mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên mission *</Label>
                <Input
                  value={form.missionName}
                  onChange={(e) => setForm((p) => ({ ...p, missionName: e.target.value }))}
                  placeholder="VD: Mua hàng tích điểm"
                />
              </div>
              <div className="grid gap-2">
                <Label>Mô tả *</Label>
                <Textarea
                  value={form.missionDescription}
                  onChange={(e) => setForm((p) => ({ ...p, missionDescription: e.target.value }))}
                  placeholder="Mô tả mission"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{form.rewardType === "POINT" ? "Mục tiêu (số lần) *" : "Mục tiêu (VNĐ) *"}</Label>
                  <Input
                    type="number"
                    value={form.targetValue}
                    onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                    placeholder={form.rewardType === "POINT" ? "VD: 5" : "VD: 100000"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Loại thưởng *</Label>
                  <Select value={form.rewardType} onValueChange={(v) => setForm((p) => ({ ...p, rewardType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POINT">Điểm (Point)</SelectItem>
                      <SelectItem value="VOUCHER">Voucher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.rewardType === "POINT" && (
                <div className="grid gap-2">
                  <Label>Giá trị thưởng (điểm) *</Label>
                  <Input
                    value={form.rewardValue}
                    onChange={(e) => setForm((p) => ({ ...p, rewardValue: e.target.value }))}
                    placeholder="VD: 500"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ngày bắt đầu *</Label>
                  <Input
                    type="datetime-local"
                    value={form.missionStartDate}
                    onChange={(e) => setForm((p) => ({ ...p, missionStartDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Ngày kết thúc *</Label>
                  <Input
                    type="datetime-local"
                    value={form.missionEndDate}
                    onChange={(e) => setForm((p) => ({ ...p, missionEndDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Voucher fields — only shown when rewardType is VOUCHER */}
              {form.rewardType === "VOUCHER" && (
                <>
                  <div className="border-t pt-4 mt-2">
                    <Label className="text-base font-semibold">Thông tin Voucher</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tên voucher *</Label>
                    <Input
                      value={form.voucherName}
                      onChange={(e) => setForm((p) => ({ ...p, voucherName: e.target.value }))}
                      placeholder="VD: Giảm 50K"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mô tả voucher</Label>
                    <Textarea
                      value={form.voucherDescription}
                      onChange={(e) => setForm((p) => ({ ...p, voucherDescription: e.target.value }))}
                      placeholder="Mô tả voucher"
                      rows={2}
                    />
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
                      <Label>{form.discountType === "FIXED" ? "Số tiền giảm (VNĐ) *" : "Phần trăm giảm (%) *"}</Label>
                      <Input
                        type="number"
                        value={form.discountValue}
                        onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {form.discountType === "PERCENT" ? (
                      <div className="grid gap-2">
                        <Label>Giảm tối đa (VNĐ)</Label>
                        <Input
                          type="number"
                          value={form.maxDiscount}
                          onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label>Giá trị đơn tối thiểu (VNĐ)</Label>
                        <Input
                          type="number"
                          value={form.minOrderValue}
                          onChange={(e) => setForm((p) => ({ ...p, minOrderValue: e.target.value }))}
                        />
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label>Tổng số lượng *</Label>
                      <Input
                        type="number"
                        value={form.totalStock}
                        onChange={(e) => setForm((p) => ({ ...p, totalStock: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Giới hạn thu thập/người</Label>
                      <Input
                        type="number"
                        value={form.maxCollect}
                        onChange={(e) => setForm((p) => ({ ...p, maxCollect: e.target.value }))}
                      />
                    </div>
                    <div />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Voucher bắt đầu *</Label>
                      <Input
                        type="datetime-local"
                        value={form.voucherStartDate}
                        onChange={(e) => setForm((p) => ({ ...p, voucherStartDate: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Voucher kết thúc *</Label>
                      <Input
                        type="datetime-local"
                        value={form.voucherEndDate}
                        onChange={(e) => setForm((p) => ({ ...p, voucherEndDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
              <Button
                onClick={handleCreate}
                disabled={
                  saving
                  || !form.missionName
                  || !form.targetValue
                  || (form.rewardType === "POINT" && !form.rewardValue)
                  || !form.missionStartDate
                  || !form.missionEndDate
                  || (form.rewardType === "VOUCHER" && (!form.voucherName || !form.discountValue || !form.totalStock || !form.voucherStartDate || !form.voucherEndDate))
                }
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =============================================================== */}
        {/*  Mission Detail Dialog                                          */}
        {/* =============================================================== */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết Mission</DialogTitle>
              <DialogDescription>Thông tin chi tiết mission và voucher</DialogDescription>
            </DialogHeader>
            {detailLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : detailMission ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tên mission</Label>
                    <p className="text-sm font-medium">{String(detailMission.missionName || "—")}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Request ID</Label>
                    <p className="text-sm font-mono">{String(detailMission.requestId || "—")}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Mô tả</Label>
                    <p className="text-sm">{String(detailMission.missionDescription || "—")}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Mục tiêu</Label>
                    <p className="text-sm">{detailMission.targetValue != null ? formatNumber(Number(detailMission.targetValue)) : "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Loại thưởng</Label>
                    <p className="text-sm">
                      <Badge variant="outline">
                        {detailMission.rewardType === "POINT" ? "Điểm" : detailMission.rewardType === "VOUCHER" ? "Voucher" : String(detailMission.rewardType || "—")}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Giá trị thưởng</Label>
                    <p className="text-sm">{String(detailMission.rewardValue || "—")}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Partner ID</Label>
                    <p className="text-sm">{detailMission.partnerId != null ? String(detailMission.partnerId) : "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ngày bắt đầu</Label>
                    <p className="text-sm">{detailMission.startDate ? formatDateTime(String(detailMission.startDate)) : "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ngày kết thúc</Label>
                    <p className="text-sm">{detailMission.endDate ? formatDateTime(String(detailMission.endDate)) : "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                    <p className="text-sm">
                      <Badge variant={STATUS_MAP[String(detailMission.status)]?.variant || "secondary"}>
                        {STATUS_MAP[String(detailMission.status)]?.label || String(detailMission.status || "—")}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ngày tạo</Label>
                    <p className="text-sm">{detailMission.createdDate ? formatDateTime(String(detailMission.createdDate)) : "—"}</p>
                  </div>
                </div>

                {/* Voucher detail section */}
                {detailMission.rewardType === "VOUCHER" && (
                  <>
                    <div className="border-t pt-4 mt-2">
                      <Label className="text-base font-semibold">Thông tin Voucher</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Tên voucher</Label>
                        <p className="text-sm">{String((detailMission as Record<string, unknown>).voucherName || "—")}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Loại giảm giá</Label>
                        <p className="text-sm">
                          <Badge variant="outline">
                            {(detailMission as Record<string, unknown>).discountType === "FIXED" ? "Cố định" : (detailMission as Record<string, unknown>).discountType === "PERCENT" ? "Phần trăm" : String((detailMission as Record<string, unknown>).discountType || "—")}
                          </Badge>
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Mô tả voucher</Label>
                        <p className="text-sm">{String((detailMission as Record<string, unknown>).voucherDescription || (detailMission as Record<string, unknown>).description || "—")}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Giá trị giảm</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).discountValue != null ? formatNumber(Number((detailMission as Record<string, unknown>).discountValue)) : "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Giảm tối đa</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).maxDiscount != null ? formatNumber(Number((detailMission as Record<string, unknown>).maxDiscount)) : "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Đơn tối thiểu</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).minOrderValue != null ? formatNumber(Number((detailMission as Record<string, unknown>).minOrderValue)) : "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Tổng số lượng</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).totalStock != null ? formatNumber(Number((detailMission as Record<string, unknown>).totalStock)) : "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Giới hạn/người</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).maxCollect != null ? String((detailMission as Record<string, unknown>).maxCollect) : "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Voucher bắt đầu</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).voucherStartDate ? formatDateTime(String((detailMission as Record<string, unknown>).voucherStartDate)) : (detailMission as Record<string, unknown>).startDate ? formatDateTime(String((detailMission as Record<string, unknown>).startDate)) : "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Voucher kết thúc</Label>
                        <p className="text-sm">{(detailMission as Record<string, unknown>).voucherEndDate ? formatDateTime(String((detailMission as Record<string, unknown>).voucherEndDate)) : (detailMission as Record<string, unknown>).endDate ? formatDateTime(String((detailMission as Record<string, unknown>).endDate)) : "—"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =============================================================== */}
        {/*  Action Confirm Dialog                                          */}
        {/* =============================================================== */}
        <AlertDialog
          open={!!actionType}
          onOpenChange={(open) => {
            if (!open) { setActionType(null); setActionMission(null); setRejectReason(""); }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "submit" && "Gửi duyệt mission?"}
                {actionType === "approve" && "Duyệt mission?"}
                {actionType === "reject" && "Từ chối mission?"}
                {actionType === "cancel" && "Hủy mission?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Mission: {actionMission?.missionName}
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
      </div>
    </AuthGuard>
  );
}
