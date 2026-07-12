class JobRepository {
  async getAll() {
    throw new Error("Method 'getAll()' must be implemented.");
  }

  async getById(id) {
    throw new Error("Method 'getById()' must be implemented.");
  }

  async create(type) {
    throw new Error("Method 'create()' must be implemented.");
  }

  async update(id, updates) {
    throw new Error("Method 'update()' must be implemented.");
  }
}

module.exports = JobRepository;
