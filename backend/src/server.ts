import "dotenv/config";
import app from "./app";
import { pool } from "./config/db";

const port = Number(process.env.PORT) || 5000;

async function start() {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected");

        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

start();