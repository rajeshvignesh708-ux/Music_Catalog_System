const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    console.log("Connecting to MySQL server...");
    try {
        // Connect without a specific database to create it first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true // Crucial for running the entire schema.sql at once
        });

        console.log("Connected successfully! Creating 'music_catalog' database...");
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`music_catalog\`;`);
        await connection.query(`USE \`music_catalog\`;`);
        
        console.log("Database created. Reading schema file...");
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema and inserting dummy data...");
        await connection.query(schema);

        console.log("Database setup complete! The WAMP server MySQL is now ready.");
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Error setting up database:", error);
        process.exit(1);
    }
}

initDB();
