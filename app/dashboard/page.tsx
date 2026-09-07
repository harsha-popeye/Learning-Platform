import Link from 'next/link';
import { ArrowLeft, ChevronRight, FolderOpen } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { NoteCard } from '@/components/note-card';
import type { Note, Semester, Subject } from '@/lib/types';

export const dynamic = 'force-dynamic';

const courseNames = ['SSLC', 'PUC', 'BCA', 'BCOM', 'BBA'] as const;
type Course = typeof courseNames[number];

type DashboardPageProps = {
  searchParams: { course?: string; group?: string };
};

function getCourse(semesterName: string): Course | undefined {
  const normalized = semesterName.toUpperCase();
  if (normalized === 'SSLC') return 'SSLC';
  if (normalized.endsWith('PUC')) return 'PUC';
  if (normalized.endsWith('BCA')) return 'BCA';
  if (normalized.endsWith('BCOM')) return 'BCOM';
  if (normalized.endsWith('BBA')) return 'BBA';
  return undefined;
}

function displayCourse(course: Course) {
  return course === 'BCOM' ? 'BCom' : course;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const pageClassName = 'mx-auto w-full max-w-xl px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:max-w-3xl sm:px-6 sm:pb-10 sm:pt-10';
  const supabase = await createServerClient();
  const [notesResult, subjectsResult, semestersResult] = await Promise.all([
    supabase.from('notes').select('*').order('updated_at', { ascending: false }),
    supabase.from('subjects').select('*').order('name'),
    supabase.from('semesters').select('*').order('id'),
  ]);

  const notes = (notesResult.data ?? []) as Note[];
  const subjects = (subjectsResult.data ?? []) as Subject[];
  const semesters = (semestersResult.data ?? []) as Semester[];
  const error = notesResult.error || subjectsResult.error || semestersResult.error;
  const semesterGroups = semesters.map((semester) => ({
    semester,
    course: getCourse(semester.name),
    subjects: subjects
      .filter((subject) => subject.semester_id === semester.id)
      .map((subject) => ({ subject, notes: notes.filter((note) => note.subject_id === subject.id) })),
  }));
  const selectedCourse = courseNames.find((course) => course === searchParams.course);
  const selectedGroup = semesterGroups.find(({ semester }) => semester.id === Number(searchParams.group));

  if (error || !semesterGroups.length) {
    return <div className={pageClassName}><EmptyState message={error ? 'Notes are unavailable right now.' : 'No course groups have been added yet.'} /></div>;
  }

  if (!selectedCourse && !selectedGroup) {
    return (
      <div className={pageClassName}>
        <p className="text-xs font-bold tracking-[0.14em] text-primary">YOUR LIBRARY</p>
        <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight">Choose your course</h1>
        <p className="mt-3 max-w-md text-base leading-6 text-muted">Start with your programme, then choose your semester.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {courseNames.map((course) => {
            const groups = semesterGroups.filter((group) => group.course === course);
            const noteCount = groups.reduce((total, group) => total + group.subjects.reduce((subjectTotal, subject) => subjectTotal + subject.notes.length, 0), 0);
            return <Link key={course} href={`/dashboard?course=${course}`} className="flex min-h-[88px] items-center gap-3 rounded-3xl border bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-blue-200 hover:shadow-md sm:min-h-24"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-primary"><FolderOpen size={22} /></span><span className="min-w-0 flex-1"><span className="block text-lg font-semibold text-slate-900">{displayCourse(course)}</span><span className="mt-1 block text-sm text-muted">{noteCount ? `${noteCount} notes available` : 'Notes coming soon'}</span></span><ChevronRight className="shrink-0 text-muted" size={20} /></Link>;
          })}
        </div>
      </div>
    );
  }

  if (selectedCourse && !selectedGroup) {
    const groups = semesterGroups.filter((group) => group.course === selectedCourse);
    return (
      <div className={pageClassName}>
        <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={18} /> All courses</Link>
        <p className="mt-6 text-xs font-bold tracking-[0.14em] text-primary">{displayCourse(selectedCourse).toUpperCase()}</p>
        <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight">Choose your semester</h1>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {groups.map(({ semester, subjects: groupSubjects }) => {
            const noteCount = groupSubjects.reduce((total, group) => total + group.notes.length, 0);
            return <Link key={semester.id} href={`/dashboard?course=${selectedCourse}&group=${semester.id}`} className="flex min-h-[88px] items-center gap-3 rounded-3xl border bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-blue-200 hover:shadow-md sm:min-h-24"><span className="min-w-0 flex-1"><span className="block text-lg font-semibold text-slate-900">{semester.name}</span><span className="mt-1 block text-sm text-muted">{noteCount ? `${noteCount} notes available` : 'Notes coming soon'}</span></span><ChevronRight className="shrink-0 text-muted" size={20} /></Link>;
          })}
        </div>
      </div>
    );
  }

  const groupNoteCount = selectedGroup?.subjects.reduce((total, group) => total + group.notes.length, 0) ?? 0;
  const groupCourse = selectedGroup ? getCourse(selectedGroup.semester.name) : undefined;

  return (
    <div className={pageClassName}>
      <Link href={groupCourse ? `/dashboard?course=${groupCourse}` : '/dashboard'} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={18} /> Choose another semester</Link>
      <p className="mt-6 text-xs font-bold tracking-[0.14em] text-primary">COURSE NOTES</p>
      <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight">{selectedGroup?.semester.name}</h1>
      <p className="mt-3 text-base leading-6 text-muted">{groupNoteCount ? `${groupNoteCount} notes ready to study.` : 'This group is being prepared.'}</p>
      {selectedGroup?.subjects.length ? <div className="mt-8 min-w-0 space-y-8">{selectedGroup.subjects.map(({ subject, notes: subjectNotes }) => <section key={subject.id} className="min-w-0" aria-labelledby={`subject-${subject.id}`}><h2 id={`subject-${subject.id}`} className="text-xl font-bold text-slate-900">{subject.name}</h2>{subjectNotes.length ? <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">{subjectNotes.map((note) => <NoteCard key={note.id} note={note} />)}</div> : <p className="mt-2 text-sm text-muted">Notes coming soon.</p>}</section>)}</div> : <div className="mt-8"><EmptyState message="Notes for this course group are coming soon." /></div>}
    </div>
  );
}
