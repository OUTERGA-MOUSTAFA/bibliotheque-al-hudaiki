import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SettingsView from '@/components/account/SettingsView';

export default function ParametresPage() {
  return (
    <ProtectedRoute>
      <SettingsView />
    </ProtectedRoute>
  );
}
