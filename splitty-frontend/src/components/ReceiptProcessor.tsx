import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  TextField, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  MobileStepper,
  Grow,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { API_ENDPOINTS } from '../config/api';
import Switch from '@mui/material/Switch';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface ReceiptItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
}

interface ReceiptProcessorProps {
  imageData: string;
  onComplete?: (results: any) => void;
}

const BG_COLOR = '#F9FAFB';
const CARD_BORDER = '#E5E7EB';
const CARD_SHADOW = '0 8px 32px rgba(30,41,59,0.10)';
const CARD_RADIUS = 24;
const CARD_PADDING = 32;
const ITEM_RADIUS = 16;
const ITEM_SPACING = 24;
const USERNAME_FONT = {
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: 24,
  fontFamily: 'Inter, system-ui, sans-serif',
};
const ITEM_NAME_FONT = {
  fontWeight: 500,
  fontSize: '1.13rem',
  color: '#1A1A1A',
  fontFamily: 'Inter, system-ui, sans-serif',
};
const ITEM_SUB_FONT = {
  fontSize: '0.97rem',
  color: '#6B7280',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  maxWidth: 480,
  marginLeft: 'auto',
  marginRight: 'auto',
  background: theme.palette.background.default,
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[3],
}));

const ParticipantCard = styled(Card)<{active?: boolean}>(({ theme, active }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  margin: theme.spacing(1, 0),
  borderRadius: theme.spacing(3),
  boxShadow: active ? theme.shadows[6] : theme.shadows[1],
  transform: active ? 'scale(1.03)' : 'scale(1)',
  transition: 'box-shadow 0.3s, transform 0.3s',
  background: theme.palette.background.paper,
}));

const SwipeableCard = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(1, 0),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ItemCard = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 12,
  boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
  background: '#F7F8FA',
  padding: '16px 14px',
  marginBottom: 16,
  width: '100%',
}));

const ItemInfo = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}));

const ItemName = styled(Typography)(() => ({
  fontWeight: 600,
  fontSize: '1.08rem',
  color: '#1A1A1A',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
}));

const ItemDetails = styled(Typography)(() => ({
  fontSize: '0.97rem',
  color: '#6B7280',
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
}));

const ItemCheckbox = styled(Checkbox)(() => ({
  marginLeft: 12,
  color: '#2563eb',
  '&.Mui-checked': {
    color: '#2563eb',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 26,
  },
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'visible',
  position: 'relative',
  minHeight: 520,
  [theme.breakpoints.down('sm')]: {
    minHeight: 480,
  },
}));

const CarouselCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{active?: boolean}>(({ active, theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 420,
  minHeight: 420,
  margin: '0 auto',
  background: '#fff',
  borderRadius: 24,
  boxShadow: active ? '0 8px 32px rgba(30,41,59,0.10)' : '0 2px 8px rgba(30,41,59,0.04)',
  border: `1.5px solid ${theme.palette.divider}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: theme.spacing(3, 2),
  fontFamily: 'Inter, system-ui, sans-serif',
  zIndex: active ? 2 : 1,
  transform: active ? 'scale(1)' : 'scale(0.97)',
  opacity: active ? 1 : 0.8,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 1.5),
    minHeight: 380,
  },
}));

const UserName = styled(Box)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  fontFamily: 'Inter, system-ui, sans-serif',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
    marginBottom: theme.spacing(1.5),
  },
}));

const ItemsList = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
}));

const ItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 16,
  background: theme.palette.background.default,
  padding: theme.spacing(2),
  boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(30,41,59,0.10)',
    background: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const ParticipantInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      '& > fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5),
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
  },
}));

const ParticipantChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(0.5),
  '& .MuiSvgIcon-root': {
    marginLeft: theme.spacing(1),
    fontSize: '1.2rem',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8,
    },
  },
}));

// SVG for scalloped (receipt) edge
const ScallopEdge = styled('svg')({
  display: 'block',
  width: '100%',
  height: 16,
  marginBottom: -6,
  marginTop: -6,
});

// ReceiptCard for depop-style look
const ReceiptCard = styled(Box)(({ theme }) => ({
  background: '#fff',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(30,41,59,0.10)',
  maxWidth: 400,
  width: '100%',
  margin: '0 auto',
  padding: theme.spacing(4, 3, 3, 3),
  position: 'relative',
  fontFamily: 'Inter, system-ui, sans-serif',
  overflow: 'hidden',
}));

const ReceiptTable = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ReceiptRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px dashed #e5e7eb`,
  fontSize: '1.05rem',
  fontFamily: 'Menlo, monospace',
}));

