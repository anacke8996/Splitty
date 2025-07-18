import { useState } from 'react';
import { useRouter } from 'next/router';
import ReceiptProcessor from '../components/ReceiptProcessor';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  useTheme, 
  IconButton, 
  Fab,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

// Keyframe animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.6;
  }
`

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

// Styled components
const AnimatedContainer = styled(Box)(({ theme }) => ({
  minHeight: 'max(100vh, 100dvh)',
  height: 'max(100vh, 100dvh)',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}))

const BackgroundElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
  filter: 'blur(60px)',
  animation: `${pulse} 4s ease-in-out infinite`,
  pointerEvents: 'none',
}))

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(59, 130, 246, 0.3)',
  animation: `${bounce} 3s ease-in-out infinite`,
  pointerEvents: 'none',
}))

const ContentContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  maxWidth: 600,
  animation: `${slideIn} 1s ease-out`,
  position: 'relative',
  zIndex: 2,
}))

const GradientTitle = styled('span')(({ theme }) => ({
  fontWeight: 800,
  fontSize: '4rem',
  display: 'inline-block',
  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
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

const BottomNavContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: theme.spacing(0, 3),
}));

const BottomNavContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(5),
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '32px',
  padding: theme.spacing(2, 4),
  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.1)',
  animation: `${fadeInUp} 0.8s ease-out 0.3s both`,
  width: 'auto',
  minWidth: '320px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
    borderRadius: '32px',
    pointerEvents: 'none',
  },
}));

const GradientFab = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  color: '#FFFFFF',
  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2)',
  width: 60,
  height: 60,
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -2,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '50%',
    opacity: 0.3,
    filter: 'blur(8px)',
    zIndex: -1,
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 40px rgba(59, 130, 246, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3)',
    '&::before': {
      opacity: 0.5,
      filter: 'blur(12px)',
    },
  },
  '&:active': {
    transform: 'translateY(-1px)',
  },
}));

const NavIconButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  color: '#94a3b8',
  width: 48,
  height: 48,
  borderRadius: '16px',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(59, 130, 246, 0.15)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
    borderRadius: '16px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#f8fafc',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    '&::before': {
      opacity: 1,
    },
  },
}));

export default function MainApp() {
    const [imageData, setImageData] = useState(null);
    const [showProcessor, setShowProcessor] = useState(false);
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const router = useRouter();
    const { user, loading, signOut } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <AnimatedContainer>
                <CircularProgress sx={{ color: '#3b82f6' }} />
            </AnimatedContainer>
        );
    }

    // Redirect to welcome if not logged in
    if (!user) {
        router.push('/');
        return null;
    }

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                const base64Data = base64String.split(',')[1];
                setImageData(base64Data);
                setShowProcessor(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProcessingComplete = (results) => {
        console.log('Processing complete:', results);
        setImageData(null);
        setShowProcessor(false);
    };

    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchor(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
    };

    const handleSignOut = async () => {
        await signOut();
        handleProfileMenuClose();
        router.push('/');
    };

    const handleHistoryClick = () => {
        router.push('/history');
    };

    if (showProcessor && imageData) {
        return (
            <ReceiptProcessor
                imageData={imageData}
                onComplete={handleProcessingComplete}
            />
        );
    }

    return (
        <AnimatedContainer>
            {/* Animated Background Elements */}
            <BackgroundElement
                sx={{
                    width: '320px',
                    height: '320px',
                    top: '-10%',
                    right: '-10%',
                    animationDelay: '0s',
                }}
            />
            <BackgroundElement
                sx={{
                    width: '320px',
                    height: '320px',
                    bottom: '-10%',
                    left: '-10%',
                    animationDelay: '1s',
                }}
            />
            <BackgroundElement
                sx={{
                    width: '128px',
                    height: '128px',
                    top: '25%',
                    left: '25%',
                    animationDelay: '0.5s',
                }}
            />

            {/* Floating Dots */}
            <FloatingElement sx={{ top: '20%', left: '10%', width: '8px', height: '8px', animationDelay: '0.3s' }} />
            <FloatingElement sx={{ top: '40%', right: '16%', width: '4px', height: '4px', animationDelay: '0.7s' }} />
            <FloatingElement sx={{ bottom: '32%', right: '20%', width: '6px', height: '6px', animationDelay: '1s' }} />

            {/* Main Content */}
            <ContentContainer>
                {/* Logo and Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                    <GradientTitle>Splitty</GradientTitle>
                    <ReceiptIconCircum />
                </Box>

                {/* Welcome Message */}
                <Typography
                    variant="h6"
                    sx={{
                        color: '#94a3b8',
                        fontWeight: 300,
                        mb: 4,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                >
                    Ready to split your bills with ease
                </Typography>

                {/* Instructions */}
                <Typography
                    variant="body1"
                    sx={{
                        color: '#64748b',
                        fontSize: '1rem',
                    }}
                >
                    Tap the plus button to upload a receipt and get started
                </Typography>
            </ContentContainer>

            {/* Bottom Navigation */}
            <BottomNavContainer>
                <BottomNavContent>
                    <Tooltip title="Saved Receipts" arrow>
                        <NavIconButton onClick={handleHistoryClick}>
                            <ReceiptIcon sx={{ fontSize: '1.3rem' }} />
                        </NavIconButton>
                    </Tooltip>

                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="receipt-upload"
                        type="file"
                        onChange={handleImageUpload}
                    />
                    <Tooltip title="New Receipt" arrow>
                        <label htmlFor="receipt-upload" style={{ cursor: 'pointer' }}>
                            <GradientFab component="span">
                                <AddIcon sx={{ fontSize: '1.6rem' }} />
                            </GradientFab>
                        </label>
                    </Tooltip>

                    <Tooltip title="Profile" arrow>
                        <NavIconButton onClick={handleProfileMenuOpen}>
                            <AccountCircleIcon sx={{ fontSize: '1.3rem' }} />
                        </NavIconButton>
                    </Tooltip>
                </BottomNavContent>
            </BottomNavContainer>

            {/* Profile Menu */}
            <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                PaperProps={{
                    sx: {
                        mt: -1,
                        minWidth: 200,
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(71, 85, 105, 0.5)',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        '& .MuiMenuItem-root': {
                            color: '#f8fafc',
                            '&:hover': {
                                background: 'rgba(51, 65, 85, 0.5)',
                            },
                            '&.Mui-disabled': {
                                color: '#94a3b8',
                                background: 'transparent',
                            },
                        },
                    }
                }}
            >
                <MenuItem disabled>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={user?.email} 
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                        }}
                    />
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                </MenuItem>
                <MenuItem onClick={handleHistoryClick}>
                    <ListItemIcon>
                        <ReceiptIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="View History" />
                </MenuItem>
            </Menu>
        </AnimatedContainer>
    );
} 