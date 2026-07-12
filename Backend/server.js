require('dotenv').config();
const express = require('express');

const InMemoryTaskRepository = require('./src/repositories/inMemoryTaskRepository');
const PostgresTaskRepository = require('./src/repositories/postgresTaskRepository');
const TaskService = require('./src/services/taskService');
const AiService = require('./src/services/aiService');
const createRouter = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_TYPE = process.env.DB_TYPE || 'memory';

// Initialize the repository based on configuration
let repository;
if (DB_TYPE === 'postgres') {
  console.log('Using PostgreSQL Database Repository');
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
  }
  repository = new PostgresTaskRepository(process.env.DATABASE_URL);
} else {
  console.log('Using In-Memory Database Repository');
  repository = new InMemoryTaskRepository();
}

// Inject repository into Service
const taskService = new TaskService(repository);

// Initialize AI Service
const aiService = new AiService();

// Express Middleware
app.use(express.json());

// Bind Router with injected Services
app.use('/', createRouter(taskService, aiService));

// Fallback health status endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: DB_TYPE, ai: aiService.provider, time: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
