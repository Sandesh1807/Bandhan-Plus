import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am BandhanBot 🤖. How can I assist you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Hidden on chat interface
  if (location.pathname.startsWith('/chat/')) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const responses = {
    'register': 'You can register by clicking "Sign Up" on the homepage. You will need an email and a password!',
    'login': 'Click the Login button at the top right. If you forgot your password, contact support.',
    'matches': 'To see matches, complete your profile preferences! Then visit the Dashboard or Browse pages.',
    'chat': 'Once a mutually interested profile accepts your request, they will appear in your Matches tab where you can chat!',
    'premium': 'Premium gives you unlimited messages! Standard users get 10 free messages.',
    'video': 'You can add a 30-second virtual intro video in the "My Profile" tab.',
    'default': "I'm still learning! For complex questions, please email support@bandhanplus.com."
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    // Simulate basic bot typing delay
    setTimeout(() => {
      let botResp = responses.default;
      const lowerInput = userMsg.toLowerCase();
      
      if (lowerInput.includes('register') || lowerInput.includes('sign up')) botResp = responses.register;
      else if (lowerInput.includes('log') || lowerInput.includes('sign in')) botResp = responses.login;
      else if (lowerInput.includes('match')) botResp = responses.matches;
      else if (lowerInput.includes('chat') || lowerInput.includes('message')) botResp = responses.chat;
      else if (lowerInput.includes('premium') || lowerInput.includes('pay') || lowerInput.includes('free')) botResp = responses.premium;
      else if (lowerInput.includes('video') || lowerInput.includes('upload')) botResp = responses.video;

      setMessages(prev => [...prev, { sender: 'bot', text: botResp }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-rose-600 text-white p-4 rounded-full shadow-2xl hover:bg-rose-700 hover:scale-110 transition-all z-50 flex items-center justify-center animate-bounce-slow"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-100" style={{ height: '500px', maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <h3 className="font-bold tracking-wide">Bandhan Support</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-rose-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-200 text-sm"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-rose-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default Chatbot;
