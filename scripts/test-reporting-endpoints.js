const axios = require('axios');

async function testReportingEndpoints() {
    const testEngineUrl = process.env.TESTENGINE_URL || 'http://localhost:8080';
    const username = process.env.TESTENGINE_USERNAME || 'admin';
    const password = process.env.TESTENGINE_PASSWORD || 'admin';
    
    const authConfig = {
        auth: {
            username: username,
            password: password
        },
        timeout: 10000
    };

    console.log('Testing TestEngine API endpoints for reporting capabilities...');
    console.log(`TestEngine URL: ${testEngineUrl}`);

    // Test various API endpoints to see what's available
    const endpointsToTest = [
        '/api/v1/version',
        '/api/v1/testjobs',
        '/api/v1/reports',
        '/api/v1/reports/formats',
        '/api/v1/help',
        '/api/v1/info',
        '/api/v1/capabilities'
    ];

    for (const endpoint of endpointsToTest) {
        try {
            console.log(`\n--- Testing ${endpoint} ---`);
            const response = await axios.get(`${testEngineUrl}${endpoint}`, authConfig);
            console.log(`✓ Status: ${response.status}`);
            
            if (response.data) {
                if (typeof response.data === 'string') {
                    console.log(`Response: ${response.data.substring(0, 200)}...`);
                } else {
                    console.log('Response:', JSON.stringify(response.data, null, 2));
                }
            }
        } catch (error) {
            console.log(`✗ Failed: ${error.response?.status || error.message}`);
        }
    }

    console.log('\n--- Testing job-specific report endpoints (requires execution ID) ---');
    console.log('Note: These will fail without a valid execution ID, but show us available endpoints');
    
    const jobEndpoints = [
        '/api/v1/testjobs/TEST_ID/report',
        '/api/v1/testjobs/TEST_ID/reports',
        '/api/v1/testjobs/TEST_ID/reports/junit',
        '/api/v1/testjobs/TEST_ID/reports/pdf', 
        '/api/v1/testjobs/TEST_ID/reports/excel',
        '/api/v1/testjobs/TEST_ID/reports/html',
        '/api/v1/testjobs/TEST_ID/report/pdf',
        '/api/v1/testjobs/TEST_ID/report/excel',
        '/api/v1/testjobs/TEST_ID/report/html',
        '/api/v1/testjobs/TEST_ID/logs'
    ];

    for (const endpoint of jobEndpoints) {
        try {
            console.log(`\n--- Testing ${endpoint} ---`);
            const response = await axios.get(`${testEngineUrl}${endpoint}`, authConfig);
            console.log(`✓ Status: ${response.status} (unexpected success!)`);
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) {
                console.log(`✗ 404 - Endpoint not found`);
            } else if (status === 400) {
                console.log(`⚠ 400 - Endpoint exists but needs valid ID`);
            } else {
                console.log(`✗ ${status} - ${error.response?.data?.message || error.message}`);
            }
        }
    }
}

if (require.main === module) {
    testReportingEndpoints().catch(console.error);
}

module.exports = { testReportingEndpoints };