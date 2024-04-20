import { ObjectId } from "mongodb";
export interface ProgramMigration {
  name: string;
  description: string;
  createdAt: string;
}

export interface CourseMigration {
  program: string;
  name: string;
  description: string;
  totalVacancies: number;
  occuppiedVacancies: number;
  startDate: string;
  finishDate: string;
  createdAt: string;
  updatedAt: string;
  objective: string;
  minGraduation: number;
  minAge: number;
  theoricalLocation: string;
  practicalLocation: string;
  workload: number;
  startTime: string;
  endTime: string;
}

export interface UserMigration {
  username: string;
  email: string;
  password: string;
  role: string;
  termAccepted: string;
  active: string;
  userBeforeMigration: boolean;
}

export interface CourseType {
  _id?: ObjectId;
  courseBeforeMigration: boolean;
  tag: string;
  name: string;
  description: string;
  imageUrl?: string;
  open: boolean;
  program: ObjectId | null;
  disabledAt: Date | null;
  students?: string[];
  vacancies: {
    total: number;
    occupied: number;
  };
  restrictions: {
    minGraduation: string;
    minAge: number;
  };
  details: {
    theoricalLocation: string;
    practicalLocation: string;
    startDate: string;
    finishDate: string;
    startTime: string;
    endTime: string;
    workload?: number;
    createdAt: string;
    updatedAt: string | null;
  };
}
export interface ProgramsType {
  _id?: ObjectId;
  name: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface UserType {
  userBeforeMigration: boolean;
  active: boolean;
  _id?: ObjectId;
  googleId?: string;
  termAccepted: boolean;
  courses?: string[];
  personalData?: PersonalData;
  address?: Address;
  accountData: AccountData;
}
export interface Credentials {
  address: Address;
  personalData: PersonalData;
}
export interface PersonalData {
  graduation: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  landline?: string;
  rg: string;
}

export interface Address {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  CEP: string;
}

export interface AccountData {
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  role: string;
  status: string;
  avatar: string;
  emailConfirmed: boolean;
}

export enum Graduation {
  "1ef" = 1,
  "2ef" = 2,
  "3ef" = 3,
  "4ef" = 4,
  "5ef" = 5,
  "6ef" = 6,
  "7ef" = 7,
  "8ef" = 8,
  "9ef" = 9,
  "1em" = 10,
  "2em" = 11,
  "3em" = 12,
  "GradCur" = 13,
  "Grad" = 14,
  "PosGradCur" = 15,
  "PosGrad" = 16,
}
