import React, { useState } from 'react';
import { askAssistant } from '../lib/api';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    intent?: string;
    citations?: string[];
}

interface SupportAssistantProps {
    open: boolean;
    onClose: () => void;
    customerId?: string;
}

export default function SupportAssistant({ open, onClose, customerId }: SupportAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm Alex, your customer support specialist. How can I help you today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const result = await askAssistant(input, { customerId });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: result.text,
                isUser: false,
                timestamp: new Date(),
                intent: result.intent,
                citations: result.citations
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Assistant error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I'm having trouble connecting right now. Please try again or contact our support team directly.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-medium">Support Assistant</h3>
                        <p className="text-xs text-gray-500">Alex - Customer Support Specialist</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 text-sm ${message.isUser
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p>{message.text}</p>
                                {message.citations && message.citations.length > 0 && (
                                    <div className="mt-2 text-xs opacity-75">
                                        Sources: {message.citations.join(', ')}
                                    </div>
                                )}
                                <div className="text-xs opacity-75 mt-1">
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                    Alex is typing...
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
