import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import Logo from 'src/components/logo';
import { RouterLink } from 'src/routes/components';
import { secondaryFont } from 'src/theme/typography';

type Props = {
  compact?: boolean;
  disabledLink?: boolean;
  sx?: SxProps<Theme>;
};

export default function SpaceDropLogo({ compact = false, disabledLink = false, sx }: Props) {
  const content = (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Logo disabledLink sx={{ width: 34, height: 34 }} />

      {!compact && (
        <Box>
          <Typography
            component="span"
            suppressHydrationWarning
            sx={{
              display: 'block',
              fontFamily: secondaryFont.style.fontFamily,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.16em',
              lineHeight: 1.1,
            }}
          >
            SPACE DROP
          </Typography>
          <Typography
            component="span"
            suppressHydrationWarning
            variant="caption"
            sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}
          >
            by Space Why
          </Typography>
        </Box>
      )}
    </Stack>
  );

  if (disabledLink) {
    return (
      <Box sx={sx}>
        {content}
      </Box>
    );
  }

  return (
    <Link
      component={RouterLink}
      href="/"
      color="inherit"
      underline="none"
      aria-label="Space Drop — на главную"
      sx={{ display: 'inline-flex', ...sx }}
    >
      {content}
    </Link>
  );
}
