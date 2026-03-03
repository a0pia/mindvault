
import { useState, useEffect } from 'react';
import {
  Home, Timer, FileText, User, Plus,
  Play, Pause, RotateCcw, Target, Flame,
  Clock, ChevronRight, BookOpen, BarChart2,
  CheckCircle2, Trash2, GraduationCap, X,
  Brain, PlusCircle, History, Search, LogOut,
  Settings2, Layers, Tag, Check, Award, Moon, Calendar, ListTodo
} from 'lucide-react';
import { useUser } from './context/UserContext';
import { usePomodoro } from './context/PomodoroContext';
import { localDb } from './services/localDb';
import { useStudyStats } from './hooks/useStudyStats';
import MagneticCard from './components/UI/MagneticCard';
import RippleButton from './components/UI/RippleButton';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Yeni Modern Logo Bileşeni
function ModernLogo({ size = 32, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-xl shadow-lg shadow-blue-500/30 transform -rotate-6"></div>
      <div className="absolute inset-0 bg-[var(--surface)] border border-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transform transition-transform hover:rotate-6">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[60%] h-[60%] text-[var(--text-primary)]">
          <path d="M4 19L12 4L20 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 4V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// Sekmeler Arası Geçiş Animasyonu İçin Wrapper Bileşen
function PageWrapper({ children, activeTab }: { children: React.ReactNode, activeTab: string }) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLogging, setIsLogging] = useState(false);
  const { loading } = useUser();
  const { isActive, timeLeft, mode } = usePomodoro();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-start)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-start)] pb-24 safe-area-inset overflow-hidden">
      <div className="dot-bg" />
      <main className="px-5 pt-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <PageWrapper activeTab="home">
              <Dashboard
                onStartStudy={() => setActiveTab('pomodoro')}
                onAddLog={() => setIsLogging(true)}
                onNavigate={setActiveTab}
              />
            </PageWrapper>
          )}
          {activeTab === 'pomodoro' && <PageWrapper activeTab="pomodoro"><PomodoroView /></PageWrapper>}
          {activeTab === 'subjects' && <PageWrapper activeTab="subjects"><SubjectsView onAddLog={() => setIsLogging(true)} /></PageWrapper>}
          {activeTab === 'analytics' && <PageWrapper activeTab="analytics"><AnalyticsView onAddLog={() => setIsLogging(true)} /></PageWrapper>}
          {activeTab === 'profile' && <PageWrapper activeTab="profile"><ProfileView /></PageWrapper>}
          {activeTab === 'notes' && <PageWrapper activeTab="notes"><NotesView /></PageWrapper>}
          {activeTab === 'planner' && <PageWrapper activeTab="planner"><PlannerView /></PageWrapper>}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isLogging && <StudyLoggerModal onClose={() => setIsLogging(false)} />}
      </AnimatePresence>

      {/* Floating Pomodoro Widget on Dashboard */}
      {isActive && activeTab !== 'pomodoro' && activeTab !== 'home' && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={() => setActiveTab('pomodoro')}
          className="fixed bottom-24 left-5 right-5 glass-panel p-3 border-blue-500/50 bg-blue-500/10 flex items-center justify-between z-[60] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center relative">
              <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <Timer size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{mode === 'focus' ? 'Oturum Devam Ediyor' : 'Mola Devam Ediyor'}</p>
              <p className="text-sm font-black text-[var(--text-primary)]">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-blue-500" />
        </motion.div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 glass-panel mx-2 mb-5 h-16 flex items-center justify-around z-50 rounded-3xl border-white/20 shadow-2xl px-1">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Ana Sayfa" />
        <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<Calendar size={20} />} label="Plan" />
        <NavButton active={activeTab === 'pomodoro'} onClick={() => setActiveTab('pomodoro')} icon={<Timer size={20} />} label="Odak" />
        <NavButton active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<BookOpen size={20} />} label="Eğitim" />
        <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart2 size={20} />} label="Analiz" />
        <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<FileText size={20} />} label="Notlar" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20} />} label="Profil" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center transition-all ${active ? 'text-blue-500 scale-110' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter truncate max-w-[48px] text-center">{label}</span>
    </button>
  );
}

function TypewriterText() {
  const texts = ['MindVault', 'Odaklan', 'Başar', 'Yüksel'];
  const [text, setText] = useState('');
  const [isDel, setIsDel] = useState(false);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const currentStr = texts[loop % texts.length];

    if (isDel) {
      t = setTimeout(() => {
        setText(prev => prev.slice(0, -1));
        if (text === '') {
          setIsDel(false);
          setLoop(l => l + 1);
        }
      }, 50); // Speed of deletion
    } else {
      t = setTimeout(() => {
        setText(currentStr.slice(0, text.length + 1));
        if (text === currentStr) {
          t = setTimeout(() => setIsDel(true), 2000); // Pause before deleting
        }
      }, 150); // Speed of typing
    }

    return () => clearTimeout(t);
  }, [text, isDel, loop]);

  return <span className="inline-block min-w-[140px] text-center">{text}<span className="animate-pulse">|</span></span>;
}

