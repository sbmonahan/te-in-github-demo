const axios = require('axios');

async function startExecution(executionId) {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;

    try {
        console.log(`Starting execution: ${executionId}`);
        
        const response = await axios.post(`${testEngineUrl}/api/v1/testjobs/${executionId}/run`, {}, {
            auth: {
                username: username,
                password: password
            },
            timeout: 10000
        });

        console.log(`✓ Execution started successfully`);
        console.log(`✓ Status: ${response.status}`);
        
        return true;
    } catch (error) {
        console.error('✗ Failed to start execution:');
        
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
    if (!executionId) {
        console.error('Usage: node start-execution.js <execution-id>');
        process.exit(1);
    }
    startExecution(executionId);
}

module.exports = { startExecution };