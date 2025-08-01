import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { Box } from '@mui/material';
import createEmotionCache from '../config/createEmotionCache';
import theme from '../theme';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import Head from 'next/head';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </Head>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <CssBaseline />
            <Box sx={{ 
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
              minHeight: 'max(100vh, 100dvh)',
              height: 'max(100vh, 100dvh)',
              color: 'text.primary',
              width: '100%'
            }}>
              <Component {...pageProps} />
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
} 