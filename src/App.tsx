import React, { useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import ReceiptProcessor from './components/ReceiptProcessor';

function App() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [showProcessor, setShowProcessor] = useState(false);

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
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Receipt Splitter
        </Typography>

        {!showProcessor ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mt: 4,
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
              <Button variant="contained" component="span">
                Upload Receipt
              </Button>
            </label>
          </Box>
        ) : (
          imageData && (
            <ReceiptProcessor
              imageData={imageData}
              onComplete={handleProcessingComplete}
            />
          )
        )}
      </Box>
    </Container>
  );
}

export default App; 