#!/usr/bin/env npx tsx

import * as fs from 'fs'
import * as path from 'path'

async function createEmergencyDeployment() {
  console.log('🚨 Creating Emergency Deployment Configuration')
  console.log('🎯 Minimal setup to ensure deployment succeeds')
  console.log('='.repeat(60))

  // Emergency simplified Next.js config
  const emergencyNextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration for emergency deployment
  compress: true,
  poweredByHeader: false,
  
  // Disable problematic features
  images: {
    unoptimized: true,
  },
  
  // Skip build-time optimizations that might cause issues
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;`

  // Emergency package.json with minimal dependencies
  const emergencyPackageJson = {
    "name": "resourcecareers-ca",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    "dependencies": {
      "@supabase/supabase-js": "^2.52.1",
      "next": "15.4.4",
      "react": "19.1.0",
      "react-dom": "19.1.0",
      "zod": "^3.22.4"
    },
    "engines": {
      "node": ">=18.0.0",
      "npm": ">=8.0.0"
    },
    "devDependencies": {
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "typescript": "^5"
    }
  }

  console.log('1️⃣ Creating emergency configurations...')

  try {
    // Save current configs as backups
    if (fs.existsSync('next.config.ts')) {
      fs.copyFileSync('next.config.ts', 'next.config.backup.ts')
      console.log('   📋 Backed up current next.config.ts')
    }

    if (fs.existsSync('package.json')) {
      fs.copyFileSync('package.json', 'package.backup.json')
      console.log('   📋 Backed up current package.json')
    }

    // Write emergency configs
    fs.writeFileSync('next.config.emergency.ts', emergencyNextConfig)
    fs.writeFileSync('package.emergency.json', JSON.stringify(emergencyPackageJson, null, 2))
    
    console.log('   ✅ Created emergency configurations')

  } catch (error) {
    console.error('   ❌ Error creating emergency configs:', error)
  }

  // Check for deployment blockers
  console.log('\n2️⃣ Checking for deployment blockers...')

  const potentialBlockers = [
    'node_modules/.cache',
    '.next',
    'coverage',
    'dist'
  ]

  for (const blocker of potentialBlockers) {
    if (fs.existsSync(blocker)) {
      console.log(`   ⚠️  Found potential blocker: ${blocker}`)
    }
  }

  // Create emergency API endpoint
  console.log('\n3️⃣ Creating emergency API endpoint...')

  const emergencyApiEndpoint = `import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return simple success response
    return NextResponse.json({
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      jobs: []
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'API error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}`

  try {
    // Ensure API directory exists
    const apiJobsDir = path.join(process.cwd(), 'app', 'api', 'jobs')
    if (!fs.existsSync(apiJobsDir)) {
      fs.mkdirSync(apiJobsDir, { recursive: true })
    }

    // Create emergency API route
    fs.writeFileSync(path.join(apiJobsDir, 'route.emergency.ts'), emergencyApiEndpoint)
    console.log('   ✅ Created emergency API endpoint')

  } catch (error) {
    console.error('   ❌ Error creating emergency API:', error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🚨 EMERGENCY DEPLOYMENT INSTRUCTIONS')
  console.log('='.repeat(60))

  console.log('\n📋 TO USE EMERGENCY CONFIGURATION:')
  console.log('   1. Replace configs with emergency versions:')
  console.log('      mv next.config.emergency.ts next.config.ts')
  console.log('      mv package.emergency.json package.json')
  console.log('      mv app/api/jobs/route.emergency.ts app/api/jobs/route.ts')
  
  console.log('\n   2. Commit and push emergency config:')
  console.log('      git add next.config.ts package.json app/api/jobs/route.ts')
  console.log('      git commit -m "Emergency deployment configuration"')
  console.log('      git push origin main')

  console.log('\n   3. Monitor Vercel deployment:')
  console.log('      • Check https://vercel.com/dashboard')
  console.log('      • Watch build logs for errors')
  console.log('      • Test site once deployed')

  console.log('\n🔄 TO RESTORE FULL FUNCTIONALITY LATER:')
  console.log('   1. Restore original configs:')
  console.log('      mv next.config.backup.ts next.config.ts')
  console.log('      mv package.backup.json package.json')
  
  console.log('\n   2. Gradually add back features:')
  console.log('      • Test each change individually')
  console.log('      • Monitor deployment success')
  console.log('      • Add dependencies one by one')

  console.log('\n💡 TROUBLESHOOTING TIPS:')
  console.log('   • Check Vercel build logs for specific errors')
  console.log('   • Ensure environment variables are set in Vercel dashboard')
  console.log('   • Try deploying from a clean branch if needed')
  console.log('   • Contact Vercel support if persistent issues')

  console.log('\n🎯 SUCCESS CRITERIA:')
  console.log('   ✅ Site loads without 404 errors')
  console.log('   ✅ API endpoints return valid responses')
  console.log('   ✅ Static files (sitemap, robots.txt) work')
  console.log('   ✅ Sector pages display correctly')

  return {
    emergencyConfigCreated: true,
    nextSteps: [
      'Use emergency configs if needed',
      'Monitor Vercel deployment',
      'Test site functionality',
      'Gradually restore full features'
    ]
  }
}

if (require.main === module) {
  createEmergencyDeployment().catch(console.error)
}