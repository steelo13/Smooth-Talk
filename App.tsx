import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import IcebreakerLab from './components/IcebreakerLab';
import ConfidenceCoach from './components/ConfidenceCoach';
import PremiumUpgrade from './components/PremiumUpgrade';
import { Zap, Trophy, Lock, Unlock, CheckCircle, Crown } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generate');
  
  // Persistent State
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [readLessons, setReadLessons] = useState<Set<string>>(new Set());
  const [currentDay, setCurrentDay] = useState(1);
  const [isPremium, setIsPremium] = useState(false);
  
  // XP required per level (Fixed at 500 to ensure 1 level up per completed day)
  const xpToNextLevel = 500;

  useEffect(() => {
    console.log("App Mounted");
    
    // Load persisted data on mount
    try {
        const savedXp = localStorage.getItem('boldtalk_xp');
        const savedLevel = localStorage.getItem('boldtalk_level');
        const savedRead = localStorage.getItem('boldtalk_read_lessons');
        const savedStart = localStorage.getItem('boldtalk_start_date');
        const savedPremium = localStorage.getItem('boldtalk_premium');

        if (savedXp) setXp(parseInt(savedXp));
        if (savedLevel) setLevel(parseInt(savedLevel));
        if (savedPremium === 'true') setIsPremium(true);
        if (savedRead) {
            const parsed = JSON.parse(savedRead);
            if (Array.isArray(parsed)) {
                setReadLessons(new Set<string>(parsed));
            }
        }

        // Calculate Day / Streak
        const now = Date.now();
        if (!savedStart) {
            localStorage.setItem('boldtalk_start_date', now.toString());
            setCurrentDay(1);
        } else {
            const startTime = parseInt(savedStart);
            const diffTime = now - startTime;
            // If time is negative (clock change), default to day 1
            if (diffTime < 0) {
                setCurrentDay(1);
            } else {
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setCurrentDay(Math.min(diffDays, 31));
            }
        }
    } catch (e) {
        console.error("Error loading state", e);
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('boldtalk_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('boldtalk_level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('boldtalk_premium', isPremium.toString());
  }, [isPremium]);

  const handleXpGain = (amount: number) => {
    const newXp = xp + amount;
    if (newXp >= xpToNextLevel) {
      setXp(newXp - xpToNextLevel);
      setLevel(prev => prev + 1);
      alert(`🎉 Level Up! You are now Level ${level + 1}. Check for new unlocks!`);
    } else {
      setXp(newXp);
    }
  };

  const handleLessonRead = (lessonId: string) => {
    if (!readLessons.has(lessonId)) {
      const newSet = new Set(readLessons);
      newSet.add(lessonId);
      setReadLessons(newSet);
      localStorage.setItem('boldtalk_read_lessons', JSON.stringify(Array.from(newSet)));
      
      // Award 100 XP per lesson as requested
      handleXpGain(100);
    }
  };

  const handleUpgrade = () => {
    setIsPremium(true);
  };

  // Debug tool to fast forward time (Passed to Coach or used here)
  const advanceDay = () => {
    const savedStart = localStorage.getItem('boldtalk_start_date');
    if (savedStart) {
      const newStart = parseInt(savedStart) - (1000 * 60 * 60 * 24);
      localStorage.setItem('boldtalk_start_date', newStart.toString());
      setCurrentDay(prev => Math.min(prev + 1, 31));
    }
  };

  const resetProgress = () => {
      if (confirm("Are you sure you want to reset all progress?")) {
        const now = Date.now();
        localStorage.setItem('boldtalk_start_date', now.toString());
        localStorage.removeItem('boldtalk_read_lessons');
        localStorage.removeItem('boldtalk_xp');
        localStorage.removeItem('boldtalk_level');
        localStorage.removeItem('boldtalk_premium');
        setReadLessons(new Set());
        setXp(0);
        setLevel(1);
        setCurrentDay(1);
        setIsPremium(false);
      }
  };

  // Calculate today's progress for the profile
  // Lesson IDs are formatted "d{Day}-{Index}"
  const lessonsReadToday = Array.from(readLessons).filter((id) => (id as string).startsWith(`d${currentDay}-`)).length;
  const dailySetTotal = 5;

  const getNextUnlock = () => {
    if (level < 2) return "Tone: Shy but Sweet (Lvl 2)";
    if (level < 3) return "Tone: Confident & Medium Scenarios (Lvl 3)";
    if (level < 4) return "Tone: Smooth & Charming (Lvl 4)";
    if (level < 5) return "Tone: Professional & Hard Scenarios (Lvl 5)";
    return "Master Status Achieved";
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <PhotoAnalyzer onXpGain={handleXpGain} userLevel={level} />;
      case 'lab':
        // Modified: Pass handler instead of blocking, so users can see the content to buy
        return (
          <IcebreakerLab 
             onXpGain={handleXpGain} 
             userLevel={level} 
             isPremium={isPremium} 
             onUnlockPremium={handleUpgrade}
          />
        );
      case 'coach':
        return (
          <ConfidenceCoach 
            currentDay={currentDay}
            readLessons={readLessons}
            onLessonRead={handleLessonRead}
            onAdvanceDay={advanceDay}
            onReset={resetProgress}
          />
        );
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 pb-24 overflow-y-auto">
             <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neonPink to-electricBlue p-1 mb-4 relative">
               <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                  <Trophy className="w-10 h-10 text-yellow-400 z-10" />
                  <div className="absolute inset-0 bg-yellow-400/10 animate-pulse-slow"></div>
               </div>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-darkSurface border border-white/20 px-2 py-0.5 rounded-full">
                 <span className="text-[10px] font-bold text-white uppercase">Lv. {level}</span>
               </div>
             </div>
             
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Social Master {isPremium && <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
             </h2>
             <p className="text-gray-400 text-sm mt-4 max-w-xs">
               Day {currentDay} of your confidence journey.
             </p>
             
             {/* XP Progress Card */}
             <div className="mt-8 w-full max-w-xs bg-darkSurface rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-400">XP Progress</span>
                   <span className="text-white font-bold">{xp} / {xpToNextLevel}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                   <div 
                     className="bg-gradient-to-r from-neonPink to-purple-500 h-full rounded-full transition-all duration-500"
                     style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
                   ></div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Lock className="w-3 h-3"/> Next Unlock:
                  </span>
                  <span className="text-electricBlue font-bold">{getNextUnlock()}</span>
                </div>
             </div>

             {/* Stats Grid */}
             <div className="mt-6 w-full max-w-xs grid grid-cols-2 gap-3">
               <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-400 mb-1">Streak</span>
                 <span className="text-lg font-bold text-orange-400 flex items-center gap-1">
                   <Zap className="w-4 h-4 fill-current"/> {currentDay} Days
                 </span>
               </div>
               <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-400 mb-1">Daily Set</span>
                 <span className={`text-lg font-bold flex items-center gap-1 ${lessonsReadToday === dailySetTotal ? 'text-green-400' : 'text-electricBlue'}`}>
                   {lessonsReadToday === dailySetTotal ? <CheckCircle className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>} 
                   {lessonsReadToday}/{dailySetTotal}
                 </span>
               </div>
             </div>

             {!isPremium && (
                <button 
                  onClick={() => setActiveTab('lab')}
                  className="mt-6 w-full max-w-xs py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl"
                >
                  Upgrade to Premium
                </button>
             )}
          </div>
        );
      default:
        return <PhotoAnalyzer onXpGain={handleXpGain} userLevel={level} />;
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-midnight via-black to-black flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[40%] bg-electricBlue/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative z-10 h-full">
        {renderContent()}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;