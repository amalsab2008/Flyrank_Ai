const JobRepository = require('./jobRepository');
const { Pool } = require('pg');

class PostgresJobRepository extends JobRepository {
  constructor(connectionString) {
    super();
    this.pool = new Pool({
      connectionString: connectionString,
    });
    
    // Auto-create jobs table if it does not exist (Self-healing schema design)
    this.pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        result TEXT,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(err => console.error("Failed to ensure jobs table exists:", err));
  }

  async getAll() {
    const result = await this.pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    return result.rows;
  }

  async getById(id) {
    const result = await this.pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(type) {
    const result = await this.pool.query(
      "INSERT INTO jobs (type, status, progress) VALUES ($1, 'pending', 0) RETURNING *",
      [type]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const query = `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = PostgresJobRepository;
