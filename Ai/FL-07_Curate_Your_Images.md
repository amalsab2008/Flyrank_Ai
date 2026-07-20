# Kill Your Darlings: Curate Your Images (FL-07 / Week 3)
**Intern**: Amal S  
**Track**: General AI Fluency  
**Date**: July 20, 2026  

---

## 1. Portfolio Image Content Map

The visual strategy strictly separates **real technical proof** (real captures of code, terminal output, and identity) from **connective tissue** (branding assets and sitemap diagrams).

| Portfolio Section | Image Asset | Image Type | Purpose / Function |
| :--- | :--- | :--- | :--- |
| **Header / Branding** | `portfolio_favicon_logo.png` | AI-Generated (Connective) | Minimalist **AS** monogram logo matching `#0F172A` slate theme. |
| **Hero / Bio Section** | `real_headshot_photo.png` | **Real Photo** | Authentic developer photo for identity and human trust. |
| **Sitemap Flow** | `portfolio_sitemap_sketch.png` | AI-Generated (Connective) | High-level architectural flowchart of the single-page layout. |
| **Case Study 1: Password Engine** | `password_tool_cli_output.png` | **Real Capture** | Terminal output showing Argon2 hashing & Bloom filter $O(1)$ lookup logs. |
| **Case Study 2: Containerized API** | `docker_compose_curl_terminal.png` | **Real Capture** | Real terminal capture of `docker compose up` and `curl` JSON API response. |
| **Case Study 3: Workflow Audit** | `fl01_audit_matrix_table.png` | **Real Capture** | Direct capture of the 12-task audit matrix. |
| **Claude Project Setup** | `claude_tutor_project_screenshot.png` | **Real Capture** | Actual UI screenshot of the configured Claude Project instructions. |

---

## 2. Real Captures vs. AI Stand-ins Decision Rationale

### Rule 1: Real Photo for Personal Identity
* **Decision**: Use an authentic, real profile photo for the developer bio.
* **Rationale**: AI-generated avatar headshots feel uncanny, artificial, and immediately undermine personal trust. A Security Engineering Lead evaluating a candidate wants to verify a real human builder, not a synthetic persona.

### Rule 2: Real Captures for Technical Proof (No AI Pseudo-Code)
* **Decision**: Mandate real terminal execution logs and code screenshots for Case Studies 1, 2, and 3.
* **Rationale**: Generative AI tools frequently produce "pseudo-code" images with floating nonsensical syntax (e.g., `def func(): $$$ == null`). To a technical reviewer, fake AI code screenshots signal that the candidate has no real running software to demonstrate. Real terminal captures of `curl` headers, `docker compose` logs, and `pytest` outputs prove actual technical execution.

---

## 3. Ruthless Curation: Rejection Notes (The Kill List)

To ensure the portfolio feels intentional rather than cluttered, several AI-generated images were ruthlessly rejected during curation.

### Rejection 1: 3D Glowing Neon Cyber Skull Graphic
* **Prompt Tried**: `"A futuristic 3D render of a glowing neon cyan cyber security skull with hacker matrix code in the background."`
* **Why It Was Killed**: 
  - **Violated Design Identity**: The bright cyan neon and chaotic matrix code completely violated the standing Identity Kit rule (*"a calm, high-contrast dark slate theme where code artifacts are the loudest element"*).
  - **Generic Stock Aesthetic**: It screamed amateur "stock photo" rather than professional engineering portfolio. It distracted from the actual technical case studies.

### Rejection 2: AI-Generated "Cybersecurity Dashboard" Mockup
* **Prompt Tried**: `"A realistic UI dashboard screenshot of a cybersecurity password analysis tool with graphs and code."`
* **Why It Was Killed**:
  - **Syntactically Invalid Code**: Zooming into the generated image revealed gibberish code syntax (`if user == ### argon_hash(???))`).
  - **Destruction of Trust**: A Security Lead inspecting the portfolio would instantly spot the fake code. Replacing it with a clean, real CLI terminal capture of the actual Python script output provided 100x higher credibility.

---

## 4. Visual Consistency Audit

All AI-generated connective tissue assets (`portfolio_favicon_logo.png` and `portfolio_sitemap_sketch.png`) share a unified design language:

1. **Color Palette Alignment**: Strictly built on the `#0F172A` (Slate 900) background with `#6366F1` (Indigo 500) accents.
2. **Coherent Style Set**: Clean, geometric, minimal line-art aesthetic without decorative clutter.
3. **Hierarchy**: Connective visuals serve purely as structural framing; real code and terminal output captures remain the brightest, highest-contrast focal points.
