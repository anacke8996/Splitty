# Receipt OCR and Currency Converter

A Python script that processes receipt images using Mistral's OCR API and converts prices between currencies.

## Features

- Image to text conversion using Mistral OCR API
- Automatic receipt parsing and item extraction
- Currency detection and conversion using exchangerate.host API
- Support for multiple currencies (EUR, USD, GBP, JPY)
- Handles zero-price items and error cases

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repo-name>
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

## Usage

Run the script with an image file:
```bash
python ocr_processor.py
```

By default, it will:
1. Process the image using OCR
2. Detect the source currency
3. Convert prices to USD

You can modify the target currency in the code:
```python
process_document("receipt.jpg", target_currency="GBP")
```

## Requirements

- Python 3.6+
- mistralai
- python-dotenv
- requests

## License

MIT License 