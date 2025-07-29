# 🚀 Abe Garage Deployment Strategy

## 📋 Overview

This document provides a comprehensive guide for deploying the Abe Garage application to production using Render.com for the backend and Vercel for the frontend.

## 🎯 Deployment Goals

- **Backend**: Deploy to Render.com with PostgreSQL database
- **Frontend**: Deploy to Vercel with optimized build
- **Database**: Migrate from MySQL to PostgreSQL for production
- **Environment**: Maintain development vs production separation
- **Security**: Secure configuration and environment variables

---

## 🔧 Backend Deployment (Render.com)

### Prerequisites

- Render.com account
- PostgreSQL database (free tier available)
- GitHub repository connected to Render
- Environment variables prepared

### Step 1: Database Setup

#### 1.1 Create PostgreSQL Database on Render

1. Log into Render.com dashboard
2. Click "New" → "PostgreSQL"
3. Configure database:
   ```
   Name: abe-garage-db
   Database: abe_garage
   User: abe_garage_user
   Region: Choose closest to your users
   Plan: Free (for development) or paid for production
   ```
4. Note down the connection details provided

#### 1.2 Database Migration Strategy

```javascript
// config/database.js - Dual Database Configuration
import mysql from "mysql2/promise";
import pkg from "pg";
const { Pool } = pkg;

class DatabaseAdapter {
  constructor(type) {
    this.type = type;
    this.connection = null;
  }

  async connect() {
    if (this.type === "mysql") {
      this.connection = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        connectionLimit: 10,
      });
    } else if (this.type === "postgresql") {
      this.connection = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
    }
  }

  async query(sql, params = []) {
    if (this.type === "mysql") {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } else if (this.type === "postgresql") {
      const { rows } = await this.connection.query(sql, params);
      return rows;
    }
  }
}

// Factory function
export const createDatabase = () => {
  const dbType = process.env.DB_TYPE || "mysql";
  return new DatabaseAdapter(dbType);
};
```

#### 1.3 Migration Scripts

```sql
-- migrations/001_initial_schema.sql
-- Convert MySQL schema to PostgreSQL

-- Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_first_name VARCHAR(50) NOT NULL,
    employee_last_name VARCHAR(50) NOT NULL,
    employee_email VARCHAR(100) UNIQUE NOT NULL,
    employee_phone VARCHAR(20),
    employee_role INTEGER DEFAULT 1,
    active_employee BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_first_name VARCHAR(50) NOT NULL,
    customer_last_name VARCHAR(50) NOT NULL,
    customer_email VARCHAR(100) UNIQUE NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT,
    active_customer BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    service_description TEXT,
    service_price DECIMAL(10,2) NOT NULL,
    service_category VARCHAR(50),
    active_service BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_year INTEGER,
    vehicle_vin VARCHAR(17),
    active_vehicle BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    service_id INTEGER REFERENCES services(id),
    order_status VARCHAR(20) DEFAULT 'pending',
    order_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_employees_email ON employees(employee_email);
CREATE INDEX idx_employees_active ON employees(active_employee);
CREATE INDEX idx_customers_email ON customers(customer_email);
CREATE INDEX idx_customers_active ON customers(active_customer);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
```

### Step 2: Backend Application Setup

#### 2.1 Update Package.json

```json
{
  "name": "abe-garage-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "build": "echo 'No build step required'",
    "test": "vitest",
    "migrate": "node scripts/migrate.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 2.2 Environment Variables

Create `.env` file for local development:

```env
# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=abe_garage

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email Configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

#### 2.3 Health Check Endpoint

```javascript
// routes/health.js
import express from "express";
const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    // Test database connection
    const db = createDatabase();
    await db.connect();
    await db.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
```

### Step 3: Render.com Deployment

#### 3.1 Create Web Service

1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   ```
   Name: abe-garage-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

#### 3.2 Environment Variables on Render

Add these environment variables in Render dashboard:

```env
# Database Configuration
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

#### 3.3 Auto-Deploy Configuration

