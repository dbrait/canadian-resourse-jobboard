import Link from 'next/link';

const industries = [
  { name: 'Mining', href: '/industries/mining' },
  { name: 'Oil & Gas', href: '/industries/oil-gas' },
  { name: 'Forestry', href: '/industries/forestry' },
  { name: 'Fishing', href: '/industries/fishing' },
  { name: 'Agriculture', href: '/industries/agriculture' },
  { name: 'Renewable Energy', href: '/industries/renewable-energy' },
  { name: 'Environmental', href: '/industries/environmental' },
];

const provinces = [
  { name: 'Alberta', href: '/jobs?province=AB' },
  { name: 'British Columbia', href: '/jobs?province=BC' },
  { name: 'Saskatchewan', href: '/jobs?province=SK' },
  { name: 'Ontario', href: '/jobs?province=ON' },
  { name: 'Quebec', href: '/jobs?province=QC' },
  { name: 'Newfoundland', href: '/jobs?province=NL' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <span className="text-2xl">🌿</span>
              <span className="text-lg font-bold">Resources Job Board</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Canada's premier job board for natural resources careers. Find
              opportunities in mining, oil & gas, forestry, fishing,
              agriculture, renewable energy, and environmental consulting.
            </p>
          </div>

          {/* Industries */}
          <div>
            <h3 className="mb-4 font-semibold">Industries</h3>
            <ul className="space-y-2">
              {industries.map((industry) => (
                <li key={industry.href}>
                  <Link
                    href={industry.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {industry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Provinces */}
          <div>
            <h3 className="mb-4 font-semibold">Jobs by Province</h3>
            <ul className="space-y-2">
              {provinces.map((province) => (
                <li key={province.href}>
                  <Link
                    href={province.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {province.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/employer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  For Employers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Resources Job Board. All rights
              reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              <a
                href="https://linkedin.com"
                className="text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
