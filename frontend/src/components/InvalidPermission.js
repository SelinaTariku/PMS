import React, { useEffect, useState } from 'react';

const InvalidPermission = () => {
  const [brandColor, setBrandColor] = useState('');

  // Get the brandColor from localStorage on component mount
  useEffect(() => {
    const savedBrandColor = localStorage.getItem('brandColor');
    if (savedBrandColor) {
      setBrandColor(savedBrandColor);
    } else {
      // If no color is set, use a default fallback color
      setBrandColor('#ff7e5f');
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: `linear-gradient(to right, ${brandColor}, #feb47b)`,
        color: '#fff',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '40px 60px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Access Denied</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
          You do not have permission to access this page.
        </p>
        <p style={{ fontSize: '1rem', marginBottom: '25px' }}>
          Please contact your administrator for assistance.
        </p>
        <button
          onClick={() => window.location.href = '/PharmacSphere/Portal'}
          style={{
            backgroundColor: brandColor,
            border: 'none',
            color: '#fff',
            padding: '10px 20px',
            fontSize: '1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default InvalidPermission;
