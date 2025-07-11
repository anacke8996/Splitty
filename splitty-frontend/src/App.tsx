import React, { useState } from 'react';
import { Box, Container, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReceiptProcessor from './components/ReceiptProcessor';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import heic2any from 'heic2any';

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

  const compressImage = async (file: File): Promise<string> => {
    try {
      let processedFile = file;
      
      // Handle HEIF/HEIC files by converting to JPEG first
      console.log('🔍 Checking file type:', file.type, 'name:', file.name);
      const isHeicFile = file.type === 'image/heif' || 
                        file.type === 'image/heic' || 
                        file.name.toLowerCase().endsWith('.heif') || 
                        file.name.toLowerCase().endsWith('.heic') ||
                        file.name.toLowerCase().includes('heic') ||
                        file.name.toLowerCase().includes('heif');
      
      console.log('🔍 Is HEIC file?', isHeicFile);
      
      if (isHeicFile) {
        console.log('🔄 Converting HEIF/HEIC image to JPEG...');
        console.log('🔍 heic2any available:', typeof heic2any);
        console.log('🔍 File details:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        try {
          // Try heic2any first with proper configuration
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          let blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          processedFile = new File([blobToUse], file.name.replace(/\.(heif|heic)$/i, '.jpg'), {
            type: 'image/jpeg'
          });
          console.log('✅ HEIF/HEIC conversion successful');
          console.log('Converted file type:', processedFile.type);
          console.log('Converted file size:', (processedFile.size / 1024 / 1024).toFixed(2), 'MB');
          
          // Validate the converted blob
          if (blobToUse.type !== 'image/jpeg') {
            throw new Error(`Expected JPEG but got ${blobToUse.type}`);
          }
          
          // Check if the blob has data
          if (blobToUse.size === 0) {
            throw new Error('Converted blob is empty');
          }
          
          // Verify the conversion actually worked by checking the file content
          const arrayBuffer = await processedFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const header = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
          console.log('🔍 Converted file header (hex):', header);
          
          // Check if it's actually JPEG (should start with FFD8FF)
          if (!header.startsWith('ffd8ff')) {
            console.warn('⚠️ heic2any conversion failed - trying alternative method');
            throw new Error('HEIC conversion failed - file is not valid JPEG');
          }
        } catch (conversionError) {
          console.error('❌ HEIF/HEIC conversion failed:', conversionError);
          console.log('🔍 heic2any error details:', {
            name: conversionError.name,
            message: conversionError.message,
            stack: conversionError.stack
          });
          console.log('🔄 Trying alternative conversion method...');
          
          // Alternative method: Try to load the HEIF file directly into canvas
          // This works in some browsers that support HEIF natively
          try {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = URL.createObjectURL(file);
            });
            
            // Draw to canvas and convert to JPEG
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            const jpegBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to blob conversion failed'));
              }, 'image/jpeg', 0.8);
            });
            
            processedFile = new File([jpegBlob], file.name.replace(/\.(heif|heic)$/i, '.jpg'), {
              type: 'image/jpeg'
            });
            
            console.log('✅ Alternative HEIF conversion successful');
            console.log('Converted file type:', processedFile.type);
            console.log('Converted file size:', (processedFile.size / 1024 / 1024).toFixed(2), 'MB');
          } catch (altError) {
            console.error('❌ Alternative conversion also failed:', altError);
            throw new Error('HEIF/HEIC format not supported in this browser. Please convert your image to JPEG or PNG format before uploading.');
          }
        }
      } else {
        console.log('📸 Processing standard image format:', file.type);
      }
      
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions (max 1920x1920, maintain aspect ratio)
          const maxSize = 1920;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress the image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 85% quality for good balance of size/quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Check if still too large (>8MB base64 = ~6MB actual)
          if (compressedDataUrl.length > 8 * 1024 * 1024) {
            // Try with lower quality
            const veryCompressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            console.log('🗜️ Applied high compression due to large size');
            const base64Data = veryCompressedDataUrl.split(',')[1];
            console.log('📊 Final base64 data length:', base64Data.length);
            console.log('📊 Final base64 preview (first 50 chars):', base64Data.substring(0, 50));
            
            // Validate that we actually have JPEG data
            const decodedBytes = atob(base64Data);
            const header = Array.from(new Uint8Array(decodedBytes.slice(0, 3).split('').map(c => c.charCodeAt(0)))).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log('🔍 Final JPEG header validation:', header);
            if (!header.startsWith('ffd8ff')) {
              throw new Error('Generated data is not valid JPEG format');
            }
            
            resolve(base64Data);
          } else {
            console.log('🗜️ Applied standard compression');
            const base64Data = compressedDataUrl.split(',')[1];
            console.log('📊 Final base64 data length:', base64Data.length);
            console.log('📊 Final base64 preview (first 50 chars):', base64Data.substring(0, 50));
            
            // Validate that we actually have JPEG data
            const decodedBytes = atob(base64Data);
            const header = Array.from(new Uint8Array(decodedBytes.slice(0, 3).split('').map(c => c.charCodeAt(0)))).map(b => b.toString(16).padStart(2, '0')).join('');
            console.log('🔍 Final JPEG header validation:', header);
            if (!header.startsWith('ffd8ff')) {
              throw new Error('Generated data is not valid JPEG format');
            }
            
            resolve(base64Data);
          }
        };
        
        img.onerror = (error) => {
          console.error('Image loading error:', error);
          reject(new Error('Failed to load image'));
        };
        
        img.src = URL.createObjectURL(processedFile);
      });
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log('📸 Original file:', {
          name: file.name,
          type: file.type,
          size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        });
        
        // Always compress/convert images to ensure proper format
        console.log('🔄 Processing image...');
        console.log('🔍 About to call compressImage...');
        const processedBase64 = await compressImage(file);
        console.log('✅ Image processing complete. Size:', (processedBase64.length * 0.75 / 1024 / 1024).toFixed(2), 'MB');
        console.log('🔍 Setting imageData and showProcessor...');
        setImageData(processedBase64);
        setShowProcessor(true);
      } catch (error) {
        console.error('❌ Error processing image:', error);
        alert('Error processing image. Please try a different image.');
      }
    }
  };

  const handleProcessingComplete = (results: any) => {
    // Handle the completion of receipt processing
    console.log('Processing complete:', results);
    // Reset to show the upload screen again
    setShowProcessor(false);
    setImageData(null);
  };

  const handleClearImage = () => {
    console.log('🧹 Clearing image data...');
    setImageData(null);
    setShowProcessor(false);
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
              accept="image/*,.heif,.heic"
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
            {imageData && (
              <Button 
                onClick={handleClearImage}
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ mt: 2 }}
              >
                Clear Image & Upload New
              </Button>
            )}

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
              Supports all image formats including HEIF/HEIC • Automatically compressed for faster processing
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