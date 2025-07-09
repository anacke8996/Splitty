// Test script for currency conversion API
const testCurrencyConversion = async () => {
  const testItems = [
    {
      item: "Pizza Margherita",
      price: 12.00,
      qty: 1,
      total: 12.00,
      shared_by: []
    },
    {
      item: "Coca Cola",
      price: 2.50,
      qty: 3,
      total: 7.50,
      shared_by: []
    }
  ];

  console.log('Testing currency conversion API...');
  console.log('Original items (EUR):', testItems);

  try {
    const response = await fetch('http://localhost:3002/api/convert-currency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: testItems,
        fromCurrency: 'EUR',
        toCurrency: 'USD',
      }),
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Conversion result:', data);
    
    if (data.success) {
      console.log('✅ Currency conversion successful!');
      data.items.forEach((item, index) => {
        console.log(`Item ${index + 1}: ${item.item}`);
        console.log(`  Original: €${testItems[index].total.toFixed(2)}`);
        console.log(`  Converted: $${item.converted_total.toFixed(2)}`);
        console.log(`  Rate: ${(item.converted_total / testItems[index].total).toFixed(4)}`);
      });
    } else {
      console.error('❌ Conversion failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Check if running in Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
  // Running in Node.js
  const fetch = require('node-fetch');
  testCurrencyConversion();
} else {
  // Running in browser - export for manual testing
  window.testCurrencyConversion = testCurrencyConversion;
  console.log('Currency conversion test loaded. Run testCurrencyConversion() to test.');
} 