const axios = require('axios');

async function activateLicense() {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;
    const licenseKey = process.env.TESTENGINE_LICENSE_KEY;

    if (!licenseKey) {
        console.error('❌ TESTENGINE_LICENSE_KEY environment variable not set');
        process.exit(1);
    }

    console.log('Attempting to activate TestEngine license...');

    try {
        // First, try to get current license status
        const statusConfig = {
            timeout: 10000
        };
        
        if (username && password) {
            statusConfig.auth = {
                username: username,
                password: password
            };
        }

        console.log('Checking current license status...');
        
        try {
            const statusResponse = await axios.get(`${testEngineUrl}/api/v1/license`, statusConfig);
            console.log('✓ License status retrieved successfully');
            console.log('License info:', JSON.stringify(statusResponse.data, null, 2));
            
            if (statusResponse.data && statusResponse.data.isValid) {
                console.log('✓ License is already active and valid');
                return true;
            }
        } catch (statusError) {
            console.log('License status check failed, proceeding with activation...');
            if (statusError.response) {
                console.log(`Status check error: ${statusError.response.status} - ${statusError.response.data?.message || statusError.response.statusText}`);
            }
        }

        // Try to activate the license
        console.log('Activating license...');
        
        const activationConfig = {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        };
        
        if (username && password) {
            activationConfig.auth = {
                username: username,
                password: password
            };
        }

        const licenseData = {
            license: licenseKey
        };

        const activationResponse = await axios.post(`${testEngineUrl}/api/v1/license`, licenseData, activationConfig);
        
        console.log('✓ License activated successfully');
        console.log('Activation response:', JSON.stringify(activationResponse.data, null, 2));
        
        return true;
        
    } catch (error) {
        console.error('✗ Failed to activate license:');
        
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
            
            if (error.response.data) {
                console.error('  Full response:', JSON.stringify(error.response.data, null, 2));
            }
        } else {
            console.error(`  Error: ${error.message}`);
        }
        
        return false;
    }
}

if (require.main === module) {
    activateLicense().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { activateLicense };