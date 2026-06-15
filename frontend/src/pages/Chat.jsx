import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversation contacts
  const fetchPartners = async (selectId = null) => {
    try {
      const response = await client.get('chat/partners/');
      setPartners(response.data);
      
      // If we need to auto-select a contact
      if (selectId) {
        const found = response.data.find(p => p.id === parseInt(selectId));
        if (found) {
          setSelectedPartner(found);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat partners:', err);
    }
    setLoading(false);
  };

  // Fetch message history for selected partner
  const fetchHistory = async (partnerId) => {
    if (!partnerId) return;
    try {
      const response = await client.get(`chat/history/${partnerId}/`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (targetUserId) {
        const targetIdNum = parseInt(targetUserId);
        
        // 1. Fetch partners
        const response = await client.get('chat/partners/');
        setPartners(response.data);

        // 2. Check if user is already in partners
        const found = response.data.find(p => p.id === targetIdNum);
        if (found) {
          setSelectedPartner(found);
        } else {
          // If not in partners, fetch their profile details to initiate a new thread
          try {
            const userRes = await client.get(`users/${targetIdNum}/`);
            const newPartner = {
              id: userRes.data.id,
              username: userRes.data.username,
              first_name: userRes.data.first_name,
              last_name: userRes.data.last_name,
              role: userRes.data.role,
              company: userRes.data.company,
              latest_message: 'Initiating conversation...',
              latest_timestamp: null
            };
            setPartners(prev => [newPartner, ...prev]);
            setSelectedPartner(newPartner);
          } catch (err) {
            console.error('Failed to load target user details:', err);
          }
        }
      } else {
        // Just load partners
        await fetchPartners();
      }
      setLoading(false);
    };

    init();
  }, [targetUserId]);

  // Load message history when partner selection changes
  useEffect(() => {
    if (selectedPartner) {
      setLoadingChat(true);
      fetchHistory(selectedPartner.id).then(() => {
        setLoadingChat(false);
        setTimeout(scrollToBottom, 50);
      });
    }
  }, [selectedPartner]);

  // Polling hook for real-time updates (every 3 seconds)
  useEffect(() => {
    if (!selectedPartner) return;
    const interval = setInterval(() => {
      fetchHistory(selectedPartner.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedPartner]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner) return;

    const msgContent = newMessage.trim();
    setNewMessage(''); // clear input instantly for UX responsiveness

    try {
      const response = await client.post('chat/send/', {
        recipient_id: selectedPartner.id,
        content: msgContent
      });

      // Append new message locally
      setMessages(prev => [...prev, {
        id: response.data.id,
        sender_id: user.id,
        sender_username: user.username,
        receiver_id: selectedPartner.id,
        content: msgContent,
        timestamp: response.data.timestamp
      }]);

      // Update partners list to reflect latest message
      setPartners(prev => prev.map(p => 
        p.id === selectedPartner.id 
          ? { ...p, latest_message: msgContent, latest_timestamp: response.data.timestamp }
          : p
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const selectChatPartner = (partner) => {
    setSelectedPartner(partner);
    setSearchParams({ user: partner.id }); // update URL query param
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading conversations...</div>;
  }

  return (
    <div className="chat-page-container">
      <div className={`chat-layout ${selectedPartner ? 'thread-active' : ''}`}>
        
        {/* Contacts Sidebar */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h3>Direct Messages</h3>
          </div>
          <div className="partners-list">
            {partners.length === 0 ? (
              <div className="empty-partners">
                <p>No active conversations yet.</p>
              </div>
            ) : (
              partners.map(p => (
                <div
                  key={p.id}
                  className={`partner-card ${selectedPartner?.id === p.id ? 'active' : ''}`}
                  onClick={() => selectChatPartner(p)}
                >
                  <div className="partner-avatar">
                    {p.first_name ? p.first_name[0].toUpperCase() : p.username[0].toUpperCase()}
                  </div>
                  <div className="partner-details">
                    <div className="partner-meta">
                      <h4>{p.first_name} {p.last_name}</h4>
                      <span className="partner-badge">{p.role === 'recruiter' ? p.company || 'Employer' : 'Candidate'}</span>
                    </div>
                    <p className="latest-msg-text">{p.latest_message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Conversation Thread */}
        <section className="chat-thread-area">
          {selectedPartner ? (
            <div className="thread-wrapper">
              <header className="thread-header">
                <button 
                  onClick={() => selectChatPartner(null)} 
                  className="chat-back-btn"
                  title="Back to contacts"
                >
                  ←
                </button>
                <div className="header-info">
                  <h3>{selectedPartner.first_name} {selectedPartner.last_name}</h3>
                  <p>{selectedPartner.role === 'recruiter' ? `🏢 ${selectedPartner.company || 'Employer'}` : '🎓 Candidate profile'}</p>
                </div>
              </header>

              <div className="messages-stream">
                {loadingChat ? (
                  <div className="chat-loader">Loading dialog history...</div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat-state">
                    <p>No messages here yet. Say hello to start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.sender_id === user.id;
                    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} className={`message-bubble-row ${isOwn ? 'own' : 'incoming'}`}>
                        <div className="bubble-wrapper">
                          <div className="message-content">{msg.content}</div>
                          <span className="message-time">{timeStr}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                />
                <button type="submit" className="send-msg-btn">Send</button>
              </form>
            </div>
          ) : (
            <div className="no-chat-selected">
              <span className="chat-icon-placeholder">💬</span>
              <h3>Select a conversation to start messaging</h3>
              <p>Or visit job applications to message candidates/employers directly.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Chat;
