const axios = require('axios');

async function validateConnection() {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;

    if (!testEngineUrl || !username || !password) {
        console.error('Missing required environment variables:');
        console.error('- TESTENGINE_URL:', testEngineUrl ? '✓' : '✗');
        console.error('- TESTENGINE_USERNAME:', username ? '✓' : '✗');
        console.error('- TESTENGINE_PASSWORD:', password ? '✓' : '✗');
        process.exit(1);
    }

    try {
        console.log('Validating TestEngine connection...');
        
        // Try to authenticate and get server info
        const response = await axios.get(`${testEngineUrl}/api/v1/testjobs`, {
            auth: {
                username: username,
                password: password
            },
            timeout: 10000
        });

        console.log('✓ Successfully connected to TestEngine');
        console.log(`✓ Server URL: ${testEngineUrl}`);
        console.log(`✓ Response status: ${response.status}`);
        
        return true;
    } catch (error) {
        console.error('✗ Failed to connect to TestEngine:');
        
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
            console.error('  No response received - check URL and network connectivity');
        } else {
            console.error(`  Error: ${error.message}`);
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    validateConnection();
}

module.exports = { validateConnection };