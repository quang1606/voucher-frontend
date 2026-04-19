"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { AuthGuard } from "@/components/auth-guard";
import SystemUsersTab from "@/components/settings/system-users-tab";
import RoleManagementTab from "@/components/settings/role-management-tab";
import { useRoles } from "@/hooks/use-roles";
import { useAuthStore } from "@/lib/auth";
import { profileService } from "@/lib/api/services/profileService";
import { useToast } from "@/hooks/use-toast";

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

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  storeName?: string;
  phone?: string;
  category?: string;
}

function ProfileTab() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    firstName: "", lastName: "", email: "",
    storeName: "", phone: "", category: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await profileService.getProfile();
        const profile = res.data || res;
        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          storeName: profile.storeName || "",
          phone: profile.phone || "",
          category: profile.category || "",
        });
        setIsMerchant(!!profile.storeName || !!profile.category);
      } catch {
        // Fallback: đọc từ JWT token nếu Identity Service chưa sẵn sàng
        if (user) {
          const nameParts = (user.name || "").split(" ");
          setForm((p) => ({
            ...p,
            firstName: nameParts.slice(1).join(" ") || "",
            lastName: nameParts[0] || "",
            email: user.email || "",
          }));
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        ...(isMerchant ? { storeName: form.storeName, phone: form.phone } : {}),
      });
      toast({ title: "Thành công", description: "Đã cập nhật thông tin" });
    } catch {
      toast({ title: "Lỗi", description: "Không thể cập nhật", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) return <Card><CardContent className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader><CardTitle>Thông tin cá nhân</CardTitle><CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Họ</Label><Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Tên</Label><Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} /></div>
        </div>
        <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
        {isMerchant && (
          <>
            <div className="space-y-2"><Label>Tên cửa hàng</Label><Input value={form.storeName} onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Số điện thoại</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Thể loại</Label>
                <Select value={form.category} disabled>
                  <SelectTrigger><SelectValue placeholder="Thể loại" /></SelectTrigger>
                  <SelectContent>
                    {MERCHANT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
        <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Lưu thay đổi</Button>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" }); return; }
    setSaving(true);
    try { await profileService.updateProfile({ currentPassword: currentPw, newPassword: newPw }); toast({ title: "Thành công", description: "Đã đổi mật khẩu" }); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    catch { toast({ title: "Lỗi", description: "Không thể đổi mật khẩu", variant: "destructive" }); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Bảo mật</CardTitle><CardDescription>Đổi mật khẩu tài khoản</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Mật khẩu hiện tại</Label><Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} /></div>
        <div className="space-y-2"><Label>Mật khẩu mới</Label><Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
        <div className="space-y-2"><Label>Xác nhận mật khẩu mới</Label><Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} /></div>
        <Button onClick={handleChangePw} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Đổi mật khẩu</Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { isAdmin } = useRoles();
  return (
    <AuthGuard pageKey="settings">
      <div className="space-y-6">
        <PageHeader title="Cài đặt" description="Quản lý tài khoản và hệ thống" />
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Thông tin</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">Người dùng</TabsTrigger>}
            {isAdmin && <TabsTrigger value="roles">Quản lý Role</TabsTrigger>}
          </TabsList>
          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="security"><SecurityTab /></TabsContent>
          {isAdmin && <TabsContent value="users"><SystemUsersTab /></TabsContent>}
          {isAdmin && <TabsContent value="roles"><RoleManagementTab /></TabsContent>}
        </Tabs>
      </div>
    </AuthGuard>
  );
}
