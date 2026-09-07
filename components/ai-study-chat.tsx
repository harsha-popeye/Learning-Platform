'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';

type Lesson = { id: number; title: string; subject: string };
type Course = { id: number; name: string; lessons: Lesson[] };
type Message = { role: 'student' | 'assistant'; text: string };
type AiStudyChatProps = { initialCourseId?: number; initialLessonId?: number };
const outOfSyllabus = 'I could not find this information in the provided documents.';

export function AiStudyChat({ initialCourseId, initialLessonId }: AiStudyChatProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [question, setQuestion] = useState('');
  // Start with a clean chat so students can ask their own question immediately.
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    void fetch('/api/ai/catalog').then(async (response) => {
      const data = await response.json() as { courses?: Course[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Unable to load lessons.');
      setCourses(data.courses ?? []);
      const requestedCourse = data.courses?.find((course) => course.id === initialCourseId && course.lessons.some((lesson) => lesson.id === initialLessonId));
      const firstCourse = requestedCourse ?? data.courses?.[0];
      if (firstCourse) {
        setCourseId(String(firstCourse.id));
        setLessonId(String(requestedCourse ? initialLessonId : firstCourse.lessons[0]?.id ?? ''));
      }
    }).catch((catalogError: unknown) => setError(catalogError instanceof Error ? catalogError.message : 'Unable to load lessons.')).finally(() => setLoadingCatalog(false));
  }, [initialCourseId, initialLessonId]);

  const selectedCourse = useMemo(() => courses.find((course) => course.id === Number(courseId)), [courseId, courses]);
  const lockedLesson = useMemo(() => initialCourseId === Number(courseId) ? selectedCourse?.lessons.find((lesson) => lesson.id === initialLessonId) : undefined, [courseId, initialCourseId, initialLessonId, selectedCourse]);
  const canAsk = Boolean(lockedLesson || (!isDesktop && courseId && lessonId));

  function changeCourse(nextCourseId: string) {
    setCourseId(nextCourseId);
    const nextCourse = courses.find((course) => course.id === Number(nextCourseId));
    setLessonId(String(nextCourse?.lessons[0]?.id ?? ''));
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !courseId || !lessonId || sending) return;

    setError('');
    setQuestion('');
    setMessages((current) => [...current, { role: 'student', text: trimmedQuestion }]);
    setSending(true);
    try {
      const response = await fetch('/api/ai/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: Number(courseId), lessonId: Number(lessonId), question: trimmedQuestion }) });
      const data = await response.json() as { answer?: string; error?: string };
      const answer = data.answer;
      if (!response.ok || !answer) throw new Error(data.error ?? 'Unable to answer that question.');
      setMessages((current) => [...current, { role: 'assistant', text: answer }]);
    } catch (askError: unknown) {
      setError(askError instanceof Error ? askError.message : 'Unable to answer that question.');
    } finally {
      setSending(false);
    }
  }

  return <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:max-w-3xl sm:px-6 sm:pb-10 sm:pt-10">
    <div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-primary"><Sparkles size={22} /></span><div><p className="text-xs font-bold tracking-[0.14em] text-primary">PHASE 3</p><h1 className="mt-1 text-[2rem] font-bold leading-tight tracking-tight">AI study helper</h1><p className="mt-2 text-sm leading-5 text-muted">Zero-cost, note-grounded answers for your selected lesson.</p></div></div>
    {lockedLesson ? <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-bold tracking-[0.12em] text-primary">CURRENT LESSON</p><p className="mt-1 font-semibold text-slate-900">{lockedLesson.title}</p><p className="mt-1 text-sm text-muted">{selectedCourse?.name} · {lockedLesson.subject}</p></div> : <><div className="mt-6 grid gap-3 md:hidden"><label className="text-sm font-semibold text-slate-700">Course<select value={courseId} onChange={(event) => changeCourse(event.target.value)} disabled={loadingCatalog || !courses.length} className="mt-1 min-h-12 w-full rounded-xl border bg-white px-3 text-base font-normal disabled:opacity-60">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Lesson<select value={lessonId} onChange={(event) => setLessonId(event.target.value)} disabled={loadingCatalog || !selectedCourse} className="mt-1 min-h-12 w-full rounded-xl border bg-white px-3 text-base font-normal disabled:opacity-60">{selectedCourse?.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.subject}: {lesson.title}</option>)}</select></label></div><div className="mt-6 hidden rounded-2xl border bg-white p-4 text-sm leading-6 text-muted md:block">Open a chapter, then select <span className="font-semibold text-primary">Ask AI</span> to ask questions about that lesson.</div></>}
    <div className="mt-6 flex-1 space-y-3">{messages.map((message, index) => <article key={`${message.role}-${index}`} className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'student' ? 'ml-auto bg-primary text-white' : message.text.includes(outOfSyllabus) ? 'border border-amber-200 bg-amber-50 text-amber-950' : 'bg-white shadow-sm'}`}><div className="mb-1 flex items-center gap-1.5 text-xs font-bold opacity-75">{message.role === 'assistant' && <Bot size={14} aria-hidden="true" />}{message.role === 'student' ? 'You' : 'Study helper'}</div><p className="whitespace-pre-wrap">{message.text}</p></article>)}{sending && <div className="flex items-center gap-2 text-sm text-muted"><Bot size={16} aria-hidden="true" /> Finding this in your notes…</div>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div>
    <form onSubmit={ask} autoComplete="off" className="sticky bottom-0 mt-4 flex gap-2 border-t bg-canvas py-3"><label className="sr-only" htmlFor="study-question">Ask about this lesson</label><input id="study-question" name="study-question" autoComplete="off" autoFocus value={question} onChange={(event) => setQuestion(event.target.value)} disabled={loadingCatalog || !canAsk || sending} className="min-h-12 min-w-0 flex-1 rounded-xl border bg-white px-4 disabled:opacity-60" placeholder="Type your question about this lesson" /><button type="submit" disabled={!question.trim() || !canAsk || sending} className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white disabled:opacity-60" aria-label="Send question"><Send size={20} aria-hidden="true" /></button></form>
  </div>;
}
