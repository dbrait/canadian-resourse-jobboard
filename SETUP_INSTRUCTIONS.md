# 🚀 Setup Instructions for Job Scraping System

## Current Status
✅ **Database Connection:** Working (5 jobs currently in database)  
❌ **Database Schema:** Needs scraping columns added  
❌ **ScrapingBee API Key:** Missing  

## Step 1: Update Database Schema

1. Go to your Supabase Dashboard: https://yuparfogandszlpieqbt.supabase.co
2. Navigate to **SQL Editor** 
3. Copy the entire contents of `database/scraping-schema.sql`
4. Paste and run the SQL script
5. This will add the necessary columns and tables for scraping

## Step 2: Get ScrapingBee API Key

1. Visit: https://scrapingbee.com/
2. Sign up for a free account (1,000 API calls/month - plenty for testing)
3. Go to your dashboard and copy your API key
4. Add it to your `.env.local` file:

```bash
# Add this line to .env.local
SCRAPINGBEE_API_KEY=your_api_key_here
```

## Step 3: Test the System

Once you've completed steps 1 & 2, run:

```bash
# Test database connection again
node scripts/test-database-only.js

# Start the Next.js development server
npm run dev

# In another terminal, test the scraping
node scripts/test-with-env.js
```

## Step 4: Run Live Scraping Test

After everything is set up, test all 6 platforms:

```bash
# This will scrape from all 6 sources and update your database
npx tsx scripts/run-test-scrape.ts
```

## What the Scraping System Will Do

1. **Indeed Canada** - General resource sector jobs
2. **Job Bank Canada** - Government job postings  
3. **Suncor Energy** - Oil & gas company jobs
4. **Canadian National Railway** - Transportation jobs
5. **Cameco Corporation** - Mining/uranium jobs
6. **Canadian Natural Resources** - Oil & gas jobs

## Expected Results

- Jobs will be scraped and added to your database
- Duplicates will be automatically detected and skipped
- You'll see new jobs appear on your deployed site
- Each job will be tagged with its source platform

## Troubleshooting

If you encounter issues:

1. **Database errors:** Make sure you ran the SQL schema updates
2. **ScrapingBee errors:** Verify your API key is correct
3. **No jobs found:** Some company sites may have changed - this is normal
4. **Rate limiting:** Built-in delays prevent overwhelming the APIs

## Free Tier Limits

- **ScrapingBee:** 1,000 API calls/month (each page scraped = 1 call)
- **Supabase:** Generous free tier for database storage
- **Vercel:** Free hosting for your job board

The system is designed to work efficiently within these limits!