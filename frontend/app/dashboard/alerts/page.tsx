'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  MapPin,
  Briefcase,
  Clock,
} from 'lucide-react';

interface JobAlert {
  id: string;
  name: string;
  keywords?: string;
  industry?: string;
  location?: string;
  job_type?: string;
  is_remote?: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  is_active: boolean;
  created_at: string;
}

const industries = [
  { value: 'mining', label: 'Mining' },
  { value: 'oil_gas', label: 'Oil & Gas' },
  { value: 'forestry', label: 'Forestry' },
  { value: 'fishing', label: 'Fishing & Aquaculture' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'environmental', label: 'Environmental' },
];

const provinces = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NL', label: 'Newfoundland & Labrador' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'YT', label: 'Yukon' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
];

const frequencies = [
  { value: 'instant', label: 'Instant', description: 'Get notified immediately' },
  { value: 'daily', label: 'Daily Digest', description: 'Once per day' },
  { value: 'weekly', label: 'Weekly Digest', description: 'Once per week' },
];

const mockAlerts: JobAlert[] = [
  {
    id: '1',
    name: 'Mining Jobs in BC',
    keywords: 'engineer',
    industry: 'mining',
    location: 'BC',
    frequency: 'daily',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Remote Environmental Jobs',
    industry: 'environmental',
    is_remote: true,
    frequency: 'weekly',
    is_active: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function JobAlertsPage() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<JobAlert[]>(mockAlerts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    industry: '',
    location: '',
    is_remote: false,
    frequency: 'daily' as 'instant' | 'daily' | 'weekly',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      industry: '',
      location: '',
      is_remote: false,
      frequency: 'daily',
    });
  };

  const handleCreate = () => {
    const newAlert: JobAlert = {
      id: Date.now().toString(),
      name: formData.name || `${formData.industry || 'All'} Jobs`,
      keywords: formData.keywords || undefined,
      industry: formData.industry || undefined,
      location: formData.location || undefined,
      is_remote: formData.is_remote || undefined,
      frequency: formData.frequency,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setIsCreating(false);
    resetForm();
  };

  const handleToggle = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, is_active: !alert.is_active } : alert
      )
    );
  };

  const handleDelete = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const AlertForm = () => (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {editingAlert ? 'Edit Alert' : 'Create New Alert'}
        </h2>
        <button
          onClick={() => {
            setIsCreating(false);
            setEditingAlert(null);
            resetForm();
          }}
          className="rounded-lg p-2 hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Alert Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Mining Jobs in Alberta"
            className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Keywords (optional)</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
            placeholder="e.g., engineer, supervisor"
            className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Province</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Provinces</option>
              {provinces.map((prov) => (
                <option key={prov.value} value={prov.value}>
                  {prov.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_remote}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_remote: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Remote jobs only</span>
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Email Frequency</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {frequencies.map((freq) => (
              <label
                key={freq.value}
                className={`flex cursor-pointer flex-col rounded-lg border p-3 transition-colors ${
                  formData.frequency === freq.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={freq.value}
                  checked={formData.frequency === freq.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequency: e.target.value as 'instant' | 'daily' | 'weekly',
                    }))
                  }
                  className="sr-only"
                />
                <span className="font-medium">{freq.label}</span>
                <span className="text-xs text-muted-foreground">{freq.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setIsCreating(false);
              setEditingAlert(null);
              resetForm();
            }}
            className="rounded-lg border px-4 py-2 font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            {editingAlert ? 'Save Changes' : 'Create Alert'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Alerts</h1>
          <p className="mt-1 text-muted-foreground">
            Get notified when new jobs match your criteria
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Alert
          </button>
        )}
      </div>

      {isCreating && <AlertForm />}

      {alerts.length === 0 && !isCreating ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="mb-2 text-lg font-semibold">No job alerts</h2>
          <p className="mb-4 text-muted-foreground">
            Create an alert to get notified when new jobs match your preferences
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border bg-card p-5 transition-opacity ${
                !alert.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{alert.name}</h3>
                    {!alert.is_active && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">Paused</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {alert.keywords && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Keywords: {alert.keywords}
                      </span>
                    )}
                    {alert.industry && (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Briefcase className="mr-1 inline-block h-3 w-3" />
                        {industries.find((i) => i.value === alert.industry)?.label}
                      </span>
                    )}
                    {alert.location && (
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <MapPin className="mr-1 inline-block h-3 w-3" />
                        {provinces.find((p) => p.value === alert.location)?.label}
                      </span>
                    )}
                    {alert.is_remote && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Remote Only
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {frequencies.find((f) => f.value === alert.frequency)?.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(alert.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      alert.is_active ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        alert.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                    title="Delete alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
