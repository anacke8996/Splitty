import React from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const commonCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '14px 18px',
    borderRadius: 12,
    backgroundColor: theme.palette.background.default,
    fontSize: '1rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: theme.palette.text.primary,
    '&:focus': {
      backgroundColor: theme.palette.background.default,
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
    borderRadius: 12,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
  '& .MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '1rem',
  padding: '12px 18px',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  '& .MuiInputLabel-root': {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  sx?: any;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  sx = {},
}) => {
  const [selectedCurrency, setSelectedCurrency] = React.useState(value);

  const handleChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    onChange(newCurrency);
  };

  return (
    <Box sx={sx}>
      <StyledFormControl>
        <InputLabel id="target-currency-label">
          Target Currency
        </InputLabel>
        <StyledSelect
          labelId="target-currency-label"
          value={selectedCurrency}
          label="Target Currency"
          onChange={(e) => handleChange(e.target.value as string)}
          IconComponent={KeyboardArrowDownIcon}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: 3,
                maxHeight: 300,
                '& .MuiMenuItem-root': {
                  color: 'text.primary',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              },
            },
          }}
        >
          {commonCurrencies.map((currency) => (
            <StyledMenuItem 
              key={currency.code} 
              value={currency.code}
            >
              {currency.code} - {currency.name}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </StyledFormControl>
    </Box>
  );
};

export default CurrencySelector; 