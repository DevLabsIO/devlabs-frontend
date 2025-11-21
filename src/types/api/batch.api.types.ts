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
