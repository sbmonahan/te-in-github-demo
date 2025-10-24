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

- `TESTENGINE_LICENSE_KEY` - Your TestEngine license key (required for running tests)
- `TESTENGINE_USERNAME` - TestEngine admin username (optional, defaults to 'admin')  
- `TESTENGINE_PASSWORD` - TestEngine admin password (optional, defaults to 'admin')

### How to Add Secrets:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `TESTENGINE_LICENSE_KEY` with your actual license key

## Workflow

The GitHub Actions workflow will:
1. Check out the repository
2. Start a TestEngine Docker container
3. Wait for TestEngine to be ready
4. Upload ReadyAPI project to TestEngine
5. Execute the project
6. Poll for completion
7. Download results
8. Commit results back to the repository
9. Clean up the TestEngine container