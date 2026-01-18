
import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw } from 'lucide-react';

export const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 font-mono text-xl font-bold text-blue-600">
        <TimerIcon size={20} />
        {formatTime(seconds)}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button 
          onClick={() => {setSeconds(0); setIsActive(false);}}
          className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
