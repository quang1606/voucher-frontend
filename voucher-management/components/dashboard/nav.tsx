"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Megaphone, Users, BarChart3, Settings, Target, ClipboardList, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem { title: string; href: string; icon: React.ComponentType<{ className?: string }>; pageKey: string }

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, pageKey: "dashboard" },
  { title: "Vouchers", href: "/dashboard/vouchers", icon: Ticket, pageKey: "vouchers" },
  { title: "Missions", href: "/dashboard/missions", icon: Target, pageKey: "missions" },
  { title: "Partners", href: "/dashboard/partners", icon: Users, pageKey: "partners" },
  { title: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList, pageKey: "audit-logs" },
  { title: "Invoices", href: "/dashboard/invoices", icon: Receipt, pageKey: "invoices" },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3, pageKey: "reports" },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, pageKey: "settings" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const allowedPages = useAuthStore((s) => s.allowedPages);
  const allowedPagesLoaded = useAuthStore((s) => s.allowedPagesLoaded);

  const hasAllAccess = allowedPages.includes("page-all");
  const filteredNavItems = !allowedPagesLoaded || hasAllAccess || allowedPages.length === 0
    ? navItems
    : navItems.filter((item) => allowedPages.includes(item.pageKey));

  return (
    <ScrollArea className="h-full py-4">
      <nav className="space-y-1 px-3" aria-label="Sidebar navigation">
        {filteredNavItems.map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
              <item.icon className="h-4 w-4" />{item.title}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
