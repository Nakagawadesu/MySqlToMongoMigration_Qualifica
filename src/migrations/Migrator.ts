import Logger from "../Helpers/Logger";
import {
  UserMigration,
  CourseMigration,
  ProgramMigration,
  UserType,
  AccountData,
  CourseType,
  ProgramsType,
  Graduation,
} from "../types/migrationTypes";
import moment from "moment";
import { coursesJson } from "../../courses";
import { programsJson } from "../../programs";
import { usersJson } from "../../users";
import fs from "fs";
import { Request, Response } from "express";
import { NextFunction } from "express";
import Database from "../config/Database";
import {
  MongoClient,
  Collection,
  InsertOneResult,
  OptionalId,
  ObjectId,
} from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const log = new Logger();

const transactionOptions = {
  readPreference: "primary",
  readConcern: { level: "local" },
  writeConcern: { w: "majority" },
};
class Migrator {
  private courseCollectionName: string;
  private programCollectionName: string;
  private userCollectionName: string;
  private courseData: Object;
  private programData: Object;
  private userData: Object;
  private databaseName: string;

  private client!: MongoClient;
  private userCollection: Collection<Document>;
  private courseCollection: Collection<Document>;
  private programCollection: Collection<Document>;

  constructor() {
    this.courseCollectionName = "courses";
    this.programCollectionName = "programs";
    this.userCollectionName = "users";

    this.courseData = coursesJson;
    this.programData = programsJson;
    this.userData = usersJson;

    this.databaseName = process.env.MONGO_DATABASE || "";

    this.client = Database.getInstance().getClient();

    this.userCollection = this.client
      .db(this.databaseName)
      .collection(this.userCollectionName);
    this.courseCollection = this.client
      .db(this.databaseName)
      .collection(this.courseCollectionName);
    this.connectToCollection(this.programCollectionName);
    this.programCollection = this.client
      .db(this.databaseName)
      .collection(this.programCollectionName);
  }
  private connectToCollection = async (collectionName: string) => {
    try {
      this.client = await this.client.connect();
    } catch (error) {
      throw error;
    }
    try {
      if (collectionName == this.userCollectionName) {
        this.userCollection = this.client
          .db(this.databaseName)
          .collection(this.userCollectionName);
      }
      if (collectionName == this.courseCollectionName) {
        this.courseCollection = this.client
          .db(this.databaseName)
          .collection(this.courseCollectionName);
      }
      if (collectionName == this.programCollectionName) {
        this.programCollection = this.client
          .db(this.databaseName)
          .collection(this.programCollectionName);
      }
      log.info(`Connected to collection ${collectionName}`);
    } catch {
      log.error(`error connecting to collection ${collectionName}`);
    }
  };

