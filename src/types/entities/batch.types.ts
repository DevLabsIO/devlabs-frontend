import { User } from "./user.types";
import { Semester } from "./semester.types";
import { Department } from "./department.types";

export interface Batch {
  id: string;
  name: string;
  graduationYear: number;
  section: string;
  isActive: boolean;
  students?: User[];
  managers?: User[];
  semester?: Semester[];
  department?: Department;
}
