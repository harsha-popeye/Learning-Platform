import { redirect } from 'next/navigation';
import { AccountProfile } from '@/components/account-profile';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const metadata = user.user_metadata;
  const stringValue = (key: string) => typeof metadata[key] === 'string' ? metadata[key] : '';
  return <AccountProfile email={user.email ?? ''} initialProfile={{
    name: stringValue('full_name') || stringValue('name'),
    className: stringValue('class_name'),
    collegeName: stringValue('college_name'),
    contactNumber: stringValue('contact_number'),
  }} />;
}
