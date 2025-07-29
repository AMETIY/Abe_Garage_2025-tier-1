# Technology Stack

## Frontend (Client)

- **Framework**: React 19.1.0 with Vite as build tool
- **UI Libraries**: Bootstrap 5.3.5, React Bootstrap 2.10.9
- **Icons**: Lucide React, React Icons
- **Routing**: React Router DOM 7.4.1
- **Utilities**: date-fns for date handling, React Spinners for loading states
- **Testing**: Vitest with React Testing Library and jsdom

## Backend (Server)

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js 4.18.2
- **Database**: MySQL with mysql2 promise wrapper
- **Authentication**: JWT (jsonwebtoken) with bcrypt for password hashing
- **Security**: CORS, input sanitization
- **Email**: Nodemailer for email services
- **Development**: Nodemon for auto-restart

## Development Tools

- **Linting**: ESLint with React-specific rules
- **Testing**: Vitest for both frontend and backend
- **Environment**: dotenv for configuration management

## Common Commands

### Frontend (client directory)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
```

### Backend (server directory)

```bash
npm start            # Start server with nodemon
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
```

## Module System

- Both frontend and backend use ES6 modules (`"type": "module"`)
- Import statements use `.js` extensions for local modules
- Default exports preferred for main module functionality
- Named exports used for utilities and multiple related functions
