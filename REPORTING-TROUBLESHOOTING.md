# TestEngine Reporting Troubleshooting Guide

This document tracks our investigation into TestEngine reporting capabilities and solutions for getting PDF, Excel, and JUnit reports.

## SOLUTION FOUND ✅

**Root Cause**: We were using incorrect endpoints instead of Accept headers.

**Solution**: Use the single `/api/v1/testjobs/{id}/report` endpoint with different `Accept` headers:
- `application/json` for JSON reports
- `application/junit+xml` for JUnit XML reports  
- `application/pdf` for PDF reports
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` for Excel reports

**Documentation Source**: https://support.smartbear.com/testengine/docs/en/work-with-testengine/get-results.html

## Investigation Steps

### 1. TestEngine Version Information
To determine what version we're working with:
```bash
# Check version endpoint
curl -u admin:admin http://localhost:8080/api/v1/version

# Check available API endpoints
curl -u admin:admin http://localhost:8080/api/v1/help
```

### 2. Test Report Endpoint Discovery
Run our endpoint discovery script:
```bash
cd scripts
node test-reporting-endpoints.js
```

### 3. Test with Real Execution
Run a test with minimal parameters to see what's actually available:
```bash
cd scripts
node test-reports-execution.js
```

## Potential Solutions

### Solution 1: TestEngine Version Compatibility
The smartbear/readyapi-testengine Docker image might be an older version that doesn't support multiple report formats. 

**Test**: Check if newer versions are available:
```bash
# List available TestEngine Docker tags
docker search smartbear/readyapi-testengine
```

### Solution 2: Different API Pattern
Some TestEngine versions might use different endpoints or require post-processing.

**Test**: Try alternative approaches:
- Query results after completion and generate reports separately
- Use different upload parameters
- Check if reports need to be requested explicitly after execution

### Solution 3: License Limitations
Some report formats might require specific license features.

**Test**: Check license capabilities:
```bash
curl -u admin:admin http://localhost:8080/api/v1/license/info
```

### Solution 4: Manual Report Generation
If TestEngine doesn't support multiple formats, we could:
1. Get the JSON results
2. Transform them into desired formats using external tools
3. Generate PDF/Excel reports from the JSON data

## Upload Parameter Testing

Current parameters being tested in upload-project.js:

### Standard Parameters
```javascript
formData.append('generateJunitReport', 'true');
formData.append('generateReport', 'true');
formData.append('reportFormat', 'PDF');
formData.append('generateExcelReport', 'true');
```

### Alternative Parameters to Test
```javascript
// Version-specific alternatives
formData.append('junitReport', 'true');
formData.append('pdfReport', 'true');
formData.append('excelReport', 'true');
formData.append('htmlReport', 'true');
formData.append('reportFormats', 'PDF,JUNIT,EXCEL,HTML');

// Output control
formData.append('includeTestData', 'true');
formData.append('includeRequestResponse', 'true');
formData.append('outputFormat', 'ALL');
```

## Endpoint Variations to Test

Based on different TestEngine versions, these patterns might work:

### Direct Format Access
```
GET /api/v1/testjobs/{id}/report.pdf
GET /api/v1/testjobs/{id}/report.xlsx  
GET /api/v1/testjobs/{id}/report.xml
GET /api/v1/testjobs/{id}/report.html
```

### Reports Collection
```
GET /api/v1/testjobs/{id}/reports/pdf
GET /api/v1/testjobs/{id}/reports/excel
GET /api/v1/testjobs/{id}/reports/junit
GET /api/v1/testjobs/{id}/reports/html
```

### With Query Parameters
```
GET /api/v1/testjobs/{id}/report?format=pdf
GET /api/v1/testjobs/{id}/report?format=excel
GET /api/v1/testjobs/{id}/report?format=junit
```

## Workaround: JSON to Multiple Formats

If native format support isn't available, we can implement format conversion:

### JSON to JUnit XML
```javascript
function convertJsonToJunit(jsonReport) {
    // Transform TestEngine JSON to JUnit XML format
    // Include test suites, test cases, failures, etc.
}
```

### JSON to Excel Report
```javascript
const ExcelJS = require('exceljs');

function convertJsonToExcel(jsonReport) {
    // Create Excel workbook with test results
    // Include summary, detailed results, charts
}
```

### JSON to PDF Report  
```javascript
const PDFDocument = require('pdfkit');

function convertJsonToPdf(jsonReport) {
    // Generate PDF report with test results
    // Include executive summary, detailed results, charts
}
```

## Next Steps

1. **Run discovery scripts** to understand available endpoints
2. **Check TestEngine version** to determine capabilities  
3. **Test alternative parameters** if basic endpoints exist
4. **Implement format conversion** if native support unavailable
5. **Update workflow** with working solution

## Documentation Sources Attempted

- SmartBear official documentation (404 errors)
- TestEngine API help endpoints  
- GitHub repositories with TestEngine examples
- Docker image documentation

## Status: Investigation In Progress

Current priority: Determine if the issue is:
- Parameter naming/format
- TestEngine version limitations  
- License restrictions
- API endpoint variations

Once we identify the root cause, we can implement the appropriate solution.