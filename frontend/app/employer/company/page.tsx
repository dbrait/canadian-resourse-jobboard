'use client';

import { useState } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Upload,
  Save,
  Loader2,
  Check,
  Camera,
} from 'lucide-react';

interface CompanyProfile {
  name: string;
  industry: string;
  website: string;
  headquarters: string;
  founded: string;
  employees: string;
  description: string;
  about: string;
  logo_url?: string;
  cover_url?: string;
  social: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
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

const employeeSizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+',
];

export default function CompanyProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [profile, setProfile] = useState<CompanyProfile>({
    name: 'Your Company Name',
    industry: 'mining',
    website: 'https://yourcompany.com',
    headquarters: 'Vancouver, BC',
    founded: '2010',
    employees: '201-500',
    description:
      'A leading company in the natural resources sector focused on sustainable practices and innovation.',
    about: `We are a dynamic company committed to responsible resource development. Our team of dedicated professionals works across Canada to deliver excellence in our operations while maintaining the highest standards of safety and environmental stewardship.

Our values:
- Safety First
- Environmental Responsibility
- Community Engagement
- Innovation and Excellence`,
    social: {
      linkedin: 'https://linkedin.com/company/yourcompany',
      twitter: 'https://twitter.com/yourcompany',
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('social.')) {
      const socialKey = name.replace('social.', '');
      setProfile((prev) => ({
        ...prev,
        social: { ...prev.social, [socialKey]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }

    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSaved(true);

    // Reset saved state after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage how your company appears to job seekers
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
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Logo & Cover */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Branding</h2>

        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">Cover Image</label>
            <div className="relative h-40 overflow-hidden rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
              <button className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white hover:bg-black/70">
                <Camera className="h-4 w-4" />
                Change Cover
              </button>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="mb-2 block text-sm font-medium">Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </button>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG or JPG, max 2MB. Recommended: 200x200px
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Industry</label>
              <select
                name="industry"
                value={profile.industry}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Headquarters</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="headquarters"
                  value={profile.headquarters}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Founded</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="founded"
                  value={profile.founded}
                  onChange={handleChange}
                  placeholder="e.g., 2010"
                  className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Company Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="employees"
                  value={profile.employees}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border bg-background py-2 pl-10 pr-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {employeeSizes.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Tagline</label>
            <input
              type="text"
              name="description"
              value={profile.description}
              onChange={handleChange}
              maxLength={200}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.description.length}/200 characters
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">About Your Company</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Company Description</label>
          <textarea
            name="about"
            value={profile.about}
            onChange={handleChange}
            rows={8}
            className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Tell candidates about your company culture, mission, and what makes you unique.
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Social Media</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">LinkedIn</label>
            <input
              type="url"
              name="social.linkedin"
              value={profile.social.linkedin || ''}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Twitter / X</label>
            <input
              type="url"
              name="social.twitter"
              value={profile.social.twitter || ''}
              onChange={handleChange}
              placeholder="https://twitter.com/yourcompany"
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Facebook</label>
            <input
              type="url"
              name="social.facebook"
              value={profile.social.facebook || ''}
              onChange={handleChange}
              placeholder="https://facebook.com/yourcompany"
              className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
