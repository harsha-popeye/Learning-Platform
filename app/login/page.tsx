import Link from 'next/link';
import { BookOpen, CheckCircle2, GraduationCap } from 'lucide-react';
import { GoogleLoginButton } from '@/components/google-login-button';

const errors: Record<string, string> = {
  auth_callback: 'We could not complete Google sign-in. Please try again.',
  profile_sync: 'Your account was created, but we could not finish setting up your profile. Please try again.',
};

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const message = searchParams.error ? errors[searchParams.error] ?? 'Sign-in failed. Please try again.' : null;
  return <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center overflow-hidden px-4 py-8"><div className="pointer-events-none absolute -right-20 -top-16 size-64 rounded-full bg-blue-100/80 blur-3xl" /><div className="pointer-events-none absolute -bottom-16 -left-20 size-56 rounded-full bg-sky-100/80 blur-3xl" /><div className="relative"><Link href="/" className="mb-9 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><span className="grid size-9 place-items-center rounded-xl bg-primary text-white"><BookOpen size={19} /></span>StudyHub</Link><section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-blue-950/5 backdrop-blur"><div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-primary"><GraduationCap size={25} /></div><p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary">WELCOME BACK</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Continue learning</h1><p className="mt-3 text-base leading-7 text-muted">Your notes, subjects, and learning progress are ready when you are.</p><div className="my-7 h-px bg-slate-100" /><GoogleLoginButton />{message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700">{message}</p>}<div className="mt-7 flex items-center gap-2 text-sm text-muted"><CheckCircle2 size={17} className="shrink-0 text-primary" />Secure sign-in powered by Google</div></section><p className="mt-6 px-3 text-center text-xs leading-5 text-muted">By continuing, you can access the course notes available to your account.</p></div></div>;
}
