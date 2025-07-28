// Database migration utility for handling schema differences between MySQL and PostgreSQL
import { dbAdapter, getDatabaseConfig } from "./database.config.js";

class DatabaseMigration {
  constructor(config = null) {
    this.config = config || getDatabaseConfig();
    this.dbType = this.config.type;
  }

  // Get database-specific data types
  getDataTypes() {
    if (this.dbType === "postgresql") {
      return {
        primaryKey: "SERIAL PRIMARY KEY",
        varchar: (length) => `VARCHAR(${length})`,
        text: "TEXT",
        int: "INTEGER",
        decimal: (precision, scale) => `DECIMAL(${precision}, ${scale})`,
        boolean: "BOOLEAN",
        datetime: "TIMESTAMP",
        date: "DATE",
        time: "TIME",
      };
    } else {
      // MySQL data types
      return {
        primaryKey: "INT AUTO_INCREMENT PRIMARY KEY",
        varchar: (length) => `VARCHAR(${length})`,
        text: "TEXT",
        int: "INT",
        decimal: (precision, scale) => `DECIMAL(${precision}, ${scale})`,
        boolean: "BOOLEAN",
        datetime: "DATETIME",
        date: "DATE",
        time: "TIME",
      };
    }
  }

  // Generate CREATE TABLE statements for different databases
  generateCreateTableSQL(tableName, columns) {
    const types = this.getDataTypes();
    let sql = `CREATE TABLE IF NOT EXISTS ${this.quoteIdentifier(
      tableName
    )} (\n`;

    const columnDefinitions = columns.map((col) => {
      let definition = `  ${this.quoteIdentifier(col.name)} `;

      switch (col.type) {
        case "id":
          definition += types.primaryKey;
          break;
        case "varchar":
          definition += types.varchar(col.length || 255);
          break;
        case "text":
          definition += types.text;
          break;
        case "int":
          definition += types.int;
          break;
        case "decimal":
          definition += types.decimal(col.precision || 10, col.scale || 2);
          break;
        case "boolean":
          definition += types.boolean;
          break;
        case "datetime":
          definition += types.datetime;
          break;
        case "date":
          definition += types.date;
          break;
        case "time":
          definition += types.time;
          break;
        default:
          definition += col.type;
      }

      if (col.notNull && col.type !== "id") {
        definition += " NOT NULL";
      }

      if (col.default !== undefined) {
        if (col.default === "CURRENT_TIMESTAMP") {
          definition +=
            this.dbType === "postgresql"
              ? " DEFAULT CURRENT_TIMESTAMP"
              : " DEFAULT CURRENT_TIMESTAMP";
        } else {
          definition += ` DEFAULT ${col.default}`;
        }
      }

      return definition;
    });

    sql += columnDefinitions.join(",\n");
    sql += "\n);";

    return sql;
  }

  // Quote identifiers based on database type
  quoteIdentifier(identifier) {
    return this.dbType === "postgresql"
      ? `"${identifier}"`
      : `\`${identifier}\``;
  }

  // Convert MySQL queries to PostgreSQL format
  convertQuery(query, params = []) {
    if (this.dbType !== "postgresql") {
      return { query, params };
    }

    let convertedQuery = query;
    let paramIndex = 1;

    // Convert ? placeholders to $1, $2, etc.
    convertedQuery = convertedQuery.replace(/\?/g, () => `$${paramIndex++}`);

    // Convert MySQL backticks to PostgreSQL double quotes
    convertedQuery = convertedQuery.replace(/`([^`]+)`/g, '"$1"');

    // Convert LIMIT/OFFSET syntax
    convertedQuery = convertedQuery.replace(
      /LIMIT\s+(\d+)\s+OFFSET\s+(\d+)/gi,
      "LIMIT $1 OFFSET $2"
    );

    // Convert MySQL functions to PostgreSQL equivalents
    convertedQuery = convertedQuery.replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");
    convertedQuery = convertedQuery.replace(/CURDATE\(\)/gi, "CURRENT_DATE");
    convertedQuery = convertedQuery.replace(/CURTIME\(\)/gi, "CURRENT_TIME");

    return { query: convertedQuery, params };
  }

  // Execute database-agnostic query
  async executeQuery(sql, params = []) {
    const { query: convertedQuery, params: convertedParams } =
      this.convertQuery(sql, params);
    return await dbAdapter.query(convertedQuery, convertedParams);
  }

  // Check if table exists
  async tableExists(tableName) {
    try {
      if (this.dbType === "postgresql") {
        const result = await this.executeQuery(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = ?)",
          [tableName]
        );
        return result[0].exists;
      } else {
        const result = await this.executeQuery(
          "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = ? AND table_schema = DATABASE()",
          [tableName]
        );
        return result[0].count > 0;
      }
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  // Get table schema information
  async getTableSchema(tableName) {
    try {
      if (this.dbType === "postgresql") {
        return await this.executeQuery(
          `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ?
          ORDER BY ordinal_position
        `,
          [tableName]
        );
      } else {
        return await this.executeQuery(
          `
          SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, 
                 IS_NULLABLE as is_nullable, COLUMN_DEFAULT as column_default
          FROM information_schema.columns 
          WHERE table_name = ? AND table_schema = DATABASE()
          ORDER BY ordinal_position
        `,
          [tableName]
        );
      }
    } catch (error) {
      console.error(`Error getting schema for table ${tableName}:`, error);
      return [];
    }
  }
}

// Export the migration utility
export default DatabaseMigration;

// Export a singleton instance
export const dbMigration = new DatabaseMigration();
