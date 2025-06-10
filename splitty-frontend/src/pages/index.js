import { useState } from 'react';
import ReceiptUpload from '../components/ReceiptUpload';
import ReceiptItems from '../components/ReceiptItems';
import ParticipantList from '../components/ParticipantList';
import { splitBill } from '../services/api';

export default function Home() {
    const [step, setStep] = useState(1);
    const [receiptData, setReceiptData] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [splitResult, setSplitResult] = useState(null);
    const [error, setError] = useState(null);

    const handleReceiptProcessed = (data) => {
        setReceiptData(data);
        setStep(2);
    };

    const handleItemsUpdate = (items) => {
        setSelectedItems(items);
        setStep(3);
    };

    const handleParticipantsUpdate = (updatedParticipants) => {
        setParticipants(updatedParticipants);
    };

    const handleSplitBill = async () => {
        try {
            const result = await splitBill(selectedItems, participants);
            setSplitResult(result);
            setStep(4);
        } catch (err) {
            setError(err.message || 'Failed to split bill');
        }
    };

    const steps = [
        { number: 1, title: 'Upload Receipt' },
        { number: 2, title: 'Review Items' },
        { number: 3, title: 'Add People' },
        { number: 4, title: 'Split Bill' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                        Splitty
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Split your bills with ease
                    </p>
                    
                    {/* Progress Steps */}
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            {steps.map((stepItem, index) => (
                                <div key={stepItem.number} className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300
                                            ${
                                                stepItem.number === step
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                                                    : stepItem.number < step
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {stepItem.number}
                                    </div>
                                    <span className="mt-2 text-sm font-medium text-gray-600">
                                        {stepItem.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className="absolute w-full h-0.5 bg-gray-200 -z-10"
                                            style={{
                                                width: '100%',
                                                left: '50%',
                                                top: '24px'
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-lg shadow-sm border border-red-100">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                    {step === 1 && (
                        <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
                    )}

                    {step === 2 && receiptData && (
                        <ReceiptItems
                            items={receiptData.items}
                            onItemsUpdate={handleItemsUpdate}
                        />
                    )}

                    {step === 3 && (
                        <div className="space-y-8">
                            <ParticipantList onParticipantsUpdate={handleParticipantsUpdate} />
                            <div className="text-center">
                                <button
                                    onClick={handleSplitBill}
                                    disabled={participants.length === 0}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
                                >
                                    Split Bill
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && splitResult && (
                        <div className="max-w-xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                                Bill Split Results
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(splitResult.user_totals).map(([user, amount]) => (
                                    <div
                                        key={user}
                                        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm border border-gray-100"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-semibold text-gray-900">
                                                {user}
                                            </span>
                                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                                ${amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 text-center">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setReceiptData(null);
                                        setSelectedItems([]);
                                        setParticipants([]);
                                        setSplitResult(null);
                                    }}
                                    className="px-6 py-3 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                >
                                    Start New Split
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 