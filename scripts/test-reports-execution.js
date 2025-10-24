const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');

async function testReportsWithRealExecution() {
    const testEngineUrl = process.env.TESTENGINE_URL || 'http://localhost:8080';
    const username = process.env.TESTENGINE_USERNAME || 'admin';
    const password = process.env.TESTENGINE_PASSWORD || 'admin';
    
    const authConfig = {
        auth: { username, password },
        timeout: 10000
    };

    console.log('Testing actual report generation with a simple test project...\n');

    try {
        // First, create a minimal test project and upload it
        console.log('Step 1: Testing minimal project upload with basic reporting...');
        
        const formData = new FormData();
        
        // Use the existing project file
        const projectPath = './readyapi-projects/test-project.xml';
        if (await fs.pathExists(projectPath)) {
            const fileStream = fs.createReadStream(projectPath);
            formData.append('file', fileStream);
            formData.append('testSuite', 'Test Suite 1');
            
            // Test ONLY the most basic reporting parameters first
            formData.append('generateJunitReport', 'true');
            
            const uploadResponse = await axios.post(`${testEngineUrl}/api/v1/testjobs`, formData, {
                headers: { ...formData.getHeaders() },
                ...authConfig
            });
            
            const executionId = uploadResponse.data.testjobId;
            console.log(`✓ Test project uploaded with ID: ${executionId}`);
            
            // Wait for completion
            console.log('Step 2: Waiting for test completion...');
            let status = 'RUNNING';
            while (status === 'RUNNING') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const statusResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/status`, authConfig);
                status = statusResponse.data.status;
                console.log(`Status: ${status}`);
            }
            
            // Test all possible report endpoints
            console.log('\nStep 3: Testing report endpoint variations...');
            
            const reportEndpoints = [
                // Standard endpoints
                `/api/v1/testjobs/${executionId}/report`,
                `/api/v1/testjobs/${executionId}/reports`,
                
                // Format-specific endpoints
                `/api/v1/testjobs/${executionId}/report.json`,
                `/api/v1/testjobs/${executionId}/report.xml`,
                `/api/v1/testjobs/${executionId}/report.pdf`,
                `/api/v1/testjobs/${executionId}/report.html`,
                `/api/v1/testjobs/${executionId}/report.xlsx`,
                
                // Alternative patterns
                `/api/v1/testjobs/${executionId}/reports/json`,
                `/api/v1/testjobs/${executionId}/reports/xml`,
                `/api/v1/testjobs/${executionId}/reports/junit`,
                `/api/v1/testjobs/${executionId}/reports/pdf`,
                `/api/v1/testjobs/${executionId}/reports/html`,
                `/api/v1/testjobs/${executionId}/reports/excel`,
                
                // Other possibilities
                `/api/v1/testjobs/${executionId}/result`,
                `/api/v1/testjobs/${executionId}/results`,
                `/api/v1/testjobs/${executionId}/logs`,
            ];
            
            const availableEndpoints = [];
            
            for (const endpoint of reportEndpoints) {
                try {
                    const response = await axios.get(`${testEngineUrl}${endpoint}`, {
                        ...authConfig,
                        responseType: 'arraybuffer', // Handle binary data
                        maxContentLength: Infinity
                    });
                    
                    console.log(`✓ ${endpoint} - Status: ${response.status}, Content-Type: ${response.headers['content-type']}, Size: ${response.data.length} bytes`);
                    availableEndpoints.push({
                        endpoint,
                        status: response.status,
                        contentType: response.headers['content-type'],
                        size: response.data.length
                    });
                    
                } catch (error) {
                    const status = error.response?.status || 'ERROR';
                    if (status !== 404) {
                        console.log(`✗ ${endpoint} - Status: ${status}`);
                    }
                }
            }
            
            console.log(`\n=== SUMMARY ===`);
            console.log(`Available report endpoints for execution ${executionId}:`);
            availableEndpoints.forEach(ep => {
                console.log(`  ${ep.endpoint}`);
                console.log(`    Content-Type: ${ep.contentType}`);
                console.log(`    Size: ${ep.size} bytes`);
            });
            
            if (availableEndpoints.length === 0) {
                console.log('No report endpoints found! This suggests:');
                console.log('1. Reports are not being generated despite parameters');
                console.log('2. TestEngine version doesn\'t support additional report formats');
                console.log('3. Different API structure is used');
            }
            
        } else {
            console.log('No test project found. Please run this after uploading a project.');
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

if (require.main === module) {
    testReportsWithRealExecution().catch(console.error);
}

module.exports = { testReportsWithRealExecution };