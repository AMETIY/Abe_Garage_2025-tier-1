// Legacy database configuration file - now uses the new database adapter
// This file maintains backward compatibility while using the enhanced dual database system

import { query, dbAdapter, getDatabaseConfig } from "./database.config.js";

// Re-export the query function for backward compatibility
export { query };

// Export additional functionality for enhanced usage
export { dbAdapter, getDatabaseConfig };

// Initialize and test database connection on startup
(async () => {
  const config = getDatabaseConfig();
  console.log(
    `🔧 Initializing ${config.type.toUpperCase()} database connection...`
  );

  const isConnected = await dbAdapter.testConnection();
  if (!isConnected) {
    console.error("❌ Failed to establish database connection");
    process.exit(1);
  }
})();
