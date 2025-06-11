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

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Splitty
                </Typography>
                <Typography variant="h6" align="center" color="textSecondary" paragraph>
                    Split your bills with ease
                </Typography>

                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                    {!showProcessor ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
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
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                                        },
                                    }}
                                >
                                    Upload Receipt
                                </Button>
                            </label>
                            <Typography variant="body2" color="textSecondary">
                                Supported formats: JPG, PNG, JPEG
                            </Typography>
                        </Box>
                    ) : (
                        imageData && (
                            <ReceiptProcessor
                                imageData={imageData}
                                onComplete={handleProcessingComplete}
                            />
                        )
                    )}
                </Paper>
            </Box>
        </Container>
    );
} 