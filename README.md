# TestEngine GitHub Actions Demo

**Automated ReadyAPI test execution in GitHub Actions with comprehensive reporting**

> **⚠️ IMPORTANT DISCLAIMER**: This is sample code provided for demonstration purposes only. It is not warranted for any particular use case and is provided "as-is" without any support or warranty. Use at your own risk and discretion.

> **📢 READ-ONLY REPOSITORY**: This repository is for demonstration and learning purposes only. Issues, pull requests, discussions, and other interactive features are disabled. This is not a supported product.

This repository provides a complete solution for running ReadyAPI TestEngine tests in GitHub Actions CI/CD pipelines. It automatically spins up TestEngine in Docker, executes your ReadyAPI projects, and generates multiple report formats (JSON, JUnit XML, PDF, Excel).

## What This Does

✅ **Fully Automated**: Start TestEngine → Run Tests → Generate Reports → Store Results  
✅ **Multiple Report Formats**: JSON, JUnit XML, PDF, Excel for different stakeholders  
✅ **Fast Execution**: Optimized for CI/CD (~1.5-2 minutes total runtime)  
✅ **Secure**: Uses SmartBear License Manager (SLM) with GitHub Secrets  
✅ **Zero Setup**: No infrastructure needed - runs entirely in GitHub Actions  

## 🔄 How It Works (Workflow Steps)

The GitHub Actions workflow automatically:

1. **🚀 Environment Setup** - Checks out code, installs Node.js dependencies
2. **🐳 Start TestEngine** - Spins up TestEngine Docker container (optimized startup)
3. **⚡ Health Check** - Waits for TestEngine to be ready (typically 30-90 seconds, max 2 minutes)
4. **🔑 License Activation** - Activates license via SmartBear SLM
5. **📤 Upload Project** - Uploads your ReadyAPI project to TestEngine
6. **▶️ Execute Tests** - Runs all test suites in the project
7. **⏱️ Monitor Progress** - Polls execution status until completion
8. **📊 Generate Reports** - Downloads JSON, JUnit XML, PDF, and Excel reports
9. **💾 Store Results** - Saves all reports as GitHub Artifacts (30-day retention)
10. **🧹 Cleanup** - Stops and removes TestEngine container

**Total Runtime**: ~1.5-2 minutes (50% faster than standard TestEngine setup)

## � Prerequisites

Before using this workflow, you need:

1. **SmartBear Account** with TestEngine license
2. **ReadyAPI project** exported as XML
3. **GitHub repository** with Actions enabled
4. **SLM Access Key** (see setup instructions below)

## �� Quick Start

### Step 1: Fork or Use This Repository
1. Fork this repository to your GitHub account, or
2. Use this repository as a template for a new repo

### Step 2: Get Your SmartBear License Manager Access Key 🔑
You need a SmartBear SLM access key (NOT a direct license key). Here's how to get it:

1. **Go to SmartBear License Management Portal**: https://manage.smartbear.com/
2. **Log in** with your SmartBear credentials  
3. **Click the user icon** in the top right corner
4. **Select "Settings"** from the dropdown menu
5. **Copy your Access Key** from the Access Key dialog
6. **The key format**: It looks like `f0ac2773-xxxx-xxxx-xxxx-aa0bf42e9d0a` (UUID format)

