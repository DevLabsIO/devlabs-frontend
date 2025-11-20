/**
 * Semester Entity Types
 * Semester-related type definitions
 */

export interface Semester extends Record<string, unknown> {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
}
