# TestEngine GitHub Actions Demo

**Automated ReadyAPI test execution in GitHub Actions with comprehensive reporting**

This repository provides a complete solution for running ReadyAPI TestEngine tests in GitHub Actions CI/CD pipelines. It automatically spins up TestEngine in Docker, executes your ReadyAPI projects, and generates multiple report formats (JSON, JUnit XML, PDF, Excel).

## What This Does

✅ **Fully Automated**: Start TestEngine → Run Tests → Generate Reports → Store Results  
✅ **Multiple Report Formats**: JSON, JUnit XML, PDF, Excel for different stakeholders  
✅ **Fast Execution**: Optimized for CI/CD (~1.5-2 minutes total runtime)  
✅ **Secure**: Uses SmartBear License Manager (SLM) with GitHub Secrets  
✅ **Zero Setup**: No infrastructure needed - runs entirely in GitHub Actions  

## 🚀 Quick Start

### Step 1: Fork or Use This Repository
1. Fork this repository to your GitHub account, or
2. Use this repository as a template for a new repo

### Step 2: Get Your SmartBear License Manager Access Key 🔑
You need a SmartBear SLM access key (NOT a direct license key). Here's how to get it:

1. **Go to SmartBear Account**: https://accounts.smartbear.com/
2. **Log in** with your SmartBear credentials
3. **Navigate to**: Account Settings → API Access Keys  
4. **Create New Key**: Click "Create API Access Key" or use existing key
5. **Copy the Key**: It looks like `f0ac2773-012c-40d8-a9ec-aa0bf42e9d0a` (UUID format)

**⚠️ Important**: This is your SLM access key, not the license key itself. SLM manages license activation automatically.

### Step 3: Configure GitHub Secrets
Add your SLM access key as a GitHub Secret:

1. **Go to your repository** on GitHub
2. **Click**: Settings → Secrets and variables → Actions
3. **Click**: "New repository secret"
4. **Create secret**:
   - Name: `TESTENGINE_LICENSE_KEY`
   - Value: Your SLM access key from Step 2
5. **Optional**: Add `TE_SLM_SERVER` if using private SLM (most users skip this)

### Step 4: Add Your ReadyAPI Project
1. **Export your ReadyAPI project** as XML from ReadyAPI/SoapUI
2. **Upload the XML file** to the `readyapi-projects/` folder
3. **Commit and push** to trigger the workflow

### Step 5: Run and Get Results 🎯
- **Push to main branch** or create a pull request
- **Go to Actions tab** to watch execution
- **Download results** from the Artifacts section (see detailed instructions below)

## 📋 Prerequisites

Before using this workflow, you need:

1. **SmartBear Account** with TestEngine license
2. **ReadyAPI project** exported as XML
3. **GitHub repository** with Actions enabled
4. **SLM Access Key** (see setup instructions above)

### Required GitHub Secrets

| Secret Name | Required | Description |
|-------------|----------|-------------|
| `TESTENGINE_LICENSE_KEY` | ✅ **Yes** | Your SLM access key (UUID format) |
| `TE_SLM_SERVER` | ❌ Optional | Custom SLM server URL (leave empty for SmartBear hosted SLM) |

### Troubleshooting License Issues

**If you get license errors:**

1. **Check License Valid**: Log into https://accounts.smartbear.com/ → My Licenses
2. **Verify Access Key**: Account Settings → API Access Keys (must be active)
3. **Check License Type**: TestEngine license required (not just ReadyAPI)
4. **Contact Support**: If issues persist, contact SmartBear support with your account details

**Common License Problems:**
- ❌ Using ReadyAPI license instead of TestEngine license
- ❌ Expired or inactive license  
- ❌ Wrong access key (copied license key instead of SLM access key)
- ❌ License already active on another instance

## 📁 Repository Structure

```
te-in-github-demo/
├── .github/workflows/
│   └── testengine-execution.yml        # Main GitHub Actions workflow
├── readyapi-projects/
│   ├── te-sample-readyapi-project.xml  # Sample ReadyAPI project
│   └── [your-project].xml             # Add your projects here
├── scripts/
│   ├── activate-license.js             # SLM license activation
│   ├── upload-project.js               # Project upload to TestEngine
│   ├── poll-execution.js               # Execution status monitoring
│   └── download-results-fixed.js       # Multi-format result download
├── README.md                           # This file
└── package.json                        # Node.js dependencies
```

## 🔧 Manual Workflow Trigger

You can also run tests on-demand:

1. **Go to Actions tab** in your GitHub repository
2. **Click "ReadyAPI TestEngine Execution"** workflow
3. **Click "Run workflow"** button
4. **Select branch** and **specify project file** (optional)
5. **Click "Run workflow"** to start execution

## 🔒 Security & Authentication

**License Management:**
- Uses SmartBear License Manager (SLM) for secure license activation
- SLM access key stored in GitHub Secrets (encrypted)
- No license keys exposed in code or logs

**TestEngine Authentication:**
- Admin credentials: `admin/admin` (hardcoded for CI simplicity)
- Container runs ephemerally (destroyed after each test)
- No persistent data or external network exposure
- Secure for CI/CD environments

**Custom Authentication (Optional):**
For enhanced security, you can use custom TestEngine credentials:
1. Add `TESTENGINE_ADMIN_PASSWORD` to GitHub Secrets
2. Update workflow environment variables accordingly
3. Suitable for shared or production environments

## Features

