import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import pharmaLogo from '../assets/Image/logo.png';

const Login = () => {
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/users/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { _id, role, fullName, pharmacy, branches, reSeted, passwordChangeDate } = response.data.user;
        const nameParts = fullName.split(" ");
        const filteredUsername = `${nameParts[0]} ${nameParts[1] || ""}`.trim();

        const pharmacyResponse = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${pharmacy}`);
       
        localStorage.setItem("token", response.data.sessionToken);
        localStorage.setItem("userName", filteredUsername);
        localStorage.setItem("pharmacy", pharmacy);
        localStorage.setItem("branches", branches);
        
        localStorage.setItem("id", _id);
        localStorage.setItem("branches", branches);
        localStorage.setItem("role", role);
        localStorage.setItem("PharmacyName", pharmacyResponse.data.name);
        localStorage.setItem("PharmacyLogo", pharmacyResponse.data.logo);
        localStorage.setItem("tin", pharmacyResponse.data.TIN);
        localStorage.setItem("phone", pharmacyResponse.data.phone);
        localStorage.setItem("brandColor", pharmacyResponse.data.brandColor);
        localStorage.setItem("address", pharmacyResponse.data.city + " "+pharmacyResponse.data.state + " "+pharmacyResponse.data.street);
        localStorage.setItem("expiredDate",pharmacyResponse.data.licenseExpirationDate);
        console.log("TIN Number ", localStorage.getItem('tin'))
        console.log("Full Address ", localStorage.getItem('address'))
        const currentDate = new Date();
        const changeDate = new Date(passwordChangeDate);
        currentDate.setHours(0, 0, 0, 0);
        changeDate.setHours(0, 0, 0, 0);

        const diffTime = currentDate - changeDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays > 60) {
          // Show confirmation dialog
          const confirmed = window.confirm("Your password is expired. Please change it before logging in.");
          if (confirmed) {
            navigate("/PharmacSphere/ChangePassword");
          }
        } else if (reSeted === false) {
        
          navigate("/PharmacSphere/Portal");
          const branchDetail = await axios.get(`http://localhost:5000/branches/getBranchById/${branches}`)
          localStorage.setItem("branchesName", branchDetail.data.name);
        } else {
          navigate("/PharmacSphere/ChangePassword");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 403) {
        setError(error.response.data.message); 
      } else {
        setError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-lg p-2 mb-16">
          <div className="flex justify-center items-center h-32">
            <img
              alt="Pharma Sphere Logo"
              className="h-full w-full object-cover"
              src={pharmaLogo}
            />
          </div>
        </div>
        <div className="relative bg-white rounded-lg shadow-lg p-4 mt-8">
          <div className="absolute inset-x-0 top-0 -translate-y-1/2 flex justify-center mb-2">
            <div className="bg-blue-900 rounded-full p-4">
              <i className="fas fa-user text-white text-5xl"></i>
            </div>
          </div>
          <h2 className="text-center text-xl font-semibold text-gray-700 mt-8 mb-4">
            Welcome to Pharma Sphere
          </h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="mb-3 flex items-center border rounded-lg px-2 py-1">
              <i className="fas fa-user text-gray-700 mr-2"></i>
              <input
                className="w-3/4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="User Name"
                type="text"
                value={email}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 flex items-center border rounded-lg px-2 py-1">
              <i className="fas fa-lock text-gray-700 mr-2"></i>
              <input
                className="w-3/4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`fas ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"} text-gray-500 ml-2 cursor-pointer`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
            <div className="mb-3">
              <button
                className="w-full bg-blue-900 text-white py-1 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="submit"
              >
                Login
              </button>
            </div>
            
            <div className="text-center">
              <a
                className="text-blue-600 hover:underline"
                href="/PharmacSphere/forgot-password"
              >
                Forget Password
              </a>
            </div>
          </form>
        </div>
        <div className="text-center mt-4 text-gray-600 text-sm">
          Copyright © 2024 Selamawit Tariku and Biniyam Solomon
        </div>
      </div>
    </div>
  );
};

export default Login;