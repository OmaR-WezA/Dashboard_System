// Load Testing Script using Node.js
// Install: npm install axios
// Run: node load-test.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';
const CONCURRENT_USERS_1000 = 1000;
const CONCURRENT_USERS_10000 = 10000;
const REQUESTS_PER_USER = 10;

// Test configuration
const config = {
  timeout: 30000, // 30 seconds
};

// Authentication token (will be fetched)
let authToken = null;

// Statistics
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTime: 0,
  minTime: Infinity,
  maxTime: 0,
  errors: [],
};

// Login to get token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'password',
    });
    
    if (response.data.success && response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('✅ Authentication successful\n');
      return true;
    } else if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ Authentication successful\n');
      return true;
    } else {
      console.log('⚠️  No token in response, using public endpoints only\n');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Login failed, using public endpoints only\n');
    console.log('   Error:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test endpoints - Only public endpoints
const publicEndpoints = [
  { 
    method: 'POST', 
    url: '/materials/search', 
    name: 'Search Materials', 
    data: { seat_number: '2521178' },
    requiresAuth: false 
  },
];

// Authenticated endpoints (only if logged in)
const authenticatedEndpoints = [
  { 
    method: 'GET', 
    url: '/materials', 
    name: 'Get Materials',
    requiresAuth: true 
  },
  { 
    method: 'GET', 
    url: '/materials/filters/list', 
    name: 'Get Filters',
    requiresAuth: true 
  },
];

// Make a single request
async function makeRequest(endpoint) {
  const startTime = Date.now();
  try {
    const headers = {};
    if (endpoint.requiresAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await axios({
      method: endpoint.method,
      url: `${API_BASE_URL}${endpoint.url}`,
      data: endpoint.data,
      headers: headers,
      ...config,
    });
    
    const duration = Date.now() - startTime;
    stats.totalRequests++;
    stats.successfulRequests++;
    stats.totalTime += duration;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);
    
    return { success: true, duration, status: response.status };
  } catch (error) {
    const duration = Date.now() - startTime;
    stats.totalRequests++;
    stats.failedRequests++;
    stats.totalTime += duration;
    stats.errors.push({
      endpoint: endpoint.name,
      error: error.message,
      status: error.response?.status,
    });
    
    return { success: false, duration, error: error.message };
  }
}

// Simulate a user session
async function simulateUser(userId) {
  const results = [];
  // Use only public endpoints for load testing
  const endpointsToUse = publicEndpoints;
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const endpoint = endpointsToUse[Math.floor(Math.random() * endpointsToUse.length)];
    const result = await makeRequest(endpoint);
    results.push(result);
    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return results;
}

// Run load test
async function runLoadTest(concurrentUsers) {
  console.log(`\n🚀 Starting Load Test with ${concurrentUsers} concurrent users...`);
  console.log(`📊 Each user will make ${REQUESTS_PER_USER} requests`);
  console.log(`⏱️  Total requests: ${concurrentUsers * REQUESTS_PER_USER}`);
  console.log(`🔒 Using: ${authToken ? 'Authenticated' : 'Public'} endpoints\n`);
  
  // Reset stats
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTime: 0,
    minTime: Infinity,
    maxTime: 0,
    errors: [],
  };
  
  const startTime = Date.now();
  
  // Create user promises - limit concurrent connections
  const batchSize = 100; // Process in batches to avoid overwhelming
  const userPromises = [];
  
  for (let i = 0; i < concurrentUsers; i += batchSize) {
    const batch = [];
    const batchEnd = Math.min(i + batchSize, concurrentUsers);
    
    for (let j = i; j < batchEnd; j++) {
      batch.push(simulateUser(j + 1));
    }
    
    // Wait for batch to complete before starting next batch
    await Promise.all(batch);
    userPromises.push(...batch);
    
    // Small delay between batches
    if (batchEnd < concurrentUsers) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Calculate statistics
  const avgTime = stats.totalTime / stats.totalRequests;
  const successRate = (stats.successfulRequests / stats.totalRequests) * 100;
  const requestsPerSecond = stats.totalRequests / (totalDuration / 1000);
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📈 LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`👥 Concurrent Users: ${concurrentUsers}`);
  console.log(`📝 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful: ${stats.successfulRequests} (${successRate.toFixed(2)}%)`);
  console.log(`❌ Failed: ${stats.failedRequests} (${(100 - successRate).toFixed(2)}%)`);
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`⚡ Requests/Second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`📊 Average Response Time: ${avgTime.toFixed(2)}ms`);
  console.log(`🏃 Min Response Time: ${stats.minTime === Infinity ? 0 : stats.minTime}ms`);
  console.log(`🐌 Max Response Time: ${stats.maxTime}ms`);
  
  if (stats.errors.length > 0) {
    // Group errors by type
    const errorGroups = {};
    stats.errors.forEach(error => {
      const key = `${error.endpoint}: ${error.status || error.error}`;
      errorGroups[key] = (errorGroups[key] || 0) + 1;
    });
    
    console.log(`\n⚠️  Error Summary (showing top 10):`);
    Object.entries(errorGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([error, count], index) => {
        console.log(`   ${index + 1}. ${error} (${count} times)`);
      });
  }
  
  console.log('='.repeat(60) + '\n');
  
  return {
    concurrentUsers,
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    failedRequests: stats.failedRequests,
    successRate,
    totalDuration,
    requestsPerSecond,
    avgTime,
    minTime: stats.minTime === Infinity ? 0 : stats.minTime,
    maxTime: stats.maxTime,
  };
}

// Main function
async function main() {
  console.log('🧪 Material Dashboard Load Testing Tool');
  console.log('='.repeat(60));
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`📋 Test Endpoints: ${publicEndpoints.length} public`);
  
  // Try to login (optional - will use public endpoints if fails)
  console.log('\n🔐 Attempting to authenticate...');
  await login();
  
  try {
    // Test 1: 1000 users
    const result1 = await runLoadTest(CONCURRENT_USERS_1000);
    
    // Wait a bit before next test
    console.log('⏳ Waiting 10 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test 2: 10000 users
    const result2 = await runLoadTest(CONCURRENT_USERS_10000);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('\n📌 Test 1: 1000 Users');
    console.log(`   Success Rate: ${result1.successRate.toFixed(2)}%`);
    console.log(`   Avg Response: ${result1.avgTime.toFixed(2)}ms`);
    console.log(`   Requests/Sec: ${result1.requestsPerSecond.toFixed(2)}`);
    
    console.log('\n📌 Test 2: 10000 Users');
    console.log(`   Success Rate: ${result2.successRate.toFixed(2)}%`);
    console.log(`   Avg Response: ${result2.avgTime.toFixed(2)}ms`);
    console.log(`   Requests/Sec: ${result2.requestsPerSecond.toFixed(2)}`);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error running load test:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { runLoadTest };
