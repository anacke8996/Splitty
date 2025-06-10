import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { processReceipt } from '../services/api';

export default function ReceiptUpload({ onReceiptProcessed }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await processReceipt(acceptedFiles[0]);
            onReceiptProcessed(result);
        } catch (err) {
            setError(err.message || 'Failed to process receipt');
        } finally {
            setIsProcessing(false);
        }
    }, [onReceiptProcessed]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.heic']
        },
        maxFiles: 1
    });

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Upload Your Receipt
                </h2>
                <p className="text-gray-600">
                    Take a photo or upload a receipt image to get started
                </p>
            </div>

            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                    ${isDragActive 
                        ? 'border-blue-500 bg-blue-50 scale-105' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
            >
                <input {...getInputProps()} />
                {isProcessing ? (
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Processing receipt...</p>
                        <p className="mt-2 text-sm text-gray-500">This may take a few seconds</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-lg"></div>
                            <svg
                                className="relative w-20 h-20 text-blue-600"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-900">
                                {isDragActive
                                    ? 'Drop your receipt here'
                                    : 'Drag and drop your receipt'}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                or click to browse files
                            </p>
                        </div>
                        <div className="mt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Supports JPEG, PNG, and HEIC
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl shadow-sm border border-red-100">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
} 