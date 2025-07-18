import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import {
  Visibility as VisibilityIcon,
  Restaurant as RestaurantIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import { Receipt } from '../config/supabase'

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
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
  position: 'relative',
  overflow: 'hidden',
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

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  animation: `${slideIn} 1s ease-out`,
  marginBottom: theme.spacing(4),
}))

const HeaderCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  padding: theme.spacing(3),
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
    borderRadius: '24px',
    pointerEvents: 'none',
  },
}))

const ReceiptCard = styled(Card)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.5)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
    borderRadius: '20px',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
}))

const StyledChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  color: '#60a5fa',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(59, 130, 246, 0.2)',
  },
}))

const BackButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.8)',
  color: '#94a3b8',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(71, 85, 105, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(30, 41, 59, 0.9)',
    color: '#f8fafc',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-1px)',
  },
}))

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 2),
  animation: `${fadeInUp} 0.8s ease-out`,
  position: 'relative',
  zIndex: 2,
}))

const EmptyStateCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  padding: theme.spacing(6, 4),
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  maxWidth: '400px',
  margin: '0 auto',
}))

interface ReceiptHistoryProps {}

export default function ReceiptHistory({}: ReceiptHistoryProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { user, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && session) {
      fetchReceipts()
    }
  }, [user, session])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/receipts', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setReceipts(data.receipts)
      } else {
        setError(data.error || 'Failed to fetch receipts')
      }
    } catch (err) {
      setError('Failed to fetch receipts')
      console.error('Error fetching receipts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedReceipt(null)
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <AnimatedContainer>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      </AnimatedContainer>
    )
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

      <Container maxWidth="lg">
        {/* Header */}
        <HeaderContainer>
          <HeaderCard>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <BackButton onClick={() => router.push('/app')}>
                  <ArrowBackIcon />
                </BackButton>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1,
                    }}
                  >
                    Receipt History
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '1.1rem',
                    }}
                  >
                    View all your processed receipts and bill splits
                  </Typography>
                </Box>
              </Box>
            </Box>
          </HeaderCard>
        </HeaderContainer>

        {/* Error Alert */}
        {error && (
          <Box sx={{ mb: 3, animation: `${slideIn} 0.8s ease-out 0.2s both` }}>
            <Alert 
              severity="error" 
              sx={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '& .MuiAlert-message': {
                  color: '#fca5a5',
                },
              }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Content */}
        {receipts.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateCard>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <ReceiptIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: '#3b82f6', 
                    mb: 2,
                    opacity: 0.7,
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#f8fafc', 
                    mb: 1,
                    fontWeight: 600,
                  }}
                >
                  No receipts yet
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#94a3b8',
                    mb: 3,
                  }}
                >
                  Process your first receipt to see it here
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/app')}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Upload Receipt
                </Button>
              </Box>
            </EmptyStateCard>
          </EmptyStateContainer>
        ) : (
          <Grid container spacing={3}>
            {receipts.map((receipt, index) => (
              <Grid item xs={12} sm={6} md={4} key={receipt.id}>
                <Box sx={{ animation: `${fadeInUp} 0.8s ease-out ${0.3 + index * 0.1}s both` }}>
                  <ReceiptCard onClick={() => handleViewReceipt(receipt)}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          noWrap 
                          sx={{ 
                            flexGrow: 1, 
                            mr: 1,
                            color: '#f8fafc',
                            fontWeight: 600,
                          }}
                        >
                          {receipt.restaurant_name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.1)',
                            '&:hover': {
                              background: 'rgba(59, 130, 246, 0.2)',
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Box>

                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: '#3b82f6',
                          fontWeight: 700,
                          mb: 2,
                        }}
                      >
                        {formatCurrency(receipt.total_amount, receipt.currency)}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <StyledChip 
                          label={receipt.currency} 
                          size="small" 
                          variant="outlined" 
                        />
                        <StyledChip 
                          label={`${receipt.receipt_items.length} items`} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Box>

                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748b',
                          fontSize: '0.875rem',
                        }}
                      >
                        {formatDate(receipt.created_at)}
                      </Typography>
                    </CardContent>
                  </ReceiptCard>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Receipt Detail Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }
          }}
        >
          {selectedReceipt && (
            <>
              <DialogTitle sx={{ color: '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                    {selectedReceipt.restaurant_name}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                    {formatCurrency(selectedReceipt.total_amount, selectedReceipt.currency)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  {formatDate(selectedReceipt.created_at)}
                </Typography>
              </DialogTitle>
              
              <DialogContent sx={{ color: '#f8fafc' }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#f8fafc', fontWeight: 600 }}>
                  Items ({selectedReceipt.receipt_items.length})
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedReceipt.receipt_items.map((item, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        background: 'rgba(51, 65, 85, 0.5)',
                        borderRadius: '12px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ color: '#f8fafc', fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        {item.originalName && item.originalName !== item.name && (
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            ({item.originalName})
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                        {formatCurrency(item.price, selectedReceipt.currency)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {selectedReceipt.participants.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3, color: '#f8fafc', fontWeight: 600 }}>
                      Participants
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedReceipt.participants.map((participant, index) => (
                        <StyledChip key={index} label={participant} />
                      ))}
                    </Box>
                  </>
                )}
              </DialogContent>
              
              <DialogActions sx={{ p: 3 }}>
                <Button 
                  onClick={handleCloseDialog}
                  sx={{
                    color: '#3b82f6',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.1)',
                    },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </AnimatedContainer>
  )
} 