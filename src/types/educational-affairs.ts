import { Teacher } from "./teacher";

export type PreparationStatus = "PREPARED" | "NOT_PREPARED";

export interface PreparationRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  status: PreparationStatus;
  isOfficialHoliday?: boolean;
  createdAt: string;
}

export type VisitType = "STUDENT_BOOKS" | "FOLLOWUP_RECORD" | "OTHER";
export type VisitExecutionStatus =
  | "FULL"
  | "PARTIAL"
  | "NONE"
  | "NOT_AVAILABLE";
export type VisitNoteType = "DISTINCTION" | "IMPROVEMENT";

export interface FieldVisitRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  visitType: VisitType;
  customVisitType?: string; // If visitType is OTHER
  executionStatus: VisitExecutionStatus;
  noteType: VisitNoteType;
  note?: string;
  createdAt: string;
  agentId?: string; // User who performed the visit
}

export interface TeacherFollowupStats {
  teacherId: string;
  lastVisitDate?: string;
  visitCount: number;
  preparationCompliance: number; // Percentage
}
