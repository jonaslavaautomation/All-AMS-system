import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Candidate, Assessment, ModuleScore, ModuleDetails } from '../types';

interface AssessmentContextValue {
  candidate: Candidate | null;
  assessment: Assessment | null;
  moduleScores: ModuleScore[];
  loading: boolean;
  error: string | null;
  startAssessment: (data: { firstName: string; lastName: string; position: string }) => Promise<void>;
  resumeAssessment: (assessmentId: string) => Promise<void>;
  saveModuleScore: (moduleNumber: number, moduleName: string, score: number, details: ModuleDetails) => Promise<void>;
  updateAssessment: (updates: Partial<Assessment>) => Promise<void>;
  completeAssessment: (finalScores: Record<string, number>, englishLevel: string, recommendation: string) => Promise<void>;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const STORAGE_KEY = 'lava_assessment_session';

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [moduleScores, setModuleScores] = useState<ModuleScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistSession = (cId: string, aId: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ candidateId: cId, assessmentId: aId }));
  };

  const startAssessment = useCallback(async (data: { firstName: string; lastName: string; position: string }) => {
    setLoading(true);
    setError(null);
    try {
      let candidateId: string;

      const { data: created, error: insertErr } = await supabase
        .from('candidates')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          position: data.position,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      candidateId = created.id;
      setCandidate(created as Candidate);

      const { data: assessmentData, error: assessmentErr } = await supabase
        .from('assessments')
        .insert({
          candidate_id: candidateId,
          status: 'in_progress',
          current_module: 1,
        })
        .select()
        .single();
      if (assessmentErr) throw assessmentErr;
      setAssessment(assessmentData as Assessment);
      persistSession(candidateId, assessmentData.id);
    } catch (e: any) {
      setError(e.message ?? 'Failed to start assessment');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: a, error: aErr } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .maybeSingle();
      if (aErr) throw aErr;
      if (!a) { resetAssessment(); return; }
      setAssessment(a as Assessment);

      const { data: c } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', (a as Assessment).candidate_id)
        .maybeSingle();
      if (c) setCandidate(c as Candidate);

      const { data: ms } = await supabase
        .from('module_scores')
        .select('*')
        .eq('assessment_id', assessmentId);
      if (ms) setModuleScores(ms as ModuleScore[]);

      persistSession((a as Assessment).candidate_id, assessmentId);
    } catch (e: any) {
      setError(e.message ?? 'Failed to resume assessment');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveModuleScore = useCallback(async (moduleNumber: number, moduleName: string, score: number, details: ModuleDetails) => {
    if (!assessment) return;
    try {
      const { data: existing } = await supabase
        .from('module_scores')
        .select('id')
        .eq('assessment_id', assessment.id)
        .eq('module_number', moduleNumber)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('module_scores')
          .update({ score, details })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('module_scores')
          .insert({
            assessment_id: assessment.id,
            module_number: moduleNumber,
            module_name: moduleName,
            score,
            details,
          })
          .select()
          .single();
      }
      if (result.error) throw result.error;

      const newScore = result.data as ModuleScore;
      setModuleScores(prev => {
        const filtered = prev.filter(m => m.module_number !== moduleNumber);
        return [...filtered, newScore].sort((a, b) => a.module_number - b.module_number);
      });

      const nextModule = Math.max(assessment.current_module, moduleNumber + 1);
      const { error: updErr } = await supabase
        .from('assessments')
        .update({ current_module: nextModule })
        .eq('id', assessment.id);
      if (updErr) throw updErr;
      setAssessment(prev => prev ? { ...prev, current_module: nextModule } : prev);
    } catch (e: any) {
      setError(e.message ?? 'Failed to save module score');
    }
  }, [assessment]);

  const updateAssessment = useCallback(async (updates: Partial<Assessment>) => {
    if (!assessment) return;
    try {
      const { error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', assessment.id);
      if (error) throw error;
      setAssessment(prev => prev ? { ...prev, ...updates } : prev);
    } catch (e: any) {
      setError(e.message ?? 'Failed to update assessment');
    }
  }, [assessment]);

  const completeAssessment = useCallback(async (finalScores: Record<string, number>, englishLevel: string, recommendation: string) => {
    if (!assessment || !candidate) return;
    try {
      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'completed',
          ...finalScores,
          english_level: englishLevel,
          recommendation,
          completed_at: new Date().toISOString(),
        })
        .eq('id', assessment.id);
      if (error) throw error;

      await supabase.from('leaderboard').insert({
        candidate_id: candidate.id,
        assessment_id: assessment.id,
        candidate_name: `${candidate.first_name} ${candidate.last_name}`,
        position: candidate.position,
        overall_score: finalScores.overall_score,
        english_level: englishLevel,
        completed_at: new Date().toISOString(),
      });

      setAssessment(prev => prev ? {
        ...prev,
        status: 'completed',
        ...finalScores,
        english_level: englishLevel,
        recommendation,
        completed_at: new Date().toISOString(),
      } as Assessment : prev);
    } catch (e: any) {
      setError(e.message ?? 'Failed to complete assessment');
    }
  }, [assessment, candidate]);

  function resetAssessment() {
    setCandidate(null);
    setAssessment(null);
    setModuleScores([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AssessmentContext.Provider value={{
      candidate, assessment, moduleScores, loading, error,
      startAssessment, resumeAssessment, saveModuleScore, updateAssessment, completeAssessment, resetAssessment,
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
