const axios = require('axios');

// Shared authentication helper
function createAxiosConfig(baseUrl, username, password, timeout = 10000) {
    const config = {
        baseURL: baseUrl,
        timeout: timeout
    };
    
    if (username && password) {
        config.auth = { username, password };
    }
    
    return axios.create(config);
}

// Shared error handler for TestEngine API calls
function handleTestEngineError(error, operation = 'operation') {
    console.error(`✗ Failed to ${operation}:`);
    
    if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
        
        if (error.response.status === 403 && error.response.data?.message?.includes('license')) {
            console.error('\n🔑 LICENSE ISSUE DETECTED:');
            console.error('  - Check your TestEngine license key');
            console.error('  - Ensure license is not in use elsewhere');
            console.error('  - Contact SmartBear support if issue persists');
        }
    } else if (error.request) {
        console.error('  No response received - check TestEngine connectivity');
    } else {
        console.error(`  Error: ${error.message}`);
    }
    
    throw error;
}

module.exports = { createAxiosConfig, handleTestEngineError };