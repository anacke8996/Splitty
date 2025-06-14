import { useState } from 'react';
import ReceiptProcessor from '../components/ReceiptProcessor';
import { Box, Button, Container, Typography, Paper, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
        // Reset the state to start over
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
                background: `linear-gradient(135deg, ${theme.palette.background.default} 60%, #fff 100%)`,
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: { xs: 4, sm: 8 },
            }}
        >
            <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ my: { xs: 4, sm: 8 } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            fontWeight={700}
                            gutterBottom
                            sx={{
                                color: theme.palette.primary.main,
                                letterSpacing: 1,
                                fontSize: { xs: '2.2rem', sm: '2.7rem' },
                            }}
                        >
                            Splitty
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            mb={2}
                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                        >
                            Split your bills with ease
                        </Typography>
                    </Box>
                    <Paper
                        elevation={4}
                        sx={{
                            background: theme.palette.background.paper,
                            borderRadius: { xs: 3, sm: 4 },
                            boxShadow: '0 8px 32px rgba(30,41,59,0.10)',
                            p: { xs: 3, sm: 6 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
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
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                size="large"
                                color="secondary"
                                sx={{
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    borderRadius: 2,
                                    px: 5,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    color: '#fff',
                                    boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                                    letterSpacing: 0.5,
                                    '&:hover': {
                                        background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                    },
                                }}
                            >
                                Upload Receipt
                            </Button>
                        </label>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Supported formats: JPG, PNG, JPEG
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
} 