# Containerized Backend & Database Stack (BE-04)

This project implements a task management API that supports dynamic database swapping (In-Memory array vs. PostgreSQL database) and is containerized using Docker and Docker Compose.

---

## 1. Decoupled Layered Architecture

To prove that switching database storage changes exactly one configuration detail without breaking the application, the backend is organized into clean, isolated layers:

*   **Domain Layer** (`src/domain/task.js`): Defines the core `Task` model.
*   **Repository Interface** (`src/repositories/taskRepository.js`): Abstract interface defining standard CRUD operations (`getAll`, `create`).
*   **In-Memory Repository** (`src/repositories/inMemoryTaskRepository.js`): Local state database mock.
*   **Postgres Repository** (`src/repositories/postgresTaskRepository.js`): Real database storage utilizing the `pg` client.
*   **Service Layer** (`src/services/taskService.js`): Handles business logic. Consumes only the abstract repository interface.
*   **Routes Layer** (`src/routes.js`): Express router executing API endpoints.

### The Swapping Payoff
Our endpoints (`GET /tasks` and `POST /tasks`) and business logic (`taskService`) have **zero knowledge** of how tasks are saved. When we switch from In-Memory to PostgreSQL, only the server startup file (`server.js`) is updated to inject the PostgreSQL repository. The routes and service files remain **100% unchanged**.

---

## 2. Docker Stack Services

The `docker-compose.yml` configures three isolated services:

1.  **db**: A PostgreSQL Alpine database container using a persistent volume (`pgdata`) mapped to `/var/lib/postgresql/data`. It runs `init.sql` on startup to initialize the schema.
2.  **app**: The Node.js application container built from the local `Dockerfile`. It waits for `db` to be healthy before starting up.
3.  **redis**: An Alpine Redis container available for caching in future assignments.

---

## 3. How to Run the Stack

1.  Create your local environment file:
    ```bash
    cp .env.example .env
    ```
2.  Start the entire stack (Node app + Postgres + Redis):
    ```bash
    docker compose up --build
    ```
    *This compiles the Dockerfile, launches the containers, and exposes the app on `http://localhost:3000`.*

---

## 4. How to Prove Persistence (Validation Plan)

To prove that the data persists across application restarts and database container resets, perform these verification steps:

### Step 1: Create a Task
Run a POST request to add a new task:
```bash
curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "Verify Docker Persistence", "completed": false}'
```
*Expected response*: `{"id":1,"title":"Verify Docker Persistence","completed":false,...}`

### Step 2: Read Current Tasks
Run a GET request to verify the task is saved:
```bash
curl http://localhost:3000/tasks
```

### Step 3: Stop and Restart the Stack
Stop all containers:
```bash
docker compose down
```
Start the stack back up:
```bash
docker compose up -d
```

### Step 4: Verify the Data Still Exists
Fetch the tasks list again:
```bash
curl http://localhost:3000/tasks
```
*   **Expected Result**: The task `"Verify Docker Persistence"` is still present, proving that the PostgreSQL volume has successfully persisted the data across restarts.

---

## 5. AI API Integration (Connect to an AI API)

The backend includes a swappable AI client wrapper that integrates with LLM APIs (Gemini, Groq, or local Ollama) to extract tasks from unstructured raw text.

### The Seam Pattern
All model-specific details are isolated within `src/services/aiService.js`. Switching between models is controlled 100% via environment variables in `.env` without modifying routes or services:
- `AI_PROVIDER`: `gemini` | `groq` | `ollama`
- `AI_MODEL`: Model name (e.g., `gemini-1.5-flash` or `llama3-8b-8192`)
- `GEMINI_API_KEY` / `GROQ_API_KEY`: API keys (hidden in `.env`, never committed)

### Endpoints
*   **POST `/tasks/extract`**: Takes raw user text, executes task extraction via the selected LLM, validates output into structured JSON, saves each extracted task into the database, and returns the saved array.

**Request**:
```bash
curl -X POST http://localhost:3000/tasks/extract \
     -H "Content-Type: application/json" \
     -d '{"text": "I need to review code today and deployment is on Friday morning"}'
```

**Expected Response**:
```json
[
  { "id": 1, "title": "Review code", "completed": false },
  { "id": 2, "title": "Deployment", "completed": false }
]
```

### Safety and Reliability Features
- **Structured JSON Validation**: Enforces JSON response formats. If the model output cannot be parsed, the app gracefully returns a `500` error instead of crashing.
- **Strict Timeouts**: Every LLM call is wrapped in a timeout (default `8000ms`) via `AbortController` to prevent hanging processes.
- **Smart Retries with Backoff**: The HTTP layer automatically retries failed requests if the API returns rate limits (`429`) or server errors (`5xx`) using exponential backoff. Client failures (`400`, `401`, `403`) fail immediately.
- **Token Logging & Cost Estimates**: Every request logs the model name, input/output token counts, and calculates real-time USD costs based on public pricing schedules ($0.075/M input, $0.30/M output for Gemini Flash).