const ReceiptTotalRow = styled(ReceiptRow)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.15rem',
  borderBottom: 'none',
  marginTop: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const SelectAllButton = styled(Button)(({ theme }) => ({
  fontSize: '0.85rem',
  textTransform: 'none',
  padding: theme.spacing(0.5, 2),
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  background: '#f3f4f6',
  color: theme.palette.primary.main,
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    background: theme.palette.primary.light,
    color: '#fff',
  },
}));

// Responsive scalloped wrapper for receipt
const ReceiptScallopedWrapper = styled(Box)(({ theme }) => ({
  width: '100vw',
  maxWidth: 440,
  margin: '0 auto',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingTop: 'env(safe-area-inset-top)',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '98vw',
    width: '98vw',
    paddingLeft: 'max(env(safe-area-inset-left), 2vw)',
    paddingRight: 'max(env(safe-area-inset-right), 2vw)',
  },
}));

const ResponsiveReceiptCard = styled(ReceiptCard)(({ theme }) => ({
  width: '100%',
  maxWidth: 440,
  minWidth: 0,
  padding: 'clamp(16px, 4vw, 32px)',
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '98vw',
    padding: 'clamp(8px, 4vw, 20px)',
  },
}));

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const PillToggle = styled('span')<{checked: boolean}>(({ theme, checked }) => ({
  display: 'inline-block',
  width: 36,
  height: 22,
  borderRadius: 9999,
  background: checked ? theme.palette.secondary.main : '#e5e7eb',
  position: 'relative',
  transition: 'background 0.2s',
  cursor: 'pointer',
  verticalAlign: 'middle',
  boxShadow: checked ? '0 2px 8px rgba(37,99,235,0.10)' : 'none',
  border: checked ? `1.5px solid ${theme.palette.secondary.main}` : '1.5px solid #e5e7eb',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 2,
    left: checked ? 18 : 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 4px rgba(30,41,59,0.10)',
    transition: 'left 0.2s',
    border: checked ? `2px solid ${theme.palette.secondary.main}` : '2px solid #e5e7eb',
  },
}));

