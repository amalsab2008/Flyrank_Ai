const JobRepository = require('./jobRepository');

class InMemoryJobRepository extends JobRepository {
  constructor() {
    super();
    this.jobs = [];
    this.currentId = 1;
  }

  async getAll() {
    return this.jobs;
  }

  async getById(id) {
    const job = this.jobs.find(j => j.id === parseInt(id, 10));
    return job || null;
  }

  async create(type) {
    const now = new Date().toISOString();
    const job = {
      id: this.currentId++,
      type: type,
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      created_at: now,
      updated_at: now
    };
    this.jobs.push(job);
    return job;
  }

  async update(id, updates) {
    const job = await this.getById(id);
    if (!job) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    Object.assign(job, updates);
    job.updated_at = new Date().toISOString();
    return job;
  }
}

module.exports = InMemoryJobRepository;
