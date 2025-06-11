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
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  maxWidth: 800,
  margin: '0 auto',
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
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Assign Items
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Select the items each person consumed. Multiple people can select the same item.
        </Typography>

        <Grid container spacing={2}>
          {participants.map((participant) => (
            <Grid item xs={12} key={participant}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {participant}'s Items
                  </Typography>
                  <List>
                    {items.map((item, itemIndex) => (
                      <ListItem key={itemIndex}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={item.shared_by?.includes(participant) || false}
                              onChange={() => toggleItemAssignment(itemIndex, participant)}
                            />
                          }
                          label={
                            <ListItemText
                              primary={item.item}
                              secondary={`${item.qty} x ${targetCurrency} ${item.converted_price?.toFixed(2) || item.price.toFixed(2)} = ${targetCurrency} ${item.converted_total?.toFixed(2) || item.total.toFixed(2)}`}
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={calculateBill}
            disabled={items.some(item => !item.shared_by?.length)}
          >
            Calculate Split
          </Button>
        </Box>
      </StyledPaper>
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