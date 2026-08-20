'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { alpha } from '@mui/material/styles';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { liquidGlass } from 'src/theme/css';
import { FIRST_DROP } from '../data';
import SpaceDropLogo from '../components/space-drop-logo';
import { requestPhoneChallenge, verifyPhoneChallenge } from './space-drop-auth-api';

type AuthStage = 'phone' | 'code';
type FormValues = { phone: string; code: string };
const authBotUrl = process.env.NEXT_PUBLIC_SPACE_DROP_AUTH_BOT_URL;

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
  return 'Не удалось связаться с ботом. Попробуйте ещё раз.';
}

export default function SpaceDropAuthView() {
  const auth = useAuthContext();
  const router = useRouter();
  const [stage, setStage] = useState<AuthStage>('phone');
  const [challengeId, setChallengeId] = useState('');
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
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;
  const phone = watch('phone');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const challenge = params.get('challenge');
    const phoneFromLink = params.get('phone');
    if (challenge) setChallengeId(challenge);
    if (challenge && code && /^\d{6}$/.test(code)) {
      reset({ phone: phoneFromLink || '+998 ', code });
      setStage('code');
      return;
    }
    if (phoneFromLink) setValue('phone', phoneFromLink, { shouldValidate: false });
  }, [reset, setValue]);

  const changePhone = useCallback(() => {
    setStage('phone');
    setChallengeId('');
    setErrorMessage('');
    resetField('code');
    clearErrors();
  }, [clearErrors, resetField]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setErrorMessage('');
        if (stage === 'phone') {
          const challenge = await requestPhoneChallenge(values.phone);
          setChallengeId(challenge.challenge_id);
          setStage('code');
          clearErrors();
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
        router.replace(paths.dashboard.root);
      } catch (error) {
        setErrorMessage(authErrorMessage(error));
      }
    },
    [auth, challengeId, clearErrors, router, stage]
  );

  const resendCode = useCallback(async () => {
    try {
      setIsResending(true);
      setErrorMessage('');
      const challenge = await requestPhoneChallenge(phone);
      setChallengeId(challenge.challenge_id);
      resetField('code');
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }, [phone, resetField]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100svh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(420px, 0.78fr) minmax(520px, 1.22fr)' },
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(circle at 85% 20%, ${alpha(
            theme.palette.common.white,
            0.1
          )}, transparent 28%)`,
      }}
    >
      <Stack sx={{ p: { xs: 2.5, sm: 5, md: 7 }, minHeight: '100svh' }}>
        <SpaceDropLogo disabledLink />
        <Stack justifyContent="center" sx={{ flex: 1, width: 1, maxWidth: 480, mx: 'auto', py: 6 }}>
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
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 3.5 }}
          >
            {[0, 1].map((index) => (
              <Box
                key={index}
                sx={(theme) => ({
                  height: 2,
                  borderRadius: 999,
                  bgcolor:
                    index === 0 || stage === 'code'
                      ? alpha(theme.palette.common.white, 0.78)
                      : alpha(theme.palette.common.white, 0.12),
                  transition: 'background-color 240ms ease',
                })}
              />
            ))}
          </Box>
          <Typography variant="h3" sx={{ letterSpacing: '-0.035em' }}>
            {stage === 'phone' ? 'Войдите в Space Drop' : 'Введите код из Telegram'}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, mb: 3.5, maxWidth: 430 }}
          >
            {stage === 'phone'
              ? 'Введите номер телефона. Код для входа придёт сообщением от Telegram-бота.'
              : `Код отправлен в Telegram для номера ${phone.trim() || '+998'}. Если это первый вход, сначала поделитесь своим контактом с ботом.`}
          </Typography>

          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.25}>
              {!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              {stage === 'phone' ? (
                <>
                  <RHFTextField
                    name="phone"
                    label="Номер телефона"
                    type="tel"
                    autoComplete="tel"
                    inputProps={{ inputMode: 'tel' }}
                    helperText="Например: +998 90 123 45 67"
                  />
                  <Box
                    sx={(theme) => ({
                      ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      minHeight: 68,
                      px: 2,
                      py: 1.25,
                    })}
                  >
                    <Box
                      sx={(theme) => ({
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                      })}
                    >
                      <Iconify icon="mingcute:telegram-line" width={22} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Код придёт в Telegram</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Отдельный Telegram-логин не нужен
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={(theme) => ({
                      ...liquidGlass({ theme, blurred: true, blurStrength: 'control' }),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      minHeight: 68,
                      px: 2,
                      py: 1.25,
                    })}
                  >
                    <Iconify icon="mingcute:telegram-line" width={24} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2">Проверьте Telegram</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Не получили код? Откройте бота, поделитесь контактом и отправьте код ещё раз
                      </Typography>
                    </Box>
                  </Box>
                  <RHFTextField
                    name="code"
                    label="Код из Telegram"
                    autoFocus
                    autoComplete="one-time-code"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                    helperText="6 цифр"
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
                  ...liquidGlass({
                    theme,
                    blurred: true,
                    blurStrength: 'control',
                    interactive: true,
                  }),
                  minHeight: 56,
                  color: 'text.primary',
                  touchAction: 'manipulation',
                })}
              >
                {stage === 'phone' ? 'Получить код в Telegram' : 'Войти'}
              </LoadingButton>
              {stage === 'code' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1}>
                  {authBotUrl && (
                    <Button
                      component="a"
                      href={authBotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="inherit"
                      startIcon={<Iconify icon="mingcute:telegram-line" />}
                      sx={{ minHeight: 44, color: 'text.secondary' }}
                    >
                      Открыть бота
                    </Button>
                  )}
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
                    sx={{ minHeight: 44, color: 'text.secondary' }}
                  >
                    Отправить код ещё раз
                  </Button>
                  <Button
                    type="button"
                    color="inherit"
                    onClick={changePhone}
                    startIcon={<Iconify icon="solar:arrow-left-linear" />}
                    sx={{ minHeight: 44, color: 'text.secondary' }}
                  >
                    Изменить номер
                  </Button>
                </Stack>
              )}
            </Stack>
          </FormProvider>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            Продолжая, вы принимаете условия использования и политику конфиденциальности.
          </Typography>
        </Stack>
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
              `radial-gradient(circle at 50% 30%, ${alpha(
                theme.palette.common.white,
                0.16
              )}, transparent 32%)`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="overline" color="text.secondary">
              ПЕРВЫЙ DROP
            </Typography>
            <Chip label={FIRST_DROP.release.toUpperCase()} size="small" variant="outlined" />
          </Stack>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 180,
                height: 180,
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
              <Iconify icon={FIRST_DROP.icon} width={54} />
            </Box>
            <Typography variant="h2" sx={{ mt: 1 }}>
              {FIRST_DROP.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, mx: 'auto', maxWidth: 440 }}>
              {FIRST_DROP.summary}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <Iconify icon="solar:lock-keyhole-minimalistic-linear" width={18} />
            <Typography variant="caption">Вход открывает панель Space Drop</Typography>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
