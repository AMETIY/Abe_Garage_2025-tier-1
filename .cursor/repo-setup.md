Hey Cursor 👋,

I want to connect my local full-stack project to a GitHub repo I've **already created**. Here's what I want you to do step-by-step:

# 🧠 Step 1: Initialize Git if it's not already done
git init

# 🧠 Step 2: Set the remote repo
git remote add origin <https://github.com/AMETIY/Abe_Garage_2025-tier-1.git>

# 🧠 Step 3: Create a strong .gitignore if not created to exclude non-essential files
echo "node_modules/
.env
.vscode/
.DS_Store
dist/
build/
*.log
npm-debug.log
*.sqlite
.idea/
*.test.js
coverage/
*.zip
*.bak
debug.log
.cache/
temp/
" > .gitignore

git add .gitignore
git commit -m "chore: add .gitignore to keep repo clean and performant"

# 🚀 Step 4: Commit `server/` Files First with Multiple Commits (backend logic)
cd server

# 🧠 Add files step-by-step with meaningful commits for Example
git add index.js
git commit -m "feat: setup server entry point"

git add routes/
git commit -m "feat: add API routes for users, employees, customers"

git add controllers/
git commit -m "feat: add controllers for handling request logic"

git add db/
git commit -m "feat: add MySQL DB connection logic"

git add middleware/
git commit -m "feat: add middleware (auth, error handling, validation)"

git add package.json package-lock.json
git commit -m "chore: add server dependencies and scripts"

cd ..

# ✅ Server code committed — now move to client

cd client

# 🧠 Step-by-step commits for frontend
git add index.html
git commit -m "feat: add main HTML structure"

git add src/components
git commit -m "feat: add UI components"

git add src/pages
git commit -m "feat: add main app pages"

git add src/context
git commit -m "feat: add React Context for global state"

git add src/App.jsx src/main.jsx
git commit -m "feat: main React entry point and app shell"

git add package.json vite.config.js
git commit -m "chore: setup Vite and frontend dependencies"

cd ..

# 🔥 Push all commits to the remote repo
git push -u origin main
