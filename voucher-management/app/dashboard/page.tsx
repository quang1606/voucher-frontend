"use client";

import { useEffect, useState } from "react";
import { Ticket, Megaphone, Users, TrendingUp, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGuard } from "@/components/auth-guard";
import { dashboardService } from "@/lib/api/services/dashboardService";
import type { DashboardStats, Activity as ActivityType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "T1", vouchers: 400 }, { name: "T2", vouchers: 300 }, { name: "T3", vouchers: 500 },
  { name: "T4", vouchers: 280 }, { name: "T5", vouchers: 590 }, { name: "T6", vouchers: 320 },
  { name: "T7", vouchers: 450 }, { name: "T8", vouchers: 380 }, { name: "T9", vouchers: 430 },
  { name: "T10", vouchers: 520 }, { name: "T11", vouchers: 610 }, { name: "T12", vouchers: 480 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([dashboardService.getStats(), dashboardService.getActivities()]);
        setStats(s); setActivities(a);
      } catch {
        setStats({ totalVouchers: 1250, activeVouchers: 890, totalCampaigns: 45, totalPartners: 32, totalRedemptions: 15600, revenueGenerated: 2500000 });
        setActivities([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { title: "Tổng Voucher", value: stats?.totalVouchers || 0, icon: Ticket, color: "text-blue-500" },
    { title: "Voucher hoạt động", value: stats?.activeVouchers || 0, icon: TrendingUp, color: "text-green-500" },
    { title: "Chiến dịch", value: stats?.totalCampaigns || 0, icon: Megaphone, color: "text-purple-500" },
    { title: "Đối tác", value: stats?.totalPartners || 0, icon: Users, color: "text-orange-500" },
    { title: "Lượt sử dụng", value: stats?.totalRedemptions || 0, icon: Activity, color: "text-pink-500" },
    { title: "Doanh thu", value: `${((stats?.revenueGenerated || 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <AuthGuard pageKey="dashboard">
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Tổng quan hệ thống quản lý voucher" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{typeof card.value === "number" ? card.value.toLocaleString("vi-VN") : card.value}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Voucher theo tháng</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" /><YAxis /><Tooltip />
                  <Bar dataKey="vouchers" fill="hsl(222.2, 47.4%, 11.2%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Hoạt động gần đây</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Chưa có hoạt động nào</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex items-start gap-3 text-sm">
                      <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div><p>{a.description}</p><p className="text-xs text-muted-foreground">{a.user} · {formatDateTime(a.timestamp)}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
