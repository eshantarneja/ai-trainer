'use client'

// Simple utility to test the API connection from the browser console
export async function testApiConnection() {
  console.log('Testing API connection...');
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5002/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    // Test routines endpoint
    const routinesResponse = await fetch('http://localhost:5002/api/routines');
    const routinesData = await routinesResponse.json();
    console.log('Routines data:', routinesData);
    
    return { success: true, health: healthData, routines: routinesData };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error };
  }
}

// Make this function available on the window object for browser testing
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
}
