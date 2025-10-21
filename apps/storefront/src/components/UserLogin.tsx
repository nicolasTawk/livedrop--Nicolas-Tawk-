import React, { useState } from 'react';
import { getCustomerByEmail, createCustomer } from '../lib/api';

interface UserLoginProps {
    onLogin: (customer: any) => void;
    currentCustomer?: any;
}

export default function UserLogin({ onLogin, currentCustomer }: UserLoginProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Try to find existing customer
            let customer;
            try {
                customer = await getCustomerByEmail(email);
            } catch (err) {
                // Customer not found, create new one
                customer = await createCustomer({
                    name: email.split('@')[0], // Use email prefix as name
                    email,
                    phone: '',
                    address: {}
                });
            }

            onLogin(customer);
        } catch (err) {
            setError('Failed to login. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (currentCustomer) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-green-800">
                            Logged in as <strong>{currentCustomer.name}</strong>
                        </p>
                        <p className="text-xs text-green-600">{currentCustomer.email}</p>
                    </div>
                    <button
                        onClick={() => onLogin(null)}
                        className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
                Enter your email to continue
            </h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '...' : 'Login'}
                </button>
            </form>
            {error && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
            )}
            <p className="text-xs text-blue-600 mt-2">
                Use <strong>demo@example.com</strong> for testing
            </p>
        </div>
    );
}
