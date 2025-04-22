import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  const handleSend = async (e) => {
    e.preventDefault();

    // 사용자의 메시지를 먼저 messages 배열에 추가
    const newUserMessage = { role: 'user', content: userInput };
    setMessages((prev) => [...prev, newUserMessage]);

    // 입력창 초기화
    setUserInput('');

    // 응답 도착 전 타이핑 인디케이터 (예: 빈 메시지 혹은 "..." 표시)
    const botMessageIndex = messages.length + 1; // 새 메시지 인덱스
    setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

    try {
      const response = await fetch(`${backendURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      const fullText = data.answer;

      // API 응답을 한 번에 세팅하는 대신, 글자 단위로 쪼개서 업데이트
      let currentText = "";
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          currentText += fullText[i];
          // 마지막 메시지를 업데이트
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: currentText,
            };
            return newMessages;
          });
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50); // 50ms 간격으로 글자 추가 (원하는 속도로 조정 가능)
    } catch (error) {
      console.error('Error:', error);
      // 오류 발생 시 챗봇 메시지를 업데이트
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'Server error occurred.',
        };
        return newMessages;
      });
    }
  };

  // 메시지 렌더링 함수
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
          {/* 챗봇 메시지인 경우 왼쪽에 avatar 이미지 표시 */}
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
    </div>
  );
}

export default App;