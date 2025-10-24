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
        console.log(`Uploading project: ${projectFileName}`);
        
        const formData = new FormData();
        const fileStream = fs.createReadStream(projectPath);
        formData.append('file', fileStream);

        const response = await axios.post(`${testEngineUrl}/api/v1/testjobs`, formData, {
            auth: {
                username: username,
                password: password
            },
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
        });

        const executionId = response.data.testjobId;
        console.log(`✓ Project uploaded successfully`);
        console.log(`✓ Execution ID: ${executionId}`);
        
        // Output the execution ID for GitHub Actions to capture
        console.log(executionId);
        
        return executionId;
    } catch (error) {
        console.error('✗ Failed to upload project:');
        
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
    const projectFile = process.argv[2];
    if (!projectFile) {
        console.error('Usage: node upload-project.js <project-file>');
        process.exit(1);
    }
    uploadProject(projectFile);
}

module.exports = { uploadProject };