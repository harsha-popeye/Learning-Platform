import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to use the study helper.' }, { status: 401 });

    const [semestersResult, subjectsResult, notesResult] = await Promise.all([
      supabase.from('semesters').select('id,name').order('id'),
      supabase.from('subjects').select('id,name,semester_id').order('name'),
      supabase.from('notes').select('id,title,subject_id').order('title'),
    ]);
    const error = semestersResult.error || subjectsResult.error || notesResult.error;
    if (error) return NextResponse.json({ error: 'Unable to load your lessons right now.' }, { status: 500 });

    const courses = (semestersResult.data ?? []).map((semester) => ({
      id: semester.id,
      name: semester.name,
      lessons: (subjectsResult.data ?? [])
        .filter((subject) => subject.semester_id === semester.id)
        .flatMap((subject) => (notesResult.data ?? [])
          .filter((note) => note.subject_id === subject.id)
          .map((note) => ({ id: note.id, title: note.title, subject: subject.name }))),
    })).filter((course) => course.lessons.length > 0);

    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: 'Unable to load your lessons right now.' }, { status: 500 });
  }
}
