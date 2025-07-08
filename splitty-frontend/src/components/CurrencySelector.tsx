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

const Container = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  padding: 32,
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  background: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 24px,
      rgba(0,0,0,0.05) 24px,
      rgba(0,0,0,0.05) 25px
    )`,
    opacity: 0.05,
    pointerEvents: 'none',
  },
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.75rem',
  marginBottom: 12,
  background: 'linear-gradient(90deg, #3b82f6 0%, #a21caf 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  textAlign: 'center',
  letterSpacing: '-0.01em',
  fontFamily: 'Inter, system-ui, sans-serif',
}));

const InstructionText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: '#6b7280',
  marginBottom: 24,
  lineHeight: 1.5,
  textAlign: 'center',
  fontFamily: 'Inter, system-ui, sans-serif',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '14px 18px',
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: '1rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    '&:focus': {
      backgroundColor: '#fff',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e5e7eb',
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

const NextButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a21caf 100%)',
  color: '#fff',
  borderRadius: 12,
  padding: '16px 40px',
  fontWeight: 500,
  fontSize: '1.125rem',
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
  letterSpacing: 0.2,
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: 32,
  '&:hover': {
    background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 50%, #7c3aed 100%)',
    boxShadow: '0 4px 12px rgba(30,41,59,0.12)',
  },
}));

interface CurrencySelectorProps {
  sourceCurrency: string;
  targetCurrency: string;
  onTargetCurrencyChange: (currency: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  sourceCurrency,
  targetCurrency,
  onTargetCurrencyChange,
}) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(to bottom, #f9fafb 0%, #fff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
    }}>
      <Container>
        <GradientTitle>
          Currency Options
        </GradientTitle>
        <InstructionText>
          Receipt processed in {sourceCurrency}. You can continue with {sourceCurrency} or convert to another currency:
        </InstructionText>
        
        {/* Helper text for quick splitting */}
        {targetCurrency === sourceCurrency && (
          <Box sx={{ 
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: 2,
            p: 2,
            mb: 3,
            textAlign: 'center',
          }}>
            <Typography sx={{ 
              fontSize: '0.875rem',
              color: '#0c4a6e',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 500,
            }}>
              💡 Want to split the bill quickly? Just click "Continue with {sourceCurrency}" below!
            </Typography>
          </Box>
        )}
        <FormControl fullWidth>
          <InputLabel id="target-currency-label" sx={{ 
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#6b7280',
          }}>
            Target Currency
          </InputLabel>
          <StyledSelect
            labelId="target-currency-label"
            value={targetCurrency}
            label="Target Currency"
            onChange={(e) => onTargetCurrencyChange(e.target.value as string)}
            IconComponent={KeyboardArrowDownIcon}
          >
            {commonCurrencies.map((currency) => (
              <MenuItem 
                key={currency.code} 
                value={currency.code}
                sx={{ 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '1rem',
                  padding: '12px 18px',
                }}
              >
                {currency.code} - {currency.name}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          gap: 2,
          mt: 3,
        }}>
          {/* Quick continue with current currency */}
          {targetCurrency === sourceCurrency && (
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                borderRadius: 12,
                padding: '16px 32px',
                fontWeight: 600,
                fontSize: '1.125rem',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => onTargetCurrencyChange(targetCurrency)}
              endIcon={<ArrowForwardIosIcon />}
            >
              Continue with {sourceCurrency}
            </Button>
          )}
          
          {/* Convert to different currency */}
          {targetCurrency !== sourceCurrency && (
            <NextButton
              variant="contained"
              endIcon={<ArrowForwardIosIcon />}
              onClick={() => onTargetCurrencyChange(targetCurrency)}
            >
              Convert to {targetCurrency}
            </NextButton>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CurrencySelector; 