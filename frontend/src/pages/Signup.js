import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");


  const navigate = useNavigate();

  const validateFullName = (name) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2 && parts.every(part => part.length >= 3);
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setFullNameError("");
    setEmailError("");

    if (!validateFullName(fullName)) {
      setFullNameError("Full name must have at least two words, each with at least 3 characters.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/users/createUser/6822ef39c063d6e5981256ff",
        {
          fullName,
          email,
          role: "6822ec234a6d9d8f4367b526",
        }
      );

      if (response.status === 201) {
        alert("Account created successfully. Please login.");
        navigate("/PMS/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Failed to register.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-900">Create Your Account</h2>

        {error && (
          <div className="text-sm text-red-600 text-center font-medium">{error}</div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Abebe Bikila"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setFullNameError(validateFullName(e.target.value)
                  ? ""
                  : "Full name must have at least two words, each with at least 3 characters.");
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              required
            />
            {fullNameError && <div className="text-sm text-red-600 mt-1">{fullNameError}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value)
                  ? ""
                  : "Please enter a valid email address.");
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              required
            />
            {emailError && <div className="text-sm text-red-600 mt-1">{emailError}</div>}
          </div>


          <button
            type="submit"
            className="w-full bg-blue-900 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition duration-200"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/PMS/login" className="text-blue-900 font-medium hover:underline">
              Login
            </a>
          </p>
        </form>

        <p className="text-center text-xs text-gray-400 pt-4">
          © 2024 Selamawit Tariku & Biniyam Solomon
        </p>
      </div>
    </div>
  );
};

export default Signup;
