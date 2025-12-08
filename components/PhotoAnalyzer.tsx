import React, { useState, useRef } from 'react';
import { Tone, AnalysisResult } from '../types';
import { analyzePhoto } from '../services/geminiService';
import { Camera, RefreshCw, Copy, Check, Sparkles, MessageCircle, Heart, Lock } from 'lucide-react';
import AdUnit from './AdUnit';

interface PhotoAnalyzerProps {
  onXpGain: (amount: number) => void;
  userLevel: number;
}

const TONE_UNLOCKS: Record<Tone, number> = {
  [Tone.FUN_PLAYFUL]: 1,
  [Tone.FRIENDLY]: 1,
  [Tone.SHY_SWEET]: 2,
  [Tone.CONFIDENT]: 3,
  [Tone.SMOOTH_CHARMING]: 4,
  [Tone.PROFESSIONAL]: 5,
};

const PhotoAnalyzer: React.FC<PhotoAnalyzerProps> = ({ onXpGain, userLevel }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>(Tone.FUN_PLAYFUL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null); // Reset results on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const data = await analyzePhoto(selectedImage, tone);
      setResult(data);
      onXpGain(50); // Award XP
    } catch (err) {
      alert("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-4 pt-4 custom-scrollbar">
      
      {/* Header */}
      <div className="mb-2 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <MessageCircle className="text-neonPink w-6 h-6" /> 
          Smooth Talker
        </h2>
        <p className="text-gray-400 text-sm px-4 leading-relaxed font-medium">
          <span className="text-white font-bold block mb-1 bg-white/10 py-1 rounded">Too shy to message first?</span> 
          Upload a photo of them or a screenshot from social media and get 10 AI-made conversation starters based on their looks and vibe.
        </p>
      </div>

      {/* Ad Slot: Top Banner */}
      <AdUnit slotId="analyzer_top_banner" />

      {/* Upload Section */}
      <div className="bg-darkSurface border border-white/10 rounded-2xl p-4 mb-6 relative overflow-hidden group transition-all hover:border-electricBlue/50 mt-2">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
        
        {!selectedImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
          >
            <Camera className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-300 font-medium">Tap to upload photo</p>
            <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG</p>
          </div>
        ) : (
          <div className="relative h-96 w-full rounded-xl overflow-hidden bg-black">
             <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
             <button 
                onClick={() => { setSelectedImage(null); setResult(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors"
             >
               <RefreshCw className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>

      {/* Controls */}
      {selectedImage && !result && (
        <div className="animate-fade-in-up">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Vibe & Tone</label>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {Object.values(Tone).map((t) => {
              const isLocked = userLevel < TONE_UNLOCKS[t];
              return (
                <button
                  key={t}
                  disabled={isLocked}
                  onClick={() => setTone(t)}
                  className={`relative p-3 rounded-lg text-sm font-medium transition-all text-left overflow-hidden ${
                    isLocked ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' :
                    tone === t 
                    ? 'bg-electricBlue text-white shadow-[0_0_15px_rgba(18,154,203,0.4)]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="relative z-10">{t}</span>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-xs text-gray-400">
                        <Lock className="w-3 h-3" /> Lvl {TONE_UNLOCKS[t]}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              loading 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-neonPink to-purple-600 hover:shadow-[0_0_20px_rgba(255,79,207,0.4)] hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Analyzing Vibe...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Magic
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Vibe Analysis */}
          <div className="bg-gradient-to-r from-midnight to-purple-900 border border-purple-500/30 p-4 rounded-xl">
            <h3 className="text-neonPink font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Vibe Detected
            </h3>
            <p className="text-white text-lg font-light leading-relaxed">"{result.vibe}"</p>
            <p className="text-gray-400 text-xs mt-2 italic border-l-2 border-gray-600 pl-2">
              Coach Advice: {result.advice}
            </p>
          </div>

          {/* Drafts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-darkSurface p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-electricBlue uppercase">DM Draft</span>
                    <button onClick={() => copyToClipboard(result.dmDraft, 998)} className="text-gray-400 hover:text-white">
                        {copiedIndex === 998 ? <Check className="w-4 h-4 text-green-400"/> : <Copy className="w-4 h-4"/>}
                    </button>
                </div>
                <p className="text-sm text-gray-300">{result.dmDraft}</p>
             </div>
             <div className="bg-darkSurface p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-pink-500 uppercase">Social Comment</span>
                    <button onClick={() => copyToClipboard(result.socialComment, 999)} className="text-gray-400 hover:text-white">
                         {copiedIndex === 999 ? <Check className="w-4 h-4 text-green-400"/> : <Copy className="w-4 h-4"/>}
                    </button>
                </div>
                <p className="text-sm text-gray-300">{result.socialComment}</p>
             </div>
          </div>

          {/* Lines List */}
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-electricBlue" /> Top 10 Openers
            </h3>
            <div className="space-y-3">
              {result.lines.map((line, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex justify-between items-center group transition-all"
                >
                  <p className="text-gray-200 font-medium pr-4">{line}</p>
                  <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => copyToClipboard(line, idx)}
                      className="p-2 bg-black/40 rounded-full hover:bg-electricBlue hover:text-white transition-colors"
                    >
                      {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button className="p-2 bg-black/40 rounded-full hover:bg-neonPink hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Slot: Bottom Result */}
          <AdUnit slotId="analyzer_results_bottom" />

          <button 
             onClick={() => setResult(null)}
             className="w-full py-3 bg-white/5 text-gray-400 rounded-xl hover:text-white transition-colors"
          >
            Analyze Another Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoAnalyzer;