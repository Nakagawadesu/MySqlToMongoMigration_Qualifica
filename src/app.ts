import Logger from "./Helpers/Logger";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import DataTranslator from "./migrations/DataTranslator";
import Migrator from "./migrations/Migrator";
const log = new Logger();
dotenv.config();

log.group("Starting server");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.listen(process.env.PORT, () => {
  log.success(`Server started on port ${process.env.PORT}`);
});
app.use(express.json());
// Append routes to the server
const dataTranslator = new DataTranslator();
const migrator = new Migrator();
const router = express.Router();
router
  .post("/api/v2/translate", dataTranslator.MySqlToMongo)
  .post("/api/v2/migrate/programs", migrator.migratePrograms)
  .post("/api/v2/migrate/users", migrator.migrateUsers)
  .post("/api/v2/migrate/courses", migrator.migrateCourses);
app.use(router);
export default app;
