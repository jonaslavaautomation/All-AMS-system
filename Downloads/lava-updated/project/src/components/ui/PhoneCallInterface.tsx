import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, RotateCw } from 'lucide-react';

interface PhoneCallProps {
  callerName: string;
  callerCompany: string;
  scenarioName: string;
  onAnswer: () => void;
  onDecline: () => void;
  isActive: boolean;
  duration: number;
  onMute: () => void;
  onEndCall: () => void;
  isPlaying: boolean;
  onReplay: () => void;
  replaysLeft: number;
  children?: React.ReactNode;
}

export function PhoneCallInterface({
  callerName, callerCompany, scenarioName,
  onAnswer, onDecline, isActive, duration,
  onMute, onEndCall, isPlaying, onReplay, replaysLeft,
  children,
}: PhoneCallProps) {
  const [muted, setMuted] = useState(false);
  const [showIncoming, setShowIncoming] = useState(!isActive);

  useEffect(() => {
    if (isActive && showIncoming) setShowIncoming(false);
  }, [isActive]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMute = () => {
    setMuted(!muted);
    onMute();
  };

  if (showIncoming) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-md"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 rounded-full gradient-lava flex items-center justify-center shadow-2xl"
          >
            <Phone size={40} className="text-white" />
          </motion.div>
          <p className="text-white text-xs uppercase tracking-widest mb-1">Incoming Call</p>
          <p className="text-white text-2xl font-display font-bold mb-1">{callerName}</p>
          <p className="text-ink-400 text-sm mb-1">{callerCompany}</p>
          <p className="text-lava-400 text-xs mb-8">{scenarioName}</p>

          <div className="flex items-center justify-center gap-12">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setShowIncoming(false); onDecline(); }}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors"
            >
              <PhoneOff size={24} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              onClick={() => { setShowIncoming(false); onAnswer(); }}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg hover:bg-green-700 transition-colors"
            >
              <Phone size={24} />
            </motion.button>
          </div>
          <p className="text-ink-500 text-xs mt-4">Swipe or tap to answer</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden">
      {/* Call header */}
      <div className="bg-gradient-to-br from-ink-900 to-ink-800 dark:from-ink-950 dark:to-ink-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-lava flex items-center justify-center text-white">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{callerName}</p>
              <p className="text-ink-400 text-xs">{callerCompany}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono ${
              isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-ink-700 text-ink-300'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-ink-500'}`} />
              {isPlaying ? 'LIVE' : formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Call body */}
      <div className="bg-ink-50 dark:bg-ink-800/50 p-6">
        {children}

        {/* Call controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              muted ? 'bg-lava-700 text-white' : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-200 dark:border-ink-700'
            }`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {replaysLeft > 0 && (
            <button
              onClick={onReplay}
              className="w-12 h-12 rounded-full bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 border border-ink-200 dark:border-ink-700 flex items-center justify-center hover:border-lava-300 transition-colors"
              title={`Replay (${replaysLeft} left)`}
            >
              <RotateCw size={18} />
            </button>
          )}

          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
            title="End call"
          >
            <PhoneOff size={22} />
          </button>
        </div>

        {replaysLeft > 0 && (
          <p className="text-center text-xs text-ink-400 mt-3">{replaysLeft} replays remaining</p>
        )}
      </div>
    </div>
  );
}
