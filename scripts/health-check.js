const axios = require('axios');

async function waitForTestEngine(maxWaitSeconds = 120) {
    const testEngineUrl = process.env.TESTENGINE_URL || 'http://localhost:8080';
    const pollIntervalMs = 5000; // 5 seconds
    const maxAttempts = Math.floor(maxWaitSeconds / 5);
    
    console.log(`Waiting for TestEngine to be ready at ${testEngineUrl}...`);
    console.log(`Max wait time: ${maxWaitSeconds} seconds (${maxAttempts} attempts)`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxAttempts}: Testing TestEngine readiness...`);
            
            // Test the version endpoint - single success is sufficient for ephemeral CI environment
            const response = await axios.get(`${testEngineUrl}/api/v1/version`, {
                timeout: 5000,
                validateStatus: function (status) {
                    return status < 500; // Accept any response that's not a server error
                }
            });
            
            console.log(`✅ TestEngine is ready and responding! (HTTP ${response.status})`);
            console.log(`TestEngine version info:`, response.data);
            return true;
            
        } catch (error) {
            if (attempt === maxAttempts) {
                // Last attempt - show detailed error and container logs
                console.error('❌ TestEngine failed to start within timeout');
                console.error(`Final error: ${error.message}`);
                
                if (error.code === 'ECONNREFUSED') {
                    console.error('Connection refused - TestEngine container may not be running or ready');
                } else if (error.code === 'ETIMEDOUT') {
                    console.error('Request timed out - TestEngine may be starting up');
                }
                
                // Try to get container logs for debugging
                console.log('\n--- TestEngine Container Logs (last 50 lines) ---');
                try {
                    const { exec } = require('child_process');
                    exec('docker logs testengine --tail 50', (err, stdout, stderr) => {
                        if (stdout) console.log(stdout);
                        if (stderr) console.error(stderr);
                        process.exit(1);
                    });
                    // Give time for logs to print
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return false;
                } catch (logError) {
                    console.error('Could not retrieve container logs:', logError.message);
                    process.exit(1);
                }
            } else {
                // Not the last attempt - brief message and continue
                const errorType = error.code || error.response?.status || 'unknown';
                console.log(`Not ready yet (${errorType}), waiting 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
            }
        }
    }
    
    return false;
}

if (require.main === module) {
    const maxWaitSeconds = process.argv[2] ? parseInt(process.argv[2]) : 120;
    
    waitForTestEngine(maxWaitSeconds).then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Health check failed with error:', error.message);
        process.exit(1);
    });
}

module.exports = { waitForTestEngine };