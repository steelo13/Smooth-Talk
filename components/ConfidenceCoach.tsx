import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { BookOpen, PlayCircle, Lock, ChevronDown, CheckCircle, Clock, Calendar, Zap } from 'lucide-react';

interface CoachProps {
  currentDay: number;
  readLessons: Set<string>;
  onLessonRead: (id: string) => void;
  onAdvanceDay: () => void;
  onReset: () => void;
}

// --- Content Generation ---

const generateLessons = (): Lesson[] => {
  const lessons: Lesson[] = [];
  
  // Helper to add lessons
  const add = (day: number, title: string, duration: string, cat: string, content: string) => {
    lessons.push({
      id: `d${day}-${lessons.length}`,
      day,
      title,
      duration,
      category: cat,
      content
    });
  };

  // Day 1: The Foundation
  add(1, 'The 3-Second Rule', '2 min', 'Basics', 'When you see someone you want to talk to, count to 3 and go immediately. Waiting longer than 3 seconds triggers your brain\'s "fight or flight" anxiety response.');
  add(1, 'Open-Ended Questions', '3 min', 'Conversation', 'Avoid Yes/No questions. Instead of "Do you like this place?", ask "What brings you here today?" or "How do you know the host?"');
  add(1, 'The "Hello" Test', '1 min', 'Drill', 'Today, just say "Hello" to 3 strangers. No conversation needed. Just a smile and a greeting. This rewires your brain to see strangers as safe.');
  add(1, 'Eye Contact 101', '2 min', 'Body Language', 'Maintain eye contact for the length of a sentence, then break it slightly to the side. Never looking down, which signals submission.');
  add(1, 'Smile with Intent', '2 min', 'Vibe', 'A genuine smile engages the eyes (crow\'s feet). Practice smiling at yourself in the mirror until your eyes crinkle.');

  // Day 2: Flow & Connection
  add(2, 'The FORD Method', '4 min', 'Framework', 'Stuck? Ask about Family, Occupation, Recreation, or Dreams. These are universally safe and engaging topics.');
  add(2, 'Active Listening', '3 min', 'Skill', 'Don\'t just wait for your turn to speak. Nod, say "uh-huh", and ask follow-up questions like "Then what happened?"');
  add(2, 'Silence is Okay', '2 min', 'Mindset', 'A pause in conversation is normal. Don\'t rush to fill it with nervous babble. Take a breath, smile, and ask a new question.');
  add(2, 'Mirroring', '3 min', 'Psychology', 'Subtly match their posture and energy. If they lean back, you lean back. It builds subconscious rapport.');
  add(2, 'Using Their Name', '2 min', 'Charm', 'People love the sound of their own name. Use it once or twice in the conversation, but don\'t overdo it.');

  // Day 3: Overcoming Anxiety
  add(3, 'Rejection Reframing', '5 min', 'Mindset', 'Rejection isn\'t about your worth; it\'s about compatibility or their current mood. If they say no, you saved time.');
  add(3, 'The Spotlight Effect', '3 min', 'Psychology', 'You think everyone is watching you fail, but they aren\'t. They are too worried about themselves. Be bold.');
  add(3, 'Outcome Independence', '4 min', 'Core', 'Go into interactions with zero expectations. You are there to have fun, not to "get" something from them.');
  add(3, 'Power Posing', '2 min', 'Bio-hack', 'Before a social event, stand like a superhero (hands on hips) for 2 minutes. It lowers cortisol and boosts testosterone.');
  add(3, 'Deep Breathing', '2 min', 'Calm', 'Nervous? Inhale for 4 seconds, hold for 4, exhale for 4. This physically forces your heart rate down.');

  // Day 4: Flirting Basics
  add(4, 'The Push-Pull', '4 min', 'Flirting', 'Give a compliment (Pull), then a playful tease (Push). "You have great style, even if those shoes are questionable."');
  add(4, 'Playful Teasing', '3 min', 'Vibe', 'Treat them like a bratty little sibling. Light, fun teasing creates tension and breaks the "boring interview" mode.');
  add(4, 'Breaking Touch Barrier', '3 min', 'Action', 'Start small: a high five, a touch on the elbow when laughing. If they recoil, stop. If they lean in, proceed.');
  add(4, 'Prolonged Eye Contact', '2 min', 'Intimacy', 'Hold eye contact just a second longer than usual during silence. It creates a spark of intimacy.');
  add(4, 'Unique Compliments', '3 min', 'Charm', 'Don\'t compliment looks (genetic). Compliment choices: their style, their energy, their wit.');

  // Day 5: Digital Game
  add(5, 'Texting Timing', '2 min', 'Digital', 'Don\'t play games, but don\'t be always available. Match their response time roughly, but vary it to seem busy.');
  add(5, 'Emoji Minimalist', '2 min', 'Style', 'Use emojis to add tone, not to replace words. One well-placed smirk 😏 is better than five laughing faces.');
  add(5, 'Voice Notes', '3 min', 'High Value', 'Sending a short voice note shows confidence and builds more connection than text. Keep it under 20 seconds.');
  add(5, 'Ending First', '2 min', 'Power', 'End the conversation on a high note while it\'s still fun. "Gotta run, talk later!" leaves them wanting more.');
  add(5, 'Double Texting', '2 min', 'Rule', 'Generally avoid it. If they haven\'t replied, wait. Sending "?" or "hello?" kills attraction immediately.');

  // Day 6: Group Dynamics
  add(6, 'The Open Circle', '3 min', 'Body Language', 'When in a group, keep your feet pointed slightly outward to welcome new people. Don\'t close off the circle.');
  add(6, 'Acknowledging Everyone', '3 min', 'Social IQ', 'When you approach a group, make eye contact with everyone, not just the person you like.');
  add(6, 'The Wingman Rule', '3 min', 'Etiquette', 'If your friend is talking to someone, distract the obstacle (their friend) so they can talk 1-on-1.');
  add(6, 'Entering a Group', '4 min', 'Action', 'Walk up, smile, wait for a lull, and say "Do you guys mind if I join you? You look like you\'re having fun."');
  add(6, 'Exiting Gracefully', '2 min', 'Skill', 'Simple is best: "It was great meeting you all, I\'m going to grab a drink. Catch you later."');

  // Day 7: Deepening Connection
  add(7, 'Vulnerability', '4 min', 'Connection', 'Sharing a small embarrassment or flaw makes you relatable and trustworthy. Perfection is boring.');
  add(7, 'The "Why" Question', '3 min', 'Deep Dive', 'Move from "What do you do?" to "Why did you choose that path?" It reveals their passion.');
  add(7, 'Shared Future', '3 min', 'Bonding', 'Use "We" statements playfully. "We should totally go to that concert." It implies a future together.');
  add(7, 'Listening for Values', '4 min', 'Empathy', 'Hear what they care about (Freedom? Safety? Adventure?) and validate it. "I love that you value adventure."');
  add(7, 'Genuine Appreciation', '2 min', 'Kindness', 'End a conversation with specific praise. "I really enjoyed talking to you, you have great energy."');

  // Days 8-31: Daily Challenges
  const challenges = [
    "Ask a stranger for a recommendation (book, food, direction).",
    "Give a genuine compliment to a service worker.",
    "Go to a public place and stay off your phone for 10 minutes.",
    "Make someone laugh today.",
    "Initiate a conversation in a queue/line.",
    "Attend a social event you normally wouldn't.",
    "Call a friend you haven't spoken to in a while.",
    "Practice saying 'No' politely to a request.",
    "Wear an outfit that makes you feel bold.",
    "Ask a 'deep' question to a friend.",
    "Hold a door open and start a brief chat.",
    "Introduce two people who don't know each other.",
    "Smile at 5 people on your commute.",
    "Ask for a small favor (e.g., 'watch my bag for a sec').",
    "Go to a movie or café alone.",
    "Strike up a chat with a taxi/Uber driver.",
    "Practice speaking slower than usual.",
    "Use a new vocabulary word in conversation.",
    "Retell a story but focus on emotions, not facts.",
    "Meditate on social confidence for 10 minutes.",
    "Write down 3 things you like about yourself socially.",
    "Practice your 'resting face' in the mirror to look friendly.",
    "Don't complain about anything for 24 hours.",
    "Ask someone 'What's the highlight of your week?'"
  ];

  for (let i = 8; i <= 31; i++) {
    const challengeIndex = (i - 8) % challenges.length;
    add(i, `Day ${i} Challenge`, '1 Day', 'Challenge', challenges[challengeIndex]);
    add(i, `Daily Tip #${i}`, '1 min', 'Wisdom', 'Consistency is key. Even a small interaction counts as a win. Keep your streak alive!');
    add(i, `Reflection #${i}`, '5 min', 'Journal', 'Write down how you felt during your interactions today. What went well? What scared you?');
    add(i, `Body Language Check`, '2 min', 'Self-Awareness', 'Are your shoulders back? Is your chin up? Check your posture 3 times today.');
    add(i, `Social Battery`, 'N/A', 'Health', 'If you are tired, rest. Social skills are like muscles, they need recovery time too.');
  }

  return lessons;
};

