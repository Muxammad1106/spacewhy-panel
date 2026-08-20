'use client';

// auth
import { AuthGuard } from 'src/auth/guard';
import { usePathname } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// components
import DashboardLayout from 'src/layouts/dashboard';
import SpaceDropShell from 'src/layouts/space-drop/space-drop-shell';
import ReduxProvider from 'src/redux/redux-provider';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';

  const isSpaceDropRoute =
    normalizedPathname === paths.dashboard.root || normalizedPathname === paths.dashboard.profile;

  return (
    <ReduxProvider>
      <AuthGuard>
        {isSpaceDropRoute ? (
          <SpaceDropShell>{children}</SpaceDropShell>
        ) : (
          <DashboardLayout>{children}</DashboardLayout>
        )}
      </AuthGuard>
    </ReduxProvider>
  );
}
