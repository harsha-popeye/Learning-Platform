import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { Note } from '@/lib/types';

export function NoteCard({ note }: { note: Note }) {
  return <Link href={`/dashboard/notes/${note.id}`} className="flex min-h-24 min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition hover:border-blue-200">
    <FileText className="shrink-0 text-primary" />
    <div className="min-w-0 flex-1 overflow-hidden"><h3 className="truncate font-semibold">{note.title}</h3><p className="mt-1 line-clamp-2 break-words text-sm text-muted">{note.content.replace(/[#*_]/g, '')}</p></div>
  </Link>;
}
