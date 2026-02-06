#!/usr/bin/env tsx
/**
 * Supabase Connection Test Script
 * 
 * This script tests the Supabase connection and verifies:
 * 1. Environment variables are configured
 * 2. Can establish connection to Supabase
 * 3. Can query database tables (if they exist)
 * 4. Basic CRUD operations work
 * 
 * Usage: npm run test:supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../app/prizm/types/database';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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

function info(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

function warning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function section(message: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(message, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

async function testEnvironmentVariables(): Promise<boolean> {
  section('TEST 1: Environment Variables');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    error('NEXT_PUBLIC_SUPABASE_URL is not set');
    return false;
  }
  success(`NEXT_PUBLIC_SUPABASE_URL is set: ${supabaseUrl}`);
  
  if (!supabaseAnonKey) {
    error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return false;
  }
  success('NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  
  // Validate URL format
  try {
    new URL(supabaseUrl);
    success('NEXT_PUBLIC_SUPABASE_URL is a valid URL');
  } catch {
    error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    return false;
  }
  
  return true;
}

async function testConnection(client: SupabaseClient<Database>): Promise<boolean> {
  section('TEST 2: Basic Connection');
  
  try {
    const { error } = await client.auth.getSession();
    
    if (error) {
      error(`Connection failed: ${error.message}`);
      return false;
    }
    
    success('Successfully connected to Supabase');
    success('Auth session check passed');
    return true;
  } catch (err) {
    error(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function testDatabaseAccess(client: SupabaseClient<Database>): Promise<boolean> {
  section('TEST 3: Database Access');
  
  const tables = ['notes', 'deliverables', 'schedule_slots', 'player_station_completions'];
  let allPassed = true;
  
  for (const table of tables) {
    try {
      // Try to query the table with a limit of 0 to just check access
      const { error } = await client.from(table as any).select('*').limit(0);
      
      if (error) {
        if (error.code === '42P01') {
          warning(`Table '${table}' does not exist yet (run migration.sql)`);
        } else {
          error(`Error accessing table '${table}': ${error.message}`);
          allPassed = false;
        }
      } else {
        success(`Table '${table}' is accessible`);
      }
    } catch (err) {
      error(`Unexpected error querying table '${table}': ${err instanceof Error ? err.message : String(err)}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testBasicOperations(client: SupabaseClient<Database>): Promise<boolean> {
  section('TEST 4: Basic CRUD Operations (Notes Table)');
  
  try {
    // Test INSERT
    info('Testing INSERT operation...');
    const testNote = {
      category: 'test',
      priority: 'low' as const,
      status: 'open' as const,
      description: 'Test note from connection test script',
      created_at: new Date().toISOString(),
    };
    
    const { data: insertData, error: insertError } = await client
      .from('notes')
      .insert(testNote)
      .select()
      .single();
    
    if (insertError) {
      if (insertError.code === '42P01') {
        warning('Notes table does not exist - skipping CRUD tests');
        info('Run the migration.sql file in your Supabase SQL Editor to create tables');
        return true;
      }
      error(`INSERT failed: ${insertError.message}`);
      return false;
    }
    
    success(`INSERT successful (ID: ${insertData.id})`);
    const testId = insertData.id;
    
    // Test SELECT
    info('Testing SELECT operation...');
    const { data: selectData, error: selectError } = await client
      .from('notes')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (selectError) {
      error(`SELECT failed: ${selectError.message}`);
      return false;
    }
    
    success('SELECT successful');
    
    // Test UPDATE
    info('Testing UPDATE operation...');
    const { error: updateError } = await client
      .from('notes')
      .update({ description: 'Updated test note' })
      .eq('id', testId);
    
    if (updateError) {
      error(`UPDATE failed: ${updateError.message}`);
      return false;
    }
    
    success('UPDATE successful');
    
    // Test DELETE
    info('Testing DELETE operation...');
    const { error: deleteError } = await client
      .from('notes')
      .delete()
      .eq('id', testId);
    
    if (deleteError) {
      error(`DELETE failed: ${deleteError.message}`);
      return false;
    }
    
    success('DELETE successful');
    success('All CRUD operations passed');
    
    return true;
  } catch (err) {
    error(`Unexpected error during CRUD tests: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function testRealtimeConnection(client: SupabaseClient<Database>): Promise<boolean> {
  section('TEST 5: Realtime Connection');
  
  return new Promise((resolve) => {
    try {
      info('Testing realtime subscription...');
      
      const channel = client
        .channel('test-channel')
        .on('presence', { event: 'sync' }, () => {
          // Presence sync callback
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            success('Realtime connection established');
            success('Realtime features are working');
            channel.unsubscribe();
            resolve(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            error(`Realtime connection failed: ${status}`);
            channel.unsubscribe();
            resolve(false);
          }
        });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        warning('Realtime connection test timed out');
        channel.unsubscribe();
        resolve(false);
      }, 10000);
    } catch (err) {
      error(`Realtime test error: ${err instanceof Error ? err.message : String(err)}`);
      resolve(false);
    }
  });
}

async function main() {
  log('\n🔍 Supabase Connection Test Suite\n', colors.cyan);
  
  const results: { test: string; passed: boolean }[] = [];
  
  // Test 1: Environment Variables
  const envTest = await testEnvironmentVariables();
  results.push({ test: 'Environment Variables', passed: envTest });
  
  if (!envTest) {
    section('SUMMARY');
    error('Cannot proceed without environment variables');
    info('Please create a .env.local file with:');
    info('  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    info('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }
  
  // Create client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  // Test 2: Basic Connection
  const connectionTest = await testConnection(client);
  results.push({ test: 'Basic Connection', passed: connectionTest });
  
  if (!connectionTest) {
    section('SUMMARY');
    error('Cannot proceed without a working connection');
    process.exit(1);
  }
  
  // Test 3: Database Access
  const dbAccessTest = await testDatabaseAccess(client);
  results.push({ test: 'Database Access', passed: dbAccessTest });
  
  // Test 4: CRUD Operations
  const crudTest = await testBasicOperations(client);
  results.push({ test: 'CRUD Operations', passed: crudTest });
  
  // Test 5: Realtime Connection
  const realtimeTest = await testRealtimeConnection(client);
  results.push({ test: 'Realtime Connection', passed: realtimeTest });
  
  // Summary
  section('SUMMARY');
  log('');
  results.forEach(({ test, passed }) => {
    if (passed) {
      success(`${test}: PASSED`);
    } else {
      error(`${test}: FAILED`);
    }
  });
  
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  log('');
  if (allPassed) {
    success(`\n🎉 All tests passed! (${passedCount}/${totalCount})`);
    success('Your Supabase connection is working correctly!\n');
    process.exit(0);
  } else {
    warning(`\n⚠️  Some tests failed (${passedCount}/${totalCount} passed)`);
    info('Please review the errors above and fix any issues.\n');
    process.exit(1);
  }
}

// Run the tests
main().catch((err) => {
  error(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
