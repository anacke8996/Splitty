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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API_ENDPOINTS } from '../config/api';
import Switch from '@mui/material/Switch';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CurrencySelector from './CurrencySelector';

interface ReceiptItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount';
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

// Remove the PillToggle styled component and add a new styled Checkbox
const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 8,
  '& .MuiSvgIcon-root': {
    fontSize: 28,
    color: theme.palette.primary.main,
  },
  '&.Mui-checked': {
    '& .MuiSvgIcon-root': {
      color: theme.palette.secondary.main,
    },
  },
}));

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ imageData, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [currentStep, setCurrentStep] = useState<'loading' | 'currency' | 'participants' | 'assignments' | 'confirmation' | 'summary'>('loading');
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputError, setInputError] = useState(false);
  const [chipKey, setChipKey] = useState(0);
  const [unassignedItems, setUnassignedItems] = useState<ReceiptItem[]>([]);
  const [userTotals, setUserTotals] = useState<Record<string, number>>({});


  // Only process receipt when component mounts - don't auto-assign special items repeatedly
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
          imageBase64: imageData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Convert new GPT format to component format (preserving original currency)
        const convertedItems = data.items.map((item: any) => ({
          item: item.item,
          price: item.price,
          qty: item.qty,
          total: item.total,
          converted_price: item.price,
          converted_total: item.total,
          isSpecialItem: item.isSpecialItem || false,
          specialType: item.specialType
        }));
        
        setItems(convertedItems);
        setSourceCurrency(data.currency); // Use detected currency from receipt
        setTargetCurrency(data.currency); // Default to same currency (no conversion)
        setCurrentStep('currency');
      } else {
        setError(data.error || 'Failed to process receipt');
      }
    } catch (err) {
      setError('Failed to process receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setTargetCurrency(newCurrency);
    
    // If same currency as original, no conversion needed
    if (newCurrency === sourceCurrency) {
      setCurrentStep('participants');
      return;
    }
    
    // Convert currency if different from original
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.convertCurrency, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          fromCurrency: sourceCurrency,
          toCurrency: newCurrency,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
        setCurrentStep('participants');
      } else {
        setError(data.error || 'Failed to convert currency');
      }
    } catch (err) {
      console.error('Currency conversion error:', err);
      setError('Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  // Animated add with shake if empty
  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      const newParticipants = [...participants, newParticipant.trim()];
      setParticipants(newParticipants);
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
    const removedParticipant = newParticipants[index];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
    
    // Update item assignments - remove participant from all items they were assigned to
    const updatedItems = [...items];
    updatedItems.forEach(item => {
      if (item.shared_by) {
        // Remove the participant from all items (both regular and special)
        item.shared_by = item.shared_by.filter(p => p !== removedParticipant);
      }
    });
    setItems(updatedItems);
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



  // Helper function to determine checkbox state
  const getCheckboxState = (item: ReceiptItem, participant: string, itemIndex: number) => {
    return item.shared_by?.includes(participant) || false;
  };

  // Helper function to get unassigned items (excluding special items which are auto-assigned)
  const getUnassignedItems = () => {
    return items.filter(item => 
      (!item.shared_by || item.shared_by.length === 0) && 
      !item.isSpecialItem
    );
  };

  // Helper function to check if there are unassigned items
  const hasUnassignedItems = () => {
    return getUnassignedItems().length > 0;
  };

  // Helper function to get assignment progress
  const getAssignmentProgress = () => {
    const totalItems = items.filter(item => !item.isSpecialItem).length;
    const assignedItems = items.filter(item => 
      !item.isSpecialItem && item.shared_by && item.shared_by.length > 0
    ).length;
    return { assigned: assignedItems, total: totalItems };
  };

  // Helper function to automatically assign special items to all participants
  const assignSpecialItemsToAllParticipants = () => {
    const updatedItems = items.map(item => {
      // Only assign special items that don't have any assignments yet (first time only)
      if (item.isSpecialItem && (!item.shared_by || item.shared_by.length === 0)) {
        return {
          ...item,
          shared_by: [...participants] // Assign all special items to all participants
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const calculateBill = async () => {
    try {
      // Comprehensive validation before processing
      if (participants.length === 0) {
        setError('Please add at least one participant');
        return;
      }

      if (items.length === 0) {
        setError('No items found in the receipt');
        return;
      }

      // Check for unassigned items first
      const unassigned = getUnassignedItems();
      if (unassigned.length > 0) {
        setUnassignedItems(unassigned);
        setCurrentStep('confirmation');
        return;
      }

      // Final validation: ensure all non-special items are assigned
      const regularItems = items.filter(item => !item.isSpecialItem);
      const fullyAssignedItems = regularItems.filter(item => item.shared_by && item.shared_by.length > 0);
      
      if (fullyAssignedItems.length !== regularItems.length) {
        setError('Some items are not assigned to any participant');
        return;
      }

      await processBillSplit();
    } catch (error) {
      console.error('Error calculating bill:', error);
      setError('Failed to calculate bill split');
    }
  };

  const processBillSplit = async () => {
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

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to calculate bill split');
        return;
      }

      const data = await response.json();
      
      // Convert the split bill data to user totals format
      const totals: Record<string, number> = {};
      Object.entries(data).forEach(([participant, participantData]: [string, any]) => {
        totals[participant] = participantData.total;
      });
      
      setUserTotals(totals);
      setCurrentStep('summary');
    } catch (err) {
      console.error('Error calculating bill split:', err);
      setError('Failed to calculate bill split');
    }
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case 'loading': return 0;
      case 'currency': return 1;
      case 'participants': return 2;
      case 'assignments': return 3;
      case 'confirmation': return 3;
      case 'summary': return 4;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Processing receipt...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 3 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error
        </Typography>
        <Typography color="text.secondary" align="center">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => onComplete?.({})}
          sx={{ mt: 3 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (currentStep === 'currency') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 3 }}>
        <CurrencySelector
          sourceCurrency={sourceCurrency}
          targetCurrency={targetCurrency}
          onTargetCurrencyChange={handleCurrencyChange}
        />
      </Box>
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
        padding: { xs: 2, sm: 3 },
      }}>
        {/* White Card Container */}
        <Box sx={{
          background: '#fff',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          maxWidth: '480px',
          width: '100%',
          padding: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Styled Icon */}
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}>
            <GroupIcon sx={{ 
              fontSize: 40, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }} />
          </Box>

          {/* Title and Subtitle */}
          <Typography 
            variant="h5" 
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            Who's Splitting the Bill?
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              textAlign: 'center',
              mb: 4,
              fontSize: '0.95rem',
            }}
          >
            Add the names of everyone splitting the bill. You can add or remove names as needed.
          </Typography>

          {/* Rounded Rectangle Input Container */}
          <Box sx={{
            width: '100%',
            display: 'flex',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: 'inset 0 0 0 1px #e5e7eb',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}>
            <TextField
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddParticipant(); }}
              placeholder="Enter name"
              variant="outlined"
              autoFocus
              fullWidth
              error={inputError}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  border: 'none',
                  borderRadius: { xs: '12px', sm: '12px 0 0 12px' },
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '16px 20px',
                  fontSize: '1rem',
                },
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
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: { xs: '12px', sm: '0 12px 12px 0' },
                padding: '16px 24px',
                minWidth: { xs: 'auto', sm: '80px' },
                boxShadow: 'none',
                border: 'none',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  boxShadow: 'none',
                },
                '&:disabled': {
                  background: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              Add
            </Button>
          </Box>

          {/* Participant Chips */}
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1.5, 
            mb: 4,
            justifyContent: 'center',
          }}>
            {participants.map((participant, index) => (
              <Grow in key={participant + chipKey}>
                <Chip
                  label={participant}
                  onDelete={() => removeParticipant(index)}
                  sx={{
                    background: theme.palette.primary.main,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    padding: '8px 4px',
                    borderRadius: '999px',
                    boxShadow: '0 2px 8px rgba(30,41,59,0.08)',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255,255,255,0.8)',
                      '&:hover': { 
                        color: '#fff',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                      },
                    },
                  }}
                />
              </Grow>
            ))}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            {/* Back Button */}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '16px 24px',
                border: `2px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                minWidth: { xs: '100%', sm: '140px' },
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`,
                  color: theme.palette.primary.main,
                  background: `${theme.palette.primary.main}08`,
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => setCurrentStep('currency')}
            >
              Back
            </Button>

            {/* Continue Button */}
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon sx={{ 
                transition: 'transform 0.2s ease',
                '.MuiButton-root:hover &': {
                  transform: 'translateX(4px)',
                }
              }} />}
              sx={{
                flex: 1,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1.1rem',
                padding: '16px 24px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                textTransform: 'none',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
                opacity: participants.length === 0 ? 0.5 : 1,
                pointerEvents: participants.length === 0 ? 'none' : 'auto',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  '& .MuiSvgIcon-root': {
                    transform: 'translateX(4px)',
                  },
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
              }}
              onClick={() => {
                assignSpecialItemsToAllParticipants();
                setCurrentStep('assignments');
              }}
              disabled={participants.length === 0}
              size="large"
            >
              Continue to Item Assignment
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'assignments') {
    const getCurrencySymbol = (currencyCode: string) => {
      const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'SEK': 'kr',
        'NOK': 'kr',
        'MXN': '$',
        'NZD': 'NZ$',
        'SGD': 'S$',
        'HKD': 'HK$',
        'INR': '₹',
        'KRW': '₩',
        'BRL': 'R$',
        'ZAR': 'R',
        'RUB': '₽',
        'TRY': '₺',
      };
      return symbols[currencyCode] || currencyCode;
    };

    return (
      <Box sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
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
        
        {/* Participant Indicator */}
        {participants.length > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            px: 2,
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {activeStep + 1} of {participants.length}:
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '1rem',
            }}>
              {participants[activeStep]}
            </Typography>
          </Box>
        )}
        
        {/* Scrollable Content Area */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: { xs: '100px', sm: '20px' }, // Space for sticky button
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          pt: 2,
          position: 'relative', // For positioning navigation arrows
        }}>
          {/* Navigation Arrows */}
          {participants.length > 1 && (
            <>
              <IconButton
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                sx={{
                  position: 'absolute',
                  left: { xs: 10, sm: 20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1001,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    transform: 'translateY(-50%) scale(1.05)',
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    transform: 'translateY(-50%) scale(0.95)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                onClick={() => setActiveStep(Math.min(participants.length - 1, activeStep + 1))}
                disabled={activeStep === participants.length - 1}
                sx={{
                  position: 'absolute',
                  right: { xs: 10, sm: 20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1001,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    transform: 'translateY(-50%) scale(1.05)',
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    transform: 'translateY(-50%) scale(0.95)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <KeyboardArrowRight />
              </IconButton>
            </>
          )}
          
          <CarouselContainer>
            <SwipeableViews
              index={activeStep}
              onChangeIndex={setActiveStep}
              enableMouseEvents
              disabled={false}
              resistance
              threshold={8}
              hysteresis={0.4}
              style={{ width: '100%', maxWidth: 440 }}
              containerStyle={{ overflow: 'visible', width: '100%', maxWidth: 440 }}
              slideStyle={{ overflow: 'visible' }}
              springConfig={{
                duration: '0.25s',
                easeFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                delay: '0s',
              }}
            >
              {participants.map((participant, index) => {
                const handleSelectAll = () => {
                  // Check if all non-tax items are already selected for this participant
                  const nonTaxItems = items.filter(item => !item.isSpecialItem);
                  const allSelected = nonTaxItems.every(item => item.shared_by?.includes(participant));
                  
                  const updatedItems = items.map(item => {
                    // Skip tax items - they remain assigned to all participants
                    if (item.isSpecialItem) {
                      return item;
                    }
                    
                    if (allSelected) {
                      // Unselect all - remove participant from all non-tax items
                      return {
                        ...item,
                        shared_by: (item.shared_by || []).filter(p => p !== participant)
                      };
                    } else {
                      // Select all - add participant to all non-tax items
                      return {
                        ...item,
                        shared_by: Array.from(new Set([...(item.shared_by || []), participant]))
                      };
                    }
                  });
                  setItems(updatedItems);
                };

                // Check if all non-tax items are selected for this participant
                const nonTaxItems = items.filter(item => !item.isSpecialItem);
                const allSelected = nonTaxItems.every(item => item.shared_by?.includes(participant));
                
                return (
                  <ReceiptScallopedWrapper key={participant}>
                    <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none">
                      <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
                    </ScallopEdge>
                    <ResponsiveReceiptCard sx={{ 
                      background: theme.palette.background.paper,
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: 'none', // Remove height constraint
                    }}>
                      {/* Header Section - Fixed */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        mb: 2,
                        py: 1.5,
                        flexShrink: 0,
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: 'Inter, system-ui, sans-serif', 
                            letterSpacing: 0.5,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: -6,
                              left: 0,
                              width: '100%',
                              height: 2,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                              borderRadius: 2,
                              opacity: 0.3
                            }
                          }}
                        >
                          {participant}
                        </Typography>
                        <SelectAllButton 
                          onClick={handleSelectAll}
                          sx={{
                            background: allSelected ? theme.palette.secondary.light : '#f3f4f6',
                            color: allSelected ? '#fff' : theme.palette.primary.main,
                            '&:hover': {
                              background: allSelected ? theme.palette.secondary.main : theme.palette.primary.light,
                              color: '#fff',
                            },
                          }}
                        >
                          {allSelected ? 'Unselect All' : 'Select All'}
                        </SelectAllButton>
                      </Box>

                      {/* Scrollable Items List */}
                      <ReceiptTable sx={{ 
                        flex: 1,
                        minHeight: 0, // Allow shrinking
                        maxHeight: 'none', // Remove height constraint
                        overflowY: 'visible', // Let parent handle scrolling
                        '&::-webkit-scrollbar': {
                          display: 'none', // Hide scrollbar since parent will handle it
                        },
                      }}>
                        {items.map((item, itemIndex) => {
                          const isTaxItem = item.isSpecialItem;
                          
                          // Helper function to get special item label and color
                          const getSpecialItemDisplay = (item: ReceiptItem) => {
                            if (!item.isSpecialItem) return null;
                            
                            const displays = {
                              'tax': { label: 'TAX', color: '#0ea5e9' },
                              'tip': { label: 'TIP', color: '#10b981' },
                              'service_charge': { label: 'SERVICE', color: '#f59e0b' },
                              'discount': { label: 'DISCOUNT', color: '#8b5cf6' }
                            };
                            
                            return displays[item.specialType || 'tax'] || displays['tax'];
                          };
                          
                          const specialDisplay = getSpecialItemDisplay(item);
                          
                          return (
                            <ReceiptRow 
                              key={itemIndex} 
                              sx={{ 
                                minHeight: '48px',
                                py: 1.5,
                                px: 0.5,
                                fontSize: '1rem',
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                cursor: 'pointer',
                                borderRadius: '8px',
                                mb: 0.5,
                                backgroundColor: isTaxItem ? `${specialDisplay?.color}08` : 'transparent',
                                border: isTaxItem ? `1px solid ${specialDisplay?.color}` : 'none',
                                '&:hover': {
                                  backgroundColor: isTaxItem ? `${specialDisplay?.color}15` : theme.palette.action.hover,
                                },
                                '&:last-child': {
                                  borderBottom: 'none',
                                  mb: 0,
                                },

                              }}
                              onClick={() => toggleItemAssignment(itemIndex, participant)}
                            >
                              <Box sx={{ 
                                fontWeight: item.shared_by?.includes(participant) ? 600 : 400, 
                                color: theme.palette.text.primary,
                                flex: 1,
                                pr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}>
                                {isTaxItem && specialDisplay && (
                                  <Box sx={{
                                    backgroundColor: specialDisplay.color,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                  }}>
                                    {specialDisplay.label}
                                  </Box>
                                )}
                                <Box>
                                  {item.item}{item.qty > 1 ? ` (x ${item.qty})` : ''}
                                  {isTaxItem && (
                                    <Box sx={{ 
                                      fontSize: '0.75rem', 
                                      color: specialDisplay?.color || '#0ea5e9',
                                      fontWeight: 500,
                                      mt: 0.5,
                                    }}>
                                      Usually shared by all participants (click to change)
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ 
                                  minWidth: 'auto',
                                  textAlign: 'right', 
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                }}>
                                  {getCurrencySymbol(targetCurrency)}{(item.converted_total?.toFixed(2) || item.total.toFixed(2))}
                                </Typography>
                                <StyledCheckbox
                                  checked={getCheckboxState(item, participant, itemIndex)}
                                  disabled={false}
                                  onChange={(e) => {
                                    e.preventDefault(); // Prevent default checkbox behavior
                                    e.stopPropagation(); // Prevent event bubbling to parent row
                                    toggleItemAssignment(itemIndex, participant);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling to parent row
                                  }}
                                  sx={{ 
                                    ml: 0.5,
                                    color: isTaxItem ? (specialDisplay?.color || '#0ea5e9') : 'default',
                                    '&.Mui-checked': {
                                      color: specialDisplay?.color || '#0ea5e9',
                                    },

                                  }}
                                />
                              </Box>
                            </ReceiptRow>
                          );
                        })}
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
        </Box>
        
        {/* Unassigned Items Warning */}
        {hasUnassignedItems() && (
          <Box sx={{
            position: { xs: 'fixed', sm: 'static' },
            bottom: { xs: 90, sm: 'auto' },
            left: { xs: 20, sm: 'auto' },
            right: { xs: 20, sm: 'auto' },
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 0, sm: 2 },
            mb: { xs: 0, sm: 2 },
          }}>
            <Box sx={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              maxWidth: '400px',
              width: '100%',
            }}>
              <Typography sx={{ fontSize: '1.2rem' }}>⚠️</Typography>
              <Typography sx={{
                fontSize: '0.9rem',
                color: '#856404',
                fontWeight: 500,
              }}>
                {getUnassignedItems().length} item{getUnassignedItems().length > 1 ? 's' : ''} not assigned to anyone
              </Typography>
            </Box>
          </Box>
        )}

        {/* Sticky Navigation Buttons */}
        <Box sx={{
          position: { xs: 'fixed', sm: 'static' },
          bottom: { xs: 20, sm: 'auto' },
          left: { xs: 20, sm: 'auto' },
          right: { xs: 20, sm: 'auto' },
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mt: { xs: 0, sm: 3 },
          mb: { xs: 0, sm: 2 },
          px: { xs: 0, sm: 2 },
        }}>
          {/* Back Button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: 12,
              fontWeight: 600,
              fontSize: '1rem',
              px: { xs: 3, sm: 2 },
              py: { xs: 2, sm: 1.5 },
              border: `2px solid ${theme.palette.divider}`,
              color: theme.palette.text.secondary,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              minWidth: { xs: '120px', sm: '100px' },
              '&:hover': {
                border: `2px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
                background: `${theme.palette.primary.main}08`,
                transform: 'translateY(-1px)',
              },
            }}
            onClick={() => setCurrentStep('participants')}
          >
            Back
          </Button>
          
          {/* Progress and Calculate Split Button */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            flex: 1,
            maxWidth: { xs: 'none', sm: '200px' },
          }}>
            {/* Progress Indicator */}
            {(() => {
              const progress = getAssignmentProgress();
              const isComplete = progress.assigned === progress.total;
              
              return (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  color: isComplete ? theme.palette.success.main : theme.palette.warning.main,
                  fontWeight: 500,
                }}>
                  {isComplete ? (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        All items assigned!
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {progress.assigned}/{progress.total} items assigned
                      </Typography>
                    </>
                  )}
                </Box>
              );
            })()}
            
            {/* Calculate Split Button */}
            <Button
              variant="contained"
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff',
                borderRadius: 12,
                fontWeight: 600,
                fontFamily: 'Inter, system-ui, sans-serif',
                px: { xs: 4, sm: 3 },
                py: { xs: 2, sm: 1.5 },
                fontSize: '1.1rem',
                boxShadow: { xs: '0 4px 20px rgba(0,0,0,0.15)', sm: '0 2px 8px rgba(30,41,59,0.07)' },
                textTransform: 'none',
                width: '100%',
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                },
                '&:disabled': {
                  background: '#e5e7eb',
                  color: '#9ca3af',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={calculateBill}
              disabled={items.some(item => 
                !item.shared_by?.length && 
                !item.isSpecialItem
              )}
              size="large"
            >
              Calculate Split
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'confirmation') {
    const getCurrencySymbol = (currencyCode: string) => {
      const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'SEK': 'kr',
        'NOK': 'kr',
        'MXN': '$',
        'NZD': 'NZ$',
        'SGD': 'S$',
        'HKD': 'HK$',
        'INR': '₹',
        'KRW': '₩',
        'BRL': 'R$',
        'ZAR': 'R',
        'RUB': '₽',
        'TRY': '₺',
      };
      return symbols[currencyCode] || currencyCode;
    };

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
        padding: { xs: 2, sm: 3 },
      }}>
        <Box sx={{
          background: '#fff',
          borderRadius: '1.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          maxWidth: '480px',
          width: '100%',
          padding: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography 
            variant="h5" 
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            ⚠️ Items Not Assigned
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              textAlign: 'center',
              mb: 3,
              fontSize: '0.95rem',
            }}
          >
            The following items are not assigned to any participant and will be excluded from the split:
          </Typography>

          {/* Unassigned Items List */}
          <Box sx={{
            width: '100%',
            maxHeight: '300px',
            overflowY: 'auto',
            mb: 3,
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px',
          }}>
            {unassignedItems.map((item, index) => (
              <Box key={index} sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                mb: 1,
                '&:last-child': { mb: 0 },
              }}>
                <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {item.item}{item.qty > 1 ? ` (x ${item.qty})` : ''}
                </Typography>
                <Typography sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem',
                  color: theme.palette.text.secondary,
                }}>
                  {getCurrencySymbol(targetCurrency)}{(item.converted_total?.toFixed(2) || item.total.toFixed(2))}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              textAlign: 'center',
              mb: 4,
              fontSize: '0.85rem',
            }}
          >
            <strong>Recommendation:</strong> Go back and assign these items to participants for a complete split.
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              sx={{
                flex: 1,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '16px 24px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#fff',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => {
                assignSpecialItemsToAllParticipants();
                setCurrentStep('assignments');
              }}
            >
              Go Back & Assign Items
            </Button>

            <Button
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '16px 24px',
                border: `2px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: `2px solid ${theme.palette.warning.main}`,
                  color: theme.palette.warning.main,
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => processBillSplit()}
              size="large"
            >
              Continue Without These Items
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'summary') {
    const total = Object.values(userTotals).reduce((sum, v) => sum + v, 0);
    
    // Generate consistent colors for users
    const getUserColor = (user: string, index: number) => {
      const colors = [
        'rgba(59, 130, 246, 0.08)', // Blue
        'rgba(16, 185, 129, 0.08)', // Green
        'rgba(245, 101, 101, 0.08)', // Red
        'rgba(139, 92, 246, 0.08)', // Purple
        'rgba(245, 158, 11, 0.08)', // Yellow
        'rgba(236, 72, 153, 0.08)', // Pink
      ];
      return colors[index % colors.length];
    };

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
        
        {/* Animated Container */}
        <Grow in timeout={800}>
          <ReceiptScallopedWrapper>
            <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none">
              <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
            </ScallopEdge>
            <ResponsiveReceiptCard sx={{ 
              background: theme.palette.background.paper, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
              borderRadius: 6, 
              p: { xs: 4, sm: 8 },
              animation: 'slideUp 0.6s ease-out',
              '@keyframes slideUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}>
              <Typography 
                variant="h4" 
                align="center" 
                fontWeight={700} 
                sx={{ 
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3, 
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
                Bill Summary
              </Typography>
              
              {/* Enhanced Receipt Table */}
              <ReceiptTable sx={{ mt: 2, mb: 2 }}>
                {Object.entries(userTotals).map(([user, amount], index) => (
                  <ReceiptRow 
                    key={user} 
                    sx={{ 
                      fontSize: { xs: 'clamp(1rem, 2.5vw, 1.1rem)', sm: '1.1rem' }, 
                      color: theme.palette.text.primary, 
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      backgroundColor: getUserColor(user, index),
                      padding: '12px 8px',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: getUserColor(user, index).replace('0.08', '0.12'),
                        transform: 'translateX(4px)',
                      },
                      '&:last-of-type': {
                        marginBottom: '12px',
                      }
                    }}
                  >
                    <Box sx={{ fontWeight: 500 }}>{user}</Box>
                    <Box sx={{ 
                      textAlign: 'right',
                      fontWeight: 600,
                      fontFamily: 'Inter, monospace',
                      letterSpacing: '0.5px',
                    }}>
                      {formatCurrency(amount, targetCurrency)}
                    </Box>
                  </ReceiptRow>
                ))}
                
                {/* Enhanced Total Row */}
                <ReceiptTotalRow sx={{ 
                  color: theme.palette.primary.main,
                  fontSize: { xs: 'clamp(1.1rem, 3vw, 1.25rem)', sm: '1.25rem' },
                  fontWeight: 700,
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  padding: '16px 8px',
                  borderRadius: '12px',
                  border: `2px solid ${theme.palette.primary.light}`,
                  marginTop: '8px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                }}>
                  <Box sx={{ fontWeight: 700 }}>Total</Box>
                  <Box sx={{ 
                    fontWeight: 700,
                    fontFamily: 'Inter, monospace',
                    letterSpacing: '0.5px',
                  }}>
                    {formatCurrency(total, targetCurrency)}
                  </Box>
                </ReceiptTotalRow>
              </ReceiptTable>
              
              {/* Excluded Items Section */}
              {unassignedItems.length > 0 && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    Items not included in split:
                  </Typography>
                  <Box sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}>
                    {unassignedItems.map((item, index) => (
                      <Box key={index} sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        mb: 0.5,
                        '&:last-child': { mb: 0 },
                      }}>
                        <Typography sx={{ 
                          fontWeight: 500, 
                          fontSize: '0.85rem',
                          color: theme.palette.text.secondary,
                        }}>
                          {item.item}{item.qty > 1 ? ` (x ${item.qty})` : ''}
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.85rem',
                          color: theme.palette.text.secondary,
                        }}>
                          {formatCurrency(item.converted_total || item.total, targetCurrency)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2, mb: 3 }}>
                All amounts are in {targetCurrency}. Split calculated successfully! ✓
              </Typography>
              
              {/* Buttons Container */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} gap={2}>
                {/* Back Button */}
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    assignSpecialItemsToAllParticipants();
                    setCurrentStep('assignments');
                  }}
                  sx={{
                    borderRadius: 16,
                    fontWeight: 600,
                    px: 4,
                    py: 2,
                    fontSize: { xs: 'clamp(0.9rem, 2.5vw, 1rem)', sm: '1rem' },
                    textTransform: 'none',
                    letterSpacing: '0.5px',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      color: theme.palette.primary.dark,
                      backgroundColor: 'rgba(59, 130, 246, 0.04)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Back
                </Button>

                {/* Complete Split Button */}
                <Button
                  variant="contained"
                  startIcon={
                    <Box sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}>
                      ✓
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: '#fff',
                    borderRadius: 16,
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    fontSize: { xs: 'clamp(1rem, 2.5vw, 1.15rem)', sm: '1.15rem' },
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                    textTransform: 'none',
                    letterSpacing: '0.5px',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.6s ease',
                    },
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                      '&::before': {
                        left: '100%',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => {
                    // Show success feedback
                    onComplete?.(userTotals);
                  }}
                  size="large"
                >
                  Complete Split
                </Button>
              </Box>
            </ResponsiveReceiptCard>
            <ScallopEdge viewBox="0 0 400 16" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}>
              <path d="M0,8 Q12,16 25,8 T50,8 T75,8 T100,8 T125,8 T150,8 T175,8 T200,8 T225,8 T250,8 T275,8 T300,8 T325,8 T350,8 T375,8 T400,8 V16 H0Z" fill={theme.palette.background.paper} />
            </ScallopEdge>
          </ReceiptScallopedWrapper>
        </Grow>
      </Box>
    );
  }

  return null;
};

export default ReceiptProcessor; 