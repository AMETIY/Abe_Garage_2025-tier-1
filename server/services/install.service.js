// Import database query function using ES6 named import syntax
import { query as conn } from "../config/db.config.js";
// Import fs module using ES6 default import syntax for reading SQL files
import fs from "fs";
// Write a function to create the database tables
async function install() {
  // Create a variable to hold the path to the sql file
  const queryfile = __dirname + "/sql/initial-queries.sql";
  // console.log(queryfile);
  // Temporary variable, used to store all queries, the return message and the current query
  let queries = [];
  let finalMessage = {};
  let templine = "";
  // Read the sql file
  const lines = await fs.readFileSync(queryfile, "utf-8").split("\n");
  // Create a promise to handle the asynchronous reading of the file and storing of the queries in the variables
  const executed = await new Promise((resolve, reject) => {
    // Iterate over all lines
    lines.forEach((line) => {
      if (line.trim().startsWith("--") || line.trim() === "") {
        // Skip if it's a comment or empty line
        return;
      }
      templine += line;
      if (line.trim().endsWith(";")) {
        // If it has a semicolon at the end, it's the end of the query
        // Prepare the individual query
        const sqlQuery = templine.trim();
        // Add query to the list of queries
        queries.push(sqlQuery);
        templine = "";
      }
    });
    resolve("Queries are added to the list");
  });
  //Loop through the queries and execute them one by one asynchronously
  for (let i = 0; i < queries.length; i++) {
    try {
      console.log(
        `Executing query ${i + 1}:`,
        queries[i].substring(0, 50) + "..."
      );
      const result = await conn.query(queries[i]);
      console.log(`Query ${i + 1} executed successfully`);
    } catch (err) {
      console.log(`Error in query ${i + 1}:`, err.message);
      console.log(`Failed query:`, queries[i]);
      finalMessage.message = "Not all tables are created";
      finalMessage.error = err.message;
    }
  }
  // Prepare the final message to return to the controller
  if (!finalMessage.message) {
    finalMessage.message = "All tables are created";
    finalMessage.status = 200;
  } else {
    finalMessage.status = 500;
  }
  // Return the final message
  return finalMessage;
}
// Export the install function using ES6 named export syntax
// Named export is used since this module provides a specific installation function
export { install };
