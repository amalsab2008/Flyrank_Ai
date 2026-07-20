# Agent Concepts and MCP Basics (FL-05 / Week 4)
**Intern**: Amal S  
**Track**: General AI Fluency  
**Date**: July 20, 2026  

---

## 1. Technical Explainer: Workflows, Agents, and MCP

### Section 1: Workflows vs. Agents (Understanding Control Flow)
In modern AI engineering, the word "agent" is frequently overused. To evaluate AI systems objectively, developers must distinguish between a **Workflow** and an **Agent**.

* **A Workflow** is a system where the control flow is pre-determined and fixed by a human developer. The Large Language Model (LLM) is invoked at specific nodes within a hardcoded graph to perform text transformation, structured data extraction, or formatting. The sequence of steps (e.g., Step A $\rightarrow$ Step B $\rightarrow$ Step C) never changes regardless of the input data.
* **An Agent** is a system where the LLM operates as the central decision-making engine in a dynamic loop. Instead of following a rigid sequence, the agent receives a high-level goal, inspects its environment, autonomously decides which tools to call, evaluates the output of those tools, and determines its own next action until the goal is satisfied.

#### Classification of FL-04:
My FL-04 Security Advisory Pipeline was strictly a **Workflow**. It executed a deterministic four-step pipeline (Ingest $\rightarrow$ Synthesize JSON $\rightarrow$ AppSec Audit $\rightarrow$ Executive Formatting). The handoffs between steps were pre-programmed in a fixed sequence. The LLM did not choose which step to run next or decide whether extra data was needed; it simply executed instructions at each node.

---

### Section 2: Model Context Protocol (MCP) — The USB-C Port for AI
Without a standardized protocol, connecting LLMs to local filesystems, databases, APIs, and cloud tools requires writing custom integration code for every single platform. The **Model Context Protocol (MCP)**, introduced by Anthropic, solves this by acting as an open, universal "USB-C port" for AI applications.

MCP standardizes client-server communication between an AI application (the MCP client) and external data/tool providers (MCP servers) using three core primitives:

1. **Tools**: Executable functions that allow the LLM to perform actions in the external world (e.g., reading local files, running bash commands, querying SQL databases, or posting GitHub PRs).
2. **Resources**: Read-only contextual data sources exposed to the LLM (e.g., application log streams, database schema definitions, API documentation, or local config files).
3. **Prompts**: Standardized, reusable prompt templates stored on the MCP server that assist users and agents in launching specific workflows.

---

### Section 3: Upgrading FL-04 from a Workflow to an Autonomous Agent
To transform my FL-04 vulnerability workflow into a true **Autonomous Security Remediation Agent**, the fixed linear pipeline must be replaced with an agentic ReAct loop (Reasoning + Acting) powered by MCP tools.

#### The Agentic Architecture:
Instead of forcing a linear 4-step sequence, the agent is given a high-level goal:  
> *"Audit our backend repository for active CVE vulnerabilities, verify exploitability, and submit a security patch."*

#### Required MCP Tools:
- `nvd_cve_lookup`: Connects to NIST API to fetch CVSS scores and exploit vectors.
- `local_repo_scanner`: Inspects `package.json` or `requirements.txt` for vulnerable dependency versions.
- `trivy_container_scan`: Runs container image security scans against local Docker images.
- `create_github_branch_and_pr`: Automatically creates a git branch, updates dependencies, and opens a GitHub pull request.

#### How the Agent Operates:
1. **Perceive**: The agent reads an incoming CVE alert.
2. **Decide Tool**: It autonomously calls `local_repo_scanner` to check if the workspace is affected.
3. **Branching Decision**: If the package is NOT installed, the agent terminates early, logging *"Not Affected"*. If installed, it calls `nvd_cve_lookup` to check exploit conditions.
4. **Action**: It updates `package.json`, runs `npm test` via local execution tools, and if tests pass, invokes `create_github_branch_and_pr` to submit the fix.

---

## 2. Evidence of Tool Execution (3 Non-Chat Tasks)

Below is the verified evidence of three tasks executed via local tools (filesystem, CLI, and search tools) that plain text LLM chat alone could not perform:

### Task 1: Local Filesystem Inspection (`view_file`)
* **Goal**: Read raw source code directly from local disk.
* **Tool Called**: `view_file(AbsolutePath="c:\...\Backend\server.js")`
* **Output Snippet**:
  ```javascript
  1: require('dotenv').config();
  2: const express = require('express');
  18: const app = express();
  20: const DB_TYPE = process.env.DB_TYPE || 'memory';
  ```

---

### Task 2: System Terminal Command Execution (`run_command`)
* **Goal**: Query the local git repository commit history via terminal shell execution.
* **Tool Called**: `run_command(CommandLine="git log -n 3 --oneline")`
* **Output Snippet**:
  ```text
  fae77bd Add FL-04 Ship an Automation Workflow v2 document
  4162143 Add FL-10 Three Roads Stack Selection document
  8f79945 Add index.html and FL-09 Empty but Live deliverables
  ```

---

### Task 3: Workspace Ripgrep Codebase Search (`Select-String` / Search Tool)
* **Goal**: Search local project markdown files for specific cryptographic references.
* **Tool Called**: `run_command(CommandLine="Select-String -Path 'Ai\*.md' -Pattern 'Argon2'")`
* **Output Snippet**:
  ```text
  Ai\FL-03_What_Are_We_Proving.md:9: password security engine and a breached-password lookup tool using Argon2 hashing
  Ai\FL-04_Framed_Cases_Work_That_Speaks.md:18: Tech Stack: Python 3.13, Argon2id, Bloom Filters, Linux CLI
  ```
