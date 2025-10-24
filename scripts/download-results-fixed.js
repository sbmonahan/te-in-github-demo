const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

async function downloadResults(executionId) {
    const testEngineUrl = process.env.TESTENGINE_URL;
    const username = process.env.TESTENGINE_USERNAME;
    const password = process.env.TESTENGINE_PASSWORD;

    try {
        console.log(`Downloading results for execution: ${executionId}`);
        
        // Wait a moment for reports to be fully generated
        console.log('Waiting 10 seconds for report generation to complete...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Create temporary results directory
        const tempDir = path.join(process.cwd(), 'temp-results');
        await fs.ensureDir(tempDir);
        
        // Base auth config
        const baseConfig = {
            timeout: 30000
        };
        
        if (username && password) {
            baseConfig.auth = {
                username: username,
                password: password
            };
        }

        // Use the documented Accept headers approach from SmartBear documentation
        // https://support.smartbear.com/testengine/docs/en/work-with-testengine/get-results.html
        const reportFormats = [
            { 
                name: 'json', 
                accept: 'application/json', 
                extension: 'json',
                filename: `execution-report-${executionId}.json`
            },
            { 
                name: 'junit', 
                accept: 'application/junit+xml', 
                extension: 'xml',
                filename: `junit-report-${executionId}.xml`
            },
            { 
                name: 'excel', 
                accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                extension: 'xlsx',
                filename: `test-report-${executionId}.xlsx`
            },
            { 
                name: 'pdf', 
                accept: 'application/pdf', 
                extension: 'pdf',
                filename: `test-report-${executionId}.pdf`
            }
        ];

        const downloadedFiles = [];
        let primaryReportData = null;

        for (const format of reportFormats) {
            try {
                console.log(`Attempting to download ${format.name} report...`);
                
                // Use the single report endpoint with different Accept headers (as documented)
                const config = {
                    ...baseConfig,
                    headers: {
                        'Accept': format.accept
                    }
                };
                
                // Use binary response type for non-JSON formats
                if (format.extension !== 'json') {
                    config.responseType = 'arraybuffer';
                }
                
                const response = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/report`, config);
                
                const filePath = path.join(tempDir, format.filename);
                
                if (format.extension === 'json') {
                    // Save JSON with proper formatting
                    await fs.writeJson(filePath, response.data, { spaces: 2 });
                    primaryReportData = response.data; // Keep for summary
                } else {
                    // Save binary data
                    await fs.writeFile(filePath, response.data);
                }
                
                console.log(`✓ Downloaded ${format.name} report: ${filePath} (${response.data.length || JSON.stringify(response.data).length} bytes)`);
                downloadedFiles.push(format.filename);
                
            } catch (error) {
                if (error.response?.status === 404) {
                    console.warn(`⚠ ${format.name} report not available (404 - endpoint not found)`);
                } else if (error.response?.status === 406) {
                    console.warn(`⚠ ${format.name} format not supported (406 - not acceptable)`);
                } else {
                    console.warn(`⚠ Failed to download ${format.name} report: ${error.response?.status || error.message}`);
                }
            }
        }

        // Try to download execution logs as well
        try {
            console.log('Downloading execution logs...');
            const logsResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/logs`, baseConfig);
            const logsPath = path.join(tempDir, `execution-logs-${executionId}.txt`);
            await fs.writeFile(logsPath, logsResponse.data);
            console.log(`✓ Downloaded execution logs: ${logsPath}`);
            downloadedFiles.push(`execution-logs-${executionId}.txt`);
        } catch (error) {
            console.warn('⚠ Could not download execution logs:', error.response?.status || error.message);
        }

        // Create comprehensive summary
        const summary = {
            executionId: executionId,
            downloadTime: new Date().toISOString(),
            testEngineUrl: testEngineUrl,
            downloadedFiles: downloadedFiles,
            totalFiles: downloadedFiles.length,
            status: downloadedFiles.length > 0 ? 'SUCCESS' : 'FAILED'
        };

        // Add execution details from primary report if available
        if (primaryReportData) {
            summary.executionSummary = {
                status: primaryReportData.status,
                startTime: primaryReportData.startTime,
                endTime: primaryReportData.endTime,
                testSuiteResults: primaryReportData.testSuiteResults?.map(suite => ({
                    name: suite.testSuiteName,
                    status: suite.status,
                    testCaseCount: suite.testCaseResults?.length || 0,
                    failedCount: suite.testCaseResults?.filter(tc => tc.status === 'FAILED')?.length || 0
                }))
            };
        }

        const summaryPath = path.join(tempDir, 'download-summary.json');
        await fs.writeJson(summaryPath, summary, { spaces: 2 });
        console.log(`✓ Created download summary: ${summaryPath}`);
        downloadedFiles.push('download-summary.json');

        if (downloadedFiles.length === 0) {
            console.error('✗ No reports were successfully downloaded');
            process.exit(1);
        } else {
            console.log(`✓ Successfully downloaded ${downloadedFiles.length} file(s)`);
            console.log('Downloaded files:');
            downloadedFiles.forEach(file => console.log(`  - ${file}`));
        }

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