function Dashboard({ onStartStudy, onNavigate }: any) {
  const { user } = useUser();
  const { stats } = useStudyStats();
  const { isActive, mode, timeLeft } = usePomodoro();
  const [timeStr, setTimeStr] = useState(format(new Date(), 'HH:mm'));
  const COLORS = ['#3b82f6', '#818cf8', '#2dd4bf', '#f59e0b', '#ec4899'];
  const [dateStr] = useState(format(new Date(), 'd MMMM yyyy', { locale: tr }));
  const [subjects, setSubjects] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    setSubjects(localDb.getSubjects().filter(s => !s.isCompleted).slice(0, 3));
    setTodos(localDb.getSchedule());
    const timer = setInterval(() => setTimeStr(format(new Date(), 'HH:mm')), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10 mt-2">
        <ModernLogo size={48} className="mb-2" />
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
          <TypewriterText />
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest bg-white/5 py-1.5 px-4 rounded-full border border-white/5">
          {dateStr} • <span className="text-blue-500">{timeStr}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MagneticCard className="h-full">
          <div onClick={() => onNavigate('pomodoro')} className="glass-card p-5 h-full flex flex-col justify-between min-h-[120px] cursor-pointer">
            <Target size={18} className="text-blue-500" />
            <div>
              <div className="text-2xl font-black text-[var(--text-primary)]">{stats.todayMinutes}<span className="text-xs ml-1 text-slate-400">/ {user?.dailyGoalHours * 60} dk</span></div>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Bugünkü Odak</p>
            </div>
          </div>
        </MagneticCard>
        <MagneticCard className="h-full">
          <div className="glass-card p-5 h-full flex flex-col justify-between min-h-[120px]">
            <Flame size={18} className="text-orange-500" />
            <div>
              <div className="text-2xl font-black text-[var(--text-primary)]">{user?.currentStreak || 0}<span className="text-xs ml-1 text-slate-400">Gün</span></div>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Aktif Seri</p>
            </div>
          </div>
        </MagneticCard>
      </div>

      {/* Today's Questions Widget */}
      <MagneticCard>
        <div onClick={() => onNavigate('subjects')} className="glass-panel p-5 border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Brain size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">Bugün Çözülen</p>
              <h3 className="text-xl font-black text-[var(--text-primary)]">{stats.todayQuestions.total}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Doğru</span>
              <span className="text-sm font-black text-[var(--text-primary)]">{stats.todayQuestions.correct}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Yanlış</span>
              <span className="text-sm font-black text-[var(--text-primary)]">{stats.todayQuestions.wrong}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Net</span>
              <span className="text-sm font-black text-[var(--text-primary)]">{(stats.todayQuestions.correct - (stats.todayQuestions.wrong * 0.25)).toFixed(2).replace('.00', '')}</span>
            </div>
          </div>
        </div>
      </MagneticCard>

      {/* Next Exam Widget */}
      {stats.nextExam && (
        <MagneticCard>
          <div onClick={() => onNavigate('subjects')} className="glass-panel p-5 border-rose-500/30 bg-rose-500/5 flex items-center justify-between cursor-pointer overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12"><GraduationCap size={120} /></div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Sıradaki Sınav</p>
              <h3 className="text-lg font-black text-[var(--text-primary)] truncate max-w-[200px]">{stats.nextExam.title}</h3>
              <p className="text-xs font-bold text-slate-400">{format(stats.nextExam.date, 'd MMMM', { locale: tr })}</p>
            </div>
            <div className="text-center bg-rose-500 text-white rounded-2xl px-4 py-2">
              <div className="text-lg font-black">{stats.nextExam.daysLeft === 0 ? 'Bugün' : stats.nextExam.daysLeft}</div>
              <div className="text-[8px] font-black uppercase tracking-tighter">{stats.nextExam.daysLeft === 0 ? '---' : 'Gün Kaldı'}</div>
            </div>
          </div>
        </MagneticCard>
      )}

      {/* Trend and Subject Dist. Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Study Trend Chart Widget */}
        <div onClick={() => onNavigate('analytics')} className="glass-panel p-4 cursor-pointer flex flex-col justify-between h-56">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haftalık Trend</h3>
            <BarChart2 size={16} className="text-blue-500" />
          </div>
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                <Tooltip />
                <Bar dataKey="minutes" radius={[4, 4, 4, 4]} barSize={12}>
                  {stats.chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === stats.chartData.length - 1 ? '#3b82f6' : 'rgba(99, 102, 241, 0.15)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution Widget */}
        <div onClick={() => onNavigate('analytics')} className="glass-panel p-4 cursor-pointer flex flex-col items-center justify-between h-56">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-start mb-2">Ders Dağılımı</h3>
          {stats.subjectData.length > 0 ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <div className="h-24 w-24 relative mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.subjectData} innerRadius={30} outerRadius={45} dataKey="minutes" paddingAngle={4}>
                      {stats.subjectData.map((_: any, index: number) => <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {stats.subjectData.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[8px] font-bold text-slate-400 max-w-[40px] truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic flex-1 flex items-center justify-center">Veri yok</p>
          )}
        </div>
      </div>

      {/* Active Subjects Widget */}
      {subjects.length > 0 && (
        <div className="glass-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sıradaki Konular</h3>
            <BookOpen size={16} className="text-blue-500" />
          </div>
          <div className="space-y-3">
            {subjects.map(subj => (
              <div key={subj.id} onClick={() => onNavigate('subjects')} className="p-3 bg-white/5 rounded-xl cursor-pointer flex justify-between items-center border border-white/5">
                <div>
                  <p className="text-xs font-black text-[var(--text-primary)]">{subj.name}</p>
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{subj.category}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Planner Widget */}
      <MagneticCard>
        <div onClick={() => onNavigate('planner')} className="glass-panel p-5 cursor-pointer flex justify-between items-center group mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Bugünün Planı</p>
              <p className="text-sm font-black text-[var(--text-primary)]">Takvim Yapılacaklar</p>
              {todos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {todos.slice(0, 3).map((todo: any) => (
                    <p key={todo.id} className={`text-[11px] font-bold max-w-[180px] truncate ${todo.completed ? 'line-through text-emerald-500 opacity-60' : 'text-[var(--text-primary)]'}`}>
                      • {todo.title}
                    </p>
                  ))}
                  {todos.length > 3 && (
                    <p className="text-[10px] text-slate-400 font-bold italic">+{todos.length - 3} görev daha</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </MagneticCard>

      <MagneticCard>
        <div className="glass-panel p-6 border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Timer size={80} /></div>
          {isActive ? (
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-black text-[var(--text-primary)] mb-2 uppercase tracking-widest">{mode === 'focus' ? 'Odağın Devam Ediyor' : 'Molan Devam Ediyor'}</h3>
              <div className="text-5xl font-black text-blue-500 mb-4 tabular-nums tracking-tighter">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <RippleButton onClick={onStartStudy} className="w-full py-3 bg-blue-500/10 text-blue-500 rounded-2xl shadow-lg shadow-blue-500/10 font-black text-xs uppercase tracking-widest shrink-0 grow-0">Odak Görünümü</RippleButton>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Yeni Oturum</h3>
              <p className="text-xs font-bold text-[var(--text-secondary)] mb-4">Pomodoro sayacı ile hemen başla.</p>
              <RippleButton onClick={onStartStudy} className="w-full py-3 bg-blue-500 text-white rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest">Hızlı Başlat</RippleButton>
            </>
          )}
        </div>
      </MagneticCard>
    </div>
  );
}

function PomodoroView() {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, setMode, getTotalTimeForMode, selectedSubject, setSelectedSubject, settings, setSettings } = usePomodoro();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setSubjects(localDb.getSubjects());
    setHistory(localDb.getStudySessions().filter(s => s.type === 'pomodoro').slice(-5).reverse());
  }, []);

  return (
    <div className="flex flex-col items-center space-y-8 py-4">
      {/* Settings Modal Toggle */}
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Odak</h1>
        <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white/5 rounded-2xl text-slate-400"><Settings2 size={20} /></button>
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center bg-white/5 p-1 rounded-2xl border border-white/5 mb-6">
          <button onClick={() => setMode('focus')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'focus' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>Odak</button>
          <button onClick={() => setMode('shortBreak')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'shortBreak' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>Kısa Mola</button>
          <button onClick={() => setMode('longBreak')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'longBreak' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Uzun Mola</button>
        </div>

        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">Şu an neye odaklanıyorsun?</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full glass-input text-sm font-bold text-center appearance-none"
        >
          <option value="">Genel Odaklanma</option>
          {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Timer Circle */}
      <div className="relative w-72 h-72">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle className="text-slate-100 dark:text-slate-800" cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <motion.circle
            className={`${mode === 'focus' ? 'text-blue-500' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-indigo-500'} transition-all`} cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="282.7"
            animate={{ strokeDashoffset: 282.7 * (1 - timeLeft / getTotalTimeForMode()) }} transition={{ type: 'tween', ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-[var(--text-primary)] font-mono tracking-tighter">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          <div className="mt-2 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            {mode === 'focus' ? 'ODAK' : mode === 'shortBreak' ? 'KISA MOLA' : 'UZUN MOLA'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={resetTimer} className="w-14 h-14 bg-white/5 text-slate-400 rounded-3xl active:scale-90 transition-all flex items-center justify-center border border-white/10"><RotateCcw size={22} /></button>
        <button onClick={toggleTimer} className={`w-24 h-24 rounded-[40px] flex items-center justify-center shadow-2xl text-white active:scale-95 transition-all ${isActive ? 'bg-orange-500 shadow-orange-500/30' : 'bg-blue-500 shadow-blue-500/30'}`}>
          {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
        </button>
        <div className="w-14 h-14" />
      </div>

      {/* History */}
      <div className="w-full space-y-4 pt-4">
        <div className="flex justify-between items-center"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Son Oturumlar</h3><History size={16} className="text-slate-300" /></div>
        <div className="space-y-2">
          {history.map(s => (
            <div key={s.id} className="glass-card p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Check size={14} /></div>
                <span className="text-sm font-bold truncate max-w-[120px]">{s.subject}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400">{s.duration}dk • {format(s.timestamp, 'HH:mm')}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-xs text-center text-slate-400 italic py-4">Henüz tamamlanan oturum yok.</p>}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] p-5 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[var(--background-start)] w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">Ayarlar</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 rounded-xl"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs"><label>Odak Süresi</label><span className="text-blue-500">{settings.focusTime} dk</span></div>
                  <input type="range" min="5" max="60" step="5" value={settings.focusTime} onChange={(e) => setSettings({ ...settings, focusTime: parseInt(e.target.value) })} className="w-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs"><label>Kısa Mola</label><span className="text-emerald-500">{settings.shortBreak} dk</span></div>
                  <input type="range" min="1" max="15" step="1" value={settings.shortBreak} onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) })} className="w-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-xs"><label>Uzun Mola</label><span className="text-indigo-500">{settings.longBreak} dk</span></div>
                  <input type="range" min="5" max="30" step="5" value={settings.longBreak} onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) })} className="w-full" />
                </div>
                <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-4">KAYDET</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubjectsView({ onAddLog }: any) {
  const [subTab, setSubTab] = useState('courses');
  const [subjects, setSubjects] = useState<any[]>([]); // Topics
  const [tags, setTags] = useState<any[]>([]); // Courses
  const [exams, setExams] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // States for adding
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const [isAddingExam, setIsAddingExam] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');

  // Practice Exam State
  const [isAddingPractice, setIsAddingPractice] = useState(false);
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceTotalQ, setPracticeTotalQ] = useState('');
  const [practiceDuration, setPracticeDuration] = useState('');
  const [practiceCorrect, setPracticeCorrect] = useState('');
  const [practiceWrong, setPracticeWrong] = useState('');

  // Topic editing state
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [qCount, setQCount] = useState('');

  // Delete tag confirm
  const [tagToDelete, setTagToDelete] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSubjects(localDb.getSubjects());
    setTags(localDb.getSubjectTags());
    setExams(localDb.getExams());
    setSessions(localDb.getStudySessions());
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    localDb.addSubjectTag(newTagName.trim());
    refreshData();
    setNewTagName('');
    setIsAddingTag(false);
    toast.success('Ders eklendi.');
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim() || !selectedTag) {
      toast.error('Lütfen bir ders seçin ve konuları yazın.');
      return;
    }
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l !== '');
    localDb.bulkAddSubjects(lines, selectedTag);
    refreshData();
    setBulkText('');
    setIsBulkAdding(false);
    toast.success(`${lines.length} konu eklendi.`);
  };

  const handleAddExam = () => {
    if (!examTitle || !examDate) return;
    localDb.addExam({ title: examTitle, date: new Date(examDate).getTime() });
    refreshData();
    setExamTitle('');
    setExamDate('');
    setIsAddingExam(false);
    toast.success('Sınav eklendi!');
  };

  const handleAddPractice = () => {
    if (!practiceTitle || (!practiceTotalQ && !practiceCorrect)) return;
    const tQ = parseInt(practiceTotalQ) || ((parseInt(practiceCorrect) || 0) + (parseInt(practiceWrong) || 0));
    localDb.addStudySession({
      subject: practiceTitle,
      duration: parseInt(practiceDuration) || 0,
      correctCount: parseInt(practiceCorrect) || 0,
      wrongCount: parseInt(practiceWrong) || 0,
      totalQuestions: tQ,
      timestamp: Date.now(),
      type: 'exam'
    });
    refreshData();
    setPracticeTitle(''); setPracticeTotalQ(''); setPracticeDuration(''); setPracticeCorrect(''); setPracticeWrong('');
    setIsAddingPractice(false);
    toast.success('Deneme eklendi!');
  };

  const saveTopicStats = () => {
    if (!editingTopic) return;

    const newCount = parseInt(qCount) || 0;
    const oldCount = editingTopic.solvedQuestions || 0;
    const diff = newCount - oldCount;

    localDb.updateSubject(editingTopic.id, { solvedQuestions: newCount, hasSolved: true });

    // Eğer soru sayısı arttıysa, analizler için bir oturum kaydı oluştur
    if (diff > 0) {
      localDb.addStudySession({
        subject: editingTopic.name,
        duration: 0, // Sadece soru girişi olduğu için süre 0 kabul ediliyor
        correctCount: 0,  // Doğru/yanlış bilinmediği için şimdilik 0
        wrongCount: 0,
        totalQuestions: diff, // Toplam soruya ekleniyor (Sorular sekmesinde görünür)
        timestamp: Date.now(),
        type: 'manual'
      });
    }

    refreshData();
    setEditingTopic(null);
    toast.success('Güncellendi.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-1 rounded-2xl border border-white/5 mx-auto mb-6 max-w-md gap-1">
        <button onClick={() => setSubTab('courses')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${subTab === 'courses' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}>Dersler</button>
        <button onClick={() => setSubTab('exams')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${subTab === 'exams' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}>Sınavlar</button>
        <button onClick={() => setSubTab('questions')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${subTab === 'questions' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}>Sorular</button>
        <button onClick={() => setSubTab('practice')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${subTab === 'practice' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}>Denemeler</button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'courses' ? (
          <motion.div key="courses" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
            {/* Tags Bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => setIsAddingTag(true)} className="flex-shrink-0 w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/20"><Plus size={20} /></button>
              {tags.map(tag => (
                <button key={tag.id} onDoubleClick={() => setTagToDelete(tag.name)} className="flex-shrink-0 px-4 h-10 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-[var(--text-secondary)] hover:border-blue-500/30 transition-all uppercase tracking-widest">{tag.name}</button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">Ders Planım</h2>
              <button onClick={() => setIsBulkAdding(!isBulkAdding)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest"><Layers size={14} /> Konu Ekle</button>
            </div>

            {isBulkAdding && (
              <div className="glass-panel p-5 space-y-4">
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="w-full glass-input text-xs font-black uppercase">
                  <option value="">Ders Seçin</option>
                  {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="Konuları alt alta yazın..." className="w-full h-32 bg-transparent outline-none resize-none text-[15px] font-medium border-b border-white/10" />
                <div className="flex gap-3">
                  <button onClick={() => setIsBulkAdding(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase">Vazgeç</button>
                  <button onClick={handleBulkAdd} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase">Ekle</button>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {tags.map(tag => {
                const items = subjects.filter(s => s.category === tag.name);
                if (items.length === 0 && !isBulkAdding) return null;
                return (
                  <div key={tag.id} className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{tag.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400">{items.filter(i => i.isCompleted).length}/{items.length}</span>
                    </div>
                    <div className="grid gap-2">
                      {items.map(subj => (
                        <div key={subj.id} onClick={() => { setEditingTopic(subj); setQCount(subj.solvedQuestions.toString()); }} className={`glass-card p-4 flex items-center justify-between cursor-pointer ${subj.isCompleted ? 'opacity-40 bg-emerald-500/5' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div onClick={(e) => { e.stopPropagation(); localDb.updateSubject(subj.id, { isCompleted: !subj.isCompleted }); refreshData(); }}>
                              {subj.isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${subj.isCompleted ? 'line-through' : ''}`}>{subj.name}</p>
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-tighter mt-0.5">{subj.solvedQuestions} Soru Çözüldü</p>
                            </div>
                          </div>
                          <div className="p-1 px-2 rounded-md bg-white/5 text-[10px] font-black text-slate-400"><ChevronRight size={14} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : subTab === 'exams' ? (
          <motion.div key="exams" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">Sınav Takvimi</h2>
              <button onClick={() => setIsAddingExam(!isAddingExam)} className="p-2 bg-blue-500 text-white rounded-xl"><Plus size={18} /></button>
            </div>

            {isAddingExam && (
              <div className="glass-panel p-5 space-y-4">
                <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Sınav Adı..." className="w-full glass-input text-sm font-bold" />
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full glass-input text-sm font-bold" />
                <button onClick={handleAddExam} className="w-full py-4 bg-blue-500 text-white rounded-xl font-black text-xs uppercase">Sınavı Ekle</button>
              </div>
            )}

            <div className="space-y-4">
              {exams.map(exam => {
                const daysLeft = differenceInDays(startOfDay(new Date(exam.date)), startOfDay(new Date()));
                const isPast = daysLeft < 0;
                return (
                  <div key={exam.id} className="glass-card p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><GraduationCap size={20} /></div>
                      <button onClick={() => { localDb.deleteExam(exam.id); refreshData(); }} className="text-red-500/20"><Trash2 size={16} /></button>
                    </div>
                    <h3 className="font-black text-lg">{exam.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-4">{format(exam.date, 'dd MMMM yyyy', { locale: tr })}</p>
                    <div className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-blue-500/10 text-blue-500'}`}>
                      <Clock size={16} /> {isPast ? 'Tamamlandı' : `${daysLeft} Gün Kaldı`}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : subTab === 'questions' ? (
          <motion.div key="questions" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Soru Kayıtları</h2>
              <button onClick={onAddLog} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest"><Plus size={14} /> Soru Ekle</button>
            </div>

            <div className="space-y-4">
              {sessions.filter(s => s.type === 'manual' || s.totalQuestions > 0).slice().reverse().map(session => (
                <div key={session.id} className="glass-card p-4 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-sm text-[var(--text-primary)]">{session.subject}</h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {format(session.timestamp, 'dd MMM HH:mm', { locale: tr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-blue-500 font-bold uppercase truncate">Çözülen</p>
                      <p className="text-sm font-black mt-1">{session.totalQuestions}</p>
                    </div>
                    {(session.correctCount > 0 || session.wrongCount > 0) && (
                      <>
                        <div className="flex-1 bg-emerald-500/5 rounded-xl p-2 text-center">
                          <p className="text-[10px] text-emerald-500 font-bold uppercase truncate">Doğru</p>
                          <p className="text-sm font-black mt-1">{session.correctCount}</p>
                        </div>
                        <div className="flex-1 bg-rose-500/5 rounded-xl p-2 text-center">
                          <p className="text-[10px] text-rose-500 font-bold uppercase truncate">Yanlış</p>
                          <p className="text-sm font-black mt-1">{session.wrongCount}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={() => { localDb.save('study_sessions', sessions.filter(s => s.id !== session.id)); refreshData(); }} className="absolute -top-10 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:top-2 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {sessions.filter(s => s.type === 'manual' || s.totalQuestions > 0).length === 0 && (
                <div className="py-12 text-center glass-card border-dashed">
                  <Brain size={32} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                  <p className="text-xs text-slate-400 font-bold uppercase">Hiç soru kaydı yok.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="practice" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Denemeler</h2>
              <button onClick={() => setIsAddingPractice(!isAddingPractice)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                {isAddingPractice ? 'Vazgeç' : <><Plus size={14} /> Ekle</>}
              </button>
            </div>

            <AnimatePresence>
              {isAddingPractice && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-panel p-5 space-y-4 mb-4">
                    <input value={practiceTitle} onChange={(e) => setPracticeTitle(e.target.value)} placeholder="Deneme Adı (Örn: TYT Genel)" className="w-full glass-input text-sm font-bold" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" value={practiceTotalQ} onChange={(e) => setPracticeTotalQ(e.target.value)} placeholder="Toplam Soru Sayısı" className="glass-input text-xs" />
                      <input type="number" value={practiceDuration} onChange={(e) => setPracticeDuration(e.target.value)} placeholder="Süre (Dakika)" className="glass-input text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" value={practiceCorrect} onChange={(e) => setPracticeCorrect(e.target.value)} placeholder="Doğru" className="glass-input text-xs bg-emerald-500/5 border-emerald-500/20 text-emerald-500 placeholder-emerald-500/50" />
                      <input type="number" value={practiceWrong} onChange={(e) => setPracticeWrong(e.target.value)} placeholder="Yanlış" className="glass-input text-xs bg-rose-500/5 border-rose-500/20 text-rose-500 placeholder-rose-500/50" />
                    </div>
                    <button onClick={handleAddPractice} className="w-full py-4 bg-blue-500 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Şimdi Kaydet</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {sessions.filter(s => s.type === 'exam').slice().reverse().map(session => {
                const net = (session.correctCount || 0) - ((session.wrongCount || 0) * 0.25);
                return (
                  <div key={session.id} className="glass-card p-4 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-sm text-[var(--text-primary)]">{session.subject}</h3>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {format(session.timestamp, 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md">{session.totalQuestions} Soru</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md">{session.duration} Dk</span>
                    </div>
                    {(session.correctCount > 0 || session.wrongCount > 0) && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2 text-center">
                          <p className="text-[10px] text-emerald-500 font-bold uppercase truncate">Doğru</p>
                          <p className="text-sm font-black mt-1">{session.correctCount}</p>
                        </div>
                        <div className="flex-1 bg-rose-500/5 border border-rose-500/10 rounded-xl p-2 text-center">
                          <p className="text-[10px] text-rose-500 font-bold uppercase truncate">Yanlış</p>
                          <p className="text-sm font-black mt-1">{session.wrongCount}</p>
                        </div>
                        <div className="flex-[1.5] bg-blue-500 border border-blue-500/50 rounded-xl p-2 text-center text-white shadow-lg shadow-blue-500/20">
                          <p className="text-[10px] text-white/80 font-bold uppercase truncate">Net</p>
                          <p className="text-sm font-black mt-1">{net.toFixed(2).replace('.00', '')}</p>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { localDb.save('study_sessions', sessions.filter(s => s.id !== session.id)); refreshData(); }} className="absolute -top-10 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:top-2 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
              {sessions.filter(s => s.type === 'exam').length === 0 && (
                <div className="py-12 text-center glass-card border-dashed">
                  <Award size={32} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                  <p className="text-xs text-slate-400 font-bold uppercase">Henüz deneme kaydı yok.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence >

      {/* Adding Tag Modal */}
      <AnimatePresence>
        {
          isAddingTag && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddingTag(false)} />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[var(--background-start)] w-full max-w-sm rounded-[32px] p-8 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Tag className="text-blue-500" /> Yeni Ders Ekle</h3>
                <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Örn: Matematik" className="w-full glass-input mb-6" autoFocus />
                <div className="flex gap-3">
                  <button onClick={() => setIsAddingTag(false)} className="flex-1 font-bold text-slate-400">Vazgeç</button>
                  <button onClick={handleAddTag} className="flex-2 py-3 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs">Ekle</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Edit Topic Modal */}
      <AnimatePresence>
        {
          editingTopic && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-5 text-center">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" onClick={() => setEditingTopic(null)} />
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[var(--background-start)] w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-white/5">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">{editingTopic.category}</p>
                <h3 className="text-2xl font-black mb-1 text-[var(--text-primary)]">{editingTopic.name}</h3>
                <div className="w-12 h-1 bg-blue-500 mx-auto mb-8 rounded-full" />

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Çözülen Soru Sayısı</label>
                    <input type="number" value={qCount} onChange={(e) => setQCount(e.target.value)} className="w-full bg-white/5 border border-white/5 text-3xl font-black text-center py-6 rounded-3xl outline-none focus:border-blue-500/30" placeholder="0" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setEditingTopic(null)} className="flex-1 text-slate-500 font-bold uppercase text-xs">İptal</button>
                    <button onClick={saveTopicStats} className="flex-[2] py-4 bg-blue-500 text-white rounded-3xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">GÜNCELLE</button>
                  </div>
                  <button onClick={() => { localDb.deleteSubject(editingTopic.id); refreshData(); setEditingTopic(null); }} className="w-full text-red-500/30 hover:text-red-500 text-[10px] font-black uppercase tracking-widest pt-4 transition-colors">Konuyu Listeden Sil</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >
      {/* Delete Tag Confirmation */}
      <AnimatePresence>
        {
          tagToDelete && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setTagToDelete('')} />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[var(--background-start)] w-full max-w-sm rounded-[32px] p-8 border border-white/10 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                <h3 className="text-xl font-black mb-2">Emin Misin?</h3>
                <p className="text-xs text-slate-400 font-bold mb-6">"{tagToDelete}" dersini ve içindeki TÜM konuları sileceksin. Bu işlem geri alınamaz.</p>
                <div className="flex gap-3">
                  <button onClick={() => setTagToDelete('')} className="flex-1 py-3 bg-white/5 text-slate-400 font-black text-xs rounded-xl uppercase tracking-widest">İptal</button>
                  <button onClick={() => { localDb.deleteSubjectTag(tagToDelete); refreshData(); setTagToDelete(''); toast.success('Ders silindi'); }} className="flex-[2] py-3 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20">Evet, Sil</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >
    </div>
  );
}

function AnalyticsView({ onAddLog }: any) {
  const { stats, isLoading } = useStudyStats();
  const COLORS = ['#3b82f6', '#818cf8', '#2dd4bf', '#f59e0b', '#ec4899'];
  if (isLoading) return <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" /></div>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Haftalık Analiz</h1>
      </div>

      <button onClick={onAddLog} className="w-full relative overflow-hidden glass-panel p-5 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-blue-500/30 flex items-center justify-between group shadow-lg shadow-blue-500/5 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-500"><Brain size={80} /></div>
        <div className="flex items-center gap-4 relative z-10 w-full">
          <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <PlusCircle size={24} />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-[13px] font-black text-blue-500 uppercase tracking-widest">Manuel Soru Çözümü Ekle</h3>
            <p className="text-xs font-bold text-[var(--text-secondary)]">Manuel soru ve süre gir</p>
          </div>
          <ChevronRight size={20} className="text-blue-500 relative z-10 opacity-70" />
        </div>
      </button>
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 overflow-hidden relative h-32 flex flex-col justify-between"><div className="absolute top-0 right-0 p-3 opacity-5"><Brain size={48} /></div><div><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Toplam Soru</p><h3 className="text-2xl font-black">{stats.questionStats.total}</h3></div><div className="text-emerald-400 bg-emerald-400/10 w-fit px-1.5 py-0.5 rounded-md text-[10px] font-bold">%{stats.questionStats.accuracy} Başarı</div></div>
        <div className="glass-panel p-5 overflow-hidden relative h-32 flex flex-col justify-between"><div className="absolute top-0 right-0 p-3 opacity-5"><Clock size={48} /></div><div><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Haftalık Odak</p><h3 className="text-2xl font-black">{stats.weeklyMinutes}</h3></div><p className="text-[10px] text-slate-400 font-bold uppercase">Dakika</p></div>
      </div>
      <div className="glass-panel p-5 h-64"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trend</h3><div className="h-40 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.chartData}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} /><Tooltip /><Bar dataKey="minutes" radius={[6, 6, 6, 6]} barSize={20}>{stats.chartData.map((_: any, index: number) => (<Cell key={`cell-${index}`} fill={index === stats.chartData.length - 1 ? '#3b82f6' : 'rgba(99, 102, 241, 0.2)'} />))}</Bar></BarChart></ResponsiveContainer></div></div>
      <div className="glass-panel p-6 flex flex-col items-center"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 self-start">Ders Dağılımı</h3>{stats.subjectData.length > 0 ? (<div className="w-full flex items-center justify-around"><div className="h-32 w-32 relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.subjectData} innerRadius={40} outerRadius={55} dataKey="minutes" paddingAngle={4}>{stats.subjectData.map((_: any, index: number) => <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-2">{stats.subjectData.slice(0, 3).map((s: any, i: number) => (<div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-[10px] font-bold text-slate-400">{s.name}</span></div>))}</div></div>) : (<p className="text-xs text-slate-400 italic py-8 text-center">Yeterli veri bulunmuyor.</p>)}</div>

      {/* Yesterday's Stats */}
      <div className="glass-panel p-5 bg-white/5 border-white/10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dünün Özeti</h3>
        <div className="flex justify-around items-center">
          <div className="text-center">
            <div className="text-2xl font-black text-[var(--text-primary)]">{stats.yesterdayStats.minutes}</div>
            <div className="text-[10px] text-blue-500 font-bold uppercase mt-1">Dakika Çalışma</div>
          </div>
          <div className="w-[1px] h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-[var(--text-primary)]">{stats.yesterdayStats.totalQuestions}</div>
            <div className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Soru Çözüldü</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StudyLoggerModal({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('30');
  const [correct, setCorrect] = useState('');
  const [wrong, setWrong] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => { setSubjects(localDb.getSubjects()); }, []);

  const handleSave = () => {
    const totalQ = (parseInt(correct) || 0) + (parseInt(wrong) || 0);
    localDb.addStudySession({ subject: subject || 'Genel Çalışma', duration: parseInt(duration) || 0, correctCount: parseInt(correct) || 0, wrongCount: parseInt(wrong) || 0, totalQuestions: totalQ, timestamp: Date.now(), type: 'manual' });
    if (subject) {
      const selectedId = subjects.find(s => s.name === subject)?.id;
      if (selectedId) {
        const currentObj = subjects.find(s => s.id === selectedId);
        localDb.updateSubject(selectedId, { solvedQuestions: (currentObj.solvedQuestions || 0) + totalQ, hasSolved: true });
      }
    }
    toast.success('Kaydedildi!');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] p-5 flex items-end justify-center"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} /><motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative bg-[var(--background-start)] w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-white/10"><div className="w-12 h-1.5 bg-slate-400/20 rounded-full mx-auto mb-8" /><h2 className="text-2xl font-black mb-6">Aktivite Ekle</h2><div className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ders</label><select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full glass-input text-sm font-bold"><option value="">Genel Odaklanma</option>{subjects.map(s => <option key={s.id} value={s.name}>{s.name} ({s.category})</option>)}</select></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Süre (Dakika)</label><input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full glass-input text-sm font-bold" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Doğru</label><input type="number" value={correct} onChange={(e) => setCorrect(e.target.value)} className="w-full glass-input text-sm font-bold bg-emerald-500/5 text-emerald-500" /></div><div className="space-y-2"><label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Yanlış</label><input type="number" value={wrong} onChange={(e) => setWrong(e.target.value)} className="w-full glass-input text-sm font-bold bg-rose-500/5 text-rose-500" /></div></div><div className="flex gap-4 pt-4"><button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 uppercase">Vazgeç</button><button onClick={handleSave} className="flex-[2] py-4 bg-blue-500 text-white rounded-3xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Kaydet</button></div></div></motion.div></motion.div>
  );
}

function ProfileView() {
  const { user, toggleTheme, updateUser } = useUser();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(user?.dailyGoalHours?.toString() || '4');

  const handleSaveGoal = () => {
    updateUser({ dailyGoalHours: parseFloat(goalInput) || 4 });
    setIsEditingGoal(false);
    toast.success('Günlük hedefin güncellendi.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 flex flex-col items-center py-4"><div className="relative"><div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[40px] flex items-center justify-center text-white shadow-2xl relative z-10"><User size={48} /></div><div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-[var(--background-start)] rounded-full z-20 flex items-center justify-center text-white"><CheckCircle2 size={16} /></div></div><div className="text-center space-y-1"><h2 className="text-3xl font-black text-[var(--text-primary)]">{user?.displayName}</h2><div className="flex items-center justify-center gap-2"><span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-tighter border border-blue-500/10">MindVault PRO</span><span className="text-xs font-medium text-slate-400">v1.2.0</span></div></div><div className="w-full flex gap-4 px-2"><div className="flex-1 glass-panel p-4 text-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Toplam Odak</p><p className="text-lg font-black text-[var(--text-primary)]">{user?.totalStudyMinutes} <span className="text-[10px] text-slate-400">dk</span></p></div><div className="flex-1 glass-panel p-4 text-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">En İyi Seri</p><p className="text-lg font-black text-[var(--text-primary)]">{user?.longestStreak || 0} <span className="text-[10px] text-slate-400">Gün</span></p></div></div><div className="w-full glass-panel divide-y divide-white/5 overflow-hidden">
      <button onClick={toggleTheme} className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all"><div className="flex items-center gap-3"><div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><Moon size={18} /></div><span className="text-sm font-bold">Temayı Değiştir</span></div><ChevronRight size={16} className="text-slate-400" /></button>

      {!isEditingGoal ? (
        <button onClick={() => setIsEditingGoal(true)} className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all"><div className="flex items-center gap-3"><div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><Target size={18} /></div><span className="text-sm font-bold">Günlük Hedef</span></div><div className="flex items-center gap-2"><span className="text-sm font-black text-blue-500">{user?.dailyGoalHours} Sa</span><ChevronRight size={16} className="text-slate-400" /></div></button>
      ) : (
        <div className="w-full p-5 flex items-center justify-between bg-white/5 transition-all">
          <div className="flex items-center gap-3 flex-1"><div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><Target size={18} /></div><input type="number" step="0.5" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="w-20 glass-input text-sm font-bold" autoFocus /> <span className="text-sm font-black text-slate-400">Saat</span></div>
          <button onClick={handleSaveGoal} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Kaydet</button>
        </div>
      )}

      <button className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all text-red-500"><div className="flex items-center gap-3"><div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><LogOut size={18} /></div><span className="text-sm font-bold">Verileri Sıfırla</span></div></button>
    </div><p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-40 text-center leading-loose pb-10">MindVault • Gizliliğin Odak Noktan <br /> verilerin cihazına gömülü.</p></motion.div>
  );
}

function NotesView() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  useEffect(() => { setNotes(localDb.getNotes()); }, []);
  const handleAdd = () => { if (!newNote.trim()) return; localDb.addNote({ content: newNote.trim() }); setNotes(localDb.getNotes()); setNewNote(''); setIsAdding(false); toast.success('Kaydedildi.'); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6"><div className="flex justify-between items-center"><h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3"><div className="p-2 bg-indigo-500/10 rounded-xl"><FileText size={24} className="text-indigo-500" /></div>Notlarım</h1><button onClick={() => setIsAdding(!isAdding)} className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">{isAdding ? <X size={20} /> : <Plus size={20} />}</button></div><AnimatePresence>{isAdding && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-panel p-5 space-y-4 border-indigo-500/30"><textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Fikirlerini buraya dök..." className="w-full h-32 bg-transparent outline-none resize-none text-[15px] font-medium" autoFocus /><div className="flex gap-3"><button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Vazgeç</button><button onClick={handleAdd} className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-600/20">Kaydet</button></div></motion.div>)}</AnimatePresence><div className="grid gap-4">{notes.length === 0 && !isAdding && (<div className="py-20 text-center glass-card border-dashed"><Search size={40} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} /><p className="text-sm text-slate-400 font-medium">Henüz bir notun yok.</p></div>)}{notes.slice().reverse().map(note => (<motion.div layout key={note.id} className="glass-card p-5 group flex justify-between items-start gap-4"><div className="flex-1"><p className="text-[15px] font-medium leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">{note.content}</p><p className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-widest">{format(note.createdAt, 'd MMMM yyyy HH:mm', { locale: tr })}</p></div><button onClick={() => { const updated = notes.filter(n => n.id !== note.id); localDb.save('notes', updated); setNotes(updated); }} className="p-2 text-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></motion.div>))}</div></motion.div>
  );
}

function PlannerView() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    setTodos(localDb.getSchedule());
  }, []);

  const handleAdd = () => {
    if (!newTodo.trim()) return;
    localDb.addScheduleItem({ title: newTodo.trim(), date: Date.now() });
    setTodos(localDb.getSchedule());
    setNewTodo('');
  };

  const handleToggle = (id: string, current: boolean) => {
    localDb.updateScheduleItem(id, !current);
    setTodos(localDb.getSchedule());
  };

  const handleDelete = (id: string) => {
    localDb.deleteScheduleItem(id);
    setTodos(localDb.getSchedule());
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl"><Calendar size={24} className="text-indigo-500" /></div>
          Günlük Plan
        </h1>
      </div>

      {/* Date Header */}
      <div className="glass-panel p-5 text-center bg-indigo-500/5 border-indigo-500/20">
        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mb-1">Takvim</p>
        <h2 className="text-2xl font-black text-[var(--text-primary)]">{format(new Date(), 'd MMMM yyyy, eeee', { locale: tr })}</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Yapılacaklar / Proje Adımları</h3>
        <div className="glass-panel p-2 flex border border-white/5">
          <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="Bugün neler yapacaksın?" className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-bold placeholder:text-slate-400" />
          <button onClick={handleAdd} className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 shrink-0"><Plus size={20} /></button>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid gap-3">
            {todos.length === 0 ? (
              <div className="py-10 text-center opacity-50"><ListTodo size={40} className="mx-auto mb-3 text-slate-400" /><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Plan henüz boş, eklemeye başla</p></div>
            ) : (
              todos.map(todo => (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={todo.id} className={`glass-card p-4 flex justify-between items-center group transition-all ${todo.completed ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggle(todo.id, todo.completed)}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500/50'}`}>
                      {todo.completed && <Check size={14} className="text-white" />}
                    </div>
                    <p className={`text-sm font-bold flex-1 transition-all ${todo.completed ? 'line-through text-slate-500' : 'text-[var(--text-primary)]'}`}>{todo.title}</p>
                  </div>
                  <button onClick={() => handleDelete(todo.id)} className="p-2 text-red-500/50 hover:text-red-500"><Trash2 size={16} /></button>
                </motion.div>
              ))
            )}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

