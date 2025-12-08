import React from 'react';
import { Camera, MessageCircle, BookOpen, User } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'generate', icon: Camera, label: 'Scan' },
    { id: 'lab', icon: MessageCircle, label: 'Practice' },
    { id: 'coach', icon: BookOpen, label: 'Coach' },
    { id: 'profile', icon: User, label: 'You' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-darkSurface/95 backdrop-blur-lg border-t border-white/10 pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 transition-all ${
                isActive ? 'text-neonPink -translate-y-1' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-neonPink/20' : ''}`}>
                <tab.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
