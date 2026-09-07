export type Semester = { id: number; name: string };
export type Subject = { id: number; name: string; semester_id: number };
export type Note = { id: number; subject_id: number | null; title: string; content: string; file_url: string | null; created_at: string; updated_at: string };
