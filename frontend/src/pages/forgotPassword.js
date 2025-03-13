import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  
import pharmaLogo from '../assets/Image/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();  

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/users/PasswordReset', { email });
            setMessage(response.data.message);
            setIsModalOpen(true); 
            setTimeout(() => {
                navigate('/PharmacSphere/ChangePassword');  
            }, 2000);  

        } catch (error) {
            setMessage('Error: Unable to reset password. Please try again.');
            setIsModalOpen(true); 
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6 flex justify-center mb-16">
                    <img 
                        src={pharmaLogo} 
                        alt="Pharma Sphere Solution logo" 
                        className="w-48" 
                        width="200" 
                        height="100"
                    />
                </div>
                <div className="relative bg-white rounded-lg shadow-md p-6">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                        <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center">
                            <i className="fas fa-user-circle text-white text-6xl"></i>
                        </div>
                    </div>
                    <h2 className="text-center text-2xl font-bold text-gray-700 mt-12">Password Reset</h2>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <div className="pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-envelope text-gray-400"></i>
                                </div>
                                <input 
                                    id="email" 
                                    name="email" 
                                    type="email"
                                    required 
                                    className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <button 
                                type="submit" 
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <i className="fas fa-lock mr-2"></i> Reset
                            </button>
                        </div>
                    </form>

                    {/* Message Popup */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-md text-center w-80">
                                <p className="text-gray-700">{message}</p>
                                <div className="mt-4">
                                    <button 
                                        onClick={closeModal} 
                                        className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <a href="/PharmacSphere" className="text-blue-900 hover:underline flex items-center">
                            <i className="fas fa-arrow-left mr-2"></i> Back to Login
                        </a>
                    </div>
                </div>

                <footer className="text-center text-gray-500 text-sm mt-4">
                    Copyright © 2024 Selamawit Tariku and Biniyam Solomon
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;
