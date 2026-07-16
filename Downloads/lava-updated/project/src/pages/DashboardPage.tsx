import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Headphones, Mic, BookOpen, MessageCircle, Headset, PenLine, ShieldCheck,
  ArrowRight, Clock, TrendingUp, Award, LogOut, Moon, Sun, Trophy, CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Timer } from '../components/ui/Timer';
import { useTheme } from '../context/ThemeContext';
import { useAssessment } from '../context/AssessmentContext';
import { MODULES, type Badge } from '../types';
import { supabase } from '../lib/supabase';

const moduleIcons: Record<string, any> = {
  Headphones, Mic, BookOpen, MessageCircle, Headset, PenLine, ShieldCheck,
};

export function DashboardPage() {
  const { candidate, assessment, moduleScores, resetAssessment } = useAssessment();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (!candidate) return;
    supabase.from('badges').select('*').eq('candidate_id', candidate.id)
      .then(({ data }) => { if (data) setBadges(data as Badge[]); });
  }, [candidate]);

  if (!candidate || !assessment) return null;

  const completedModules = moduleScores.length;
  const progress = (completedModules / MODULES.length) * 100;
  const overall = moduleScores.reduce((a, m) => a + (m.score || 0), 0) / Math.max(completedModules, 1);
  const currentModule = MODULES.find((m) => m.number === assessment.current_module) ?? MODULES[0];
  const totalEst = MODULES.reduce((sum, m) => {
    const min = parseInt(m.estimated);
    return sum + min;
  }, 0);
  const completedEst = MODULES.slice(0, completedModules).reduce((sum, m) => sum + parseInt(m.estimated), 0);
  const remainingEst = totalEst - completedEst;

  const handleLogout = () => {
    resetAssessment();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      {/* Top bar */}
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/leaderboard')} className="btn-ghost text-sm"><Trophy size={16} /> Leaderboard</button>
            <button onClick={toggleTheme} className="btn-ghost" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button onClick={handleLogout} className="btn-ghost text-sm"><LogOut size={16} /> Exit</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-lava-700/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">Welcome back,</p>
              <h1 className="font-display text-3xl font-bold text-ink-800 dark:text-ink-100">
                {candidate.first_name} {candidate.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="badge bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400">{candidate.position}</span>
                <span className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
                  <Clock size={12} /> Started {new Date(assessment.started_at).toLocaleDateString()}
                </span>
                <Timer startAt={new Date(assessment.started_at).getTime()} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <ProgressRing value={progress} size={110} label={`${Math.round(progress)}%`} sublabel="Complete" />
              </div>
              <div className="text-center">
                <ProgressRing value={overall} size={110} label={Math.round(overall).toString()} sublabel="Current Score" color={overall >= 70 ? '#16a34a' : '#D32F2F'} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle2, label: 'Modules Completed', value: `${completedModules}/${MODULES.length}`, color: 'text-green-600' },
            { icon: Clock, label: 'Est. Time Remaining', value: `${remainingEst} min`, color: 'text-lava-600' },
            { icon: TrendingUp, label: 'Current Module', value: `M${currentModule.number}`, color: 'text-amber-600' },
            { icon: Award, label: 'Badges Earned', value: badges.length, color: 'text-purple-600' },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <s.icon size={20} className={s.color} />
                <div>
                  <p className="text-xs text-ink-500 dark:text-ink-400">{s.label}</p>
                  <p className="font-display text-xl font-bold text-ink-800 dark:text-ink-100">{s.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Current module CTA */}
        {assessment.status !== 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-lava-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-lava flex items-center justify-center text-white shrink-0">
                {(() => { const Icon = moduleIcons[currentModule.icon] ?? Headphones; return <Icon size={22} />; })()}
              </div>
              <div>
                <p className="text-xs text-lava-700 dark:text-lava-400 font-semibold uppercase tracking-wide">Up Next</p>
                <h3 className="font-display text-lg font-bold text-ink-800 dark:text-ink-100">Module {currentModule.number}: {currentModule.name}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400">Estimated time: {currentModule.estimated}</p>
              </div>
            </div>
            <Button onClick={() => navigate(`/module/${currentModule.number}`)} size="lg">
              {completedModules === 0 ? 'Begin Assessment' : 'Continue'} <ArrowRight size={18} />
            </Button>
          </motion.div>
        )}

        {assessment.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-green-600"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wide">Assessment Complete</p>
                <h3 className="font-display text-lg font-bold text-ink-800 dark:text-ink-100">Your final report is ready</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400">Overall score: {Math.round(assessment.overall_score)}/100 • {assessment.english_level}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/certificate')}>View Certificate</Button>
              <Button onClick={() => navigate('/report')}>View Report <ArrowRight size={18} /></Button>
            </div>
          </motion.div>
        )}

        {/* Modules list + sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="section-title mb-4">Assessment Modules</h2>
            <div className="space-y-3">
              {MODULES.map((m) => {
                const score = moduleScores.find((ms) => ms.module_number === m.number);
                const isCurrent = m.number === assessment.current_module && assessment.status !== 'completed';
                const isDone = !!score;
                const Icon = moduleIcons[m.icon] ?? Headphones;
                return (
                  <motion.div
                    key={m.number}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: m.number * 0.04 }}
                    className={`card p-4 flex items-center gap-4 hover:shadow-elevated transition-all cursor-pointer ${
                      isCurrent ? 'ring-2 ring-lava-500/40' : ''
                    }`}
                    onClick={() => isDone || isCurrent ? navigate(`/module/${m.number}`) : undefined}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : isCurrent ? 'gradient-lava text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-400'
                    }`}>
                      {isDone ? <CheckCircle2 size={18} /> : isCurrent ? <Icon size={18} /> : <Circle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-ink-400">M{m.number}</span>
                        <h4 className="font-semibold text-ink-800 dark:text-ink-100 text-sm truncate">{m.name}</h4>
                      </div>
                      <p className="text-xs text-ink-500 dark:text-ink-400">~{m.estimated}</p>
                    </div>
                    {isDone && (
                      <div className="text-right">
                        <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{Math.round(score!.score)}</p>
                        <p className="text-xs text-ink-400">/100</p>
                      </div>
                    )}
                    {(isDone || isCurrent) && <ArrowRight size={16} className="text-ink-400" />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
                <Award size={18} className="text-lava-600" /> Achievements
              </h3>
              {badges.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle size={24} className="mx-auto text-ink-300 mb-2" />
                  <p className="text-sm text-ink-500 dark:text-ink-400">No badges yet. Complete modules to earn achievements!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {badges.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                      <div className="w-8 h-8 rounded-lg gradient-lava flex items-center justify-center text-white text-xs font-bold">
                        {b.badge_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{b.badge_name}</p>
                        <p className="text-xs text-ink-500 dark:text-ink-400">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-lava-600" /> Assessment History
              </h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-3">This is your first assessment with LAVA.</p>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/practice')}>Practice Mode</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
