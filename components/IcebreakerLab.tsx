import React, { useState, useEffect, useRef } from 'react';
import { Scenario, Message } from '../types';
import { simulateChatResponse } from '../services/geminiService';
import PremiumUpgrade from './PremiumUpgrade';
import { Send, User, Bot, Award, ChevronLeft, MessageCircle, Lock, Crown } from 'lucide-react';

interface IcebreakerLabProps {
  onXpGain: (amount: number) => void;
  userLevel: number;
  isPremium?: boolean;
  onUnlockPremium?: () => void;
}

const SCENARIOS: Scenario[] = [
  { id: 'gym', title: 'Gym Crush', description: 'They just finished a set. Approach naturally.', difficulty: 'Medium', icon: '💪' },
  { id: 'cafe', title: 'Café Stranger', description: 'Sitting alone with a book you love.', difficulty: 'Hard', icon: '☕' },
  { id: 'datingapp', title: 'Dating App Match', description: 'They have a dog in their profile photo.', difficulty: 'Easy', icon: '🐶' },
  { id: 'party', title: 'House Party', description: 'Standing by the drinks table.', difficulty: 'Medium', icon: '🎉' },
  { id: 'dogpark', title: 'Dog Park', description: 'Their dog just ran up to you playfully.', difficulty: 'Easy', icon: '🐕' },
  { id: 'library', title: 'Library Study', description: 'Sharing a table at the university library.', difficulty: 'Medium', icon: '📚' },
  { id: 'market', title: 'Farmers Market', description: 'Looking at the same fresh produce stall.', difficulty: 'Medium', icon: '🥑' },
  { id: 'concert', title: 'Concert Line', description: 'Waiting in line for a band you both like.', difficulty: 'Hard', icon: '🎵' },
  { id: 'artgallery', title: 'Art Gallery', description: 'Looking at a confusing abstract painting.', difficulty: 'Medium', icon: '🎨' },
  { id: 'bookstore', title: 'Bookstore', description: 'Browsing the Sci-Fi section.', difficulty: 'Medium', icon: '📖' },
  { id: 'airport', title: 'Airport Gate', description: 'Flight is delayed by 2 hours.', difficulty: 'Hard', icon: '✈️' },
  { id: 'beach', title: 'Beach Day', description: 'They are applying sunscreen nearby.', difficulty: 'Easy', icon: '🏖️' },
  { id: 'hike', title: 'Hiking Trail', description: 'Stopped at the same scenic viewpoint.', difficulty: 'Easy', icon: '🥾' },
  { id: 'yoga', title: 'Yoga Class', description: 'Rolling up mats after a session.', difficulty: 'Medium', icon: '🧘' },
  { id: 'foodtruck', title: 'Food Truck', description: 'Deciding what to order in line.', difficulty: 'Easy', icon: '🌮' },
  { id: 'coworking', title: 'Coworking Space', description: 'Making coffee in the shared kitchen.', difficulty: 'Hard', icon: '💻' },
  { id: 'boardgame', title: 'Board Game Night', description: 'They need a teammate for a round.', difficulty: 'Easy', icon: '🎲' },
  { id: 'festival', title: 'Music Festival', description: 'Dancing in the crowd between sets.', difficulty: 'Easy', icon: '🎪' },
  { id: 'wedding', title: 'Wedding Bar', description: 'Waiting for drinks at the reception.', difficulty: 'Medium', icon: '🥂' },
  { id: 'elevator', title: 'Elevator', description: 'Just the two of you for 10 floors.', difficulty: 'Hard', icon: '🛗' },
  { id: 'grocery', title: 'Grocery Line', description: 'The person ahead has 50 items.', difficulty: 'Medium', icon: '🛒' },
  { id: 'karaoke', title: 'Karaoke Bar', description: 'They just nailed a difficult song.', difficulty: 'Easy', icon: '🎤' },
  { id: 'volunteer', title: 'Volunteer Event', description: 'Packing food boxes side-by-side.', difficulty: 'Easy', icon: '🤝' },
  { id: 'cooking', title: 'Cooking Class', description: 'You are partners for chopping onions.', difficulty: 'Easy', icon: '🍳' },
  { id: 'museum', title: 'Museum Exhibit', description: 'Staring at a dinosaur skeleton.', difficulty: 'Medium', icon: '🦖' },
  { id: 'trivia', title: 'Trivia Night', description: 'Debating an answer at the next table.', difficulty: 'Easy', icon: '💡' },
  { id: 'commute', title: 'Morning Commute', description: 'Standing room only on the train.', difficulty: 'Hard', icon: '🚆' },
  { id: 'hotel', title: 'Hotel Lobby', description: 'Both waiting for the concierge.', difficulty: 'Medium', icon: '🏨' },
  { id: 'networking', title: 'Networking Event', description: 'Standing awkwardly with a name tag.', difficulty: 'Medium', icon: '👔' },
  { id: 'laundromat', title: 'Laundromat', description: 'Waiting for the spin cycle to finish.', difficulty: 'Medium', icon: '🧺' },
];

