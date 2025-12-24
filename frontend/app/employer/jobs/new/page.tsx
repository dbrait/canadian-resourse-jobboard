'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Plus,
  X,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  AlertCircle,
} from 'lucide-react';

const industries = [
  { value: 'mining', label: 'Mining' },
  { value: 'oil_gas', label: 'Oil & Gas' },
  { value: 'forestry', label: 'Forestry' },
  { value: 'fishing', label: 'Fishing & Aquaculture' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'environmental', label: 'Environmental' },
];

const jobTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead / Principal' },
  { value: 'executive', label: 'Executive' },
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

interface JobFormData {
  title: string;
  industry: string;
  job_type: string;
  experience_level: string;
  city: string;
  province: string;
  is_remote: boolean;
  is_fly_in_fly_out: boolean;
  salary_min: string;
  salary_max: string;
  show_salary: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  application_email: string;
  application_url: string;
  expires_in_days: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    industry: '',
    job_type: 'full_time',
    experience_level: 'mid',
    city: '',
    province: '',
    is_remote: false,
    is_fly_in_fly_out: false,
    salary_min: '',
    salary_max: '',
    show_salary: true,
    description: '',
    requirements: [],
    benefits: [],
    application_email: '',
    application_url: '',
    expires_in_days: '30',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.province) {
      newErrors.province = 'Province is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (formData.description.length < 100) {
      newErrors.description = 'Job description must be at least 100 characters';
    }
    if (!formData.application_email && !formData.application_url) {
      newErrors.application_email = 'Either application email or URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to jobs list
      router.push('/employer/jobs?created=true');
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/employer/jobs"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Post a New Job</h1>
            <p className="text-muted-foreground">
              Fill out the details below to create your job listing
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-muted disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Publish Job
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Mining Engineer"
                className={`w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.title ? 'border-red-500' : ''
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.industry ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select industry</option>
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {jobTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Experience Level
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5" />
            Location
          </h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Vancouver"
                  className={`w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.city ? 'border-red-500' : ''
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.province ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select province</option>
                  {provinces.map((prov) => (
                    <option key={prov.value} value={prov.value}>
                      {prov.label}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-500">{errors.province}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_remote"
                  checked={formData.is_remote}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Remote work available</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_fly_in_fly_out"
                  checked={formData.is_fly_in_fly_out}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Fly-in/Fly-out (FIFO)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-5 w-5" />
            Salary
          </h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Minimum Salary (CAD/year)
                </label>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  placeholder="e.g., 80000"
                  className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Maximum Salary (CAD/year)
                </label>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  placeholder="e.g., 120000"
                  className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="show_salary"
                checked={formData.show_salary}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Display salary on job listing</span>
            </label>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Jobs with salary information receive 30% more applications on average.
              </p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Job Description</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={8}
                placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                className={`w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              <div className="mt-1 flex justify-between text-sm">
                {errors.description ? (
                  <p className="text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Minimum 100 characters
                  </p>
                )}
                <p className="text-muted-foreground">
                  {formData.description.length} characters
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Requirements
              </label>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                  >
                    <span className="flex-1 text-sm">{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    placeholder="Add a requirement..."
                    className="flex-1 rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Benefits
              </label>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                  >
                    <span className="flex-1 text-sm">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    placeholder="Add a benefit..."
                    className="flex-1 rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="flex items-center gap-1 rounded-lg border px-3 py-2 hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Application Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Application Email
              </label>
              <input
                type="email"
                name="application_email"
                value={formData.application_email}
                onChange={handleChange}
                placeholder="hr@yourcompany.com"
                className={`w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.application_email ? 'border-red-500' : ''
                }`}
              />
              {errors.application_email && (
                <p className="mt-1 text-sm text-red-500">{errors.application_email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Or External Application URL
              </label>
              <input
                type="url"
                name="application_url"
                value={formData.application_url}
                onChange={handleChange}
                placeholder="https://yourcompany.com/careers/apply"
                className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Listing Duration
              </label>
              <select
                name="expires_in_days"
                value={formData.expires_in_days}
                onChange={handleChange}
                className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href="/employer/jobs"
            className="rounded-lg border px-6 py-2 font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border px-6 py-2 font-medium hover:bg-muted disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Job'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
