import fs from "fs";
import {
  UserMigration,
  CourseMigration,
  ProgramMigration,
} from "../types/migrationTypes";
import Logger from "./Logger";
const log = new Logger();
export const extractDataFromFile = (filePath: string, tableName: string) => {
  var fileContent = fs.readFileSync(filePath, "utf8");
  var pattern = new RegExp(
    "INSERT INTO `" +
      tableName +
      "` VALUES (.*?)(?=\\/\\*\\!40000\\sALTER\\sTABLE|UNLOCK\\sTABLES\\s*;)",
    "gs"
  );
  var match = pattern.exec(fileContent);
  if (match) {
    var data = match[1].trim();
    var insertStatements = data.split(/;\s*/);
    var filteredInsertStatements = insertStatements.filter(function (
      statement
    ) {
      return statement.trim() !== "";
    });
    return filteredInsertStatements;
  } else {
    console.log("No data found for table '".concat(tableName, "'"));
    return [];
  }
};

export const extractUser = (dataString: string) => {
  const tuples: string[] = dataString.slice(1, -1).split("),(");
  let Users: UserMigration[] = [];
  let objects = Promise.all(
    tuples.map((tuple) => {
      return new Promise((resolve) => {
        const values: string[] = tuple.split(",");
        const roleId = parseInt(values[4]);
        const roleString = roleId == 2 ? "user" : "admin";
        roleId == 2 ? "user" : "admin";
        const userObj: UserMigration = {
          username: values[1].slice(1, -1), // Remove surrounding single quotes
          email: values[2].slice(1, -1), // Remove surrounding single quotes
          password: values[3].slice(1, -1), // Remove surrounding single quotes
          role: roleString,
          termAccepted: "true",
          active: "true",
          userBeforeMigration: true,
        };
        Users.push(userObj);
        resolve(userObj);
      });
    })
  );

  return Users;
};
const extractDescription = (value: string) => {
  const match = value.match(/^(.*?)(?=\([^()]*\)|,|$)/);

  return match ? match[0].trim() : "";
};

export const extractCourseData = (dataString: string) => {
  const tuples = dataString.match(/\([^()']*?(?:'[^']*?'[^()']*?)*?\)/g);

  log.info(`TUPLE: ${JSON.stringify(tuples, null, 2)}`);
  if (!tuples) {
    return "[]";
  }
  const extractDescription = (value: string) => {
    const descriptionMatch = value.match(/'((?:[^'\\]|\\[\s\S])*)'/);
    return descriptionMatch ? descriptionMatch[1] : "";
  };
  let Courses: CourseMigration[] = [];
  let objects = Promise.all(
    tuples.map((tuple) => {
      return new Promise((resolve) => {
        const values: string[] | null = tuple
          .slice(1, -1)
          .match(/'(?:[^'\\]|\\[\s\S])*'|[^,]+/g);
        log.success(`VALUE :${JSON.stringify(values, null, 2)}`);
        if (values) {
          //if program = 4 => SENAC ; if programId= 3 => SENAI
          const programId = parseInt(values[1]);
          let program = "default";
          if (programId === 4) {
            program = "SENAC";
          }
          if (programId === 3) {
            program = "SENAI";
          }

          const courseObj: CourseMigration = {
            program: program,
            name: values[3],
            description: extractDescription(values[4]),
            imageUrl: values[12].slice(1, -1),
            totalVacancies: parseInt(values[5]),
            occuppiedVacancies: parseInt(values[6]),
            startDate: values[7],
            finishDate: values[8],
            createdAt: values[9],
            updatedAt: values[10],
            objective: extractDescription(values[13]),
            minGraduation: parseInt(values[14]),
            minAge: parseInt(values[15]),
            theoricalLocation: values[16],
            practicalLocation: values[17],
            workload: parseInt(values[18]),
            startTime: values[19],
            endTime: values[20],
          };
          Courses.push(courseObj);
          resolve(courseObj);
        } else {
          resolve(null); // Resolve with null if values are null
        }
      });
    })
  );
  return Courses;
};

export const extractProgramData = (dataString: string) => {
  const tuples = dataString.match(/\([^()]*\)/g);

  if (!tuples) {
    return "[]";
  }
  let Programs: ProgramMigration[] = [];
  let objects = Promise.all(
    tuples.map((tuple) => {
      return new Promise((resolve) => {
        const values: string[] = tuple
          .slice(1, -1)
          .split(/,(?=(?:(?:[^']*'){2})*[^']*$)/);

        const courseObj: ProgramMigration = {
          name: values[1].slice(1, -1),
          description: values[2].slice(1, -1),
          createdAt: values[3].slice(1, -1),
        };
        Programs.push(courseObj);
        resolve(courseObj);
      });
    })
  );

  return Programs;
};
