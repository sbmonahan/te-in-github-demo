const axios = require('axios');

async function pollExecution(executionId, maxWaitMinutes = 30) {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;
    
    const maxWaitMs = maxWaitMinutes * 60 * 1000;
    const pollIntervalMs = 10000; // 10 seconds
    const startTime = Date.now();

    try {
        console.log(`Polling execution: ${executionId}`);
        console.log(`Max wait time: ${maxWaitMinutes} minutes`);
        
        while (Date.now() - startTime < maxWaitMs) {
            const config = {
                timeout: 10000
            };
            
            // If username and password are provided, use basic authentication
            if (username && password) {
                config.auth = {
                    username: username,
                    password: password
                };
            }
            
            // Use the same endpoint as your working Python code
            const response = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/report`, config);

            const status = response.data.status;
            const submitTime = response.data.submitTime;
            const startTime = response.data.startTime;
            
            console.log(`Status: ${status}`);
            if (submitTime) console.log(`Submit Time: ${new Date(submitTime).toISOString()}`);
            if (startTime) console.log(`Start Time: ${new Date(startTime).toISOString()}`);
            
            // Use the same terminal statuses as your Python code
            const TERMINAL_STATUSES = new Set(['FINISHED', 'FAILED', 'CANCELED']);
            
            if (TERMINAL_STATUSES.has(status)) {
                if (status === 'FINISHED') {
                    console.log('✓ Execution completed successfully');
                    return {
                        status: status,
                        result: response.data
                    };
                } else {
                    console.error(`✗ Execution ${status.toLowerCase()}`);
                    console.error('Final report:', response.data);
                    process.exit(1);
                }
            }
            
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }
        
        // Timeout reached
        console.error('✗ Execution timed out');
        console.error(`Maximum wait time of ${maxWaitMinutes} minutes exceeded`);
        process.exit(1);
        
    } catch (error) {
        console.error('✗ Failed to poll execution:');
        
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
        } else {
            console.error(`  Error: ${error.message}`);
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    const executionId = process.argv[2];
    const maxWaitMinutes = process.argv[3] ? parseInt(process.argv[3]) : 30;
    
    if (!executionId) {
        console.error('Usage: node poll-execution.js <execution-id> [max-wait-minutes]');
        process.exit(1);
    }
    
    pollExecution(executionId, maxWaitMinutes);
}

module.exports = { pollExecution };