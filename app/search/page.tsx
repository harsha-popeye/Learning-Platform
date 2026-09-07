import { LessonSearch } from '@/components/lesson-search';

export default function SearchPage() {
  return <div className="mx-auto w-full max-w-xl px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:max-w-3xl sm:px-6 sm:pb-10 sm:pt-10">
    <p className="text-xs font-bold tracking-[0.14em] text-primary">FIND A LESSON</p>
    <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight">Search notes</h1>
    <p className="mt-3 text-base leading-6 text-muted">Results appear automatically after you type 2 characters.</p>
    <LessonSearch />
  </div>;
}
