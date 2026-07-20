# Prompting Fundamentals on Real Tasks v2 (FL-02)
**Intern**: Amal S  
**Track**: General AI Fluency  
**Target FL-01 Audit Task**: Target Task 1 — React to TypeScript Component Refactoring  
**Date**: July 20, 2026  

---

## 1. FL-01 Task Selection & Baseline Code

This prompt engineering log optimizes the prompt for converting legacy JavaScript React components (`.jsx`) to production-ready TypeScript (`.tsx`).

### Baseline Legacy Component (`UserProfileCard.jsx`):
```jsx
import React, { useState } from 'react';

export default function UserProfileCard({ user, onUpdate, isLoading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate({ ...user, name });
    setIsEditing(false);
  };

  if (isLoading) return <div className="spinner">Loading...</div>;

  return (
    <div className="profile-card">
      <img src={user.avatarUrl} alt={user.name} />
      {isEditing ? (
        <form onSubmit={handleSave}>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit">Save</button>
        </form>
      ) : (
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
}
```

---

## 2. The 6-Stage Prompt Iteration Log

### Version 0: Naive Baseline Prompt
* **Named Technique**: None (Naive baseline)
* **Prompt**:
  > `"Convert this React component to TypeScript: [code snippet]"`

* **Output Excerpt**:
  ```tsx
  export default function UserProfileCard({ user, onUpdate, isLoading }: any) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [name, setName] = useState<any>(user.name);
    // ... rest of component using 'any'
  ```

* **Notes**:
  - *Technique Applied*: None.
  - *Prompt Modification*: Baseline run.
  - *Observed Output Difference*: The output lazily assigns `any` to all props (`{ user, onUpdate, isLoading }: any`), fails to define a props interface, and uses implicit `any` for event parameters.

---

### Version 1: + Role Assignment
* **Named Technique**: **Role Assignment**
* **Prompt**:
  > `"Act as a Senior Principal Frontend Architect specializing in enterprise TypeScript migrations. Convert this React component to TypeScript: [code snippet]"`

* **Output Excerpt**:
  ```tsx
  interface UserProfileCardProps {
    user: any;
    onUpdate: (user: any) => void;
    isLoading: boolean;
  }
  export default function UserProfileCard({ user, onUpdate, isLoading }: UserProfileCardProps) { ... }
  ```

* **Notes**:
  - *Technique Applied*: Role Assignment ("Senior Principal Frontend Architect").
  - *Prompt Modification*: Added architect persona.
  - *Observed Output Difference*: Replaced inline `: any` prop signature with an explicit `interface UserProfileCardProps`. However, sub-fields inside `user` (`user: any`) remain un-typed.

---

### Version 2: + Context and Motivation
* **Named Technique**: **Context and Motivation**
* **Prompt**:
  > `"Act as a Senior Principal Frontend Architect. We are migrating our core design system to strict TypeScript (target: zero compilation errors under 'tsc --noEmit' with 'strictNullChecks' enabled). Convert this React component to TypeScript, ensuring prop safety so missing or optional fields do not cause runtime crashes: [code snippet]"`

* **Output Excerpt**:
  ```tsx
  interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; // Optional field handled
  }

  interface UserProfileCardProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
    isLoading?: boolean;
  }
  ```

* **Notes**:
  - *Technique Applied*: Context and Motivation (Targeting `tsc --noEmit` and `strictNullChecks`).
  - *Prompt Modification*: Added target compiler flags and safety rationale.
  - *Observed Output Difference*: Extracted a nested `User` interface, marked `avatarUrl` and `isLoading` as optional (`?`), and added null fallback handling (`user.avatarUrl || '/default-avatar.png'`) to prevent runtime crashes under strict null checking.

---

### Version 3: + Few-Shot Examples
* **Named Technique**: **Few-Shot Examples**
* **Prompt**:
  > `"Act as a Senior Principal Frontend Architect... [Context]... Here is an example of how we type synthetic event handlers and generic state hooks:
  > Example Input: const handleClick = (e) => setCount(e.target.value);
  > Example Output: const handleClick = (e: React.ChangeEvent<HTMLInputElement>): void => setCount(e.target.value);
  > 
  > Now convert this component using the exact same event typing patterns: [code snippet]"`

* **Output Excerpt**:
  ```tsx
  const handleSave = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onUpdate({ ...user, name });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };
  ```

* **Notes**:
  - *Technique Applied*: Few-Shot Examples.
  - *Prompt Modification*: Provided exemplary input/output pairs for React event handler signatures.
  - *Observed Output Difference*: Inline un-typed arrow function `(e) => setName(e.target.value)` was replaced with a strongly typed named handler `handleInputChange` using `React.ChangeEvent<HTMLInputElement>` and `React.FormEvent<HTMLFormElement>`.

---

