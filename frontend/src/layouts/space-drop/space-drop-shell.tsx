'use client';

import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { SettingsButton } from 'src/layouts/_common';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hook';
import { liquidGlass } from 'src/theme/css';
import SpaceDropLogo from 'src/sections/space-drop/components/space-drop-logo';

type Props = {
  children: React.ReactNode;
};

export default function SpaceDropShell({ children }: Props) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';

  const initials = useMemo(() => {
    const displayName = String(user?.displayName || 'Space Drop');
    return displayName
      .split(' ')
      .slice(0, 2)
      .map((part: string) => part[0])
      .join('')
      .toUpperCase();
  }, [user?.displayName]);

  return (
    <Box
      sx={{
        minHeight: '100svh',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 18% 0%, ${alpha(theme.palette.primary.main, 0.11)}, transparent 32%), radial-gradient(circle at 88% 8%, ${alpha(theme.palette.common.white, 0.06)}, transparent 28%)`,
      }}
    >
      <Link
        href="#space-drop-content"
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 2000,
          transform: 'translateY(-150%)',
          '&:focus': { transform: 'translateY(0)' },
        }}
      >
        Перейти к содержимому
      </Link>

      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={(theme) => ({
          ...liquidGlass({ theme, blurred: true, blurStrength: 'full' }),
          position: 'fixed',
          borderRadius: 0,
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
        })}
      >
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center' }}>
            <SpaceDropLogo compact={false} />

            <Stack direction="row" spacing={0.5} sx={{ ml: { xs: 'auto', md: 5 }, display: { xs: 'none', md: 'flex' } }}>
              <Button
                component={RouterLink}
                href="/dashboard"
                color="inherit"
                sx={{ color: normalizedPathname === '/dashboard' ? 'text.primary' : 'text.secondary' }}
              >
                Панель
              </Button>
              <Button
                component={RouterLink}
                href="/dashboard/profile"
                color="inherit"
                sx={{ color: normalizedPathname === '/dashboard/profile' ? 'text.primary' : 'text.secondary' }}
              >
                Профиль
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto' }}>
              <Box
                sx={(theme) => ({
                  ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  color: 'text.secondary',
                })}
              >
                <Iconify icon="solar:card-2-linear" width={16} />
                <Typography variant="caption">Подписка недоступна</Typography>
              </Box>

              <SettingsButton />

              <Tooltip title="Профиль">
                <Box
                  component={RouterLink}
                  href="/dashboard/profile"
                  aria-label="Открыть профиль"
                  sx={{ display: 'inline-flex', p: 0.5, borderRadius: '50%' }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: 'common.white',
                      color: 'common.black',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </Avatar>
                </Box>
              </Tooltip>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        id="space-drop-content"
        sx={{
          pt: { xs: '64px', md: '72px' },
          minHeight: '100svh',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
