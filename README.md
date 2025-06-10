# Splitty - Receipt Splitting App

A React Native (Expo) app that helps split bills by scanning receipts and assigning items to people.

## Features

- Upload receipt images for OCR processing
- Automatic currency detection and conversion to USD
- Add/remove users for bill splitting
- Assign items to multiple users
- Calculate split amounts per person

## Setup

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:
```
MISTRAL_API_KEY=your_mistral_api_key
EXCHANGE_API_KEY=your_exchange_api_key
```

4. Run the backend server:
```bash
python server.py
```

The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Use the Expo Go app on your mobile device to scan the QR code, or press 'i' for iOS simulator or 'a' for Android emulator.

## Usage

1. Upload a receipt image
2. Add the names of people splitting the bill
3. Assign items to people by tapping on their names
4. View the final split amounts per person

## Development

- Backend: Python with Flask
- Frontend: React Native with Expo
- OCR: Mistral AI
- Currency Conversion: ExchangeRate API

## Notes

- The app requires an internet connection for OCR processing and currency conversion
- Receipt images should be clear and well-lit for best results
- All amounts are converted to USD for consistency 