  public migratePrograms = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    log.warning("Migrating programs");
    const { password } = req.body;
    if (!password || password != process.env.MIGRATION_PASSWORD) {
      log.error("Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const session = this.client.startSession();
      log.info(`Programs: ${JSON.stringify(programsJson, null, 2)}`);

      try {
        await session.withTransaction(
          async () => {
            const programs: ProgramMigration[] = programsJson;
            await Promise.all(
              programs.map(async (program) => {
                const insertedProgram: ProgramsType = {
                  name: program.name,
                  description: program.description,
                  createdAt: moment(
                    program.createdAt,
                    "YYYY-MM-DD HH:mm:ss"
                  ).toISOString(),
                };

                const result: InsertOneResult<any> =
                  await this.programCollection.insertOne(
                    insertedProgram as OptionalId<any>
                  );
                log.info(`Program inserted: ${result.insertedId}`);
              })
            );
          },
          {
            readPreference: "primary",
            readConcern: { level: "local" },
            writeConcern: { w: "majority" },
          }
        );
      } finally {
        session.endSession();
      }
      log.success(`Programs migrated successfully`);
      res.status(200).json({ message: "Programs migrated successfully" });
    } catch (error) {
      log.error(`Error migrating programs`, error);
      res.status(500).json({ message: "Error migrating programs" });
    }
  };
  public migrateUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    log.warning("Migrating users");
    const { password } = req.body;
    if (!password || password != process.env.MIGRATION_PASSWORD) {
      log.error("Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const session = this.client.startSession();
      log.info(`Users: ${JSON.stringify(usersJson, null, 2)}`);
      try {
        await session.withTransaction(
          async () => {
            const users: UserMigration[] = usersJson;
            await Promise.all(
              users.map(async (user) => {
                const accountData: AccountData = {
                  email: user.email,
                  password: user.password,
                  createdAt: moment().toISOString(),
                  updatedAt: moment().toISOString(),
                  deletedAt: null,
                  role: user.role,
                  status: "active",
                  avatar: "default",
                  emailConfirmed: true,
                };
                const insertedUser: UserType = {
                  termAccepted: true,
                  active: true,
                  userBeforeMigration: true,
                  accountData: accountData,
                };
                const result: InsertOneResult<any> =
                  await this.userCollection.insertOne(
                    insertedUser as OptionalId<any>
                  );
                log.info(`User inserted: ${result.insertedId}`);
              })
            );
          },
          {
            readPreference: "primary",
            readConcern: { level: "local" },
            writeConcern: { w: "majority" },
          }
        );
      } finally {
        session.endSession();
      }
      log.success(`Users migrated successfully`);
      res.status(200).json({ message: "Users migrated successfully" });
    } catch (error) {
      log.error(`Error migrating users`, error);
      res.status(500).json({ message: "Error migrating users" });
    }
  };
  public migrateCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    log.warning("Migrating courses");
    const { password } = req.body;
    if (!password || password != process.env.MIGRATION_PASSWORD) {
      log.error("Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const session = this.client.startSession();
      log.info(`Courses: ${JSON.stringify(coursesJson, null, 2)}`);
      try {
        await session.withTransaction(
          async () => {
            const courses: CourseMigration[] = coursesJson;

            await Promise.all(
              courses.map(async (course) => {
                const program = await this.programCollection.findOne({
                  name: course.program,
                });

                const createdAt = moment(
                  course.createdAt.replace(/'/g, ""),
                  "YYYY-MM-DD HH:mm:ss"
                ).toISOString();
                const updatedAt = moment(
                  course.updatedAt.replace(/'/g, ""),
                  "YYYY-MM-DD HH:mm:ss"
                ).toISOString();
                const startDate = moment(
                  course.startDate.replace(/'/g, ""),
                  "YYYY-MM-DD"
                ).toISOString();
                const finishDate = moment(
                  course.finishDate.replace(/'/g, ""),
                  "YYYY-MM-DD"
                ).toISOString();
                const startTime = moment
                  .utc(course.startTime.replace(/'/g, ""), "HH:mm")
                  .toISOString();
                const endTime = moment
                  .utc(course.endTime.replace(/'/g, ""), "HH:mm")
                  .toISOString();
                const insertedCourse: CourseType = {
                  courseBeforeMigration: true,
                  tag: new ObjectId("6626547a00c9eb392eae02b7"),
                  name: course.name.slice(1, -1),
                  description: course.description
                    .replace(/\\n/g, "")
                    .replace(/\\r/g, "")
                    .replace(/\\/g, "")
                    .replace(/"/g, ""),
                  imageUrl: course.imageUrl,
                  disabledAt: null,
                  open: false,
                  program: program ? program._id : null,
                  vacancies: {
                    total: course.totalVacancies,
                    occupied: course.occuppiedVacancies,
                  },
                  restrictions: {
                    minGraduation: Graduation[course.minGraduation],
                    minAge: 0,
                  },
                  details: {
                    theoricalLocation: course.theoricalLocation.slice(1, -1),
                    practicalLocation: course.practicalLocation.slice(1, -1),
                    startDate: startDate,
                    finishDate: finishDate,
                    startTime: startTime,
                    endTime: endTime,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                  },
                };
                const result: InsertOneResult<any> =
                  await this.courseCollection.insertOne(
                    insertedCourse as OptionalId<any>
                  );
                log.info(`Course inserted: ${result.insertedId}`);
              })
            );
          },
          {
            readPreference: "primary",
            readConcern: { level: "local" },
            writeConcern: { w: "majority" },
          }
        );
      } finally {
        session.endSession();
      }
      log.success(`Courses migrated successfully`);
      res.status(200).json({ message: "Courses migrated successfully" });
    } catch (error) {
      log.error(`Error migrating courses`, error);
      res.status(500).json({ message: "Error migrating courses" });
    }
  };
}
export default Migrator;
