'use client';

import { useState } from 'react';
import {
  Bell,
  Mail,
  Shield,
  Users,
  Key,
  Trash2,
  Plus,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  status: 'active' | 'pending';
  avatar?: string;
}

interface NotificationSettings {
  newApplication: boolean;
  applicationStatusChange: boolean;
  jobExpiring: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@acmemining.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@acmemining.com',
    role: 'manager',
    status: 'active',
  },
  {
    id: '3',
    name: 'pending@acmemining.com',
    email: 'pending@acmemining.com',
    role: 'viewer',
    status: 'pending',
  },
];

const roleLabels = {
  admin: 'Admin',
  manager: 'Hiring Manager',
  viewer: 'Viewer',
};

const roleDescriptions = {
  admin: 'Full access to all features including billing and team management',
  manager: 'Can post jobs, view applicants, and manage the hiring process',
  viewer: 'Read-only access to view jobs and applicants',
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('notifications');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newApplication: true,
    applicationStatusChange: true,
    jobExpiring: true,
    weeklyDigest: true,
    marketingEmails: false,
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your employer account settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 font-semibold">Email Notifications</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose which notifications you'd like to receive via email
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">New Applications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone applies to your job postings
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('newApplication')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications.newApplication ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        notifications.newApplication ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Application Status Changes</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when team members update applicant statuses
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('applicationStatusChange')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications.applicationStatusChange ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        notifications.applicationStatusChange ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Job Expiring Soon</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminded before your job postings expire
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('jobExpiring')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications.jobExpiring ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        notifications.jobExpiring ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your job posting performance
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('weeklyDigest')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications.weeklyDigest ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        notifications.weeklyDigest ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Receive tips, product updates, and promotional content
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('marketingEmails')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications.marketingEmails ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        notifications.marketingEmails ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Team Members</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage who has access to your employer account
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Invite Member
                  </button>
                </div>

                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {member.status === 'pending' ? member.email : member.name}
                            </p>
                            {member.status === 'pending' && (
                              <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
                                Pending
                              </span>
                            )}
                          </div>
                          {member.status !== 'pending' && (
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={member.role}
                          onChange={() => {}}
                          className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Descriptions */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-4 font-semibold">Role Permissions</h3>
                <div className="space-y-4">
                  {Object.entries(roleDescriptions).map(([role, description]) => (
                    <div key={role} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {roleLabels[role as keyof typeof roleLabels]}
                        </p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">Change Password</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Current Password</label>
                    <input
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">New Password</label>
                    <input
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Password must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Confirm New Password</label>
                    <input
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-100 p-2">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                    Enable
                  </button>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">Active Sessions</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-muted-foreground">
                        Calgary, AB, Canada • Current session
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Safari on iPhone</p>
                      <p className="text-sm text-muted-foreground">
                        Calgary, AB, Canada • Last active 2 hours ago
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:underline">Revoke</button>
                  </div>
                </div>
                <button className="mt-4 text-sm font-medium text-red-600 hover:underline">
                  Sign out of all other sessions
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                <h2 className="font-semibold text-red-700 dark:text-red-400">
                  Export Company Data
                </h2>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
                  Download all your company data including job postings, applicants, and analytics
                  in a portable format.
                </p>
                <button className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/50">
                  Export Data
                </button>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                <h2 className="font-semibold text-red-700 dark:text-red-400">
                  Delete Employer Account
                </h2>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
                  Permanently delete your employer account and all associated data. This action
                  cannot be undone. All job postings, applicant data, and analytics will be lost.
                </p>
                <button className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-background p-6">
            <h2 className="mb-4 text-lg font-semibold">Invite Team Member</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as 'admin' | 'manager' | 'viewer')
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {roleDescriptions[inviteRole]}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-lg border py-2 font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
