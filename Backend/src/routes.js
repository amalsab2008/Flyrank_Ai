const express = require('express');

function createRouter(taskService, aiService, jobService, reportService) {
  const router = express.Router();

  // GET all tasks
  router.get('/tasks', async (req, res) => {
    try {
      const tasks = await taskService.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST create a single task
  router.post('/tasks', async (req, res) => {
    try {
      const { title, completed } = req.body;
      const task = await taskService.createTask(title, completed);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST extract structured tasks from raw user text via LLM
  router.post('/tasks/extract', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: 'Text field must be a non-empty string.' });
      }

      if (!aiService) {
        return res.status(503).json({ error: 'AI Service is not initialized on this server.' });
      }

      // Extract tasks via LLM service
      const extractedTasks = await aiService.extractTasks(text);

      // Save each extracted task into our repository
      const savedTasks = [];
      for (const t of extractedTasks) {
        const saved = await taskService.createTask(t.title, t.completed);
        savedTasks.push(saved);
      }

      res.status(201).json(savedTasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST trigger on-demand PDF report generation (returns 202 Accepted)
  router.post('/reports', async (req, res) => {
    try {
      if (!jobService || !reportService) {
        return res.status(503).json({ error: 'Report generation services are not initialized.' });
      }

      const job = await jobService.createJob('pdf_report');
      
      // Spawn job execution in background
      jobService.runBackgroundJob(job.id, (updateProgress) => {
        return reportService.generatePdfReport(job.id, updateProgress);
      });

      res.status(202).json({
        message: 'Report generation job submitted successfully.',
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          created_at: job.created_at
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET all report generation jobs
  router.get('/reports/jobs', async (req, res) => {
    try {
      if (!jobService) {
        return res.status(503).json({ error: 'Job service not initialized.' });
      }
      const jobs = await jobService.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET details / status of a specific job
  router.get('/reports/jobs/:id', async (req, res) => {
    try {
      if (!jobService) {
        return res.status(503).json({ error: 'Job service not initialized.' });
      }
      const job = await jobService.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createRouter;
