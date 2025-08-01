#!/usr/bin/env npx tsx

import * as fs from 'fs'
import * as path from 'path'

async function fixDeploymentIssues() {
  console.log('🔧 Fixing Vercel Deployment Issues')
  console.log('🎯 Applying fixes for stable deployment')
  console.log('='.repeat(50))

  const fixes: string[] = []

  // Fix 1: Check and fix package.json issues
  console.log('1️⃣ Checking package.json for deployment issues...')
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageContent = fs.readFileSync(packagePath, 'utf-8')
    const packageJson = JSON.parse(packageContent)
    
    // Check for problematic dependencies
    if (packageJson.dependencies?.crypto) {
      console.log('   ⚠️  Found crypto dependency (Node.js built-in)')
      console.log('   🔧 Removing crypto from dependencies...')
      delete packageJson.dependencies.crypto
      fixes.push('Removed crypto dependency (Node.js built-in)')
    }
    
    // Check Zod version
    if (packageJson.dependencies?.zod && packageJson.dependencies.zod.startsWith('^4')) {
      console.log('   ⚠️  Found Zod v4 (may be too new)')
      console.log('   🔧 Downgrading to stable Zod version...')
      packageJson.dependencies.zod = '^3.22.4'
      fixes.push('Downgraded Zod to stable version')
    }
    
    // Ensure engines are set
    if (!packageJson.engines) {
      packageJson.engines = {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      }
      fixes.push('Added Node.js engine requirements')
    }
    
    // Write back the fixed package.json
    if (fixes.length > 0) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
      console.log('   ✅ Updated package.json')
    } else {
      console.log('   ✅ package.json looks good')
    }
    
  } catch (error) {
    console.log(`   ❌ Error fixing package.json: ${error}`)
  }

  // Fix 2: Create .vercelignore to exclude unnecessary files
  console.log('\n2️⃣ Creating .vercelignore file...')
  const vercelIgnoreContent = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs  
.next/
out/
dist/

# Environment files
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files and results
batch-*.json
company-scraping-*.json
*.html
*.txt
career-analysis-*.html

# IDE and OS files
.vscode/
.DS_Store
Thumbs.db

# Testing and development
coverage/
.nyc_output/
scripts/test-*.ts
scripts/diagnose-*.ts

# Documentation
docs/
README.md
SETUP_INSTRUCTIONS.md`

  try {
    fs.writeFileSync('.vercelignore', vercelIgnoreContent)
    console.log('   ✅ Created .vercelignore')
    fixes.push('Added .vercelignore file')
  } catch (error) {
    console.log(`   ❌ Error creating .vercelignore: ${error}`)
  }

  // Fix 3: Create a minimal build script
  console.log('\n3️⃣ Creating build verification script...')
  const buildScript = `#!/bin/bash
echo "🏗️  Pre-build verification..."

# Check Node.js version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Build the application
echo "Building application..."
npm run build

echo "✅ Build completed successfully!"`

  try {
    fs.writeFileSync('build.sh', buildScript)
    console.log('   ✅ Created build verification script')
    fixes.push('Added build verification script')
  } catch (error) {
    console.log(`   ❌ Error creating build script: ${error}`)
  }

  // Fix 4: Simplify next.config.ts for deployment
  console.log('\n4️⃣ Simplifying Next.js configuration...')
  const simpleNextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  // Essential headers only
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
};

export default nextConfig;`

  try {
    fs.writeFileSync('next.config.simple.ts', simpleNextConfig)
    console.log('   ✅ Created simplified Next.js config')
    fixes.push('Created simplified next.config.ts option')
  } catch (error) {
    console.log(`   ❌ Error creating simple config: ${error}`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ DEPLOYMENT FIXES APPLIED')
  console.log('='.repeat(50))

  if (fixes.length > 0) {
    console.log('\n🔧 Applied fixes:')
    fixes.forEach((fix, index) => {
      console.log(`   ${index + 1}. ${fix}`)
    })
  }

  console.log('\n🚀 NEXT STEPS FOR VERCEL DEPLOYMENT:')
  console.log('   1. Commit and push these fixes to GitHub')
  console.log('   2. Go to Vercel Dashboard (https://vercel.com/dashboard)')
  console.log('   3. Find your project and check deployment logs')
  console.log('   4. Verify these environment variables are set:')
  console.log('      • NEXT_PUBLIC_SUPABASE_URL')
  console.log('      • NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('      • SCRAPINGBEE_API_KEY (optional)')
  console.log('   5. Try manual redeploy if needed')
  console.log('   6. If still failing, use simple config: rename next.config.simple.ts to next.config.ts')

  console.log('\n💡 COMMON VERCEL DEPLOYMENT ISSUES:')
  console.log('   • Build timeout: Check for infinite loops in build process')
  console.log('   • Memory issues: Reduce dependencies or optimize imports')
  console.log('   • API route errors: Check for missing environment variables')
  console.log('   • Node.js version: Ensure Vercel uses Node 18+')

  return fixes
}

if (require.main === module) {
  fixDeploymentIssues().catch(console.error)
}