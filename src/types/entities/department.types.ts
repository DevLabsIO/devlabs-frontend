import { Batch } from "./batch.types";

export interface Department {
  id: string;
  name: string;
  batches?: Batch[];
}
