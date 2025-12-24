'use client';

import { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Users,
  BarChart3,
  Shield,
  Clock,
  Download,
  ExternalLink,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limits: {
    jobs: number | 'unlimited';
    applicants: number | 'unlimited';
    users: number;
  };
  popular?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'month',
    description: 'Perfect for small businesses just getting started',
    features: [
      'Up to 3 active job postings',
      'Basic applicant tracking',
      'Email support',
      'Standard job visibility',
    ],
    limits: {
      jobs: 3,
      applicants: 50,
      users: 1,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'For growing companies with active hiring needs',
    features: [
      'Up to 10 active job postings',
      'Advanced applicant tracking',
      'Priority email support',
      'Enhanced job visibility',
      'Company profile page',
      'Basic analytics',
    ],
    limits: {
      jobs: 10,
      applicants: 200,
      users: 3,
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    period: 'month',
    description: 'For large organizations with high-volume hiring',
    features: [
      'Unlimited job postings',
      'Full ATS features',
      'Dedicated account manager',
      'Featured job placements',
      'Custom company branding',
      'Advanced analytics & reports',
      'API access',
      'SSO integration',
    ],
    limits: {
      jobs: 'unlimited',
      applicants: 'unlimited',
      users: 10,
    },
  },
];

const invoices: Invoice[] = [
  {
    id: 'INV-2024-012',
    date: '2024-01-01',
    amount: 99,
    status: 'paid',
    description: 'Professional Plan - January 2024',
  },
  {
    id: 'INV-2023-011',
    date: '2023-12-01',
    amount: 99,
    status: 'paid',
    description: 'Professional Plan - December 2023',
  },
  {
    id: 'INV-2023-010',
    date: '2023-11-01',
    amount: 99,
    status: 'paid',
    description: 'Professional Plan - November 2023',
  },
  {
    id: 'INV-2023-009',
    date: '2023-10-01',
    amount: 99,
    status: 'paid',
    description: 'Professional Plan - October 2023',
  },
];

export default function BillingPage() {
  const [currentPlan] = useState('professional');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Current Plan</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Professional
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Your next billing date is February 1, 2024
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">$99</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Jobs</span>
            </div>
            <p className="mt-1 text-xl font-semibold">5 / 10</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Applicants This Month</span>
            </div>
            <p className="mt-1 text-xl font-semibold">87 / 200</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Members</span>
            </div>
            <p className="mt-1 text-xl font-semibold">2 / 3</p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">Available Plans</h2>
          <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const displayPrice =
              billingPeriod === 'annual' ? getAnnualPrice(plan.price) : plan.price;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 ${
                  plan.popular ? 'border-primary ring-1 ring-primary' : ''
                } ${isCurrentPlan ? 'bg-muted/30' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold">
                    ${displayPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === 'annual' ? 'year' : 'month'}
                  </span>
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-lg py-2.5 font-medium transition-colors ${
                    isCurrentPlan
                      ? 'cursor-default border bg-muted text-muted-foreground'
                      : plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border hover:bg-muted'
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Payment Method</h2>
            <button className="text-sm font-medium text-primary hover:underline">
              Update
            </button>
          </div>

          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-10 w-14 items-center justify-center rounded bg-gradient-to-r from-blue-600 to-blue-400">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/2025</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment information is secured with SSL encryption</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Billing Information</h2>
            <button className="text-sm font-medium text-primary hover:underline">
              Edit
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Company Name</p>
              <p className="font-medium">Acme Mining Corp</p>
            </div>
            <div>
              <p className="text-muted-foreground">Billing Email</p>
              <p className="font-medium">billing@acmemining.com</p>
            </div>
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">
                123 Resource Way, Suite 500
                <br />
                Calgary, AB T2P 1J9
                <br />
                Canada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Billing History</h2>
          <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <Download className="h-4 w-4" />
            Download All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4 font-medium">{invoice.id}</td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-4 py-4">{invoice.description}</td>
                  <td className="px-4 py-4 text-right font-medium">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Addons */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Add-ons & Extras</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Featured Jobs</h3>
                <p className="text-sm text-muted-foreground">$25 per job</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Boost visibility with featured placement at the top of search results
            </p>
            <button className="w-full rounded-lg border py-2 text-sm font-medium hover:bg-muted">
              Add to Jobs
            </button>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">$49/month</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Detailed insights, competitor benchmarks, and applicant demographics
            </p>
            <button className="w-full rounded-lg border py-2 text-sm font-medium hover:bg-muted">
              Add Feature
            </button>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Extended Posting</h3>
                <p className="text-sm text-muted-foreground">$15 per 30 days</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Keep your job postings active longer than the standard 30-day period
            </p>
            <button className="w-full rounded-lg border py-2 text-sm font-medium hover:bg-muted">
              Extend Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Plan */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="font-semibold text-red-700 dark:text-red-400">Cancel Subscription</h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
          If you cancel, your subscription will remain active until February 1, 2024. After that,
          your account will be downgraded to the free Starter plan.
        </p>
        <button className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/50">
          Cancel Subscription
        </button>
      </div>
    </div>
  );
}
