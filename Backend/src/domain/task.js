class Task {
  constructor(id, title, completed = false, created_at = new Date()) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.created_at = created_at;
  }
}

module.exports = Task;
