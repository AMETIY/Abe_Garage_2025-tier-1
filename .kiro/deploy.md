# 🚀 Deployment Strategy Guide

## Overview

This guide provides a comprehensive deployment strategy for the Abe Garage full-stack application, covering both backend deployment to **Render.com** and frontend deployment to **Vercel**. The strategy includes dual-database configuration, environment management, and production best practices.

---

## 📋 Pre-Deployment Checklist

### ✅ Files to Track in GitHub

**Root Level:**

- `README.md` (project documentation)
- `package.json` files (both client and server)
- `.gitignore` (updated for production)

**Frontend (client/):**

- `src/` (all source code)
- `public/` (static assets)
- `vite.config.js` (build configuration)
- `eslint.config.js` (linting rules)
- `package.json` and `package-lock.json`

**Backend (server/):**

- `routes/`, `controllers/`, `services/`, `middlewares/`, `config/`, `utils/`
- `app.js` (main application file)
- `package.json` and `package-lock.json`
- `vite.config.js` (for testing)

### ❌ Files to Exclude via .gitignore

Create/update `.gitignore` files:

**Root .gitignore:**

```gitignore
# IDE and tool folders
.cursor/
.kiro/
.trae/

# Environment files
.env
.env.local
.env.production
.env.development

# Dependencies
node_modules/

# Build outputs
dist/
build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

**Client .gitignore:**

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.production

# Vite cache
.vite/

# Testing
coverage/
```

**Server .gitignore:**

```gitignore
# Dependencies
node_modules/

# Environment files
.env
.env.production
.env.development

# Logs
*.log

# Testing files (exclude from production)
test-*.js
**/sampleData.js
**/testRoutes.js

# Development utilities
check-admin.js
update-password.js
```

---

## 🗄️ Database Strategy: Dual Configuration

### Recommendation: PostgreSQL for Production

**Why PostgreSQL over SQLite:**

- Better performance for concurrent users
- More robust for production workloads
- Native support on Render.com
- Easier migration from MySQL (both are full SQL databases)
- Better data integrity and ACID compliance

### Implementation Strategy

**1. Create Enhanced Database Configuration**

Create `server/config/database.config.js`:

```javascript
// Enhanced database configuration with dual support
import mysql from "mysql2/promise";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Database type selection based on environment
const DB_TYPE = process.env.DB_TYPE || "mysql";

// MySQL Configuration (Local Development)
const mysqlConfig = {
  connectionLimit: 10,
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

// PostgreSQL Configuration (Production)
const postgresConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pools
let pool;

if (DB_TYPE === "postgresql") {
  const { Pool } = pg;
  pool = new Pool(postgresConfig);
} else {
  pool = mysql.createPool(mysqlConfig);
}

// Universal query function
async function query(sql, params = []) {
  try {
    if (DB_TYPE === "postgresql") {
      // PostgreSQL query execution
      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // MySQL query execution
      const [rows] = await pool.execute(sql, params);
      return rows;
    }
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Database health check
async function healthCheck() {
  try {
    if (DB_TYPE === "postgresql") {
      await query("SELECT 1");
    } else {
      await query("SELECT 1");
    }
    console.log(`✅ ${DB_TYPE.toUpperCase()} database connection successful`);
    return true;
  } catch (error) {
    console.error(
      `❌ ${DB_TYPE.toUpperCase()} database connection failed:`,
      error
    );
    return false;
  }
}

export { query, healthCheck, DB_TYPE };
```

**2. Update package.json Dependencies**

Add to `server/package.json`:

```json
{
  "dependencies": {
    "pg": "^8.11.3"
  }
}
```

**3. SQL Query Compatibility Layer**

Create `server/utils/queryAdapter.js`:

```javascript
// Query adapter for MySQL to PostgreSQL compatibility
export class QueryAdapter {
  static adaptQuery(sql, dbType = "mysql") {
    if (dbType === "postgresql") {
      // Convert MySQL syntax to PostgreSQL
      return sql
        .replace(/`/g, '"') // Replace backticks with double quotes
        .replace(/LIMIT (\d+) OFFSET (\d+)/g, "LIMIT $1 OFFSET $2") // Already compatible
        .replace(/AUTO_INCREMENT/g, "SERIAL") // Auto increment syntax
        .replace(/TINYINT\(1\)/g, "BOOLEAN") // Boolean type
        .replace(/DATETIME/g, "TIMESTAMP") // Datetime type
        .replace(/TEXT/g, "TEXT"); // Text type (already compatible)
    }
    return sql;
  }

  static adaptParams(params, dbType = "mysql") {
    if (dbType === "postgresql") {
      // PostgreSQL uses $1, $2, etc. instead of ?
      // This would need more complex implementation for full compatibility
      return params;
    }
    return params;
  }
}
```

---

## 🔧 Environment Variables Configuration

### Development (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL - Local)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=garage
DB_USER=amity_kiro
DB_PASS=AmityKiro$01234

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=SJnkZNLVB8ATVQa8qrB0uJChjztsbWO0
JWT_EXPIRES_IN=24h

# Email Configuration (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Production (.env.production)

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Database Configuration (PostgreSQL - Render)
DB_TYPE=postgresql
DATABASE_URL=postgresql://username:password@host:port/database

# CORS Configuration
FRONTEND_URL=https://your-app.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
```

---

## 🔄 Backend Deployment: Render.com

### Step 1: Prepare Backend for Deployment

**1. Update app.js for production:**

```javascript
// Add to server/app.js
import { healthCheck } from "./config/database.config.js";

// Database health check on startup
healthCheck().then((isHealthy) => {
  if (!isHealthy) {
    console.error("Database connection failed. Exiting...");
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});
```

