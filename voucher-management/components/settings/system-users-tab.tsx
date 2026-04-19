"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { systemUserService } from "@/lib/api/services/systemUserService";
import { useToast } from "@/hooks/use-toast";
import type { KeycloakUser } from "@/lib/types";

export default function SystemUsersTab() {
  const { toast } = useToast();

  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<KeycloakUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<KeycloakUser | null>(null);
  const [resetPwUser, setResetPwUser] = useState<KeycloakUser | null>(null);

  // form
  const [formData, setFormData] = useState({
    username: "", email: "", firstName: "", lastName: "",
    password: "", enabled: true, role: "MAKER" as string,
  });

  const resetForm = () =>
    setFormData({ username: "", email: "", firstName: "", lastName: "", password: "", enabled: true, role: "MAKER" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await systemUserService.listUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await systemUserService.createUser({
        username: formData.username, email: formData.email || undefined,
        firstName: formData.firstName || undefined, lastName: formData.lastName || undefined,
        password: formData.password, enabled: formData.enabled, role: formData.role,
      });
      toast({ title: "Thành công", description: "Đã tạo người dùng" });
      setCreateOpen(false); resetForm(); await fetchData();
    } catch {
      toast({ title: "Lỗi", description: "Không thể tạo người dùng", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      setSaving(true);
      await systemUserService.updateUser(editUser.id, {
        email: formData.email || undefined, firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined, enabled: formData.enabled,
      });
      toast({ title: "Thành công", description: "Đã cập nhật người dùng" });
      setEditUser(null); resetForm(); await fetchData();
    } catch {
      toast({ title: "Lỗi", description: "Không thể cập nhật người dùng", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      setSaving(true);
      await systemUserService.deleteUser(deleteUser.id);
      toast({ title: "Thành công", description: "Đã xoá người dùng" });
      setDeleteUser(null); await fetchData();
    } catch {
      toast({ title: "Lỗi", description: "Không thể xoá người dùng", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleResetPassword = async () => {
    if (!resetPwUser) return;
    try {
      setSaving(true);
      await systemUserService.resetPassword(resetPwUser.id, formData.password);
      toast({ title: "Thành công", description: "Đã đặt lại mật khẩu" });
      setResetPwUser(null); setFormData((p) => ({ ...p, password: "" }));
    } catch {
      toast({ title: "Lỗi", description: "Không thể đặt lại mật khẩu", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const openEdit = (u: KeycloakUser) => {
    setFormData({ username: u.username, email: u.email ?? "", firstName: u.firstName ?? "", lastName: u.lastName ?? "", password: "", enabled: u.enabled, role: "MAKER" });
    setEditUser(u);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quản lý người dùng hệ thống</h3>
        <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.username}</TableCell>
              <TableCell>{[u.lastName, u.firstName].filter(Boolean).join(" ") || "—"}</TableCell>
              <TableCell>{u.email || "—"}</TableCell>
              <TableCell>
                <Badge variant={u.enabled ? "default" : "secondary"}>{u.enabled ? "Hoạt động" : "Vô hiệu"}</Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { setFormData((p) => ({ ...p, password: "" })); setResetPwUser(u); }} title="Đặt lại mật khẩu"><KeyRound className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteUser(u)} title="Xoá"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Chưa có người dùng nào</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo người dùng mới</DialogTitle><DialogDescription>Nhập thông tin người dùng hệ thống mới</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="create-username">Username *</Label><Input id="create-username" value={formData.username} onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))} /></div>
            <div className="grid gap-2"><Label htmlFor="create-email">Email</Label><Input id="create-email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="create-lastName">Họ</Label><Input id="create-lastName" value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} /></div>
              <div className="grid gap-2"><Label htmlFor="create-firstName">Tên</Label><Input id="create-firstName" value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="create-password">Mật khẩu *</Label><Input id="create-password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} /></div>
            <div className="grid gap-2">
              <Label>Vai trò *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MAKER">Maker</SelectItem>
                  <SelectItem value="CHECKER">Checker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formData.enabled} onCheckedChange={(v) => setFormData((p) => ({ ...p, enabled: v }))} /><Label>Kích hoạt</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Huỷ</Button>
            <Button onClick={handleCreate} disabled={saving || !formData.username || !formData.password}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa người dùng</DialogTitle><DialogDescription>Cập nhật thông tin cho {editUser?.username}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="edit-email">Email</Label><Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label htmlFor="edit-lastName">Họ</Label><Input id="edit-lastName" value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} /></div>
              <div className="grid gap-2"><Label htmlFor="edit-firstName">Tên</Label><Input id="edit-firstName" value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formData.enabled} onCheckedChange={(v) => setFormData((p) => ({ ...p, enabled: v }))} /><Label>Kích hoạt</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Huỷ</Button>
            <Button onClick={handleUpdate} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={!!resetPwUser} onOpenChange={(open) => { if (!open) setResetPwUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Đặt lại mật khẩu</DialogTitle><DialogDescription>Nhập mật khẩu mới cho {resetPwUser?.username}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="reset-password">Mật khẩu mới *</Label><Input id="reset-password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwUser(null)}>Huỷ</Button>
            <Button onClick={handleResetPassword} disabled={saving || !formData.password}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Đặt lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn xoá người dùng <strong>{deleteUser?.username}</strong>? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
