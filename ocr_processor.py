import os
import base64
import requests
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from mistralai import Mistral
from flask import Flask, request, jsonify
from flask_cors import CORS
print("MISTRAL_API_KEY:", os.getenv("MISTRAL_API_KEY"))
print("EXCHANGE_API_KEY:", os.getenv("EXCHANGE_API_KEY"))

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

def encode_image(image_path: str) -> str:
    """
    Convert an image file to base64 string.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Base64 encoded string of the image
        
    Raises:
        FileNotFoundError: If the image file doesn't exist
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def parse_receipt_markdown(markdown: str):
    import re
    items = []
    lines = markdown.strip().split('\n')

    # Find table header
    table_start = -1
    header_cols = []
    for i, line in enumerate(lines):
        if line.count('|') >= 2 and any(h in line.lower() for h in ['item', 'product', 'description']):
            table_start = i
            header_cols = [col.strip().lower() for col in line.split('|')]
            break

    if table_start == -1:
        print("No table header found")
        return items

    # Find where the table ends
    table_end = len(lines)
    for i in range(table_start + 2, len(lines)):
        if lines[i].count('|') < 2 or re.search(r'total|subtotal|amount due', lines[i], re.IGNORECASE):
            table_end = i
            break

    # Map header columns to expected fields
    col_map = {}
    for idx, col in enumerate(header_cols):
        if 'item' in col or 'product' in col or 'description' in col:
            col_map['item'] = idx
        elif 'price' in col:
            col_map['price'] = idx
        elif 'qty' in col or 'quantity' in col:
            col_map['qty'] = idx
        elif 'total' in col:
            col_map['total'] = idx

    # Parse table rows
    for line in lines[table_start + 2:table_end]:
        if line.count('|') < 2:
            continue
        cols = [c.strip() for c in line.split('|')]
        try:
            item = cols[col_map['item']]
            price = float(re.sub(r'[^\d.]', '', cols[col_map['price']]))
            qty = int(re.sub(r'[^\d]', '', cols[col_map['qty']]))
            total = float(re.sub(r'[^\d.]', '', cols[col_map['total']]))
            if item and price and qty and total:
                items.append({
                    'item': item,
                    'price': price,
                    'qty': qty,
                    'total': total
                })
        except Exception as e:
            continue  # skip rows that can't be parsed

    return items

def convert_prices(items: List[Dict], from_currency: str, to_currency: str) -> List[Dict]:
    """
    Convert prices in a list of items from one currency to another using exchangerate.host API.
    
    Args:
        items (List[Dict]): List of items with price information
        from_currency (str): Source currency code (e.g., 'EUR')
        to_currency (str): Target currency code (e.g., 'USD')
        
    Returns:
        List[Dict]: Updated list of items with converted prices
    """
    # Load API key from environment
    api_key = os.getenv("EXCHANGE_API_KEY")
    if not api_key:
        print("Warning: EXCHANGE_API_KEY not found in environment variables")
        return items
    
    # Skip conversion if currencies are the same
    if from_currency.upper() == to_currency.upper():
        print(f"Currencies are the same ({from_currency}), skipping conversion")
        return items
    
    try:
        # Make a single API call to get the exchange rate
        response = requests.get(
            "https://api.exchangerate.host/convert",
            params={
                "access_key": api_key,
                "from": from_currency.upper(),
                "to": to_currency.upper(),
                "amount": 1  # Get rate for 1 unit
            }
        )
        response.raise_for_status()
        
        # Parse response
        data = response.json()
        if not data.get("success", False):
            print(f"API returned error: {data.get('error', {}).get('info', 'Unknown error')}")
            return items
            
        # Get the exchange rate
        rate = float(data["result"])
        print(f"Exchange rate: 1 {from_currency} = {rate} {to_currency}")
        
        # Convert all items using the same rate
        converted_items = []
        for item in items:
            converted_item = item.copy()
            converted_item["converted_price"] = round(item["price"] * rate, 2)
            converted_item["converted_total"] = round(item["total"] * rate, 2)
            converted_items.append(converted_item)
            
        return converted_items
        
    except requests.RequestException as e:
        print(f"Failed to get exchange rate: {e}")
        return items
    except (KeyError, ValueError) as e:
        print(f"Error processing exchange rate data: {e}")
        return items

def detect_currency(markdown: str) -> str:
    """
    Detect the currency used in the receipt from the markdown text.
    
    Args:
        markdown (str): Markdown text from OCR
        
    Returns:
        str: Currency code (e.g., 'EUR', 'USD', 'GBP')
    """
    # Common currency symbols and their codes
    currency_symbols = {
        '€': 'EUR',
        '$': 'USD',
        '£': 'GBP',
        '¥': 'JPY'
    }
    
    # Look for currency symbols in the text
    for symbol, code in currency_symbols.items():
        if symbol in markdown:
            print(f"Detected currency: {code} (symbol: {symbol})")
            return code
    
    # Default to EUR if no symbol found
    print("No currency symbol detected, defaulting to EUR")
    return 'EUR'

def split_bill(items: List[Dict]) -> Dict[str, float]:
    """
    Split the bill among users based on shared items.
    
    Args:
        items (List[Dict]): List of items with 'shared_by' and 'converted_total' keys
        
    Returns:
        Dict[str, float]: Dictionary mapping each user to their total owed amount
    """
    # Initialize dictionary to store each user's total
    user_totals = {}
    
    # Process each item
    for item in items:
        # Skip items without shared_by or with empty shared_by
        if not item.get('shared_by'):
            print(f"Debug: Skipping item '{item.get('item', 'Unknown')}' - no users assigned")
            continue
            
        # Get the total amount and number of users sharing
        total = item.get('converted_total', 0)
        users = item['shared_by']
        share_per_user = round(total / len(users), 2)
        
        print(f"Debug: Item '{item.get('item', 'Unknown')}' - {total} split among {len(users)} users = {share_per_user} each")
        
        # Add each user's share to their total
        for user in users:
            user_totals[user] = round(user_totals.get(user, 0) + share_per_user, 2)
    
    return user_totals

def get_participants() -> List[str]:
    """
    Get the list of participants splitting the bill.
    
    Returns:
        List[str]: List of participant names
    """
    participants = []
    print("\nEnter the names of people splitting the bill (press Enter twice when done):")
    while True:
        name = input("Enter name (or press Enter to finish): ").strip()
        if not name:
            if not participants:
                print("Please enter at least one name!")
                continue
            break
        participants.append(name)
    return participants

def assign_items_to_participants(items: List[Dict], participants: List[str]) -> List[Dict]:
    """
    Interactively assign items to participants.
    
    Args:
        items (List[Dict]): List of items to assign
        participants (List[str]): List of participant names
        
    Returns:
        List[Dict]: Updated items with shared_by information
    """
    print("\nAssigning items to participants:")
    for item in items:
        print(f"\nItem: {item['item']} - {item['converted_total']:.2f}")
        print("Who is sharing this item? (enter numbers, comma-separated)")
        
        # Show numbered list of participants
        for i, participant in enumerate(participants, 1):
            print(f"{i}. {participant}")
        
        while True:
            try:
                # Get user input and convert to list of indices
                choice = input("Enter numbers (e.g., '1,3'): ").strip()
                if not choice:
                    print("Please select at least one person!")
                    continue
                    
                # Convert input to list of participant names
                indices = [int(x.strip()) - 1 for x in choice.split(',')]
                if any(i < 0 or i >= len(participants) for i in indices):
                    print("Invalid selection! Please try again.")
                    continue
                    
                # Assign selected participants to the item
                item['shared_by'] = [participants[i] for i in indices]
                break
                
            except ValueError:
                print("Invalid input! Please enter numbers separated by commas.")
                continue
    
    return items

def process_document(image_data: str, target_currency: str = "USD") -> Optional[Dict]:
    """
    Process a document using Mistral OCR API.
    Args:
        image_data (str): Base64-encoded image string (from frontend)
        target_currency (str): Currency code to convert prices to (default: USD)
    Returns:
        Optional[Dict]: Dictionary containing parsed receipt data, or None if processing failed
    Raises:
        ValueError: If API key is not found in environment variables
        Exception: If OCR processing fails
    """
    # Get API key from environment variables
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError("Mistral API key not found in environment variables")
    client = Mistral(api_key=api_key)

    # Use the base64 image string directly
    base64_image = image_data

    # Prepare document data
    document = {
        "type": "image_url",
        "image_url": f"data:image/jpeg;base64,{base64_image}"
    }

    try:
        # Process document with OCR
        response = client.ocr.process(
            model="mistral-ocr-latest",
            document=document,
            include_image_base64=True
        )
        
        if response.pages:
            # Get the first page's markdown
            markdown = response.pages[0].markdown
            
            # Parse receipt items
            items = parse_receipt_markdown(markdown)
            if items:
                # Detect source currency from the receipt
                source_currency = detect_currency(markdown)
                
                # Convert prices to target currency
                converted_items = convert_prices(items, source_currency, target_currency)
                
                return {
                    'success': True,
                    'items': converted_items,
                    'source_currency': source_currency,
                    'target_currency': target_currency,
                    'raw_markdown': markdown
                }
            else:
                return {
                    'success': False,
                    'error': 'No items could be parsed from the receipt'
                }
        else:
            return {
                'success': False,
                'error': 'No pages found in OCR response'
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/api/process-receipt', methods=['POST'])
def process_receipt():
    """
    API endpoint to process a receipt image and return parsed items.
    Expects a base64 encoded image in the request body.
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
            
        image_data = data['image']
        target_currency = data.get('target_currency', 'USD')
        
        # Process the document
        result = process_document(image_data, target_currency)
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': 'Failed to process receipt'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/split-bill', methods=['POST'])
def split_bill_endpoint():
    """
    API endpoint to split a bill among participants.
    Expects items and participants in the request body.
    """
    try:
        data = request.get_json()
        if not data or 'items' not in data or 'participants' not in data:
            return jsonify({'error': 'Missing required data'}), 400
            
        items = data['items']
        participants = data['participants']
        
        # Split the bill
        user_totals = split_bill(items)
        
        return jsonify({
            'success': True,
            'user_totals': user_totals
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def main():
    """
    Main function to run the Flask application.
    """
    port = int(os.getenv('PORT', 5001))
    # Run on all network interfaces (0.0.0.0) to allow external connections
    app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == "__main__":
    main() 