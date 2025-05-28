import React from 'react';

export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333'
      }}>Test Page - Inline Styles</h1>
      
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p>This component uses inline styles to test if React rendering is working correctly.</p>
      </div>
      
      {/* Test Tailwind utilities */}
      <h2 className="text-2xl font-bold">Test Tailwind Utilities</h2>
      
      <div className="p-4 bg-red text-white rounded shadow">
        Red Background Block
      </div>
      
      <div className="p-4 bg-blue text-white rounded shadow">
        Blue Background Block
      </div>
      
      <div className="p-4 bg-green text-white rounded shadow">
        Green Background Block
      </div>
      
      {/* Test some custom components */}
      <h2 className="text-2xl font-bold">Test Custom Components</h2>
      
      <div className="gov-card">
        <div className="gov-title">Gov Card Test</div>
        <p>Testing if the gov-card and gov-title classes work correctly.</p>
      </div>
      
      <button className="gov-btn">
        Gov Button
      </button>
    </div>
  );
} 