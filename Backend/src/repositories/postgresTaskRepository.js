const TaskRepository = require('./taskRepository');
const { Pool } = require('pg');

class PostgresTaskRepository extends TaskRepository {
  constructor(connectionString) {
    super();
    this.pool = new Pool({
      connectionString: connectionString,
    });
  }

  async getAll() {
    const result = await this.pool.query('SELECT * FROM tasks ORDER BY created_at ASC');
    return result.rows;
  }

  async create(title, completed = false) {
    const result = await this.pool.query(
      'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
      [title, completed]
    );
    return result.rows[0];
  }

  async getStats() {
    const result = await this.pool.query(`
      SELECT 
        COUNT(*)::integer as total,
        COALESCE(SUM(CASE WHEN completed = true THEN 1 ELSE 0 END), 0)::integer as completed,
        COALESCE(SUM(CASE WHEN completed = false THEN 1 ELSE 0 END), 0)::integer as pending
      FROM tasks
    `);
    return result.rows[0];
  }
}

module.exports = PostgresTaskRepository;
