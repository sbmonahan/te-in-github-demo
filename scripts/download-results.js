const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

async function downloadResults(executionId) {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;

    try {
        console.log(`Downloading results for execution: ${executionId}`);
        
        // Create temporary results directory
        const tempDir = path.join(process.cwd(), 'temp-results');
        await fs.ensureDir(tempDir);
        
        // Download execution report (JSON format)
        try {
            const reportResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/report`, {
                auth: {
                    username: username,
                    password: password
                },
                timeout: 30000
            });

            const reportPath = path.join(tempDir, `execution-report-${executionId}.json`);
            await fs.writeJson(reportPath, reportResponse.data, { spaces: 2 });
            console.log(`✓ Downloaded execution report: ${reportPath}`);
        } catch (error) {
            console.warn('⚠ Could not download execution report:', error.message);
        }

        // Download JUnit XML report
        try {
            const junitResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/reports/junit`, {
                auth: {
                    username: username,
                    password: password
                },
                timeout: 30000
            });

            const junitPath = path.join(tempDir, `junit-report-${executionId}.xml`);
            await fs.writeFile(junitPath, junitResponse.data);
            console.log(`✓ Downloaded JUnit report: ${junitPath}`);
        } catch (error) {
            console.warn('⚠ Could not download JUnit report:', error.message);
        }

        // Download execution logs
        try {
            const logsResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/logs`, {
                auth: {
                    username: username,
                    password: password
                },
                timeout: 30000
            });

            const logsPath = path.join(tempDir, `execution-logs-${executionId}.txt`);
            await fs.writeFile(logsPath, logsResponse.data);
            console.log(`✓ Downloaded execution logs: ${logsPath}`);
        } catch (error) {
            console.warn('⚠ Could not download execution logs:', error.message);
        }

        // Create summary file
        const summary = {
            executionId: executionId,
            downloadTime: new Date().toISOString(),
            testEngineUrl: testEngineUrl,
            files: await fs.readdir(tempDir)
        };

        const summaryPath = path.join(tempDir, 'download-summary.json');
        await fs.writeJson(summaryPath, summary, { spaces: 2 });
        console.log(`✓ Created download summary: ${summaryPath}`);

        console.log('✓ All available results downloaded successfully');
        return tempDir;
        
    } catch (error) {
        console.error('✗ Failed to download results:');
        
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
        console.error('Usage: node download-results.js <execution-id>');
        process.exit(1);
    }
    downloadResults(executionId);
}

module.exports = { downloadResults };