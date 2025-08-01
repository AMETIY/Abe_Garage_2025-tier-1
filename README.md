# 🚗 Abe Garage - Full-Stack Automotive Service Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-https://abe--garage--2025--tier--1.vercel.app-brightgreen?style=flat-square&logo=vercel)](https://abe-garage-2025-tier-1.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-https://abe--garage--2025--tier--1.onrender.com-blue?style=flat-square&logo=render)](https://abe-garage-2025-tier-1.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Abe_Garage_2025--tier--1-blue?style=flat-square&logo=github)](https://github.com/AMETIY/Abe_Garage_2025-tier-1)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-gray?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Performance Optimizations](#-performance-optimizations)
- [Security Features](#-security-features)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Abe Garage is a comprehensive full-stack automotive service management system designed to streamline garage operations, customer management, and service tracking. Built with modern web technologies, it provides a robust platform for automotive service businesses to manage their daily operations efficiently.

### 🚀 **Live Application**

**🌐 Frontend (Vercel)**: [https://abe-garage-2025-tier-1.vercel.app/](https://abe-garage-2025-tier-1.vercel.app/)  
**🔗 Backend API (Render)**: [https://abe-garage-2025-tier-1.onrender.com/](https://abe-garage-2025-tier-1.onrender.com/)  
**🏥 Health Check**: [https://abe-garage-2025-tier-1.onrender.com/api/health](https://abe-garage-2025-tier-1.onrender.com/api/health)

### 🔐 **Demo Credentials**

- **Email**: `admin@admin.com`
- **Password**: `123456`

### 🏗️ **Production Infrastructure**

- **Frontend**: Deployed on Vercel with global CDN
- **Backend**: Deployed on Render.com with auto-scaling
- **Database**: PostgreSQL on Render.com with automated backups
- **Security**: HTTPS, CORS, rate limiting, and security headers
- **Performance**: Optimized builds, compression, and caching

### 🎯 Key Objectives

- **Customer Management**: Complete customer profiles with vehicle information
- **Service Tracking**: Real-time order and service status monitoring
- **Employee Management**: Staff management with role-based access control
- **Performance Monitoring**: Real-time system and database performance metrics
- **Security**: Enterprise-grade authentication and authorization
- **Scalability**: Optimized for high-performance and scalability

## ✨ Features

### 🔐 Authentication & Authorization

- **JWT-based Authentication** with refresh tokens
- **Role-based Access Control** (RBAC) with multiple user roles
- **Session Management** with automatic cleanup
- **Enhanced Security** with rate limiting and audit logging
- **Password Security** with bcrypt hashing and policy enforcement

### 👥 User Management

- **Customer Management**: Complete customer profiles with contact information
- **Employee Management**: Staff profiles with role assignments
- **Vehicle Management**: Customer vehicle tracking and history
- **Service Management**: Comprehensive service catalog and pricing

### 📊 Order Management

- **Order Creation**: Multi-step order creation process
- **Status Tracking**: Real-time order status updates
- **Service Assignment**: Link services to orders with pricing
- **Order History**: Complete order history and analytics

### 📈 Performance Monitoring

- **Real-time Metrics**: Database and API performance monitoring
- **Query Analytics**: Slow query detection and optimization
- **System Health**: Memory usage and response time tracking
- **Performance Dashboard**: Visual performance metrics and alerts

### 🎨 User Interface

- **Responsive Design**: Mobile-first responsive interface
- **Modern UI**: Bootstrap-based components with custom styling
- **Code Splitting**: Lazy-loaded components for optimal performance
- **Asset Optimization**: Image and font optimization for fast loading
- **Shared Components**: Reusable UI components for consistent design
  - **StatusToggleButton**: Active/inactive status toggle with color coding
  - **PaginationComponent**: Configurable pagination with items per page
  - **FormValidation**: Comprehensive form validation with real-time feedback
  - **LoadingSpinner**: Consistent loading states across the application

### 🔧 Technical Features

- **Dual Database Support**: MySQL (development) and PostgreSQL (production)
- **Connection Pooling**: Optimized database connection management
- **Caching**: In-memory response caching for improved performance
- **Error Handling**: Comprehensive error handling and logging
- **API Rate Limiting**: Protection against abuse and DDoS

## 🛠 Technology Stack

### Frontend

- **React 19.1.0** - Modern React with hooks and functional components
- **React Router 7.4.1** - Client-side routing
- **React Bootstrap 2.10.9** - UI component library
- **Bootstrap 5.3.5** - CSS framework
- **Vite 6.2.0** - Fast build tool and development server
- **React Icons 5.5.0** - Icon library
- **Date-fns 4.1.0** - Date manipulation utilities

### Backend

- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web application framework
- **MySQL2 3.6.0** - MySQL database driver
- **PostgreSQL 8.16.3** - PostgreSQL database driver
- **JWT 9.0.1** - JSON Web Token authentication
- **Bcrypt 5.1.1** - Password hashing
- **Helmet 8.1.0** - Security middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **Compression 1.8.1** - Response compression
- **Rate Limiting** - Express rate limiting

### Development Tools

- **ESLint 9.21.0** - Code linting
- **Vitest 3.2.4** - Unit testing
- **Nodemon 3.1.10** - Development server with auto-restart

## 🏗 Architecture

### Frontend Architecture

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AssetOptimizer/  # Image and font optimization
│   │   └── ReactOptimizer/  # Performance optimization hooks
│   ├── markup/              # Application components
│   │   ├── components/      # Feature components
│   │   │   ├── Admin/       # Admin dashboard components
│   │   │   ├── Auth/        # Authentication components
│   │   │   └── Common/      # Shared components
│   │   │       ├── StatusToggleButton/    # Status toggle component
│   │   │       ├── PaginationComponent/   # Pagination component
│   │   │       ├── FormValidation/        # Form validation component
│   │   │       └── LoadingSpinner/        # Loading spinner component
│   │   └── pages/           # Page components
│   │       ├── admin/       # Admin pages
│   │       └── public/      # Public pages
│   ├── services/            # API service layer
│   ├── util/                # Utility functions
│   ├── Contexts/            # React context providers
│   └── assets/              # Static assets
```

#### Shared Components

The application includes several reusable components for consistent UI/UX:

- **StatusToggleButton**: A toggle button for active/inactive status with green/red color coding
- **PaginationComponent**: Responsive pagination with configurable items per page
- **FormValidation**: Comprehensive form validation with real-time feedback and error handling
- **LoadingSpinner**: Consistent loading states with accessibility support

### Backend Architecture

```
server/
├── config/                  # Configuration files
│   └── database.config.js   # Database configuration
├── controllers/             # Request handlers
├── middlewares/             # Express middlewares
│   ├── auth.middleware.js   # Authentication
│   ├── enhancedAuth.middleware.js # Enhanced auth
│   └── performance.middleware.js  # Performance monitoring
├── routes/                  # API route definitions
├── services/                # Business logic layer
├── utils/                   # Utility functions
└── scripts/                 # Database and maintenance scripts
```

## 🚀 Installation

### Prerequisites

- **Node.js 18+** and npm
- **MySQL 8.0+** or **PostgreSQL 13+**
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/AMETIY/Abe_Garage_2025-tier-1.git
cd Abe_Garage_2025-tier-1
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
cd server
npm install
```

#### Frontend Dependencies

```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)

```bash
cd ../server
cp .env.example .env
```

Configure the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=abe_garage
DB_USER=your_username
DB_PASS=your_password
DB_POOL_SIZE=20

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

#### Frontend Environment

```bash
cd ../client
cp .env.example .env
```

Configure the following variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Abe Garage
```

### 4. Database Setup

#### MySQL Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE abe_garage;
USE abe_garage;

# Run initialization script
cd server
npm run db:init
```

#### PostgreSQL Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE abe_garage;
\q

# Run initialization script
cd server
npm run db:init
```

### 5. Start the Application

#### Development Mode

```bash
# Start backend server
cd server
npm start

# Start frontend development server
cd ../client
npm run dev
```

#### Production Mode

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## ⚙️ Configuration

### Database Configuration

The application supports both MySQL and PostgreSQL with automatic configuration based on environment variables:

- **Development**: MySQL (default)
- **Production**: PostgreSQL (recommended)

### Performance Configuration

```env
# Performance settings
SLOW_QUERY_THRESHOLD=1000
DB_POOL_SIZE=20
DB_POOL_MIN=2
COMPRESSION_LEVEL=6
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Security Configuration

```env
# Security settings
JWT_SECRET=your_secure_secret_key
PASSWORD_MIN_LENGTH=8
SESSION_TIMEOUT=3600
AUDIT_LOG_LEVEL=info
```

## 📖 Usage

### Accessing the Application

#### 🌐 **Production (Live)**

- **Frontend**: https://abe-garage-2025-tier-1.vercel.app/
- **Backend API**: https://abe-garage-2025-tier-1.onrender.com/api
- **Health Check**: https://abe-garage-2025-tier-1.onrender.com/api/health

#### 💻 **Development (Local)**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Default Admin Account

- **Email**: admin@admin.com
- **Password**: 123456

### Key Features Usage

#### Customer Management

1. Navigate to Admin Dashboard
2. Go to Customers section
3. Add new customers with vehicle information
4. View and edit customer profiles

#### Order Management

1. Create new orders for customers
2. Select services and vehicles
3. Track order status in real-time
4. View order history and analytics

#### Performance Monitoring

1. Access Performance Dashboard
2. View real-time metrics
3. Monitor database performance
4. Check system health status

## 🔌 API Documentation

### Authentication Endpoints

```
POST /api/login          # User login
POST /api/refresh        # Refresh JWT token
POST /api/logout         # User logout
```

### Customer Endpoints

```
GET    /api/customers           # Get all customers
POST   /api/customers           # Create new customer
GET    /api/customers/:id       # Get customer by ID
PATCH  /api/customers/:id       # Update customer
DELETE /api/customers/:id       # Delete customer
```

### Employee Endpoints

```
GET    /api/employees           # Get all employees
POST   /api/employees           # Create new employee
GET    /api/employees/:id       # Get employee by ID
PATCH  /api/employees/:id       # Update employee
DELETE /api/employees/:id       # Delete employee
```

### Order Endpoints

```
GET    /api/orders              # Get all orders
POST   /api/orders              # Create new order
GET    /api/orders/:id          # Get order by ID
PATCH  /api/orders/:id          # Update order status
DELETE /api/orders/:id          # Delete order
```

### Service Endpoints

```
GET    /api/services            # Get all services
POST   /api/services            # Create new service
GET    /api/services/:id        # Get service by ID
PATCH  /api/services/:id        # Update service
DELETE /api/services/:id        # Delete service
```

### Vehicle Endpoints

```
GET    /api/vehicles            # Get all vehicles
POST   /api/vehicles            # Create new vehicle
GET    /api/vehicles/:id        # Get vehicle by ID
PATCH  /api/vehicles/:id        # Update vehicle
DELETE /api/vehicles/:id        # Delete vehicle
```

### Performance Endpoints

```
GET    /api/performance/metrics     # Get performance metrics
GET    /api/performance/history     # Get performance history
GET    /api/database/performance    # Get database performance
GET    /api/database/health         # Get database health
```

## ⚡ Performance Optimizations

### Frontend Optimizations

- **Code Splitting**: Lazy-loaded components for faster initial load
- **Asset Optimization**: Image compression and font optimization
- **Bundle Analysis**: Vite bundle analyzer for size optimization
- **React Optimization**: Memoization and performance hooks
- **Virtual Scrolling**: For large data sets

### Backend Optimizations

- **Response Compression**: Gzip compression for all responses
- **Database Connection Pooling**: Optimized connection management
- **Query Caching**: LRU cache for frequently accessed data
- **Rate Limiting**: Protection against abuse
- **Performance Monitoring**: Real-time metrics and alerts

### Database Optimizations

- **Query Optimization**: Slow query detection and optimization
- **Index Management**: Automatic index creation and maintenance
- **Connection Pooling**: Efficient connection management
- **Query Analytics**: Performance metrics and statistics

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh mechanism
- **Role-based Access**: Granular permission system
- **Session Management**: Secure session handling

### Data Protection

- **Password Hashing**: Bcrypt with salt rounds
- **Input Sanitization**: XSS and injection protection
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers

### API Security

- **Rate Limiting**: Protection against abuse
- **Request Validation**: Input validation and sanitization
- **Error Handling**: Secure error responses
- **Audit Logging**: Comprehensive security logging

## 🛠 Development

### Available Scripts

#### Backend Scripts

```bash
npm start              # Start development server
npm test              # Run tests
npm run db:init       # Initialize database
npm run db:verify     # Verify database connection
npm run db:optimize   # Optimize database performance
npm run perf:baseline # Run performance baseline
```

#### Frontend Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run analyze       # Analyze bundle size
npm run test          # Run tests
```

### Code Structure

- **ES6 Modules**: Modern JavaScript with import/export
- **Component Architecture**: Reusable React components
- **Service Layer**: Clean separation of concerns
- **Error Boundaries**: Comprehensive error handling
- **Type Safety**: ESLint configuration for code quality

## 🧪 Testing

### Backend Testing

```bash
cd server
npm test              # Run all tests
npm run test:run      # Run tests once
```

### Frontend Testing

```bash
cd client
npm test              # Run all tests
npm run test:run      # Run tests once
```

### Test Coverage

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization testing

## 🚀 Deployment

### 🎉 **Current Production Deployment**

The application is **successfully deployed and operational**:

#### **🌐 Frontend (Vercel)**

- **URL**: https://abe-garage-2025-tier-1.vercel.app/
- **Platform**: Vercel with global CDN
- **Build**: Optimized Vite production build
- **Performance**: Lighthouse score 90+
- **Features**:
  - Automatic deployments on git push
  - Global CDN for fast loading
  - HTTPS with security headers
  - Asset optimization and compression

#### **🚀 Backend (Render.com)**

- **URL**: https://abe-garage-2025-tier-1.onrender.com/
- **Platform**: Render.com with auto-scaling
- **Database**: PostgreSQL with automated backups
- **Features**:
  - Auto-scaling based on traffic
  - Health monitoring and alerts
  - Automatic SSL certificates
  - Environment variable management
  - Zero-downtime deployments

#### **🗄️ Database (PostgreSQL)**

- **Platform**: Render.com PostgreSQL
- **Features**: Automated backups, connection pooling, monitoring
- **Performance**: Optimized queries and indexing

### 📋 **Deployment Architecture**

```
┌─────────────────┐    HTTPS    ┌──────────────────┐    PostgreSQL    ┌─────────────────┐
│   Vercel CDN    │ ──────────► │   Render.com     │ ───────────────► │   PostgreSQL    │
│   (Frontend)    │             │   (Backend API)  │                  │   (Database)    │
│                 │             │                  │                  │                 │
│ • React 19.1.0  │             │ • Node.js 18+    │                  │ • Automated     │
│ • Vite Build    │             │ • Express 4.18.2 │                  │   Backups       │
│ • Global CDN    │             │ • JWT Auth       │                  │ • Connection    │
│ • Asset Opt.    │             │ • Rate Limiting  │                  │   Pooling       │
└─────────────────┘             └──────────────────┘                  └─────────────────┘
```

### 🔧 **Local Development Setup**

#### Backend Deployment

```bash
# Set environment variables
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=abe_garage_prod
DB_USER=your_production_user
DB_PASS=your_production_password

# Start production server
npm start
```

#### Frontend Deployment

```bash
# Build for production
npm run build:production

# Deploy to Vercel
vercel --prod
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### 🔐 **Production Environment Configuration**

#### **Backend Environment (Render.com)**

```env
NODE_ENV=production
PORT=10000
DB_TYPE=postgresql
DB_HOST=<render-postgresql-host>
DB_PORT=5432
DB_NAME=abe_garage
DB_USER=<render-db-user>
DB_PASS=<render-db-password>
JWT_SECRET=<secure-production-secret>
FRONTEND_URL=https://abe-garage-2025-tier-1.vercel.app
DB_POOL_SIZE=10
DB_POOL_MIN=2
SLOW_QUERY_THRESHOLD=1000
```

#### **Frontend Environment (Vercel)**

```env
VITE_API_URL=https://abe-garage-2025-tier-1.onrender.com
NODE_ENV=production
VITE_APP_NAME=Abe Garage Management System
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### 📊 **Deployment Status**

| Component     | Status        | URL                                                                                 | Platform       |
| ------------- | ------------- | ----------------------------------------------------------------------------------- | -------------- |
| 🌐 Frontend   | ✅ **LIVE**   | [abe-garage-2025-tier-1.vercel.app](https://abe-garage-2025-tier-1.vercel.app/)     | Vercel         |
| 🚀 Backend    | ✅ **LIVE**   | [abe-garage-2025-tier-1.onrender.com](https://abe-garage-2025-tier-1.onrender.com/) | Render.com     |
| 🗄️ Database   | ✅ **LIVE**   | PostgreSQL                                                                          | Render.com     |
| 🔒 Security   | ✅ **ACTIVE** | HTTPS, CORS, Rate Limiting                                                          | Both Platforms |
| 📊 Monitoring | ✅ **ACTIVE** | Health Checks, Performance                                                          | Both Platforms |

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **ESLint**: Follow the configured linting rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Use conventional commit format
- **Testing**: Write tests for new features

### Pull Request Guidelines

- **Description**: Clear description of changes
- **Testing**: Include tests for new features
- **Documentation**: Update documentation if needed
- **Performance**: Consider performance impact

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Evangadi Family, Instructors & My Friends
- **React Team** for the amazing framework
- **Express.js** for the robust backend framework
- **Bootstrap** for the responsive UI components
- **Vite** for the fast build tool
- **MySQL/PostgreSQL** communities for database support

## 📞 Support

For support and questions:

- **🌐 Live Demo**: [https://abe-garage-2025-tier-1.vercel.app/](https://abe-garage-2025-tier-1.vercel.app/)
- **🔗 API Documentation**: [https://abe-garage-2025-tier-1.onrender.com/api/health](https://abe-garage-2025-tier-1.onrender.com/api/health)
- **📋 GitHub Issues**: [Create an issue](https://github.com/AMETIY/Abe_Garage_2025-tier-1/issues)
- **📚 Documentation**: Check the inline code documentation
- **📊 Performance Issues**: Use the performance monitoring dashboard

## 🎯 **Quick Start Guide**

### **🚀 Try the Live Application**

1. **Visit**: [https://abe-garage-2025-tier-1.vercel.app/](https://abe-garage-2025-tier-1.vercel.app/)
2. **Login with**:
   - Email: `admin@admin.com`
   - Password: `123456`
3. **Explore Features**:
   - ✅ Create and manage customers
   - ✅ Add and track employees
   - ✅ Process service orders
   - ✅ Monitor system performance
   - ✅ View analytics and reports

### **🛠️ Local Development**

```bash
# Clone the repository
git clone https://github.com/AMETIY/Abe_Garage_2025-tier-1.git
cd Abe_Garage_2025-tier-1

# Install dependencies
cd server && npm install
cd ../client && npm install

# Start development servers
cd ../server && npm start
cd ../client && npm run dev
```

---

## 🏆 **Project Achievements**

- ✅ **Full-Stack Application**: Complete React + Node.js + PostgreSQL solution
- ✅ **Production Deployment**: Successfully deployed on Vercel + Render.com
- ✅ **Performance Optimized**: Lighthouse score 90+, optimized builds
- ✅ **Security Hardened**: HTTPS, CORS, JWT, rate limiting, security headers
- ✅ **Database Migration**: Seamless MySQL → PostgreSQL migration
- ✅ **Modern Architecture**: React 19, Node.js 18+, ES6 modules
- ✅ **Responsive Design**: Mobile-first, Bootstrap 5, modern UI/UX
- ✅ **Real-time Features**: Live updates, performance monitoring
- ✅ **Enterprise Ready**: Role-based access, audit logging, error handling

---

**Made with ❤️ by Amanuel Wubneh**

_🚀 Successfully deployed and operational since January 2025_

**⭐ If you found this project helpful, please give it a star on GitHub!**