const IcebreakerLab: React.FC<IcebreakerLabProps> = ({ onXpGain, userLevel, isPremium = false, onUnlockPremium }) => {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setMessages([{ 
        id: 'init', 
        role: 'ai', 
        text: `(Scenario: ${scenario.description}) Hi! I noticed you looking over. What's up?` 
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Give XP for participation
    onXpGain(10);

    const aiResponseText = await simulateChatResponse(
      [...messages, userMsg], 
      activeScenario ? activeScenario.description : 'General chat'
    );

    setIsTyping(false);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleScenarioClick = (scenario: Scenario, isLocked: boolean) => {
    if (isLocked) {
      setShowPaywall(true);
    } else {
      startScenario(scenario);
    }
  };

  if (!activeScenario) {
    return (
      <div className="h-full overflow-y-auto p-4 pb-24 custom-scrollbar relative">
        {/* Render Paywall Overlay if triggered */}
        {showPaywall && (
          <PremiumUpgrade 
            onUpgrade={() => {
              if (onUnlockPremium) onUnlockPremium();
              setShowPaywall(false);
            }} 
            onClose={() => setShowPaywall(false)}
          />
        )}

        <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <MessageCircle className="text-electricBlue w-5 h-5" /> 
            Icebreaker Lab
            {isPremium && <span className="bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ml-1">Premium</span>}
            </h2>
            <p className="text-gray-400 text-sm">Practice your skills in safe scenarios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCENARIOS.map((scenario) => {
            // Lock EVERYTHING if not premium, except maybe a few demo ones? 
            // The request said "make all tabs upgrade to premium", so we lock all or almost all.
            // Let's lock everything except the first one for a teaser, or strictly follow "upgrade".
            // We will lock ALL for maximum conversion focus as per request.
            const isLocked = !isPremium;
            
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario, isLocked)}
                className={`border rounded-2xl p-6 text-left transition-all relative overflow-hidden group
                  ${isLocked 
                    ? 'bg-darkSurface/50 border-white/5 opacity-75' 
                    : 'bg-darkSurface border-white/5 hover:border-electricBlue hover:scale-[1.02]'
                  }`}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <Lock className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded border border-yellow-500/50">
                      Premium Only
                    </span>
                  </div>
                )}
                
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="text-6xl">{scenario.icon}</span>
                </div>
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <span className="text-3xl">{scenario.icon}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                      scenario.difficulty === 'Easy' ? 'border-green-500 text-green-500' :
                      scenario.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                  }`}>
                      {scenario.difficulty}
                  </span>
                </div>
                <h3 className={`text-lg font-bold transition-colors relative z-10 ${isLocked ? 'text-gray-500' : 'text-white group-hover:text-electricBlue'}`}>
                  {scenario.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 relative z-10">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Header */}
      <div className="bg-darkSurface border-b border-white/10 p-4 flex items-center justify-between">
        <button 
          onClick={() => setActiveScenario(null)}
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
            <h3 className="text-white font-bold flex items-center gap-2 justify-center">
                {activeScenario.icon} {activeScenario.title}
            </h3>
            <span className="text-xs text-electricBlue animate-pulse">Practice Mode</span>
        </div>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-neonPink' : 'bg-electricBlue'
                }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-neonPink text-white rounded-br-none' 
                    : 'bg-darkSurface border border-white/10 text-gray-200 rounded-bl-none'
                }`}>
                    {msg.text}
                </div>
            </div>
          </div>
        ))}
        {isTyping && (
            <div className="flex justify-start">
                 <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-electricBlue flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-darkSurface border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-darkSurface border-t border-white/10 pb-24 md:pb-4">
        <div className="flex gap-2">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your reply..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neonPink transition-colors"
            />
            <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-electricBlue text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default IcebreakerLab;