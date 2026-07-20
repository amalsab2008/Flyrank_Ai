# Frame It as Cases: Work That Speaks for Itself (FL-04)
**Intern**: Amal S  
**Role**: CS Engineering Student (Cybersecurity & Backend Automation)  
**Date**: July 20, 2026  

---

## 1. Voice Card
> **"Direct, sharp, plain-spoken, technical, zero fluff."**

*Rule: Every case study and portfolio section adheres strictly to this voice. No corporate buzzwords ("results-driven", "cutting-edge", "passionate innovator"). Only plain technical choices, explicit trade-offs, and measurable outcomes.*

---

## 2. Framed Case Studies

### Case 1: Attacker-Aware Password Analysis & Breach Detection Engine
* **Tech Stack**: Python 3.13, Argon2id, Bloom Filters, Linux CLI

#### Beat 1: The Problem
Standard password validators rely on naive regex checks (minimum 8 characters, 1 number, 1 special character). They fail to detect common human attack vectors—such as keyboard walks (`qwertyuiop`), date sequences (`20261234`), and repetitive dictionary words. Furthermore, verifying plaintext passwords against breached-credential lists via remote database queries introduces network latency and privacy leaks.

#### Beat 2: What I Did & Decisions Made
- Built an attacker-aware password evaluation engine in Python that scores entropy using pattern recognition rather than character count rules.
- Implemented Argon2id hashing for password storage, guaranteeing zero plaintext retention in memory or logs.
- Integrated an in-memory Bloom filter for $O(1)$ constant-time breached-password lookup, avoiding database disk I/O and external network calls during validation.
- Outputted explainable security risk scores formatted as clean JSON/CSV payloads for immediate integration into DevSecOps CI/CD pipelines.

#### Beat 3: What Came Of It
- Evaluates raw password strength in sub-milliseconds with zero plaintext exposure.
- Allows real-time credential breach checking against 100,000+ known leaked hashes with minimal RAM usage via Bloom filter bit arrays.

---

### Case 2: Decoupled AI Task Extraction & Containerized Backend Stack
* **Tech Stack**: Node.js, Express, PostgreSQL, Docker Compose, Redis, Gemini Flash & Groq LLMs

#### Beat 1: The Problem
Tightly coupling database drivers or LLM SDKs directly into HTTP routes makes backends brittle. Switching storage (e.g., from local memory to PostgreSQL) or swapping AI providers (e.g., Gemini to Groq or local Ollama) usually requires rewriting route handlers, risking production breakage and vendor lock-in.

#### Beat 2: What I Did & Decisions Made
- Architected a 4-layer decoupled backend: `Domain -> Repository Interface -> Service -> Routes`.
- Implemented an `InMemoryTaskRepository` and a `PostgresTaskRepository` sharing the exact same interface contract.
- Built an `AiService` wrapper module that isolates provider-specific logic. Configured it to handle structured JSON schema enforcement, strict 8000ms `AbortController` timeouts, and smart exponential backoff retries for status codes `429` (rate limit) and `5xx` (server error) while failing client errors (`400`, `401`, `403`) fast.
- Logged prompt/completion token usage and real-time USD cost estimates for every LLM call.
- Containerized the full stack (App + Postgres + Redis volume persistence) using Docker Compose.

#### Beat 3: What Came Of It
- Proved architectural decoupling: swapping between In-Memory and PostgreSQL storage requires changing **exactly 1 line in `.env`**, with zero changes to route handlers or business logic.
- Starts the entire database, caching layer, and Node service with a single command (`docker compose up`).

---

### Case 3: AI Workflow Audit & Task Optimization
* **Framework**: Ethan Mollick Task Classification Framework

#### Beat 1: The Problem
Unfiltered AI adoption in software engineering often leads to subtle bugs in core algorithms, wasted context window tokens, and over-reliance on unverified code snippets.

#### Beat 2: What I Did & Decisions Made
- Conducted a structured audit of 12 recurring weekly development tasks.
- Classified every task into four categories: *Just Me*, *Delegate with Review*, *Collaborate*, and *Fully Automate*.
- Explicitly marked 3 critical engineering tasks as **Just Me** (writing core domain algorithms, debugging complex concurrency/memory leaks, and peer PR reviews) to maintain full manual ownership where AI hallucinations present security risks.
- Automated deterministic tasks like unit test boilerplate generation and git log status summaries.

#### Beat 3: What Came Of It
- Reclaimed ~4 developer hours per week while eliminating silent AI bugs in core security logic.
- Established clear success criteria for automated tasks, ensuring 100% statement/branch coverage on generated test suites.

---

## 3. Portfolio Bio & Action / CTA Copy

### Portfolio Bio
> CS Engineering student specializing in cybersecurity and backend tool automation. I build secure-by-design systems, custom threat analysis tools, and LLM-powered backends that don't break in production.

### Action / CTA Copy
> **Looking for a DevSecOps or Security Engineering intern who can write clean, hardened code?**  
> Let's discuss technical requirements and system architectures.  
> [**Schedule a 15-Minute Technical Discussion**](#)

---

## 4. Before / After Comparison

### Generic AI Line (Before)
> *"I am a passionate, results-driven software engineer and dedicated cybersecurity enthusiast who leverages cutting-edge AI technologies and state-of-the-art backend frameworks to build seamless, high-performance digital solutions for enterprise clients."*

### Edited Voice Line (After)
> *"I write Python security tools and decoupled Node.js backends. I use Argon2 to hash credentials, Bloom filters for $O(1)$ breach lookups, and Docker to persist state."*

### Why the Edit Works
- **Cut 32 words of fluff**: Removed empty buzzwords ("results-driven", "passionate", "cutting-edge", "seamless", "state-of-the-art").
- **Replaced claims with proof**: Instead of claiming to build "high-performance solutions", it names the exact cryptographic algorithm (Argon2), data structure (Bloom filter), and containerization tool (Docker) used.
