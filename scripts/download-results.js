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
        
        // Create auth config
        const authConfig = {
            timeout: 30000
        };
        
        if (username && password) {
            authConfig.auth = {
                username: username,
                password: password
            };
        }

        // Download execution report (JSON format)
        try {
            const reportResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/report`, authConfig);

            const reportPath = path.join(tempDir, `execution-report-${executionId}.json`);
            await fs.writeJson(reportPath, reportResponse.data, { spaces: 2 });
            console.log(`✓ Downloaded execution report: ${reportPath}`);
            
            // Log available report information from the execution report
            if (reportResponse.data.reportStatus) {
                console.log(`Report status: ${reportResponse.data.reportStatus}`);
            }
            if (reportResponse.data.reports) {
                console.log('Available reports:', reportResponse.data.reports);
            }
        } catch (error) {
            console.warn('⚠ Could not download execution report:', error.message);
        }

        // Download JUnit XML report
        try {
            const junitResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/reports/junit`, authConfig);

            const junitPath = path.join(tempDir, `junit-report-${executionId}.xml`);
            await fs.writeFile(junitPath, junitResponse.data);
            console.log(`✓ Downloaded JUnit report: ${junitPath}`);
        } catch (error) {
            console.warn('⚠ Could not download JUnit report:', error.message);
        }

        // Download PDF report
        try {
            const pdfResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/reports/pdf`, {
                ...authConfig,
                responseType: 'arraybuffer'
            });

            const pdfPath = path.join(tempDir, `test-report-${executionId}.pdf`);
            await fs.writeFile(pdfPath, pdfResponse.data);
            console.log(`✓ Downloaded PDF report: ${pdfPath}`);
        } catch (error) {
            console.warn('⚠ Could not download PDF report:', error.message);
        }

        // Download Excel report  
        try {
            const excelResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/reports/excel`, {
                ...authConfig,
                responseType: 'arraybuffer'
            });

            const excelPath = path.join(tempDir, `test-report-${executionId}.xlsx`);
            await fs.writeFile(excelPath, excelResponse.data);
            console.log(`✓ Downloaded Excel report: ${excelPath}`);
        } catch (error) {
            console.warn('⚠ Could not download Excel report:', error.message);
        }

        // Try alternative report endpoints
        const alternativeEndpoints = [
            { url: `/api/v1/testjobs/${executionId}/report/pdf`, filename: `report-alt-${executionId}.pdf`, type: 'arraybuffer' },
            { url: `/api/v1/testjobs/${executionId}/report/excel`, filename: `report-alt-${executionId}.xlsx`, type: 'arraybuffer' },
            { url: `/api/v1/testjobs/${executionId}/reports/html`, filename: `report-${executionId}.html`, type: 'text' }
        ];

        for (const endpoint of alternativeEndpoints) {
            try {
                const response = await axios.get(`${testEngineUrl}${endpoint.url}`, {
                    ...authConfig,
                    responseType: endpoint.type
                });

                const filePath = path.join(tempDir, endpoint.filename);
                await fs.writeFile(filePath, response.data);
                console.log(`✓ Downloaded ${endpoint.filename}: ${filePath}`);
            } catch (error) {
                console.warn(`⚠ Could not download ${endpoint.filename}:`, error.response?.status || error.message);
            }
        }

        // Download execution logs
        try {
            const logsResponse = await axios.get(`${testEngineUrl}/api/v1/testjobs/${executionId}/logs`, authConfig);

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