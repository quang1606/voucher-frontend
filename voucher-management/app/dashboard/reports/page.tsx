"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { AuthGuard } from "@/components/auth-guard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { name: "T1", vouchers: 120, redemptions: 80 }, { name: "T2", vouchers: 150, redemptions: 95 },
  { name: "T3", vouchers: 200, redemptions: 140 }, { name: "T4", vouchers: 180, redemptions: 120 },
  { name: "T5", vouchers: 250, redemptions: 190 }, { name: "T6", vouchers: 220, redemptions: 170 },
];

const pieData = [
  { name: "Giảm giá %", value: 45 }, { name: "Giảm giá cố định", value: 30 },
  { name: "Miễn phí vận chuyển", value: 15 }, { name: "Khác", value: 10 },
];

const COLORS = ["hsl(222, 47%, 11%)", "hsl(173, 58%, 39%)", "hsl(43, 74%, 66%)", "hsl(27, 87%, 67%)"];

export default function ReportsPage() {
  return (
    <AuthGuard pageKey="reports">
      <div className="space-y-6">
        <PageHeader title="Báo cáo & Thống kê" description="Phân tích dữ liệu voucher và chiến dịch" />
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Voucher phát hành vs Sử dụng</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                  <Bar dataKey="vouchers" fill="hsl(222, 47%, 11%)" name="Phát hành" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="redemptions" fill="hsl(173, 58%, 39%)" name="Sử dụng" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Phân loại Voucher</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base">Xu hướng sử dụng voucher</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                  <Line type="monotone" dataKey="redemptions" stroke="hsl(222, 47%, 11%)" strokeWidth={2} name="Lượt sử dụng" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
