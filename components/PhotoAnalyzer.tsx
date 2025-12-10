import React, { useState, useRef } from 'react';
import { Tone, AnalysisResult } from '../types';
import { analyzePhoto } from '../services/geminiService';
import { Camera, RefreshCw, Copy, Check, Sparkles, MessageCircle, Heart, Lock, Loader2, Link as LinkIcon, ArrowRight } from 'lucide-react';

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

// Image compression utility
const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize to max 1024px dimension to save memory and tokens
        const MAX_SIZE = 1024;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// URL Processing Utility
const processImageUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Essential for Canvas export if the server supports CORS
    img.crossOrigin = 'Anonymous'; 
    img.src = url;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize logic (Same as processImage)
        const MAX_SIZE = 1024;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (e) {
        // This usually happens due to strict CORS (Tainted Canvas)
        reject(new Error("Security prevented loading this image. The website hosting it doesn't allow external access. Try saving it to your device first."));
      }
    };
    
    img.onerror = () => {
      reject(new Error("Could not load image. Check the URL or try a different one."));
    };
  });
};

const PhotoAnalyzer: React.FC<PhotoAnalyzerProps> = ({ onXpGain, userLevel }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>(Tone.FUN_PLAYFUL);
  const [loading, setLoading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProcessingImage(true);
      try {
        const compressedImage = await processImage(file);
        setSelectedImage(compressedImage);
        setResult(null); // Reset results on new image
        setUrlInput(''); // Clear URL input
      } catch (error) {
        console.error("Image processing failed:", error);
        alert("Could not load image. Please try a different photo.");
      } finally {
        setProcessingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
      }
    }
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    
    setProcessingImage(true);
    try {
      const processedImage = await processImageUrl(urlInput);
      setSelectedImage(processedImage);
      setResult(null);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessingImage(false);
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
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <MessageCircle className="text-neonPink w-6 h-6" /> 
          Smooth Talker
        </h2>
        <p className="text-gray-400 text-sm px-4 leading-relaxed font-medium">
          <span className="text-white font-bold block mb-1 bg-white/10 py-1 rounded">Too shy to message first?</span> 
          Upload a photo of them or a screenshot from social media and get 10 AI-made conversation starters based on their looks and vibe.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-darkSurface border border-white/10 rounded-2xl p-4 mb-6 relative overflow-hidden group transition-all hover:border-electricBlue/50 mt-2">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
        
        {processingImage ? (
           <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-xl bg-black/50">
             <Loader2 className="w-10 h-10 text-electricBlue animate-spin mb-3" />
             <p className="text-gray-300 font-medium">Processing Image...</p>
           </div>
        ) : !selectedImage ? (
          <div className="flex flex-col gap-4">
            {/* File Upload Trigger */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
            >
              <Camera className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-300 font-medium">Tap to upload photo</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP</p>
            </div>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-darkSurface px-2 text-gray-500 font-bold">Or Paste URL</span>
                </div>
            </div>

            {/* URL Input */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <LinkIcon className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:border-electricBlue focus:outline-none transition-colors placeholder:text-gray-600"
                    />
                </div>
                <button 
                    onClick={handleUrlLoad}
                    disabled={!urlInput.trim()}
                    className="bg-white/10 text-white px-4 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
          </div>
        ) : (
          <div className="relative h-96 w-full rounded-xl overflow-hidden bg-black">
             <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
             <button 
                onClick={() => { setSelectedImage(null); setResult(null); setUrlInput(''); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
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