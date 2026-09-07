'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { LoaderCircle, Search } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { NoteCard } from '@/components/note-card';
import type { Note } from '@/lib/types';

export function LessonSearch() {
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setNotes([]);
      setError('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError('');
      void fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal })
        .then(async (response) => {
          const data = await response.json() as { notes?: Note[]; error?: string };
          if (!response.ok) throw new Error(data.error ?? 'Unable to search notes.');
          setNotes(data.notes ?? []);
        })
        .catch((searchError: unknown) => {
          if (searchError instanceof DOMException && searchError.name === 'AbortError') return;
          setError(searchError instanceof Error ? searchError.message : 'Unable to search notes.');
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function updateQuery(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  const trimmedQuery = query.trim();
  return <>
    <div className="mt-6 flex gap-2" role="search">
      <label className="sr-only" htmlFor="query">Lesson name</label>
      <input id="query" value={query} onChange={updateQuery} className="min-h-12 min-w-0 flex-1 rounded-xl border bg-white px-4" placeholder="e.g. Animal Farm" autoComplete="off" />
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white" aria-hidden="true">{loading ? <LoaderCircle className="animate-spin" size={20} /> : <Search size={20} />}</span>
    </div>
    {trimmedQuery.length < 2 ? <div className="mt-8"><EmptyState message="Start typing a lesson name. Results appear after 2 characters." /></div> : <section className="mt-8" aria-live="polite"><h2 className="text-lg font-bold">{loading ? 'Searching lessons…' : `${notes.length} lesson${notes.length === 1 ? '' : 's'} found`}</h2>{error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : !loading && notes.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{notes.map((note) => <NoteCard key={note.id} note={note} />)}</div> : !loading ? <div className="mt-4"><EmptyState message={`No lesson title matches “${trimmedQuery}”.`} /></div> : null}</section>}
  </>;
}
