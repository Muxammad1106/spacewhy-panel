'use client';

import { m, useReducedMotion } from 'framer-motion';
import { alpha, keyframes, type Theme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { liquidGlass } from 'src/theme/css';
import { FIRST_DROP, SPACE_DROPS } from '../data';
import SpaceDropLogo from '../components/space-drop-logo';

const float = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
  50% { transform: translate3d(0, -14px, 0) rotate(2deg); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(0.94); opacity: 0.45; }
  50% { transform: scale(1.08); opacity: 0.8; }
`;

const GLASS_BUTTON_SX = (theme: Theme) => ({
  ...liquidGlass({ theme, blurred: true, blurStrength: 'control', interactive: true }),
  minHeight: 52,
  px: 2.5,
  color: 'text.primary',
});

export default function SpaceDropLandingView() {
  const reduceMotion = useReducedMotion();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 18% 8%, ${alpha(theme.palette.common.white, 0.09)}, transparent 27%), radial-gradient(circle at 82% 16%, ${alpha(theme.palette.common.white, 0.07)}, transparent 25%)`,
      }}
    >
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={(theme) => ({
          ...liquidGlass({ theme, blurred: true, blurStrength: 'full' }),
          borderRadius: 0,
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
        })}
      >
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 76 } }}>
          <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center' }}>
            <SpaceDropLogo />

            <Stack direction="row" spacing={4} sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' } }}>
              <Link href="#drops" color="text.secondary" underline="none" variant="body2">Drops</Link>
              <Link href="#subscription" color="text.secondary" underline="none" variant="body2">Подписка</Link>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ ml: { xs: 'auto', md: 4 } }}>
              <Button component={RouterLink} href="/login" color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Войти
              </Button>
              <Button component={RouterLink} href="/register" color="inherit" sx={GLASS_BUTTON_SX}>
                Начать бесплатно
              </Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box component="main">
        <Box
          sx={{
            minHeight: '100svh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            pt: { xs: 13, md: 12 },
            pb: { xs: 8, md: 6 },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 360, md: 760 },
              height: { xs: 360, md: 760 },
              top: { xs: 140, md: '2%' },
              left: { xs: '-35%', md: '35%' },
              borderRadius: '50%',
              background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.12)}, transparent 66%)`,
              filter: 'blur(16px)',
              animation: reduceMotion ? 'none' : `${breathe} 8s ease-in-out infinite`,
              pointerEvents: 'none',
            }}
          />

          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={{ xs: 7, md: 5 }} alignItems="center">
              <Grid xs={12} md={5}>
                <Box
                  component={m.div}
                  initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Chip
                    label="SPACEWHY · SPACE DROP"
                    variant="outlined"
                    sx={(theme) => ({
                      ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                      mb: 3,
                      letterSpacing: '0.1em',
                    })}
                  />

                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: 56, sm: 72, md: 'clamp(68px, 6vw, 96px)' },
                      lineHeight: 0.88,
                      letterSpacing: '-0.075em',
                      maxWidth: 700,
                    }}
                  >
                    Всё нужное. В одном пространстве.
                  </Typography>

                  <Typography
                    sx={{ mt: 3, maxWidth: 520, color: 'text.secondary', fontSize: { xs: 17, md: 19 } }}
                  >
                    Коллекция самостоятельных инструментов Spacewhy. Один аккаунт — любой Drop.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 4 }}>
                    <Button
                      component={RouterLink}
                      href="/register"
                      color="inherit"
                      endIcon={<Iconify icon="solar:arrow-right-linear" />}
                      sx={GLASS_BUTTON_SX}
                    >
                      Начать бесплатно
                    </Button>
                    <Button href="#drops" color="inherit" sx={GLASS_BUTTON_SX}>
                      Смотреть Drops
                    </Button>
                  </Stack>
                </Box>
              </Grid>

              <Grid xs={12} md={7}>
                <Box
                  component={m.div}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 36 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  sx={{ position: 'relative', minHeight: { xs: 500, md: 620 } }}
                >
                  <Card
                    sx={{
                      position: 'absolute',
                      inset: { xs: '5% 0 3%', md: '2% 2% 2% 5%' },
                      overflow: 'hidden',
                      backgroundImage: (theme) =>
                        `linear-gradient(145deg, ${alpha(theme.palette.common.white, 0.12)}, transparent 42%), radial-gradient(circle at 52% 42%, ${alpha(theme.palette.common.white, 0.13)}, transparent 26%)`,
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        position: 'absolute',
                        width: '70%',
                        aspectRatio: '1',
                        left: '15%',
                        top: '8%',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: (theme) => `inset 0 0 100px ${alpha(theme.palette.common.white, 0.04)}`,
                        '&::before, &::after': {
                          content: "''",
                          position: 'absolute',
                          borderRadius: '50%',
                          border: '1px solid',
                          borderColor: 'divider',
                        },
                        '&::before': { inset: '14%' },
                        '&::after': { inset: '29%' },
                      }}
                    />

                    <Stack direction="row" justifyContent="space-between" sx={{ p: 3 }}>
                      <Typography variant="overline" color="text.secondary">DROP SYSTEM</Typography>
                      <Iconify icon="solar:stars-minimalistic-linear" />
                    </Stack>

                    <Box
                      sx={(theme) => ({
                        ...liquidGlass({ theme, blurred: true, blurStrength: 'surface' }),
                        position: 'absolute',
                        width: { xs: 180, sm: 220 },
                        height: { xs: 180, sm: 220 },
                        left: '50%',
                        top: '45%',
                        transform: 'translate(-50%, -50%)',
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        borderRadius: '50%',
                        animation: reduceMotion ? 'none' : `${float} 7s ease-in-out infinite`,
                        backgroundImage: `radial-gradient(circle at 34% 26%, ${alpha(theme.palette.common.white, 0.2)}, transparent 34%)`,
                      })}
                    >
                      <Box>
                        <Typography variant="overline" color="text.secondary">FIRST DROP</Typography>
                        <Typography sx={{ mt: 0.5, px: 2, fontSize: { xs: 24, sm: 30 }, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                          {FIRST_DROP.name}
                        </Typography>
                      </Box>
                    </Box>

                    {SPACE_DROPS.slice(1, 5).map((drop, index) => {
                      const positions = [
                        { top: '18%', left: '12%' },
                        { top: '22%', right: '10%' },
                        { bottom: '13%', left: '10%' },
                        { bottom: '10%', right: '12%' },
                      ];
                      return (
                        <Box
                          key={drop.id}
                          sx={(theme) => ({
                            ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                            position: 'absolute',
                            width: { xs: 86, sm: 104 },
                            p: 1.5,
                            textAlign: 'center',
                            ...positions[index],
                          })}
                        >
                          <Iconify icon={drop.icon} width={22} />
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            {drop.name}
                          </Typography>
                        </Box>
                      );
                    })}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ position: 'absolute', left: 24, right: 24, bottom: 22 }}
                    >
                      <Typography variant="caption" color="text.secondary">ONE ACCOUNT</Typography>
                      <Typography variant="caption" color="text.secondary">MULTIPLE TOOLS</Typography>
                    </Stack>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box id="drops" sx={{ py: { xs: 10, md: 16 } }}>
          <Container maxWidth="xl">
            <Box sx={{ maxWidth: 720, mb: 6 }}>
              <Typography variant="overline" color="text.secondary">DROPS</Typography>
              <Typography variant="h2" sx={{ mt: 1, letterSpacing: '-0.05em' }}>
                Открывайте только то, что нужно.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {SPACE_DROPS.map((drop, index) => (
                <Grid key={drop.id} xs={12} sm={6} md={4}>
                  <Card
                    component={m.div}
                    initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6, delay: reduceMotion ? 0 : index * 0.05 }}
                    sx={{ p: 3, minHeight: 260 }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Box
                        sx={(theme) => ({
                          ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                          width: 52,
                          height: 52,
                          display: 'grid',
                          placeItems: 'center',
                        })}
                      >
                        <Iconify icon={drop.icon} width={25} />
                      </Box>
                      <Chip label="Скоро" size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="h3" sx={{ mt: 4 }}>{drop.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {drop.summary}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box id="subscription" sx={{ py: { xs: 10, md: 16 } }}>
          <Container maxWidth="md">
            <Card
              sx={{
                p: { xs: 3, sm: 5, md: 7 },
                textAlign: 'center',
                overflow: 'hidden',
                backgroundImage: (theme) =>
                  `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.common.white, 0.15)}, transparent 40%)`,
              }}
            >
              <Chip label="СКОРО" variant="outlined" />
              <Typography variant="h2" sx={{ mt: 3, letterSpacing: '-0.05em' }}>Подписка</Typography>
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>Единый доступ ко всем Space Drops.</Typography>
              <Button disabled color="inherit" sx={(theme) => ({ ...GLASS_BUTTON_SX(theme), mt: 3 })}>
                Пока недоступна
              </Button>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  href="/register"
                  color="inherit"
                  endIcon={<Iconify icon="solar:arrow-right-linear" />}
                  sx={GLASS_BUTTON_SX}
                >
                  Начать бесплатно
                </Button>
              </Box>
            </Card>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="xl" component="footer" sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <SpaceDropLogo />
          <Typography variant="caption" color="text.secondary">© 2026 Spacewhy</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
