const express = require('express');

function createRouter(taskService) {
  const router = express.Router();

  router.get('/tasks', async (req, res) => {
    try {
      const tasks = await taskService.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/tasks', async (req, res) => {
    try {
      const { title, completed } = req.body;
      const task = await taskService.createTask(title, completed);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createRouter;
