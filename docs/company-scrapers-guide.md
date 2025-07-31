# Company Scrapers Guide

## 🏭 Overview

The Canadian Resource Job Board now includes comprehensive scrapers for **175+ major Canadian resource companies** across all sectors. This system automatically creates and manages scrapers for each company based on industry-specific patterns and configurations.

## 📊 Company Coverage

### By Sector:
- **Oil & Gas**: 40+ companies (Suncor, CNRL, Enbridge, TC Energy, etc.)
- **Mining**: 45+ companies (Barrick, Newmont, Teck, Nutrien, etc.)  
- **Forestry**: 15+ companies (West Fraser, Canfor, Interfor, etc.)
- **Utilities & Renewable**: 30+ companies (BC Hydro, Hydro-Québec, OPG, etc.)
- **Transportation**: 15+ companies (CN Rail, CP Rail, Via Rail, etc.)
- **Agriculture**: 15+ companies (Cargill, McCain, Maple Leaf, etc.)
- **Construction & Engineering**: 15+ companies (SNC-Lavalin, Stantec, Aecon, etc.)

## 🚀 Quick Start

### 1. Setup Company Scrapers
```bash
# Register all company scrapers
npm run scrape:companies

# Register and run comprehensive test
npm run scrape:companies:test
```

### 2. Run Company Scraping
```bash
# Run all scrapers (job boards + companies)
npm run scrape

# Run specific company scraper programmatically
tsx scripts/run-specific-company.ts "Suncor Energy Inc."
```

## 🏗️ Architecture

### Company Scraper Factory
The `CompanyScraperFactory` automatically generates scrapers for all companies:

```typescript
import { CompanyScraperFactory } from './lib/scraping/company-scraper-factory'

const factory = new CompanyScraperFactory(scraperManager)
const allScrapers = factory.createAllCompanyScrapers()
```

### Dynamic Configuration
Each company gets a tailored configuration:

```typescript
interface CompanyConfig {
  name: string                    // Company name
  sector: string                  // Industry sector
  website: string                 // Company website
  careersPath: string            // Careers page path
  selectors: CompanySelectors    // CSS selectors for job data
  customLogic?: CustomLogic      // Company-specific parsing
}
```

### Intelligent Selector System
Selectors are optimized by industry sector:

```typescript
// Base selectors work for most companies
const baseSelectors = {
  jobCard: ['.job-listing', '.career-opportunity', '.position'],
  title: ['.job-title', '.position-title', 'h3', 'h2'],
  location: ['.job-location', '.location', '.workplace'],
  // ... more selectors
}

// Sector-specific additions
if (sector === 'oil_gas') {
  selectors.jobCard.unshift('.field-job', '.operations-role')
  selectors.department.unshift('.field', '.upstream', '.downstream')
}
```

## 🎯 Features

### 1. **Adaptive Scraping**
- Automatically detects job listing patterns
- Falls back to alternative selectors
- Handles different website structures

### 2. **Smart URL Generation**
- Tries multiple career page patterns
- Generates likely URLs based on company name
- Supports external job portals for major companies

### 3. **Sector-Specific Logic**
- Oil & Gas: Looks for field operations, upstream/downstream roles
- Mining: Focuses on mine operations, exploration positions
- Utilities: Targets generation, transmission, distribution roles
- Construction: Emphasizes project management, engineering positions

### 4. **Fallback Strategies**
- If company website fails, tries Indeed company search
- Attempts LinkedIn company jobs
- Falls back to Glassdoor company listings

### 5. **Error Handling & Monitoring**
- Comprehensive error logging
- Success/failure tracking per company
- Automatic retry logic for failed attempts

## 📋 Usage Examples

### Get Scrapers by Sector
```typescript
const factory = new CompanyScraperFactory(manager)
const oilGasScrapers = factory.getScrapersForSector('oil_gas')
const miningScrapers = factory.getScrapersForSector('mining')
```

### Run Specific Company
```typescript
const suncorScraper = factory.getCompanyScraper('Suncor Energy Inc.')
const jobs = await suncorScraper.scrape({
  maxPages: 3,
  dateRange: 'week'
})
```

### Get Statistics
```typescript
const totalCompanies = factory.getTotalCompanyCount()        // 175+
const sectorBreakdown = factory.getCompanyCountBySector()    // {oil_gas: 40, mining: 45, ...}
```

## 🔧 Customization

### Adding New Companies
Add to the `CANADIAN_RESOURCE_COMPANIES` array:

```typescript
{
  name: 'New Company Inc.',
  sector: 'oil_gas',
  website: 'https://www.newcomp.com',
  knownCareersPath: '/careers',
  aliases: ['NewComp']
}
```

### Custom Company Logic
Override default behavior for specific companies:

```typescript
customLogic: {
  buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => {
    return [`${baseUrl}/custom-careers-path`]
  },
  parseJobCard: (html: string, baseUrl: string) => {
    // Custom parsing logic
    return customParsedJob
  }
}
```

### Sector-Specific Selectors
Modify selectors in `getSelectorsForSector()`:

```typescript
case 'new_sector':
  baseSelectors.jobCard.unshift('.custom-job-selector')
  baseSelectors.department.unshift('.custom-dept-selector')
  break
```

## 📈 Monitoring & Analytics

### Scraping Statistics
Track performance per company:
- Jobs found per scraping session
- Success/failure rates
- Error patterns and common issues
- Response times and reliability

### Database Integration
All scraped jobs are automatically:
- Deduplicated using content hashing
- Categorized by sector and location
- Tagged with source company
- Made available for search and filtering

## 🚀 Performance

### Parallel Processing
- Companies scraped in parallel by sector
- Rate limiting to respect website resources
- Intelligent retry logic for temporary failures

### Caching Strategy
- Website structure patterns cached
- Selector success rates tracked
- Failed URLs marked to avoid repeated attempts

### Resource Management  
- Configurable delays between requests
- Memory-efficient processing of large result sets
- Automatic cleanup of stale job listings

## 🛠️ Troubleshooting

### Common Issues

1. **No Jobs Found**
   - Company may have redesigned careers page
   - Check if careers moved to external job board
   - Verify website URL is still valid

2. **Parsing Errors**
   - Website may have changed HTML structure
   - Try updating selectors for that company
   - Check if JavaScript rendering is required

3. **Access Blocked**
   - Some companies block automated access
   - ScrapingBee helps bypass basic blocks
   - May need to use fallback job board sources

### Debug Mode
Enable detailed logging:

```bash
DEBUG=1 npm run scrape:companies:test
```

### Manual Testing
Test individual companies:

```typescript
const result = await companyScraper.scrape({
  maxPages: 1,
  debug: true
})
console.log('Debug info:', result)
```

## 🔮 Future Enhancements

### Planned Features
1. **AI-Powered Adaptation**: Machine learning to improve selector detection
2. **Real-time Monitoring**: Dashboard for scraper health and performance  
3. **API Integration**: Direct integration with company ATS systems
4. **Mobile App Support**: Scraping mobile-optimized career pages
5. **International Expansion**: Support for US and global resource companies

### Contribution Guidelines
1. Add new companies to the master list
2. Test thoroughly with `npm run scrape:companies:test`
3. Document any custom logic required
4. Update sector classifications as needed

---

## 📞 Support

For issues with company scrapers:
1. Check the comprehensive test results
2. Review error logs in the console
3. Test individual companies to isolate issues
4. Update company configurations as needed

The system is designed to be self-healing and adaptive, automatically improving as it encounters new website patterns and structures.