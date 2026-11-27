import { redirect } from 'next/navigation';
import { menuEditor } from '@/lib/menu-editor';
import { getServerSupabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import AdminDashboard from '@/components/restaurant/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!supabaseUrl || !supabaseAnonKey) redirect(menuEditor);
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/admin/login');
  return <AdminDashboard email={user.email ?? 'Owner'} />;
}
