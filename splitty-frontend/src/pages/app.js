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
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

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

const BottomNavContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(8px)',
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3, 0),
  zIndex: 1000,
}));

const BottomNavContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(4),
}));

const GradientFab = styled(Fab)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: '#FFFFFF',
  boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
  width: 64,
  height: 64,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${theme.palette.primary.main}60`,
  },
  '&:active': {
    transform: 'translateY(0px)',
  },
}));

const NavIconButton = styled(IconButton)(({ theme }) => ({
  background: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  width: 48,
  height: 48,
  '&:hover': {
    background: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
}));

const BackgroundGradient = styled(Box)(() => ({
  position: 'fixed',
  inset: 0,
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%)',
  pointerEvents: 'none',
  zIndex: -1,
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
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'background.default',
                }}
            >
                <CircularProgress />
            </Box>
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
                    variant="h6"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 300,
                        mb: 6,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                >
                    Ready to split your bills with ease
                </Typography>

                {/* Instructions */}
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.secondary',
                        mb: 2,
                    }}
                >
                    Tap the plus button to upload a receipt and get started
                </Typography>
            </Box>

            {/* Bottom Navigation */}
            <BottomNavContainer>
                <BottomNavContent>
                    <Tooltip title="Saved Receipts" arrow>
                        <NavIconButton onClick={handleHistoryClick}>
                            <ReceiptIcon />
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
                        <label htmlFor="receipt-upload">
                            <GradientFab component="span">
                                <AddIcon fontSize="large" />
                            </GradientFab>
                        </label>
                    </Tooltip>

                    <Tooltip title="Profile" arrow>
                        <NavIconButton onClick={handleProfileMenuOpen}>
                            <AccountCircleIcon />
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
                    }
                }}
            >
                <MenuItem disabled>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                        primary={user?.email} 
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                        }}
                    />
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                </MenuItem>
                <MenuItem onClick={handleHistoryClick}>
                    <ListItemIcon>
                        <ReceiptIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="View History" />
                </MenuItem>
            </Menu>
        </Box>
    );
} 