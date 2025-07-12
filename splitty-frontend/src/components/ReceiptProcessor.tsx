import React, { useState, useRef, useEffect } from 'react';
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
  DialogActions,
  Fade,
  Slide,
  Zoom,
  Collapse
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
// Custom swipeable views implementation to replace deprecated react-swipeable-views
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
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencySelector from './CurrencySelector';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

// Keyframe animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const checkmarkAnimation = keyframes`
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
`;

const countUpAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
  100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
`;



interface ReceiptItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount' | 'total';
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
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.3s ease',
  // Remove hover transform and boxShadow to prevent vibration
  // '&:hover': {
  //   transform: 'translateY(-2px)',
  //   boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  // },
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
  animation: `${slideInUp} 0.5s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)`,
    animation: `${shimmerAnimation} 2s infinite`,
  },
}));

const AnimatedGradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(-45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
  backgroundSize: '400% 400%',
  animation: `${gradientAnimation} 3s ease infinite`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 'bold',
}));

const PulsingCheckbox = styled(Checkbox)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&.Mui-checked': {
    '& .MuiSvgIcon-root': {
      animation: `${checkmarkAnimation} 0.5s ease`,
    },
  },
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  maxWidth: 'min(480px, 95vw)',
  marginLeft: 'auto',
  marginRight: 'auto',
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.divider}`,
  animation: `${slideInUp} 0.6s ease-out`,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5),
    margin: theme.spacing(2),
    borderRadius: theme.spacing(3),
  },
}));

const ParticipantCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  py: theme.spacing(4),
  px: theme.spacing(4),
  mb: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(59, 130, 246, 0.02)'} 100%)`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
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



