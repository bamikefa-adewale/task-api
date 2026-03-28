/**
 * WebSocket Test Script for Google Maps Integration
 * 
 * This script tests the WebSocket functionality for real-time trip updates
 * Run with: node test-websocket.js
 */

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3008';
const DRIVER_ID = 'test-driver-123';
const RIDER_ID = 'test-rider-456';

console.log('🚀 Starting WebSocket Test for Google Maps Integration...\n');

// Connect to WebSocket server
const socket = io(SERVER_URL, {
  transports: ['websocket'],
  timeout: 20000,
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log(`📡 Socket ID: ${socket.id}\n`);
  
  // Join as a driver to receive trip requests
  console.log('👨‍💼 Joining as driver...');
  socket.emit('join', { 
    userId: DRIVER_ID, 
    userType: 'driver' 
  });
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from WebSocket server');
  console.log(`Reason: ${reason}\n`);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

// Trip-related events
socket.on('trip:request', (data) => {
  console.log('🚗 Received trip request:');
  console.log(`   Trip ID: ${data.id}`);
  console.log(`   Rider ID: ${data.riderId}`);
  console.log(`   Pickup: ${data.pickup.address} (${data.pickup.latitude}, ${data.pickup.longitude})`);
  console.log(`   Dropoff: ${data.dropoff.address} (${data.dropoff.latitude}, ${data.dropoff.longitude})`);
  console.log(`   Estimated Fare: $${data.estimatedFare}`);
  console.log(`   Timestamp: ${data.timestamp}\n`);
  
  // Simulate driver accepting the trip after 2 seconds
  setTimeout(() => {
    console.log('✅ Simulating trip acceptance...');
    // In a real scenario, you would call the API endpoint here
    // For testing, we'll just log the action
    console.log(`   Would accept trip ${data.id} for driver ${DRIVER_ID}\n`);
  }, 2000);
});

socket.on('trip:accept', (data) => {
  console.log('✅ Trip accepted:');
  console.log(`   Trip ID: ${data.tripId}`);
  console.log(`   Driver ID: ${data.driverId}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Timestamp: ${data.timestamp}\n`);
});

socket.on('trip:update', (data) => {
  console.log('🔄 Trip status updated:');
  console.log(`   Trip ID: ${data.id}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Driver ID: ${data.driverId || 'N/A'}`);
  console.log(`   Rider ID: ${data.riderId}\n`);
});

socket.on('trip:location', (data) => {
  console.log('📍 Driver location update:');
  console.log(`   Driver ID: ${data.driverId}`);
  console.log(`   Location: (${data.latitude}, ${data.longitude})`);
  console.log(`   Timestamp: ${data.timestamp}\n`);
});

// Error handling
socket.on('error', (error) => {
  console.log('❌ WebSocket error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket test...');
  socket.disconnect();
  process.exit(0);
});

// Keep the script running
console.log('📡 WebSocket test is running. Press Ctrl+C to stop.\n');
console.log('💡 To test trip requests:');
console.log('   1. Make sure the server is running');
console.log('   2. Use the HTTP test file to request a trip');
console.log('   3. Watch for WebSocket notifications here\n');

// Test connection every 30 seconds
setInterval(() => {
  if (socket.connected) {
    console.log('💓 WebSocket connection is alive');
  } else {
    console.log('⚠️  WebSocket connection is not active');
  }
}, 30000);
