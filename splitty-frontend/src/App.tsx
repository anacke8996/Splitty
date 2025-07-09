import React, { useState } from 'react';
import { Box, Container, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReceiptProcessor from './components/ReceiptProcessor';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  maxWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  margin: 0,
  width: '100%',
  overflowX: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    minHeight: '100vh',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(6),
    marginTop: theme.spacing(4),
  },
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  '& svg': {
    fontSize: 'clamp(2.5rem, 8vw, 4rem)',
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(3),
    '& svg': {
      marginRight: theme.spacing(1),
    },
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(2.5),
  textTransform: 'none',
  fontSize: 'clamp(1rem, 3vw, 1.2rem)',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
  maxWidth: '280px',
  width: '100%',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 6),
    borderRadius: theme.spacing(3),
    fontSize: '1.2rem',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
    '&:hover': {
      boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
      transform: 'translateY(-2px)',
    },
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  flex: 1,
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
    padding: theme.spacing(0, 2),
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  maxWidth: '400px',
  width: '100%',
  margin: '0 auto',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const ProcessorContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  maxWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflowX: 'hidden',
  padding: theme.spacing(0, 0.5),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 1),
  },
}));

function App() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [showProcessor, setShowProcessor] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        setImageData(base64Data);
        setShowProcessor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessingComplete = (results: any) => {
    // Handle the completion of receipt processing
    console.log('Processing complete:', results);
    // Reset to show the upload screen again
    setShowProcessor(false);
    setImageData(null);
  };

  return (
    <StyledContainer maxWidth={false} disableGutters>
      {!showProcessor ? (
        <>
          <Header>
            <Logo>
              <ReceiptIcon />
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: 1,
                  fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  textAlign: 'center',
                }}
              >
                Splitty
              </Typography>
            </Logo>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                fontWeight: 400,
                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                textAlign: 'center',
              }}
            >
              Split your bills with ease
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6,
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                textAlign: 'center',
                padding: theme.spacing(0, 2),
              }}
            >
              Upload a photo of your receipt and let AI automatically extract items and split the bill among your friends
            </Typography>
          </Header>

          <MainContent>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="receipt-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="receipt-upload">
              <UploadButton
                variant="contained"
                size="large"
                startIcon={<FileUploadIcon />}
                {...({ component: "span" } as any)}
              >
                Upload Receipt
              </UploadButton>
            </label>

            <FeatureCard>
              <Typography 
                variant="h6" 
                color="text.primary"
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  fontSize: 'clamp(1.1rem, 4vw, 1.25rem)',
                }}
              >
                How it works
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  lineHeight: 1.6,
                  fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
                }}
              >
                1. Upload a photo of your receipt<br/>
                2. AI extracts items and prices<br/>
                3. Add participants<br/>
                4. Assign items to people<br/>
                5. Get the split calculation
              </Typography>
            </FeatureCard>

            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                textAlign: 'center',
                fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                marginTop: theme.spacing(2),
              }}
            >
              Supported formats: JPG, PNG, JPEG
            </Typography>
          </MainContent>
        </>
      ) : (
        imageData && (
          <ProcessorContainer>
            <ReceiptProcessor
              imageData={imageData}
              onComplete={handleProcessingComplete}
            />
          </ProcessorContainer>
        )
      )}
    </StyledContainer>
  );
}

export default App; 