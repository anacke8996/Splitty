import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e11d48',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2563eb',
      contrastText: '#fff',
    },
    background: {
      default: '#F9FAFB',
      paper: '#fff',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
    },
    divider: '#e5e7eb',
    error: {
      main: '#e11d48',
    },
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e42',
    },
    info: {
      main: '#2563eb',
    },
    purple: {
      main: '#7c3aed',
      light: '#ede9fe',
      dark: '#5b21b6',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: 'Inter, Lato, system-ui, -apple-system, sans-serif',
    fontSize: 18,
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      color: '#e11d48',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#e11d48',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#e11d48',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#e11d48',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#e11d48',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#e11d48',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#6B7280',
    },
    subtitle2: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: '#6B7280',
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
      color: '#1A1A1A',
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#6B7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      color: '#fff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '1.1rem',
          fontWeight: 700,
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontSize: '1.05rem',
          padding: '0 16px',
        },
      },
    },
  },
});

export default theme; 