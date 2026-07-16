import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Moon, Sun, Sparkles, AlertTriangle } from 'lucide-react';
import { speechRecognitionSupported } from '../lib/speech';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAssessment } from '../context/AssessmentContext';
import { POSITIONS } from '../types';
import { getPositionByLabel } from '../lib/positionBank';

export function LandingPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { startAssessment, loading } = useAssessment();
  const navigate = useNavigate();

  const micSupported = speechRecognitionSupported();
  const valid = firstName.trim() && lastName.trim() && position;
  const selectedPosition = position ? getPositionByLabel(position) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    try {
      await startAssessment({ firstName, lastName, position });
      navigate('/dashboard');
    } catch { /* shown via context error */ }
  };

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950 bg-grid relative overflow-hidden flex flex-col">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-lava-700/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lava-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/leaderboard')} className="btn-ghost text-sm">Leaderboard</button>
          <button onClick={() => navigate('/practice')} className="btn-ghost text-sm">Practice</button>
          <button onClick={() => navigate('/admin')} className="btn-ghost text-sm">Admin</button>
          <button onClick={toggleTheme} className="btn-ghost" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {!micSupported && (
        <div className="relative z-10 max-w-2xl mx-auto w-full px-6">
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              For an accurate assessment, please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on
              a desktop. This browser doesn&apos;t support live speech recognition, so spoken answers can&apos;t be scored reliably.
            </p>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400 text-xs font-semibold mb-5">
              <Sparkles size={14} />
              AI Communication Assessment
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-800 dark:text-ink-100 leading-tight mb-3">
              Master the language of <span className="text-gradient-lava">Virtual Assistance</span>
            </h1>
            <p className="text-base text-ink-600 dark:text-ink-300 max-w-lg mx-auto">
              AI-powered English communication assessment across seven professional modules. Get an HR-quality hiring report in 45 minutes.
            </p>
          </motion.div>

          {/* Registration card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="card-elevated p-8"
          >
            <h2 className="font-display text-xl font-bold text-ink-800 dark:text-ink-100 mb-1">Start your assessment</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">Enter your details to begin. Progress saves automatically.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">First Name</label>
                  <input
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Maria"
                  />
                  {touched && !firstName.trim() && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">Last Name</label>
                  <input
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Santos"
                  />
                  {touched && !lastName.trim() && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 mb-1.5">Position Applying For</label>
                <select
                  className="input-field"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <option value="">Select a position...</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {touched && !position && <p className="text-xs text-red-500 mt-1">Please select a position</p>}
              </div>

              {/* Position preview */}
              {selectedPosition && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl bg-lava-50 dark:bg-lava-950/30 p-3 space-y-2"
                >
                  <p className="text-xs font-semibold text-lava-700 dark:text-lava-400">{selectedPosition.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPosition.keyCompetencies.slice(0, 4).map((c) => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300">{c}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Starting...' : 'Start Assessment'}
                {!loading && <ArrowRight size={18} />}
              </Button>

              <p className="text-xs text-ink-400 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 size={12} />
                No account needed • Free to use
              </p>
            </form>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-ink-200 dark:border-ink-800 py-6 text-center text-xs text-ink-400">
        LAVA Communication Skills Simulator &middot; AI-Powered English Assessment Platform
      </footer>
    </div>
  );
}
