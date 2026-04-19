"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { systemUserService } from "@/lib/api/services/systemUserService";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { KeycloakUser } from "@/lib/types";

const MERCHANT_CATEGORIES = [
  { value: "FOOD", label: "Ẩm thực" },
  { value: "BEVERAGE", label: "Đồ uống" },
  { value: "FASHION", label: "Thời trang" },
  { value: "ELECTRONICS", label: "Điện tử" },
  { value: "BEAUTY", label: "Làm đẹp" },
  { value: "HEALTH", label: "Sức khỏe" },
  { value: "EDUCATION", label: "Giáo dục" },
  { value: "ENTERTAINMENT", label: "Giải trí" },
  { value: "TRAVEL", label: "Du lịch" },
  { value: "OTHER", label: "Khác" },
];

export default function PartnersPage() {
  const { toast } = useToast();
  const [merchants, setMerchants] = useState<KeycloakUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: "", password: "", email: "", firstName: "", lastName: "",
    storeName: "", phone: "", category: "FOOD",
  });

  const resetForm = () => setForm({
    username: "", password: "", email: "", firstName: "", lastName: "",
    storeName: "", phone: "", category: "FOOD",
  });

  useEffect(() => {
    loadMerchants();
  }, [page, search]);

  async function loadMerchants() {
    setLoading(true);
    try {
      const data = await systemUserService.listUsers();
      // Filter chỉ lấy merchants (có storeName)
      const allUsers = Array.isArray(data) ? data : [];
      const filtered = allUsers.filter((u: KeycloakUser) => u.storeName);
      const searched = search
        ? filtered.filter((u: KeycloakUser) =>
            u.storeName?.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
          )
        : filtered;
      setMerchants(searched);
      setTotalPages(Math.max(1, Math.ceil(searched.length / 10)));
    } catch {
      setMerchants([]);
    }
    setLoading(false);
  }

  const handleCreate = async () => {
    setSaving(true);
    try {
      await systemUserService.createUser({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        role: "MERCHANT",
        storeName: form.storeName,
        phone: form.phone || undefined,
        category: form.category,
      });
      toast({ title: "Thành công", description: "Đã tạo đối tác" });
      setCreateOpen(false);
      resetForm();
      await loadMerchants();
    } catch {
      toast({ title: "Lỗi", description: "Không thể tạo đối tác", variant: "destructive" });
    }
    setSaving(false);
  };

  const paginatedMerchants = merchants.slice((page - 1) * 10, page * 10);

  return (
    <AuthGuard pageKey="partners">
      <div className="space-y-4">
        <PageHeader title="Quản lý Đối tác" description="Quản lý thông tin đối tác">
          <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Thêm đối tác
          </Button>
        </PageHeader>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm đối tác..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên cửa hàng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : paginatedMerchants.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có đối tác nào</TableCell></TableRow>
            ) : paginatedMerchants.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.storeName || "—"}</TableCell>
                <TableCell>{m.email || "—"}</TableCell>
                <TableCell>{m.phone || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {MERCHANT_CATEGORIES.find((c) => c.value === m.category)?.label || m.category || "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={m.status === "LOCKED" ? "secondary" : "default"}>
                    {m.status === "LOCKED" ? "Đã khóa" : "Hoạt động"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Create merchant dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thêm đối tác mới</DialogTitle>
              <DialogDescription>Tạo tài khoản đối tác (Merchant)</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="m-username">Username *</Label>
                  <Input id="m-username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-password">Mật khẩu *</Label>
                  <Input id="m-password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-email">Email *</Label>
                <Input id="m-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="m-lastName">Họ</Label>
                  <Input id="m-lastName" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-firstName">Tên</Label>
                  <Input id="m-firstName" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="m-storeName">Tên cửa hàng *</Label>
                <Input id="m-storeName" value={form.storeName} onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="m-phone">Số điện thoại</Label>
                  <Input id="m-phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Thể loại *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Chọn thể loại" /></SelectTrigger>
                    <SelectContent>
                      {MERCHANT_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
              <Button onClick={handleCreate} disabled={saving || !form.username || !form.password || !form.storeName}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
