# Project Structure

## Root Level Organization

```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── analysis/        # Analysis tools and utilities
├── .cursor/         # Cursor IDE configuration
├── .kiro/           # Kiro AI assistant configuration
└── .trae/           # Trae configuration
```

## Frontend Structure (client/)

```
client/
├── src/
│   ├── markup/          # UI components and pages
│   │   ├── components/  # Reusable React components
│   │   └── pages/       # Page-level components
│   ├── services/        # API service functions
│   ├── Contexts/        # React context providers
│   ├── assets/          # Static assets (images, fonts)
│   ├── util/            # Utility functions
│   └── test/            # Test setup and utilities
├── public/              # Static public assets
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite build configuration
└── eslint.config.js     # ESLint configuration
```

## Backend Structure (server/)

```
server/
├── routes/              # Express route definitions
├── controllers/         # Request handlers and business logic
├── services/            # Data access layer and business services
│   └── sql/            # SQL queries and database scripts
├── middlewares/         # Express middleware functions
├── config/              # Configuration files (database, etc.)
├── utils/               # Utility functions and helpers
├── app.js               # Main application entry point
└── package.json         # Dependencies and scripts
```

## Architecture Patterns

### Backend (MVC-like)

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle request/response logic and validation
- **Services**: Business logic and data access operations
- **Middlewares**: Authentication, error handling, request processing

### Frontend (Component-based)

- **Pages**: Top-level route components
- **Components**: Reusable UI components organized by feature
- **Services**: API communication layer
- **Contexts**: Global state management

## File Naming Conventions

- **Backend**: camelCase for files (e.g., `customer.controller.js`)
- **Frontend**: PascalCase for components (e.g., `Footer.jsx`)
- **Routes**: kebab-case or descriptive names (e.g., `customer.routes.js`)
- **Services**: Match corresponding controller names

## Key Configuration Files

- **Environment**: `.env` files in both client and server directories
- **Database**: `server/config/db.config.js`
- **Build**: `vite.config.js` in both directories
- **Testing**: Vitest configuration in vite.config.js files
