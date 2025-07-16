import React from 'react'
import { useRouter } from 'next/router'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Button,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import UserMenu from './UserMenu'

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function ProtectedLayout({ children, title = 'Splitty' }: ProtectedLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Redirect to auth if not logged in
  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            {title}
          </Typography>
          
          {router.pathname !== '/history' && (
            <Button 
              color="inherit" 
              onClick={() => router.push('/history')}
              sx={{ mr: 2 }}
            >
              History
            </Button>
          )}
          
          <UserMenu />
        </Toolbar>
      </AppBar>
      
      <Box component="main">
        {children}
      </Box>
    </Box>
  )
} 