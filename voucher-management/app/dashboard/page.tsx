"use client";

import { useEffect, useState } from "react";
import { Loader2, Ticket, Target, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { AuthGuard } from "@/components/auth-guard";
import { dashboardService } from "@/lib/api/services/dashboardService";
import { auditLogService } from "@/lib/api/services/auditLogService";
import { formatDateTime } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AuditLog } from "@/lib/types";

interface MonthlyData { month: number; total: number; name?: string }
interface VoucherRequestStats { totalRequests: number; completedRequests: number; incompleteRequests: number }
interface MissionStats { totalMissions: number; completedMissions: number; incompleteMissions: number }

const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [voucherStats, setVoucherStats] = useState<VoucherRequestStats | null>(null);
  const [missionStats, setMissionStats] = useState<MissionStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [logsPage, setLogsPage] = useState(0);
  const [hasMoreLogs, setHasMoreLogs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [monthly, voucher, mission, logs] = await Promise.all([
          dashboardService.getVoucherMonthlyStats(Number(year)),
          dashboardService.getVoucherRequestStats(),
          dashboardService.getMissionStats(),
          auditLogService.list({ page: 0, size: 5 }),
        ]);
        const mData = monthly?.data || monthly || [];
        setMonthlyData(Array.isArray(mData) ? mData.map((d: MonthlyData) => ({ ...d, name: MONTHS[d.month - 1] })) : []);
        setVoucherStats(voucher?.data || voucher || null);
        setMissionStats(mission?.data || mission || null);
        const logsWrapper = logs?.data?.content !== undefined ? logs.data : logs?.data?.data !== undefined ? logs.data : logs;
        const logItems = logsWrapper?.content || logsWrapper?.data || [];
        setRecentLogs(logItems);
        setHasMoreLogs((logsWrapper?.totalPages || 1) > 1);
        setLogsPage(0);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [year]);

  const loadMoreLogs = async () => {
    setLoadingMore(true);
    try {
      const nextPage = logsPage + 1;
      const logs = await auditLogService.list({ page: nextPage, size: 5 });
      const logsWrapper = logs?.data?.content !== undefined ? logs.data : logs?.data?.data !== undefined ? logs.data : logs;
      const logItems = logsWrapper?.content || logsWrapper?.data || [];
      setRecentLogs((prev) => [...prev, ...logItems]);
      setLogsPage(nextPage);
      setHasMoreLogs(nextPage + 1 < (logsWrapper?.totalPages || 1));
    } catch { /* ignore */ }
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <AuthGuard pageKey="dashboard">
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard pageKey="dashboard">
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Tổng quan hệ thống" />

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng Voucher Request</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{voucherStats?.totalRequests || 0}</div>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />{voucherStats?.completedRequests || 0} hoàn thành</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Voucher chưa hoàn thành</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{voucherStats?.incompleteRequests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Cần xử lý</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng Mission</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missionStats?.totalMissions || 0}</div>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />{missionStats?.completedMissions || 0} hoàn thành</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mission chưa hoàn thành</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{missionStats?.incompleteMissions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Cần xử lý</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Recent activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Voucher theo tháng</CardTitle>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">Chưa có dữ liệu</p>
              )}
            </CardContent>
          </Card>

          {/* Recent audit logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {recentLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Chưa có hoạt động</p>
              ) : (
                <>
                  <div className="space-y-0 divide-y">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 py-3">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{log.action}</span>
                            <Badge variant={log.success ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                              {log.success ? "OK" : "Lỗi"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{log.resource}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground">{log.userId}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 text-center">
                    <Link href="/dashboard/audit-logs" className="text-sm text-primary hover:underline">
                      Xem tất cả →
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
