
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Dumbbell, 
  Home, 
  MessageSquare, 
  User, 
  Plus, 
  ChevronRight, 
  Flame, 
  Clock, 
  TrendingUp,
  Search,
  Play,
  CheckCircle2,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Tab = 'home' | 'workouts' | 'coach' | 'profile';

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: string;
  exercises: number;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (t: Tab) => void }) => {
  const tabs: { id: Tab, icon: React.ReactNode, label: string }[] = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'workouts', icon: <Dumbbell size={20} />, label: 'Workouts' },
    { id: 'coach', icon: <MessageSquare size={20} />, label: 'AI Coach' },
    { id: 'profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 w-16 ${
              activeTab === tab.id ? 'text-indigo-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <header className="px-6 pt-8 pb-4">
    <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
    {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
  </header>
);

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-4">
    <div className={`${color} p-3 rounded-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  </div>
);

const WorkoutItem = ({ workout }: { workout: WorkoutSession }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl mb-3 flex justify-between items-center group active:scale-95 transition-transform">
    <div>
      <h3 className="text-white font-semibold">{workout.name}</h3>
      <div className="flex items-center space-x-3 mt-1 text-xs text-zinc-500">
        <span className="flex items-center"><Clock size={12} className="mr-1"/> {workout.duration}</span>
        <span className="flex items-center"><Dumbbell size={12} className="mr-1"/> {workout.exercises} Exercises</span>
      </div>
    </div>
    <ChevronRight className="text-zinc-700 group-hover:text-indigo-500 transition-colors" size={20} />
  </div>
);

// --- Main Application ---

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your Titan Strength Coach. Need a custom plan or form advice?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are Titan Strength Coach, a professional, motivating, and expert fitness trainer. Provide concise, actionable workout and nutrition advice. If asked for a workout, format it clearly with sets and reps.",
          temperature: 0.7
        }
      });
      
      const aiResponse = response.text || "I'm having trouble connecting to my fitness database. Let's try again!";
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I hit a snag. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div className="animate-in fade-in duration-500">
      <Header title="Welcome, Alex" subtitle="Let's crush today's goals!" />
      
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <StatCard 
          icon={<Flame size={20} className="text-orange-500" />} 
          label="Calories" 
          value="1,240" 
          color="bg-orange-500/10"
        />
        <StatCard 
          icon={<TrendingUp size={20} className="text-indigo-500" />} 
          label="Strength" 
          value="+12%" 
          color="bg-indigo-500/10"
        />
      </div>

      <section className="px-6 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-white">Daily Program</h2>
          <button className="text-indigo-500 text-sm font-medium">View All</button>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-indigo-500/20">
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">Intermediate</span>
            <h3 className="text-2xl font-bold text-white mt-3">Push Day Upper</h3>
            <p className="text-indigo-100/80 text-sm mt-1 mb-6 flex items-center">
              <Clock size={14} className="mr-1" /> 45 mins • 6 Exercises
            </p>
            <button className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg active:scale-95 transition-transform">
              <Play size={18} fill="currentColor" className="mr-2" /> Start Workout
            </button>
          </div>
          <Dumbbell className="absolute -right-8 -bottom-8 text-white/10 rotate-12" size={200} />
        </div>
      </section>

      <section className="px-6 mb-24">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <WorkoutItem workout={{ id: '1', name: 'Lower Body Power', date: 'Yesterday', duration: '52m', exercises: 7 }} />
        <WorkoutItem workout={{ id: '2', name: 'Back & Biceps', date: 'Oct 24', duration: '38m', exercises: 5 }} />
      </section>
    </div>
  );

  const renderWorkouts = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Header title="Workouts" subtitle="Browse routines or create your own" />
      <div className="px-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center text-zinc-400">
          <Search size={18} className="mr-3 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search exercises..." 
            className="bg-transparent border-none outline-none w-full text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex space-x-3 px-6 overflow-x-auto pb-4 no-scrollbar">
        {['All', 'Strength', 'HIIT', 'Yoga', 'Cardio'].map(cat => (
          <button key={cat} className="px-5 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-400 whitespace-nowrap active:bg-indigo-600 active:text-white transition-colors">
            {cat}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-4 mb-24">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
              <Dumbbell size={24} />
            </div>
            <div>
              <h4 className="text-white font-semibold">Chest Press</h4>
              <p className="text-zinc-500 text-xs">Pectorals • Dumbbells</p>
            </div>
          </div>
          <button className="text-indigo-500 p-2"><Plus size={20}/></button>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
              <Dumbbell size={24} />
            </div>
            <div>
              <h4 className="text-white font-semibold">Lat Pulldowns</h4>
              <p className="text-zinc-500 text-xs">Back • Machine</p>
            </div>
          </div>
          <button className="text-indigo-500 p-2"><Plus size={20}/></button>
        </div>

        <button className="w-full bg-zinc-900 border-2 border-dashed border-zinc-800 p-6 rounded-2xl text-zinc-500 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:text-indigo-500 transition-all">
          <Plus size={32} className="mb-2" />
          <span className="font-semibold text-sm">Create New Routine</span>
        </button>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-in slide-in-from-right-4 duration-300">
      <Header title="AI Coach" subtitle="Powered by Gemini" />
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
            }`}>
              {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none flex space-x-1">
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-900">
        <div className="flex space-x-2 bg-zinc-900 rounded-2xl p-2 border border-zinc-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none outline-none px-3 text-white placeholder:text-zinc-600 text-sm"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-xl transition-all ${
              input.trim() && !isLoading ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-in fade-in duration-500">
      <Header title="My Profile" />
      <div className="px-6 flex flex-col items-center mt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-1">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
               <User size={48} className="text-zinc-700" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-2 border-zinc-950">
            <Plus size={14} className="text-white" />
          </button>
        </div>
        <h2 className="text-white text-xl font-bold mt-4">Alex Titanium</h2>
        <p className="text-zinc-500 text-sm">Level 14 • Powerlifter</p>
      </div>

      <div className="grid grid-cols-3 gap-3 px-6 mt-8">
        {[
          { label: 'Workouts', val: '48' },
          { label: 'Followers', val: '1.2k' },
          { label: 'Points', val: '2.5k' },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl text-center">
            <p className="text-white font-bold">{item.val}</p>
            <p className="text-zinc-600 text-[10px] uppercase font-bold mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 mt-8 space-y-3 mb-24">
        {['Personal Information', 'Fitness Goals', 'Notification Settings', 'Help & Support', 'Log Out'].map((item, idx) => (
          <button key={idx} className="w-full bg-zinc-900/60 p-4 rounded-2xl flex items-center justify-between text-zinc-300 hover:text-white transition-colors group">
            <span className="font-medium">{item}</span>
            <ChevronRight size={18} className="text-zinc-700 group-hover:text-zinc-400" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {/* Container for mobile feel on desktop */}
      <div className="max-w-md mx-auto relative bg-zinc-950 min-h-screen shadow-2xl shadow-black/50 overflow-hidden">
        
        <main className="pb-20 pt-2">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'workouts' && renderWorkouts()}
          {activeTab === 'coach' && renderCoach()}
          {activeTab === 'profile' && renderProfile()}
        </main>

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
