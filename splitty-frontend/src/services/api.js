// Use environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const processReceipt = async (imageFile, targetCurrency = 'USD') => {
    try {
        // Convert image to base64
        const base64Image = await convertToBase64(imageFile);
        
        const response = await fetch(`${API_BASE_URL}/process-receipt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                target_currency: targetCurrency
            })
        });

        if (!response.ok) {
            throw new Error('Failed to process receipt');
        }

        return await response.json();
    } catch (error) {
        console.error('Error processing receipt:', error);
        throw error;
    }
};

export const splitBill = async (items, participants) => {
    try {
        const response = await fetch(`${API_BASE_URL}/split-bill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items,
                participants
            })
        });

        if (!response.ok) {
            throw new Error('Failed to split bill');
        }

        return await response.json();
    } catch (error) {
        console.error('Error splitting bill:', error);
        throw error;
    }
};

// Helper function to convert image to base64
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
}; 