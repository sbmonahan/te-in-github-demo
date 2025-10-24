const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Store mock executions
const executions = new Map();
let executionCounter = 1000;

// Basic auth middleware
const basicAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    const credentials = Buffer.from(auth.slice(6), 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    if (username === 'admin' && password === 'admin') {
        next();
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

app.use(express.json());
app.use(basicAuth);

// Health check endpoint
app.get('/api/v1/testjobs', (req, res) => {
    res.json({ message: 'Mock TestEngine is running', executions: Array.from(executions.keys()) });
});

// Upload project and create execution
app.post('/api/v1/testjobs', upload.single('file'), (req, res) => {
    const executionId = `mock-${executionCounter++}`;
    
    console.log(`Creating execution: ${executionId}`);
    console.log(`Uploaded file: ${req.file?.originalname || 'unknown'}`);
    
    // Create mock execution
    executions.set(executionId, {
        testjobId: executionId,
        status: 'CREATED',
        currentStatus: 'Uploaded',
        createdAt: new Date().toISOString(),
        projectFile: req.file?.originalname || 'unknown.xml'
    });
    
    res.json({ testjobId: executionId });
});

// Start execution
app.post('/api/v1/testjobs/:id/run', (req, res) => {
    const executionId = req.params.id;
    const execution = executions.get(executionId);
    
    if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    
    console.log(`Starting execution: ${executionId}`);
    
    execution.status = 'RUNNING';
    execution.currentStatus = 'Executing tests';
    execution.startedAt = new Date().toISOString();
    
    // Simulate test completion after 30 seconds
    setTimeout(() => {
        execution.status = 'FINISHED';
        execution.currentStatus = 'Completed successfully';
        execution.finishedAt = new Date().toISOString();
        execution.results = {
            totalTests: 5,
            passed: 4,
            failed: 1,
            duration: '00:00:28'
        };
        console.log(`Execution completed: ${executionId}`);
    }, 30000);
    
    res.json({ message: 'Execution started', executionId });
});

// Get execution status
app.get('/api/v1/testjobs/:id', (req, res) => {
    const executionId = req.params.id;
    const execution = executions.get(executionId);
    
    if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    
    res.json(execution);
});

// Get execution report
app.get('/api/v1/testjobs/:id/report', (req, res) => {
    const executionId = req.params.id;
    const execution = executions.get(executionId);
    
    if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
    }
    
    const report = {
        executionId: executionId,
        projectName: execution.projectFile,
        status: execution.status,
        results: execution.results || { message: 'Execution in progress' },
        createdAt: execution.createdAt,
        startedAt: execution.startedAt,
        finishedAt: execution.finishedAt,
        testCases: [
            { name: 'GET /api/users', status: 'PASSED', duration: 245 },
            { name: 'POST /api/users', status: 'PASSED', duration: 312 },
            { name: 'PUT /api/users/1', status: 'FAILED', duration: 156, error: 'Assertion failed: status code' },
            { name: 'DELETE /api/users/1', status: 'PASSED', duration: 189 },
            { name: 'GET /api/health', status: 'PASSED', duration: 98 }
        ]
    };
    
    res.json(report);
});

// Get JUnit report
app.get('/api/v1/testjobs/:id/reports/junit', (req, res) => {
    const executionId = req.params.id;
    const execution = executions.get(executionId);
    
    if (!execution) {
        return res.status(404).text('Execution not found');
    }
    
    const junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="ReadyAPI Test Suite" tests="5" failures="1" errors="0" time="28.5">
    <testcase name="GET /api/users" classname="APITests" time="0.245"/>
    <testcase name="POST /api/users" classname="APITests" time="0.312"/>
    <testcase name="PUT /api/users/1" classname="APITests" time="0.156">
        <failure message="Assertion failed: status code">Expected 200 but got 400</failure>
    </testcase>
    <testcase name="DELETE /api/users/1" classname="APITests" time="0.189"/>
    <testcase name="GET /api/health" classname="APITests" time="0.098"/>
</testsuite>`;
    
    res.type('application/xml').send(junitXml);
});

// Get execution logs
app.get('/api/v1/testjobs/:id/logs', (req, res) => {
    const executionId = req.params.id;
    const execution = executions.get(executionId);
    
    if (!execution) {
        return res.status(404).text('Execution not found');
    }
    
    const logs = `[${new Date().toISOString()}] Starting execution ${executionId}
[${new Date().toISOString()}] Loading project: ${execution.projectFile}
[${new Date().toISOString()}] Executing test: GET /api/users - PASSED
[${new Date().toISOString()}] Executing test: POST /api/users - PASSED
[${new Date().toISOString()}] Executing test: PUT /api/users/1 - FAILED: Assertion failed
[${new Date().toISOString()}] Executing test: DELETE /api/users/1 - PASSED
[${new Date().toISOString()}] Executing test: GET /api/health - PASSED
[${new Date().toISOString()}] Execution completed: 4 passed, 1 failed`;
    
    res.type('text/plain').send(logs);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Mock TestEngine running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/v1/testjobs`);
    console.log(`Login: admin/admin`);
});