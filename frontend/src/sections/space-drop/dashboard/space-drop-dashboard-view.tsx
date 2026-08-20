'use client';

import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';
import { useReducedMotion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import { liquidGlass } from 'src/theme/css';
import { createFinanceHandoff } from '../auth/space-drop-auth-api';
import { SPACE_DROPS, type SpaceDropItem } from '../data';

const PAGE_COUNT = 2;
const FIRST_PAGE_PLACEHOLDERS = 2;
const SECOND_PAGE_PLACEHOLDERS = 8;

type PlaceholderGridProps = {
  count: number;
};

function PlaceholderGrid({ count }: PlaceholderGridProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Grid key={index} xs={4} sm={3} md={2}>
          <Stack
            aria-label="Будущее приложение"
            alignItems="center"
            justifyContent="flex-start"
            spacing={1.25}
            sx={{
              minHeight: { xs: 116, sm: 132 },
              opacity: 0.28,
              '@media (max-height: 520px)': { minHeight: 96, gap: 0.75 },
            }}
          >
            <Box
              sx={(theme) => ({
                ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                width: { xs: 64, sm: 72 },
                height: { xs: 64, sm: 72 },
                display: 'grid',
                placeItems: 'center',
                backgroundImage: `linear-gradient(145deg, ${alpha(
                  theme.palette.common.white,
                  0.08
                )}, transparent 60%)`,
                '@media (max-height: 520px)': { width: 56, height: 56 },
              })}
            >
              <Iconify icon="solar:add-circle-linear" width={28} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Скоро
            </Typography>
          </Stack>
        </Grid>
      ))}
    </>
  );
}

