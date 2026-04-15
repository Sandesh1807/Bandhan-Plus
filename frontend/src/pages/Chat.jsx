// Match User messaging interface with polling
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Send, ShieldAlert, Lock, Crown } from 'lucide-react';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [matchDetails, setMatchDetails] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Tracking limits
  const [freeMessagesSent, setFreeMessagesSent] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isMatch, setIsMatch] = useState(false);

  const messagesEndRef = useRef(null);

  const MAX_FREE_MESSAGES = 10;
  const messagesLeft = isPremium ? 'Unlimited' : MAX_FREE_MESSAGES - freeMessagesSent;
  const isLockedOut = !isPremium && freeMessagesSent >= MAX_FREE_MESSAGES;

  const fetchHistory = async () => {
    try {
      // Get chat history
      const { data } = await API.get(`/messages/history/${matchId}`);
      setMessages(data.messages);
      setFreeMessagesSent(data.freeMessagesSent);
      setIsPremium(data.isPremium);
      setIsMatch(data.matches);

      // Load remote user details if we don't have them
      if (!matchDetails) {
        const { data: profileData } = await API.get(`/profile/${matchId}`);
        setMatchDetails(profileData);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) navigate('/interests');
    } finally {
      if (loading) setLoading(false);
    }
  };

  // Poll for new messages every 5 seconds
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLockedOut) return;

    try {
      const { data } = await API.post(`/messages/send/${matchId}`, { text });
      setMessages(prev => [...prev, data]);
      setText('');
      if (!isPremium) setFreeMessagesSent(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading || !matchDetails) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-rose-600"></div>
    </div>
  );

  if (!isMatch) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <ShieldAlert size={64} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800">Cannot Initiate Chat</h2>
      <p className="text-gray-500 mb-6 text-center max-w-sm">You can only chat with profiles who have mutually accepted your interest request.</p>
      <button onClick={() => navigate('/interests')} className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700">Back to Interests</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-3xl sm:rounded-2xl shadow-xl flex flex-col h-screen sm:h-[80vh] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/interests')} className="text-gray-500 hover:text-gray-800 transition p-2 bg-gray-50 rounded-xl">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${matchId}`)}>
              <img 
                src={matchDetails.photos?.[0] ? 
                  (matchDetails.photos[0].startsWith('http') ? matchDetails.photos[0] : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/uploads/${matchDetails.photos[0]}`) 
                  : `https://ui-avatars.com/api/?name=${matchDetails.name}&background=C0392B&color=fff`} 
                alt={matchDetails.name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-rose-100"
              />
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{matchDetails.name}</h3>
                <p className="text-xs text-green-600 font-medium tracking-wide">● Matched</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-md mb-1">
              {isPremium ? <Crown size={12} className="text-yellow-600" /> : <Lock size={12} className="text-rose-400" />}
              <span className="text-xs font-bold text-rose-700 font-mono">Limits: {messagesLeft}</span>
            </div>
          </div>
        </div>

        {/* Chat History View */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] flex flex-col gap-3 pb-8">
          {messages.length === 0 ? (
            <div className="text-center my-auto flex flex-col items-center">
               <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3">👋</div>
               <p className="text-gray-500 font-medium">Say hello to {matchDetails.name.split(' ')[0]}!</p>
               <p className="text-gray-400 text-xs mt-1">Free messages left: {MAX_FREE_MESSAGES}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const sendingToMe = msg.receiver === matchDetails._id; // I sent this
              return (
                <div key={msg._id} className={`flex ${sendingToMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${sendingToMe ? 'bg-rose-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                    <p style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                    <span className={`text-[10px] flex mt-1 ${sendingToMe ? 'justify-end text-rose-200' : 'justify-start text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-3 sm:px-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
          
          {isLockedOut ? (
            <div className="bg-amber-50 text-amber-800 py-3 rounded-xl border border-amber-200 text-sm font-semibold flex items-center justify-center flex-col gap-1.5 shadow-inner">
               <span className="flex items-center gap-2"><Lock size={16} /> Free message limit reached!</span>
               <button className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-xs hover:bg-amber-600 flex items-center gap-1 transition shadow hover:shadow-md">
                 <Crown size={12} fill="white" /> Upgrade to Premium to Chat
               </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Type a message..." 
                className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={!text.trim()} 
                className="bg-rose-600 text-white w-12 h-auto shrink-0 rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-rose-700 hover:shadow-md"
              >
                <Send size={18} />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default Chat;
