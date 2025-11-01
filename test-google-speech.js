// Simple test for Google Cloud Speech API
const GOOGLE_CLOUD_API_KEY = 'AIzaSyAdgs1_BFN4tRCxsJgpxlFl0dzNbwVjtNg';

async function testGoogleSpeechAPI() {
  try {
    console.log('Testing Google Cloud Speech API...');
    
    // Test a simple request to see if API key is valid
    const testPayload = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'latest_short'
      },
      audio: {
        // Empty content to test API connectivity
        content: ""
      }
    };

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      }
    );

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('API Error:', data.error);
    } else {
      console.log('API is accessible!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGoogleSpeechAPI();