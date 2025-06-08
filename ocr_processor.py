import os
import base64
import requests
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from mistralai import Mistral

# Load environment variables from .env file
load_dotenv()

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

def parse_receipt_markdown(markdown: str) -> List[Dict[str, Any]]:
    """
    Extract structured receipt items from a markdown table string.
    
    Args:
        markdown (str): Markdown string containing the receipt table
        
    Returns:
        List[Dict[str, Any]]: List of dictionaries containing parsed receipt items
        Each dictionary has keys: item, price, qty, total
    """
    items = []
    
    # Split into lines and process each line
    lines = markdown.strip().split('\n')
    
    # Debug: Print all lines to see the structure
    print("\nDebug: All lines in markdown:")
    for i, line in enumerate(lines):
        print(f"Line {i}: {line}")
    
    # Find the table section
    table_start = -1
    table_end = -1
    
    for i, line in enumerate(lines):
        # Look for table header with more flexible matching
        if '|' in line and any(header in line.upper() for header in ['PRODUCT', 'ITEM', 'DESCRIPTION']):
            table_start = i
            print(f"\nDebug: Found table start at line {i}: {line}")
        # Look for total line
        elif '|' in line and any(total in line.upper() for total in ['TOTAL QTY', 'SUBTOTAL', 'TOTAL']):
            table_end = i
            print(f"\nDebug: Found table end at line {i}: {line}")
            break
    
    if table_start == -1 or table_end == -1:
        print("\nDebug: Could not find table boundaries")
        print(f"Table start: {table_start}, Table end: {table_end}")
        return items
    
    print(f"\nDebug: Processing table from line {table_start} to {table_end}")
    
    # Process only the table rows between headers and total
    for line in lines[table_start + 2:table_end]:  # Skip header and separator line
        # Skip empty lines or lines without proper table format
        if not line.strip() or not line.startswith('|'):
            continue
            
        # Split the line into columns and clean up
        columns = [col.strip() for col in line.split('|')[1:-1]]
        
        # Debug: Print the columns found
        print(f"\nDebug: Processing line: {line}")
        print(f"Found columns: {columns}")
        
        # Skip if we don't have all required columns
        if len(columns) < 4:
            print("Debug: Skipping - insufficient columns")
            continue
            
        item, price_str, qty_str, total_str = columns
        
        # Skip if any required field is empty
        if not all([item, price_str, qty_str, total_str]):
            print("Debug: Skipping - empty fields")
            continue
            
        try:
            # Clean and convert price (remove € and convert to float)
            price = float(price_str.replace('€', '').strip())
            
            # Skip items with zero price
            if price == 0.0:
                print(f"Debug: Skipping - zero price item: {item}")
                continue
            
            # Clean and convert quantity (should be integer)
            qty = int(qty_str.strip())
            
            # Clean and convert total (remove € and convert to float)
            total = float(total_str.replace('€', '').strip())
            
            # Add to items list if all conversions successful
            items.append({
                "item": item,
                "price": price,
                "qty": qty,
                "total": total
            })
            print(f"Debug: Successfully parsed item: {item}")
            
        except (ValueError, TypeError) as e:
            print(f"Debug: Failed to convert values: {e}")
            continue
    
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

def process_document(image_path: str, target_currency: str = "USD") -> Optional[str]:
    """
    Process a document using Mistral OCR API.
    
    Args:
        image_path (str): Path to the image file to process
        target_currency (str): Currency code to convert prices to (default: USD)
        
    Returns:
        Optional[str]: Markdown output from the OCR process, or None if processing failed
        
    Raises:
        ValueError: If API key is not found in environment variables
        Exception: If OCR processing fails
    """
    # Get API key from environment variables
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError("Mistral API key not found in environment variables")
    
    # Initialize Mistral client
    client = Mistral(api_key=api_key)
    
    # Encode the image
    try:
        base64_image = encode_image(image_path)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return None
    
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
        
        # Print and return the Markdown output from each page
        if response.pages:
            for i, page in enumerate(response.pages, 1):
                print(f"\nPage {i} Raw OCR Output:")
                print("=" * 50)
                print(page.markdown)
                print("=" * 50)
                
                # Parse and print structured receipt data
                items = parse_receipt_markdown(page.markdown)
                if items:
                    # Detect source currency from the receipt
                    source_currency = detect_currency(page.markdown)
                    
                    print(f"\nParsed Receipt Items ({source_currency}):")
                    for item in items:
                        print(f"- {item['item']}: {item['qty']} x {source_currency} {item['price']:.2f} = {source_currency} {item['total']:.2f}")
                    
                    # Convert prices to target currency
                    converted_items = convert_prices(items, source_currency, target_currency)
                    if converted_items != items:  # Only show if conversion was successful
                        print(f"\nConverted Prices ({source_currency} to {target_currency}):")
                        for item in converted_items:
                            if "converted_price" in item:
                                print(f"- {item['item']}: {item['qty']} x {target_currency} {item['converted_price']:.2f} = {target_currency} {item['converted_total']:.2f}")
                else:
                    print("\nNo items could be parsed from the receipt.")
                    print("Debug: Receipt format not recognized or no items found.")
                
            return "\n".join(page.markdown for page in response.pages)
        else:
            print("No pages found in OCR response")
            return None
            
    except Exception as e:
        print(f"OCR processing failed: {e}")
        return None

def main():
    """
    Main function to demonstrate the OCR processing.
    """
    # Example usage
    sample_image = "/Users/alwinn/splitty2/IMG_4266 2.HEIC"  # Replace with your image path
    print(f"Processing document: {sample_image}")
    # You can specify a different target currency if needed
    process_document(sample_image, target_currency="USD")

if __name__ == "__main__":
    main() 