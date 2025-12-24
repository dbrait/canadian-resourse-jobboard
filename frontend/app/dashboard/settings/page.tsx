'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Bell, Shield, LogOut, Loader2, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [profileData, setProfileData] = useState({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailJobAlerts: true,
    emailNewsletter: false,
    emailApplicationUpdates: true,
    emailWeeklyDigest: true,
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      setErrorMessage('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Notification preferences saved');
    } catch (error) {
      setErrorMessage('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and notification preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Changing your email will require verification
            </p>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold">Email Notifications</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Job Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when new jobs match your alerts
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailJobAlerts}
              onChange={(e) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailJobAlerts: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Application Updates</p>
              <p className="text-sm text-muted-foreground">
                Status updates on your job applications
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailApplicationUpdates}
              onChange={(e) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailApplicationUpdates: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">
                Summary of new jobs and industry news
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailWeeklyDigest}
              onChange={(e) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailWeeklyDigest: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className="text-sm text-muted-foreground">
                Industry insights and career tips
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailNewsletter}
              onChange={(e) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailNewsletter: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>

          <button
            onClick={handleNotificationSave}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold">Security</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
            <button className="mt-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
              Change Password
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="font-medium">Connected Accounts</p>
            <p className="text-sm text-muted-foreground">
              Manage your connected social accounts
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Google</span>
                </div>
                <span className="text-xs text-muted-foreground">Not connected</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="text-sm">GitHub</span>
                </div>
                <span className="text-xs text-muted-foreground">Not connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/50 bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-destructive/10 p-2">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Account Actions</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-medium">Sign Out</p>
            <p className="text-sm text-muted-foreground">
              Sign out of your account on this device
            </p>
            <button
              onClick={handleSignOut}
              className="mt-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Sign Out
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="font-medium text-destructive">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
            <button className="mt-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
