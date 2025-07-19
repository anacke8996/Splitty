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
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Sort as SortIcon,
  Delete as DeleteIcon,
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
  height: 'auto',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
  backgroundAttachment: 'fixed',
  position: 'relative',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(6),
  width: '100%',
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
  background: 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(71, 85, 105, 0.3)',
  borderRadius: '20px',
  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(71, 85, 105, 0.5)',
    background: 'rgba(30, 41, 59, 0.9)',
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
    borderColor: 'rgba(71, 85, 105, 0.5)',
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
  background: 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(71, 85, 105, 0.3)',
  padding: theme.spacing(6, 4),
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
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
  const [refreshKey, setRefreshKey] = useState(0)
  const [showItems, setShowItems] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent')
  const [showStarredOnly, setShowStarredOnly] = useState(false)

  const { user, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && session) {
      fetchReceipts()
    }
  }, [user, session])



  const cleanupOldReceipts = async () => {
    try {
      console.log('Starting automatic receipt cleanup...');
      const response = await fetch('/api/cleanup-receipts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      const data = await response.json()
      if (data.success && data.deletedCount > 0) {
        console.log(`Cleanup completed: Deleted ${data.deletedCount} old receipts, preserved ${data.preservedStarred} starred receipts`);
      } else {
        console.log('Cleanup result:', data.message);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      setError('') // Clear previous errors
      
      console.log('History page: Fetching receipts for user:', user?.id, user?.email);
      console.log('History page: Using session token:', session?.access_token?.substring(0, 20) + '...');
      
      const response = await fetch(`/api/receipts?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })

      const data = await response.json()
      console.log('History page: API response:', data);

      if (data.success) {
        // Receipts are already sorted by most recent first from the API
        console.log('History page: Setting', data.receipts?.length || 0, 'receipts');
        console.log('History page: Current receipts state before update:', receipts?.length || 0);
        console.log('History page: New receipts from API:', data.receipts?.map(r => ({ 
          id: r.id, 
          restaurant: r.restaurant_name, 
          created_at: r.created_at,
          participants: r.participants,
          participantsLength: r.participants?.length || 0
        })));
        setReceipts(data.receipts || [])
        setRefreshKey(prev => prev + 1) // Force re-render
        console.log('History page: setReceipts called with', data.receipts?.length || 0, 'receipts');

        // Trigger cleanup after fetching receipts (only if we have more than 15)
        if (data.receipts && data.receipts.length > 15) {
          setTimeout(() => cleanupOldReceipts(), 1000); // Slight delay to not interfere with UI
        }
      } else {
        console.error('History page: API error:', data.error);
        setError(data.error || 'Failed to fetch receipts')
      }
    } catch (err) {
      console.error('History page: Fetch error:', err);
      setError('Failed to fetch receipts')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setShowItems(false) // Reset items view when opening new receipt
    setSelectedParticipant(null) // Reset participant view
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedReceipt(null)
    setShowItems(false) // Reset items view when closing
    setSelectedParticipant(null) // Reset participant view when closing
  }

  const handleParticipantClick = (participant: string) => {
    setSelectedParticipant(participant)
  }

  const handleBackToSummary = () => {
    setSelectedParticipant(null)
  }

  const handleStarReceipt = async (receiptId: string, currentStarred: boolean, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent opening the receipt dialog
    
    try {
      const response = await fetch('/api/star-receipt', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          receiptId,
          starred: !currentStarred
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the local receipts state
        setReceipts(prevReceipts => 
          prevReceipts.map(receipt => 
            receipt.id === receiptId 
              ? { ...receipt, starred: !currentStarred }
              : receipt
          )
        )
        console.log(`Receipt ${receiptId} ${!currentStarred ? 'starred' : 'unstarred'}`)
      } else {
        if (data.needsDbUpdate) {
          alert(`Star feature needs database setup!\n\nPlease run this SQL command in your Supabase SQL Editor:\n\n${data.sqlCommand}`)
        }
        console.error('Failed to update star status:', data.error)
      }
    } catch (error) {
      console.error('Error starring receipt:', error)
    }
  }

  const handleDeleteReceipt = async (receiptId: string, restaurantName: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent opening the receipt dialog
    
    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete the receipt from "${restaurantName}"?\n\nThis action cannot be undone.`)
    
    if (!confirmed) return
    
    try {
      const response = await fetch('/api/delete-receipt', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ receiptId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove the deleted receipt from local state
        setReceipts(prevReceipts => 
          prevReceipts.filter(receipt => receipt.id !== receiptId)
        )
        console.log(`Receipt ${receiptId} deleted successfully`)
      } else {
        console.error('Failed to delete receipt:', data.error)
        alert('Failed to delete receipt. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting receipt:', error)
      alert('Failed to delete receipt. Please try again.')
    }
  }

  // Get filtered and sorted receipts
  const getFilteredAndSortedReceipts = () => {
    let filteredReceipts = receipts

    // Filter by starred if enabled
    if (showStarredOnly) {
      filteredReceipts = receipts.filter(receipt => receipt.starred)
    }

    // Sort by date
    return filteredReceipts.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      
      if (sortOrder === 'recent') {
        return dateB - dateA // Most recent first
      } else {
        return dateA - dateB // Oldest first
      }
    })
  }

  // Get items assigned to a specific participant with their individual costs
  const getParticipantItems = (participant: string, receipt: Receipt) => {
    if (!receipt) return []
    
    return receipt.receipt_items.filter(item => 
      item.assignedTo?.includes(participant)
    ).map(item => {
      const assignedCount = item.assignedTo?.filter(p => p === participant).length || 0
      const totalAssigned = item.assignedTo?.length || 1
      
      let participantShare: number
      if (item.shareEqually) {
        // For equally shared items, split the total cost
        participantShare = (item.total) / totalAssigned
      } else if (item.quantity === 1) {
        // For single items, split among all assigned participants
        participantShare = item.total / totalAssigned
      } else {
        // For multiple quantity items, participant pays for their assigned units
        participantShare = (item.total / item.quantity) * assignedCount
      }
      
      return {
        ...item,
        participantShare: participantShare,
        participantQty: item.shareEqually ? 1 : assignedCount,
        sharedWith: item.assignedTo?.filter(p => p !== participant) || [],
        totalSharedBy: totalAssigned
      }
    })
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
      {/* Background Pattern Layer */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
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
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Modern Header */}
        <HeaderContainer>
          <Box sx={{ 
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            padding: 3,
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
            position: 'relative',
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BackButton onClick={() => router.push('/app')}>
                    <ArrowBackIcon />
                  </BackButton>
                  <Box>
                    <Typography
                      variant="h5"
                      component="h1"
                      sx={{
                        fontWeight: 600,
                        color: '#f8fafc',
                        mb: 0.5,
                        letterSpacing: '-0.025em',
                      }}
                    >
                      Receipt History
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                      }}
                    >
                      Manage your processed receipts and bill splits
                    </Typography>
                  </Box>
                </Box>
                <BackButton onClick={fetchReceipts} disabled={loading}>
                  <RefreshIcon />
                </BackButton>
              </Box>
            </Box>
          </Box>
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

        {/* Compact Filter Bar */}
        <Box sx={{ 
          animation: `${slideIn} 0.8s ease-out 0.2s both`, 
          position: 'relative', 
          zIndex: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '6px',
            border: '1px solid rgba(71, 85, 105, 0.3)',
          }}>
            {/* Sort Toggle */}
            <IconButton
              onClick={() => setSortOrder(sortOrder === 'recent' ? 'oldest' : 'recent')}
              sx={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                borderRadius: '8px',
                padding: '6px 12px',
                background: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                },
              }}
            >
              <SortIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {sortOrder === 'recent' ? 'Recent' : 'Oldest'}
              </Typography>
            </IconButton>

            {/* Starred Filter Toggle */}
            <IconButton
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              sx={{
                color: showStarredOnly ? '#fbbf24' : '#94a3b8',
                fontSize: '0.875rem',
                borderRadius: '8px',
                padding: '6px 12px',
                background: showStarredOnly ? 'rgba(251, 191, 36, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                border: showStarredOnly ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(107, 114, 128, 0.2)',
                '&:hover': {
                  background: showStarredOnly ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)',
                  color: '#fbbf24',
                  borderColor: 'rgba(251, 191, 36, 0.4)',
                },
                ...(showStarredOnly && {
                  filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                })
              }}
            >
              {showStarredOnly ? <StarIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> : <StarBorderIcon sx={{ fontSize: '1rem', mr: 0.5 }} />}
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {showStarredOnly ? 'Starred' : 'All'}
              </Typography>
            </IconButton>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ 
          position: 'relative', 
          zIndex: 2,
          background: 'transparent',
        }}>
          {getFilteredAndSortedReceipts().length === 0 ? (
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
                  {showStarredOnly ? 'No starred receipts' : 'No receipts yet'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#94a3b8',
                    mb: 3,
                  }}
                >
                  {showStarredOnly 
                    ? 'Star some receipts to see them here' 
                    : 'Process your first receipt to see it here'
                  }
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
          <Box key={refreshKey} sx={{ position: 'relative', zIndex: 2, pb: 2 }}>
            <Grid container spacing={3}>
              {getFilteredAndSortedReceipts().map((receipt, index) => {
                // Debug logging for participants
                if (receipt.participants?.length === 0) {
                  console.warn('Receipt with 0 participants:', {
                    id: receipt.id,
                    restaurant: receipt.restaurant_name,
                    participants: receipt.participants,
                    participantsLength: receipt.participants?.length || 0,
                    split_results: receipt.split_results,
                    split_resultsLength: receipt.split_results?.length || 0
                  });
                }
                return (
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleStarReceipt(receipt.id, receipt.starred || false, e)}
                            sx={{ 
                              color: receipt.starred ? '#fbbf24' : '#6b7280',
                              background: receipt.starred ? 'rgba(251, 191, 36, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: receipt.starred ? '#f59e0b' : '#fbbf24',
                                background: receipt.starred ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)',
                                transform: 'scale(1.1)',
                                boxShadow: receipt.starred ? '0 0 20px rgba(251, 191, 36, 0.4)' : '0 0 15px rgba(251, 191, 36, 0.3)',
                              },
                              ...(receipt.starred && {
                                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
                                animation: `${pulse} 2s ease-in-out infinite`,
                              })
                            }}
                          >
                            {receipt.starred ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleDeleteReceipt(receipt.id, receipt.restaurant_name, e)}
                            sx={{ 
                              color: '#6b7280',
                              background: 'rgba(107, 114, 128, 0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                transform: 'scale(1.1)',
                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
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
                        <StyledChip 
                          label={`${receipt.participants?.length || receipt.split_results?.length || 0} people`} 
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
              );
            })}
            </Grid>
          </Box>
        )}
        </Box>

        {/* Receipt Detail Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            }
          }}
        >
          {selectedReceipt && (
            <>
              <DialogTitle sx={{ color: '#f8fafc', textAlign: 'center', py: 3 }}>
                {selectedParticipant ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <IconButton
                        onClick={handleBackToSummary}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          color: '#94a3b8',
                          '&:hover': { color: '#f8fafc' }
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                      <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                        {selectedReceipt.restaurant_name.toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#94a3b8', mb: 1 }}>
                      INDIVIDUAL RECEIPT
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                      {selectedParticipant.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      {formatDate(selectedReceipt.created_at)}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 600, mb: 1 }}>
                      {selectedReceipt.restaurant_name.toUpperCase()}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94a3b8', mb: 2 }}>
                      BILL SPLIT SUMMARY
                    </Typography>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                    }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{ 
                          width: 0, 
                          height: 0, 
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          borderTop: '6px solid #10b981',
                          transform: 'rotate(90deg)'
                        }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      {formatDate(selectedReceipt.created_at)}
                    </Typography>
                  </Box>
                )}
              </DialogTitle>
              
              <DialogContent sx={{ color: '#f8fafc', px: 0 }}>
                {selectedParticipant ? (
                  /* Individual Participant Receipt */
                  <Box sx={{ px: 3 }}>
                    {/* Participant Items */}
                    <Typography variant="h6" gutterBottom sx={{ color: '#f8fafc', fontWeight: 600 }}>
                      Items ({getParticipantItems(selectedParticipant, selectedReceipt).length})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {getParticipantItems(selectedParticipant, selectedReceipt).map((item, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            py: 2,
                            px: 3,
                            background: 'rgba(30, 41, 59, 0.8)',
                            borderRadius: '16px',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                              {formatCurrency(item.participantShare, selectedReceipt.currency)}
                            </Typography>
                          </Box>
                          
                          {item.sharedWith.length > 0 ? (
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                              Shared with {item.sharedWith.join(', ')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                              {item.shareEqually ? 'Cost split equally among ' + item.totalSharedBy + ' people' : 'Just you'}
                            </Typography>
                          )}
                          
                          {item.shareEqually && (
                            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                              {formatCurrency(item.total, selectedReceipt.currency)} ÷ {item.totalSharedBy} people
                            </Typography>
                          )}
                          
                          {!item.shareEqually && item.quantity > 1 && (
                            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                              You got {item.participantQty} of {item.quantity} × {formatCurrency(item.total / item.quantity, selectedReceipt.currency)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  /* Split Summary - Participant Cards */
                  <Box>
                    {selectedReceipt.split_results.map((result, index) => (
                      <Box 
                        key={index}
                        onClick={() => handleParticipantClick(result.participant)}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 3,
                          px: 4,
                          background: 'rgba(30, 41, 59, 0.8)',
                          borderBottom: index < selectedReceipt.split_results.length - 1 ? '1px solid rgba(71, 85, 105, 0.3)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(59, 130, 246, 0.1)',
                          },
                        }}
                      >
                        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600, textTransform: 'uppercase' }}>
                          {result.participant}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                            {formatCurrency(result.total, result.currency)}
                          </Typography>
                          <Box sx={{ 
                            color: '#94a3b8',
                            fontSize: '1.5rem',
                            transform: 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }}>
                            ›
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    {/* Total Section */}
                    <Box sx={{ 
                      py: 4,
                      px: 4,
                      background: 'rgba(15, 23, 42, 0.9)',
                      borderTop: '2px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600, textTransform: 'uppercase' }}>
                          Total
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                          {formatCurrency(selectedReceipt.total_amount, selectedReceipt.currency)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
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