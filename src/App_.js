import React, { useState } from 'react';

function App_() {
  const [userInput, setUserInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${backendURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();
      setChatResponse(data.answer);
    } catch (error) {
      console.error('Error:', error);
      setChatResponse('Server error occurred.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Psychological Counseling</h1>
      <div>
        <img 
          src="/avatar.png" 
          style={{ width: '150px', height: '150px', borderRadius: '50%' }} 
        />
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => {
            console.log("User input:", e.target.value)
            setUserInput(e.target.value)}
          }
          placeholder="What's on your mind?"
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
          Send
        </button>
      </form>
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
        <h2>Counseling Response:</h2>
        <p>{chatResponse}</p>
      </div>
    </div>
  );
}

export default App_;