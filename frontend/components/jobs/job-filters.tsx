'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterSection {
  title: string;
  key: string;
  options: { value: string; label: string }[];
  multiSelect?: boolean;
}

const INDUSTRIES: FilterSection = {
  title: 'Industry',
  key: 'industry',
  multiSelect: true,
  options: [
    { value: 'mining', label: 'Mining' },
    { value: 'oil_gas', label: 'Oil & Gas' },
    { value: 'forestry', label: 'Forestry' },
    { value: 'fishing', label: 'Fishing & Aquaculture' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'renewable_energy', label: 'Renewable Energy' },
    { value: 'environmental', label: 'Environmental' },
  ],
};

const PROVINCES: FilterSection = {
  title: 'Province',
  key: 'province',
  options: [
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
  ],
};

const JOB_TYPES: FilterSection = {
  title: 'Job Type',
  key: 'job_type',
  multiSelect: true,
  options: [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'internship', label: 'Internship' },
  ],
};

const SALARY_RANGES = [
  { value: '0-50000', label: 'Under $50,000' },
  { value: '50000-75000', label: '$50,000 - $75,000' },
  { value: '75000-100000', label: '$75,000 - $100,000' },
  { value: '100000-150000', label: '$100,000 - $150,000' },
  { value: '150000-999999', label: '$150,000+' },
];

interface JobFiltersProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export function JobFilters({ searchParams }: JobFiltersProps) {
  const router = useRouter();
  const currentParams = useSearchParams();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    industry: true,
    province: true,
    job_type: true,
    salary: false,
    remote: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateFilter = useCallback(
    (key: string, value: string, multiSelect: boolean = false) => {
      const params = new URLSearchParams(currentParams.toString());

      if (multiSelect) {
        const currentValues = params.getAll(key);
        if (currentValues.includes(value)) {
          // Remove value
          params.delete(key);
          currentValues
            .filter((v) => v !== value)
            .forEach((v) => params.append(key, v));
        } else {
          // Add value
          params.append(key, value);
        }
      } else {
        if (params.get(key) === value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 when filters change
      params.delete('page');

      router.push(`/jobs?${params.toString()}`);
    },
    [currentParams, router]
  );

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const q = currentParams.get('q');
    if (q) params.set('q', q);
    router.push(`/jobs?${params.toString()}`);
  };

  const isSelected = (key: string, value: string): boolean => {
    const values = currentParams.getAll(key);
    return values.includes(value) || currentParams.get(key) === value;
  };

  const hasActiveFilters = (): boolean => {
    const filterKeys = ['industry', 'province', 'job_type', 'salary_min', 'is_remote'];
    return filterKeys.some((key) => currentParams.has(key));
  };

  const renderFilterSection = (section: FilterSection) => (
    <div key={section.key} className="border-b py-4">
      <button
        onClick={() => toggleSection(section.key)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        {section.title}
        {expandedSections[section.key] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {expandedSections[section.key] && (
        <div className="mt-3 space-y-2">
          {section.options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type={section.multiSelect ? 'checkbox' : 'radio'}
                name={section.key}
                checked={isSelected(section.key, option.value)}
                onChange={() =>
                  updateFilter(section.key, option.value, section.multiSelect)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Remote Work Toggle */}
      <div className="border-b py-4">
        <label className="flex cursor-pointer items-center justify-between">
          <span className="font-medium">Remote Only</span>
          <input
            type="checkbox"
            checked={currentParams.get('is_remote') === 'true'}
            onChange={() => updateFilter('is_remote', 'true')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </label>
      </div>

      {/* Industry Filter */}
      {renderFilterSection(INDUSTRIES)}

      {/* Province Filter */}
      {renderFilterSection(PROVINCES)}

      {/* Job Type Filter */}
      {renderFilterSection(JOB_TYPES)}

      {/* Salary Filter */}
      <div className="border-b py-4">
        <button
          onClick={() => toggleSection('salary')}
          className="flex w-full items-center justify-between text-left font-medium"
        >
          Salary Range
          {expandedSections.salary ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.salary && (
          <div className="mt-3 space-y-2">
            {SALARY_RANGES.map((range) => {
              const [min, max] = range.value.split('-');
              const isActive =
                currentParams.get('salary_min') === min &&
                currentParams.get('salary_max') === max;

              return (
                <label
                  key={range.value}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    name="salary"
                    checked={isActive}
                    onChange={() => {
                      const params = new URLSearchParams(currentParams.toString());
                      if (isActive) {
                        params.delete('salary_min');
                        params.delete('salary_max');
                      } else {
                        params.set('salary_min', min);
                        params.set('salary_max', max);
                      }
                      params.delete('page');
                      router.push(`/jobs?${params.toString()}`);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{range.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
