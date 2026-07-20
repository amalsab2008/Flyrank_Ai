# The Prompt Ladder (FL-05)
**Intern**: Amal S  
**Track**: General AI Fluency / Cybersecurity Track  
**Date**: July 20, 2026  

---

## 1. Target Vulnerable Code Snippet
The following Python authentication function serves as the test input across all prompt iterations:

```python
import hashlib

def login_user(username, password, stored_users):
    # Vulnerable login implementation
    if username in stored_users:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        if hashed_password == stored_users[username]['password_hash']:
            return True
    return False
```

---

## 2. The 6-Stage Prompt Ladder

### Version 0: Weak Baseline
* **Layer Added**: None (Weak, lazy prompt)
* **Prompt**:
  > `"Review this security code for bugs: [code snippet]"`

* **Output Excerpt**:
  > *"The function checks if username is in stored_users. You can improve it by adding docstrings, using `get()` for dictionary lookups, and formatting with PEP8 style. Make sure password hashing is secure."*

* **Notes**:
  1. *What changed in prompt*: Baseline run.
  2. *What actually improved in output*: N/A (Baseline).
  3. *What still failed*: Output is superficial and useless for security. It suggests Python PEP8 style formatting and `dict.get()` lookups while completely missing critical vulnerabilities (un-salted SHA256, timing attacks, lack of rate limiting).
  4. *What to try next*: Add a explicit security goal focused on cryptographic vulnerabilities and OWASP standards.

---

### Version 1: + Clear Goal
* **Layer Added**: **Clear Goal**
* **Prompt**:
  > `"Review this Python authentication function specifically for cryptographic vulnerabilities, OWASP Top 10 flaws, and secret storage issues: [code snippet]"`

* **Output Excerpt**:
  > *"1. SHA256 without salt is vulnerable to rainbow table attacks. Use salted hashing.\n2. Plain string comparison `==` is vulnerable to timing attacks.\n3. Dictionary lookup should handle missing keys cleanly."*

* **Notes**:
  1. *What changed in prompt*: Specified an explicit goal targeting cryptographic flaws and OWASP Top 10 vulnerabilities.
  2. *What actually improved in output*: The model stopped suggesting non-security PEP8 style edits and correctly identified SHA256 lack of salt and string timing attacks.
  3. *What still failed*: The output lists generic security theory without pinpointing exact line numbers or providing replacement code.
  4. *What to try next*: Define an AppSec Engineer persona/role to elevate the depth of review.

---

### Version 2: + Defined Audience & Role
* **Layer Added**: **Defined Audience & Role**
* **Prompt**:
  > `"Act as a Senior Application Security Engineer conducting a code review for a DevSecOps intern. Review this Python authentication function for cryptographic vulnerabilities: [code snippet]"`

* **Output Excerpt**:
  > *"Hey there! Welcome to code reviews. As a DevSecOps intern, it's great that you're looking into authentication logic! Let's talk about security. When we hash passwords, SHA256 is fast, which is actually bad because attackers can brute-force it fast..."*

* **Notes**:
  1. *What changed in prompt*: Added persona ("Senior Application Security Engineer reviewing code for a DevSecOps intern").
  2. *What actually improved in output*: The explanation of *why* fast hashes like SHA256 are dangerous for password storage improved in technical clarity.
  3. *What made it worse / didn't help (Honest Fail)*: **Adding the intern audience persona backfired.** The model adopted a chatty, patronizing tone and added 200 words of conversational preamble ("Hey there! Welcome to code reviews..."). It diluted the technical density of the review.
  4. *What to try next*: Strip the conversational persona and strictly constrain the output format into a Markdown table.

---

### Version 3: + Specified Output Format
* **Layer Added**: **Specified Output Format**
* **Prompt**:
  > `"Act as a Senior Application Security Engineer. Audit this Python authentication function for cryptographic vulnerabilities. Format your response strictly as a Markdown table with columns: [Line Number, Vulnerability Name, Severity (High/Med/Low), Remediation Code]: [code snippet]"`

* **Output Excerpt**:
  | Line Number | Vulnerability Name | Severity | Remediation Code |
  | :--- | :--- | :--- | :--- |
  | Line 7 | Un-salted SHA256 Hashing | High | `import hashlib, os`<br>`salt = os.urandom(16)`<br>`hashlib.pbkdf2_hmac(...)` |
  | Line 8 | Timing Attack Vulnerability | Medium | `import hmac`<br>`hmac.compare_digest(hashed, stored)` |