const steps = ['Processing', "Add Names", "Assign Items", "Summary"];
const StepperBar = styled(Box)(({ theme }) => ({
  width: '100vw',
  maxWidth: 440,
  margin: '0 auto',
  padding: theme.spacing(0, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));
const StepDot = styled('span')<{active: boolean}>(({ theme, active }) => ({
  width: active ? 18 : 10,
  height: active ? 18 : 10,
  borderRadius: '50%',
  background: active ? theme.palette.primary.main : theme.palette.divider,
  border: active ? `2px solid ${theme.palette.secondary.main}` : 'none',
  transition: 'all 0.2s',
  display: 'inline-block',
}));

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ imageData, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [userTotals, setUserTotals] = useState<Record<string, number>>({});
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [currentStep, setCurrentStep] = useState<'loading' | 'participants' | 'assignments' | 'summary'>('loading');
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputError, setInputError] = useState(false);
  const [chipKey, setChipKey] = useState(0); // for animation

  // Process receipt when component mounts
  React.useEffect(() => {
    processReceipt();
  }, [imageData]);

  const processReceipt = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.processReceipt, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          target_currency: 'USD',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
        setSourceCurrency(data.source_currency);
        setTargetCurrency(data.target_currency);
        setCurrentStep('participants');
      } else {
        setError(data.error || 'Failed to process receipt');
      }
    } catch (err) {
      setError('Failed to process receipt');
    } finally {
      setLoading(false);
    }
  };

  // Animated add with shake if empty
  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
      setInputError(false);
      setChipKey(prev => prev + 1);
    } else {
      setInputError(true);
      setTimeout(() => setInputError(false), 500);
    }
  };

  const removeParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const handleParticipantKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddParticipant();
    }
  };

  const toggleItemAssignment = (itemIndex: number, participant: string) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    
    if (!item.shared_by) {
      item.shared_by = [];
    }

    const participantIndex = item.shared_by.indexOf(participant);
    if (participantIndex === -1) {
      item.shared_by.push(participant);
    } else {
      item.shared_by.splice(participantIndex, 1);
    }

    setItems(updatedItems);
  };

  const calculateBill = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.splitBill, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          participants,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUserTotals(data.user_totals);
        setCurrentStep('summary');
      } else {
        setError(data.error || 'Failed to calculate bill split');
      }
    } catch (err) {
      setError('Failed to calculate bill split');
    }
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case 'loading': return 0;
      case 'participants': return 1;
      case 'assignments': return 2;
      case 'summary': return 3;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: theme.palette.background.default }}>
        <CircularProgress size={64} thickness={5} sx={{ color: theme.palette.secondary.main }} />
        <Typography variant="h6" mt={4} color="text.secondary" fontWeight={600}>
          Processing receipt...
        </Typography>
        <Typography variant="body2" mt={2} color="text.secondary" align="center">
          This may take a few seconds depending on receipt size.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <StyledPaper>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </StyledPaper>
    );
  }

  if (currentStep === 'participants') {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>
        <ReceiptScallopedWrapper>
          <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none">
            <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
          </ScallopEdge>
          <ResponsiveReceiptCard sx={{ background: theme.palette.background.paper, p: { xs: 4, sm: 8 } }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
              <GroupIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Box sx={{ width: 48, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, mb: 2 }} />
              <Typography 
                variant="h5" 
                fontWeight={700} 
                align="center" 
                gutterBottom 
                sx={{ 
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1, 
                  letterSpacing: 1, 
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    borderRadius: 3,
                    opacity: 0.5
                  }
                }}
              >
                Who's Splitting the Bill?
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" mb={2} sx={{ fontSize: '1.2rem' }}>
                Add the names of everyone splitting the bill. You can add or remove names as needed.
              </Typography>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleAddParticipant(); }}
                  placeholder="Enter name"
                  variant="outlined"
                  size="medium"
                  fullWidth
                  error={inputError}
                  sx={{
                    borderRadius: 3,
                    background: theme.palette.background.default,
                    boxShadow: inputError ? `0 0 0 2px ${theme.palette.error.main}` : '0 1px 4px rgba(30,41,59,0.04)',
                    animation: inputError ? 'shake 0.3s' : 'none',
                    '@keyframes shake': {
                      '0%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-6px)' },
                      '50%': { transform: 'translateX(6px)' },
                      '75%': { transform: 'translateX(-6px)' },
                      '100%': { transform: 'translateX(0)' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddParticipant}
                  disabled={!newParticipant.trim()}
                  color="secondary"
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    px: 3,
                    py: 1.2,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: '#fff',
                    letterSpacing: 0.5,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ mt: 2, width: '100%', display: 'flex', flexWrap: 'wrap', gap: 2, rowGap: 2, columnGap: 4 }}>
                {participants.map((participant, index) => (
                  <Grow in key={participant + chipKey}>
                    <Chip
                      label={participant}
                      onDelete={() => removeParticipant(index)}
                      sx={{
                        background: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        px: 2,
                        py: 1,
                        borderRadius: '999px',
                        boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                        '& .MuiChip-deleteIcon': {
                          color: theme.palette.secondary.light,
                          '&:hover': { color: theme.palette.secondary.main },
                        },
                      }}
                    />
                  </Grow>
                ))}
              </Box>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon />}
              sx={{
                mt: 4,
                width: '100%',
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.15rem',
                py: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff',
                boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                textTransform: 'none',
                letterSpacing: 0.5,
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                },
                opacity: participants.length === 0 ? 0.5 : 1,
                pointerEvents: participants.length === 0 ? 'none' : 'auto',
                transition: 'opacity 0.2s',
              }}
              onClick={() => setCurrentStep('assignments')}
              disabled={participants.length === 0}
              size="large"
            >
              Continue to Item Assignment
            </Button>
          </ResponsiveReceiptCard>
          <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
          </ScallopEdge>
        </ReceiptScallopedWrapper>
      </Box>
    );
  }

  if (currentStep === 'assignments') {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>
        <StepperBar>
          {steps.map((label, idx) => (
            <StepDot key={label} active={getStepIndex() === idx} />
          ))}
        </StepperBar>
        <CarouselContainer>
          <SwipeableViews
            index={activeStep}
            onChangeIndex={setActiveStep}
            enableMouseEvents
            resistance
            style={{ width: '100%', maxWidth: 440 }}
            containerStyle={{ overflow: 'visible', width: '100%', maxWidth: 440 }}
          >
            {participants.map((participant, index) => {
              const handleSelectAll = () => {
                const updatedItems = items.map(item => ({
                  ...item,
                  shared_by: Array.from(new Set([...(item.shared_by || []), participant]))
                }));
                setItems(updatedItems);
              };
              return (
                <ReceiptScallopedWrapper key={participant}>
                  <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none">
                    <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
                  </ScallopEdge>
                  <ResponsiveReceiptCard sx={{ background: theme.palette.background.paper }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        sx={{ 
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontFamily: 'Inter, system-ui, sans-serif', 
                          letterSpacing: 1, 
                          fontSize: { xs: 'clamp(1.05rem, 3vw, 1.25rem)', sm: '1.2rem', md: '1.25rem' },
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: 0,
                            width: '100%',
                            height: 2,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            borderRadius: 2,
                            opacity: 0.5
                          }
                        }}
                      >
                        {participant}
                      </Typography>
                      <SelectAllButton
                        onClick={handleSelectAll}
                        size="small"
                        sx={{
                          background: theme.palette.secondary.light,
                          color: theme.palette.secondary.main,
                          borderRadius: 9999,
                          px: 2.5,
                          py: 0.5,
                          fontWeight: 700,
                          fontSize: '0.97rem',
                          boxShadow: 'none',
                          letterSpacing: 0.2,
                          '&:hover': { background: theme.palette.secondary.main, color: '#fff' },
                        }}
                      >
                        Select All
                      </SelectAllButton>
                    </Box>
                    <ReceiptTable>
                      {items.map((item, itemIndex) => (
                        <ReceiptRow key={itemIndex} sx={{ opacity: 1, fontSize: { xs: 'clamp(0.95rem, 2.5vw, 1.05rem)', sm: '1.05rem' }, borderBottom: `1.5px solid ${theme.palette.divider}` }}>
                          <Box sx={{ fontWeight: item.shared_by?.includes(participant) ? 600 : 400, color: theme.palette.text.primary }}>{item.item}</Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ minWidth: 60, textAlign: 'right', fontSize: { xs: 'clamp(0.95rem, 2.5vw, 1.05rem)', sm: '1.05rem' }, color: theme.palette.text.primary }}>
                              {targetCurrency} {item.converted_total?.toFixed(2) || item.total.toFixed(2)}
                            </Typography>
                            <PillToggle
                              checked={item.shared_by?.includes(participant) || false}
                              onClick={() => toggleItemAssignment(itemIndex, participant)}
                              role="checkbox"
                              aria-checked={item.shared_by?.includes(participant) || false}
                              tabIndex={0}
                              sx={{ ml: 2 }}
                            />
                          </Box>
                        </ReceiptRow>
                      ))}
                    </ReceiptTable>
                  </ResponsiveReceiptCard>
                  <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}>
                    <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
                  </ScallopEdge>
                </ReceiptScallopedWrapper>
              );
            })}
          </SwipeableViews>
        </CarouselContainer>
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: '#fff',
              borderRadius: 12,
              fontWeight: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              px: 4,
              py: 1.5,
              fontSize: { xs: 'clamp(1rem, 2.5vw, 1.08rem)', sm: '1.08rem' },
              boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
            }}
            onClick={calculateBill}
            disabled={items.some(item => !item.shared_by?.length)}
            size="large"
          >
            Calculate Split
          </Button>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'summary') {
    const total = Object.values(userTotals).reduce((sum, v) => sum + v, 0);
    return (
      <Box sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>
        <StepperBar>
          {steps.map((label, idx) => (
            <StepDot key={label} active={getStepIndex() === idx} />
          ))}
        </StepperBar>
        <ReceiptScallopedWrapper>
          <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none">
            <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
          </ScallopEdge>
          <ResponsiveReceiptCard sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[6], borderRadius: 6, p: { xs: 4, sm: 8 } }}>
            <Typography 
              variant="h4" 
              align="center" 
              fontWeight={700} 
              sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2, 
                fontFamily: 'Inter, system-ui, sans-serif', 
                letterSpacing: 1, 
                fontSize: { xs: 'clamp(1.2rem, 4vw, 1.7rem)', sm: '1.7rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  borderRadius: 3,
                  opacity: 0.5
                }
              }}
            >
              Splitty
            </Typography>
            <ReceiptTable>
              {Object.entries(userTotals).map(([user, amount]) => (
                <ReceiptRow key={user} sx={{ fontSize: { xs: 'clamp(0.95rem, 2.5vw, 1.05rem)', sm: '1.05rem' }, color: theme.palette.text.primary, borderBottom: `1.5px solid ${theme.palette.divider}` }}>
                  <Box>{user}</Box>
                  <Box>{targetCurrency} {formatCurrency(amount, targetCurrency)}</Box>
                </ReceiptRow>
              ))}
              <ReceiptTotalRow sx={{ color: theme.palette.primary.main }}>
                <Box>Total</Box>
                <Box>{targetCurrency} {formatCurrency(total, targetCurrency)}</Box>
              </ReceiptTotalRow>
            </ReceiptTable>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              All amounts are in {targetCurrency}.
            </Typography>
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  fontSize: { xs: 'clamp(1rem, 2.5vw, 1.08rem)', sm: '1.08rem' },
                  boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                  textTransform: 'none',
                  '&:hover': {
                    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                }}
                onClick={() => onComplete?.(userTotals)}
                size="large"
              >
                Done
              </Button>
            </Box>
          </ResponsiveReceiptCard>
          <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
          </ScallopEdge>
        </ReceiptScallopedWrapper>
      </Box>
    );
  }

  return null;
};

export default ReceiptProcessor; 