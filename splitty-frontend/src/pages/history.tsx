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
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import ProtectedLayout from '../components/ProtectedLayout'
import { Receipt } from '../config/supabase'

interface ReceiptHistoryProps {}

export default function ReceiptHistory({}: ReceiptHistoryProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { user, session } = useAuth()

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
      <ProtectedLayout title="Receipt History">
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout title="Receipt History">
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Receipt History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all your processed receipts and bill splits
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {receipts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No receipts yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Process your first receipt to see it here
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {receipts.map((receipt) => (
              <Grid item xs={12} sm={6} md={4} key={receipt.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleViewReceipt(receipt)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                        {receipt.restaurant_name}
                      </Typography>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="h5" color="primary" gutterBottom>
                      {formatCurrency(receipt.total_amount, receipt.currency)}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={receipt.currency} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${receipt.receipt_items.length} items`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {formatDate(receipt.created_at)}
                    </Typography>
                  </CardContent>
                </Card>
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
        >
          {selectedReceipt && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">
                    {selectedReceipt.restaurant_name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(selectedReceipt.total_amount, selectedReceipt.currency)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(selectedReceipt.created_at)}
                </Typography>
              </DialogTitle>
              
              <DialogContent>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                        py: 1,
                        px: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body1">
                          {item.name}
                        </Typography>
                        {item.originalName && item.originalName !== item.name && (
                          <Typography variant="body2" color="text.secondary">
                            ({item.originalName})
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(item.price, selectedReceipt.currency)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {selectedReceipt.participants.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Participants
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedReceipt.participants.map((participant, index) => (
                        <Chip key={index} label={participant} />
                      ))}
                    </Box>
                  </>
                )}
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </ProtectedLayout>
  )
} 