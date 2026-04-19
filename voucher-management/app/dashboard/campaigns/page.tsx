"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { campaignService } from "@/lib/api/services/campaignService";
import { formatDateTime } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ACTIVE: { label: "Đang chạy", variant: "default" },
  INACTIVE: { label: "Tạm dừng", variant: "secondary" },
  COMPLETED: { label: "Hoàn thành", variant: "destructive" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, pageSize: 10 };
        if (search) params.search = search;
        const data = await campaignService.list(params);
        setCampaigns(data.data || []); setTotalPages(data.totalPages || 1);
      } catch { setCampaigns([]); }
      setLoading(false);
    }
    load();
  }, [page, search]);

  return (
    <AuthGuard pageKey="campaigns">
      <div className="space-y-4">
        <PageHeader title="Quản lý Chiến dịch" description="Tạo và quản lý chiến dịch voucher">
          <Button><Plus className="mr-2 h-4 w-4" />Tạo chiến dịch</Button>
        </PageHeader>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm chiến dịch..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Tên chiến dịch</TableHead><TableHead>Thời gian</TableHead><TableHead>Số voucher</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày tạo</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có chiến dịch nào</TableCell></TableRow>
            ) : campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm">{formatDateTime(c.startDate)} - {formatDateTime(c.endDate)}</TableCell>
                <TableCell>{c.totalVouchers}</TableCell>
                <TableCell><Badge variant={statusMap[c.status]?.variant}>{statusMap[c.status]?.label || c.status}</Badge></TableCell>
                <TableCell className="text-sm">{formatDateTime(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </AuthGuard>
  );
}
