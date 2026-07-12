require('dotenv').config();
const express = require('express');
const path = require('path');

const InMemoryTaskRepository = require('./src/repositories/inMemoryTaskRepository');
const PostgresTaskRepository = require('./src/repositories/postgresTaskRepository');
const TaskService = require('./src/services/taskService');
const AiService = require('./src/services/aiService');

const InMemoryJobRepository = require('./src/repositories/inMemoryJobRepository');
const PostgresJobRepository = require('./src/repositories/postgresJobRepository');
const JobService = require('./src/services/jobService');
const ReportService = require('./src/services/reportService');
const ScheduleService = require('./src/services/scheduleService');

const createRouter = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_TYPE = process.env.DB_TYPE || 'memory';
const REPORT_SCHEDULE_MS = process.env.REPORT_SCHEDULE_MS ? parseInt(process.env.REPORT_SCHEDULE_MS, 10) : null;

// Initialize the repositories based on configuration
let repository;
let jobRepository;

if (DB_TYPE === 'postgres') {
  console.log('Using PostgreSQL Database Repository');
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
  }
  repository = new PostgresTaskRepository(process.env.DATABASE_URL);
  jobRepository = new PostgresJobRepository(process.env.DATABASE_URL);
} else {
  console.log('Using In-Memory Database Repository');
  repository = new InMemoryTaskRepository();
  jobRepository = new InMemoryJobRepository();
}

// Inject repository into Service
const taskService = new TaskService(repository);
const jobService = new JobService(jobRepository);
const reportService = new ReportService(taskService);

// Start Scheduler
const scheduleService = new ScheduleService(jobService, reportService, REPORT_SCHEDULE_MS);
scheduleService.start();

// Initialize AI Service
const aiService = new AiService();

// Express Middleware
app.use(express.json());

// Serve PDF reports statically
app.use('/reports', express.static(path.join(__dirname, 'public/reports')));

// Bind Router with injected Services
app.use('/', createRouter(taskService, aiService, jobService, reportService));

// Fallback health status endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: DB_TYPE,
    ai: aiService.provider,
    scheduler: REPORT_SCHEDULE_MS ? `Active (Interval: ${REPORT_SCHEDULE_MS}ms)` : 'Inactive',
    time: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
