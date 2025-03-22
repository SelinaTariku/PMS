import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    let errors = {};

    if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (newPassword && !validatePassword(newPassword)) {
      errors.newPassword = "Invalid Password Format";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "New password and confirmation do not match.";
    }

    setFormErrors(errors);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateForm(); 
  };

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
    validateForm(); 
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    validateForm();
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(formErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:5000/users/changePassword', {
          email,
          currentPassword,
          newPassword,
        });

        setMessage(response.data.message);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setFormErrors({});

        if (response.status === 200) {
          setTimeout(() => {
            navigate('/PharmacSphere');  
          }, 10000); 
        }

      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.message || 'Error: Unable to change password. Please try again.');
        } else {
          setMessage('Network error. Please try again later.');
        }
      }
    }
  };

  const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleForgotPassword = () => {
    navigate('/PharmacSphere/forgot-password');
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-4 space-y-8">
        <h2 className="text-center text-2xl font-bold  text-blue-900">Change Password</h2>
        <form className=" space-y-2" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="email" className="block text-left text-lg font-medium text-blue-900">Email</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          <div className="relative">
            <label htmlFor="currentPassword" className="block text-left text-lg font-medium text-blue-900">Current Password</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                className="w-full px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Current Password"
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
              />
              <button
                type="button"
                onClick={toggleShowCurrentPassword}
                className="absolute right-2 text-gray-400 focus:outline-none"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="newPassword" className="block text-left text-lg font-medium text-blue-900">New Password</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                className="w-full px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New Password"
                value={newPassword}
                onChange={handleNewPasswordChange}
              />
              <button
                type="button"
                onClick={toggleShowNewPassword}
                className="absolute right-2 text-gray-400 focus:outline-none"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formErrors.newPassword && <p className="text-red-500 text-sm mt-1">{formErrors.newPassword}</p>}
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-left text-lg font-medium text-blue-900">Confirm New Password</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="w-full px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button
                type="button"
                onClick={toggleShowConfirmPassword}
                className="absolute right-2 text-gray-400 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full flex justify-center py-1 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </div>
        </form>

        <div className="mt-1 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-900 hover:underline"
          >
            Forgot Current Password?
          </button>
          <button
            onClick={() => navigate('/PharmacSphere')}
            className="text-sm text-blue-900 ml-20 hover:underline"
          >
            Back to Login
          </button>
        </div>

        {message && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h2 className="text-xl font-semibold">{message}</h2>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigate('/PharmacSphere')} 
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;