class TaskRepository {
  async getAll() {
    throw new Error("Method 'getAll()' must be implemented.");
  }

  async create(title, completed) {
    throw new Error("Method 'create()' must be implemented.");
  }

  async getStats() {
    throw new Error("Method 'getStats()' must be implemented.");
  }
}

module.exports = TaskRepository;
