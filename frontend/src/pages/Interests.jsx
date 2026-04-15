// View sent/received interests and mutual matches with tabs
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Heart, Send, Users } from 'lucide-react';

const Interests = () => {
  const [tab, setTab] = useState('received'); // received | sent | matches
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const endpoints = {
    received: '/interests/received',
    sent: '/interests/sent',
    matches: '/interests/matches'
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: res } = await API.get(endpoints[tab]);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  const getAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birth = new Date(dob);
    return today.getFullYear() - birth.getFullYear();
  };

  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  const tabs = [
    { key: 'received', label: 'Received', icon: Heart },
    { key: 'sent', label: 'Sent', icon: Send },
    { key: 'matches', label: '🎉 Matches', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Interests</h1>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl shadow-sm p-1.5 mb-6 gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${tab === key ? 'bg-rose-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Heart size={48} className="mx-auto mb-3 opacity-30" />
            <p>No {tab} interests yet. <span className="text-rose-600 cursor-pointer" onClick={() => navigate('/browse')}>Browse profiles →</span></p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map(p => (
              <div key={p._id}
                onClick={() => navigate(`/profile/${p._id}`)}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                <img
                  src={p.photos?.[0] ? `${apiBase}/uploads/${p.photos[0]}` : `https://ui-avatars.com/api/?name=${p.name}&background=C0392B&color=fff`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-100"
                  alt={p.name} />
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{p.name}, {getAge(p.dateOfBirth)}</div>
                  <div className="text-gray-500 text-sm">{p.profession} • {p.city}</div>
                  {p.isVerified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                  )}
                </div>
                {tab === 'matches' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat/${p._id}`); }}
                    className="text-white font-semibold text-sm bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 rounded-xl hover:shadow-md hover:from-rose-600 hover:to-rose-700 transition"
                  >
                    Chat Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interests;