export default function SpaceDropDashboardView() {
  const reduceMotion = useReducedMotion();
  const pagerRef = useRef<HTMLDivElement | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [selectedDrop, setSelectedDrop] = useState<SpaceDropItem | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');

  const closeDrop = useCallback(() => {
    if (launching) return;
    setSelectedDrop(null);
    setLaunchError('');
  }, [launching]);

  const launchDrop = useCallback(async () => {
    if (!selectedDrop?.href) return;
    try {
      setLaunching(true);
      setLaunchError('');
      if (selectedDrop.id !== 'z01') {
        window.location.assign(selectedDrop.href);
        return;
      }
      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken || accessToken.endsWith('.demo')) {
        throw new Error('identity_session_required');
      }
      const handoff = await createFinanceHandoff(accessToken);
      const destination = new URL(selectedDrop.href, window.location.href);
      destination.hash = new URLSearchParams({ handoff: handoff.handoff_token }).toString();
      window.location.assign(destination.toString());
    } catch {
      setLaunching(false);
      setLaunchError('Сессия не подтверждена. Войдите по номеру телефона и попробуйте снова.');
    }
  }, [selectedDrop]);

  const goToPage = useCallback(
    (page: number) => {
      const pager = pagerRef.current;
      const nextPage = Math.max(0, Math.min(PAGE_COUNT - 1, page));

      if (!pager) return;

      pager.scrollTo({
        left: pager.clientWidth * nextPage,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
      setActivePage(nextPage);
    },
    [reduceMotion]
  );

  const handlePagerScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const pager = event.currentTarget;
    const nextPage = Math.round(pager.scrollLeft / Math.max(pager.clientWidth, 1));

    setActivePage((currentPage) => (currentPage === nextPage ? currentPage : nextPage));
  }, []);

  useEffect(() => {
    const pager = pagerRef.current;

    if (!pager) return undefined;

    const handleResize = () => {
      pager.scrollLeft = pager.clientWidth * activePage;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activePage]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 1,
        height: { xs: 'calc(100svh - 64px)', md: 'calc(100svh - 72px)' },
        minHeight: 0,
        overflow: 'hidden',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 50% 40%, ${alpha(
            theme.palette.common.white,
            0.065
          )}, transparent 40%)`,
      }}
    >
      <Typography
        component="h1"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Приложения Space Drop
      </Typography>

      <Box
        ref={pagerRef}
        tabIndex={0}
        role="region"
        aria-label="Страницы приложений Space Drop"
        onScroll={handlePagerScroll}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToPage(activePage - 1);
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToPage(activePage + 1);
          }
        }}
        sx={{
          display: 'flex',
          width: 1,
          height: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'text.primary',
            outlineOffset: -3,
          },
        }}
      >
        <Box
          role="group"
          aria-roledescription="страница"
          aria-label="Приложения, страница 1 из 2"
          sx={{
            flex: '0 0 100%',
            minWidth: 0,
            height: 1,
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            px: { xs: 2, sm: 4, lg: 7 },
            pt: { xs: 4, sm: 5, md: 7 },
            pb: 'calc(64px + env(safe-area-inset-bottom))',
            '@media (max-height: 520px)': {
              pt: 1.5,
              pb: 'calc(52px + env(safe-area-inset-bottom))',
            },
          }}
        >
          <Grid
            container
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            rowSpacing={{ xs: 2, sm: 2 }}
            sx={{ maxWidth: 1040, mx: 'auto' }}
          >
            {SPACE_DROPS.map((drop) => (
              <Grid key={drop.id} xs={4} sm={3} md={2}>
                <ButtonBase
                  aria-label={`Открыть информацию о приложении «${drop.name}»`}
                  onClick={() => setSelectedDrop(drop)}
                  sx={{
                    width: 1,
                    minHeight: { xs: 116, sm: 132 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: 1.25,
                    borderRadius: 2.5,
                    touchAction: 'manipulation',
                    '@media (max-height: 520px)': { minHeight: 96, gap: 0.75 },
                  }}
                >
                  <Box
                    sx={(theme) => ({
                      ...liquidGlass({
                        theme,
                        blurred: true,
                        blurStrength: 'control',
                        interactive: true,
                      }),
                      width: { xs: 64, sm: 72 },
                      height: { xs: 64, sm: 72 },
                      display: 'grid',
                      placeItems: 'center',
                      backgroundImage: `linear-gradient(145deg, ${alpha(
                        theme.palette.common.white,
                        0.15
                      )}, transparent 58%)`,
                      '@media (max-height: 520px)': { width: 56, height: 56 },
                    })}
                  >
                    <Iconify icon={drop.icon} width={31} />
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{
                      maxWidth: 112,
                      minHeight: 34,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      '@media (max-height: 520px)': { minHeight: 28 },
                    }}
                  >
                    {drop.name}
                  </Typography>
                </ButtonBase>
              </Grid>
            ))}

            <PlaceholderGrid count={FIRST_PAGE_PLACEHOLDERS} />
          </Grid>
        </Box>

        <Box
          role="group"
          aria-roledescription="страница"
          aria-label="Приложения, страница 2 из 2"
          sx={{
            flex: '0 0 100%',
            minWidth: 0,
            height: 1,
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            px: { xs: 2, sm: 4, lg: 7 },
            pt: { xs: 4, sm: 5, md: 7 },
            pb: 'calc(64px + env(safe-area-inset-bottom))',
            '@media (max-height: 520px)': {
              pt: 1.5,
              pb: 'calc(52px + env(safe-area-inset-bottom))',
            },
          }}
        >
          <Grid
            container
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            rowSpacing={{ xs: 2, sm: 2 }}
            sx={{ maxWidth: 1040, mx: 'auto' }}
          >
            <PlaceholderGrid count={SECOND_PAGE_PLACEHOLDERS} />
          </Grid>
        </Box>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={0}
        sx={{
          position: 'absolute',
          zIndex: 2,
          left: '50%',
          bottom: 'max(8px, env(safe-area-inset-bottom))',
          transform: 'translateX(-50%)',
        }}
      >
        {Array.from({ length: PAGE_COUNT }, (_, index) => (
          <ButtonBase
            key={index}
            aria-label={`Открыть страницу приложений ${index + 1}`}
            aria-current={activePage === index ? 'page' : undefined}
            onClick={() => goToPage(index)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: activePage === index ? 18 : 6,
                height: 6,
                borderRadius: 99,
                bgcolor: activePage === index ? 'text.primary' : 'text.disabled',
                transition: reduceMotion
                  ? 'none'
                  : 'width 220ms ease-out, background-color 220ms ease-out',
              }}
            />
          </ButtonBase>
        ))}
      </Stack>

      <Dialog
        open={Boolean(selectedDrop)}
        onClose={closeDrop}
        fullWidth
        maxWidth="sm"
        aria-labelledby="drop-dialog-title"
        aria-describedby="drop-dialog-description"
      >
        {selectedDrop && (
          <>
            <DialogTitle id="drop-dialog-title" sx={{ pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    SPACE DROP
                  </Typography>
                  <Typography variant="h3">{selectedDrop.name}</Typography>
                </Box>
                <IconButton aria-label="Закрыть" onClick={closeDrop} disabled={launching}>
                  <Iconify icon="mingcute:close-line" />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {!!launchError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {launchError}
                </Alert>
              )}
              <Box
                sx={(theme) => ({
                  ...liquidGlass({ theme, blurred: true, blurStrength: 'surface' }),
                  height: 180,
                  my: 2,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundImage: `radial-gradient(circle, ${alpha(
                    theme.palette.common.white,
                    0.14
                  )}, transparent 60%)`,
                })}
              >
                <Iconify icon={selectedDrop.icon} width={62} />
              </Box>
              <Typography id="drop-dialog-description" color="text.secondary" sx={{ mt: 1 }}>
                {selectedDrop.description}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Chip
                label={selectedDrop.status === 'available' ? 'Доступен' : 'Скоро'}
                color={selectedDrop.status === 'available' ? 'success' : 'default'}
                variant="outlined"
                sx={{ mr: 'auto' }}
              />
              <Button color="inherit" onClick={closeDrop} disabled={launching}>
                Закрыть
              </Button>
              {selectedDrop.href && (
                <LoadingButton
                  variant="contained"
                  color="inherit"
                  loading={launching}
                  onClick={launchDrop}
                  endIcon={<Iconify icon="solar:arrow-right-up-linear" />}
                >
                  Открыть
                </LoadingButton>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
