const TaskRepository = require('./taskRepository');
const Task = require('../domain/task');

class InMemoryTaskRepository extends TaskRepository {
  constructor() {
    super();
    this.tasks = [];
    this.currentId = 1;
  }

  async getAll() {
    return this.tasks;
  }

  async create(title, completed = false) {
    const task = new Task(this.currentId++, title, completed);
    this.tasks.push(task);
    return task;
  }

  async getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }
}

module.exports = InMemoryTaskRepository;
