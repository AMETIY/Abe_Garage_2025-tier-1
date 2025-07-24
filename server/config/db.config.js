// Load environment variables from .env file
require('dotenv').config();

// Import SQLite3
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../database/abe_garage.db');

// Create database directory if it doesn't exist
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create/connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database successfully.');
});

// Enable foreign key constraints
db.run("PRAGMA foreign_keys = ON");

// Function to execute SQL queries asynchronously
async function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        // Handle different query types
        if (sql.trim().toUpperCase().startsWith('INSERT') || 
            sql.trim().toUpperCase().startsWith('UPDATE') || 
            sql.trim().toUpperCase().startsWith('DELETE')) {
            
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                } else {
                    console.log('Query executed successfully. Changes:', this.changes);
                    resolve({ insertId: this.lastID, changes: this.changes });
                }
            });
        } else {
            // SELECT queries
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                } else {
                    console.log('Query result:', rows);
                    resolve(rows);
                }
            });
        }
    });
}

// Function to initialize database with schema
async function initializeDatabase() {
    try {
        // Read and execute the SQL schema file
        const fs = require('fs');
        const schemaPath = path.join(__dirname, '../services/sql/initial-queries.sql');
        
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split schema into individual statements
            const statements = schema.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    await query(statement.trim());
                }
            }
            console.log('Database schema initialized successfully.');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Initialize database on startup
initializeDatabase().then(async () => {
    try {
        // Run admin setup after database initialization
        console.log('Running admin setup...');
        const setupAdmin = require('../setup-admin');
        await setupAdmin();
        console.log('Admin setup completed successfully');
    } catch (adminError) {
        console.error('Admin setup failed:', adminError);
        // Don't crash the app if admin setup fails
        console.log('Continuing without admin setup...');
    }
}).catch(error => {
    console.error('Database initialization failed:', error);
    // Don't crash the app, continue running
    console.log('Continuing without database initialization...');
});

// Export the query function
module.exports = {
    query
};
