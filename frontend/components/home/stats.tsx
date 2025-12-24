'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  total_jobs: number;
  active_jobs: number;
  total_companies: number;
  total_industries: number;
}

export function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);

  const displayStats = [
    { label: 'Active Jobs', value: stats?.active_jobs?.toLocaleString() || '0', suffix: '+' },
    { label: 'Companies', value: stats?.total_companies?.toString() || '20', suffix: '+' },
    { label: 'Industries', value: '7', suffix: '' },
    { label: 'Provinces', value: '13', suffix: '' },
  ];

  return (
    <section className="border-b bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {displayStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
                {stat.suffix}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
