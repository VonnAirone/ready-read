// Google Speech API Debugging Test
// Run this in browser console or Node.js to test basic API connectivity

async function testGoogleSpeechAPI() {
  const API_KEY = 'AIzaSyAdgs1_BFN4tRCxsJgpxlFl0dzNbwVjtNg';
  
  // Test 1: Basic API connectivity with minimal valid request
  console.log('🧪 Test 1: Basic API connectivity');
  
  const minimalRequest = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
    audio: {
      content: '' // Empty content to test API acceptance
    }
  };

  try {
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalRequest)
      }
    );

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ API connectivity: OK');
      console.log('✅ Request format: Valid');
      console.log('ℹ️ Empty audio expected to return no results');
    } else {
      console.log('❌ API Error:', data.error);
    }
    
  } catch (error) {
    console.log('❌ Network/Request Error:', error);
  }

  // Test 2: Check API quotas and permissions
  console.log('\n🧪 Test 2: API Status Check');
  
  try {
    const quotaResponse = await fetch(
      `https://speech.googleapis.com/v1/operations?key=${API_KEY}`,
      { method: 'GET' }
    );
    
    console.log('Quota check status:', quotaResponse.status);
    
    if (quotaResponse.status === 200) {
      console.log('✅ API Key: Valid and has permissions');
    } else if (quotaResponse.status === 403) {
      console.log('❌ API Key: No permissions or quota exceeded');
    } else if (quotaResponse.status === 401) {
      console.log('❌ API Key: Invalid or expired');
    }
    
  } catch (error) {
    console.log('❌ Quota check failed:', error);
  }
}

// Test 3: Sample audio data validation
function validateAudioData(base64Data) {
  console.log('\n🧪 Test 3: Audio Data Validation');
  
  if (!base64Data || base64Data.length === 0) {
    console.log('❌ Empty audio data');
    return false;
  }
  
  // Check if it's valid base64
  try {
    const decoded = atob(base64Data);
    console.log('✅ Valid base64 encoding');
    console.log('📊 Audio data stats:', {
      base64Length: base64Data.length,
      decodedLength: decoded.length,
      estimatedDurationSeconds: decoded.length / (16000 * 2), // 16kHz * 2 bytes per sample
      firstBytes: Array.from(decoded.slice(0, 10)).map(c => c.charCodeAt(0))
    });
    
    // Check minimum length (should be at least 0.1 seconds of audio)
    if (decoded.length < 3200) { // 16000Hz * 2 bytes * 0.1 seconds
      console.log('⚠️ Audio might be too short (< 0.1 seconds)');
    } else {
      console.log('✅ Audio length appears sufficient');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Invalid base64 data:', error);
    return false;
  }
}

// Run the test
console.log('🚀 Starting Google Speech API Debug Test...');
testGoogleSpeechAPI();

// Export for use in React Native
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGoogleSpeechAPI, validateAudioData };
}