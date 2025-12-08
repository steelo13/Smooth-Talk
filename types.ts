
export enum Tone {
  FUN_PLAYFUL = 'Fun & Playful',
  CONFIDENT = 'Confident',
  SHY_SWEET = 'Shy but Sweet',
  SMOOTH_CHARMING = 'Smooth & Charming',
  FRIENDLY = 'Non-Flirty / Friendly',
  PROFESSIONAL = 'Professional & Respectful',
}

export interface AnalysisResult {
  vibe: string;
  lines: string[];
  dmDraft: string;
  socialComment: string;
  advice: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  category: string;
  day: number;
}
