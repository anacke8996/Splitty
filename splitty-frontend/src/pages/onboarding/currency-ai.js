import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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

const FeatureIconContainer = styled(Box)(({ theme }) => ({
  background: `${theme.palette.success.main}20`,
  padding: theme.spacing(3),
  borderRadius: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 4,
  mx: 'auto',
  width: 120,
  height: 120,
}));

export default function CurrencyAI() {
    const router = useRouter();
    const theme = useTheme();

    const handleNext = () => {
        router.push('/onboarding/instant-settlements');
    };

    const handleSkip = () => {
        router.push('/auth');
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
                {/* Icon */}
                <FeatureIconContainer>
                    <AttachMoneyIcon sx={{ color: theme.palette.success.main, fontSize: 60 }} />
                </FeatureIconContainer>

                {/* Title */}
                <Typography
                    variant="h3"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 700,
                        mb: 3,
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                    }}
                >
                    Convert to Any Currency with AI
                </Typography>

                {/* Description */}
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
                    AI-powered currency detection and conversion. 
                    Automatically converts receipts to your preferred currency for seamless splitting.
                </Typography>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        onClick={handleSkip}
                        variant="outlined"
                        sx={{
                            borderColor: 'text.secondary',
                            color: 'text.secondary',
                            padding: '16px 32px',
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: 'text.primary',
                                color: 'text.primary',
                            }
                        }}
                    >
                        Skip
                    </Button>
                    <GradientButton
                        onClick={handleNext}
                        size="large"
                    >
                        Next
                    </GradientButton>
                </Box>
            </Box>
        </Box>
    );
} 