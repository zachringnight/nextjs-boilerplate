#!/usr/bin/env tsx
/**
 * Quick Environment Check Script
 * 
 * Quickly validates that the development environment is properly configured.
 * This is a lightweight check that can be run before starting development.
 * 
 * Usage: npm run check:env
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, colors.green);
}

function error(message: string) {
  log(`✗ ${message}`, colors.red);
}

function warning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

function main() {
  log('\n🔍 Environment Check\n', colors.blue);
  
  let hasIssues = false;
  
  // Check Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 20) {
    success(`Node.js version: ${nodeVersion}`);
  } else {
    error(`Node.js version ${nodeVersion} is too old (need 20+)`);
    hasIssues = true;
  }
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    success('Supabase environment variables are configured');
    info(`URL: ${supabaseUrl}`);
  } else {
    warning('Supabase environment variables are NOT configured');
    info('The app will run in offline mode');
    info('To enable Supabase:');
    info('  1. Copy .env.example to .env.local');
    info('  2. Add your Supabase credentials');
    info('  3. Run: npm run test:supabase');
  }
  
  // Check for .env.local
  const fs = require('fs');
  const path = require('path');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envLocalPath)) {
    success('.env.local file exists');
  } else {
    warning('.env.local file not found');
    info('Create it by copying .env.example:');
    info('  cp .env.example .env.local');
  }
  
  log('');
  if (hasIssues) {
    error('❌ Please fix the issues above before continuing\n');
    process.exit(1);
  } else {
    success('✅ Environment looks good!\n');
    if (!supabaseUrl || !supabaseKey) {
      info('💡 Tip: Configure Supabase to enable all features\n');
    } else {
      info('💡 Tip: Run "npm run test:supabase" to verify your setup\n');
    }
    process.exit(0);
  }
}

main();