**2. Create render.yaml (optional):**

```yaml
services:
  - type: web
    name: abe-garage-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_TYPE
        value: postgresql
```

### Step 2: Deploy to Render.com

**1. Create Render Account and New Web Service**

- Go to [render.com](https://render.com)
- Connect your GitHub repository
- Select "Web Service"

**2. Configure Build Settings:**

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18 or higher

**3. Set Environment Variables:**

```
NODE_ENV=production
DB_TYPE=postgresql
DATABASE_URL=[Render will provide this]
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=[Generate a secure secret]
JWT_EXPIRES_IN=24h
```

**4. Create PostgreSQL Database:**

- In Render dashboard, create new PostgreSQL database
- Copy the DATABASE_URL to your web service environment variables

### Step 3: Database Migration

**Create migration script `server/scripts/migrate.js`:**

```javascript
import { query, DB_TYPE } from "../config/database.config.js";
import { QueryAdapter } from "../utils/queryAdapter.js";

async function migrate() {
  console.log(`Starting migration for ${DB_TYPE}...`);

  try {
    // Example: Create users table
    let createUsersSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        isActive TINYINT(1) DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    // Adapt query for PostgreSQL if needed
    createUsersSQL = QueryAdapter.adaptQuery(createUsersSQL, DB_TYPE);

    await query(createUsersSQL);
    console.log("✅ Users table created/verified");

    // Add more table creations as needed...

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
```

---

## 🌐 Frontend Deployment: Vercel

### Step 1: Prepare Frontend for Deployment

**1. Update vite.config.js:**

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          bootstrap: ["bootstrap", "react-bootstrap"],
          router: ["react-router-dom"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
});
```

**2. Create environment configuration:**

Create `client/.env.production`:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_APP_NAME=Abe Garage
VITE_NODE_ENV=production
```

Create `client/.env.development`:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Abe Garage (Dev)
VITE_NODE_ENV=development
```

**3. Update API service configuration:**

Update `client/src/util/apiService.js`:

```javascript
// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiService = {
  baseURL: API_BASE_URL,
  // ... rest of your API service code
};
```

### Step 2: Deploy to Vercel

**1. Install Vercel CLI:**

```bash
npm install -g vercel
```

**2. Deploy from client directory:**

```bash
cd client
vercel --prod
```

**3. Configure Vercel Dashboard:**

- Set build command: `npm run build`
- Set output directory: `dist`
- Set install command: `npm install`

**4. Set Environment Variables in Vercel:**

```
VITE_API_URL=https://your-backend.onrender.com
VITE_APP_NAME=Abe Garage
VITE_NODE_ENV=production
```

---

## 🔒 Security Best Practices

### Environment Variables Security

**1. Never commit .env files to Git**
**2. Use different secrets for production**
**3. Rotate JWT secrets regularly**
**4. Use strong database passwords**

### Production Security Checklist

**Backend:**

- [ ] Enable CORS only for your frontend domain
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Use secure JWT secrets
- [ ] Validate all inputs
- [ ] Enable SQL injection protection

**Frontend:**

- [ ] Remove console.log statements
- [ ] Minify and obfuscate code
- [ ] Use HTTPS
- [ ] Implement CSP headers
- [ ] Validate user inputs

---

## 🧪 Testing Before Deployment

### Pre-Deployment Testing Script

Create `scripts/pre-deploy-test.js`:

```javascript
import { healthCheck } from "../server/config/database.config.js";

async function runPreDeployTests() {
  console.log("🧪 Running pre-deployment tests...");

  // Test database connection
  const dbHealthy = await healthCheck();
  if (!dbHealthy) {
    console.error("❌ Database health check failed");
    process.exit(1);
  }

  // Test API endpoints
  // Add your API tests here

  console.log("✅ All pre-deployment tests passed!");
}

runPreDeployTests();
```

### Production Smoke Tests

**Backend Health Check Endpoint:**

```javascript
// Add to server/routes/health.routes.js
import express from "express";
import { healthCheck } from "../config/database.config.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const dbHealthy = await healthCheck();
    res.json({
      status: "healthy",
      database: dbHealthy ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

export default router;
```

---

## 📚 Deployment Troubleshooting

### Common Issues and Solutions

**1. Database Connection Issues:**

- Verify DATABASE_URL format
- Check firewall settings
- Ensure SSL configuration is correct

**2. CORS Errors:**

- Update FRONTEND_URL in backend environment
- Verify domain spelling and protocol (https/http)

**3. Build Failures:**

- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Clear node_modules and reinstall

**4. Environment Variable Issues:**

- Ensure all required variables are set
- Check variable naming (VITE\_ prefix for frontend)
- Verify no typos in variable names

### Monitoring and Logs

**Backend Logging:**

```javascript
// Add to server/middlewares/logging.middleware.js
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
```

---

## 🎯 Post-Deployment Checklist

### Immediate After Deployment

- [ ] Test all major user flows
- [ ] Verify database connections
- [ ] Check API endpoints functionality
- [ ] Test authentication flows
- [ ] Verify CORS configuration
- [ ] Test responsive design on mobile
- [ ] Check console for errors
- [ ] Verify environment variables are working

### Ongoing Maintenance

- [ ] Monitor application logs
- [ ] Set up uptime monitoring
- [ ] Regular database backups
- [ ] Security updates
- [ ] Performance monitoring
- [ ] User feedback collection

---

## 📖 Additional Resources

### Render.com Resources

- [Render Deployment Guide](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)

### Vercel Resources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Build Configuration](https://vercel.com/docs/build-step)

This deployment strategy ensures a smooth transition from development to production while maintaining code quality and security best practices. The dual-database approach allows for gradual migration without breaking existing functionality.
