import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileView from '@/components/account/ProfileView';

export default function ComptePage() {
  return (
    <ProtectedRoute>
      <ProfileView />
    </ProtectedRoute>
  );
}