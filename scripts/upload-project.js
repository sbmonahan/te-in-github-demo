const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');

async function uploadProject(projectFileName) {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;

    const projectPath = path.join(process.cwd(), 'readyapi-projects', projectFileName);
    
    if (!await fs.pathExists(projectPath)) {
        console.error(`Project file not found: ${projectPath}`);
        process.exit(1);
    }

    try {
        console.error(`Uploading project: ${projectFileName}`);
        
        const formData = new FormData();
        const fileStream = fs.createReadStream(projectPath);
        
        // Add all required form fields (using correct test suite name from project)
        formData.append('file', fileStream);
        formData.append('testSuite', 'Test Suite 1');  // Actual test suite name from ReadyAPI project!
        formData.append('jobDescription', `tag=GitHub Actions,label=${projectFileName}`);
        formData.append('environment', 'GitHub Actions Container');
        
        // Enable multiple report formats
        formData.append('generateJunitReport', 'true');     // Enable JUnit XML report
        formData.append('generateReport', 'true');          // Enable HTML/PDF report generation
        formData.append('reportFormat', 'PDF');             // Specify PDF format
        formData.append('generateExcelReport', 'true');     // Enable Excel report
        formData.append('includeTestData', 'true');         // Include test data in reports
        formData.append('includeRequestResponse', 'true');  // Include request/response details

        const config = {
            headers: {
                ...formData.getHeaders()
                // Don't set Content-Type manually - let axios handle it
            },
            timeout: 30000
        };
        
        // Use basic authentication (matching your working setup)
        if (username && password) {
            config.auth = {
                username: username,
                password: password
            };
        }
        
        console.error('Form data includes:');
        console.error('- file: ReadyAPI project');
        console.error('- testSuite: Test Suite 1');
        console.error('- jobDescription: GitHub Actions metadata');
        console.error('- environment: GitHub Actions Container');
        console.error('- generateJunitReport: true');
        console.error('- generateReport: true (PDF format)');
        console.error('- generateExcelReport: true');
        console.error('- includeTestData: true');
        console.error('- includeRequestResponse: true');
        
        const response = await axios.post(`${testEngineUrl}/api/v1/testjobs`, formData, config);

        const executionId = response.data.testjobId;
        console.error(`✓ Project uploaded successfully`);
        console.error(`✓ Execution ID: ${executionId}`);
        
        // Output ONLY the execution ID for GitHub Actions to capture (clean output)
        console.log(executionId);
        
        return executionId;
    } catch (error) {
        console.error('✗ Failed to upload project:');
        
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
            
            // Specific handling for license issues
            if (error.response.status === 403) {
                console.error('\n🔑 LICENSE ISSUE DETECTED:');
                const message = error.response.data?.message || '';
                
                if (message.includes('license')) {
                    console.error('  TestEngine license problem during project upload.');
                    console.error('  Common causes:');
                    console.error('  1. License key is invalid, expired, or malformed');
                    console.error('  2. License is already active on another TestEngine instance');
                    console.error('  3. License doesn\'t permit the requested operation');
                    console.error('  4. Maximum concurrent executions exceeded');
                    console.error('\n  Next steps:');
                    console.error('  - Verify TESTENGINE_LICENSE_KEY secret is correct');
                    console.error('  - Check if TestEngine is running elsewhere with same license');
                    console.error('  - Ensure license allows API operations and project uploads');
                    console.error('  - Contact SmartBear support to verify license status');
                }
            }
        } else {
            console.error(`  Error: ${error.message}`);
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    const projectFile = process.argv[2];
    if (!projectFile) {
        console.error('Usage: node upload-project.js <project-file>');
        process.exit(1);
    }
    uploadProject(projectFile);
}

module.exports = { uploadProject };