- **🚀 Fast TestEngine Setup**: Optimized Docker startup (~1.5-2 min total execution)
- **🔑 License Management**: Activates TestEngine license via SLM (SmartBear License Manager)  
- **📊 Project Execution**: Uploads and executes ReadyAPI projects
- **⏱️ Smart Polling**: Monitors execution status with timeout protection
- **📋 Multiple Report Formats**: Downloads JSON, JUnit XML, PDF, and Excel reports
- **💾 Artifact Storage**: Stores test results as GitHub Artifacts (no git commits)
- **🧹 Automatic Cleanup**: Properly cleans up containers after execution
- **⚡ Performance Optimized**: 50% faster than standard setup (see PERFORMANCE-OPTIMIZATIONS.md)

## Report Formats

The workflow downloads test results in multiple formats using the documented TestEngine API:

| Format | Accept Header | File Extension | Use Case |
|--------|---------------|----------------|----------|
| JSON | `application/json` | `.json` | Detailed programmatic analysis |
| JUnit XML | `application/junit+xml` | `.xml` | CI/CD integration & test reporting |
| PDF | `application/pdf` | `.pdf` | Executive reports & documentation |
| Excel | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` | Data analysis & stakeholder reports |

## How to Access Test Results 📥

After a workflow runs, test results are stored as **GitHub Artifacts**. Here's how to find and download them:

### Step 1: Navigate to Actions
1. Go to your repository on GitHub
2. Click the **"Actions"** tab at the top
3. Find your workflow run in the list

### Step 2: Access Artifacts  
1. Click on the specific workflow run
2. Scroll down to the **"Artifacts"** section at the bottom of the page
3. You'll see an artifact named like: `readyapi-test-results-20241024_143052`

### Step 3: Download Results
1. Click the artifact name to download a ZIP file
2. Extract the ZIP to access all report formats:
   ```
   readyapi-test-results-TIMESTAMP/
   ├── execution-report-{id}.json      # Detailed JSON results
   ├── junit-report-{id}.xml           # JUnit XML for CI tools  
   ├── test-report-{id}.pdf            # PDF executive report
   ├── test-report-{id}.xlsx           # Excel spreadsheet
   ├── execution-logs-{id}.txt         # TestEngine execution logs
   └── download-summary.json           # Download metadata
   ```

### Artifact Retention
- **Retention period**: 30 days (configurable in workflow)
- **Naming**: Includes timestamp for easy identification
- **Size**: Typically 1-10MB depending on test complexity

### Programmatic Access
You can also access artifacts via GitHub CLI or API:
```bash
# Using GitHub CLI
gh run download <run-id> --name readyapi-test-results-TIMESTAMP

# Using GitHub API  
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/artifacts
```

## 🔄 How It Works (Workflow Steps)

The GitHub Actions workflow automatically:

1. **🚀 Environment Setup** - Checks out code, installs Node.js dependencies
2. **🐳 Start TestEngine** - Spins up TestEngine Docker container (optimized startup)
3. **⚡ Health Check** - Waits for TestEngine to be ready (~30-60 seconds)
4. **🔑 License Activation** - Activates license via SmartBear SLM
5. **📤 Upload Project** - Uploads your ReadyAPI project to TestEngine
6. **▶️ Execute Tests** - Runs all test suites in the project
7. **⏱️ Monitor Progress** - Polls execution status until completion
8. **📊 Generate Reports** - Downloads JSON, JUnit XML, PDF, and Excel reports
9. **💾 Store Results** - Saves all reports as GitHub Artifacts (30-day retention)
10. **🧹 Cleanup** - Stops and removes TestEngine container

**Total Runtime**: ~1.5-2 minutes (50% faster than standard TestEngine setup)

## 🚨 Troubleshooting Common Issues

### License Activation Fails
```
❌ Error: License activation failed
```
**Solutions:**
- Verify your SLM access key in GitHub Secrets
- Check license is active at https://accounts.smartbear.com/
- Ensure you have TestEngine license (not just ReadyAPI)
- Contact SmartBear support if license appears valid

### Project Upload Fails
```
❌ Error: Project file not found
```
**Solutions:**
- Check project file exists in `readyapi-projects/` folder
- Verify filename matches (case-sensitive)
- Ensure project exported as XML from ReadyAPI/SoapUI
- Check project file is valid XML format

### Test Execution Timeout
```
❌ Error: Test execution timed out
```
**Solutions:**
- Check project doesn't have infinite loops or very long waits
- Verify test endpoints are accessible from GitHub Actions
- Consider splitting large test suites into smaller projects
- Check TestEngine logs in workflow output for specific errors

### No Artifacts Generated
```
⚠️ Warning: No test results artifacts found
```
**Solutions:**
- Check workflow completed successfully
- Look for errors in "Download test results" step
- Verify TestEngine execution finished (not failed/cancelled)
- Check artifact retention policy (default 30 days)

## 📞 Support & Resources

- **Documentation**: This README and linked documentation files
- **SmartBear Support**: https://support.smartbear.com/
- **TestEngine API**: https://support.smartbear.com/testengine/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Issues**: Use GitHub Issues for repository-specific problems

## 📄 Additional Documentation

- [`PERFORMANCE-OPTIMIZATIONS.md`](PERFORMANCE-OPTIMIZATIONS.md) - Performance tuning details
- [`SECURITY-REVIEW.md`](SECURITY-REVIEW.md) - Security analysis and best practices  
- [`SOLUTION-SUMMARY.md`](SOLUTION-SUMMARY.md) - Technical implementation details
- [`REPORTING-TROUBLESHOOTING.md`](REPORTING-TROUBLESHOOTING.md) - Report format investigation