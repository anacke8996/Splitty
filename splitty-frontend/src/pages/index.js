import { useState } from 'react';
import ReceiptProcessor from '../components/ReceiptProcessor';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function Home() {
    const [imageData, setImageData] = useState(null);
    const [showProcessor, setShowProcessor] = useState(false);

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
        <Box sx={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Container maxWidth="sm">
                <Box sx={{ my: 6 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom sx={{ color: '#1A1A1A' }}>
                            Splitty
                        </Typography>
                        <Typography variant="h6" color="#6B7280" mb={2}>
                            Split your bills with ease
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            background: '#fff',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(30,41,59,0.10)',
                            p: 6,
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
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    borderRadius: 2,
                                    px: 5,
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                                    },
                                }}
                            >
                                Upload Receipt
                            </Button>
                        </label>
                        <Typography variant="body2" color="#6B7280">
                            Supported formats: JPG, PNG, JPEG
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
} 