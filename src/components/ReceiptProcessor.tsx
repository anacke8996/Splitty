import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

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

  // Process receipt when component mounts
  React.useEffect(() => {
    processReceipt();
  }, [imageData]);

  const processReceipt = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          target_currency: 'USD', // You might want to make this configurable
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
        setSourceCurrency(data.source_currency);
        setTargetCurrency(data.target_currency);
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

  const assignItemToParticipants = (itemIndex: number, selectedParticipants: string[]) => {
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      shared_by: selectedParticipants,
    };
    setItems(updatedItems);
  };

  const calculateBill = async () => {
    try {
      const response = await fetch('/api/split-bill', {
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
        setShowSummary(true);
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

  if (showSummary) {
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => onComplete?.(userTotals)}
          style={{ marginTop: 16 }}
        >
          Done
        </Button>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper>
      <Typography variant="h5" gutterBottom>
        Assign Items to Participants
      </Typography>

      {/* Add Participants Section */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Add Participants
        </Typography>
        <Box display="flex" gap={1}>
          <TextField
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            placeholder="Enter participant name"
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={addParticipant}
            disabled={!newParticipant.trim()}
          >
            Add
          </Button>
        </Box>
        {participants.length > 0 && (
          <Box mt={1}>
            <Typography variant="subtitle2">Participants:</Typography>
            <Typography>{participants.join(', ')}</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Items Assignment Section */}
      <Typography variant="h6" gutterBottom>
        Receipt Items
      </Typography>
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={item.item}
              secondary={`${item.qty} x ${targetCurrency} ${item.converted_price?.toFixed(2) || item.price.toFixed(2)} = ${targetCurrency} ${item.converted_total?.toFixed(2) || item.total.toFixed(2)}`}
            />
            <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
              <InputLabel>Assign to</InputLabel>
              <Select
                multiple
                value={item.shared_by || []}
                onChange={(e) => assignItemToParticipants(index, e.target.value as string[])}
                label="Assign to"
              >
                {participants.map((participant) => (
                  <MenuItem key={participant} value={participant}>
                    {participant}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        ))}
      </List>

      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={calculateBill}
          disabled={participants.length === 0 || items.some(item => !item.shared_by?.length)}
        >
          Calculate Split
        </Button>
      </Box>
    </StyledPaper>
  );
};

export default ReceiptProcessor; 