### Version 4: + Output Structure Constraints
* **Named Technique**: **Output Structure Constraints**
* **Prompt**:
  > `"Act as a Senior Principal Frontend Architect... [Context & Few-Shot]... Format your response strictly into three Markdown sections:
  > 1. ### Type Definitions
  > 2. ### Refactored TSX Component
  > 3. ### Migration & Type Safety Notes
  > 
  > Component to convert: [code snippet]"`

* **Output Excerpt**:
  > ### Type Definitions
  > *(Contains standalone export interface User and UserProfileCardProps)*
  > 
  > ### Refactored TSX Component
  > *(Contains clean TSX code with zero conversational preamble)*
  > 
  > ### Migration & Type Safety Notes
  > *(Contains notes on strictNullChecks and optional props)*

* **Notes**:
  - *Technique Applied*: Output Structure Constraints.
  - *Prompt Modification*: Enforced 3 explicit Markdown headers.
  - *Observed Output Difference*: Completely stripped conversational conversational intros ("Here is your converted component!"). Separated type interfaces into a reusable module block distinct from the JSX layout.

---

### Version 5: + Step-by-Step Decomposition (Chain-of-Thought)
* **Named Technique**: **Step-by-Step Decomposition**
* **Prompt**:
  > `"Act as a Senior Principal Frontend Architect... [Context, Few-Shot, Structure]... Before outputting code, think step-by-step:
  > Step 1: Analyze implicit prop types and optional fields.
  > Step 2: Extract nested domain interfaces.
  > Step 3: Type React synthetic events and state hooks.
  > Step 4: Identify potential runtime bugs (e.g. missing optional chaining on callbacks).
  > Step 5: Output the final TSX code inside the structured sections.
  > 
  > Component to convert: [code snippet]"`

* **Output Excerpt**:
  ```tsx
  // Step 4 Fix identified during CoT:
  const handleSave = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onUpdate?.({ ...user, name }); // Added optional chaining on callback
    setIsEditing(false);
  };
  ```

* **Notes**:
  - *Technique Applied*: Step-by-Step Decomposition (Chain-of-Thought).
  - *Prompt Modification*: Required explicit 5-step decomposition before code generation.
  - *Observed Output Difference*: The model identified a subtle edge-case bug in the original code: if `onUpdate` prop was omitted, submitting the form would throw `onUpdate is not a function`. The CoT step added defensive optional chaining `onUpdate?.(...)`.

---

## 3. Cross-Model Comparison: Claude vs. ChatGPT

The final prompt (Version 5) was executed on both **Claude 3.5 Sonnet** and **ChatGPT (GPT-4o)** to evaluate performance across 4 dimensions:

| Dimension | Claude (Claude 3.5 Sonnet) | ChatGPT (GPT-4o) |
| :--- | :--- | :--- |
| **1. Tone & Style** | **Direct & Code-First**: Starts immediately with the requested sections. Zero conversational fluff. | **Conversational**: Adds intro preamble ("Sure! Here is the step-by-step conversion...") despite structural constraints. |
| **2. Type Precision** | **Exact**: Used `React.FormEvent<HTMLFormElement>` and inferred `readonly` properties for immutable domain data. | **Good**: Used `React.FormEvent`, but used `any` for the initial `useState` fallback state. |
| **3. Structure Compliance** | **100% Strict**: Adhered precisely to all 3 requested Markdown headers (`### Type Definitions`, etc.). | **Minor Breach**: Merged `### Type Definitions` inside the component code block rather than separating them. |
| **4. Edge Case Catching** | **Superior**: Added defensive optional chaining `onUpdate?.(...)` and handled empty avatar URLs gracefully. | **Standard**: Typed the props correctly, but missed adding optional chaining to `onUpdate`. |

---

## 4. Final Reusable Prompt Template

Below is the finalized, production-ready prompt template ready for any developer migrating React JavaScript code to TypeScript:

```text
Act as a Senior Principal Frontend Architect. Convert the following JavaScript React component (.jsx) into production-ready TypeScript (.tsx).

1. Target Goal & Context:
   - Target compiler settings: `tsc --noEmit` with `strictNullChecks` enabled.
   - Goal: Achieve 100% type safety with zero implicit `any` types and prevent runtime null crashes.

2. Typing Standards (Few-Shot Pattern):
   - Define standalone `interface` definitions for domain entities and component props.
   - Type all React synthetic events explicitly (e.g., `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`).
   - Use generic state parameters where applicable (e.g., `useState<User | null>(null)`).

3. Step-by-Step Thinking:
   Before generating code, think through:
   Step 1: Analyze implicit prop types and mark optional fields with `?`.
   Step 2: Extract nested domain interfaces.
   Step 3: Type React synthetic events and state hooks.
   Step 4: Audit callbacks for missing optional chaining (`callback?.()`).

4. Output Structure Constraints:
   Format your response strictly into these three Markdown sections:
   ### 1. Type Definitions
   ### 2. Refactored TSX Component
   ### 3. Migration & Type Safety Notes

Component Code to Convert:
```jsx
<PASTE_YOUR_REACT_JSX_CODE_HERE>
```
```