const ALL_LESSONS = generateLessons();

const ConfidenceCoach: React.FC<CoachProps> = ({ currentDay, readLessons, onLessonRead, onAdvanceDay, onReset }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [timeUntilNextDay, setTimeUntilNextDay] = useState<string>('');

  useEffect(() => {
    // Check for day updates every minute
    const interval = setInterval(() => {
      // Logic to show countdown or trigger day update if app is left open
      const savedStart = localStorage.getItem('boldtalk_start_date');
      if (savedStart) {
        const start = parseInt(savedStart);
        const now = Date.now();
        const diff = now - start;
        const msPerDay = 1000 * 60 * 60 * 24;
        
        // If we crossed a 24h boundary since last calculation
        const calculatedDay = Math.floor(diff / msPerDay) + 1;
        if (calculatedDay > currentDay) {
          // This will trigger the parent's update logic next render cycle effectively
          window.location.reload(); // Simple reload to sync everything for now, or use callback
        }

        // Countdown string
        const nextDayStart = start + (currentDay * msPerDay);
        const msLeft = nextDayStart - now;
        if (msLeft > 0) {
           const h = Math.floor(msLeft / (1000 * 60 * 60));
           const m = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
           setTimeUntilNextDay(`${h}h ${m}m`);
        } else {
           setTimeUntilNextDay('Ready!');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentDay]);

  const handleToggle = (id: string, isLocked: boolean) => {
    if (isLocked) return;
    setExpandedId(expandedId === id ? null : id);
    if (!readLessons.has(id)) {
      onLessonRead(id);
    }
  };

  // Group lessons by Day
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto px-4 pt-4 custom-scrollbar">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <BookOpen className="text-neonPink w-5 h-5" /> 
            31-Day Confidence Plan
          </h2>
          <p className="text-gray-400 text-sm">5 new lessons unlock every 24 hours</p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-darkSurface border border-white/10 px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4 text-electricBlue" />
              <span className="text-white font-bold text-sm">Current Day: {currentDay}</span>
          </div>
        </div>

        <div className="space-y-8">
          {daysArray.map((dayNum) => {
              const isFuture = dayNum > currentDay;
              const dayLessons = ALL_LESSONS.filter(l => l.day === dayNum);
              const daysUntil = dayNum - currentDay;
              
              return (
                  <div key={dayNum} className={`relative ${isFuture ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                          <div className={`h-px flex-1 ${isFuture ? 'bg-gray-800' : 'bg-gradient-to-r from-transparent to-electricBlue'}`}></div>
                          <span className={`text-sm font-bold uppercase tracking-widest ${isFuture ? 'text-gray-600' : 'text-electricBlue'}`}>
                              Day {dayNum}
                          </span>
                          <div className={`h-px flex-1 ${isFuture ? 'bg-gray-800' : 'bg-gradient-to-l from-transparent to-electricBlue'}`}></div>
                      </div>

                      <div className="space-y-3">
                          {dayLessons.map((lesson) => (
                              <div 
                                  key={lesson.id} 
                                  className={`bg-darkSurface border rounded-xl overflow-hidden transition-all ${
                                      isFuture 
                                      ? 'border-white/5 cursor-not-allowed' 
                                      : 'border-white/5 hover:border-neonPink/30'
                                  }`}
                              >
                              <button 
                                  onClick={() => handleToggle(lesson.id, isFuture)}
                                  className={`w-full flex items-center justify-between p-4 text-left ${isFuture ? 'cursor-not-allowed' : ''}`}
                              >
                                  <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                      isFuture ? 'bg-white/5 text-gray-600' :
                                      readLessons.has(lesson.id) ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-neonPink'
                                  }`}>
                                      {isFuture ? <Lock className="w-5 h-5"/> : (readLessons.has(lesson.id) ? <CheckCircle className="w-5 h-5"/> : <PlayCircle className="w-5 h-5" />)}
                                  </div>
                                  <div className="min-w-0">
                                      <h3 className={`font-bold truncate ${isFuture ? 'text-gray-500' : 'text-white'}`}>{lesson.title}</h3>
                                      <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                      <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {lesson.duration}
                                      </span>
                                      <span className={`bg-white/5 px-2 py-0.5 rounded ${isFuture ? 'text-gray-600' : 'text-electricBlue'}`}>
                                          {lesson.category}
                                      </span>
                                      </div>
                                  </div>
                                  </div>
                                  {!isFuture && (
                                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === lesson.id ? 'rotate-180' : ''}`} />
                                  )}
                              </button>
                              
                              {expandedId === lesson.id && !isFuture && (
                                  <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                                  <p className="text-gray-300 leading-relaxed text-sm">
                                      {lesson.content}
                                  </p>
                                  <div className="mt-4 flex justify-end">
                                      <span className="text-xs text-green-400 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> +100 XP
                                      </span>
                                  </div>
                                  </div>
                              )}
                              </div>
                          ))}
                      </div>
                      {isFuture && (
                           <div className="absolute inset-0 z-10 flex items-center justify-center">
                              <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                                  <Lock className="w-4 h-4 text-gray-400"/>
                                  <span className="text-xs font-bold text-gray-400">
                                      {daysUntil === 1 ? `Unlocks in ${timeUntilNextDay || '24h'}` : `Available in ${daysUntil} days`}
                                  </span>
                              </div>
                           </div>
                      )}
                  </div>
              );
          })}
        </div>

        {/* Debug Tools */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <button 
              onClick={() => setDebugMode(!debugMode)}
              className="text-[10px] text-gray-600 uppercase hover:text-gray-400"
          >
              {debugMode ? 'Hide Debug Tools' : 'Developer Options'}
          </button>
          
          {debugMode && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                  <button 
                      onClick={onAdvanceDay}
                      className="bg-white/5 text-xs text-electricBlue py-2 rounded hover:bg-white/10 flex items-center justify-center gap-1"
                  >
                      <Zap className="w-3 h-3" /> Fast Forward 24h
                  </button>
                  <button 
                      onClick={onReset}
                      className="bg-white/5 text-xs text-red-400 py-2 rounded hover:bg-white/10"
                  >
                      Reset Progress
                  </button>
              </div>
          )}
        </div>
        
        {/* Padding for visual comfort at bottom of list */}
        <div className="h-4"></div>
      </div>

      {/* Spacer for Fixed Navigation (approx 96px) so scrollbar stops above it */}
      <div className="h-24 shrink-0 pointer-events-none"></div>
    </div>
  );
};

export default ConfidenceCoach;