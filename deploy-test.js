#!/usr/bin/env node

/**
 * Deployment Test Script for GenPlay Studio 3D
 * 
 * This script helps debug deployment issues by:
 * 1. Testing the build process
 * 2. Checking for common deployment issues
 * 3. Validating environment variables
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 GenPlay Studio 3D - Deployment Test\n')

// Test 1: Check if build process works
console.log('1. Testing build process...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build successful\n')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}

// Test 2: Check if dist folder exists and has required files
console.log('2. Checking build output...')
const distPath = './dist'
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found')
  process.exit(1)
}

const requiredFiles = ['index.html', 'assets']
for (const file of requiredFiles) {
  const filePath = path.join(distPath, file)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file/folder not found: ${file}`)
    process.exit(1)
  }
}
console.log('✅ Build output looks good\n')

// Test 3: Check if AboutPage is included in the build
console.log('3. Checking if AboutPage is included in build...')
const indexPath = path.join(distPath, 'index.html')
const indexContent = fs.readFileSync(indexPath, 'utf8')

// Check in JavaScript bundles for AboutPage
const assetsDir = path.join(distPath, 'assets')
let aboutPageFound = false

if (fs.existsSync(assetsDir)) {
  const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'))
  
  for (const jsFile of jsFiles) {
    const jsPath = path.join(assetsDir, jsFile)
    const jsContent = fs.readFileSync(jsPath, 'utf8')
    
    if (jsContent.includes('AboutPage') || jsContent.includes('About') || jsContent.includes('about')) {
      aboutPageFound = true
      break
    }
  }
}

if (aboutPageFound || indexContent.includes('AboutPage') || indexContent.includes('about')) {
  console.log('✅ AboutPage references found in build\n')
} else {
  console.log('⚠️  AboutPage references not found in build - this might be the issue\n')
}

// Test 4: Check environment variables
console.log('4. Checking environment variables...')
const envVars = [
  'VITE_TRIPO_AI_API_KEY',
  'VITE_RENDER_PROXY_URL'
]

let envIssues = 0
for (const envVar of envVars) {
  if (!process.env[envVar]) {
    console.log(`⚠️  Environment variable not set: ${envVar}`)
    envIssues++
  } else {
    console.log(`✅ Environment variable set: ${envVar}`)
  }
}

if (envIssues > 0) {
  console.log(`\n⚠️  ${envIssues} environment variables not set - this might cause issues in production\n`)
} else {
  console.log('\n✅ All environment variables are set\n')
}

// Test 5: Check package.json scripts
console.log('5. Checking package.json scripts...')
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
const requiredScripts = ['dev', 'build', 'preview']

for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`✅ Script found: ${script}`)
  } else {
    console.log(`❌ Script missing: ${script}`)
  }
}

console.log('\n🎉 Deployment test completed!')
console.log('\nNext steps:')
console.log('1. If build failed, fix the issues above')
console.log('2. If AboutPage is missing, check your routing configuration')
console.log('3. Set missing environment variables in Render dashboard')
console.log('4. Deploy to Render and check the browser console for errors')
console.log('\nTo deploy:')
console.log('1. Push your changes to GitHub')
console.log('2. Go to Render dashboard')
console.log('3. Trigger a new deployment')
console.log('4. Check the deployment logs for any errors')