- **Branch**: `main` or `master`
- **Auto-Deploy**: Enabled
- **Health Check Path**: `/health`
- **Health Check Timeout**: 180 seconds

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Build Optimization

#### 1.1 Update Vite Configuration

```javascript
// vite.config.js
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
          router: ["react-router-dom"],
          ui: ["react-bootstrap", "bootstrap"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

#### 1.2 Environment Configuration

Create `.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Abe Garage
VITE_APP_VERSION=1.0.0
```

Create `.env.production` for production:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api
VITE_APP_NAME=Abe Garage
VITE_APP_VERSION=1.0.0
```

#### 1.3 API Service Configuration

```javascript
// services/apiService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },
};
```

### Step 2: Vercel Deployment

#### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository

#### 2.2 Configure Build Settings

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 2.3 Environment Variables

Add these in Vercel dashboard:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api
VITE_APP_NAME=Abe Garage
VITE_APP_VERSION=1.0.0
```

#### 2.4 Custom Domain (Optional)

1. In Vercel dashboard, go to project settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

---

## 🔒 Security Configuration

### 1. Environment Variables Security

```bash
# Never commit these files to Git
.env
.env.local
.env.production
.env.staging

# Add to .gitignore
echo ".env*" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore
```

### 2. CORS Configuration

```javascript
// server/app.js
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### 3. Security Headers

```javascript
// server/middleware/security.js
import helmet from "helmet";

export const securityMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );
};
```

---

## 📊 Monitoring & Logging

### 1. Backend Monitoring

```javascript
// server/middleware/logging.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export const requestLogger = (req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
};
```

### 2. Frontend Error Monitoring

```javascript
// utils/errorBoundary.js
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);

    // Send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === "production") {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 🔄 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migration scripts ready
- [ ] Security headers implemented
- [ ] CORS properly configured
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Health check endpoints working

### Backend Deployment

- [ ] PostgreSQL database created on Render
- [ ] Database migration completed
- [ ] Environment variables set in Render
- [ ] Web service deployed successfully
- [ ] Health check endpoint responding
- [ ] API endpoints tested
- [ ] CORS working with frontend domain

### Frontend Deployment

- [ ] Build optimization completed
- [ ] Environment variables set in Vercel
- [ ] API base URL configured
- [ ] Application deployed successfully
- [ ] All routes working
- [ ] API integration tested
- [ ] Mobile responsiveness verified

### Post-Deployment

- [ ] Full application testing
- [ ] Performance monitoring setup
- [ ] Error monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team access configured

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database connection
curl https://your-backend.onrender.com/health

# Check logs in Render dashboard
# Verify DATABASE_URL format
```

#### 2. CORS Issues

```javascript
// Verify CORS configuration
const corsOptions = {
  origin: ["https://your-frontend.vercel.app"],
  credentials: true,
};
```

#### 3. Environment Variables

```bash
# Check environment variables in Render/Vercel
# Ensure all required variables are set
# Verify variable names match code
```

#### 4. Build Failures

```bash
# Check build logs in Vercel
# Verify package.json scripts
# Check for missing dependencies
```

---

## 📈 Performance Optimization

### 1. Backend Performance

- Database connection pooling
- Query optimization
- Response compression
- Caching strategies

### 2. Frontend Performance

- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

### 3. CDN Configuration

- Static asset caching
- API response caching
- Geographic distribution

---

## 🔄 Continuous Deployment

### 1. GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Render auto-deploys on push
          echo "Deployment triggered"
```

### 2. Automated Testing

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

---

## 📚 Additional Resources

### Documentation

- [Render.com Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools

- [PostgreSQL Migration Tools](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Database Schema Comparison](https://www.schemaspy.org/)
- [Performance Monitoring](https://www.datadoghq.com/)

### Best Practices

- Regular backups
- Monitoring and alerting
- Security updates
- Performance optimization
- Documentation maintenance

This deployment strategy ensures a robust, scalable, and maintainable production environment for the Abe Garage application.
