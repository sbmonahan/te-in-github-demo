const axios = require('axios');

async function activateLicense(maxRetries = 3) {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;
    const slmAccessKey = process.env.SLM_ACCESS_KEY;
    const slmServer = process.env.TE_SLM_SERVER;

    if (!slmAccessKey) {
        console.error('❌ SLM_ACCESS_KEY environment variable not set');
        console.error('   This should be your SmartBear License Manager access key');
        process.exit(1);
    }

    if (!username || !password) {
        console.error('❌ TESTENGINE_USERNAME and TESTENGINE_PASSWORD must be set');
        process.exit(1);
    }

    console.log('Activating TestEngine license via SLM...');
    
    if (slmServer) {
        console.log(`Using SLM server: ${slmServer}`);
    } else {
        console.log('Using hosted SLM (no server override).');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`\n--- Attempt ${attempt}/${maxRetries} ---`);
        
        try {
        // First, try to get current license status
        const statusConfig = {
            timeout: 10000,
            auth: {
                username: username,
                password: password
            }
        };

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

        // Build the SLM license request (matching your Docker Compose pattern)
        const licenseData = {
            issuer: "SLM",
            accessKey: slmAccessKey
        };
        
        // Add SLM server if specified
        if (slmServer) {
            licenseData.server = slmServer;
        }
        
        console.log('--- Request (redacted) ---');
        const redactedData = { ...licenseData, accessKey: "****REDACTED****" };
        console.log(JSON.stringify(redactedData, null, 2));
        console.log('--------------------------');
        
        // Show credentials being used (redacted)
        console.log(`Using credentials: ${username}:${"*".repeat(password.length)}`);
        
        // Activate the license via SLM
        console.log('Activating license via SLM...');
        
        const activationConfig = {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000,
            auth: {
                username: username,
                password: password
            }
        };

        const activationResponse = await axios.post(`${testEngineUrl}/api/v1/license`, licenseData, activationConfig);
        
        console.log(`License activation -> HTTP ${activationResponse.status}`);
        console.log('--- Response body ---');
        console.log(JSON.stringify(activationResponse.data, null, 2));
        console.log('---------------------');
        
        if (activationResponse.status === 200) {
            console.log('✓ License installed/activated.');
        } else {
            console.log(`⚠️ Unexpected HTTP ${activationResponse.status} but no error thrown.`);
        }
        
        // Get final license status
        console.log('--- Final license state ---');
        try {
            const finalStatusResponse = await axios.get(`${testEngineUrl}/api/v1/license`, statusConfig);
            console.log(JSON.stringify(finalStatusResponse.data, null, 2));
        } catch (finalError) {
            console.log('Could not retrieve final license status:', finalError.message);
        }
        
        console.log('✅ License activation completed successfully');
        return true;
        
    } catch (error) {
        console.error('✗ Failed to activate license:');
        
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
            
            // Handle specific cases like your Docker script
            if (error.response.status === 400) {
                const message = error.response.data?.message || '';
                if (message.toLowerCase().includes('already') && message.toLowerCase().includes('license')) {
                    console.log('✓ License already installed (treating as success).');
                    return true;
                } else {
                    console.error('400 Bad Request from TestEngine. See response above.');
                }
            }
            
            if (error.response.data) {
                console.error('  Full response:', JSON.stringify(error.response.data, null, 2));
            }
        } else {
            console.error(`  Error: ${error.message}`);
        }
        
            // If this is not the last attempt, wait before retrying
            if (attempt < maxRetries) {
                console.log(`Waiting 15 seconds before retry ${attempt + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 15000));
            }
        }
    }
    
    console.error('❌ All license activation attempts failed');
    return false;
}

if (require.main === module) {
    activateLicense().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { activateLicense };