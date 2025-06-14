import React, { useState } from 'react';
import { Box, Container, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReceiptProcessor from './components/ReceiptProcessor';
import ReceiptIcon from '@mui/icons-material/Receipt';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: '3rem',
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
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
    // You can add additional logic here, such as saving the results or showing a success message
  };

  return (
    <StyledContainer maxWidth="md">
      <Header>
        <Logo>
          <ReceiptIcon />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Splitty
          </Typography>
        </Logo>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Split your receipts with ease
        </Typography>
      </Header>

      {!showProcessor ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            mt: 4,
            flex: 1,
          }}
        >
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
              component="span"
              size="large"
              startIcon={<ReceiptIcon />}
            >
              Upload Receipt
            </UploadButton>
          </label>
          <Typography 
            variant="body2" 
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 400 }}
          >
            Take a photo of your receipt or upload an image to split the bill with your friends
          </Typography>
        </Box>
      ) : (
        imageData && (
          <Box sx={{ flex: 1, width: '100%' }}>
            <ReceiptProcessor
              imageData={imageData}
              onComplete={handleProcessingComplete}
            />
          </Box>
        )
      )}
    </StyledContainer>
  );
}

export default App; 