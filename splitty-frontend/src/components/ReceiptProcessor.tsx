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
import { useAuth } from '../contexts/AuthContext';
import Switch from '@mui/material/Switch';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencySelector from './CurrencySelector';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

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

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
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
  originalItem?: string; // Store original language item name
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount' | 'total';
  shareEqually?: boolean; // When true, item cost is split equally among shared_by participants
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
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  padding: theme.spacing(3),
  margin: theme.spacing(0.5),
  maxWidth: 'min(750px, 98vw)',
  maxHeight: 'calc(100vh - 120px)', // Limit height to allow space for navigation
  width: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
    borderRadius: '24px',
    pointerEvents: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
    borderRadius: '24px',
    maxWidth: 'min(900px, 95vw)',
    maxHeight: 'calc(100vh - 100px)',
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: 'min(1000px, 90vw)',
  },
}));

const ReceiptHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
  position: 'relative',
  zIndex: 1,
}));

const ReceiptItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0),
  borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
  position: 'relative',
  zIndex: 1,
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
  minHeight: 'max(100vh, 100dvh)',
  height: 'max(100vh, 100dvh)',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const BackgroundElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
  filter: 'blur(60px)',
  animation: `${pulseAnimation} 4s ease-in-out infinite`,
  pointerEvents: 'none',
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(59, 130, 246, 0.3)',
  animation: `${bounce} 3s ease-in-out infinite`,
  pointerEvents: 'none',
}));

const LoadingCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6, 4),
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  maxWidth: 'min(480px, 95vw)',
  width: '100%',
  boxSizing: 'border-box',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  position: 'relative',
  overflow: 'hidden',
  animation: `${slideInUp} 0.8s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
    borderRadius: '24px',
    pointerEvents: 'none',
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
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [currentStep, setCurrentStep] = useState<'loading' | 'review' | 'currency' | 'participants' | 'assignments' | 'summary' | 'individual'>('loading');
  
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
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [showOriginalLanguage, setShowOriginalLanguage] = useState<boolean>(false);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [savingReceipt, setSavingReceipt] = useState<boolean>(false);
  

  
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
      originalItem: undefined,
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
    const [startY, setStartY] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isVerticalScroll, setIsVerticalScroll] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
      // Only handle touch if not inside a scrollable area
      const target = e.target as HTMLElement;
      const scrollableParent = target.closest('[data-scrollable="true"]');
      if (scrollableParent) return;

      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setStartY(e.touches[0].clientY);
      setCurrentX(e.touches[0].clientX);
      setCurrentY(e.touches[0].clientY);
      setIsVerticalScroll(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      
      const newX = e.touches[0].clientX;
      const newY = e.touches[0].clientY;
      
      // Determine if this is a vertical scroll gesture
      const deltaX = Math.abs(newX - startX);
      const deltaY = Math.abs(newY - startY);
      
      if (!isVerticalScroll && deltaY > deltaX && deltaY > 10) {
        setIsVerticalScroll(true);
        setIsDragging(false);
        return;
      }
      
      // If it's a horizontal swipe, update position
      if (deltaX > deltaY && deltaX > 10) {
        setCurrentX(newX);
        setCurrentY(newY);
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging || isVerticalScroll) {
        setIsDragging(false);
        setIsVerticalScroll(false);
        return;
      }
      
      setIsDragging(false);
      
      const diff = startX - currentX;
      const threshold = 80; // Increased threshold for more deliberate swipes
      
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
    const dragDelta = isDragging && !isVerticalScroll ? currentX - startX : 0;
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
          minHeight: 0,
          touchAction: 'manipulation', // Allow touch but prevent default behaviors we handle
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
                width: '90%', // Increased from 84% for more content space
                margin: '0 5%', // Reduced margins
                flexShrink: 0,
                transition: 'transform 0.3s',
                transform: i === index ? 'scale(1)' : 'scale(0.96)', // Less dramatic scaling
                display: 'flex',
                flexDirection: 'column'
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
          // Check if it's just a "already browser readable" message (not a real error)
          if (conversionError.message && conversionError.message.includes('already browser readable')) {
            console.log('✅ Image is already in browser-readable format, skipping HEIC conversion');
          } else {
            console.error('❌ HEIC conversion failed in ReceiptProcessor:', conversionError);
            console.log('🔍 Error details:', {
              name: conversionError.name,
              message: conversionError.message,
              stack: conversionError.stack
            });
          }
          // Continue with original data if conversion fails
        }
      }
      
      const response = await fetch(API_ENDPOINTS.processReceipt, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          }),
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
            originalItem: item.originalItem,
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
        setDetectedLanguage(data.language || '');
        setRestaurantName(data.restaurantName || '');
        
        // Original item names are now included in the initial API response
        
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

    if (item.qty === 1 || item.shareEqually) {
      // Simple toggle membership for single-unit items or share equally items
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
    if (item.qty === 1 || item.shareEqually) {
      return item.shared_by?.includes(participant) || false;
    }
    return (item.shared_by?.filter(p => p === participant).length || 0) > 0;
  };

  const getUnassignedItems = () => {
    return items.filter(item => {
      if (item.qty === 1 || item.shareEqually) {
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
      if (item.shareEqually) {
        // For share equally items, we only need someone to be assigned
        totalUnits += 1;
        if (item.shared_by && item.shared_by.length > 0) {
          assignedUnits += 1;
        }
      } else {
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
      
      if (item.shareEqually) {
        // For share equally items, split the total cost among all assigned participants
        if (item.shared_by && item.shared_by.includes(participant)) {
          const totalCost = price * item.qty;
          total += totalCost / (item.shared_by.length || 1);
        }
      } else if (item.qty === 1) {
        // For single quantity items, share the cost among assigned participants
        if (item.shared_by && item.shared_by.includes(participant)) {
          total += price / (item.shared_by.length || 1);
        }
      } else {
        // For discrete multi-unit items, each participant pays for their assigned units
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
        
        if (item.qty === 1 || item.shareEqually) {
          // For single quantity items or share equally items, just add participant once if not already included
          if (!item.shared_by.includes(participant)) {
            item.shared_by.push(participant);
          }
        } else {
          // For multiple quantity discrete items, assign all remaining units to this participant
          const currentParticipantQty = item.shared_by.filter(p => p === participant).length;
          const totalAssigned = item.shared_by.length;
          const remainingUnits = item.qty - totalAssigned;
          const unitsToAssign = Math.max(0, remainingUnits + currentParticipantQty);
          
          // Remove existing assignments for this participant
          item.shared_by = item.shared_by.filter(p => p !== participant);
          
          // Add participant for all available units
          for (let i = 0; i < unitsToAssign; i++) {
            item.shared_by.push(participant);
          }
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
      
      if (item.shareEqually) {
        // For share equally items, split the total cost among all assigned participants
        if (item.shared_by && item.shared_by.length > 0) {
          const totalCost = price * item.qty;
          const perPerson = totalCost / item.shared_by.length;
          item.shared_by.forEach(p => {
            totals[p] += perPerson;
          });
        }
      } else if (item.qty === 1) {
        // For single quantity items, share the cost among assigned participants
        if (item.shared_by && item.shared_by.length > 0) {
          const perPerson = price / item.shared_by.length;
          item.shared_by.forEach(p => {
            totals[p] += perPerson;
          });
        }
      } else {
        // For discrete multi-unit items, each participant pays for their assigned units
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

  const addUnit = (itemIndex: number, participant: string) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    if (!item.shared_by) item.shared_by = [];
    const totalAssigned = item.shared_by.length;
    if (totalAssigned >= item.qty) return; // no units left
    item.shared_by.push(participant);
    setItems(updatedItems);
  };

  const removeUnit = (itemIndex: number, participant: string) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    if (!item.shared_by) return;
    const idx = item.shared_by.indexOf(participant);
    if (idx !== -1) {
      item.shared_by.splice(idx, 1);
      setItems(updatedItems);
    }
  };

  // Loading state
  if (loading) {
    return (
      <LoadingContainer>
        {/* Animated Background Elements */}
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            top: '-10%',
            right: '-10%',
            animationDelay: '0s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            bottom: '-10%',
            left: '-10%',
            animationDelay: '1s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '128px',
            height: '128px',
            top: '25%',
            left: '25%',
            animationDelay: '0.5s',
          }}
        />

        {/* Floating Dots */}
        <FloatingElement sx={{ top: '20%', left: '10%', width: '8px', height: '8px', animationDelay: '0.3s' }} />
        <FloatingElement sx={{ top: '40%', right: '16%', width: '4px', height: '4px', animationDelay: '0.7s' }} />
        <FloatingElement sx={{ bottom: '32%', right: '20%', width: '6px', height: '6px', animationDelay: '1s' }} />

        <Fade in timeout={600}>
          <LoadingCard>
            <Box sx={{ 
              position: 'relative', 
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}>
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: '#3b82f6', 
                  mb: 4,
                  animation: `${pulseAnimation} 2s ease-in-out infinite`
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  textAlign: 'center',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Processing Receipt...
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '1.1rem',
                }}
              >
                AI is extracting items and prices from your receipt
              </Typography>
            </Box>
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
      <LoadingContainer>
        {/* Animated Background Elements */}
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            top: '-10%',
            right: '-10%',
            animationDelay: '0s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            bottom: '-10%',
            left: '-10%',
            animationDelay: '1s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '128px',
            height: '128px',
            top: '25%',
            left: '25%',
            animationDelay: '0.5s',
          }}
        />

        {/* Floating Dots */}
        <FloatingElement sx={{ top: '20%', left: '10%', width: '8px', height: '8px', animationDelay: '0.3s' }} />
        <FloatingElement sx={{ top: '40%', right: '16%', width: '4px', height: '4px', animationDelay: '0.7s' }} />
        <FloatingElement sx={{ bottom: '32%', right: '20%', width: '6px', height: '6px', animationDelay: '1s' }} />

        <Box sx={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 2 }}>
          <Fade in timeout={600}>
            <LoadingCard>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Currency Options
                </Typography>
                
                <Slide direction="up" in timeout={800}>
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#94a3b8', 
                        mb: 1,
                        fontSize: '1.1rem',
                      }}
                    >
                      Receipt processed in:
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        mb: 2,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        animation: `${gradientAnimation} 3s ease infinite`,
                      }}
                    >
                      {sourceCurrency}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8',
                        fontSize: '1rem',
                      }}
                    >
                      You can continue with {sourceCurrency} or convert to another currency below:
                    </Typography>
                  </Box>
                </Slide>

                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: '16px', 
                  border: '1px solid rgba(59, 130, 246, 0.2)', 
                  background: 'rgba(51, 65, 85, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      color: '#60a5fa', 
                      mb: 1,
                      fontWeight: 500,
                    }}
                  >
                    💡 Want to split the bill quickly? Just click "Continue with {sourceCurrency}" below!
                  </Typography>
                </Box>

                {taxInclusionReason && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    borderRadius: '16px', 
                    border: '1px solid', 
                    borderColor: taxIncluded ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)', 
                    background: 'rgba(51, 65, 85, 0.5)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        color: '#f8fafc', 
                        fontWeight: 600, 
                        mb: 0.5 
                      }}
                    >
                      {taxIncluded ? '🏷️ Tax Included' : '📊 Tax Separate'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8', 
                        fontSize: '0.9rem' 
                      }}
                    >
                      {taxInclusionReason}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#f8fafc', 
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Target Currency
                  </Typography>
                  <CurrencySelector
                    value={targetCurrency}
                    onChange={(newCurrency) => setTargetCurrency(newCurrency)}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentStepWithLog('review')}
                    fullWidth
                    sx={{ 
                      py: 2.5, 
                      fontSize: '1.1rem',
                      color: '#3b82f6',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        background: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    Review Items
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleCurrencyChange(targetCurrency)}
                    fullWidth
                    disabled={currencyLoading}
                    sx={{ 
                      py: 2.5, 
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'rgba(71, 85, 105, 0.5)',
                        color: '#64748b',
                      },
                    }}
                    endIcon={currencyLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIosIcon />}
                  >
                    {currencyLoading ? 'Converting Currency...' : `Continue with ${targetCurrency}`}
                  </Button>
                </Box>
              </Box>
            </LoadingCard>
          </Fade>
        </Box>
      </LoadingContainer>
    );
  }

  // Participants step
  if (currentStep === 'participants') {
    return (
      <LoadingContainer>
        {/* Animated Background Elements */}
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            top: '-10%',
            right: '-10%',
            animationDelay: '0s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            bottom: '-10%',
            left: '-10%',
            animationDelay: '1s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '128px',
            height: '128px',
            top: '25%',
            left: '25%',
            animationDelay: '0.5s',
          }}
        />

        {/* Floating Dots */}
        <FloatingElement sx={{ top: '20%', left: '10%', width: '8px', height: '8px', animationDelay: '0.3s' }} />
        <FloatingElement sx={{ top: '40%', right: '16%', width: '4px', height: '4px', animationDelay: '0.7s' }} />
        <FloatingElement sx={{ bottom: '32%', right: '20%', width: '6px', height: '6px', animationDelay: '1s' }} />

        <Box sx={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 2 }}>
          <StepperBar>
            {steps.map((label, idx) => (
              <StepDot key={label} active={getStepIndex() === idx} />
            ))}
          </StepperBar>

          <Fade in timeout={600}>
            <LoadingCard>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Add Participants
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3, 
                    textAlign: 'center', 
                    color: '#94a3b8',
                    fontSize: '1.1rem',
                  }}
                >
                  Who will be paying for this bill?
                </Typography>
                
                {participants.length === 0 && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    borderRadius: '16px', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    background: 'rgba(51, 65, 85, 0.5)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center', 
                        color: '#60a5fa', 
                        fontSize: '0.95rem',
                        fontWeight: 500,
                      }}
                    >
                      💡 Add at least one person to continue (you can add yourself too!)
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Enter participant name"
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyPress={handleParticipantKeyPress}
                    error={inputError}
                    helperText={inputError ? 'Name already exists or is empty' : ''}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(51, 65, 85, 0.5)',
                        borderRadius: '12px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        color: '#f8fafc',
                        '&:hover': {
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                        },
                        '&.Mui-focused': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                        },
                        '& fieldset': {
                          border: 'none',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6',
                        },
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#ef4444',
                      },
                    }}
                  />
                  
                  <Button
                    variant="outlined"
                    onClick={handleAddParticipant}
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      color: '#3b82f6',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        background: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    Add Participant
                  </Button>
                </Box>

                <Box sx={{ mb: 4 }}>
                  {participants.map((participant, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        px: 3,
                        mb: 2,
                        borderRadius: '12px',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        background: 'rgba(51, 65, 85, 0.5)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(59, 130, 246, 0.4)',
                          background: 'rgba(51, 65, 85, 0.7)',
                        },
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#f8fafc',
                          fontWeight: 500,
                        }}
                      >
                        {participant}
                      </Typography>
                      <IconButton
                        onClick={() => removeParticipant(index)}
                        size="small"
                        sx={{ 
                          color: '#ef4444',
                          background: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 0.2)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentStepWithLog('currency')}
                    startIcon={<ArrowBackIcon />}
                    fullWidth
                    sx={{ 
                      py: 2,
                      color: '#3b82f6',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        background: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setCurrentParticipantIndex(0);
                      setCurrentStepWithLog('assignments');
                    }}
                    disabled={participants.length < 1}
                    endIcon={<ArrowForwardIosIcon />}
                    fullWidth
                    sx={{ 
                      py: 2,
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'rgba(71, 85, 105, 0.5)',
                        color: '#64748b',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </LoadingCard>
          </Fade>
        </Box>
      </LoadingContainer>
    );
  }

  // Assignment step
  if (currentStep === 'assignments') {
    const currentParticipant = participants[currentParticipantIndex];
    
    return (
      <Box sx={{ 
        minHeight: 'max(100vh, 100dvh)',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
        position: 'relative',
        overflow: 'auto',
        padding: 2,
      }}>
        {/* Animated Background Elements */}
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            top: '-10%',
            right: '-10%',
            animationDelay: '0s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            bottom: '-10%',
            left: '-10%',
            animationDelay: '1s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '128px',
            height: '128px',
            top: '25%',
            left: '25%',
            animationDelay: '0.5s',
          }}
        />

        {/* Floating Dots */}
        <FloatingElement sx={{ top: '20%', left: '10%', width: '8px', height: '8px', animationDelay: '0.3s' }} />
        <FloatingElement sx={{ top: '40%', right: '16%', width: '4px', height: '4px', animationDelay: '0.7s' }} />
        <FloatingElement sx={{ bottom: '32%', right: '20%', width: '6px', height: '6px', animationDelay: '1s' }} />

        <Box sx={{ 
          maxWidth: { xs: 780, sm: 920, md: 1020 }, 
          margin: '0 auto', 
          padding: 1, 
          minHeight: 'calc(100vh - 32px)', // Account for padding
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
        }}>
          <StepperBar>
            {steps.map((label, idx) => (
              <StepDot key={label} active={getStepIndex() === idx} />
            ))}
          </StepperBar>

          <Box sx={{ 
            mb: 2, 
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
              borderRadius: '16px',
              pointerEvents: 'none',
            },
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  color: '#94a3b8', 
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {getAssignmentProgress()}% of items assigned
              </Typography>
              <Box sx={{ 
                width: '100%', 
                height: 6, 
                backgroundColor: 'rgba(71, 85, 105, 0.3)', 
                borderRadius: '8px',
                overflow: 'hidden',
                mb: 1,
              }}>
                <Box sx={{ 
                  height: '100%', 
                  width: `${getAssignmentProgress()}%`,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  transition: 'width 0.5s ease',
                  borderRadius: '8px',
                  animation: getAssignmentProgress() === 100 ? `${pulseAnimation} 1s ease-in-out` : 'none',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                }} />
              </Box>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {participant}'s Receipt
                      </Typography>
                      {/* Translation Toggle */}
                      {detectedLanguage && detectedLanguage.toLowerCase() !== 'english' && detectedLanguage.toLowerCase() !== 'en' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Switch
                            size="small"
                            checked={showOriginalLanguage}
                            onChange={(e) => setShowOriginalLanguage(e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'primary.main',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: 'primary.main',
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ 
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                          }}>
                            {showOriginalLanguage ? 'Show in English' : `Show in ${detectedLanguage}`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        flexShrink: 0,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        animation: `${gradientAnimation} 3s ease infinite`,
                      }}
                    >
                      {formatCurrency(getParticipantTotal(participant), targetCurrency)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#94a3b8',
                        fontWeight: 500,
                      }}
                    >
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
                          color: '#3b82f6',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'rgba(59, 130, 246, 0.1)',
                          },
                          '&:disabled': {
                            color: '#64748b',
                          },
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
                          color: '#94a3b8',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'rgba(148, 163, 184, 0.1)',
                          },
                          '&:disabled': {
                            color: '#64748b',
                          },
                        }}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>
                </ReceiptHeader>

                <Box 
                  sx={{ flex: 1, overflowY: 'auto', mb: 2, minHeight: 0 }}
                  data-scrollable="true"
                >
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
                        px: isSpecialItem ? 1.5 : 1,
                        mb: 1,
                        opacity: isSpecialItem && !isAssignedToParticipant ? 0.6 : 1,
                        backgroundColor: isSpecialItem 
                          ? isTaxItem 
                            ? 'rgba(25, 118, 210, 0.08)' 
                            : 'rgba(255, 193, 7, 0.08)' 
                          : 'rgba(15, 23, 42, 0.3)',
                        borderRadius: 2,
                        border: isSpecialItem 
                          ? isTaxItem 
                            ? '1px solid rgba(25, 118, 210, 0.2)' 
                            : '1px solid rgba(255, 193, 7, 0.2)' 
                          : '1px solid rgba(71, 85, 105, 0.15)',
                        backdropFilter: 'blur(4px)',
                        minHeight: 56,
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 1.5
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 600, 
                              color: '#f8fafc',
                              lineHeight: 1.2,
                              flex: 1,
                              minWidth: 0,
                              fontSize: '0.95rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word',
                              hyphens: 'auto'
                            }}>
                              {showOriginalLanguage && item.originalItem ? item.originalItem : item.item}
                            </Typography>
                            {isSpecialItem && (
                              <Box sx={{ 
                                backgroundColor: isTaxItem ? 'primary.main' : 'warning.main', 
                                color: isTaxItem ? 'primary.contrastText' : 'warning.contrastText',
                                borderRadius: '6px',
                                px: 1,
                                py: 0.5,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                '&:hover': {
                                  opacity: 0.8,
                                  transform: 'scale(0.95)',
                                },
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                          
                          {/* Share Equally Toggle - only show for non-special items with qty > 1 */}
                          {!isSpecialItem && item.qty > 1 && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              mt: 0.5,
                              mb: 0,
                              backgroundColor: 'rgba(71, 85, 105, 0.1)',
                              borderRadius: 1.5,
                              px: 1,
                              py: 0.5,
                              border: '1px solid rgba(71, 85, 105, 0.15)'
                            }}>
                              <Switch
                                size="small"
                                checked={item.shareEqually || false}
                                onChange={(e) => {
                                  const updatedItems = items.map((it, idx) => {
                                    if (idx === itemIndex) {
                                      return {
                                        ...it,
                                        shareEqually: e.target.checked,
                                        shared_by: [] // Reset assignments when switching modes
                                      };
                                    }
                                    return it;
                                  });
                                  setItems(updatedItems);
                                }}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: 'primary.main',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: 'primary.main',
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ 
                                color: '#cbd5e1',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                flex: 1
                              }}>
                                {item.shareEqually ? 'Split cost equally among selected people' : 'Split evenly among people'}
                              </Typography>
                            </Box>
                          )}
                          
                          <Typography variant="body2" sx={{ 
                            color: '#94a3b8', 
                            fontSize: '0.85rem',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {isSpecialItem 
                              ? `Split among ${totalAssigned} people`
                              : item.shareEqually 
                                ? `Cost split equally among ${item.shared_by?.length || 0} people`
                                : `Qty: ${item.qty} × ${formatCurrency(item.converted_price || item.price, targetCurrency)}${participantQty ? ` (You: ${participantQty})` : ''}`
                            }
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'flex-end', 
                          justifyContent: 'center',
                          gap: 0.5,
                          flexShrink: 0,
                          minWidth: 100
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: '#3b82f6', 
                            fontWeight: 700,
                            textAlign: 'right',
                            fontSize: '1.1rem',
                            lineHeight: 1.2
                          }}>
                            {isSpecialItem
                              ? formatCurrency(totalAssigned > 0 ? (item.converted_price || item.price) / totalAssigned : 0, targetCurrency)
                              : formatCurrency((item.converted_price || item.price) * item.qty, targetCurrency)
                            }
                          </Typography>
                          {item.qty === 1 || item.shareEqually ? (
                            <PulsingCheckbox
                              checked={getCheckboxState(item, currentParticipant)}
                              onChange={() => toggleItemAssignment(itemIndex, currentParticipant)}
                              size="medium"
                              sx={{ 
                                '& .MuiSvgIcon-root': { fontSize: 28 },
                                '&:hover': { transform: 'scale(1.05)' },
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          ) : (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              backgroundColor: 'rgba(71, 85, 105, 0.2)',
                              borderRadius: 2,
                              padding: '4px 8px',
                              border: '1px solid rgba(71, 85, 105, 0.3)'
                            }}>
                              <IconButton
                                size="medium"
                                onClick={() => removeUnit(itemIndex, currentParticipant)}
                                disabled={participantQty === 0}
                                sx={{
                                  color: participantQty === 0 ? 'rgba(148, 163, 184, 0.5)' : '#ef4444',
                                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                                  padding: '8px'
                                }}
                              >
                                <RemoveCircleOutlineIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="h6" sx={{ 
                                minWidth: 24, 
                                textAlign: 'center',
                                fontWeight: 700,
                                color: '#f8fafc',
                                fontSize: '1.1rem'
                              }}>
                                {participantQty}
                              </Typography>
                              <IconButton
                                size="medium"
                                onClick={() => addUnit(itemIndex, currentParticipant)}
                                disabled={item.shared_by!.length >= item.qty}
                                sx={{
                                  color: item.shared_by!.length >= item.qty ? 'rgba(148, 163, 184, 0.5)' : '#10b981',
                                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                                  padding: '8px'
                                }}
                              >
                                <AddCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
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
          <Button
            variant="outlined"
            onClick={() => setCurrentStepWithLog('participants')}
            startIcon={<ArrowBackIcon />}
            fullWidth
            sx={{ 
              py: 1.5, 
              fontSize: '0.9rem',
              color: '#3b82f6',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#3b82f6',
                background: 'rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={calculateBill}
            disabled={hasUnassignedItems()}
            endIcon={<ArrowForwardIosIcon />}
            fullWidth
            sx={{ 
              py: 1.5, 
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(71, 85, 105, 0.5)',
                color: '#64748b',
                boxShadow: 'none',
              },
            }}
          >
            Calculate Split
          </Button>
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
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                '&:hover': { 
                  background: 'rgba(30, 41, 59, 1)',
                  borderColor: '#3b82f6',
                },
                '&:disabled': {
                  background: 'rgba(71, 85, 105, 0.5)',
                  color: '#64748b',
                  borderColor: 'rgba(71, 85, 105, 0.3)',
                },
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
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                '&:hover': { 
                  background: 'rgba(30, 41, 59, 1)',
                  borderColor: '#3b82f6',
                },
                '&:disabled': {
                  background: 'rgba(71, 85, 105, 0.5)',
                  color: '#64748b',
                  borderColor: 'rgba(71, 85, 105, 0.3)',
                },
              }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </>
        )}
        </Box>
      </Box>
    );
  }

  // Summary step
  if (currentStep === 'summary') {
    const totalAmount = Object.values(userTotals).reduce((sum, amount) => sum + amount, 0);

    return (
      <LoadingContainer>
        {/* Animated Background Elements */}
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            top: '-10%',
            right: '-10%',
            animationDelay: '0s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '320px',
            height: '320px',
            bottom: '-10%',
            left: '-10%',
            animationDelay: '1s',
          }}
        />
        <BackgroundElement
          sx={{
            width: '128px',
            height: '128px',
            top: '25%',
            left: '25%',
            animationDelay: '0.5s',
          }}
        />

        {/* Floating Dots */}
        <FloatingElement sx={{ top: '20%', left: '10%', width: '8px', height: '8px', animationDelay: '0.3s' }} />
        <FloatingElement sx={{ top: '40%', right: '16%', width: '4px', height: '4px', animationDelay: '0.7s' }} />
        <FloatingElement sx={{ bottom: '32%', right: '20%', width: '6px', height: '6px', animationDelay: '1s' }} />

        <Box sx={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 2 }}>
          <StepperBar>
            {steps.map((label, idx) => (
              <StepDot key={label} active={getStepIndex() === idx} />
            ))}
          </StepperBar>

          <Zoom in timeout={800}>
            <LoadingCard>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Receipt Header */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4, 
                  borderBottom: '2px dashed rgba(71, 85, 105, 0.3)', 
                  pb: 3 
                }}>
                  <Fade in timeout={800}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 1, 
                        background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {restaurantName || 'DOK KHAO'}
                    </Typography>
                  </Fade>
                  <Fade in timeout={1000}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        mb: 2,
                        fontWeight: 500,
                      }}
                    >
                      BILL SPLIT SUMMARY
                    </Typography>
                  </Fade>
                  <Fade in timeout={1200}>
                    <Box sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      mb: 2,
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Fade>
                  <Fade in timeout={1400}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    >
                      {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </Typography>
                  </Fade>
                </Box>

                {/* Receipt Line Items */}
                <Box sx={{ mb: 4 }}>
                  {Object.entries(userTotals).map(([participant, amount], index) => (
                    <Slide direction="up" in timeout={1000 + index * 200} key={participant}>
                      <Box
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setCurrentStepWithLog('individual');
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2.5,
                          mb: 2,
                          borderRadius: '12px',
                          background: 'rgba(51, 65, 85, 0.5)',
                          border: '1px solid rgba(71, 85, 105, 0.3)',
                          backdropFilter: 'blur(10px)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'monospace',
                          '&:hover': {
                            background: 'rgba(51, 65, 85, 0.7)',
                            borderColor: 'rgba(59, 130, 246, 0.4)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                          },
                        }}
                      >
                        {/* Left side - Name */}
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#f8fafc',
                              fontFamily: 'monospace',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontSize: '1.1rem',
                            }}
                          >
                            {participant}
                          </Typography>
                        </Box>

                        {/* Right side - Amount */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#3b82f6',
                              fontFamily: 'monospace',
                              fontSize: '1.2rem',
                            }}
                          >
                            {formatCurrency(amount, targetCurrency)}
                          </Typography>
                          <ArrowForwardIosIcon sx={{ 
                            fontSize: 16, 
                            color: '#94a3b8',
                            opacity: 0.8,
                          }} />
                        </Box>
                      </Box>
                    </Slide>
                  ))}
                </Box>

                {/* Receipt Total */}
                <Fade in timeout={1400}>
                  <Box sx={{ 
                    borderTop: '2px solid rgba(71, 85, 105, 0.5)',
                    pt: 3,
                    mt: 2,
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'monospace',
                      p: 1,
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#f8fafc',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontSize: '1.2rem',
                        }}
                      >
                        TOTAL
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#3b82f6',
                          fontFamily: 'monospace',
                          fontSize: '1.5rem',
                        }}
                      >
                        {formatCurrency(totalAmount, targetCurrency)}
                      </Typography>
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
                      py: 2, 
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#3b82f6',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        background: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      setSavingReceipt(true);
                      try {
                        // Save the completed receipt to database
                        const response = await fetch('/api/save-receipt', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(session?.access_token && {
                              'Authorization': `Bearer ${session.access_token}`
                            }),
                          },
                          body: JSON.stringify({
                            restaurantName: restaurantName || 'Unknown Restaurant',
                            totalAmount: originalTotal,
                            currency: targetCurrency,
                            items,
                            participants,
                            userTotals,
                            sourceCurrency,
                            targetCurrency,
                            detectedLanguage
                          }),
                        });

                        const result = await response.json();
                        
                        if (result.success) {
                          console.log('✅ Receipt saved successfully:', result.receiptId);
                        } else {
                          console.error('❌ Failed to save receipt:', result.error);
                          // Don't block the user - they can still complete the flow
                        }
                      } catch (error) {
                        console.error('❌ Error saving receipt:', error);
                        // Don't block the user - they can still complete the flow
                      } finally {
                        setSavingReceipt(false);
                      }

                      // Complete the flow regardless of save success
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
                    disabled={savingReceipt}
                    fullWidth
                    sx={{ 
                      py: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      textTransform: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'rgba(71, 85, 105, 0.5)',
                        color: '#64748b',
                        transform: 'none',
                      },
                    }}
                  >
                    {savingReceipt ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Saving...
                      </Box>
                    ) : (
                      'Complete'
                    )}
                  </Button>
                </Box>
              </Box>
            </LoadingCard>
          </Zoom>
        </Box>
      </LoadingContainer>
    );
  }

  // Individual participant receipt view
  if (currentStep === 'individual' && selectedParticipant) {
    const participantTotal = userTotals[selectedParticipant] || 0;
    
    // Get items assigned to this participant with their share details
    const participantItems = items.filter(item => 
      item.shared_by?.includes(selectedParticipant)
    ).map(item => {
      const sharedBy = item.shared_by || [];
      const itemTotal = item.converted_price || item.price;
      
      let participantQty: number;
      let participantShare: number;
      
      if (item.shareEqually) {
        // For share equally items, participant gets an equal share of the total cost
        participantQty = 1; // Conceptually 1 "share"
        const totalCost = itemTotal * item.qty;
        participantShare = totalCost / sharedBy.length;
      } else if (item.qty === 1) {
        // For single quantity items, share the cost
        participantQty = 1;
        participantShare = itemTotal / sharedBy.length;
      } else {
        // For discrete multi-unit items, count actual units assigned
        participantQty = sharedBy.filter(p => p === selectedParticipant).length;
        participantShare = itemTotal * participantQty;
      }
      
      return {
        ...item,
        participantQty,
        participantShare,
        sharedWith: sharedBy.filter(p => p !== selectedParticipant),
        totalSharedBy: sharedBy.length
      };
    });

    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 2 
      }}>
        <Box sx={{ maxWidth: 480, width: '100%' }}>
          <Zoom in timeout={600}>
            <SummaryCard>
              {/* Receipt Header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <IconButton
                    onClick={() => setCurrentStepWithLog('summary')}
                    sx={{ 
                      mr: 2,
                      mt: 0.5,
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      color: 'text.primary',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      mb: 0.5
                    }}>
                      {restaurantName || 'RECEIPT'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary',
                      fontFamily: 'monospace',
                      mb: 1
                    }}>
                      INDIVIDUAL RECEIPT
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      mb: 1
                    }}>
                      {selectedParticipant}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary',
                      fontFamily: 'monospace',
                      mb: detectedLanguage && detectedLanguage.toLowerCase() !== 'english' && detectedLanguage.toLowerCase() !== 'en' ? 1 : 0
                    }}>
                      {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ borderBottom: '1px dashed', borderColor: 'divider', mb: 2 }} />
                  
                {/* Translation Toggle for Individual Receipt */}
                {detectedLanguage && detectedLanguage.toLowerCase() !== 'english' && detectedLanguage.toLowerCase() !== 'en' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <Switch
                      size="small"
                      checked={showOriginalLanguage}
                      onChange={(e) => setShowOriginalLanguage(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'primary.main',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                    }}>
                      {showOriginalLanguage ? 'Show in English' : `Show in ${detectedLanguage}`}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Items List */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1.1rem'
                }}>
                  Items ({participantItems.length})
                </Typography>
                
                {participantItems.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      py: 2,
                      px: 2,
                      mb: 1.5,
                      borderRadius: 2,
                      background: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 0.5,
                        fontSize: '0.95rem'
                      }}>
                        {showOriginalLanguage && item.originalItem ? item.originalItem : item.item}
                        {item.isSpecialItem && (
                          <Chip
                            size="small"
                            label={item.specialType?.toUpperCase() || 'SPECIAL'}
                            sx={{ 
                              ml: 1,
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: item.specialType === 'tax' ? 'warning.main' : 'info.main',
                              color: 'white'
                            }}
                          />
                        )}
                      </Typography>
                      
                      {item.shareEqually ? (
                        // Share equally item
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          Cost split equally among {item.totalSharedBy} people ({item.sharedWith.length > 0 ? `with ${item.sharedWith.join(', ')}` : 'just you'})
                        </Typography>
                      ) : item.qty === 1 ? (
                        // Single shared item
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          {item.isSpecialItem 
                            ? `Split among ${item.totalSharedBy} people`
                            : `Shared with ${item.sharedWith.length > 0 ? item.sharedWith.join(', ') : 'no one else'}`
                          }
                        </Typography>
                      ) : (
                        // Multiple quantity discrete item
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          You got {item.participantQty} of {item.qty} × {formatCurrency(item.converted_price || item.price, targetCurrency)}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}>
                        {item.shareEqually 
                          ? `(${formatCurrency(item.converted_price || item.price, targetCurrency)} × ${item.qty}) ÷ ${item.totalSharedBy} people`
                          : item.qty === 1 
                            ? `${formatCurrency(item.converted_price || item.price, targetCurrency)} ÷ ${item.totalSharedBy} people`
                            : `${formatCurrency(item.converted_price || item.price, targetCurrency)} × ${item.participantQty}`
                        }
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '1rem'
                      }}>
                        {formatCurrency(item.participantShare, targetCurrency)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Total Section */}
              <Box sx={{ 
                p: 3,
                borderRadius: 2,
                background: `rgba(59, 130, 246, 0.05)`,
                border: '1px solid',
                borderColor: 'primary.light',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
                mb: 3
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
                      Total Amount
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700,
                      color: 'text.primary',
                    }}>
                      {formatCurrency(participantTotal, targetCurrency)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'primary.contrastText',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }}>
                    <PersonIcon sx={{ fontSize: 24 }} />
                  </Box>
                </Box>
              </Box>

              {/* Back Button */}
              <Button
                variant="outlined"
                onClick={() => setCurrentStepWithLog('summary')}
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
                Back to Summary
              </Button>
            </SummaryCard>
          </Zoom>
        </Box>
      </Box>
    );
  }

  return null;
};

export default ReceiptProcessor; 