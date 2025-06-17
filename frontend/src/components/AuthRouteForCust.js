import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); 
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login page.");
      navigate("/PMS/login");
    }
  }, [token, navigate]);

  return token ? <>{children}</> : null; 
};

export default AuthRoute;