# Splitty - AI-Powered Receipt Splitting App

A modern web application that uses AI to intelligently split bills by scanning receipts with multi-language support, currency conversion, and user authentication.

## 🎯 **Complete Feature Overview**

### **📱 Frontend Features**

**Core UI Components:**
- Modern dark theme with Material-UI design system
- Responsive mobile-first design with touch-friendly interfaces
- Progressive Web App (PWA) with manifest.json and service worker support
- Gradient animations, transitions, and micro-interactions
- Professional receipt-style formatting for final outputs

**Receipt Processing Workflow:**
- Multi-step guided interface (Processing → Review → Add Names → Assign → Summary)
- Image upload with drag-and-drop and file selection
- HEIC to JPEG conversion for Apple device compatibility
- Real-time processing status with animated loading states
- Item review and editing capabilities
- Currency detection and conversion selector
- Translation toggle for multi-language receipts
- Individual participant receipt views

**Bill Splitting Interface:**
- Dynamic participant management (add/remove people)
- Visual item assignment with participant checkboxes
- Special item handling (tax, tips, service charges) with auto-assignment
- "Share equally" vs individual assignment options
- Real-time calculation preview
- Professional receipt-style summary with restaurant branding

**Authentication & Navigation:**
- Protected route system requiring login
- Email/password authentication with Supabase
- User menu with profile info and logout
- Navigation bar with app branding and history access
- Loading states and error handling

### **🔧 Backend API Features**

**Receipt Processing (`/api/process-receipt`):**
- GPT-4.1-mini integration for intelligent OCR
- Restaurant name extraction from receipt headers
- Multilingual support with original + English translation
- Smart quantity detection with retail vs restaurant logic
- Tax inclusion detection (American vs European styles)
- Special item classification (tax, tips, service charges, discounts)
- Automatic image format conversion and optimization
- Receipt data validation and error handling

**Currency Management (`/api/convert-currency`):**
- Real-time exchange rates via FreeCurrency API
- Support for 8+ major currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY)
- Accurate rate rounding for predictable calculations
- Preserves original currency data alongside converted values

**Bill Calculation (`/api/split-bill`):**
- Sophisticated splitting algorithms for different item types
- Automatic special item distribution among all participants
- Pro-rated sharing for multi-quantity items
- Conversion-aware calculations using latest exchange rates
- Detailed per-person breakdowns with itemized lists

**Data Persistence (`/api/receipts`):**
- User-specific receipt history storage
- Secure data access with Row-Level Security
- Receipt metadata including restaurant, totals, participants
- Automatic saving on successful processing

### **🗄️ Database & Infrastructure**

**Supabase Integration:**
- PostgreSQL database with Row-Level Security policies
- Real-time authentication with email/password
- User session management and JWT token handling
- Automated user data isolation

**Database Schema:**
- `receipts` table with comprehensive receipt data storage
- User-linked receipt history with timestamps
- JSON storage for complex receipt items and split results
- Participant and assignment data persistence

**Security Features:**
- Row-Level Security ensuring users only access their data
- JWT token validation on all protected endpoints
- Secure authentication state management
- Protected API routes with authorization middleware

**Cloud Deployment:**
- Vercel hosting with automatic deployments
- Environment variable management for API keys
- Production-ready build optimization
- Progressive Web App capabilities

### **🌟 Advanced Features**

**AI-Powered Intelligence:**
- Context-aware quantity detection (retail vs restaurant receipts)
- Multi-language OCR with automatic translation
- Smart tax detection based on currency and receipt format
- Intelligent item classification and validation

**Multi-Currency Support:**
- Automatic currency detection from receipt images
- Real-time conversion with up-to-date exchange rates
- Support for major global currencies
- Original currency preservation for transparency

**User Experience Enhancements:**
- Receipt-style professional output formatting
- Language toggle for bilingual receipt viewing
- Individual participant receipt generation
- Responsive design across all device sizes
- Offline-capable PWA functionality

**Data Management:**
- Persistent receipt history across sessions
- Detailed receipt viewing and management
- Export-ready professional receipt formatting
- User account management with secure logout

## 📊 **Technical Stack**

- **Frontend**: Next.js 14, React 18, TypeScript, Material-UI, PWA
- **Backend**: Next.js API Routes, OpenAI GPT-4.1-mini, FreeCurrency API
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **Deployment**: Vercel with automatic builds
- **Image Processing**: HEIC conversion, Base64 handling
- **Styling**: Material-UI dark theme, responsive design

## Setup

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd splitty-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your API keys:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
FREECURRENCY_API_KEY=your_freecurrency_api_key
```

4. Start the development server:
```bash
npm run dev
```

The app will run on http://localhost:3000

## Usage

1. **Sign up/Login** - Create an account or sign in to access the app
2. **Upload Receipt** - Take a photo or upload an image of your receipt
3. **Review Items** - Verify the extracted items and edit if needed
4. **Currency Conversion** - Choose your preferred currency if different from the receipt
5. **Add Participants** - Enter the names of people splitting the bill
6. **Assign Items** - Select who is responsible for each item
7. **View Summary** - See the professional receipt-style breakdown
8. **Access History** - View all your previous receipts in the history section

## Features in Action

- **Multi-language Support**: Processes receipts in various languages and provides translation toggle
- **Smart Tax Detection**: Automatically identifies whether tax is included or separate based on receipt format
- **Professional Output**: Generates authentic-looking receipt summaries with restaurant branding
- **Persistent History**: All processed receipts are saved and accessible through your account
- **Currency Intelligence**: Detects receipt currency and converts to your preferred currency

## Development

The app uses a modern full-stack architecture with:
- Server-side rendering with Next.js
- Real-time authentication and database with Supabase
- AI-powered receipt processing with OpenAI
- Responsive UI with Material-UI components
- Production deployment on Vercel

## Notes

- The app requires an internet connection for OCR processing and currency conversion
- Receipt images should be clear and well-lit for best results
- Supports major image formats including HEIC from Apple devices
- All user data is securely isolated with Row-Level Security policies 