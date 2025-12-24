import Link from 'next/link';

interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string;
  jobCount: number;
}

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Link
      href={`/industries/${industry.id}`}
      className="group rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
    >
      <div className="mb-4 text-4xl">{industry.icon}</div>
      <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
        {industry.name}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">{industry.description}</p>
      <p className="text-sm font-medium text-primary">
        {industry.jobCount.toLocaleString()} jobs →
      </p>
    </Link>
  );
}
