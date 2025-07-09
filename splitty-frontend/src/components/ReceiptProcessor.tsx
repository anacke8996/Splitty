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

// Styled components with dark theme
const ReceiptCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  maxWidth: 'min(480px, 95vw)',
  marginLeft: 'auto',
  marginRight: 'auto',
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
    margin: theme.spacing(2),
    borderRadius: theme.spacing(3),
  },
}));

const ItemCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 12,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  background: theme.palette.background.default,
  padding: theme.spacing(1.5, 1.2),
  marginBottom: theme.spacing(1.5),
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  boxSizing: 'border-box',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 1.75),
    marginBottom: theme.spacing(2),
  },
}));

const ItemInfo = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}));

const ItemName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: 'clamp(0.95rem, 2.5vw, 1.08rem)',
  color: theme.palette.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
}));

const ItemDetails = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.85rem, 2.2vw, 0.97rem)',
  color: theme.palette.text.secondary,
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 8,
  '& .MuiSvgIcon-root': {
    fontSize: 24,
    color: theme.palette.text.secondary,
  },
  '&.Mui-checked': {
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const StepperBar = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 'min(500px, 92vw)',
  margin: '0 auto',
  padding: theme.spacing(0, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    maxWidth: '95vw',
    padding: theme.spacing(0, 1),
  },
}));

const IndividualReceiptCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  margin: theme.spacing(0.5),
  maxWidth: 'min(460px, 92vw)',
  minHeight: '75vh',
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3.5),
    borderRadius: theme.spacing(2),
    maxWidth: 'min(500px, 90vw)',
    minHeight: '80vh',
  },
}));

const ReceiptHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ReceiptItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
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

const ParticipantInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
    borderRadius: 16,
    fontSize: '1rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: theme.palette.text.primary,
    '& fieldset': {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 16,
    },
    '&:hover fieldset': {
      border: `1px solid ${theme.palette.primary.main}`,
    },
    '&.Mui-focused fieldset': {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  minHeight: '100vh',
  background: theme.palette.background.default,
  width: '100%',
  boxSizing: 'border-box',
}));

const LoadingCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  maxWidth: 'min(480px, 95vw)',
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.divider}`,
}));

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const steps = ['Processing', 'Add Names', 'Assign Items', 'Summary'];

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ imageData, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [currentStep, setCurrentStep] = useState<'loading' | 'currency' | 'participants' | 'assignments' | 'summary'>('loading');
  const [activeStep, setActiveStep] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [userTotals, setUserTotals] = useState<Record<string, number>>({});
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    processReceipt();
  }, [imageData]);

  // Initialize special items to be assigned to all participants when participants change
  React.useEffect(() => {
    if (participants.length > 0) {
      const updatedItems = items.map(item => {
        if (item.isSpecialItem) {
          // Always assign special items to all participants
          return {
            ...item,
            shared_by: [...participants]
          };
        }
        return item;
      });
      setItems(updatedItems);
    }
      }, [participants]);

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
        const convertedItems = data.items.map((item: any) => ({
          item: item.item,
          price: item.price,
          qty: item.qty,
          total: item.total,
          converted_price: item.price,
          converted_total: item.total,
          isSpecialItem: item.isSpecialItem || false,
          specialType: item.specialType,
          shared_by: (item.isSpecialItem && participants.length > 0) ? [...participants] : [] // Auto-assign special items to existing participants
        }));
        
        setItems(convertedItems);
        setSourceCurrency(data.currency);
        setTargetCurrency(data.currency);
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
    
    if (newCurrency === sourceCurrency) {
      setCurrentStep('participants');
      return;
    }
    
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
        // Preserve existing shared_by assignments during currency conversion
        const updatedItems = data.items.map((convertedItem: any) => {
          const existingItem = items.find(item => item.item === convertedItem.item);
          return {
            ...convertedItem,
            shared_by: existingItem?.shared_by || (convertedItem.isSpecialItem ? [...participants] : [])
          };
        });
        setItems(updatedItems);
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

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      const newParticipantName = newParticipant.trim();
      setParticipants([...participants, newParticipantName]);
      
      // Automatically assign all special items to the new participant
      const updatedItems = items.map(item => {
        if (item.isSpecialItem) {
          return {
            ...item,
            shared_by: [...(item.shared_by || []), newParticipantName]
          };
        }
        return item;
      });
      setItems(updatedItems);
      
      setNewParticipant('');
      setInputError(false);
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
    
    // Remove the participant from all items (including special items)
    const updatedItems = items.map(item => {
      if (item.shared_by) {
        return {
          ...item,
          shared_by: item.shared_by.filter(p => p !== removedParticipant)
        };
      }
      return item;
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

  const getCheckboxState = (item: ReceiptItem, participant: string) => {
    return item.shared_by?.includes(participant) || false;
  };

  const getUnassignedItems = () => {
    return items.filter(item => 
      (!item.shared_by || item.shared_by.length === 0)
    );
  };

  const hasUnassignedItems = () => {
    return getUnassignedItems().length > 0;
  };

  const getAssignmentProgress = () => {
    const allItems = items;
    const assignedItems = allItems.filter(item => item.shared_by && item.shared_by.length > 0);
    return allItems.length === 0 ? 100 : Math.round((assignedItems.length / allItems.length) * 100);
  };

  const handleParticipantNext = () => {
    setCurrentParticipantIndex((prev) => (prev + 1) % participants.length);
  };

  const handleParticipantBack = () => {
    setCurrentParticipantIndex((prev) => (prev - 1 + participants.length) % participants.length);
  };

  const handleSwipeChange = (index: number) => {
    setCurrentParticipantIndex(index);
  };

  const getParticipantItemsAssigned = (participant: string) => {
    const assignedItems = items.filter(item => 
      item.shared_by?.includes(participant)
    );
    return assignedItems.length;
  };

  const getParticipantTotal = (participant: string) => {
    let total = 0;
    items.forEach(item => {
      const price = item.converted_price || item.price;
      const itemTotal = price * item.qty;
      
      if (item.shared_by?.includes(participant)) {
        total += itemTotal / (item.shared_by.length || 1);
      }
    });
    return total;
  };

  const selectAllFoodItems = (participant: string) => {
    const updatedItems = items.map(item => {
      if (!item.isSpecialItem) {
        if (!item.shared_by) {
          item.shared_by = [];
        }
        if (!item.shared_by.includes(participant)) {
          item.shared_by.push(participant);
        }
      }
      return item;
    });
    setItems(updatedItems);
  };

  const deselectAllFoodItems = (participant: string) => {
    const updatedItems = items.map(item => {
      if (!item.isSpecialItem && item.shared_by) {
        item.shared_by = item.shared_by.filter(p => p !== participant);
      }
      return item;
    });
    setItems(updatedItems);
  };

  const getFoodItemsSelectedCount = (participant: string) => {
    return items.filter(item => !item.isSpecialItem && item.shared_by?.includes(participant)).length;
  };

  const getTotalFoodItems = () => {
    return items.filter(item => !item.isSpecialItem).length;
  };

  const calculateBill = async () => {
    if (hasUnassignedItems()) {
      const unassignedItems = getUnassignedItems();
      const itemNames = unassignedItems.map(item => item.item).join(', ');
      alert(`Please assign all items before calculating the bill. Unassigned items: ${itemNames}`);
      return;
    }

    const totals: Record<string, number> = {};
    participants.forEach(participant => {
      totals[participant] = 0;
    });

    items.forEach(item => {
      const price = item.converted_price || item.price;
      const total = price * item.qty;
      
      if (item.shared_by && item.shared_by.length > 0) {
        const perPersonAmount = total / item.shared_by.length;
        item.shared_by.forEach(participant => {
          totals[participant] += perPersonAmount;
        });
      }
    });

    setUserTotals(totals);
    setCurrentStep('summary');
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case 'loading': return 0;
      case 'currency': return 1;
      case 'participants': return 1;
      case 'assignments': return 2;
      case 'summary': return 3;
      default: return 0;
    }
  };

  // Loading state
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingCard>
          <CircularProgress size={40} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
            Processing Receipt...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI is extracting items and prices from your receipt
          </Typography>
        </LoadingCard>
      </LoadingContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 2 
      }}>
        <Box sx={{ maxWidth: 440, width: '100%' }}>
          <ReceiptCard>
            <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
              Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              fullWidth
            >
              Try Again
            </Button>
          </ReceiptCard>
        </Box>
      </Box>
    );
  }

  // Currency selection step
  if (currentStep === 'currency') {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 2 
      }}>
        <Box sx={{ maxWidth: 440, width: '100%' }}>
          <ReceiptCard>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', color: 'text.primary' }}>
            Currency Options
          </Typography>
          
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
              Receipt processed in:
            </Typography>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main', 
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {sourceCurrency}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You can continue with {sourceCurrency} or convert to another currency below:
            </Typography>
          </Box>

          <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', background: 'background.default' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1 }}>
              💡 Want to split the bill quickly? Just click "Continue with {sourceCurrency}" below!
            </Typography>
          </Box>

          <CurrencySelector
            value={targetCurrency}
            onChange={handleCurrencyChange}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            onClick={() => handleCurrencyChange(targetCurrency)}
            fullWidth
            sx={{ py: 2 }}
            endIcon={<ArrowForwardIosIcon />}
          >
            Continue with {targetCurrency}
          </Button>
        </ReceiptCard>
        </Box>
      </Box>
    );
  }

  // Participants step
  if (currentStep === 'participants') {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 2 
      }}>
        <Box sx={{ maxWidth: 440, width: '100%' }}>
          <StepperBar>
            {steps.map((label, idx) => (
              <StepDot key={label} active={getStepIndex() === idx} />
            ))}
          </StepperBar>

        <ReceiptCard>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', color: 'text.primary' }}>
            Add Participants
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Who will be paying for this bill?
          </Typography>
          
          {participants.length === 0 && (
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary', fontSize: '0.9rem' }}>
              💡 Add at least one person to continue (you can add yourself too!)
            </Typography>
          )}

          <Box sx={{ mb: 3 }}>
            <ParticipantInput
              fullWidth
              label="Enter participant name"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={handleParticipantKeyPress}
              error={inputError}
              helperText={inputError ? 'Name already exists or is empty' : ''}
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="outlined"
              onClick={handleAddParticipant}
              startIcon={<AddIcon />}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Add Participant
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            {participants.map((participant, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  px: 2,
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'background.default',
                }}
              >
                <Typography variant="body1" color="text.primary">
                  {participant}
                </Typography>
                <IconButton
                  onClick={() => removeParticipant(index)}
                  size="small"
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentStep('currency')}
              startIcon={<ArrowBackIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setCurrentParticipantIndex(0);
                setCurrentStep('assignments');
              }}
              disabled={participants.length < 1}
              endIcon={<ArrowForwardIosIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              Continue
            </Button>
          </Box>
        </ReceiptCard>
        </Box>
      </Box>
    );
  }

  // Assignment step
  if (currentStep === 'assignments') {
    const currentParticipant = participants[currentParticipantIndex];
    
    return (
      <Box sx={{ 
        maxWidth: 520, 
        margin: '0 auto', 
        padding: 1, 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <StepperBar>
          {steps.map((label, idx) => (
            <StepDot key={label} active={getStepIndex() === idx} />
          ))}
        </StepperBar>

        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center', fontSize: '0.8rem' }}>
          {getAssignmentProgress()}% of items assigned
        </Typography>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={currentParticipantIndex}
          onChangeIndex={handleSwipeChange}
          enableMouseEvents
          style={{ flex: 1, minHeight: 0 }}
        >
          {participants.map((participant, index) => (
            <Box key={participant} sx={{ height: '100%', display: 'flex' }}>
              <IndividualReceiptCard>
                <ReceiptHeader>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {participant}'s Receipt
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {formatCurrency(getParticipantTotal(participant), targetCurrency)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {getFoodItemsSelectedCount(participant)}/{getTotalFoodItems()} items selected
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        variant="text"
                        size="medium"
                        onClick={() => selectAllFoodItems(participant)}
                        disabled={getFoodItemsSelectedCount(participant) === getTotalFoodItems()}
                        sx={{ 
                          fontSize: '0.85rem',
                          py: 0.75,
                          px: 1.5,
                          minWidth: 'auto',
                          color: 'primary.main'
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="text"
                        size="medium"
                        onClick={() => deselectAllFoodItems(participant)}
                        disabled={getFoodItemsSelectedCount(participant) === 0}
                        sx={{ 
                          fontSize: '0.85rem',
                          py: 0.75,
                          px: 1.5,
                          minWidth: 'auto',
                          color: 'text.secondary'
                        }}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>
                </ReceiptHeader>

                                                  <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, minHeight: 0 }}>
                   {items.map((item, itemIndex) => {
                     const isAssignedToParticipant = item.shared_by?.includes(participant) || false;
                     const isSpecialItem = item.isSpecialItem;
                     const totalAssigned = item.shared_by?.length || 0;
                     
                     // Determine if this is a tax item vs service charge
                     const isTaxItem = isSpecialItem && (
                       item.item.toLowerCase().includes('tax') || 
                       item.specialType === 'tax'
                     );
                     const isServiceItem = isSpecialItem && !isTaxItem;
                     
                     return (
                     <ReceiptItemRow key={itemIndex} sx={{ 
                       py: 1.5,
                       px: isSpecialItem ? 1.5 : 0,
                       opacity: isSpecialItem && !isAssignedToParticipant ? 0.6 : 1,
                       backgroundColor: isSpecialItem 
                         ? isTaxItem 
                           ? 'rgba(25, 118, 210, 0.08)' 
                           : 'rgba(255, 193, 7, 0.08)' 
                         : 'transparent',
                       borderRadius: isSpecialItem ? 2 : 0,
                       border: isSpecialItem 
                         ? isTaxItem 
                           ? '1px solid rgba(25, 118, 210, 0.2)' 
                           : '1px solid rgba(255, 193, 7, 0.2)' 
                         : 'none',
                       my: isSpecialItem ? 0.5 : 0,
                     }}>
                       <Box sx={{ flex: 1, minWidth: 0 }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Typography variant="body1" sx={{ 
                             fontWeight: 600, 
                             color: 'text.primary',
                             whiteSpace: 'nowrap',
                             overflow: 'hidden',
                             textOverflow: 'ellipsis'
                           }}>
                             {item.item}
                           </Typography>
                           {isSpecialItem && (
                             <Box sx={{ 
                               backgroundColor: isTaxItem ? 'primary.main' : 'warning.main', 
                               color: isTaxItem ? 'primary.contrastText' : 'warning.contrastText',
                               borderRadius: '4px',
                               px: 0.5,
                               py: 0.25,
                               fontSize: '0.7rem',
                               fontWeight: 600,
                               textTransform: 'uppercase'
                             }}>
                               {isTaxItem ? 'TAX' : 'SERVICE'}
                             </Box>
                           )}
                         </Box>
                         <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
                           {isSpecialItem 
                             ? `Split among ${totalAssigned} people`
                             : `Qty: ${item.qty} × ${formatCurrency(item.converted_price || item.price, targetCurrency)}`
                           }
                         </Typography>
                       </Box>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                         <Typography variant="body1" sx={{ 
                           color: 'text.primary', 
                           fontWeight: 600,
                           minWidth: 70,
                           textAlign: 'right',
                           fontSize: '1rem'
                         }}>
                           {isSpecialItem
                             ? formatCurrency(totalAssigned > 0 ? (item.converted_price || item.price) / totalAssigned : 0, targetCurrency)
                             : formatCurrency((item.converted_price || item.price) * item.qty, targetCurrency)
                           }
                         </Typography>
                         <StyledCheckbox
                           checked={getCheckboxState(item, participant)}
                           onChange={() => toggleItemAssignment(itemIndex, participant)}
                           size="medium"
                           sx={{ 
                             '& .MuiSvgIcon-root': { fontSize: 28 }
                           }}
                         />
                       </Box>
                     </ReceiptItemRow>
                     );
                   })}
                 </Box>
              </IndividualReceiptCard>
            </Box>
          ))}
        </SwipeableViews>

                                   <Box sx={{ mt: 'auto', pt: 2 }}>
           {participants.length > 1 && (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
               <Button 
                 size="small" 
                 onClick={handleParticipantBack}
                 disabled={currentParticipantIndex === 0}
                 sx={{ fontSize: '0.8rem', py: 0.5, minWidth: 'auto' }}
               >
                 <KeyboardArrowLeft sx={{ fontSize: '1rem' }} />
               </Button>
               
               <Box sx={{ display: 'flex', gap: 0.5 }}>
                 {participants.map((_, index) => (
                   <Box
                     key={index}
                     sx={{
                       width: 8,
                       height: 8,
                       borderRadius: '50%',
                       backgroundColor: index === currentParticipantIndex ? 'primary.main' : 'divider',
                       cursor: 'pointer',
                     }}
                     onClick={() => setCurrentParticipantIndex(index)}
                   />
                 ))}
               </Box>
               
               <Button 
                 size="small" 
                 onClick={handleParticipantNext}
                 disabled={currentParticipantIndex === participants.length - 1}
                 sx={{ fontSize: '0.8rem', py: 0.5, minWidth: 'auto' }}
               >
                 <KeyboardArrowRight sx={{ fontSize: '1rem' }} />
               </Button>
             </Box>
           )}

           <Box sx={{ display: 'flex', gap: 1.5 }}>
             <Button
               variant="outlined"
               onClick={() => setCurrentStep('participants')}
               startIcon={<ArrowBackIcon />}
               fullWidth
               sx={{ py: 1.5, fontSize: '0.9rem' }}
             >
               Back
             </Button>
             <Button
               variant="contained"
               onClick={calculateBill}
               disabled={hasUnassignedItems()}
               endIcon={<ArrowForwardIosIcon />}
               fullWidth
               sx={{ py: 1.5, fontSize: '0.9rem' }}
             >
               Calculate Split
             </Button>
           </Box>
         </Box>
      </Box>
    );
  }

  // Summary step
  if (currentStep === 'summary') {
    const totalAmount = Object.values(userTotals).reduce((sum, amount) => sum + amount, 0);

    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 2 
      }}>
        <Box sx={{ maxWidth: 440, width: '100%' }}>
          <StepperBar>
            {steps.map((label, idx) => (
              <StepDot key={label} active={getStepIndex() === idx} />
            ))}
          </StepperBar>

        <ReceiptCard>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
              Bill Summary
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            {Object.entries(userTotals).map(([participant, amount]) => (
              <Box
                key={participant}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {participant}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {formatCurrency(amount, targetCurrency)}
                </Typography>
              </Box>
            ))}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                mt: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {formatCurrency(totalAmount, targetCurrency)}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
            All amounts are in {targetCurrency}. Split calculated successfully! ✓
          </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setCurrentParticipantIndex(0);
              setCurrentStep('assignments');
            }}
            startIcon={<ArrowBackIcon />}
            fullWidth
            sx={{ py: 1.5, fontSize: '0.9rem' }}
          >
            Back
          </Button>
                      <Button
              variant="contained"
              onClick={() => {
                if (onComplete) {
                  onComplete({
                    participants,
                    userTotals,
                    currency: targetCurrency,
                    items
                  });
                }
                setCurrentStep('loading');
              }}
              endIcon={<CheckCircleIcon />}
              fullWidth
              sx={{ py: 1.5, fontSize: '0.9rem' }}
            >
              Complete Split
            </Button>
          </Box>
        </ReceiptCard>
        </Box>
      </Box>
    );
  }

  return null;
};

export default ReceiptProcessor; 