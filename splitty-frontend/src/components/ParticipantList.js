import { useState } from 'react';

export default function ParticipantList({ onParticipantsUpdate }) {
    const [participants, setParticipants] = useState([]);
    const [newParticipant, setNewParticipant] = useState('');

    const addParticipant = (e) => {
        e.preventDefault();
        if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
            const updatedParticipants = [...participants, newParticipant.trim()];
            setParticipants(updatedParticipants);
            onParticipantsUpdate(updatedParticipants);
            setNewParticipant('');
        }
    };

    const removeParticipant = (index) => {
        const updatedParticipants = participants.filter((_, i) => i !== index);
        setParticipants(updatedParticipants);
        onParticipantsUpdate(updatedParticipants);
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Participants</h2>
            
            <form onSubmit={addParticipant} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        placeholder="Enter participant name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add
                    </button>
                </div>
            </form>

            <div className="space-y-2">
                {participants.map((participant, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                        <span className="text-gray-900">{participant}</span>
                        <button
                            onClick={() => removeParticipant(index)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {participants.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        {participants.length} participant{participants.length !== 1 ? 's' : ''} added
                    </p>
                </div>
            )}
        </div>
    );
} 