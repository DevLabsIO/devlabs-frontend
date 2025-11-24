import { User } from "./user.types";
import { Semester } from "./semester.types";
import { Department } from "./department.types";

export interface Batch {
    id: string;
    name: string;
    joinYear: number;
    section: string;
    isActive: boolean;
    students?: User[];
    managers?: User[];
    semester?: Semester[];
    department?: Department;
}
