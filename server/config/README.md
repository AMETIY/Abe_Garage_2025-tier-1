# Database Configuration Guide

This directory contains the enhanced database configuration system that supports both MySQL (local development) and PostgreSQL (production deployment).

## Files Overview

- `database.config.js` - Main database configuration with dual database support
- `database.migration.js` - Database migration utilities for handling schema differences
- `database.init.js` - Database initialization and schema setup
- `db.config.js` - Legacy compatibility layer (maintains backward compatibility)

## Environment Configuration

### Development (.env)

```env
NODE_ENV=development
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=garage
DB_USER=your_username
DB_PASS=your_password
```

### Production (.env.production)

```env
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASS=your_password
DB_SSL=true
```

### Staging (.env.staging)

```env
NODE_ENV=staging
DB_TYPE=postgresql
DB_HOST=your_staging_host
DB_PORT=5432
DB_NAME=your_staging_database
DB_USER=your_username
DB_PASS=your_password
DB_SSL=false
```

## Database Types Supported

### MySQL (Development)

- Default for local development
- Uses `mysql2` driver with promise support
- Connection pooling enabled
- Parameter placeholders: `?`

### PostgreSQL (Production)

- Default for production deployment
- Uses `pg` driver
- SSL support for cloud deployments
- Parameter placeholders: `$1, $2, etc.`

## Usage

### Basic Query Execution

```javascript
import { query } from "./config/database.config.js";

// Works with both MySQL and PostgreSQL
const users = await query("SELECT * FROM employees WHERE active_employee = ?", [
  true,
]);
```

### Advanced Usage with Database Adapter

```javascript
import { dbAdapter } from "./config/database.config.js";

// Get database type
const dbType = dbAdapter.getDatabaseType();

// Test connection
const isConnected = await dbAdapter.testConnection();

// Execute query with automatic conversion
const result = await dbAdapter.query(
  "SELECT * FROM customers LIMIT ? OFFSET ?",
  [10, 0]
);
```

### Database Migration Utilities

```javascript
import { dbMigration } from "./config/database.migration.js";

// Check if table exists
const exists = await dbMigration.tableExists("employees");

// Get table schema
const schema = await dbMigration.getTableSchema("employees");

// Execute database-agnostic query
const result = await dbMigration.executeQuery("SELECT COUNT(*) FROM employees");
```

## Database Setup Commands

```bash
# Initialize database schema
npm run db:init

# Test database connection
npm run db:test

# Verify database schema
npm run db:verify

# Show database configuration info
npm run db:info
```

## Schema Management

The system automatically handles schema differences between MySQL and PostgreSQL:

### Data Type Mapping

| Concept     | MySQL                            | PostgreSQL           |
| ----------- | -------------------------------- | -------------------- |
| Primary Key | `INT AUTO_INCREMENT PRIMARY KEY` | `SERIAL PRIMARY KEY` |
| String      | `VARCHAR(255)`                   | `VARCHAR(255)`       |
| Text        | `TEXT`                           | `TEXT`               |
| Integer     | `INT`                            | `INTEGER`            |
| Decimal     | `DECIMAL(10,2)`                  | `DECIMAL(10,2)`      |
| Boolean     | `BOOLEAN`                        | `BOOLEAN`            |
| DateTime    | `DATETIME`                       | `TIMESTAMP`          |

### Query Conversion

The system automatically converts MySQL syntax to PostgreSQL:

- Parameter placeholders: `?` → `$1, $2, etc.`
- Identifiers: Backticks → Double quotes
- Functions: `NOW()` → `CURRENT_TIMESTAMP`

## Deployment Considerations

### Local Development

1. Use MySQL with the default `.env` configuration
2. Run `npm run db:init` to set up the schema
3. Start the application with `npm start`

### Production Deployment (Render.com)

1. Set environment variables in Render.com dashboard
2. Use PostgreSQL database service
3. Set `DB_TYPE=postgresql` and `NODE_ENV=production`
4. The system will automatically use PostgreSQL configuration

### Environment Variable Switching

The system automatically selects the database type based on:

1. `DB_TYPE` environment variable (explicit override)
2. `NODE_ENV` (production defaults to PostgreSQL)
3. Falls back to MySQL for development

## Troubleshooting

### Connection Issues

1. Verify environment variables are set correctly
2. Run `npm run db:test` to test connection
3. Check database server is running and accessible
4. Verify credentials and permissions

### Schema Issues

1. Run `npm run db:verify` to check schema
2. Use `npm run db:init` to recreate missing tables
3. Check database logs for specific errors

### Query Conversion Issues

1. The system handles most common MySQL → PostgreSQL conversions
2. For complex queries, test with both database types
3. Use the migration utilities for custom conversions

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **SSL Connections**: Enable SSL for production PostgreSQL connections
3. **Connection Limits**: Configure appropriate connection pool limits
4. **Password Security**: Use strong passwords and consider password rotation
5. **Network Security**: Restrict database access to application servers only

## Migration Path

### From MySQL to PostgreSQL

1. Export data from MySQL using `mysqldump`
2. Convert schema using the migration utilities
3. Import data into PostgreSQL
4. Update environment variables
5. Test application functionality

### From Single Database to Dual Support

1. Update imports to use new `database.config.js`
2. Test with both database types
3. Update deployment configurations
4. Verify all queries work with both databases
