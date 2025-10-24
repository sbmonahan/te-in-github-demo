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
            const response = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}`, {
                auth: {
                    username: username,
                    password: password
                },
                timeout: 10000
            });

            const status = response.data.status;
            const currentStatus = response.data.currentStatus;
            
            console.log(`Status: ${status} | Current: ${currentStatus}`);
            
            // Check if execution is complete
            if (status === 'FINISHED') {
                console.log('✓ Execution completed successfully');
                return {
                    status: status,
                    currentStatus: currentStatus,
                    result: response.data
                };
            } else if (status === 'FAILED' || status === 'CANCELED') {
                console.error(`✗ Execution ${status.toLowerCase()}`);
                console.error('Final status:', response.data);
                process.exit(1);
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