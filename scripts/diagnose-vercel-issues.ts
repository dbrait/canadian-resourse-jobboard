#!/usr/bin/env npx tsx

import * as fs from 'fs'
import * as path from 'path'

async function diagnoseVercelIssues() {
  console.log('🔍 Vercel Deployment Diagnostics')
  console.log('🎯 Identifying potential deployment issues')
  console.log('='.repeat(50))

  const issues: string[] = []
  const fixes: string[] = []

  // Check 1: Package.json dependencies
  console.log('1️⃣ Checking package.json...')
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageContent = fs.readFileSync(packagePath, 'utf-8')
    const packageJson = JSON.parse(packageContent)
    
    console.log(`   ✅ Package.json exists`)
    console.log(`   📦 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`)
    console.log(`   🛠️  Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`)
    
    // Check for potential problematic dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    if (!deps['@supabase/supabase-js']) {
      issues.push('Missing @supabase/supabase-js dependency')
      fixes.push('npm install @supabase/supabase-js')
    }
    
    if (!deps['next']) {
      issues.push('Missing Next.js dependency')
      fixes.push('npm install next')
    }
    
    // Check Node.js version
    if (packageJson.engines?.node) {
      console.log(`   🔧 Node version specified: ${packageJson.engines.node}`)
    } else {
      issues.push('No Node.js version specified in package.json')
      fixes.push('Add "engines": {"node": ">=18.0.0"} to package.json')
    }
    
  } catch (error) {
    issues.push('Cannot read package.json')
    console.log(`   ❌ Error reading package.json: ${error}`)
  }

  // Check 2: Next.js configuration
  console.log('\n2️⃣ Checking Next.js configuration...')
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts')
    if (fs.existsSync(nextConfigPath)) {
      console.log(`   ✅ next.config.ts exists`)
      const configContent = fs.readFileSync(nextConfigPath, 'utf-8')
      
      // Check for potential issues
      if (configContent.includes('experimental')) {
        console.log(`   ⚠️  Contains experimental features (may cause issues)`)
        issues.push('Experimental Next.js features detected')
        fixes.push('Review experimental features in next.config.ts')
      }
    } else {
      console.log(`   ⚠️  next.config.ts not found`)
    }
  } catch (error) {
    console.log(`   ❌ Error checking Next.js config: ${error}`)
  }

  // Check 3: API routes structure
  console.log('\n3️⃣ Checking API routes...')
  try {
    const apiPath = path.join(process.cwd(), 'app', 'api')
    if (fs.existsSync(apiPath)) {
      console.log(`   ✅ API directory exists`)
      
      const checkApiRoute = (routePath: string, routeName: string) => {
        const fullPath = path.join(apiPath, routePath, 'route.ts')
        if (fs.existsSync(fullPath)) {
          console.log(`   ✅ ${routeName} API route exists`)
          
          const content = fs.readFileSync(fullPath, 'utf-8')
          if (!content.includes('export async function GET')) {
            issues.push(`${routeName} API missing GET export`)
            fixes.push(`Add 'export async function GET' to ${routePath}/route.ts`)
          }
        } else {
          console.log(`   ❌ ${routeName} API route missing`)
          issues.push(`Missing ${routeName} API route`)
        }
      }
      
      checkApiRoute('jobs', 'Jobs')
      checkApiRoute('jobs/stats', 'Jobs Stats')
      
    } else {
      issues.push('API directory missing')
      console.log(`   ❌ API directory not found`)
    }
  } catch (error) {
    console.log(`   ❌ Error checking API routes: ${error}`)
  }

  // Check 4: Environment variables template
  console.log('\n4️⃣ Checking environment variables...')
  try {
    const envLocalPath = path.join(process.cwd(), '.env.local')
    const envExamplePath = path.join(process.cwd(), '.env.example')
    
    if (fs.existsSync(envLocalPath)) {
      console.log(`   ✅ .env.local exists`)
      const envContent = fs.readFileSync(envLocalPath, 'utf-8')
      
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SCRAPINGBEE_API_KEY'
      ]
      
      for (const varName of requiredVars) {
        if (envContent.includes(varName)) {
          console.log(`   ✅ ${varName} configured`)
        } else {
          console.log(`   ❌ ${varName} missing`)
          issues.push(`Missing environment variable: ${varName}`)
        }
      }
    } else {
      console.log(`   ⚠️  .env.local not found`)
    }
    
    if (!fs.existsSync(envExamplePath)) {
      issues.push('Missing .env.example file for Vercel')
      fixes.push('Create .env.example with required variables')
    } else {
      console.log(`   ✅ .env.example exists`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error checking environment variables: ${error}`)
  }

  // Check 5: Vercel configuration
  console.log('\n5️⃣ Checking Vercel configuration...')
  try {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json')
    if (fs.existsSync(vercelConfigPath)) {
      console.log(`   ✅ vercel.json exists`)
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))
      
      if (vercelConfig.functions) {
        console.log(`   📝 Custom function configuration detected`)
      }
      
      if (vercelConfig.rewrites) {
        console.log(`   🔄 Rewrites configured: ${vercelConfig.rewrites.length}`)
      }
    } else {
      console.log(`   ⚠️  vercel.json not found (this is okay)`)
    }
  } catch (error) {
    console.log(`   ❌ Error checking Vercel config: ${error}`)
  }

  // Check 6: Build files
  console.log('\n6️⃣ Checking build configuration...')
  try {
    const buildFiles = [
      'tsconfig.json',
      'tailwind.config.ts',
      'postcss.config.mjs'
    ]
    
    for (const file of buildFiles) {
      const filePath = path.join(process.cwd(), file)
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} exists`)
      } else {
        console.log(`   ❌ ${file} missing`)
        issues.push(`Missing build file: ${file}`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking build files: ${error}`)
  }

  // Summary and fixes
  console.log('\n' + '='.repeat(50))
  console.log('📋 DIAGNOSIS SUMMARY')
  console.log('='.repeat(50))

  if (issues.length === 0) {
    console.log('\n✅ No obvious issues detected!')
    console.log('   The deployment problem may be:')
    console.log('   • Vercel build timeout')
    console.log('   • Environment variables not set in Vercel dashboard')
    console.log('   • Temporary Vercel service issues')
    console.log('   • Build process hanging on dependencies')
  } else {
    console.log(`\n❌ Found ${issues.length} potential issues:`)
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`)
    })
  }

  if (fixes.length > 0) {
    console.log('\n🔧 SUGGESTED FIXES:')
    fixes.forEach((fix, index) => {
      console.log(`   ${index + 1}. ${fix}`)
    })
  }

  console.log('\n🚀 IMMEDIATE ACTIONS TO TRY:')
  console.log('   1. Check Vercel dashboard for build logs and errors')
  console.log('   2. Verify environment variables are set in Vercel project settings')
  console.log('   3. Try manual redeploy from Vercel dashboard')
  console.log('   4. Check if build is timing out (increase timeout if needed)')
  console.log('   5. Remove any experimental Next.js features temporarily')
  console.log('   6. Simplify package.json if there are conflicting dependencies')

  return { issues, fixes }
}

if (require.main === module) {
  diagnoseVercelIssues().catch(console.error)
}