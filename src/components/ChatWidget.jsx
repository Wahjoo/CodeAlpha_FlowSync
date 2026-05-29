import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatWidget = ({ activeChatUser, onClose }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeChatUser) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await api.getMessages(activeChatUser._id);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeChatUser]);

  useEffect(() => {
    if (!socket || !activeChatUser) return;

    const handleReceive = (message) => {
      // Only append if the message belongs to this conversation
      if (
        (message.sender._id === activeChatUser._id && message.receiver._id === user._id) ||
        (message.sender._id === user._id && message.receiver._id === activeChatUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('chat:receive', handleReceive);

    return () => {
      socket.off('chat:receive', handleReceive);
    };
  }, [socket, activeChatUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const sentMsg = await api.sendMessage(activeChatUser._id, newMessage);
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!activeChatUser) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-80 md:w-96 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden z-[200]">
      {/* Header */}
      <div className="bg-secondary p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={`https://openui.fly.dev/openui/40x40.svg?text=${activeChatUser.name.charAt(0)}`}
              alt={activeChatUser.name}
              className="w-10 h-10 rounded-full border-2 border-white/20"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-secondary ${activeChatUser.status === 'online' ? 'bg-green-400' : 'bg-slate-300'}`}></div>
          </div>
          <div>
            <h3 className="font-label-lg text-label-lg font-bold">{activeChatUser.name}</h3>
            <p className="text-[10px] opacity-80">{activeChatUser.role || 'Member'}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 h-80 overflow-y-auto p-4 bg-surface-container-lowest flex flex-col gap-3 custom-scrollbar">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant">
            <i className="fa-solid fa-spinner fa-spin text-xl"></i>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-center px-4">
            <p className="font-body-sm text-body-sm">Say hello to {activeChatUser.name.split(' ')[0]}!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender._id === user._id;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-secondary text-white rounded-br-sm' : 'bg-surface-container text-on-surface rounded-bl-sm'}`}>
                  <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-surface border-t border-outline-variant/20">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-body-sm transition-all"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-container transition-colors"
          >
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
