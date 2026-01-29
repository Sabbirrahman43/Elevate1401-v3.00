import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  CheckSquare, 
  History as HistoryIcon, 
  Settings as SettingsIcon,
  Moon, 
  Sun, 
  LogOut, 
  User as UserIcon, 
  Bot,
  Zap,
  Send,
  Volume2,
  VolumeX,
  Lock,
  Menu,
  X,
  Trash2,
  Clock,
  Dumbbell,
  BookOpen,
  UserCircle2,
  Play,
  Pause,
  RotateCcw,
  Palette
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { User, Task, DailyHistory, ChatMessage, AppView, Theme } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { INSTAGRAM_LINK, THEME_CONFIG } from './constants';

// --- THEME DEFINITIONS ---
const themes: Record<Theme, { bg: string, text: string, card: string, primary: string, button: string, accent: string, chartGrid: string, chartLine: string }> = {
  light: {
    bg: 'bg-[#f0f4f8]',
    text: 'text-slate-800',
    card: 'bg-white border-slate-200 shadow-md shadow-slate-200/50',
    primary: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    accent: 'bg-blue-100',
    chartGrid: '#e2e8f0',
    chartLine: '#0b76ff'
  },
  dark: {
    bg: 'bg-slate-900',
    text: 'text-white',
    card: 'bg-slate-800 border-slate-700 shadow-sm',
    primary: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500 text-white',
    accent: 'bg-slate-700',
    chartGrid: '#334155',
    chartLine: '#60a5fa'
  },
  cyber: {
    bg: 'bg-black',
    text: 'text-green-400',
    card: 'bg-gray-900 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    primary: 'text-green-500',
    button: 'bg-green-600 hover:bg-green-700 text-black font-mono font-bold tracking-widest',
    accent: 'bg-green-900/20',
    chartGrid: '#064e3b',
    chartLine: '#22c55e'
  },
  reading: {
    bg: 'bg-[#fdf6e3]', // Solarized Light Base
    text: 'text-[#586e75]', // Base01
    card: 'bg-[#eee8d5] border border-[#d33682]/10 shadow-sm', // Base2
    primary: 'text-[#d33682]', // Magenta
    button: 'bg-[#d33682] hover:bg-[#b58900] text-white',
    accent: 'bg-[#fdf6e3]',
    chartGrid: '#93a1a1',
    chartLine: '#d33682'
  },
  ramadan: {
    bg: 'bg-[#0f172a]', // Deep Slate
    text: 'text-[#fbbf24]', // Amber 400
    card: 'bg-[#1e293b] border border-[#f59e0b]/30 shadow-lg',
    primary: 'text-[#f59e0b]', // Amber 500
    button: 'bg-[#d97706] hover:bg-[#b45309] text-white',
    accent: 'bg-[#451a03]',
    chartGrid: '#451a03',
    chartLine: '#fbbf24'
  }
};

// --- COMPONENTS ---

const AppLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-1 relative ${className}`}>
    <Dumbbell className="w-6 h-6 animate-[pulse_3s_ease-in-out_infinite]" />
    <div className="relative z-10">
      <UserCircle2 className="w-10 h-10 opacity-90" />
    </div>
    <BookOpen className="w-6 h-6 animate-[pulse_3s_ease-in-out_infinite] delay-75" />
  </div>
);

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
    <div className="mb-6 scale-150 animate-bounce text-blue-500">
      <AppLogo />
    </div>
    <h2 className="text-white text-xl font-light animate-pulse">Building your mind & body...</h2>
  </div>
);

const Auth: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      username: username || 'Pranto',
      isLoggedIn: true,
      preferences: { 
        theme: 'light', 
        voiceEnabled: true, 
        voiceGender: 'female',
        aiPersona: 'Friendly, female, motivational friend.',
        focusDuration: 25
      }
    };
    storageService.saveUser(user);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="text-blue-600 mb-4 scale-125"><AppLogo /></div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Elevate1401</h1>
          <p className="text-gray-500">Powered by Pranto AI</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
          >
            {isLogin ? 'Login to Growth' : 'Start Your Journey'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-500 hover:underline">
            {isLogin ? "New here? Create account" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<DailyHistory[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Focus Timer State
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const focusIntervalRef = useRef<number | null>(null);
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setTimeout(() => {
        const savedUser = storageService.getUser();
        if (savedUser?.isLoggedIn) {
          // Migration: handle old boolean darkMode if present, and add new fields
          const updatedUser: User = {
             ...savedUser,
             preferences: { 
               ...savedUser.preferences, 
               theme: (savedUser.preferences as any).darkMode ? 'dark' : (savedUser.preferences.theme || 'light'),
               voiceGender: savedUser.preferences.voiceGender || 'female',
               aiPersona: savedUser.preferences.aiPersona || 'Friendly, female, motivational friend.',
               focusDuration: savedUser.preferences.focusDuration || 25
             }
          };
          setUser(updatedUser);
          setTasks(storageService.getTasks());
          setHistory(storageService.getHistory());
          setChatMessages(storageService.getChat());
          setFocusTimeLeft(updatedUser.preferences.focusDuration * 60);
        }
        setLoading(false);
      }, 1000);
    };
    init();
  }, []);

  // Save Effects
  useEffect(() => { if (!loading && user) { storageService.saveUser(user); storageService.saveTasks(tasks); } }, [tasks, loading, user]);
  useEffect(() => { if (!loading && user && history.length) storageService.saveHistory(history); }, [history, loading, user]);
  useEffect(() => { if (!loading && user && chatMessages.length) storageService.saveChat(chatMessages); }, [chatMessages, loading, user]);

  // Focus Timer Logic
  useEffect(() => {
    if (isFocusRunning && focusTimeLeft > 0) {
      focusIntervalRef.current = window.setInterval(() => {
        setFocusTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0) {
      setIsFocusRunning(false);
      if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
      if (user?.preferences.voiceEnabled) geminiService.speak("Focus session complete! Great job.", user.preferences.voiceGender);
      alert("Focus Session Complete!");
    }
    return () => { if (focusIntervalRef.current) clearInterval(focusIntervalRef.current); };
  }, [isFocusRunning, focusTimeLeft]);

  // Update focus timer if user preference changes
  useEffect(() => {
    if (user && !isFocusRunning) {
        setFocusTimeLeft(user.preferences.focusDuration * 60);
    }
  }, [user?.preferences.focusDuration]);

  const handleLogin = (u: User) => {
    setUser(u);
    setTasks([]);
    setHistory([]);
    setChatMessages([{
      id: 'welcome',
      role: 'model',
      text: `Welcome back, ${u.username}! I am Pranto AI. I'm ready to help you elevate your day.`,
      timestamp: Date.now()
    }]);
    setFocusTimeLeft(u.preferences.focusDuration * 60);
  };

  const handleLogout = () => {
    storageService.clearSession();
    setUser(null);
  };

  const addTask = (title: string, amount: number, unit: string = 'times', deadline?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      targetAmount: amount,
      currentAmount: 0,
      unit,
      startTime: Date.now(),
      deadline,
      isCompleted: false,
      createdAt: Date.now()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskProgress = (id: string, delta: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newAmount = Math.min(Math.max(0, t.currentAmount + delta), t.targetAmount);
      const isCompleted = newAmount >= t.targetAmount;
      return { ...t, currentAmount: newAmount, isCompleted, completedTime: isCompleted ? Date.now() : undefined };
    }));
  };

  const endDay = () => {
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const rate = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    setHistory(prev => [...prev, { date: new Date().toISOString().split('T')[0], tasks: [...tasks], completionRate: rate }]);
    setTasks([]);
    alert("Day ended! Progress archived.");
  };

  const toggleVoiceGender = () => {
    if (!user) return;
    const newGender = user.preferences.voiceGender === 'male' ? 'female' : 'male';
    setUser({ ...user, preferences: { ...user.preferences, voiceGender: newGender } });
    geminiService.speak(`Switched to ${newGender} voice.`, newGender);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !user) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      const apiHistory = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const responseText = await geminiService.sendMessage(
        apiHistory, 
        userMsg.text, 
        tasks, 
        user.preferences.aiPersona,
        (toolName, args) => {
          if (toolName === 'createTask') addTask(args.title, args.targetAmount, args.unit || 'units', args.deadline);
        }
      );

      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() }]);
      if (user.preferences.voiceEnabled) geminiService.speak(responseText, user.preferences.voiceGender);

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection error.", timestamp: Date.now() }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Styles based on current theme
  const getTheme = () => themes[user?.preferences.theme || 'light'];
  const theme = getTheme();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg} ${theme.text} ${user.preferences.theme === 'cyber' ? 'font-mono' : user.preferences.theme === 'reading' ? 'font-serif' : 'font-sans'}`}>
      
      {/* Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-5">
         <div className={`absolute top-10 left-10 text-4xl ${theme.primary}`}><Dumbbell /></div>
         <div className={`absolute top-40 right-20 text-4xl ${theme.primary}`} style={{animation: 'float 6s infinite'}}><BookOpen /></div>
         <div className={`absolute bottom-20 left-1/4 text-4xl ${theme.primary}`} style={{animation: 'float 7s infinite'}}><Dumbbell /></div>
         <div className={`absolute bottom-10 right-10 text-4xl ${theme.primary}`} style={{animation: 'float 5s infinite'}}><BookOpen /></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors duration-300 border-white/10 ${user.preferences.theme === 'light' ? 'bg-white/80' : 'bg-black/20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={theme.primary}><AppLogo className="scale-90" /></div>
              <span className={`text-xl font-bold tracking-tight hidden sm:block ${theme.primary}`}>Elevate1401</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {[
                  { name: 'Dashboard', id: AppView.DASHBOARD, icon: LayoutDashboard },
                  { name: 'Tasks', id: AppView.TASKS, icon: CheckSquare },
                  { name: 'History', id: AppView.HISTORY, icon: HistoryIcon },
                  { name: 'Focus', id: AppView.FOCUS, icon: Zap },
                  { name: 'Settings', id: AppView.SETTINGS, icon: SettingsIcon },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      view === item.id 
                      ? `${theme.button} shadow-lg` 
                      : `hover:opacity-70 opacity-60`
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
               {/* Mobile Menu Toggle */}
               <div className="md:hidden">
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2">
                   {showMobileMenu ? <X /> : <Menu />}
                </button>
               </div>
               
               <div className="hidden md:flex items-center space-x-2">
                 <button 
                    onClick={toggleVoiceGender}
                    title={`Voice: ${user.preferences.voiceGender}`}
                    className={`p-2 rounded-full transition-colors flex items-center gap-1 border border-white/10 hover:bg-white/10`}
                 >
                    {user.preferences.voiceGender === 'female' ? <span className="text-pink-500 font-bold text-xs flex">F<Volume2 className="w-4 h-4 ml-1"/></span> : <span className="text-blue-500 font-bold text-xs flex">M<Volume2 className="w-4 h-4 ml-1"/></span>}
                 </button>
                 <button onClick={handleLogout} className="p-2 rounded-full transition-colors text-red-500 hover:bg-red-500/10"><LogOut className="w-5 h-5"/></button>
               </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`md:hidden border-b border-white/10 ${theme.card}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
               {[
                  { name: 'Dashboard', id: AppView.DASHBOARD },
                  { name: 'Tasks', id: AppView.TASKS },
                  { name: 'History', id: AppView.HISTORY },
                  { name: 'Focus', id: AppView.FOCUS },
                  { name: 'Settings', id: AppView.SETTINGS },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setView(item.id); setShowMobileMenu(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                  >
                    {item.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-10 px-4 max-w-7xl mx-auto z-10 relative">
        
        {view === AppView.DASHBOARD && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.username}!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats */}
              <div className={`p-6 rounded-2xl ${theme.card}`}>
                <h3 className="text-lg font-semibold mb-4 opacity-70">Today's Progress</h3>
                <div className={`text-4xl font-bold mb-2 ${theme.primary}`}>
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%
                </div>
                <div className="w-full bg-gray-200/20 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${tasks.length > 0 && (tasks.filter(t => t.isCompleted).length / tasks.length) > 0.6 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.isCompleted).length / tasks.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Pending */}
              <div className={`p-6 rounded-2xl ${theme.card}`}>
                <h3 className="text-lg font-semibold mb-4 opacity-70">Pending Tasks</h3>
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {tasks.filter(t => !t.isCompleted).length}
                </div>
                <button onClick={() => setView(AppView.TASKS)} className={`text-sm hover:underline font-medium ${theme.primary}`}>View all tasks →</button>
              </div>

               {/* Streak */}
               <div className={`p-6 rounded-2xl ${theme.card}`}>
                <h3 className="text-lg font-semibold mb-4 opacity-70">Consistency</h3>
                <div className="flex justify-between items-end h-16">
                   {[40, 70, 30, 80, 50, 90, 60].map((h, i) => (
                     <div key={i} className={`w-3 rounded-t opacity-50 ${theme.bg === 'bg-[#f0f4f8]' ? 'bg-blue-400' : 'bg-blue-600'}`} style={{height: `${h}%`}}></div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === AppView.TASKS && (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold">Your Tasks</h2>
               <button onClick={endDay} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg transition-transform active:scale-95">
                 End Day & Archive
               </button>
             </div>

             {/* Add Task */}
             <form onSubmit={(e) => {
               e.preventDefault();
               const form = e.target as HTMLFormElement;
               const title = (form.elements.namedItem('title') as HTMLInputElement).value;
               const amount = parseInt((form.elements.namedItem('amount') as HTMLInputElement).value);
               const deadline = (form.elements.namedItem('deadline') as HTMLInputElement).value;
               addTask(title, amount, 'times', deadline);
               form.reset();
             }} className={`p-4 rounded-xl flex gap-4 flex-wrap items-end ${theme.card}`}>
               <div className="flex-1 min-w-[200px]">
                 <label className="text-xs opacity-70 block mb-1 font-medium">Task Name</label>
                 <input name="title" type="text" placeholder="e.g. Drink Water" className="w-full p-2 border border-white/10 bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
               </div>
               <div className="w-24">
                  <label className="text-xs opacity-70 block mb-1 font-medium">Target</label>
                  <input name="amount" type="number" placeholder="5" className="w-full p-2 border border-white/10 bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="1" />
               </div>
               <div className="w-32">
                  <label className="text-xs opacity-70 block mb-1 font-medium">Until</label>
                  <input name="deadline" type="time" className="w-full p-2 border border-white/10 bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
               </div>
               <button type="submit" className={`${theme.button} px-6 py-2 rounded-lg h-[42px] font-medium shadow-md`}>Add</button>
             </form>

             <div className="grid gap-4">
               {tasks.length === 0 && <p className="text-center opacity-60 py-10 italic">No tasks today.</p>}
               {tasks.map(task => (
                 <div key={task.id} className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:translate-x-1 ${theme.card} ${task.isCompleted ? 'border-l-green-500 opacity-60' : 'border-l-blue-500'}`}>
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold text-lg ${task.isCompleted ? 'line-through opacity-70' : ''}`}>{task.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded opacity-70 bg-gray-500/10 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        {task.deadline && <p className="text-xs text-red-500 mt-1 font-medium">Deadline: {task.deadline}</p>}
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-mono opacity-70 font-bold">{task.currentAmount} / {task.targetAmount} {task.unit}</span>
                        <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"><Trash2 className="w-5 h-5" /></button>
                     </div>
                   </div>
                   
                   <div className="w-full bg-gray-200/20 rounded-full h-3 mb-3 overflow-hidden">
                      <div className={`h-3 transition-all duration-500 ${task.currentAmount/task.targetAmount > 0.6 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${(task.currentAmount / task.targetAmount) * 100}%`}}></div>
                   </div>

                   <div className="flex justify-end space-x-2">
                     <button onClick={() => updateTaskProgress(task.id, -1)} className="px-3 py-1 rounded hover:opacity-80 transition-opacity bg-gray-500/20">-</button>
                     <button onClick={() => updateTaskProgress(task.id, 1)} className={`px-3 py-1 rounded hover:opacity-80 font-bold shadow-sm ${theme.accent} ${theme.primary}`}>+</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {view === AppView.HISTORY && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Growth History</h2>
            <div className={`h-64 p-4 rounded-xl ${theme.card}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{backgroundColor: user.preferences.theme === 'light' ? '#fff' : '#1e293b', border: 'none'}} />
                  <Line type="monotone" dataKey="completionRate" stroke={theme.chartLine} strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {history.slice().reverse().map((day, i) => (
                <div key={i} className={`p-4 rounded-xl ${theme.card}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{day.date}</span>
                    <span className={`px-2 py-1 rounded text-sm ${day.completionRate >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {Math.round(day.completionRate)}% Complete
                    </span>
                  </div>
                  <div className="mt-2 text-sm opacity-60">{day.tasks.length} tasks recorded.</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === AppView.FOCUS && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="text-6xl animate-pulse">🧘‍♀️</div>
            <h2 className="text-3xl font-bold">Focus Mode</h2>
            <p className="max-w-md opacity-60">
              {isFocusRunning ? "Stay in the zone." : "Eliminate distractions. Only the now matters."}
            </p>
            
            <div className={`relative p-8 rounded-full w-72 h-72 flex items-center justify-center border-4 shadow-[0_0_30px_rgba(11,118,255,0.2)] ${theme.card} ${isFocusRunning ? 'border-green-500' : 'border-blue-500'}`}>
               <span className="text-5xl font-mono font-bold">{formatTime(focusTimeLeft)}</span>
               {isFocusRunning && <div className="absolute inset-0 rounded-full border-t-4 border-green-400 animate-spin opacity-50"></div>}
            </div>

            <div className="flex gap-4">
                {!isFocusRunning ? (
                  <button onClick={() => setIsFocusRunning(true)} className={`${theme.button} px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2`}>
                    <Play className="w-5 h-5"/> Start Session
                  </button>
                ) : (
                  <button onClick={() => setIsFocusRunning(false)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                    <Pause className="w-5 h-5"/> Pause
                  </button>
                )}
                <button onClick={() => { setIsFocusRunning(false); setFocusTimeLeft(user.preferences.focusDuration * 60); }} className="bg-gray-500/20 hover:bg-gray-500/30 px-4 py-3 rounded-full font-bold shadow-lg">
                    <RotateCcw className="w-5 h-5"/>
                </button>
            </div>
            {!isFocusRunning && <p className="text-sm opacity-50">Configured for {user.preferences.focusDuration} minutes</p>}
          </div>
        )}

        {view === AppView.SETTINGS && (
           <div className="space-y-8 max-w-2xl mx-auto">
             <h2 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon /> Personalize Elevate</h2>
             
             {/* Themes */}
             <div className={`p-6 rounded-2xl ${theme.card}`}>
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette className="w-4 h-4"/> Visual Theme</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {(Object.keys(themes) as Theme[]).map(t => (
                   <button 
                    key={t}
                    onClick={() => setUser({...user!, preferences: {...user!.preferences, theme: t}})}
                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${user!.preferences.theme === t ? `ring-2 ring-offset-2 ring-blue-500 ${theme.primary}` : 'opacity-60 hover:opacity-100'} ${t === 'light' ? 'bg-white text-black' : t === 'dark' ? 'bg-slate-900 text-white' : t === 'cyber' ? 'bg-black text-green-500' : t === 'reading' ? 'bg-[#fdf6e3] text-[#586e75]' : 'bg-[#0f172a] text-amber-400'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </div>

             {/* AI Persona */}
             <div className={`p-6 rounded-2xl ${theme.card}`}>
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bot className="w-4 h-4"/> AI Persona</h3>
               <p className="text-sm opacity-60 mb-3">Tell Pranto AI how to behave. It will adopt this personality.</p>
               <textarea 
                 value={user!.preferences.aiPersona}
                 onChange={(e) => setUser({...user!, preferences: {...user!.preferences, aiPersona: e.target.value}})}
                 className="w-full p-3 rounded-lg bg-black/5 border border-black/10 dark:bg-white/5 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                 placeholder="e.g. You are a strict military sergeant..."
               />
               <p className="text-xs mt-2 opacity-50">Changes apply to the next message.</p>
             </div>

             {/* Focus Config */}
             <div className={`p-6 rounded-2xl ${theme.card}`}>
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Focus Timer</h3>
               <div className="flex items-center gap-4">
                 <input 
                   type="range" 
                   min="5" 
                   max="120" 
                   step="5"
                   value={user!.preferences.focusDuration}
                   onChange={(e) => setUser({...user!, preferences: {...user!.preferences, focusDuration: parseInt(e.target.value)}})}
                   className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                 />
                 <span className="font-mono font-bold w-20 text-right">{user!.preferences.focusDuration} min</span>
               </div>
             </div>
           </div>
        )}

      </main>

      {/* Chat UI */}
      <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ${isChatOpen ? 'w-full md:w-96 h-[600px] max-h-screen' : 'w-auto h-auto'}`}>
         {!isChatOpen && (
           <button 
             onClick={() => setIsChatOpen(true)}
             className={`m-6 p-4 rounded-full shadow-2xl transition hover:scale-110 flex items-center gap-2 ${theme.button}`}
           >
             <Bot className="w-6 h-6" />
             <span className="font-semibold hidden md:block">Chat with AI</span>
           </button>
         )}

         {isChatOpen && (
           <div className={`shadow-2xl h-full flex flex-col rounded-t-2xl md:rounded-tl-2xl md:m-4 border border-white/10 ${theme.card}`}>
             <div className={`p-4 flex justify-between items-center rounded-t-2xl md:rounded-tl-2xl ${user!.preferences.theme === 'light' ? 'bg-blue-600 text-white' : 'bg-white/5'}`}>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
                 <div>
                   <h3 className="font-bold">Pranto AI</h3>
                   <span className="text-xs opacity-80 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</span>
                 </div>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded"><X /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {chatMessages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                     msg.role === 'user' 
                     ? `${theme.button} rounded-br-none` 
                     : `bg-gray-100 dark:bg-gray-700 rounded-bl-none ${theme.text}`
                   }`}>
                     {msg.text}
                     {msg.role === 'model' && (
                       <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 text-[10px] opacity-60">Created by Pranto</div>
                     )}
                   </div>
                 </div>
               ))}
               {isAiThinking && (
                 <div className="flex justify-start">
                   <div className="p-3 rounded-2xl rounded-bl-none shadow-sm bg-gray-100 dark:bg-gray-700">
                     <div className="flex space-x-1">
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                     </div>
                   </div>
                 </div>
               )}
             </div>

             <div className="p-4 border-t border-white/10">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                   placeholder="Ask me anything..."
                   className="flex-1 p-2 border border-white/10 bg-transparent rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <button onClick={sendMessage} disabled={isAiThinking} className={`${theme.button} p-2 rounded-lg disabled:opacity-50`}>
                   <Send className="w-5 h-5" />
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>

      <footer className="py-6 text-center text-sm opacity-60">
        <p>© 2024 Elevate1401. Designed for <span className={`${theme.primary} font-semibold`}>Pranto</span>.</p>
        <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className="hover:underline transition-colors">Connect on Instagram</a>
      </footer>

    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}