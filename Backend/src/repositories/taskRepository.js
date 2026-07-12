class TaskRepository {
  async getAll() {
    throw new Error("Method 'getAll()' must be implemented.");
  }

  async create(title, completed) {
    throw new Error("Method 'create()' must be implemented.");
  }
}

module.exports = TaskRepository;
