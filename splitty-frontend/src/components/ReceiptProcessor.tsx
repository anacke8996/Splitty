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
  MobileStepper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { API_ENDPOINTS } from '../config/api';
import Switch from '@mui/material/Switch';

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

const VirtualizedSwipeableViews = virtualize(SwipeableViews);

const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  maxWidth: 500,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'visible',
  position: 'relative',
  minHeight: 520,
}));

const CarouselCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{active?: boolean}>(({ active }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 420,
  minHeight: 420,
  margin: '0 auto',
  background: '#fff',
  borderRadius: 24,
  boxShadow: active ? '0 8px 32px rgba(30,41,59,0.10)' : '0 2px 8px rgba(30,41,59,0.04)',
  border: `1.5px solid #E5E7EB`,
  transition: 'box-shadow 0.25s, transform 0.25s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: '32px 20px 24px 20px',
  fontFamily: 'Inter, system-ui, sans-serif',
  zIndex: active ? 2 : 1,
  transform: active ? 'scale(1)' : 'scale(0.97)',
  opacity: active ? 1 : 0.8,
}));

const UserName = styled(Box)(() => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  fontFamily: 'Inter, system-ui, sans-serif',
  marginBottom: 12,
  textAlign: 'center',
  color: '#1A1A1A',
}));

const ItemsList = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  flex: 1,
}));

const ItemRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 16,
  background: '#F3F4F6',
  padding: '16px 16px',
  boxShadow: '0 1px 4px rgba(30,41,59,0.04)',
  transition: 'box-shadow 0.18s, background 0.18s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(30,41,59,0.10)',
    background: '#F1F5F9',
  },
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

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
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
      addParticipant();
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

  const slideRenderer = ({ index, key }: { index: number; key: string }) => {
    const participant = participants[index];
    return (
      <SwipeableCard key={key}>
        <ParticipantCard active={index === activeStep ? 1 : 0} elevation={index === activeStep ? 6 : 1}>
          <CardContent>
            <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
              {participant}'s Items
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto', pr: 1, pl: 1, '::-webkit-scrollbar': { width: 0 } }}>
              {items.map((item, itemIndex) => (
                <ItemCard key={itemIndex}>
                  <ItemInfo>
                    <ItemName>{item.item}</ItemName>
                    <ItemDetails>
                      {item.qty} x {targetCurrency} {item.converted_price?.toFixed(2) || item.price.toFixed(2)} = {targetCurrency} {item.converted_total?.toFixed(2) || item.total.toFixed(2)}
                    </ItemDetails>
                  </ItemInfo>
                  <ItemCheckbox
                    checked={item.shared_by?.includes(participant) || false}
                    onChange={() => toggleItemAssignment(itemIndex, participant)}
                    color="primary"
                  />
                </ItemCard>
              ))}
            </List>
          </CardContent>
        </ParticipantCard>
      </SwipeableCard>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" style={{ marginLeft: 16 }}>
          Processing receipt...
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
        background: BG_COLOR,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <Box sx={{
          background: '#fff',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(30,41,59,0.10)',
          p: 6,
          minWidth: 340,
          maxWidth: 420,
          width: '90vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom sx={{ color: '#1A1A1A', mb: 2 }}>
            Who's Splitting the Bill?
          </Typography>
          <Typography variant="body1" color="#6B7280" align="center" mb={2}>
            Add the names of everyone splitting the bill. You can add or remove names as needed.
          </Typography>
          <Box sx={{ width: '100%' }}>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={handleParticipantKeyPress}
                placeholder="Enter name"
                variant="outlined"
                size="medium"
                fullWidth
                sx={{ borderRadius: 2, background: '#F3F4F6' }}
              />
              <Button
                variant="contained"
                onClick={addParticipant}
                disabled={!newParticipant.trim()}
                sx={{
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  py: 1.2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                  '&:hover': { background: '#1746a2' },
                }}
              >
                Add
              </Button>
            </Box>
            {participants.length > 0 && (
              <Box sx={{ mt: 2, width: '100%' }}>
                {participants.map((participant, index) => (
                  <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1.5,
                    background: '#F3F4F6',
                    borderRadius: 2,
                    fontWeight: 500,
                    color: '#1A1A1A',
                  }}>
                    <span>{participant}</span>
                    <IconButton edge="end" onClick={() => removeParticipant(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              sx={{
                background: '#2563eb',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1.08rem',
                boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                textTransform: 'none',
                '&:hover': { background: '#1746a2' },
              }}
              onClick={() => setCurrentStep('assignments')}
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
    return (
      <Box sx={{
        minHeight: '100vh',
        background: BG_COLOR,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <CarouselContainer>
          <SwipeableViews
            index={activeStep}
            onChangeIndex={setActiveStep}
            enableMouseEvents
            resistance
            style={{ width: '100%', maxWidth: 420 }}
            containerStyle={{ width: '100%', maxWidth: 420 }}
          >
            {participants.map((participant, idx) => {
              const active = idx === activeStep;
              return (
                <CarouselCard key={participant} active={active}>
                  <UserName>{participant}'s Items</UserName>
                  <ItemsList>
                    {items.map((item, itemIndex) => (
                      <ItemRow key={itemIndex}>
                        <ItemInfo>
                          <Box sx={ITEM_NAME_FONT}>{item.item}</Box>
                          <Box sx={ITEM_SUB_FONT}>
                            {item.qty} x {targetCurrency} {item.converted_price?.toFixed(2) || item.price.toFixed(2)} = {targetCurrency} {item.converted_total?.toFixed(2) || item.total.toFixed(2)}
                          </Box>
                        </ItemInfo>
                        <Switch
                          checked={item.shared_by?.includes(participant) || false}
                          onChange={() => toggleItemAssignment(itemIndex, participant)}
                          color="primary"
                          sx={{
                            ml: 2,
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2563eb',
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: '#2563eb',
                            },
                          }}
                        />
                      </ItemRow>
                    ))}
                  </ItemsList>
                </CarouselCard>
              );
            })}
          </SwipeableViews>
        </CarouselContainer>
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            sx={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              px: 4,
              py: 1.5,
              fontSize: '1.08rem',
              boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
              textTransform: 'none',
              '&:hover': { background: '#1746a2' },
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
    return (
      <Box sx={{
        minHeight: '100vh',
        background: BG_COLOR,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <Box sx={{
          background: '#fff',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(30,41,59,0.10)',
          p: 6,
          minWidth: 340,
          maxWidth: 420,
          width: '90vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom sx={{ color: '#1A1A1A', mb: 2 }}>
            Bill Split Summary
          </Typography>
          <Box sx={{ width: '100%', mt: 2 }}>
            {Object.entries(userTotals).map(([user, amount]) => (
              <Box key={user} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                mb: 1.5,
                background: '#F3F4F6',
                borderRadius: 2,
                fontWeight: 500,
                color: '#1A1A1A',
              }}>
                <span>{user}</span>
                <span>{targetCurrency} {amount.toFixed(2)}</span>
              </Box>
            ))}
          </Box>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              sx={{
                background: '#2563eb',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1.08rem',
                boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                textTransform: 'none',
                '&:hover': { background: '#1746a2' },
              }}
              onClick={() => onComplete?.(userTotals)}
              size="large"
            >
              Done
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
};

export default ReceiptProcessor; 