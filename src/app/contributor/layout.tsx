import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { AuthProvider } from '@/context/AuthContext';

export default async function ContributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth');
  }

  return <AuthProvider initialUser={session.user}>{children}</AuthProvider>;
}
