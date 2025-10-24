# Test Results

This directory contains the results from TestEngine executions. Each execution creates a timestamped subdirectory with the following files:

- `execution-report-{id}.json` - Detailed execution report in JSON format
- `junit-report-{id}.xml` - JUnit-compatible test results
- `execution-logs-{id}.txt` - Execution logs
- `download-summary.json` - Summary of downloaded files

## Directory Structure

```
test-results/
├── 20241024_143022/
│   ├── execution-report-12345.json
│   ├── junit-report-12345.xml
│   ├── execution-logs-12345.txt
│   └── download-summary.json
└── 20241024_151130/
    ├── execution-report-12346.json
    ├── junit-report-12346.xml
    ├── execution-logs-12346.txt
    └── download-summary.json
```

## Usage

Results are automatically downloaded and committed by the GitHub Actions workflow. Each execution is stored in a separate directory to maintain historical test results.