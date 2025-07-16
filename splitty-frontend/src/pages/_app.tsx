import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { Box } from '@mui/material';
import createEmotionCache from '../config/createEmotionCache';
import theme from '../theme';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <Box sx={{ 
            backgroundColor: 'background.default',
            minHeight: '100vh',
            color: 'text.primary',
            width: '100%'
          }}>
            <Component {...pageProps} />
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 