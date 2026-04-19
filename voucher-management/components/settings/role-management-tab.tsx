"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { systemUserService } from "@/lib/api/services/systemUserService";
import { PAGE_REGISTRY, PAGE_ALL } from "@/lib/page-registry";
import { useToast } from "@/hooks/use-toast";
import type { KeycloakRole } from "@/lib/types";

const SYSTEM_ROLES = ["uma_authorization", "offline_access"];

export default function RoleManagementTab() {
  const { toast } = useToast();

  const [roles, setRoles] = useState<KeycloakRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<KeycloakRole | null>(null);
  const [deleteRole, setDeleteRole] = useState<KeycloakRole | null>(null);

  // form
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPages, setFormPages] = useState<string[]>([]);
  const [formAllPages, setFormAllPages] = useState(false);

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormPages([]);
    setFormAllPages(false);
  };

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data: KeycloakRole[] = await systemUserService.listRoles();
      setRoles(
        data.filter(
          (r) => !r.name.startsWith("default-roles-") && !SYSTEM_ROLES.includes(r.name)
        )
      );
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải danh sách vai trò", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ── Helpers ───────────────────────────────────────────
  const getAllowedPages = (role: KeycloakRole): string[] => {
    return role.attributes?.["allowed-pages"] ?? [];
  };

  const renderPageBadges = (role: KeycloakRole) => {
    const pages = getAllowedPages(role);
    if (pages.length === 0) {
      return <span className="text-sm text-muted-foreground">Tất cả trang (mặc định)</span>;
    }
    if (pages.includes(PAGE_ALL)) {
      return <Badge variant="secondary">Tất cả trang</Badge>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {pages.map((p) => {
          const item = PAGE_REGISTRY.find((r) => r.key === p);
          return (
            <Badge key={p} variant="outline">
              {item?.label ?? p}
            </Badge>
          );
        })}
      </div>
    );
  };

  // ── CRUD ──────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      setSaving(true);
      const allowedPages = formAllPages ? [PAGE_ALL] : formPages;
      await systemUserService.createRole({
        name: formName,
        description: formDesc || undefined,
        attributes: allowedPages.length > 0 ? { "allowed-pages": allowedPages } : undefined,
      });
      toast({ title: "Thành công", description: "Đã tạo vai trò" });
      setCreateOpen(false);
      resetForm();
      await fetchRoles();
    } catch {
      toast({ title: "Lỗi", description: "Không thể tạo vai trò", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editRole) return;
    try {
      setSaving(true);
      await systemUserService.updateRole(editRole.name, {
        description: formDesc || undefined,
      });
      const allowedPages = formAllPages ? [PAGE_ALL] : formPages;
      await systemUserService.updateRoleAttributes(editRole.name, allowedPages);
      toast({ title: "Thành công", description: "Đã cập nhật vai trò" });
      setEditRole(null);
      resetForm();
      await fetchRoles();
    } catch {
      toast({ title: "Lỗi", description: "Không thể cập nhật vai trò", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRole) return;
    try {
      setSaving(true);
      await systemUserService.deleteRole(deleteRole.name);
      toast({ title: "Thành công", description: "Đã xoá vai trò" });
      setDeleteRole(null);
      await fetchRoles();
    } catch {
      toast({ title: "Lỗi", description: "Không thể xoá vai trò", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Open edit ─────────────────────────────────────────
  const openEdit = (role: KeycloakRole) => {
    const pages = getAllowedPages(role);
    setFormDesc(role.description ?? "");
    if (pages.includes(PAGE_ALL)) {
      setFormAllPages(true);
      setFormPages([]);
    } else {
      setFormAllPages(false);
      setFormPages(pages);
    }
    setEditRole(role);
  };

  const togglePage = (key: string) => {
    setFormPages((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  // ── Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quản lý vai trò</h3>
        <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Thêm vai trò
        </Button>
      </div>

      {/* ── Roles table ── */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Role</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Quyền truy cập trang</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.name}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description || "—"}</TableCell>
              <TableCell>{renderPageBadges(role)}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(role)} title="Chỉnh sửa">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteRole(role)} title="Xoá">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {roles.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Chưa có vai trò nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ── Create dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo vai trò mới</DialogTitle>
            <DialogDescription>Nhập thông tin vai trò và quyền truy cập trang</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-role-name">Tên vai trò *</Label>
              <Input id="create-role-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-role-desc">Mô tả</Label>
              <Textarea id="create-role-desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid gap-2">
              <Label>Quyền truy cập trang</Label>
              <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                <Checkbox
                  checked={formAllPages}
                  onCheckedChange={(checked) => {
                    setFormAllPages(!!checked);
                    if (checked) setFormPages([]);
                  }}
                />
                <div>
                  <p className="text-sm font-medium">Tất cả trang</p>
                  <p className="text-xs text-muted-foreground">Cho phép truy cập tất cả các trang</p>
                </div>
              </label>
              {PAGE_REGISTRY.map((page) => (
                <label key={page.key} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={formPages.includes(page.key)}
                    disabled={formAllPages}
                    onCheckedChange={() => togglePage(page.key)}
                  />
                  <div>
                    <p className="text-sm font-medium">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
            <Button onClick={handleCreate} disabled={saving || !formName}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editRole} onOpenChange={(open) => { if (!open) setEditRole(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho vai trò {editRole?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-role-desc">Mô tả</Label>
              <Textarea id="edit-role-desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid gap-2">
              <Label>Quyền truy cập trang</Label>
              <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                <Checkbox
                  checked={formAllPages}
                  onCheckedChange={(checked) => {
                    setFormAllPages(!!checked);
                    if (checked) setFormPages([]);
                  }}
                />
                <div>
                  <p className="text-sm font-medium">Tất cả trang</p>
                  <p className="text-xs text-muted-foreground">Cho phép truy cập tất cả các trang</p>
                </div>
              </label>
              {PAGE_REGISTRY.map((page) => (
                <label key={page.key} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={formPages.includes(page.key)}
                    disabled={formAllPages}
                    onCheckedChange={() => togglePage(page.key)}
                  />
                  <div>
                    <p className="text-sm font-medium">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>Huỷ</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteRole} onOpenChange={(open) => { if (!open) setDeleteRole(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá vai trò <strong>{deleteRole?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
