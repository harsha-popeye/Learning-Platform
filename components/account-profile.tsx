'use client';

import { FormEvent, useState } from 'react';
import { LogOut, Save, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type AccountProfileProps = {
  email: string;
  initialProfile: { name: string; className: string; collegeName: string; contactNumber: string };
};

export function AccountProfile({ email, initialProfile }: AccountProfileProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const initials = (profile.name || email).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'S';

  function update(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const name = profile.name.trim();
    const className = profile.className.trim();
    const collegeName = profile.collegeName.trim();
    const contactNumber = profile.contactNumber.trim();
    if (!name) { setError('Enter your name.'); return; }
    if (contactNumber && !/^[+()\-\s0-9]{5,20}$/.test(contactNumber)) { setError('Enter a valid contact number.'); return; }

    setSaving(true);
    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: name, class_name: className, college_name: collegeName, contact_number: contactNumber },
      });
      if (updateError) throw updateError;
      setProfile({ name, className, collegeName, contactNumber });
      setMessage('Profile saved.');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setError('');
    setSigningOut(true);
    try {
      const supabase = createBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.replace('/login');
      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out.');
      setSigningOut(false);
    }
  }

  return <div className="mx-auto w-full max-w-xl px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:max-w-3xl sm:px-6 sm:pb-10 sm:pt-10">
    <div className="flex items-center gap-3"><span className="grid size-14 place-items-center rounded-2xl bg-blue-100 text-lg font-bold text-primary">{initials}</span><div className="min-w-0"><p className="text-xs font-bold tracking-[0.14em] text-primary">YOUR ACCOUNT</p><h1 className="mt-1 truncate text-[2rem] font-bold leading-tight tracking-tight">Profile</h1><p className="mt-1 truncate text-sm text-muted">{email}</p></div></div>
    <form onSubmit={saveProfile} className="mt-8 rounded-3xl border bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2"><UserRound className="text-primary" size={20} /><h2 className="font-bold text-ink">Your details</h2></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Name<input value={profile.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" required className="mt-1.5 min-h-12 w-full rounded-xl border bg-white px-3 text-base font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100" /></label>
        <label className="text-sm font-semibold text-slate-700">Class<input value={profile.className} onChange={(event) => update('className', event.target.value)} autoComplete="organization-title" className="mt-1.5 min-h-12 w-full rounded-xl border bg-white px-3 text-base font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100" /></label>
        <label className="text-sm font-semibold text-slate-700">Contact number<input value={profile.contactNumber} onChange={(event) => update('contactNumber', event.target.value)} autoComplete="tel" inputMode="tel" className="mt-1.5 min-h-12 w-full rounded-xl border bg-white px-3 text-base font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100" /></label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">College name<input value={profile.collegeName} onChange={(event) => update('collegeName', event.target.value)} autoComplete="organization" className="mt-1.5 min-h-12 w-full rounded-xl border bg-white px-3 text-base font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100" /></label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <button type="submit" disabled={saving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"><Save size={18} />{saving ? 'Saving…' : 'Save details'}</button>
    </form>
    <button type="button" onClick={signOut} disabled={signingOut} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"><LogOut size={18} />{signingOut ? 'Logging out…' : 'Log out'}</button>
  </div>;
}
