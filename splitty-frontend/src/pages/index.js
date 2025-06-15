import { useState } from 'react';
import ReceiptProcessor from '../components/ReceiptProcessor';
import { Box, Button, Typography, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const GradientTitle = styled('span')(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  display: 'inline-block',
  background: 'linear-gradient(90deg, #3b82f6 0%, #a21caf 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  letterSpacing: '-0.01em',
  fontFamily: 'Inter, system-ui, sans-serif',
}));

const ReceiptShadowWrapper = styled('div')(({ theme }) => ({
    boxShadow: '0 8px 32px 0 rgba(30,41,59,0.13), 0 1.5px 8px 0 rgba(30,41,59,0.06)',
    borderRadius: 20,
    maxWidth: 420,
    width: '100%',
    background: 'transparent',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 460,
      borderRadius: 16,
    },
  }));

const ReceiptContainer = styled('div')(({ theme }) => ({
  background: '#fcfcfc',
  border: '1px solid #f1f1f1',
  boxShadow: '0 4px 18px 0 rgba(30,41,59,0.07)',
  borderRadius: 20,
  padding: `${theme.spacing(4)} ${theme.spacing(5)} ${theme.spacing(4)}`,
  position: 'relative',
  width: '100%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'visible',
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(2)} ${theme.spacing(1.5)} ${theme.spacing(2)}`,
    maxWidth: 340,
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a21caf 100%)',
  color: '#fff',
  borderRadius: 16,
  padding: '16px 40px',
  fontWeight: 500,
  fontSize: '1.125rem',
  textTransform: 'none',
  boxShadow: '0 2px 12px rgba(30,41,59,0.10)',
  letterSpacing: 0.2,
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  '&:hover': {
    background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 50%, #7c3aed 100%)',
  },
}));

// Circum-Icons Receipt SVG as React component
const ReceiptIconCircum = ({ size = 38, style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    style={style}
  >
    <defs>
      <linearGradient id="receipt-gradient" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#a21caf" />
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

export default function Home() {
    const [imageData, setImageData] = useState(null);
    const [showProcessor, setShowProcessor] = useState(false);
    const theme = useTheme();

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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
                width: '100vw',
                background: 'linear-gradient(to bottom, #f9fafb 0%, #fff 100%)',
                fontFamily: 'Inter, Lato, system-ui, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', px: { xs: 2, sm: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', py: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 2 }}>
                  <GradientTitle>Splitty</GradientTitle>
                  <ReceiptIconCircum style={{ verticalAlign: 'middle', marginLeft: 8 }} />
                </Box>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: '#7b7b7b',
                        fontWeight: 300,
                        fontSize: '0.97rem',
                        mt: 0,
                        mb: 5,
                        letterSpacing: 0,
                    }}
                >
                    Split your bills with ease
                </Typography>
                <Box sx={{ mt: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                            startIcon={<CloudUploadIcon sx={{ fontSize: 28 }} />}
                            size="large"
                        >
                            Upload Receipt
                        </UploadButton>
                    </label>
                    <Typography
                        align="center"
                        sx={{
                            color: '#b0b0b0',
                            fontSize: '0.91rem',
                            fontWeight: 300,
                            mt: 5,
                            mb: 0,
                            letterSpacing: 0,
                            fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                        }}
                    >
                        Supported formats: JPG, PNG, JPEG
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
} 