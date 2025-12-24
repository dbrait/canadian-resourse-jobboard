'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Scrapers', href: '/admin/scrapers', icon: Bot },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Employers', href: '/admin/employers', icon: Building2 },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Moderation', href: '/admin/moderation', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Admin Panel</span>
              </div>
            )}
            {collapsed && (
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <div className="border-t p-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  Collapse
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search anything..."
              className="w-full rounded-lg border bg-muted/50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Alerts */}
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                3
              </span>
            </button>

            {/* System Status */}
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">All Systems Operational</span>
            </div>

            {/* Admin User */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-medium text-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
