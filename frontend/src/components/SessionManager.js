import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState(null);
  const TIMEOUT_DURATION = 300000; 

  useEffect(() => {
    const handleActivity = () => {
      console.log("User activity detected! Resetting timeout.");
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        console.log("User inactive for 5 minutes, logging out...");
        localStorage.removeItem("token");
        navigate("/PharmacSphere");
      }, TIMEOUT_DURATION);

      setTimeoutId(newTimeoutId);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    handleActivity();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [navigate, timeoutId]);

  return <>{children}</>;
};

export default SessionManager;