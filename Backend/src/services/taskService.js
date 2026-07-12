class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async getTasks() {
    return await this.taskRepository.getAll();
  }

  async createTask(title, completed) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error("Task title must be a non-empty string.");
    }
    return await this.taskRepository.create(title.trim(), completed);
  }

  async getStats() {
    return await this.taskRepository.getStats();
  }
}

module.exports = TaskService;
