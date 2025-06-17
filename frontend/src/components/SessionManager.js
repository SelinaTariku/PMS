import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionManager = ({ children, requiredPermission }) => {
  const [permissions, setPermissions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutIdRef = useRef(null); 
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; 

  const handleLogout = () => {
    console.log("User inactive for 5 minutes, logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/PharmacSphere"); 
  };

  const resetInactivityTimer = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  };

  const checkSessionAndPermissions = async () => {
    const role = localStorage.getItem("role");
    if (!role) {
      navigate("/PharmacSphere"); 
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/role/getPermissionsByRoleName/${role}`);
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const data = await response.json();
      if (Array.isArray(data.pageNames)) {
        setPermissions(data.pageNames);

        const hasPermission = data.pageNames.includes(requiredPermission);

        if (!hasPermission) {
          navigate("/invalid-permission"); // Redirect if no permission
        }
      } else {
        console.error("Invalid permissions data:", data);
        navigate("/PharmacSphere"); 
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      navigate("/PharmacSphere"); // Redirect on error
    } finally {
      setIsLoading(false); // Set loading to false after the check
    }
  };

  useEffect(() => {
    // Add event listeners for user activity
    const events = ['mousemove', 'mousedown', 'click', 'scroll', 'keypress', 'keydown', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Initialize the inactivity timer
    resetInactivityTimer();

    // Check session and permissions
    checkSessionAndPermissions();

    // Cleanup function to remove event listeners and clear timeout
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [location, navigate, requiredPermission]);

  // Show a loading indicator while checking permissions
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render children only if permissions are available
  return permissions.length > 0 ? children : null;
};

export default SessionManager;