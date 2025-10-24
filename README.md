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

- `TESTENGINE_LICENSE_KEY` - Your TestEngine license key
- `TESTENGINE_ADMIN_PASSWORD` - The admin password you configured during TestEngine initialization

### How to Add Secrets:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"  
3. Add both secrets:
   - `TESTENGINE_LICENSE_KEY` - Your TestEngine license key
   - `TESTENGINE_ADMIN_PASSWORD` - Your TestEngine admin password

### Authentication:
- TestEngine container uses license key for activation
- TestEngine admin user (username: admin) authenticates with the admin password
- API calls use admin/[your-admin-password] for basic authentication

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