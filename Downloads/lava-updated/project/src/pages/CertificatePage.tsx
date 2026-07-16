import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Download, Flame, UserCheck, Target } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useAssessment } from '../context/AssessmentContext';
import { computeFinalScores, generateHiringReport } from '../lib/finalScore';
import { getPositionByLabel } from '../lib/positionBank';

export function CertificatePage() {
  const navigate = useNavigate();
  const { candidate, assessment, moduleScores } = useAssessment();

  if (!candidate || !assessment) return null;

  const { scores, englishLevel } = computeFinalScores(moduleScores);
  const hiringReport = generateHiringReport(moduleScores, candidate.position);
  const position = getPositionByLabel(candidate.position);
  const certId = `LAVA-${assessment.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(assessment.completed_at ?? Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const qrUrl = `https://api.qrserver.com/api/create/qr-code/?size=120x120&data=LAVA-CERT-${certId}`;
  const roleReadyColor = hiringReport.roleReadiness >= 75 ? '#16a34a' : hiringReport.roleReadiness >= 60 ? '#ea580c' : '#dc2626';

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}><Download size={16} /> Download PDF</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/report')}><ArrowLeft size={16} /> Back to Report</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white rounded-3xl shadow-elevated overflow-hidden"
          style={{ aspectRatio: '1.414 / 1' }}
        >
          {/* Border frame */}
          <div className="absolute inset-4 border-4 border-lava-700 rounded-2xl" />
          <div className="absolute inset-6 border border-lava-300 rounded-xl" />

          {/* Decorative corners */}
          <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-lava-700 rounded-tl-xl" />
          <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-lava-700 rounded-tr-xl" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-lava-700 rounded-bl-xl" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-lava-700 rounded-br-xl" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Flame size={400} className="text-lava-900" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-16 text-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl gradient-lava flex items-center justify-center">
                <Flame size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-display text-2xl font-bold text-ink-800">LAVA</p>
                <p className="text-[10px] text-ink-500 uppercase tracking-widest">Communication Skills Simulator</p>
              </div>
            </div>

            <p className="text-xs text-ink-500 uppercase tracking-[0.3em] mb-2">Certificate of Achievement</p>
            <p className="text-sm text-ink-600 mb-1">This certifies that</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-lava-800 mb-3" style={{ fontFamily: 'Sora, serif' }}>
              {candidate.first_name} {candidate.last_name}
            </h1>
            <p className="text-sm text-ink-600 max-w-md mb-4">
              has successfully completed the LAVA Communication Skills Assessment
              for the position of <strong>{candidate.position}</strong>
            </p>

            {/* Hiring recommendation badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: `${roleReadyColor}15` }}>
              <UserCheck size={14} style={{ color: roleReadyColor }} />
              <span className="text-xs font-semibold" style={{ color: roleReadyColor }}>{hiringReport.hiringRecommendation}</span>
            </div>

            {/* Score row */}
            <div className="flex items-center gap-6 mb-5">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-lava-700">{scores.overall_score}</p>
                <p className="text-xs text-ink-500 uppercase tracking-wide">Overall Score</p>
              </div>
              <div className="w-px h-12 bg-ink-200" />
              <div className="text-center">
                <p className="font-display text-lg font-bold text-ink-800">{englishLevel}</p>
                <p className="text-xs text-ink-500 uppercase tracking-wide">English Level</p>
              </div>
              <div className="w-px h-12 bg-ink-200" />
              <div className="text-center">
                <p className="font-display text-lg font-bold text-ink-800">{scores.communication_score}</p>
                <p className="text-xs text-ink-500 uppercase tracking-wide">Communication</p>
              </div>
              <div className="w-px h-12 bg-ink-200" />
              <div className="text-center">
                <p className="font-display text-3xl font-bold" style={{ color: roleReadyColor }}>{hiringReport.roleReadiness}%</p>
                <p className="text-xs text-ink-500 uppercase tracking-wide">Role Ready</p>
              </div>
            </div>

            {/* Key competencies */}
            {position && position.keyCompetencies.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-5 max-w-lg">
                {position.keyCompetencies.slice(0, 5).map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-lava-50 text-lava-700 border border-lava-200">{c}</span>
                ))}
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-end justify-between w-full max-w-2xl mt-auto">
              <div className="text-left">
                <p className="text-xs text-ink-500 mb-1">Date of Completion</p>
                <p className="text-sm font-semibold text-ink-800">{date}</p>
                <div className="mt-4 w-40 border-t-2 border-ink-400 pt-1">
                  <p className="text-xs font-semibold text-ink-700">LAVA Assessment Board</p>
                  <p className="text-[10px] text-ink-500">Authorized Signatory</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <img src={qrUrl} alt="Verification QR" className="w-24 h-24 rounded-lg" />
                <p className="text-[10px] text-ink-500 mt-1">Scan to verify</p>
                <p className="text-xs font-mono text-ink-600 mt-0.5">{certId}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  <Target size={16} className="text-lava-700" />
                  <p className="text-xs font-semibold text-ink-700">{hiringReport.roleReadiness}% Role Ready</p>
                </div>
                <p className="text-xs text-ink-500 mb-1">Verification ID</p>
                <p className="text-xs font-mono text-ink-700">{certId}</p>
                <div className="mt-4 w-40 border-t-2 border-ink-400 pt-1 ml-auto">
                  <p className="text-xs font-semibold text-ink-700">Certified AI Trainer</p>
                  <p className="text-[10px] text-ink-500">LAVA Assessment Engine</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center gap-3 mt-6">
          <Button onClick={() => window.print()}><Download size={18} /> Download PDF</Button>
          <Button variant="secondary" onClick={() => navigate('/report')}><Award size={18} /> Back to Report</Button>
        </div>
      </main>
    </div>
  );
}
