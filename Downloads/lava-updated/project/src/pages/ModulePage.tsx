import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useAssessment } from '../context/AssessmentContext';
import { MODULES } from '../types';
import { ListeningModule } from '../modules/ListeningModule';
import { PronunciationModule } from '../modules/PronunciationModule';
import { ReadingModule } from '../modules/ReadingModule';
import { ConversationModule } from '../modules/ConversationModule';
import { RoleplayModule } from '../modules/RoleplayModule';
import { NoteTakingModule } from '../modules/NoteTakingModule';
import { InsuranceModule } from '../modules/InsuranceModule';

export function ModulePage() {
  const { moduleNumber } = useParams();
  const num = parseInt(moduleNumber ?? '1');
  const navigate = useNavigate();
  const { assessment } = useAssessment();

  if (!assessment) return null;
  const module = MODULES.find((m) => m.number === num);
  if (!module) { navigate('/dashboard'); return null; }

  const onComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-ink-100 dark:bg-ink-950">
      <header className="sticky top-0 z-20 glass border-b border-ink-200/60 dark:border-ink-800/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Module progress bar */}
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center gap-2">
          {MODULES.map((m) => (
            <div
              key={m.number}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                m.number < num ? 'bg-lava-700' : m.number === num ? 'bg-lava-500' : 'bg-ink-200 dark:bg-ink-800'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 text-center">
          Module {num} of {MODULES.length} • {module.name}
        </p>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {num === 1 && <ListeningModule onComplete={onComplete} />}
        {num === 2 && <PronunciationModule onComplete={onComplete} />}
        {num === 3 && <ReadingModule onComplete={onComplete} />}
        {num === 4 && <ConversationModule onComplete={onComplete} />}
        {num === 5 && <RoleplayModule onComplete={onComplete} />}
        {num === 6 && <NoteTakingModule onComplete={onComplete} />}
        {num === 7 && <InsuranceModule onComplete={onComplete} />}
      </main>
    </div>
  );
}
