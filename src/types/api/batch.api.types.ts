/**
 * Batch API Request/Response Types
 * Used in src/repo/batch-queries/
 */

export interface CreateBatchRequest {
  name: string;
  graduationYear: number;
  departmentId: string;
  section: string;
  isActive: boolean;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  id: string;
}
