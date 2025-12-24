'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  BarChart3,
  CreditCard,
  Settings,
  Plus,
  Loader2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/employer', icon: LayoutDashboard },
  { name: 'Job Postings', href: '/employer/jobs', icon: Briefcase },
  { name: 'Applicants', href: '/employer/applicants', icon: Users },
  { name: 'Company Profile', href: '/employer/company', icon: Building2 },
  { name: 'Analytics', href: '/employer/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/employer/billing', icon: CreditCard },
];

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/employer');
    }
    // In production, also check if user has employer role
    // if (session?.user?.role !== 'employer') {
    //   router.push('/employer/onboarding');
    // }
  }, [status, router, session]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Employer Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employer Portal</p>
                <h1 className="font-semibold">Your Company Name</h1>
              </div>
            </div>

            <Link
              href="/employer/jobs/new"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <nav className="sticky top-20 space-y-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/employer' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="my-4 border-t" />

              <Link
                href="/employer/settings"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === '/employer/settings'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>

            {/* Upgrade CTA */}
            <div className="mt-6 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 p-4 text-white">
              <h3 className="font-semibold">Upgrade to Pro</h3>
              <p className="mt-1 text-sm text-white/80">
                Get featured listings and unlimited job posts
              </p>
              <Link
                href="/employer/billing"
                className="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-white/90"
              >
                View Plans
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
