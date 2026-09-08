import { NextResponse } from 'next/server';
import { answerFromDocuments } from '@/lib/lesson-answer';
import { createServerClient } from '@/lib/supabase/server';

type AskBody = { courseId?: number; lessonId?: number; question?: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as AskBody;
    const courseId = Number(body.courseId);
    const lessonId = Number(body.lessonId);
    const question = body.question?.trim() ?? '';
    if (!Number.isInteger(courseId) || !Number.isInteger(lessonId) || !question || question.length > 1000) {
      return NextResponse.json({ error: 'Choose a lesson and enter a question under 1,000 characters.' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to use the study helper.' }, { status: 401 });

    const [noteResult, notesResult] = await Promise.all([
      supabase.from('notes').select('id,title,content,subject_id').eq('id', lessonId).maybeSingle(),
      supabase.from('notes').select('id,title,content'),
    ]);
    const note = noteResult.data;
    if (noteResult.error || !note) return NextResponse.json({ error: 'That lesson could not be found.' }, { status: 404 });
    if (notesResult.error || !notesResult.data?.length) return NextResponse.json({ error: 'Study material is unavailable right now.' }, { status: 503 });

    const { data: subject, error: subjectError } = await supabase.from('subjects').select('semester_id').eq('id', note.subject_id).maybeSingle();
    if (subjectError || !subject || subject.semester_id !== courseId) {
      return NextResponse.json({ error: 'Choose a lesson from the selected course.' }, { status: 400 });
    }

    return NextResponse.json({ answer: answerFromDocuments(notesResult.data, question, note.id) });
  } catch {
    return NextResponse.json({ error: 'Unable to answer that question right now.' }, { status: 500 });
  }
}
