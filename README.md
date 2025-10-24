# TestEngine GitHub Actions Demo

This repository demonstrates how to use GitHub Actions to:
1. Initiate a ReadyAPI TestEngine instance
2. Run a ReadyAPI project in the TestEngine
3. Poll until the project finishes running
4. Retrieve and store test results in the repository

## Repository Structure

- `.github/workflows/` - GitHub Actions workflow files
- `readyapi-projects/` - ReadyAPI project files
- `test-results/` - Directory for storing test execution results
- `scripts/` - Helper scripts for TestEngine operations

## Getting Started

1. Configure your TestEngine connection details in GitHub Secrets
2. Place your ReadyAPI project files in the `readyapi-projects/` directory
3. Push changes to trigger the GitHub Actions workflow

## Required GitHub Secrets

- `TESTENGINE_LICENSE_KEY` - Your SmartBear License Manager (SLM) access key
- `TE_SLM_SERVER` - (Optional) Custom SLM server URL (leave empty for hosted SLM)

### How to Get Your SLM Access Key:
1. Log in to your SmartBear Account at https://accounts.smartbear.com/
2. Go to Account Settings → API Access Keys
3. Create or copy your existing API access key

### How to Add Secrets:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"  
3. Add `TESTENGINE_LICENSE_KEY` with your SmartBear License Manager access key
4. Optionally add `TE_SLM_SERVER` if using a custom SLM server

**Note:** The `TESTENGINE_LICENSE_KEY` secret should contain your SLM access key, not a direct license key.

### Authentication:
- TestEngine uses SmartBear License Manager (SLM) for license activation
- TestEngine admin user hardcoded as admin/admin (secure for ephemeral containers)
- API calls use admin/admin for basic authentication
- Container is destroyed after each workflow run

### Security Note:
**Admin credentials are hardcoded as admin/admin** for simplicity since:
- Container runs temporarily (minutes) in private GitHub Actions environment
- No persistent storage or external network exposure
- Container is destroyed after each workflow execution

**If you prefer configurable credentials:**
1. Add `TESTENGINE_ADMIN_PASSWORD` to GitHub Secrets
2. Update workflow env vars: `TESTENGINE_PASSWORD: ${{ secrets.TESTENGINE_ADMIN_PASSWORD }}`
3. Update container env: `-e TESTENGINE_PASSWORD="${{ secrets.TESTENGINE_ADMIN_PASSWORD }}"`
4. This provides additional security isolation if running in shared environments

## Features

- **🚀 Automated TestEngine Setup**: Spins up TestEngine in Docker container
- **🔑 License Management**: Activates TestEngine license via SLM (SmartBear License Manager)  
- **📊 Project Execution**: Uploads and executes ReadyAPI projects
- **⏱️ Smart Polling**: Monitors execution status with timeout protection
- **📋 Multiple Report Formats**: Downloads JSON, JUnit XML, PDF, and Excel reports
- **💾 Artifact Storage**: Stores test results as GitHub Artifacts (no git commits)
- **🧹 Automatic Cleanup**: Properly cleans up containers after execution

## Report Formats

The workflow downloads test results in multiple formats using the documented TestEngine API:

| Format | Accept Header | File Extension | Use Case |
|--------|---------------|----------------|----------|
| JSON | `application/json` | `.json` | Detailed programmatic analysis |
| JUnit XML | `application/junit+xml` | `.xml` | CI/CD integration & test reporting |
| PDF | `application/pdf` | `.pdf` | Executive reports & documentation |
| Excel | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` | Data analysis & stakeholder reports |

## Workflow

The GitHub Actions workflow will:
1. Check out the repository
2. Start a TestEngine Docker container  
3. Wait for TestEngine to be ready
4. Activate TestEngine license via SLM
5. Upload ReadyAPI project to TestEngine
6. Poll for execution completion
7. Download results in multiple formats (JSON, JUnit, PDF, Excel)
8. Store results as GitHub Artifacts
9. Clean up the TestEngine container