> **📚 Official Documentation**: [Get Access Key - SmartBear License Management](https://support.smartbear.com/administration/docs/en/smartbear-license-management/work-with-smartbear-license-management/license-management-for-license-users.html#get-access-key)

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
The repository includes a **sample ReadyAPI project** (`te-sample-readyapi-project.xml`) that you can test immediately, or replace with your own project:

#### Option A: Test with Sample Project (Quickest)
- The sample project is ready to run immediately
- Uses public JSONPlaceholder API (no authentication needed)
- Just proceed to Step 5 to test the workflow

#### Option B: Use Your Own ReadyAPI Project
1. **Export your ReadyAPI project** as XML:
   - In ReadyAPI/SoapUI: File → Export Project → Save as XML
   - Ensure all test suites, test cases, and assertions are included
   
2. **Add your project file**:
   - Upload your XML file to the `readyapi-projects/` folder
   - You can replace `te-sample-readyapi-project.xml` or add alongside it
   
3. **Update workflow (if using different filename)**:
   - If your file has a different name, update the default in `.github/workflows/testengine-execution.yml`
   - Find line: `default: 'te-sample-readyapi-project.xml'`
   - Change to: `default: 'your-project-name.xml'`
   
4. **Manual execution option**:
   - Go to Actions → "ReadyAPI TestEngine Execution" → "Run workflow"
   - Specify your project filename in the input field
   - Click "Run workflow"

#### Project Requirements:
- ✅ **Format**: ReadyAPI project exported as XML OR zipped composite project
- ✅ **Composite Projects**: If using external files (data sources, certificates, attachments) or [composite projects](https://support.smartbear.com/readyapi/docs/testing/teamwork.html), export as ZIP package
- ✅ **Endpoints**: Must be accessible from GitHub Actions (public APIs or accessible URLs)
- ✅ **Authentication**: Configure in project (avoid hardcoded credentials)
- ✅ **Test Suites**: Include at least one test suite with test cases

**📦 Exporting Composite Projects as ZIP:**
For projects with external dependencies or composite structure:
1. In ReadyAPI: Right-click project → **Export** from context menu
2. Select folder to save the ZIP package  
3. ReadyAPI automatically includes all required files and dependencies
4. Upload the ZIP file to `readyapi-projects/` folder instead of XML

> **📚 Reference**: [TestEngine Run Tests Documentation](https://support.smartbear.com/testengine/docs/en/work-with-testengine/run-tests.html#1-prepare-a-readyapi-project)

### Step 5: Run Tests and Get Results 🎯

**Automatic Execution:**
The workflow automatically runs when you:
- **Push to `main` branch**: Every commit to main triggers test execution
- **Push to `develop` branch**: Every commit to develop triggers test execution  
- **Create Pull Request to `main`**: All PRs targeting main branch run tests automatically

**Manual Execution:**
You can also trigger tests on-demand via:

- **GitHub Web Interface**: Actions tab → "ReadyAPI TestEngine Execution" → "Run workflow"
- **GitHub CLI**: `gh workflow run testengine-execution.yml -f project_name="your-project.xml"`
- **API**: POST to `/repos/OWNER/REPO/actions/workflows/testengine-execution.yml/dispatches`

**Monitor Execution:**
- **Go to Actions tab** to watch real-time execution
- **Download results** from the Artifacts section (see detailed instructions below)

## Report Formats
```
```

## � Workflow Execution

### Automatic Triggers
The workflow automatically runs when:
- **Push to `main` branch**: Every commit to main triggers test execution
- **Push to `develop` branch**: Every commit to develop triggers test execution  
- **Pull Requests to `main`**: All PRs targeting main branch run tests automatically
- **Scheduled runs**: Can be configured via cron syntax in workflow file (currently disabled)

### Manual Triggers
You can manually trigger the workflow in several ways:

**Via GitHub Web Interface:**
1. Go to your repository → **Actions** tab
2. Select **"ReadyAPI TestEngine Execution"** workflow
3. Click **"Run workflow"** → Select branch → Specify project file (optional)
4. Click **"Run workflow"** to start execution

**Via GitHub CLI:**
```bash
# Run with default project file
gh workflow run testengine-execution.yml

# Run with specific project file
gh workflow run testengine-execution.yml -f project_name="your-project.xml"
```

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

##  Troubleshooting Common Issues

### License Activation Fails
```
❌ Error: License activation failed
```
**Solutions:**
1. **Check License Valid**: Log into https://manage.smartbear.com/ → verify your assigned licenses
2. **Verify Access Key**: User icon → Settings → Access Key (must be active)
3. **Check License Type**: TestEngine floating license required (not just ReadyAPI license)
4. **Contact Support**: If issues persist, contact SmartBear support with your account details

> **📚 License Documentation**: [SmartBear ID-based Licenses for TestEngine](https://support.smartbear.com/testengine/docs/en/testengine-licenses/smartbear-id-based-licenses/work-with-smartbear-hosted-id-based-licenses.html)

**Common License Problems:**
- ❌ Using ReadyAPI license instead of TestEngine license
- ❌ Expired or inactive license  
- ❌ Wrong access key (copied license key instead of SLM access key)
- ❌ License already active on another instance

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

##  Repository Structure

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

## 🏗️ Architecture & Design

### Technology Stack Decisions

**Node.js + JavaScript Scripts**
- **Cross-platform compatibility**: Works on Ubuntu, Windows, and macOS GitHub runners
- **Rich ecosystem**: Leverages `axios` for HTTP, `form-data` for multipart uploads, `fs-extra` for file operations
- **Better error handling**: Structured try/catch blocks with detailed error messages vs. shell script error handling
- **Complex API interactions**: Handles JSON parsing, multipart form data, and file streaming more elegantly than shell commands

**Docker Container Approach**
- **Cost efficiency**: No external SaaS fees - runs entirely on GitHub's infrastructure
- **Isolation**: Each workflow gets a fresh, clean TestEngine instance
- **Speed**: No network latency to external services
- **Security**: Test data never leaves GitHub's secure environment
- **Consistency**: Same TestEngine version and configuration every time

**SmartBear License Manager (SLM)**
- **Modern licensing**: Uses SmartBear's current licensing infrastructure
- **Ephemeral friendly**: Designed for temporary container activation/deactivation
- **Secure**: License keys stored in GitHub Secrets, not exposed in code or logs

### Modular Script Architecture

**Separation of Concerns**
Each script handles one specific responsibility:
- `activate-license.js`: SLM license management only
- `upload-project.js`: Project file upload and job submission
- `poll-execution.js`: Status monitoring with timeout handling
- `download-results-fixed.js`: Multi-format report generation

**Benefits of Modularity**
- **Testability**: Each script can be tested independently with `npm run <command>`
- **Debuggability**: Isolate issues to specific workflow steps
- **Maintainability**: Changes to one step don't affect others
- **Reusability**: Scripts can be used outside GitHub Actions (local development, other CI systems)

### GitHub Actions vs JavaScript Decision Matrix

**Use GitHub Actions Shell Commands for:**
- ✅ **System operations**: Docker lifecycle (`docker run`, `docker stop`, `docker rm`)
- ✅ **CI/CD integration**: GitHub Actions output syntax (`echo "var=$value" >> $GITHUB_OUTPUT`)
- ✅ **Simple variable assignments**: Basic string manipulation and environment variable exports
- ✅ **File system operations**: Simple file checks, directory creation, basic path operations
- ✅ **Performance-critical tasks**: When Node.js startup overhead matters

**Use JavaScript Scripts for:**
- ✅ **API interactions**: HTTP requests, JSON parsing, authentication handling
- ✅ **Complex logic**: Loops, conditionals, sophisticated error handling
- ✅ **Data processing**: File operations, data transformation, report generation
- ✅ **Cross-platform compatibility**: Same code works on Windows/Linux/macOS runners
- ✅ **Testable functionality**: Logic that needs unit testing and local development
- ✅ **Timeout/retry logic**: Polling, health checks, status monitoring
- ✅ **Integration with existing ecosystem**: Leveraging npm packages and Node.js libraries

**Real Examples from This Project:**
- 🐚 **Shell**: `docker run` commands, `$GITHUB_OUTPUT` assignments, environment variable checks
- 🟨 **JavaScript**: `health-check.js` (replaces 24-line bash script), `poll-execution.js` (timeout/retry logic), `download-results-fixed.js` (multi-format API calls)

### CI/CD Integration Patterns

**Polling vs. Webhooks**
- **Simplicity**: No external webhook endpoints or callback URLs needed
- **Reliability**: Not dependent on network callbacks or external routing
- **GitHub Actions native**: Fits the sequential step execution model
- **Error resilience**: Built-in timeout and retry logic

**Artifact Storage Strategy**
- **GitHub native**: Uses GitHub Artifacts instead of external storage
- **Automatic cleanup**: 30-day retention with configurable policies
- **Multiple formats**: JSON (programmatic), XML (CI integration), PDF (reports), Excel (analysis)
- **Timestamped naming**: Easy identification and historical tracking

**Security Model**
- **Ephemeral containers**: Destroyed after each run, no persistent state
- **Secret management**: All sensitive data in GitHub Secrets
- **Network isolation**: TestEngine container has no external network access
- **Minimal privileges**: Admin credentials only for container lifecycle

## 📞 Support & Resources

- **Documentation**: This README and linked documentation files
- **TestEngine API**: https://support.smartbear.com/testengine/docs/
- **GitHub Actions**: https://docs.github.com/en/actions