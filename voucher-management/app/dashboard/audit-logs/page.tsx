"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { auditLogService } from "@/lib/api/services/auditLogService";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ userRole: "", userId: "", fromDate: "", toDate: "" });
  const [searchTrigger, setSearchTrigger] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, size: 20 };
      if (filters.userRole) params.userRole = filters.userRole;
      if (filters.userId) params.userId = filters.userId;
      if (filters.fromDate) params.fromDate = `${filters.fromDate}T00:00:00`;
      if (filters.toDate) params.toDate = `${filters.toDate}T23:59:59`;
      const res = await auditLogService.list(params);
      const wrapper = res?.data?.content !== undefined ? res.data : res?.data?.data !== undefined ? res.data : res;
      setLogs(wrapper.content || wrapper.data || []);
      setTotalPages(wrapper.totalPages || 1);
    } catch { setLogs([]); }
    setLoading(false);
  }, [page, searchTrigger]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = () => { setPage(0); setSearchTrigger((p) => p + 1); };
  const hasFilters = filters.userRole || filters.userId || filters.fromDate || filters.toDate;
  const clearFilters = () => { setFilters({ userRole: "", userId: "", fromDate: "", toDate: "" }); setPage(0); setSearchTrigger((p) => p + 1); };

  return (
    <AuthGuard pageKey="audit-logs">
      <div className="space-y-4">
        <PageHeader title="Audit Logs" description="Lịch sử hoạt động hệ thống" />
        <div className="flex flex-wrap gap-3 items-end">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">User Role</Label>
            <Input className="w-40" placeholder="VD: MAKER" value={filters.userRole} onChange={(e) => setFilters((p) => ({ ...p, userRole: e.target.value }))} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">User ID</Label>
            <Input className="w-44" placeholder="VD: admin01" value={filters.userId} onChange={(e) => setFilters((p) => ({ ...p, userId: e.target.value }))} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Từ ngày</Label>
            <Input type="date" className="w-40" value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Đến ngày</Label>
            <Input type="date" className="w-40" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
          </div>
          <Button size="sm" onClick={handleSearch}><Search className="mr-2 h-4 w-4" />Tìm kiếm</Button>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="mr-1 h-4 w-4" />Xóa bộ lọc</Button>}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Chi tiết</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Lỗi</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có audit log nào</TableCell></TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">{log.userId}</TableCell>
                <TableCell><Badge variant="outline">{log.userRole}</Badge></TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="max-w-[300px] truncate">{log.resource}</TableCell>
                <TableCell>
                  <Badge variant={log.success ? "default" : "destructive"}>
                    {log.success ? "Thành công" : "Thất bại"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{log.errorMessage || "—"}</TableCell>
                <TableCell className="text-sm">{formatDateTime(log.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
      </div>
    </AuthGuard>
  );
}
