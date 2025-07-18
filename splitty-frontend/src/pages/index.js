import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button,
  useTheme
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

// Styled Components
const AnimatedContainer = styled(Box)(({ theme }) => ({
  minHeight: 'max(100vh, 100dvh)',
  height: 'max(100vh, 100dvh)',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
}));

const BackgroundElement = styled(Box)(({ delay = 0 }) => ({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(60px)',
  animation: `${pulse} 3s ease-in-out infinite`,
  animationDelay: `${delay}s`,
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
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#ffffff" />
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

const MainIconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 96,
  height: 96,
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  '&:hover': {
    transform: 'scale(1.05) rotate(3deg)',
    transition: 'all 0.5s ease',
  },
}));

const IconBackground = styled(Box)(({ theme }) => ({
  width: 96,
  height: 96,
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
  position: 'relative',
  zIndex: 2,
}));

const IconPulse = styled(Box)({
  position: 'absolute',
  inset: 0,
  width: 96,
  height: 96,
  background: '#60a5fa',
  borderRadius: 16,
  animation: `${pulse} 2s ease-in-out infinite`,
  opacity: 0.2,
});

const GradientTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  color: '#ffffff',
  lineHeight: 1.2,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  '& .gradient-text': {
    background: 'linear-gradient(90deg, #60a5fa 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
}));

const FeatureShowcase = styled(Box)({
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: 16,
});

const FeatureItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})(({ isVisible }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  position: 'absolute',
  transition: 'all 0.5s ease',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
  color: '#ffffff',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: 12,
  textTransform: 'none',
  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px -5px rgba(59, 130, 246, 0.35)',
  },
  '& .arrow-icon': {
    transition: 'transform 0.3s ease',
  },
  '&:hover .arrow-icon': {
    transform: 'translateX(4px)',
  },
}));

const FloatingElement = styled(Box)(({ delay = 0, size = 8, color = '#60a5fa' }) => ({
  position: 'absolute',
  width: size,
  height: size,
  backgroundColor: color,
  borderRadius: '50%',
  animation: `${bounce} 2s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

export default function Welcome() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const router = useRouter();

    const features = [
        "Smart bill splitting",
        "AI-powered receipts", 
        "Instant settlements",
        "Multi-currency support"
    ];

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleGetStarted = () => {
        router.push('/onboarding/group-expenses');
    };

    return (
        <AnimatedContainer>
            {/* Animated background elements */}
            <BackgroundElement
                sx={{
                    top: -160,
                    right: -160,
                    width: 320,
                    height: 320,
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                }}
            />
            <BackgroundElement
                sx={{
                    bottom: -160,
                    left: -160,
                    width: 320,
                    height: 320,
                    bgcolor: 'rgba(168, 85, 247, 0.1)',
                }}
                delay={1}
            />
            <BackgroundElement
                sx={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 384,
                    height: 384,
                    bgcolor: 'rgba(59, 130, 246, 0.05)',
                }}
                delay={0.5}
            />

            {/* Floating elements */}
            <FloatingElement
                sx={{ top: '20%', left: '10%' }}
                size={8}
                color="rgba(96, 165, 250, 0.3)"
                delay={0.3}
            />
            <FloatingElement
                sx={{ top: '40%', right: '16%' }}
                size={4}
                color="rgba(168, 85, 247, 0.4)"
                delay={0.7}
            />
            <FloatingElement
                sx={{ bottom: '32%', left: '20%' }}
                size={6}
                color="rgba(96, 165, 250, 0.2)"
                delay={1}
            />

            <Box
                sx={{
                    maxWidth: 448,
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 10,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
                    transition: 'all 1s ease',
                }}
            >
                {/* Main Icon with animation */}
                <MainIconContainer>
                    <IconBackground>
                        <ReceiptIconCircum size={48} />
                    </IconBackground>
                    <IconPulse />
                </MainIconContainer>

                {/* Title with enhanced typography */}
                <Box sx={{ mb: 4 }}>
                    <GradientTitle>
                        Welcome to <span className="gradient-text">Splitty</span>
                    </GradientTitle>

                    {/* Dynamic feature showcase */}
                    <FeatureShowcase>
                        {features.map((feature, index) => (
                            <FeatureItem key={index} isVisible={currentFeature === index}>
                                <Typography
                                    sx={{
                                        color: '#bfdbfe',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {feature}
                                </Typography>
                            </FeatureItem>
                        ))}
                    </FeatureShowcase>
                </Box>

                {/* Enhanced description */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        sx={{
                            color: '#cbd5e1',
                            fontSize: '1.125rem',
                            lineHeight: 1.7,
                            mb: 3,
                        }}
                    >
                        The smart way to split bills and manage group expenses. Simple, fast, and intelligent.
                    </Typography>
                </Box>

                {/* Enhanced button */}
                <Box sx={{ mb: 4 }}>
                    <GradientButton
                        onClick={handleGetStarted}
                        sx={{ minWidth: 200 }}
                    >
                        Get Started
                        <ArrowForwardIcon className="arrow-icon" sx={{ ml: 1, fontSize: 16 }} />
                    </GradientButton>
                </Box>
            </Box>
        </AnimatedContainer>
    );
} 