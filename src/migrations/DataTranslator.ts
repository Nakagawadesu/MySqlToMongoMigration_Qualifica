import Logger from "../Helpers/Logger";
import {
  UserMigration,
  CourseMigration,
  ProgramMigration,
} from "../types/migrationTypes";
import {
  extractDataFromFile,
  extractCourseData,
  extractProgramData,
  extractUser,
} from "../Helpers/extractor";
import fs from "fs";
import { Request, Response } from "express";
import { NextFunction } from "express";
import Database from "../config/Database";
const log = new Logger();
class DataTranslator {
  private filePath: string;

  constructor() {
    this.filePath =
      "/home/smcti/Downloads/Cloud_SQL_Export_2024-03-20 (12_57_36).sql";
  }

  public MySqlToMongo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      log.group("Migrating data from MySql to Mongo");
      console.log(req.body);
      const { password } = req.body;
      if (!password || password != process.env.MIGRATION_PASSWORD) {
        log.error("Unauthorized");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userTable = "users";
      const courseTable = "courses";
      const programTable = "programs";

      const users: any = await extractDataFromFile(this.filePath, userTable);
      const programData: any = await extractDataFromFile(
        this.filePath,
        programTable
      );
      const courseData: any = await extractDataFromFile(
        this.filePath,
        courseTable
      );
      const userJson = await extractUser(JSON.stringify(users, null, 2));

      const ProgramDataJson = await extractProgramData(
        JSON.stringify(programData, null, 2)
      );

      const CourseDataJson = await extractCourseData(
        JSON.stringify(courseData, null, 2)
      );

      fs.writeFileSync(
        courseTable + ".ts",
        JSON.stringify(CourseDataJson, null, 2)
      );
      fs.writeFileSync(
        programTable + ".ts",
        JSON.stringify(ProgramDataJson, null, 2)
      );
      fs.writeFileSync(userTable + ".ts", JSON.stringify(userJson, null, 2));

      return res.status(200).json({ CourseDataJson });
      log.info("Data extracted from MySql");
      log.groupEnd();
      return res.status(200).json({ message: "Data extracted from MySql" });
    } catch (error) {
      log.error("Error in migrating data:", error);
      log.groupEnd();
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
export default DataTranslator;
