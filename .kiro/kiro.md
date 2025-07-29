# 🚀 Kiro Task Prompt – Full-Stack Code Audit, Planning, UI Fixes & Performance Optimization

Hey Kiro 👋,

I'm working on a full-stack project using **React + Vite (Frontend)** and **Node.js + Express (Backend)**.

I need you to thoroughly **analyze the entire codebase**, provide a solid **project plan**, perform **integration testing**, and recommend **code improvements, UI fixes, and performance optimizations**.
**Please Ultra Think Before Planing**.

### 🔒 Follow these principles:

- Respect the **existing folder structure**
- Follow **current naming conventions**
- Preserve core logic where possible
- Keep all implementations **beginner-friendly**
- Comment code clearly where changes are made

---

## ✅ PHASE 1: Codebase Audit & Planning

### 🔍 Analyze Frontend & Backend

- Carefully review code on both sides
- Understand structure, logic, and current implementation patterns
- Identify major and minor areas needing improvement

---

## ✍️ PHASE 2: Create Planning & Spec Docs

In the `.kiro/` folder, generate:

- `plan.md`:  
  A full implementation strategy.

  - List tasks
  - Explain reasoning behind decisions
  - Break things down for step-by-step execution

- `.kiro/specs/requirements.md`:  
  Outline all technical and functional requirements

- `.kiro/specs/design.md`:  
  Explain visual and structural design decisions

- `.kiro/specs/tasks.md`:  
  A clear, trackable to-do list for the work you're about to perform

🔎 _Use task tools to research any external libraries, patterns, or practices that require latest knowledge._

---

## 🎨 PHASE 3: UI Enhancements & Functional Improvements

### 👨‍💼 Employees Page

- Improve **form validation**, error handling, and responsiveness
- Add spacing between input and **Show Active/Inactive** button
- Button should toggle:
  - 🔴 Red when showing **Inactive** employees
  - 🟢 Green when showing **Active** employees
- Add **pagination**
- Make layout **modern, clean, and responsive** (mobile/tablet/desktop)

---

### 👥 Customers Page

- Add **Filter Button** beside input field (with proper spacing)
- Toggle:
  - 🔴 Red for Inactive Customers
  - 🟢 Green for Active Customers
- Add **pagination**
- Modernize layout and make it fully responsive

---

### 🛠 Services Page

- Test and Fix the Services Endpoint
- Redesign for clarity and responsiveness
- Make it feel more **modern and slick**

---

## 🔁 PHASE 4: Integration & Logic Review

- Test and validate **frontend-backend integration**
- Check for API connection issues or mismatches
- Point out inconsistencies in logic between front and back
- Suggest best practices for request handling and data flow

---

## Suggest Inconsistencies & Areas for Improvement

### ⚠️ Known Example:

- **Form Validation** is inconsistent. Login has solid validation, but other forms need attention and user feedback.

---

## ⚡ PHASE 5: Performance Optimization

### Frontend:

- Minify assets and styles
- Use React/Vite performance techniques
- Optimize chunk sizes and reduce load time

### Backend:

- Optimize queries and middleware
- Improve response times
- Confirm that **no logic is broken** after changes

---

## 🧹 PHASE 6: Codebase Cleanup

- Remove unused variables, functions, and imports
- **Clean up `console.log()` statements** and other leftover debugging tools
- Format codebase using a consistent style (Prettier, ESLint)
- Ensure all files are **clean, minimal, and beginner-readable**
- Eliminate dead code or commented-out blocks

---

## 🚀 Deployment Strategy (deploy.md)

Create a file: `.kiro/deploy.md` that includes:

- **Step-by-step guide to deploying the app** (both backend and frontend)
- Specify:
  - Which files should be **tracked in GitHub**
  - Which files/folders should be **excluded via `.gitignore`**
  - Which files should be **bundled and deployed**
- Clarify:
  - Should testing or dev-only files (e.g., `sampleData.js`, `testRoutes.js`) be excluded from production?
  - Which `.env` variables are required, and how to handle secrets securely?
- Outline best practices for **production vs development** environments
- ✅ Which files should be deployed with the app
- ✅ Clean and beginner-safe structure for deployment

### 🔄 Backend Deployment Plan

I want to deploy backend on **Render.com**

- ✨ Suggest the best option between **PostgreSQL** or **SQLite** for cloud DB based on:
  - My current MySQL setup
  - Ease of transition

**GOAL: Use a dual-database strategy**

- Keep my current(local) databaseConfig.js (MySQL)
- Create new databaseConfig for either **PostgreSQL** or **SQLite**
- Keep **MySQL** for **local dev**
- Use **PostgreSQL** or **SQLite** for **production**
- Use a **DB adapter** or config switch that handles both
- Switch databases with just an environment variable
- Gradual migration is OK — I don’t want to rewrite all queries at once

---

### 🌐 Frontend Deployment Plan

Deploy frontend to **Vercel**

- Ensure environment variables and API endpoints are set up properly
- Ensure app works perfectly after deployment

---

## 🧠 Final Guidelines

- Keep code **simple and readable**
- Add **clear inline comments**
- Avoid over-complicating logic or abstractions
- Prioritize a smooth learning curve for beginner developers

🔁 Keep `.kiro/specs/tasks.md` updated as you go  
🧾 Add changelogs or summaries with each major update  
🧪 Always test before committing changes

Thanks Kiro — Let’s go build something amazing! 💪✨
