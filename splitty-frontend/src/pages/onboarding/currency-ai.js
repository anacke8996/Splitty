import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button,
  useTheme
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
  minHeight: '100vh',
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
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
  position: 'relative',
  zIndex: 2,
}));

const IconPulse = styled(Box)({
  position: 'absolute',
  inset: 0,
  width: 96,
  height: 96,
  background: '#34d399',
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
    background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)',
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

const FeatureItem = styled(Box)(({ isVisible }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  position: 'absolute',
  transition: 'all 0.5s ease',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
}));

const FeatureHighlight = styled(Box)(({ delay }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: '0.875rem',
  color: '#94a3b8',
  transition: 'all 0.5s ease',
  animationDelay: `${delay}ms`,
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

const OutlineButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  border: '1px solid #475569',
  color: '#cbd5e1',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: 12,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(30, 41, 59, 0.5)',
    borderColor: '#64748b',
    color: '#f1f5f9',
  },
}));

const ProgressDot = styled(Box)(({ isActive }) => ({
  width: isActive ? 24 : 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: isActive ? '#3b82f6' : '#475569',
  transition: 'all 0.3s ease',
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

export default function CurrencyAI() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const router = useRouter();

    const features = [
        "Auto-detect currencies",
        "Real-time conversion rates",
        "Multi-currency support",
        "AI-powered accuracy"
    ];

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleNext = () => {
        router.push('/onboarding/instant-settlements');
    };

    const handleSkip = () => {
        router.push('/auth');
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
                        <AttachMoneyIcon sx={{ fontSize: 48, color: '#ffffff' }} />
                    </IconBackground>
                    <IconPulse />
                </MainIconContainer>

                {/* Title with enhanced typography */}
                <Box sx={{ mb: 4 }}>
                    <GradientTitle>
                        Currency <span className="gradient-text">AI</span>
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
                        AI-powered currency detection and conversion. Automatically converts receipts to your preferred currency for seamless splitting.
                    </Typography>

                    {/* Feature highlights */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        {["Auto currency detection", "Real-time rates", "100+ currencies", "Smart conversion"].map(
                            (feature, index) => (
                                <FeatureHighlight key={index} delay={index * 100}>
                                    <Box
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            bgcolor: '#34d399',
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <Typography sx={{ fontSize: '0.875rem' }}>
                                        {feature}
                                    </Typography>
                                </FeatureHighlight>
                            )
                        )}
                    </Box>
                </Box>

                {/* Enhanced buttons */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
                    <OutlineButton
                        onClick={handleSkip}
                        sx={{ flex: 1 }}
                    >
                        Skip
                    </OutlineButton>

                    <GradientButton
                        onClick={handleNext}
                        sx={{ flex: 1 }}
                    >
                        Next
                        <ArrowForwardIcon className="arrow-icon" sx={{ ml: 1, fontSize: 16 }} />
                    </GradientButton>
                </Box>

                {/* Progress indicator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {[0, 1, 2].map((step) => (
                        <ProgressDot key={step} isActive={step === 1} />
                    ))}
                </Box>
            </Box>
        </AnimatedContainer>
    );
} 