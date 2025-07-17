import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientTitle = styled('span')(({ theme }) => ({
  fontWeight: 800,
  fontSize: '4rem',
  display: 'inline-block',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  letterSpacing: '-0.02em',
  fontFamily: 'Inter, system-ui, sans-serif',
  [theme.breakpoints.down('md')]: {
    fontSize: '3.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '3rem',
  },
}));

const ReceiptIconCircum = ({ size = 46, ...props }) => {
  const style = {
    width: size,
    height: size,
    ...props.style
  };

  return (
  <svg
    {...props}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    style={style}
  >
    <defs>
      <linearGradient id="receipt-gradient" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      stroke="url(#receipt-gradient)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 15h5m-5-3h5m-5-3h5m-7.5-4.25v17.5a.25.25 0 0 0 .4.2l1.2-.9a1 1 0 0 1 1.2 0l1.2.9a1 1 0 0 0 1.2 0l1.2-.9a1 1 0 0 1 1.2 0l1.2.9a1 1 0 0 0 1.2 0l1.2-.9a.25.25 0 0 0 .4-.2V3.75A1.75 1.75 0 0 0 17.25 2h-10.5A1.75 1.75 0 0 0 5 3.75Z"
    />
  </svg>
);
};

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: '#FFFFFF',
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: 12,
  textTransform: 'none',
  boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${theme.palette.primary.main}60`,
  },
}));

const BackgroundGradient = styled(Box)(() => ({
  position: 'fixed',
  inset: 0,
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%)',
  pointerEvents: 'none',
  zIndex: -1,
}));

export default function Welcome() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/onboarding/group-expenses');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                px: 3,
            }}
        >
            <BackgroundGradient />

            {/* Main Content */}
            <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
                {/* Logo and Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                    <GradientTitle>Splitty</GradientTitle>
                    <ReceiptIconCircum />
                </Box>

                {/* Welcome Message */}
                <Typography
                    variant="h4"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        mb: 2,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                >
                    Welcome to Splitty
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 300,
                        mb: 6,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        lineHeight: 1.6,
                    }}
                >
                    The smart way to split bills and manage group expenses.
                    Simple, fast, and intelligent.
                </Typography>

                {/* Get Started Button */}
                <GradientButton
                    onClick={handleGetStarted}
                    size="large"
                >
                    Get Started
                </GradientButton>
            </Box>
        </Box>
    );
} 