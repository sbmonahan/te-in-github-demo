const axios = require('axios');

async function validateConnection() {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;

    if (!testEngineUrl) {
        console.error('Missing required environment variables:');
        console.error('- TESTENGINE_URL:', testEngineUrl ? '✓' : '✗');
        console.error('- TESTENGINE_USERNAME:', username !== undefined ? '✓' : '✗');
        console.error('- TESTENGINE_PASSWORD:', password !== undefined ? '✓' : '✗');
        process.exit(1);
    }
    
    console.log('Environment variables:');
    console.log('- TESTENGINE_URL:', testEngineUrl ? '✓' : '✗');
    console.log('- TESTENGINE_USERNAME:', username !== undefined ? '✓ (optional)' : '✗');
    console.log('- TESTENGINE_PASSWORD:', password !== undefined ? '✓' : '✗');

    try {
        console.log('Validating TestEngine connection...');
        
        // Try to authenticate and get server info
        const config = {
            timeout: 10000
        };
        
        // Try authentication with provided credentials
        if (username && password) {
            config.auth = {
                username: username,
                password: password
            };
        }
        
        const response = await axios.get(`${testEngineUrl}/api/v1/version`, config);

        console.log('✓ Successfully connected to TestEngine');
        console.log(`✓ Server URL: ${testEngineUrl}`);
        console.log(`✓ Response status: ${response.status}`);
        console.log(`✓ TestEngine version: ${response.data?.version || 'unknown'}`);
        
        return true;
    } catch (error) {
        console.error('✗ Failed to connect to TestEngine:');
        
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
            
            // Specific handling for license issues
            if (error.response.status === 403) {
                console.error('\n🔑 LICENSE ISSUE DETECTED:');
                const message = error.response.data?.message || '';
                
                if (message.includes('license')) {
                    console.error('  This appears to be a TestEngine license problem.');
                    console.error('  Common causes:');
                    console.error('  1. License key is invalid or expired');
                    console.error('  2. License key is already in use by another instance');
                    console.error('  3. License key format is incorrect');
                    console.error('  4. TestEngine version doesn\'t match license');
                    console.error('\n  Solutions:');
                    console.error('  - Verify your license key in GitHub Secrets');
                    console.error('  - Check if TestEngine is running elsewhere with same license');
                    console.error('  - Contact SmartBear support if license should be valid');
                }
            }
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