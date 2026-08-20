'use client';

import { useState } from 'react';
import { useSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { liquidGlass } from 'src/theme/css';

export default function SpaceDropProfileView() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [launchEmails, setLaunchEmails] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productTips, setProductTips] = useState(false);

  const displayName = user?.displayName || 'Muxammad Chariev';
  const [firstName = '', lastName = ''] = displayName.split(' ');
  const initials = `${firstName[0] || 'S'}${lastName[0] || 'D'}`.toUpperCase();

  const showSaved = () => enqueueSnackbar('Настройки профиля сохранены', { variant: 'success' });

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h3" sx={{ letterSpacing: '-0.04em' }}>
        Профиль
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 4 }}>
        Один аккаунт для всех текущих и будущих Space Drops.
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <Stack spacing={2}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 92,
                  height: 92,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'common.white',
                  color: 'common.black',
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="h5">{displayName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {user?.email || 'demo@spacewhy.uz'}
              </Typography>
              <Button color="inherit" variant="outlined" startIcon={<Iconify icon="solar:camera-linear" />} sx={{ mt: 2 }}>
                Обновить фото
              </Button>
            </Card>

            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Подписка</Typography>
                <Chip label="Недоступна" size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Управление подпиской появится здесь позже.
              </Typography>
              <Box
                sx={(theme) => ({
                  ...liquidGlass({ theme, blurStrength: 'control' }),
                  p: 1.5,
                  mt: 2,
                })}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:info-circle-linear" />
                  <Typography variant="caption" color="text.secondary">
                    Сейчас можно пользоваться доступными возможностями панели.
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Stack>
        </Grid>

        <Grid xs={12} md={8}>
          <Stack spacing={2}>
            <Card sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="h6">Личные данные</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                Эти данные будут использовать новые инструменты после активации.
              </Typography>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Имя" defaultValue={firstName} autoComplete="given-name" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Фамилия" defaultValue={lastName} autoComplete="family-name" />
                </Grid>
                <Grid xs={12}>
                  <TextField fullWidth label="Email" defaultValue={user?.email || 'demo@spacewhy.uz'} autoComplete="email" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Телефон" defaultValue="+998 90 000 00 00" autoComplete="tel" />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Часовой пояс" defaultValue="Asia/Samarkand" />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={showSaved}
                  sx={(theme) => ({
                    ...liquidGlass({ theme, blurred: true, blurStrength: 'control', interactive: true }),
                    color: 'text.primary',
                  })}
                >
                  Сохранить изменения
                </Button>
              </Stack>
            </Card>

            <Card sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="h6">Уведомления</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Выберите, какие сообщения будут приходить из общей панели.
              </Typography>
              <Stack divider={<Divider flexItem />}>
                <FormControlLabel
                  label={<Box><Typography variant="subtitle2">Запуски новых Drops</Typography><Typography variant="caption" color="text.secondary">Узнавайте первыми, когда инструмент становится доступен.</Typography></Box>}
                  labelPlacement="start"
                  control={<Switch checked={launchEmails} onChange={(event) => setLaunchEmails(event.target.checked)} />}
                  sx={{ m: 0, py: 1.5, justifyContent: 'space-between', gap: 2 }}
                />
                <FormControlLabel
                  label={<Box><Typography variant="subtitle2">Новости Drops</Typography><Typography variant="caption" color="text.secondary">Короткие сообщения о важных изменениях.</Typography></Box>}
                  labelPlacement="start"
                  control={<Switch checked={weeklyDigest} onChange={(event) => setWeeklyDigest(event.target.checked)} />}
                  sx={{ m: 0, py: 1.5, justifyContent: 'space-between', gap: 2 }}
                />
                <FormControlLabel
                  label={<Box><Typography variant="subtitle2">Советы по продуктам</Typography><Typography variant="caption" color="text.secondary">Редкие подсказки о возможностях активных инструментов.</Typography></Box>}
                  labelPlacement="start"
                  control={<Switch checked={productTips} onChange={(event) => setProductTips(event.target.checked)} />}
                  sx={{ m: 0, py: 1.5, justifyContent: 'space-between', gap: 2 }}
                />
              </Stack>
            </Card>

            <Card sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6">Безопасность</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Пароль обновлялся недавно. Двухфакторная защита появится до первого релиза.
                  </Typography>
                </Box>
                <Button color="inherit" variant="outlined" startIcon={<Iconify icon="solar:lock-password-linear" />}>
                  Сменить пароль
                </Button>
              </Stack>
              <Alert severity="info" sx={{ mt: 2.5 }}>
                Это локальный прототип: данные сохраняются только в текущей сессии браузера.
              </Alert>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
