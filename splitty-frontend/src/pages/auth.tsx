import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import { 
  LockOutlined as LockIcon,
  MailOutline as MailIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  ArrowForward as ArrowRightIcon,
  Security as ShieldIcon,
  Star as SparklesIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

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
  minHeight: 'max(100vh, 100dvh)',
  height: 'max(100vh, 100dvh)',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const ContentCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(71, 85, 105, 0.5)',
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  animation: `${slideIn} 1s ease-out`,
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
    borderRadius: '24px',
    pointerEvents: 'none',
  },
}))

const IconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '70px',
  height: '70px',
  margin: '0 auto 16px',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #3b82f6, #3b82f6)',
    borderRadius: '16px',
    animation: `${pulse} 2s ease-in-out infinite`,
    opacity: 0.2,
  },
  '& .main-icon': {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #3b82f6, #3b82f6)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.25)',
    transition: 'all 0.5s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.75rem',
      color: '#ffffff',
    },
  },
}))

const TabContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: 'rgba(51, 65, 85, 0.5)',
  borderRadius: '12px',
  padding: '4px',
  backdropFilter: 'blur(10px)',
  marginBottom: theme.spacing(2),
}))

const TabButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  flex: 1,
  padding: '12px 16px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.3s ease',
  position: 'relative',
  color: active ? '#ffffff' : '#94a3b8',
  background: active 
    ? 'linear-gradient(135deg, #3b82f6, #3b82f6)' 
    : 'transparent',
  boxShadow: active ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none',
  '&:hover': {
    color: active ? '#ffffff' : '#cbd5e1',
    background: active 
      ? 'linear-gradient(135deg, #3b82f6, #3b82f6)' 
      : 'rgba(148, 163, 184, 0.1)',
  },
  '&::before': active ? {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'rgba(59, 130, 246, 0.2)',
    borderRadius: '8px',
    animation: `${pulse} 2s ease-in-out infinite`,
  } : {},
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: '12px',
    height: '44px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(71, 85, 105, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(51, 65, 85, 0.7)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#94a3b8',
    '&.Mui-focused': {
      color: '#3b82f6',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#f8fafc',
    '&::placeholder': {
      color: '#64748b',
      opacity: 1,
    },
  },
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3b82f6, #3b82f6)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  borderRadius: '12px',
  height: '44px',
  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s ease',
  marginTop: theme.spacing(1.5),
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb, #2563eb)',
    boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'rgba(59, 130, 246, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
    transform: 'none',
  },
}))

const SocialButton = styled(Button)(({ theme }) => ({
  height: '44px',
  background: 'rgba(51, 65, 85, 0.5)',
  border: '1px solid rgba(71, 85, 105, 0.5)',
  color: '#cbd5e1',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    background: 'rgba(51, 65, 85, 0.7)',
    borderColor: 'rgba(71, 85, 105, 0.7)',
  },
}))

const LabelWithIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
    color: '#3b82f6',
  },
}))

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/app')
    }
  }, [user, router])

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (activeTab === 'signin') {
        // Sign In
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          router.push('/app')
        }
      } else {
        // Sign Up
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Account created! Please check your email to confirm your account.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
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

      <Box
        sx={{
          width: '100%',
          maxWidth: '450px',
          transition: 'all 1s ease',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        }}
      >
        <ContentCard>
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Enhanced header section */}
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <IconContainer>
                <Box className="main-icon">
                  <LockIcon />
                </Box>
                <SparklesIcon 
                  sx={{ 
                    position: 'absolute', 
                    top: '-4px', 
                    right: '-4px', 
                    fontSize: '1rem', 
                    color: '#3b82f6',
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }} 
                />
              </IconContainer>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: '#ffffff',
                    fontSize: '1.75rem',
                  }}
                >
                  Welcome to{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    Splitty
                  </Box>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                  }}
                >
                  Split receipts with friends effortlessly
                </Typography>
              </Box>
            </Box>

            {/* Enhanced tab navigation */}
            <TabContainer>
              <Box sx={{ display: 'flex', gap: '4px' }}>
                <TabButton
                  active={activeTab === 'signin'}
                  onClick={() => handleTabChange('signin')}
                  fullWidth
                >
                  Sign In
                </TabButton>
                <TabButton
                  active={activeTab === 'signup'}
                  onClick={() => handleTabChange('signup')}
                  fullWidth
                >
                  Sign Up
                </TabButton>
              </Box>
            </TabContainer>

            {/* Enhanced form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Email field with icon */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <LabelWithIcon>
                  <MailIcon />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                    Email
                  </Typography>
                </LabelWithIcon>
                <StyledTextField
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  variant="outlined"
                  required
                />
              </Box>

              {/* Password field with toggle */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <LabelWithIcon>
                  <ShieldIcon />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#cbd5e1' }}>
                    Password
                  </Typography>
                </LabelWithIcon>
                <Box sx={{ position: 'relative' }}>
                  <StyledTextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    variant="outlined"
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#94a3b8', '&:hover': { color: '#cbd5e1' } }}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Forgot password link */}
              {activeTab === 'signin' && (
                <Box sx={{ textAlign: 'right', mt: -0.5 }}>
                  <Button
                    type="button"
                    sx={{
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      '&:hover': { color: '#60a5fa' },
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>
              )}

              {/* Error and Success Alerts */}
              {error && (
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
              )}
              {success && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    '& .MuiAlert-message': {
                      color: '#6ee7b7',
                    },
                  }}
                >
                  {success}
                </Alert>
              )}

              {/* Enhanced submit button */}
              <GradientButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    {activeTab === 'signin' ? 'Signing In...' : 'Creating Account...'}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRightIcon sx={{ fontSize: '1rem' }} />
                  </Box>
                )}
              </GradientButton>
            </Box>

            {/* Social login divider */}
            <Box sx={{ position: 'relative', my: 1.5 }}>
              <Divider sx={{ borderColor: '#475569' }} />
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  px: 2,
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                }}
              >
                Or continue with
              </Typography>
            </Box>

            {/* Social login buttons */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <SocialButton variant="outlined" fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Box>
              </SocialButton>
              <SocialButton variant="outlined" fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Box>
              </SocialButton>
            </Box>

            {/* Sign up prompt */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {activeTab === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <Button
                  type="button"
                  onClick={() => handleTabChange(activeTab === 'signin' ? 'signup' : 'signin')}
                  sx={{
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { color: '#60a5fa' },
                  }}
                >
                  {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
                </Button>
              </Typography>
            </Box>
          </Box>
        </ContentCard>
      </Box>
    </AnimatedContainer>
  )
} 