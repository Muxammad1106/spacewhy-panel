'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, Theme } from '@mui/material/styles';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { FIRST_DROP } from '../data';
import SpaceDropLogo from '../components/space-drop-logo';
import {
  buildAuthBotDeepLink,
  requestPhoneChallenge,
  verifyPhoneChallenge,
} from './space-drop-auth-api';

type AuthStage = 'phone' | 'code';
type FormValues = { phone: string; code: string };

const authBotUrl =
  process.env.NEXT_PUBLIC_SPACE_DROP_AUTH_BOT_URL || 'https://t.me/Auth_Spacewhy_bot';
const startParameterPattern = /^login_[0-9a-f]{32}$/;

const PhoneSchema = Yup.object({
  phone: Yup.string()
    .required('Введите номер телефона')
    .matches(/^\+?[0-9()\-\s]{7,20}$/, 'Проверьте номер телефона'),
  code: Yup.string().defined(),
});

const CodeSchema = Yup.object({
  phone: Yup.string().required(),
  code: Yup.string()
    .required('Введите код из Telegram')
    .matches(/^\d{6}$/, 'Введите 6 цифр'),
});

function authErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message.toLowerCase() : '';
  if (code.includes('rate_limited') || code.endsWith('_429')) {
    return 'Слишком много попыток. Подождите немного и попробуйте снова.';
  }
  if (code.includes('attempts_exhausted')) return 'Попытки закончились. Запросите новый код.';
  if (code.includes('invalid_or_expired')) {
    return 'Код неверный или уже истёк. Проверьте код либо запросите новый.';
  }
  return 'Не удалось продолжить вход. Проверьте соединение и попробуйте ещё раз.';
}

function saveChallengeToUrl(challengeId: string, startParameter: string, phone: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('challenge', challengeId);
  url.searchParams.set('start', startParameter);
  url.searchParams.set('phone', phone);
  url.searchParams.delete('code');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function clearChallengeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('challenge');
  url.searchParams.delete('start');
  url.searchParams.delete('phone');
  url.searchParams.delete('code');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    borderRadius: 1.5,
    bgcolor: (theme: Theme) => alpha(theme.palette.common.white, 0.035),
    '&:hover': { bgcolor: (theme: Theme) => alpha(theme.palette.common.white, 0.055) },
    '&.Mui-focused': { bgcolor: (theme: Theme) => alpha(theme.palette.common.white, 0.055) },
  },
};

