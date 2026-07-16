import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, Award, Download, TrendingUp, CheckCircle2, AlertCircle, Lightbulb, Sparkles, Flame,
  UserCheck, GraduationCap, Target, Brain,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { EmotionTimeline } from '../components/ui/EmotionTimeline';
import { useAssessment } from '../context/AssessmentContext';
import { computeFinalScores, generateHiringReport } from '../lib/finalScore';
import { summarizeEmotions, type EmotionSnapshot } from '../lib/emotionEngine';
import { getPositionByLabel } from '../lib/positionBank';
import { MODULES } from '../types';

export function ReportPage() {
  const navigate = useNavigate();
  const { candidate, assessment, moduleScores, completeAssessment } = useAssessment();

  const { scores, englishLevel, recommendation } = useMemo(() => computeFinalScores(moduleScores), [moduleScores]);
  const hiringReport = useMemo(() => candidate ? generateHiringReport(moduleScores, candidate.position) : null, [moduleScores, candidate]);

  // Collect emotion timeline from module details
  const emotionTimeline = useMemo(() => {
    return moduleScores.flatMap(m => (m.details.emotionSummary?.timeline ?? []) as EmotionSnapshot[]);
  }, [moduleScores]);
  const emotionSummary = useMemo(() => summarizeEmotions(emotionTimeline), [emotionTimeline]);

  const position = candidate ? getPositionByLabel(candidate.position) : null;

  useEffect(() => {
    if (candidate && assessment && moduleScores.length === MODULES.length && assessment.status !== 'completed') {
      completeAssessment(scores as any, englishLevel, recommendation);
    }
  }, [candidate, assessment, moduleScores]);

  if (!candidate || !assessment) return null;

  const radarData = [
    { subject: 'Listening', score: scores.listening_score },
    { subject: 'Pronunciation', score: scores.pronunciation_score },
    { subject: 'Grammar', score: scores.grammar_score },
    { subject: 'Vocabulary', score: scores.vocabulary_score },
    { subject: 'Communication', score: scores.communication_score },
    { subject: 'Customer Service', score: scores.customer_service_score },
    { subject: 'Cold Calling', score: scores.cold_calling_score },
    { subject: 'Insurance', score: scores.insurance_comm_score },
  ];

  const barData = MODULES.map((m) => {
    const ms = moduleScores.find(s => s.module_number === m.number);
    return { name: `M${m.number}`, score: ms ? Math.round(ms.score) : 0, label: m.name };
  });

  const scoreCards = [
    { label: 'Overall Score', value: scores.overall_score, color: '#8B0000' },
    { label: 'Communication', value: scores.communication_score, color: '#D32F2F' },
    { label: 'Listening', value: scores.listening_score, color: '#2563eb' },
    { label: 'Pronunciation', value: scores.pronunciation_score, color: '#16a34a' },
    { label: 'Grammar', value: scores.grammar_score, color: '#9333ea' },
    { label: 'Vocabulary', value: scores.vocabulary_score, color: '#0891b2' },
    { label: 'Customer Service', value: scores.customer_service_score, color: '#ea580c' },
    { label: 'Cold Calling', value: scores.cold_calling_score, color: '#ca8a04' },
    { label: 'Insurance Comm.', value: scores.insurance_comm_score, color: '#dc2626' },
  ];

  const allStrengths = moduleScores.flatMap(m => m.details.strengths ?? []).slice(0, 6);
  const allWeaknesses = moduleScores.flatMap(m => m.details.weaknesses ?? []).slice(0, 6);
  const allImprovements = moduleScores.flatMap(m => m.details.improvements ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/certificate')}><Award size={16} /> Certificate</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}><ArrowLeft size={16} /> Dashboard</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Hero score */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-lava-700/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400 text-xs font-semibold mb-3">
                <Sparkles size={12} /> HR Hiring Report
              </div>
              <h1 className="font-display text-3xl font-bold text-ink-800 dark:text-ink-100 mb-1">
                {candidate.first_name} {candidate.last_name}
              </h1>
              <p className="text-ink-500 dark:text-ink-400 mb-3">{candidate.position} • {new Date(assessment.completed_at ?? Date.now()).toLocaleDateString()}</p>
              <div className="flex flex-wrap gap-2">
                <span className="badge gradient-lava text-white"><Flame size={12} /> {englishLevel}</span>
                <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">7 Modules Completed</span>
                {hiringReport && (
                  <span className={`badge ${hiringReport.roleReadiness >= 75 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : hiringReport.roleReadiness >= 60 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                    <Target size={12} /> {hiringReport.roleReadiness}% Role Ready
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={scores.overall_score} size={160} strokeWidth={12} label={`${scores.overall_score}`} sublabel="Overall Score" />
              {hiringReport && (
                <ProgressRing value={hiringReport.roleReadiness} size={120} strokeWidth={10} label={`${hiringReport.roleReadiness}`} sublabel="Role Ready" color={hiringReport.roleReadiness >= 75 ? '#16a34a' : '#D32F2F'} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Hiring Recommendation Banner */}
        {hiringReport && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`card-elevated p-6 border-l-4 ${
            hiringReport.hiringRecommendation.startsWith('Ready') ? 'border-green-600' : 'border-amber-600'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                hiringReport.hiringRecommendation.startsWith('Ready') ? 'bg-green-600' : 'bg-amber-600'
              }`}>
                <UserCheck size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-ink-800 dark:text-ink-100 mb-1">Hiring Recommendation</h3>
                <p className="text-xl font-display font-bold text-ink-800 dark:text-ink-100 mb-2">
                  {hiringReport.hiringRecommendation.startsWith('Ready') ? '✔ ' : '⚠ '}
                  {hiringReport.hiringRecommendation}
                </p>
                <p className="text-ink-700 dark:text-ink-200">{hiringReport.recommendationText}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Score cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
          {scoreCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-3 text-center">
                <ProgressRing value={s.value} size={70} strokeWidth={6} label={`${s.value}`} color={s.color} />
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-1.5 truncate" title={s.label}>{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-lava-600" /> Skill Radar
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6e6e6e' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="score" stroke="#8B0000" fill="#8B0000" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e0e0e0', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-lava-600" /> Module Scores
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6e6e6e' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6e6e6e' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e0e0e0', fontSize: 12 }}
                  formatter={(v: any) => [`${v}/100`, 'Score']}
                  labelFormatter={(label: any) => barData.find(b => b.name === label)?.label ?? label}
                />
                <Bar dataKey="score" fill="#D32F2F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Emotion Timeline */}
        <EmotionTimeline summary={emotionSummary} />

        {/* HR Evaluation Details */}
        {hiringReport && (
          <Card className="p-6">
            <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
              <Brain size={18} className="text-lava-600" /> HR Evaluation Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'English Proficiency', value: hiringReport.englishProficiency },
                { label: 'Communication Level', value: hiringReport.communicationLevel },
                { label: 'Listening Ability', value: `${hiringReport.listeningAbility}/100` },
                { label: 'Pronunciation', value: `${hiringReport.pronunciation}/100` },
                { label: 'Confidence', value: `${hiringReport.confidence}/100` },
                { label: 'Grammar', value: `${hiringReport.grammar}/100` },
                { label: 'Vocabulary', value: `${hiringReport.vocabulary}/100` },
                { label: 'Professionalism', value: `${hiringReport.professionalism}/100` },
              ].map((d) => (
                <div key={d.label} className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                  <p className="text-xs text-ink-500 dark:text-ink-400">{d.label}</p>
                  <p className="font-display font-bold text-ink-800 dark:text-ink-100">{d.value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Strengths / Weaknesses / Improvements */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5">
            <h3 className="font-display font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 size={18} /> Strengths</h3>
            <ul className="space-y-2">
              {allStrengths.map((s, i) => <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2"><CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" /> {s}</li>)}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2"><AlertCircle size={18} /> Areas to Improve</h3>
            <ul className="space-y-2">
              {allWeaknesses.map((s, i) => <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2"><AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" /> {s}</li>)}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2"><Lightbulb size={18} /> Suggested Improvements</h3>
            <ul className="space-y-2">
              {allImprovements.map((s, i) => <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2"><Lightbulb size={14} className="text-amber-600 mt-0.5 shrink-0" /> {s}</li>)}
            </ul>
          </Card>
        </div>

        {/* Recommended Learning Path */}
        {hiringReport && hiringReport.recommendedLearningPath.length > 0 && (
          <Card className="p-6">
            <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-lava-600" /> Recommended Learning Path
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {hiringReport.recommendedLearningPath.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50"
                >
                  <div className="w-8 h-8 rounded-lg gradient-lava flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-ink-700 dark:text-ink-200 font-medium">{step}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Key Competencies for Position */}
        {position && (
          <Card className="p-6">
            <h3 className="font-display font-bold text-ink-800 dark:text-ink-100 mb-4 flex items-center gap-2">
              <Target size={18} className="text-lava-600" /> Key Competencies for {position.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {position.keyCompetencies.map((c) => (
                <span key={c} className="badge bg-lava-50 dark:bg-lava-950/40 text-lava-700 dark:text-lava-400">{c}</span>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pb-6">
          <Button onClick={() => navigate('/certificate')}><Award size={18} /> View Certificate</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download size={18} /> Download Report</Button>
          <Button variant="ghost" onClick={() => navigate('/leaderboard')}><TrendingUp size={18} /> View Leaderboard</Button>
        </div>
      </main>
    </div>
  );
}
