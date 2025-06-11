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

const BG_COLOR = '#F7F8FA';
const CARD_COLOR = '#FFF';
const PRIMARY = '#2563eb';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';
const SHADOW = '0 4px 24px rgba(30,41,59,0.07)';

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
}));

const ItemName = styled(Typography)(() => ({
  fontWeight: 600,
  fontSize: '1.08rem',
  color: TEXT_PRIMARY,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
}));

const ItemDetails = styled(Typography)(() => ({
  fontSize: '0.97rem',
  color: TEXT_SECONDARY,
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
}));

const ItemCheckbox = styled(Checkbox)(() => ({
  marginLeft: 12,
  color: PRIMARY,
  '&.Mui-checked': {
    color: PRIMARY,
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

const CarouselCard = styled(Card)<{active?: boolean, offset?: number}>(({ active, offset }) => ({
  position: 'absolute',
  left: '50%',
  top: 0,
  width: 340,
  minHeight: 420,
  maxWidth: '92vw',
  transform: `translateX(-50%) scale(${active ? 1 : 0.92}) translateX(${offset ? offset * 60 : 0}px)` + (active ? '' : ' perspective(600px) rotateY(' + (offset && offset < 0 ? 8 : -8) + 'deg)'),
  opacity: active ? 1 : 0.5,
  zIndex: active ? 2 : 1,
  background: CARD_COLOR,
  borderRadius: 20,
  boxShadow: active ? SHADOW : '0 2px 8px rgba(30,41,59,0.04)',
  transition: 'transform 0.35s cubic-bezier(.4,2,.6,1), opacity 0.25s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '32px 18px 18px 18px',
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
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
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Who's Splitting the Bill?
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Add the names of everyone splitting the bill. You can add or remove names as needed.
        </Typography>

        <Box mb={3}>
          <Box display="flex" gap={1} mb={2}>
            <TextField
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={handleParticipantKeyPress}
              placeholder="Enter name"
              variant="outlined"
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={addParticipant}
              disabled={!newParticipant.trim()}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>

          {participants.length > 0 && (
            <List>
              {participants.map((participant, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeParticipant(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={participant} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCurrentStep('assignments')}
            disabled={participants.length === 0}
          >
            Continue to Item Assignment
          </Button>
        </Box>
      </StyledPaper>
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
        justifyContent: 'flex-start',
        pt: 2,
        pb: 4,
        fontFamily: 'Inter, Roboto, system-ui, sans-serif',
      }}>
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom sx={{ color: TEXT_PRIMARY, fontFamily: 'Inter, Roboto, system-ui, sans-serif' }}>
          Assign Items
        </Typography>
        <Typography variant="body1" align="center" mb={2} sx={{ color: TEXT_SECONDARY, fontFamily: 'Inter, Roboto, system-ui, sans-serif' }}>
          Swipe left or right to assign items to each person
        </Typography>
        <CarouselContainer>
          <SwipeableViews
            index={activeStep}
            onChangeIndex={setActiveStep}
            enableMouseEvents
            resistance
            style={{ width: '100%', height: 480 }}
            containerStyle={{ height: 480 }}
          >
            {participants.map((participant, idx) => {
              const offset = idx - activeStep;
              return (
                <Box key={participant} sx={{ position: 'relative', height: 480 }}>
                  <CarouselCard active={offset === 0 ? 1 : 0} offset={offset} elevation={offset === 0 ? 6 : 2}>
                    <Typography variant="h5" align="center" fontWeight={700} gutterBottom sx={{ mb: 2, color: TEXT_PRIMARY, fontFamily: 'Inter, Roboto, system-ui, sans-serif' }}>
                      {participant}'s Items
                    </Typography>
                    <List sx={{ width: '100%', maxHeight: 340, overflow: 'auto', '::-webkit-scrollbar': { width: 0 } }}>
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
                          />
                        </ItemCard>
                      ))}
                    </List>
                  </CarouselCard>
                </Box>
              );
            })}
          </SwipeableViews>
        </CarouselContainer>
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            sx={{
              background: PRIMARY,
              color: '#fff',
              borderRadius: 12,
              fontWeight: 600,
              fontFamily: 'Inter, Roboto, system-ui, sans-serif',
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
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Bill Split Summary
        </Typography>
        <List>
          {Object.entries(userTotals).map(([user, amount]) => (
            <ListItem key={user}>
              <ListItemText
                primary={user}
                secondary={`${targetCurrency} ${amount.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onComplete?.(userTotals)}
          >
            Done
          </Button>
        </Box>
      </StyledPaper>
    );
  }

  return null;
};

export default ReceiptProcessor; 