* **Notes**:
  1. *What changed in prompt*: Added a strict Markdown table format with explicit column names.
  2. *What actually improved in output*: **Completely eliminated all chatty preamble and conversational filler.** The response became instant, structured, and easy to parse line-by-line.
  3. *What still failed*: The remediation code recommended `pbkdf2_hmac`, which is acceptable but inferior to modern memory-hard algorithms like Argon2id.
  4. *What to try next*: Add explicit quality constraints specifying required algorithms (Argon2id) and forbidden practices.

---

### Version 4: + Quality Criteria & Technical Constraints
* **Layer Added**: **Quality Criteria & Technical Constraints**
* **Prompt**:
  > `"Act as a Senior Application Security Engineer. Audit this Python authentication function for cryptographic vulnerabilities. Format as a Markdown table with [Line Number, Vulnerability, Severity, Remediation]. Constraint: Do not suggest legacy or fast hashes (MD5, SHA1, plain SHA256). Require Argon2id with zero plaintext retention: [code snippet]"`

* **Output Excerpt**:
  | Line Number | Vulnerability | Severity | Remediation |
  | :--- | :--- | :--- | :--- |
  | Line 7 | Fast Hash (SHA256) | High | `from argon2 import PasswordHasher`<br>`ph = PasswordHasher()`<br>`ph.hash(password)` |
  | Line 8 | String Equality Timing Attack | Medium | `ph.verify(stored_hash, password)` |

* **Notes**:
  1. *What changed in prompt*: Added explicit cryptographic constraints forbidding fast hashes and requiring Argon2id.
  2. *What actually improved in output*: The remediation column upgraded from basic PBKDF2 to production-grade Argon2id (`argon2-cffi`), correctly utilizing `ph.verify()` which handles timing-safe comparison automatically.
  3. *What still failed*: It does not provide runnable verification code or unit tests to prove the fix works.
  4. *What to try next*: Add verification requirements (runnable unit tests testing valid vs exploit payloads).

---

### Version 5: + Verification Requirements
* **Layer Added**: **Verification Requirements**
* **Prompt**:
  > `"Act as a Senior Application Security Engineer. Audit this Python authentication function for cryptographic vulnerabilities. Format as a Markdown table with [Line Number, Vulnerability, Severity, Remediation]. Constraint: Require Argon2id. Verification: Include a runnable pytest test script demonstrating both a passing valid login and a blocked malicious/invalid input: [code snippet]"`

* **Output Excerpt**:
  *(Table same as V4, followed by verification script)*:
  ```python
  import pytest
  from argon2 import PasswordHasher
  from argon2.exceptions import VerifyMismatchError

  ph = PasswordHasher()
  hashed = ph.hash("SecurePass123!")
  stored_users = {"alice": {"password_hash": hashed}}

  def test_valid_login():
      assert ph.verify(stored_users["alice"]["password_hash"], "SecurePass123!")

  def test_invalid_login():
      with pytest.raises(VerifyMismatchError):
          ph.verify(stored_users["alice"]["password_hash"], "WrongPass!")
  ```

* **Notes**:
  1. *What changed in prompt*: Added verification requirement (runnable pytest script proving valid vs malicious input handling).
  2. *What actually improved in output*: The output now includes end-to-end executable test code that can be immediately copied into a CI/CD test runner.
  3. *What still failed*: None. The output is structured, precise, cryptographically sound, and verifiable.
  4. *What to try next*: Clean up into a universal template for team reuse.

---

## 3. Final Reusable Prompt

Below is the finalized, production-ready prompt template designed for any developer or security reviewer on the track:

```text
Act as a Senior Application Security Engineer. Perform a rigorous security audit on the following Python code snippet.

1. Focus Area: Identify cryptographic weaknesses, OWASP Top 10 vulnerabilities, timing attacks, and improper secret handling.
2. Output Format: Present findings strictly as a Markdown table with the following columns:
   | Line Number | Vulnerability Name | Severity (High/Med/Low) | Remediation Code |

3. Technical Constraints:
   - Do NOT suggest deprecated or fast hash algorithms (MD5, SHA1, SHA256/512 without salt).
   - Require modern memory-hard password hashing (Argon2id via `argon2-cffi`).
   - Use timing-safe comparisons (`hmac.compare_digest` or `argon2.PasswordHasher.verify`).
   - Eliminate plaintext secret retention.

4. Verification Requirements:
   - Provide a complete, runnable `pytest` test script at the bottom demonstrating:
     a) A passing test for valid authentication.
     b) A failing test for invalid credentials or malicious timing attempts.

Code to Audit:
```python
<PASTE_YOUR_PYTHON_CODE_HERE>
```
```
