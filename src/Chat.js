// src/Chat.js
import React, { useState, useEffect } from 'react';
import { sendMessage, fetchMessagesByDate } from './firebase';
import firebase from 'firebase/compat/app';
import { format } from 'date-fns';
import './Chat.css';  // スタイルシートのインポート
import ReactMarkdown from 'react-markdown';  // ReactMarkdownを追加
import remarkGfm from 'remark-gfm';  // remark-gfmを追加

const Chat = () => {
  const [name, setName] = useState('You');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const chatRef = firebase.database().ref(`Chat/${date}`);
    
    const handleNewMessage = snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newMessages = Object.values(data).filter(msg => msg.name !== 'System');
        setMessages(newMessages);
      }
    };

    chatRef.on('value', handleNewMessage);

    return () => {
      chatRef.off('value', handleNewMessage);
    };
  }, [date]);

  const addLineBreaks = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, (match, p1) => `\n**${p1}**`);
  };

  const handleSendMessage = async () => {
    if (name && message) {
      sendMessage(name, message);

      try {
        // Cloud Functionを呼び出してGeminiの応答を取得する
        const response = await fetch('https://us-central1-healtdashboard-c863b.cloudfunctions.net/chat-with-gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error:', error);
      }

      setMessage('');
    }
  };

  return (
    <div style={{ width: '100%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
      <div>
        <h3>Select Date</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3>Messages ({date})</h3>
        <div>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.name === 'You' ? 'message-right' : 'message-left'}`}
            >
              <div className="message-info">
                <strong>{msg.name}</strong> <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>
              </div>
              <div className="message-bubble">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{addLineBreaks(msg.message)}</ReactMarkdown> {/* メッセージをMarkdownとしてレンダリング */}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2>Chat</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        ></textarea>
        <button onClick={handleSendMessage} style={{ width: '100%' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
