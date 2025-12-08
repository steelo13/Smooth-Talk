import React from 'react';

interface AdUnitProps {
  slotId: string;
  format?: 'banner' | 'rectangle'; // banner = 320x50/100, rectangle = 300x250
  className?: string;
}

// CONFIGURATION:
// Set this to true to see where ads will be.
// Set to false to hide them until you are ready to integrate.
const SHOW_PLACEHOLDERS = true;

const AdUnit: React.FC<AdUnitProps> = ({ slotId, format = 'banner', className = '' }) => {
  if (!SHOW_PLACEHOLDERS) return null;

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <div 
        className={`
          relative overflow-hidden bg-black/20 border border-white/5 border-dashed rounded-lg
          flex flex-col items-center justify-center text-center
          ${format === 'banner' ? 'w-full max-w-[320px] h-[50px]' : 'w-full max-w-[300px] h-[250px]'}
        `}
      >
        <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          AD SPACE
        </span>
        <span className="text-[9px] text-gray-700 font-mono">
          {slotId}
        </span>
        
        {/* 
           INTEGRATION NOTE:
           When ready, replace this div with your AdMob/AdSense/Network code.
           Example:
           <ins className="adsbygoogle" ... />
        */}
      </div>
    </div>
  );
};

export default AdUnit;