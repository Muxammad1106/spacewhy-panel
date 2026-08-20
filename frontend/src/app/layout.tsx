// i18n
import 'src/locales/i18n';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// map
import 'mapbox-gl/dist/mapbox-gl.css';

// editor
import 'react-quill/dist/quill.snow.css';

// slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

import { Suspense } from 'react';

// locales
import { LocalizationProvider } from 'src/locales';
// theme
import ThemeProvider from 'src/theme';
import { primaryFont } from 'src/theme/typography';
import { SPACEWHY_BRAND } from 'src/brand/brand-config';
// components
import ProgressBar from 'src/components/progress-bar';
import MotionLazy from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { LazySettingsDrawer, SettingsProvider } from 'src/components/settings';
// auth
import { AuthProvider } from 'src/auth/context/jwt';
// import { AuthProvider } from 'src/auth/context/auth0';
// import { AuthProvider } from 'src/auth/context/amplify';
// import { AuthProvider } from 'src/auth/context/firebase';

// ----------------------------------------------------------------------

export const metadata = {
  title: SPACEWHY_BRAND.productName,
  description:
    'Space Drop — коллекция полезных инструментов Spacewhy для ежедневных задач.',
  keywords: 'space drop,spacewhy,tools,productivity,liquid glass,dashboard',
  themeColor: '#020203',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        type: 'image/png',
        sizes: '512x512',
        url: '/brand/spacewhy/logo.png',
      },
    ],
    apple: [
      {
        type: 'image/png',
        sizes: '512x512',
        url: '/brand/spacewhy/logo.png',
      },
    ],
    shortcut: '/brand/spacewhy/logo.png',
  },
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ru" className={primaryFont.className}>
      <body>
        <AuthProvider>
          <LocalizationProvider>
            <SettingsProvider
              defaultSettings={{
                themeMode: 'dark', // 'light' | 'dark'
                themeDirection: 'ltr', //  'rtl' | 'ltr'
                themeContrast: 'default', // 'default' | 'bold'
                themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
                themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
                themeStretch: false,
                glassIntensity: 78,
                glassTransparency: 58,
                glassLiquidity: 82,
              }}
            >
              <ThemeProvider>
                <MotionLazy>
                  <SnackbarProvider>
                    <LazySettingsDrawer />
                    <Suspense fallback={null}>
                      <ProgressBar />
                    </Suspense>
                    {children}
                  </SnackbarProvider>
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
