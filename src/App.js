import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState(() => {
    const savedComplete = localStorage.getItem('completeMessages');
    if (savedComplete) {
      return JSON.parse(savedComplete);
    }
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [userInput, setUserInput] = useState('');
  const completeResponseRef = useRef('');
  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const delete_session = async (e) => {
    try {
      const delResponse = await fetch(`api/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      localStorage.removeItem('messages');
      localStorage.removeItem('completeMessages');
      setMessages([]);
    } catch (error) {
      console.error('Session restart error:', error);
    }
  };


  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);
  const updateCompleteMessages = (newMessages) => {
    localStorage.setItem('completeMessages', JSON.stringify(newMessages));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', content: userInput };
    const newAssistantMessage = { role: 'assistant', content: '...' };
    const newMessages = [...messages, newUserMessage, newAssistantMessage];
    setMessages(newMessages);

    const inputForRequest = userInput;
    setUserInput('');

    try {
      const response = await fetch(`api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: inputForRequest }),
      });
      if (!response.ok) {
        throw new Error('Server error');
      }
      const data = await response.json();
      const fullText = data.answer;
      completeResponseRef.current = ""; 


      const completeMessages = [
        ...newMessages.slice(0, newMessages.length - 1),
        { role: 'assistant', content: fullText }
      ];
      updateCompleteMessages(completeMessages);

      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          completeResponseRef.current += fullText[i];

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: completeResponseRef.current,
            };
            return updated;
          });
          i++;
        } else {
          clearInterval(interval);

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: fullText,
            };
            return updated;
          });
        }
      }, 50);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Server error occurred.',
        };
        return updated;
      });
    }
  };

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isUser = msg.role === 'user';
      return (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '10px',
          }}
        >
          {!isUser && (
            <img
              src="/avatar.png"
              alt="Avatar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '8px',
                marginTop: '2px',
              }}
            />
          )}
          <div
            style={{
              maxWidth: '60%',
              padding: '10px 15px',
              borderRadius: '15px',
              background: isUser ? '#007bff' : '#eaeaea',
              color: isUser ? '#fff' : '#333',
              textAlign: 'left',
            }}
          >
            {msg.content}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid #ddd',
      }}
    >
      {/* 헤더 영역 */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
        }}
      >
        <h2 style={{ margin: 0 }}>Psychological Counseling</h2>
      </div>

      {/* 채팅 영역 */}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
        }}
      >
        {renderMessages()}
      </div>

      {/* 입력창 영역 */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          borderTop: '1px solid #ddd',
          padding: '0.5rem',
        }}
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What's on your mind?"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '0.5rem',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>

      {/* Restart 버튼 영역 */}
      <button
        type="button"
        style={{
          margin: '1rem auto',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#007bff',
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={() => delete_session()}
      >
        Restart
      </button>
    </div>
  );
}

export default App;