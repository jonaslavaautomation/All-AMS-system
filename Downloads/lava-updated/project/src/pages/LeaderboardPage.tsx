import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('leaderboard').select('*').order('overall_score', { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setEntries(data as LeaderboardEntry[]); setLoading(false); });
  }, []);

  const podiumIcons = [Crown, Medal, Medal];
  const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={16} /> Home</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400 text-xs font-semibold mb-3">
            <Trophy size={12} /> Global Leaderboard
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-800 dark:text-ink-100">Top Performers</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">The highest-scoring LAVA candidates worldwide.</p>
        </div>

        {/* Podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 items-end">
            {[1, 0, 2].map((idx) => {
              const e = entries[idx];
              const Icon = podiumIcons[idx];
              const height = idx === 0 ? 'h-32' : idx === 1 ? 'h-40' : 'h-24';
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`card p-4 text-center ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                  <Icon size={28} className={`mx-auto ${podiumColors[idx]} mb-2`} />
                  <p className="font-semibold text-sm text-ink-800 dark:text-ink-100 truncate">{e.candidate_name}</p>
                  <p className="text-xs text-ink-500">{e.position}</p>
                  <div className={`mt-3 rounded-xl gradient-lava flex items-center justify-center text-white font-display text-2xl font-bold ${height}`}>
                    {Math.round(e.overall_score)}
                  </div>
                  <p className="text-xs text-ink-500 mt-1">{e.english_level}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <Card className="overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-ink-400">Loading...</p>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy size={32} className="mx-auto text-ink-300 mb-2" />
              <p className="text-ink-500">No completed assessments yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {entries.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-4 p-4 hover:bg-ink-50 dark:hover:bg-ink-800/30">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                    i < 3 ? 'gradient-lava text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-800 dark:text-ink-100 truncate">{e.candidate_name}</p>
                    <p className="text-xs text-ink-500">{e.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg text-ink-800 dark:text-ink-100">{Math.round(e.overall_score)}</p>
                    <p className="text-xs text-ink-500">{e.english_level}</p>
                  </div>
                  <span className="text-xs text-ink-400 hidden sm:block">{new Date(e.completed_at).toLocaleDateString()}</span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