const steps = ['Processing', 'Review Items', 'Add Names', 'Assign Items', 'Summary'];

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ imageData, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [currentStep, setCurrentStep] = useState<'loading' | 'review' | 'currency' | 'participants' | 'assignments' | 'summary'>('loading');
  
  // Debug step changes
  const setCurrentStepWithLog = (newStep: typeof currentStep) => {
    console.log(`📋 Step change: ${currentStep} → ${newStep}`);
    console.trace('Step change stack trace:');
    setCurrentStep(newStep);
  };
  const [activeStep, setActiveStep] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [userTotals, setUserTotals] = useState<Record<string, number>>({});
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [taxIncluded, setTaxIncluded] = useState<boolean>(false);
  const [taxInclusionReason, setTaxInclusionReason] = useState<string>('');
  
  // New state for review step
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [originalTotal, setOriginalTotal] = useState<number>(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Validation and editing functions for review step
  const validateItems = (items: ReceiptItem[], receiptTotal: number) => {
    const warnings: string[] = [];
    const itemsTotal = items.reduce((sum, item) => sum + (item.total || (item.price * item.qty)), 0);
    
    // Check if items total matches receipt total (within 5% tolerance)
    const tolerance = Math.max(receiptTotal * 0.05, 2); // 5% or $2, whichever is higher
    if (Math.abs(itemsTotal - receiptTotal) > tolerance) {
      warnings.push(`Items total (${itemsTotal.toFixed(2)}) doesn't match receipt total (${receiptTotal.toFixed(2)})`);
    }
    
    // Check for unusually high prices (more than 3x the average)
    const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
    items.forEach((item, index) => {
      if (item.price > avgPrice * 3 && avgPrice > 5) {
        warnings.push(`Item "${item.item}" has unusually high price (${item.price.toFixed(2)})`);
      }
    });
    
    // Check for zero or negative prices
    items.forEach((item, index) => {
      if (item.price <= 0) {
        warnings.push(`Item "${item.item}" has invalid price (${item.price})`);
      }
    });
    
    return warnings;
  };

  // Function to check if an item is flagged for any validation issues
  const isItemFlagged = (item: ReceiptItem, items: ReceiptItem[]) => {
    const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
    
    // Check for unusually high prices (more than 3x the average)
    if (item.price > avgPrice * 3 && avgPrice > 5) {
      return { flagged: true, reason: 'unusually high price', severity: 'warning' };
    }
    
    // Check for zero or negative prices
    if (item.price <= 0) {
      return { flagged: true, reason: 'invalid price', severity: 'error' };
    }
    
    return { flagged: false, reason: '', severity: 'none' };
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total if price or quantity changed
    if (field === 'price' || field === 'qty') {
      updatedItems[index].total = updatedItems[index].price * updatedItems[index].qty;
    }
    
    setItems(updatedItems);
    
    // Re-validate after changes
    const warnings = validateItems(updatedItems, originalTotal);
    setValidationWarnings(warnings);
  };

  const addNewItem = () => {
    const newItem: ReceiptItem = {
      item: 'New Item',
      price: 0,
      qty: 1,
      total: 0,
      converted_price: 0,
      converted_total: 0,
      shared_by: [],
      isSpecialItem: false
    };
    setItems([...items, newItem]);
    setEditingItemIndex(items.length); // Start editing the new item
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    
    // Re-validate after removal
    const warnings = validateItems(updatedItems, originalTotal);
    setValidationWarnings(warnings);
  };

  // Custom SwipeableViews component to replace deprecated library
  const SwipeableViews = ({ index, onChangeIndex, children }: {
    index: number;
    onChangeIndex: (index: number) => void;
    children: React.ReactNode;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setCurrentX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      setCurrentX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      const diff = startX - currentX;
      const threshold = 50; // Minimum swipe distance
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && index < React.Children.count(children) - 1) {
          // Swipe left - go to next
          onChangeIndex(index + 1);
        } else if (diff < 0 && index > 0) {
          // Swipe right - go to previous
          onChangeIndex(index - 1);
        }
      }
    };

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const dragDelta = isDragging ? currentX - startX : 0;
    const dragPercent = (dragDelta / containerWidth) * 100;

    const translatePercent = -index * 100 + dragPercent;

    return (
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          height: '100%',
          flex: 1,
          minHeight: 0
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            transform: `translateX(${translatePercent}%)`,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.22,0.61,0.36,1)'
          }}
        >
          {React.Children.map(children, (child, i) => (
            <div
              style={{
                width: '84%',
                margin: '0 8%',
                flexShrink: 0,
                transition: 'transform 0.3s',
                transform: i === index ? 'scale(1)' : 'scale(0.94)'
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Debug component lifecycle
  React.useEffect(() => {
    console.log('🚀 ReceiptProcessor mounted');
    return () => {
      console.log('💥 ReceiptProcessor unmounting');
    };
  }, []);

  React.useEffect(() => {
    console.log('🔄 processReceipt useEffect triggered, imageData length:', imageData?.length);
    processReceipt();
  }, [imageData]);

  // Validate and fix potentially misclassified items
  const validateItemClassification = (item: ReceiptItem, isTaxIncluded: boolean = taxIncluded, taxReason: string = taxInclusionReason): ReceiptItem | null => {
    const itemName = item.item.toLowerCase();
    
    // Total/subtotal line patterns that should be filtered out entirely
    const totalLinePatterns = [
      'total', 'subtotal', 'sub total', 'sub-total',
      'total service', 'total servicio', 'service total', 'servicio total',
      'total amount', 'amount total', 'grand total', 'final total',
      'total bill', 'bill total', 'total due', 'due total',
      'total payable', 'payable total', 'total a pagar',
      'suma total', 'importe total', 'montant total'
    ];
    
    // Check if this is a total/subtotal line that should be filtered out
    // These usually have prices close to or equal to the total bill amount
    const isTotalLine = totalLinePatterns.some(pattern => 
      itemName === pattern || 
      itemName.includes(pattern) || 
      itemName.replace(/\s+/g, '').includes(pattern.replace(/\s+/g, ''))
    );
    
    if (isTotalLine) {
      console.log(`🚫 Filtering out total/subtotal line: "${item.item}" (${item.price})`);
      return null; // This will be filtered out
    }
    
    // Filter out total/subtotal items since they're summary lines
    if (item.isSpecialItem && item.specialType === 'total') {
      console.log(`🚫 Filtering out total line: "${item.item}" (${item.price})`);
      return null; // Total lines are summary, not splittable items
    }
    
    // Filter out tax items if tax is already included in item prices
    if (item.isSpecialItem && item.specialType === 'tax' && isTaxIncluded) {
      console.log(`🏷️ Filtering out included tax: "${item.item}" (${item.price}) - ${taxReason}`);
      return null; // Tax is already included in item prices, don't split separately
    }
    
    // Legitimate services that should NOT be special items
    const legitimateServices = [
      'room service', 'cleaning service', 'laundry service', 'concierge service', 
      'valet service', 'spa service', 'massage', 'tour service', 'shuttle service',
      'car service', 'servicio de habitación', 'servicio de limpieza', 
      'servicio de lavandería', 'servicio de spa', 'servicio de tour',
      'total servicio', 'subtotal service', 'service total', 'total service'
    ];
    
    // True service charges/fees that should be special items
    const realServiceCharges = [
      'service charge', 'service fee', 'svc charge', 'svc fee',
      'cargo por servicio', 'frais de service', 'delivery fee',
      'convenience fee', 'booking fee', 'processing fee', 'handling fee',
      'corkage fee', 'cover charge', 'facility fee', 'administrative fee'
    ];
    
    // If it's marked as a service charge but is actually a legitimate service
    if (item.isSpecialItem && item.specialType === 'service_charge') {
      const isLegitimateService = legitimateServices.some(service => 
        itemName.includes(service) || itemName.includes(service.replace(' ', ''))
      );
      
      if (isLegitimateService) {
        return {
          ...item,
          isSpecialItem: false,
          specialType: undefined
        };
      }
    }
    
    // If it's not marked as special but should be
    if (!item.isSpecialItem) {
      const isRealServiceCharge = realServiceCharges.some(charge => 
        itemName.includes(charge) || itemName.includes(charge.replace(' ', ''))
      );
      
      if (isRealServiceCharge) {
        return {
          ...item,
          isSpecialItem: true,
          specialType: 'service_charge'
        };
      }
    }
    
    return item;
  };

  // Initialize special items to be assigned to all participants when participants change
  React.useEffect(() => {
    try {
      console.log('🔄 Validation useEffect triggered, participants:', participants.length, 'taxIncluded:', taxIncluded);
      if (participants.length > 0) {
        const updatedItems = items.map(item => {
          const validatedItem = validateItemClassification(item, taxIncluded, taxInclusionReason);
          if (validatedItem && validatedItem.isSpecialItem) {
            // For separate tax (American style), auto-assign tax to all participants
            if (validatedItem.specialType === 'tax' && !taxIncluded) {
              console.log(`💰 Auto-assigning separate tax "${validatedItem.item}" to all participants`);
              return {
                ...validatedItem,
                shared_by: [...participants]
              };
            }
            // For other special items (tips, service charges), also auto-assign
            else if (validatedItem.specialType !== 'tax') {
              return {
                ...validatedItem,
                shared_by: [...participants]
              };
            }
            // For included tax, don't auto-assign (it's filtered out anyway)
            else {
              return validatedItem;
            }
          }
          return validatedItem;
        }).filter(item => item !== null); // Filter out null items (total/subtotal lines)
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('❌ Error in validation useEffect:', error);
    }
  }, [participants, taxIncluded]);

    const processReceipt = async () => {
    try {
      setLoading(true);
      
      // Check if the image data might be HEIC format and convert if needed
      let processedImageData = imageData;
      console.log('🔍 Checking if image needs HEIC conversion...');
      
      // If the image data doesn't start with a valid image header, it might be HEIC
      if (imageData && !imageData.startsWith('data:image/')) {
        console.log('🔄 Attempting HEIC conversion in ReceiptProcessor...');
        try {
          // Dynamically import heic2any only on client side
          const heic2any = (await import('heic2any')).default;
          
          // Convert base64 to blob more efficiently
          const binaryString = atob(imageData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/heic' });
          
          console.log('🔍 Created blob, size:', blob.size, 'type:', blob.type);
          
          // Convert HEIC to JPEG using heic2any
          const convertedBlob = await heic2any({
            blob: blob,
            toType: 'image/jpeg',
            quality: 0.8
          });
          
          // Handle case where heic2any returns an array (multi-image HEIC)
          let blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          
          console.log('🔍 Converted blob, size:', blobToUse.size, 'type:', blobToUse.type);
          
          // Convert back to base64 more efficiently
          const arrayBuffer = await blobToUse.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64String = btoa(binary);
          processedImageData = base64String;
          
          console.log('✅ HEIC conversion successful in ReceiptProcessor');
          console.log('📊 Converted data length:', base64String.length);
        } catch (conversionError) {
          console.error('❌ HEIC conversion failed in ReceiptProcessor:', conversionError);
          console.log('🔍 Error details:', {
            name: conversionError.name,
            message: conversionError.message,
            stack: conversionError.stack
          });
          // Continue with original data if conversion fails
        }
      }
      
      const response = await fetch(API_ENDPOINTS.processReceipt, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: processedImageData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Set tax inclusion information first, so validation function can use it
        setTaxIncluded(data.taxIncluded || false);
        setTaxInclusionReason(data.taxInclusionReason || '');
        
        console.log(`🏷️ Tax handling: ${data.taxIncluded ? 'INCLUDED' : 'SEPARATE'}`);
        console.log(`📝 Reason: ${data.taxInclusionReason}`);
        
        const convertedItems = data.items.map((item: any) => {
          const baseItem = {
            item: item.item,
            price: item.price,
            qty: item.qty,
            total: item.total,
            converted_price: item.price,
            converted_total: item.total,
            isSpecialItem: item.isSpecialItem || false,
            specialType: item.specialType,
            shared_by: [] // Will be set below based on tax detection
          };
          
          // Validate item classification (will filter out included tax)
          const validatedItem = validateItemClassification(baseItem, data.taxIncluded || false, data.taxInclusionReason || '');
          
          // Auto-assign special items based on tax detection
          if (validatedItem && validatedItem.isSpecialItem && participants.length > 0) {
            // For separate tax (American style), auto-assign tax to all participants
            if (validatedItem.specialType === 'tax' && !data.taxIncluded) {
              validatedItem.shared_by = [...participants];
              console.log(`💰 Auto-assigning separate tax "${validatedItem.item}" to all participants`);
            }
            // For other special items (tips, service charges), also auto-assign
            else if (validatedItem.specialType !== 'tax') {
              validatedItem.shared_by = [...participants];
            }
          }
          
          return validatedItem;
        }).filter(item => item !== null); // Filter out null items (total/subtotal lines and included tax)
        
        setItems(convertedItems);
        setSourceCurrency(data.currency);
        setTargetCurrency(data.currency);
        setOriginalTotal(data.total || 0);
        
        // Validate items and show review step only if there are issues
        const warnings = validateItems(convertedItems, data.total || 0);
        setValidationWarnings(warnings);
        
        if (warnings.length > 0) {
          console.log(`⚠️ Found ${warnings.length} validation issues, showing review step`);
          setCurrentStepWithLog('review');
        } else {
          console.log('✅ No validation issues found, skipping review step');
          setCurrentStepWithLog('currency');
        }
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
      setCurrentStepWithLog('participants');
      return;
    }
    
    try {
      setCurrencyLoading(true);
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
        setCurrentStepWithLog('participants');
      } else {
        setError(data.error || 'Failed to convert currency');
      }
    } catch (err) {
      console.error('Currency conversion error:', err);
      setError('Failed to convert currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      const newParticipantName = newParticipant.trim();
      setParticipants([...participants, newParticipantName]);
      
      // Automatically assign special items to the new participant based on tax detection
      const updatedItems = items.map(item => {
        if (item.isSpecialItem) {
          // For separate tax (American style), auto-assign to new participant
          if (item.specialType === 'tax' && !taxIncluded) {
            console.log(`💰 Auto-assigning separate tax "${item.item}" to new participant: ${newParticipantName}`);
            return {
              ...item,
              shared_by: [...(item.shared_by || []), newParticipantName]
            };
          }
          // For other special items (tips, service charges), also auto-assign
          else if (item.specialType !== 'tax') {
            return {
              ...item,
              shared_by: [...(item.shared_by || []), newParticipantName]
            };
          }
          // For included tax, don't auto-assign (it should be filtered out)
          else {
            return item;
          }
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

    if (item.qty === 1) {
      // Simple toggle membership for single-unit items (can be shared)
      const idx = item.shared_by.indexOf(participant);
      if (idx === -1) {
        item.shared_by.push(participant);
      } else {
        item.shared_by.splice(idx, 1);
      }
    } else {
      // Multi-unit items use duplicate entries per unit
      const participantQty = item.shared_by.filter(p => p === participant).length;
      const totalAssigned = item.shared_by.length;

      if (participantQty === 0 && totalAssigned < item.qty) {
        item.shared_by.push(participant);
      } else if (participantQty > 0 && totalAssigned < item.qty) {
        item.shared_by.push(participant);
      } else {
        item.shared_by = item.shared_by.filter(p => p !== participant);
      }
    }

    setItems(updatedItems);
  };

  const getCheckboxState = (item: ReceiptItem, participant: string) => {
    if (item.qty === 1) {
      return item.shared_by?.includes(participant) || false;
    }
    return (item.shared_by?.filter(p => p === participant).length || 0) > 0;
  };

  const getUnassignedItems = () => {
    return items.filter(item => {
      if (item.qty === 1) {
        return !item.shared_by || item.shared_by.length === 0;
      }
      const assignedQty = item.shared_by?.length || 0;
      return assignedQty < item.qty;
    });
  };

  const hasUnassignedItems = () => {
    return getUnassignedItems().length > 0;
  };

  const getAssignmentProgress = () => {
    let totalUnits = 0;
    let assignedUnits = 0;
    items.forEach(item => {
      const qty = item.qty || 1;
      totalUnits += qty;
      if (item.qty === 1) {
        if (item.shared_by && item.shared_by.length > 0) {
          assignedUnits += 1;
        }
      } else {
        const claimed = Math.min(item.shared_by?.length || 0, item.qty);
        assignedUnits += claimed;
      }
    });
    return totalUnits === 0 ? 100 : Math.round((assignedUnits / totalUnits) * 100);
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
      if (item.qty === 1) {
        if (item.shared_by && item.shared_by.includes(participant)) {
          total += price / (item.shared_by.length || 1);
        }
      } else {
        const participantQty = item.shared_by?.filter(p => p === participant).length || 0;
        total += price * participantQty;
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
      if (item.qty === 1) {
        if (item.shared_by && item.shared_by.length > 0) {
          const perPerson = price / item.shared_by.length;
          item.shared_by.forEach(p => {
            totals[p] += perPerson;
          });
        }
      } else {
        item.shared_by?.forEach(p => {
          totals[p] += price; // each duplicate counts one unit
        });
      }
    });

    setUserTotals(totals);
    setCurrentStepWithLog('summary');
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case 'loading': return 0;
      case 'review': return 1;
      case 'currency': return 2;
      case 'participants': return 2;
      case 'assignments': return 3;
      case 'summary': return 4;
      default: return 0;
    }
  };



  // Loading state
  if (loading) {
    return (
      <LoadingContainer>
        <Fade in timeout={600}>
          <LoadingCard>
            <CircularProgress 
              size={50} 
              thickness={4}
              sx={{ 
                color: 'primary.main', 
                mb: 3,
                animation: `${pulseAnimation} 2s ease-in-out infinite`
              }} 
            />
            <AnimatedGradientText variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
              Processing Receipt...
            </AnimatedGradientText>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              AI is extracting items and prices from your receipt
            </Typography>
          </LoadingCard>
        </Fade>
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
          <Fade in timeout={600}>
            <ReceiptCard>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>
                  😔
                </Typography>
                <Typography variant="h5" color="error.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Oops! Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {error}
                </Typography>
              </Box>
              <AnimatedButton
                variant="contained"
                onClick={() => window.location.reload()}
                fullWidth
                sx={{ py: 2 }}
              >
                Try Again
              </AnimatedButton>
            </ReceiptCard>
          </Fade>
        </Box>
      </Box>
    );
  }

  // Review step - allow editing of extracted items
  if (currentStep === 'review') {
    const itemsTotal = items.reduce((sum, item) => sum + (item.total || (item.price * item.qty)), 0);
    const flaggedItems = items.filter(item => isItemFlagged(item, items).flagged);
    
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 2 
      }}>
        <Box sx={{ maxWidth: 800, width: '100%', margin: '0 auto' }}>
          <ReceiptCard>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', color: 'text.primary' }}>
              Review & Edit Items
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
              Please review the extracted items and make any necessary corrections
            </Typography>

            {/* Flagged Items Summary */}
            {flaggedItems.length > 0 && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'warning.main',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                  🔍 {flaggedItems.length} item{flaggedItems.length > 1 ? 's' : ''} flagged for review
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  - Look for highlighted items below
                </Typography>
              </Box>
            )}

            {/* Validation Warnings */}
            {validationWarnings.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {validationWarnings.map((warning, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    mb: 1, 
                    borderRadius: 2, 
                    border: '1px solid', 
                    borderColor: 'warning.main',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                      ⚠️ {warning}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Items List */}
            <Box sx={{ mb: 3 }}>
              {items.map((item, index) => {
                const flagInfo = isItemFlagged(item, items);
                const borderColor = flagInfo.flagged 
                  ? flagInfo.severity === 'error' ? 'error.main' : 'warning.main'
                  : 'divider';
                const backgroundColor = flagInfo.flagged
                  ? flagInfo.severity === 'error' ? 'rgba(244, 67, 54, 0.08)' : 'rgba(255, 193, 7, 0.08)'
                  : 'background.default';
                
                return (
                <Box key={index} sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2, 
                  border: '2px solid', 
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  position: 'relative',
                  boxShadow: flagInfo.flagged ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  {editingItemIndex === index ? (
                    // Edit mode
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Item Name"
                        value={item.item}
                        onChange={(e) => updateItem(index, 'item', e.target.value)}
                        fullWidth
                        size="small"
                      />
                                             <Box sx={{ display: 'flex', gap: 2 }}>
                         <TextField
                           label="Quantity"
                           type="number"
                           value={item.qty}
                           onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                           size="small"
                           sx={{ flex: 1 }}
                           inputProps={{ min: 0, step: 1 }}
                         />
                         <TextField
                           label="Unit Price"
                           type="number"
                           value={item.price}
                           onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                           size="small"
                           sx={{ flex: 1 }}
                           inputProps={{ min: 0, step: 0.01 }}
                           InputProps={{
                             startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>{sourceCurrency}</Typography>
                           }}
                         />
                         <Box sx={{ 
                           flex: 1, 
                           display: 'flex', 
                           alignItems: 'center',
                           justifyContent: 'center',
                           p: 1,
                           borderRadius: 1,
                           backgroundColor: 'action.hover'
                         }}>
                           <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                             Total:
                           </Typography>
                           <Typography variant="body1" sx={{ fontWeight: 600 }}>
                             {formatCurrency(item.price * item.qty, sourceCurrency)}
                           </Typography>
                         </Box>
                       </Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingItemIndex(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setEditingItemIndex(null)}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    // View mode
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.item}
                          </Typography>
                          {flagInfo.flagged && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              backgroundColor: flagInfo.severity === 'error' ? 'error.main' : 'warning.main',
                              color: 'white'
                            }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                {flagInfo.severity === 'error' ? '❌' : '⚠️'}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                {flagInfo.severity === 'error' ? 'INVALID' : 'CHECK'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Qty: {item.qty} × {formatCurrency(item.price, sourceCurrency)} = {formatCurrency(item.price * item.qty, sourceCurrency)}
                        </Typography>
                        {flagInfo.flagged && (
                          <Typography variant="caption" sx={{ 
                            color: flagInfo.severity === 'error' ? 'error.main' : 'warning.main',
                            fontStyle: 'italic',
                            fontSize: '0.75rem'
                          }}>
                            Issue: {flagInfo.reason}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setEditingItemIndex(index)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Typography variant="caption">✏️</Typography>
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => removeItem(index)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </Box>
                );
              })}
            </Box>

            {/* Add Item Button */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewItem}
                sx={{ mb: 2 }}
              >
                Add Item
              </Button>
            </Box>

            {/* Totals Summary */}
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid',
              borderColor: 'primary.light',
              mb: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Items Total:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(itemsTotal, sourceCurrency)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Receipt Total:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(originalTotal, sourceCurrency)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Difference:
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: Math.abs(itemsTotal - originalTotal) > 2 ? 'error.main' : 'success.main'
                  }}
                >
                  {formatCurrency(Math.abs(itemsTotal - originalTotal), sourceCurrency)}
                </Typography>
              </Box>
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStepWithLog('loading')}
                startIcon={<ArrowBackIcon />}
                fullWidth
                sx={{ py: 2 }}
              >
                Back to Upload
              </Button>
              <Button
                variant="contained"
                onClick={() => setCurrentStepWithLog('currency')}
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
          
          <Slide direction="up" in timeout={800}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                Receipt processed in:
              </Typography>
              <AnimatedGradientText variant="h4" sx={{ 
                mb: 2,
                animation: `${countUpAnimation} 0.8s ease-out, ${gradientAnimation} 3s ease infinite`,
              }}>
                {sourceCurrency}
              </AnimatedGradientText>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                You can continue with {sourceCurrency} or convert to another currency below:
              </Typography>
            </Box>
          </Slide>

          <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', background: 'background.default' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1 }}>
              💡 Want to split the bill quickly? Just click "Continue with {sourceCurrency}" below!
            </Typography>
          </Box>

          {taxInclusionReason && (
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: taxIncluded ? 'success.main' : 'info.main', background: 'background.default' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 500, mb: 0.5 }}>
                {taxIncluded ? '🏷️ Tax Included' : '📊 Tax Separate'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {taxInclusionReason}
              </Typography>
            </Box>
          )}

          <CurrencySelector
            value={targetCurrency}
            onChange={(newCurrency) => setTargetCurrency(newCurrency)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <AnimatedButton
              variant="outlined"
              onClick={() => setCurrentStepWithLog('review')}
              fullWidth
              sx={{ py: 2.5, fontSize: '1.1rem' }}
            >
              Review Items
            </AnimatedButton>
            <AnimatedButton
              variant="contained"
              onClick={() => handleCurrencyChange(targetCurrency)}
              fullWidth
              disabled={currencyLoading}
              sx={{ py: 2.5, fontSize: '1.1rem' }}
              endIcon={currencyLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIosIcon />}
            >
              {currencyLoading ? 'Converting Currency...' : `Continue with ${targetCurrency}`}
            </AnimatedButton>
          </Box>
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
            <AnimatedButton
              variant="outlined"
              onClick={() => setCurrentStepWithLog('currency')}
              startIcon={<ArrowBackIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              Back
            </AnimatedButton>
            <AnimatedButton
              variant="contained"
              onClick={() => {
                setCurrentParticipantIndex(0);
                setCurrentStepWithLog('assignments');
              }}
              disabled={participants.length < 1}
              endIcon={<ArrowForwardIosIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              Continue
            </AnimatedButton>
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

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
            {getAssignmentProgress()}% of items assigned
          </Typography>
          <Box sx={{ 
            width: '100%', 
            height: 4, 
            backgroundColor: 'divider', 
            borderRadius: 2,
            overflow: 'hidden',
            mb: 1,
          }}>
            <Box sx={{ 
              height: '100%', 
              width: `${getAssignmentProgress()}%`,
              backgroundColor: 'primary.main',
              transition: 'width 0.5s ease',
              borderRadius: 2,
              animation: getAssignmentProgress() === 100 ? `${pulseAnimation} 1s ease-in-out` : 'none',
            }} />
          </Box>
        </Box>

        <SwipeableViews
          index={currentParticipantIndex}
          onChangeIndex={handleSwipeChange}
        >
          {participants.map((participant) => (
            <Box key={participant} sx={{ height: '100%', display: 'flex' }}>
              <IndividualReceiptCard>
                <ReceiptHeader>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {participant}'s Receipt
                    </Typography>
                    <AnimatedGradientText variant="h4" sx={{ 
                      fontWeight: 600
                    }}>
                      {formatCurrency(getParticipantTotal(participant), targetCurrency)}
                    </AnimatedGradientText>
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
                    const participantQty = item.shared_by?.filter(p => p === participant).length || 0;
                    const isAssignedToParticipant = participantQty > 0;
                    const isSpecialItem = item.isSpecialItem;
                    const totalAssigned = item.shared_by?.length || 0;
                    // Determine if this is a tax item vs service charge
                    const isTaxItem = isSpecialItem && (
                      item.item.toLowerCase().includes('tax') || 
                      item.specialType === 'tax'
                    );
                    const isServiceItem = isSpecialItem && !isTaxItem;
                    const assignmentSummary = item.qty > 1 && item.shared_by && item.shared_by.length > 0
                      ? participants.map(p => {
                          const cnt = item.shared_by!.filter(x => x === p).length;
                          return cnt > 0 ? `${p}: ${cnt}` : null;
                        }).filter(Boolean).join(', ')
                      : '';
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
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  opacity: 0.8,
                                  transform: 'scale(0.95)',
                                }
                              }}
                              onClick={() => {
                                // Toggle special item status
                                const updatedItems = items.map((it, idx) => {
                                  if (idx === itemIndex) {
                                    return {
                                      ...it,
                                      isSpecialItem: false,
                                      specialType: undefined,
                                      shared_by: [] // Clear assignments when changing to regular item
                                    };
                                  }
                                  return it;
                                });
                                setItems(updatedItems);
                              }}
                              title="Click to change to regular item"
                              >
                                {isTaxItem ? 'TAX' : 'SERVICE'}
                              </Box>
                            )}
                            {!isSpecialItem && (item.item.toLowerCase().includes('service') || item.item.toLowerCase().includes('servicio')) && (
                              <Box sx={{ 
                                backgroundColor: 'action.hover',
                                color: 'text.secondary',
                                borderRadius: '4px',
                                px: 0.5,
                                py: 0.25,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: '1px dashed',
                                borderColor: 'divider',
                                '&:hover': {
                                  backgroundColor: 'warning.light',
                                  color: 'warning.contrastText',
                                  borderColor: 'warning.main',
                                }
                              }}
                              onClick={() => {
                                // Convert to service charge
                                const updatedItems = items.map((it, idx) => {
                                  if (idx === itemIndex) {
                                    return {
                                      ...it,
                                      isSpecialItem: true,
                                      specialType: 'service_charge' as const,
                                      shared_by: [...participants] // Auto-assign to all participants
                                    };
                                  }
                                  return it;
                                });
                                setItems(updatedItems);
                              }}
                              title="Click to mark as service charge"
                              >
                                SERVICE?
                              </Box>
                            )}
                          </Box>
                          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
                            {isSpecialItem 
                              ? `Split among ${totalAssigned} people`
                              : `Qty: ${item.qty} × ${formatCurrency(item.converted_price || item.price, targetCurrency)}${participantQty ? ` (You: ${participantQty})` : ''}${assignmentSummary ? ` | ${assignmentSummary}` : ''}`
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
                          <PulsingCheckbox
                            checked={getCheckboxState(item, currentParticipant)}
                            onChange={() => toggleItemAssignment(itemIndex, currentParticipant)}
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
        {/* Participant carousel dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
          {participants.map((_, idx) => (
            <StepDot
              key={idx}
              active={currentParticipantIndex === idx}
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentParticipantIndex(idx)}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          <AnimatedButton
            variant="outlined"
            onClick={() => setCurrentStepWithLog('participants')}
            startIcon={<ArrowBackIcon />}
            fullWidth
            sx={{ py: 1.5, fontSize: '0.9rem' }}
          >
            Back
          </AnimatedButton>
          <AnimatedButton
            variant="contained"
            onClick={calculateBill}
            disabled={hasUnassignedItems()}
            endIcon={<ArrowForwardIosIcon />}
            fullWidth
            sx={{ py: 1.5, fontSize: '0.9rem' }}
          >
            Calculate Split
          </AnimatedButton>
        </Box>
        {participants.length > 1 && (
          <>
            <IconButton
              onClick={handleParticipantBack}
              disabled={currentParticipantIndex === 0}
              sx={{
                position: 'absolute',
                top: '50%',
                left: -12,
                transform: 'translateY(-50%)',
                backgroundColor: 'background.paper',
                boxShadow: 3,
                '&:hover': { backgroundColor: 'background.default' }
              }}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleParticipantNext}
              disabled={currentParticipantIndex === participants.length - 1}
              sx={{
                position: 'absolute',
                top: '50%',
                right: -12,
                transform: 'translateY(-50%)',
                backgroundColor: 'background.paper',
                boxShadow: 3,
                '&:hover': { backgroundColor: 'background.default' }
              }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </>
        )}
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

        <Zoom in timeout={800}>
          <SummaryCard>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Fade in timeout={800}>
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  color: 'success.contrastText',
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                }}>
                  <CheckCircleIcon sx={{ fontSize: 36 }} />
                </Box>
              </Fade>
              <Fade in timeout={1000}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: 'text.primary',
                }}>
                  Split Complete!
                </Typography>
              </Fade>
              <Fade in timeout={1200}>
                <Typography variant="body1" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                }}>
                  Here's who owes what
                </Typography>
              </Fade>
            </Box>

            {/* Participant Cards */}
            <Box sx={{ mb: 5, px: 1 }}>
              {Object.entries(userTotals).map(([participant, amount], index) => (
                <Slide direction="up" in timeout={1000 + index * 200} key={participant}>
                  <ParticipantCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: 'primary.contrastText',
                        mr: 4,
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                      }}>
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary',
                          mb: 0.25,
                          fontSize: '1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {participant}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                        }}>
                          {Math.round((amount / totalAmount) * 100)}% of total
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                      }}>
                        {formatCurrency(amount, targetCurrency)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        mt: 0.25,
                      }}>
                        {targetCurrency}
                      </Typography>
                    </Box>
                  </ParticipantCard>
                </Slide>
              ))}
            </Box>

            {/* Grand Total */}
            <Fade in timeout={1400}>
              <Box sx={{ 
                p: 3,
                mt: 3,
                borderRadius: 2,
                background: `rgba(59, 130, 246, 0.05)`,
                border: '1px solid',
                borderColor: 'primary.light',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
              }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary', 
                      mb: 0.5,
                      fontSize: '0.875rem',
                    }}>
                      Grand Total
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700,
                      color: 'text.primary',
                    }}>
                      {formatCurrency(totalAmount, targetCurrency)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    color: 'success.contrastText',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                  }}>
                    <AttachMoneyIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Box>
              </Box>
            </Fade>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentParticipantIndex(0);
                  setCurrentStepWithLog('assignments');
                }}
                startIcon={<ArrowBackIcon />}
                fullWidth
                sx={{ 
                  py: 1.5, 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                }}
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
                  setCurrentStepWithLog('loading');
                }}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: theme.palette.primary.main,
                  '&:hover': {
                    background: theme.palette.primary.dark,
                  },
                }}
              >
                Complete
              </Button>
            </Box>
          </SummaryCard>
        </Zoom>
        </Box>
      </Box>
    );
  }



  return null;
};

export default ReceiptProcessor; 