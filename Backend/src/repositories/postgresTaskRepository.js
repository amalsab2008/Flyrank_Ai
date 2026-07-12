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
}

module.exports = PostgresTaskRepository;
