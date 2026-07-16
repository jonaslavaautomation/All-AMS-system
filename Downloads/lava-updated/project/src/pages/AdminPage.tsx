import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, FileText, FileSpreadsheet, FileJson,
  Users, TrendingUp, Award, Eye, X, ShieldCheck, Lock,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { POSITIONS, type Assessment, type Candidate } from '../types';

interface CandidateRow {
  candidate: Candidate;
  assessment: Assessment | null;
}

export function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [rows, setRows] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortScore, setSortScore] = useState<'desc' | 'asc' | null>('desc');
  const [selected, setSelected] = useState<CandidateRow | null>(null);

  const ADMIN_CODE = (import.meta.env.VITE_ADMIN_CODE as string) || 'lava-admin-2026';

  const tryAuth = () => {
    if (code === ADMIN_CODE) setAuthed(true);
  };

  useEffect(() => {
    if (!authed) return;
    loadData();
  }, [authed]);

  const loadData = async () => {
    setLoading(true);
    const { data: candidates } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
    const { data: assessments } = await supabase.from('assessments').select('*');
    const aMap = new Map((assessments ?? []).map(a => [a.candidate_id, a]));
    const combined: CandidateRow[] = (candidates ?? []).map(c => ({ candidate: c as Candidate, assessment: (aMap.get(c.id) ?? null) as Assessment | null }));
    setRows(combined);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let r = rows;
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(row => `${row.candidate.first_name} ${row.candidate.last_name}`.toLowerCase().includes(s) || (row.candidate.email ?? '').toLowerCase().includes(s));
    }
    if (filterPosition) r = r.filter(row => row.candidate.position === filterPosition);
    if (filterDate) {
      const d = new Date(filterDate);
      r = r.filter(row => new Date(row.candidate.created_at) >= d);
    }
    if (sortScore) {
      r = [...r].sort((a, b) => {
        const sa = a.assessment?.overall_score ?? 0;
        const sb = b.assessment?.overall_score ?? 0;
        return sortScore === 'desc' ? sb - sa : sa - sb;
      });
    }
    return r;
  }, [rows, search, filterPosition, filterDate, sortScore]);

  const completedCount = rows.filter(r => r.assessment?.status === 'completed').length;
  const avgScore = rows.filter(r => r.assessment?.overall_score).reduce((a, r) => a + (r.assessment!.overall_score), 0) / Math.max(completedCount, 1);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Position', 'Status', 'Overall Score', 'English Level', 'Completed At'];
    const lines = filtered.map(r => [
      `${r.candidate.first_name} ${r.candidate.last_name}`,
      r.candidate.email ?? '—',
      r.candidate.position,
      r.assessment?.status ?? 'not started',
      r.assessment?.overall_score?.toString() ?? '',
      r.assessment?.english_level ?? '',
      r.assessment?.completed_at ? new Date(r.assessment.completed_at).toISOString() : '',
    ]);
    const csv = [headers, ...lines].map(l => l.map(c => `"${c}"`).join(',')).join('\n');
    downloadFile(csv, 'lava-candidates.csv', 'text/csv');
  };

  const exportJSON = () => {
    const data = JSON.stringify(filtered, null, 2);
    downloadFile(data, 'lava-candidates.json', 'application/json');
  };

  const exportPDF = () => {
    window.print();
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-ink-100 dark:bg-ink-950 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-8 max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-lava flex items-center justify-center mb-3">
              <Lock size={26} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-800 dark:text-ink-100">Admin Access</h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Enter the admin access code to continue.</p>
          </div>
          <input
            type="password"
            className="input-field mb-3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryAuth()}
            placeholder="Admin access code"
          />
          <p className="text-xs text-ink-400 mb-4">Hint: lava-admin-2026</p>
          <Button onClick={tryAuth} className="w-full" size="lg">Unlock Dashboard</Button>
          <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/')}><ArrowLeft size={16} /> Back to Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="badge bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400"><ShieldCheck size={12} /> Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={16} /> Exit</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Candidates', value: rows.length, color: 'text-lava-600' },
            { icon: Award, label: 'Completed', value: completedCount, color: 'text-green-600' },
            { icon: TrendingUp, label: 'Avg Score', value: avgScore ? Math.round(avgScore) : 0, color: 'text-amber-600' },
            { icon: TrendingUp, label: 'In Progress', value: rows.length - completedCount, color: 'text-blue-600' },
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

        {/* Toolbar */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input-field pl-10" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-ink-400" />
              <select className="input-field py-2 w-auto" value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}>
                <option value="">All Positions</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="date" className="input-field py-2 w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
              <select className="input-field py-2 w-auto" value={sortScore ?? ''} onChange={(e) => setSortScore(e.target.value as any)}>
                <option value="">No Sort</option>
                <option value="desc">Score: High to Low</option>
                <option value="asc">Score: Low to High</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Button variant="secondary" size="sm" onClick={exportCSV}><FileSpreadsheet size={14} /> CSV</Button>
              <Button variant="secondary" size="sm" onClick={exportJSON}><FileJson size={14} /> JSON</Button>
              <Button variant="secondary" size="sm" onClick={exportPDF}><FileText size={14} /> PDF</Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 dark:bg-ink-800/50 text-left text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">No candidates found.</td></tr>
                ) : filtered.map((row) => (
                  <tr key={row.candidate.id} className="border-t border-ink-100 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-800/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-800 dark:text-ink-100">{row.candidate.first_name} {row.candidate.last_name}</p>
                      <p className="text-xs text-ink-500">{row.candidate.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{row.candidate.position}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${row.assessment?.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                        {row.assessment?.status ?? 'not started'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-display font-bold text-ink-800 dark:text-ink-100">{row.assessment?.overall_score ? Math.round(row.assessment.overall_score) : '—'}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{row.assessment?.english_level ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-ink-500">{new Date(row.candidate.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(row)}><Eye size={14} /> View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-elevated p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-ink-800 dark:text-ink-100">Candidate Details</h3>
              <button onClick={() => setSelected(null)} className="btn-ghost"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-ink-500">Name</p><p className="font-semibold text-ink-800 dark:text-ink-100">{selected.candidate.first_name} {selected.candidate.last_name}</p></div>
              <div><p className="text-xs text-ink-500">Email</p><p className="text-ink-700 dark:text-ink-200">{selected.candidate.email ?? '—'}</p></div>
              <div><p className="text-xs text-ink-500">Position</p><p className="text-ink-700 dark:text-ink-200">{selected.candidate.position}</p></div>
              <div><p className="text-xs text-ink-500">Registered</p><p className="text-ink-700 dark:text-ink-200">{new Date(selected.candidate.created_at).toLocaleString()}</p></div>
              {selected.assessment ? (
                <>
                  <div><p className="text-xs text-ink-500">Status</p><p className="text-ink-700 dark:text-ink-200">{selected.assessment.status}</p></div>
                  <div><p className="text-xs text-ink-500">Overall Score</p><p className="font-display text-2xl font-bold text-lava-700">{Math.round(selected.assessment.overall_score)}/100</p></div>
                  <div><p className="text-xs text-ink-500">English Level</p><p className="text-ink-700 dark:text-ink-200">{selected.assessment.english_level ?? '—'}</p></div>
                  <div><p className="text-xs text-ink-500">Current Module</p><p className="text-ink-700 dark:text-ink-200">Module {selected.assessment.current_module}</p></div>
                  {selected.assessment.recommendation && (
                    <div className="p-3 rounded-xl bg-lava-50 dark:bg-lava-950/30">
                      <p className="text-xs text-ink-500 mb-1">Recommendation</p>
                      <p className="text-sm text-ink-700 dark:text-ink-200">{selected.assessment.recommendation}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-ink-400">No assessment started yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
