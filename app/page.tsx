import Link from 'next/link';
import { ArrowRight, BookMarked, BookOpen, ChevronRight, GraduationCap, Search, Sparkles } from 'lucide-react';

const courses = [
  { name: 'SSLC', description: 'School notes', href: '/dashboard?course=SSLC', accent: 'bg-amber-100 text-amber-700' },
  { name: 'PUC', description: 'Pre-university', href: '/dashboard?course=PUC', accent: 'bg-violet-100 text-violet-700' },
  { name: 'BCA', description: 'Computer applications', href: '/dashboard?course=BCA', accent: 'bg-cyan-100 text-cyan-700' },
  { name: 'BCOM', description: 'Commerce', href: '/dashboard?course=BCOM', accent: 'bg-emerald-100 text-emerald-700' },
  { name: 'BBA', description: 'Business administration', href: '/dashboard?course=BBA', accent: 'bg-rose-100 text-rose-700' },
];

export default function HomePage() {
  return <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:px-6 md:px-8 md:pt-8">
    <header className="flex h-14 items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 text-base font-bold text-ink" aria-label="StudyHub home"><span className="grid size-9 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_18px_-8px_rgba(59,130,246,0.9)]"><BookOpen size={19} strokeWidth={2.5} /></span>Study<span className="text-primary">Hub</span></Link>
      <Link href="/search" className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-primary" aria-label="Search notes"><Search size={20} /></Link>
    </header>

    <section className="relative mt-7 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-primary to-indigo-500 px-5 py-7 text-white shadow-[0_20px_44px_-24px_rgba(37,99,235,0.85)] sm:px-8 sm:py-10">
      <div className="absolute -right-8 -top-8 size-40 rounded-full border-[18px] border-white/10" /><div className="absolute -bottom-16 right-16 size-32 rounded-full bg-white/10" />
      <div className="relative max-w-2xl"><p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold tracking-wide backdrop-blur"><Sparkles size={14} /> YOUR STUDY SPACE</p><h1 className="mt-5 max-w-md text-[2.1rem] font-bold leading-[1.08] tracking-tight sm:text-5xl">Study notes, made easy to find.</h1><p className="mt-4 max-w-lg text-[0.98rem] leading-6 text-blue-50 sm:text-lg">Choose your course, open a lesson, and focus on learning—not on hunting for material.</p><Link href="/dashboard" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-primary shadow-lg shadow-blue-900/15 transition hover:bg-blue-50">Browse all notes <ArrowRight size={18} /></Link></div>
    </section>

    <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-primary">START HERE</p><h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Choose your course</h2></div><Link href="/dashboard" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">View all <ChevronRight size={17} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{courses.map((course) => <Link key={course.name} href={course.href} className="group min-h-32 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"><span className={`grid size-10 place-items-center rounded-xl ${course.accent}`}><GraduationCap size={20} /></span><p className="mt-4 font-bold text-ink">{course.name}</p><p className="mt-0.5 text-xs leading-4 text-muted">{course.description}</p></Link>)}</div></section>

    <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm"><BookMarked size={20} /></span><div><h2 className="font-bold text-ink">Built for comfortable learning</h2><p className="mt-1 text-sm leading-5 text-muted">Readable lesson notes, instant search, and a study helper that stays focused on your chapter.</p></div></div></section>
  </div>;
}