export default function SpaceDropAuthView() {
  const auth = useAuthContext();
  const router = useRouter();
  const [stage, setStage] = useState<AuthStage>('phone');
  const [challengeId, setChallengeId] = useState('');
  const [startParameter, setStartParameter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const methods = useForm<FormValues>({
    resolver: yupResolver(stage === 'phone' ? PhoneSchema : CodeSchema),
    defaultValues: { phone: '+998 ', code: '' },
  });
  const {
    clearErrors,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { isSubmitting },
  } = methods;
  const phone = watch('phone');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challenge = params.get('challenge') || '';
    const start = params.get('start') || '';
    const phoneFromLink = params.get('phone') || '+998 ';
    const code = params.get('code') || '';
    if (!challenge || !startParameterPattern.test(start)) return;

    setChallengeId(challenge);
    setStartParameter(start);
    setStage('code');
    reset({ phone: phoneFromLink, code: /^\d{6}$/.test(code) ? code : '' });
  }, [reset]);

  const botDeepLink = useMemo(() => {
    if (!startParameterPattern.test(startParameter)) return '';
    return buildAuthBotDeepLink(authBotUrl, startParameter);
  }, [startParameter]);

  const openChallengeInTelegram = useCallback((deepLink: string) => {
    window.location.assign(deepLink);
  }, []);

  const beginChallenge = useCallback(
    async (phoneNumber: string) => {
      const challenge = await requestPhoneChallenge(phoneNumber);
      const deepLink = buildAuthBotDeepLink(authBotUrl, challenge.telegram_start_parameter);
      setChallengeId(challenge.challenge_id);
      setStartParameter(challenge.telegram_start_parameter);
      setStage('code');
      clearErrors();
      resetField('code');
      saveChallengeToUrl(
        challenge.challenge_id,
        challenge.telegram_start_parameter,
        phoneNumber
      );
      openChallengeInTelegram(deepLink);
    },
    [clearErrors, openChallengeInTelegram, resetField]
  );

  const changePhone = useCallback(() => {
    setStage('phone');
    setChallengeId('');
    setStartParameter('');
    setErrorMessage('');
    resetField('code');
    clearErrors();
    clearChallengeFromUrl();
  }, [clearErrors, resetField]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setErrorMessage('');
        if (stage === 'phone') {
          await beginChallenge(values.phone);
          return;
        }
        if (!challengeId) throw new Error('identity_challenge_invalid_or_expired');
        const session = await verifyPhoneChallenge(challengeId, values.code);
        await auth.loginWithSession(session.access_token, {
          id: session.principal.id,
          displayName: session.principal.display_name || 'Пользователь Space Drop',
          phoneNumber: values.phone,
          locale: session.principal.locale,
          role: 'user',
          isPublic: false,
        });
        clearChallengeFromUrl();
        router.replace(paths.dashboard.root);
      } catch (error) {
        setErrorMessage(authErrorMessage(error));
      }
    },
    [auth, beginChallenge, challengeId, router, stage]
  );

  const resendCode = useCallback(async () => {
    try {
      setIsResending(true);
      setErrorMessage('');
      await beginChallenge(phone);
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }, [beginChallenge, phone]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(440px, 0.82fr) minmax(540px, 1.18fr)' },
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 12% 12%, ${alpha(
            theme.palette.common.white,
            0.07
          )}, transparent 27%)`,
      }}
    >
      <Stack
        sx={{
          minHeight: '100dvh',
          p: { xs: 2, sm: 4, md: 6 },
          pb: { xs: 'max(20px, env(safe-area-inset-bottom))', sm: 4, md: 6 },
        }}
      >
        <SpaceDropLogo disabledLink />

        <Card
          elevation={0}
          sx={(theme) => ({
            width: 1,
            maxWidth: 480,
            mx: 'auto',
            my: 'auto',
            p: { xs: 2.25, sm: 3.5 },
            borderRadius: { xs: 2, sm: 2.5 },
            bgcolor: { xs: alpha(theme.palette.common.white, 0.025), sm: 'transparent' },
            border: { xs: `1px solid ${alpha(theme.palette.common.white, 0.09)}`, sm: 'none' },
            boxShadow: 'none',
          })}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="overline" color="text.secondary">
              ВХОД В SPACE DROP
            </Typography>
            <Typography variant="overline" color="text.secondary">
              {stage === 'phone' ? '01 / 02' : '02 / 02'}
            </Typography>
          </Stack>

          <Box
            aria-hidden="true"
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 3 }}
          >
            {[0, 1].map((index) => (
              <Box
                key={index}
                sx={(theme) => ({
                  height: 2,
                  borderRadius: 999,
                  bgcolor:
                    index === 0 || stage === 'code'
                      ? alpha(theme.palette.common.white, 0.82)
                      : alpha(theme.palette.common.white, 0.12),
                  transition: 'background-color 180ms ease',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                })}
              />
            ))}
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 30, sm: 38 },
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: '-0.035em',
            }}
          >
            {stage === 'phone' ? 'Войдите по номеру' : 'Код из Telegram'}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.25, mb: 3, lineHeight: 1.6 }}>
            {stage === 'phone'
              ? 'Введите номер — мы откроем Auth.Spacewhy и привяжем запрос к вашему Telegram.'
              : `Откройте Auth.Spacewhy, подтвердите свой контакт и введите полученный код для ${
                  phone.trim() || '+998'
                }.`}
          </Typography>

          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              {!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              {stage === 'phone' ? (
                <RHFTextField
                  name="phone"
                  label="Номер телефона"
                  type="tel"
                  autoComplete="tel"
                  inputProps={{ inputMode: 'tel' }}
                  helperText="Например: +998 90 123 45 67"
                  sx={fieldSx}
                />
              ) : (
                <>
                  <Box
                    sx={(theme) => ({
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr',
                      gap: 1.5,
                      alignItems: 'start',
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.common.white, 0.045),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    })}
                  >
                    <Box
                      sx={(theme) => ({
                        width: 40,
                        height: 40,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.common.white, 0.08),
                      })}
                    >
                      <Iconify icon="mingcute:telegram-line" width={22} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Два коротких шага</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        1. Нажмите «Открыть Auth.Spacewhy» и отправьте свой контакт.
                        <br />
                        2. Вернитесь сюда с шестизначным кодом.
                      </Typography>
                    </Box>
                  </Box>

                  {!!botDeepLink && (
                    <Button
                      fullWidth
                      type="button"
                      variant="outlined"
                      color="inherit"
                      onClick={() => openChallengeInTelegram(botDeepLink)}
                      startIcon={<Iconify icon="mingcute:telegram-line" />}
                      sx={(theme) => ({
                        minHeight: 50,
                        color: theme.palette.common.white,
                        bgcolor: 'transparent',
                        borderColor: alpha(theme.palette.common.white, 0.2),
                        touchAction: 'manipulation',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.06),
                          borderColor: alpha(theme.palette.common.white, 0.36),
                        },
                      })}
                    >
                      Открыть Auth.Spacewhy
                    </Button>
                  )}

                  <RHFTextField
                    name="code"
                    label="Код из Telegram"
                    autoFocus
                    autoComplete="one-time-code"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                    helperText="6 цифр"
                    sx={{
                      ...fieldSx,
                      '& input': {
                        fontSize: 24,
                        letterSpacing: '0.28em',
                        fontVariantNumeric: 'tabular-nums',
                      },
                    }}
                  />
                </>
              )}

              <LoadingButton
                fullWidth
                type="submit"
                size="large"
                variant="contained"
                color="inherit"
                loading={isSubmitting}
                endIcon={
                  <Iconify
                    icon={stage === 'phone' ? 'mingcute:telegram-line' : 'solar:arrow-right-linear'}
                  />
                }
                sx={(theme) => ({
                  minHeight: 54,
                  bgcolor: theme.palette.common.white,
                  color: theme.palette.common.black,
                  fontWeight: 700,
                  touchAction: 'manipulation',
                  '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.86) },
                })}
              >
                {stage === 'phone' ? 'Продолжить в Telegram' : 'Войти в панель'}
              </LoadingButton>

              {stage === 'code' && (
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Button
                    type="button"
                    color="inherit"
                    disabled={isResending}
                    onClick={resendCode}
                    startIcon={
                      <Iconify
                        icon={isResending ? 'svg-spinners:ring-resize' : 'solar:refresh-linear'}
                      />
                    }
                    sx={{ minHeight: 44, color: 'text.secondary', px: 1 }}
                  >
                    Новый код
                  </Button>
                  <Button
                    type="button"
                    color="inherit"
                    onClick={changePhone}
                    startIcon={<Iconify icon="solar:arrow-left-linear" />}
                    sx={{ minHeight: 44, color: 'text.secondary', px: 1 }}
                  >
                    Другой номер
                  </Button>
                </Stack>
              )}
            </Stack>
          </FormProvider>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Авторизация проходит только через официального бота Auth.Spacewhy.
          </Typography>
        </Card>
      </Stack>

      <Box sx={{ display: { xs: 'none', md: 'grid' }, p: 2.5, pl: 0 }}>
        <Card
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            backgroundImage: (theme) =>
              `radial-gradient(circle at 50% 32%, ${alpha(
                theme.palette.common.white,
                0.16
              )}, transparent 34%)`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="overline" color="text.secondary">
              ПЕРВЫЙ SPACE DROP
            </Typography>
            <Chip label={FIRST_DROP.release.toUpperCase()} size="small" variant="outlined" />
          </Stack>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 168,
                height: 168,
                mx: 'auto',
                mb: 4,
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                placeItems: 'center',
                boxShadow: (theme) => `0 0 100px ${alpha(theme.palette.common.white, 0.08)}`,
              }}
            >
              <Iconify icon={FIRST_DROP.icon} width={52} />
            </Box>
            <Typography variant="h2">{FIRST_DROP.name}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, mx: 'auto', maxWidth: 440 }}>
              {FIRST_DROP.summary}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <Iconify icon="solar:lock-keyhole-minimalistic-linear" width={18} />
            <Typography variant="caption">Один вход для панели и всех Space Drop</Typography>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
