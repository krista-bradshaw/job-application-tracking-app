import { supabase } from '../lib/supabase';
import type { JobApplication, InterviewStage } from '../types';

// ---------------------------------------------------------------------------
// Column name mapping helpers
// Supabase convention is snake_case; frontend types use camelCase.
// ---------------------------------------------------------------------------

interface DbJob {
  id: string;
  user_id: string;
  title: string;
  company: string;
  level: string | null;
  notes: string | null;
  url: string | null;
  interest: string | null;
  status: string | null;
  created_at: string;
}

interface DbInterviewStage {
  id: string;
  job_id: string;
  user_id: string;
  stage_number: number;
  type: string;
  date_time: string;
  notes: string | null;
  feedback: string | null;
  created_at: string;
}

const dbToJob = (row: DbJob): JobApplication => ({
  id: row.id,
  title: row.title,
  company: row.company,
  level: row.level ?? undefined,
  notes: row.notes ?? undefined,
  url: row.url ?? undefined,
  interest: row.interest ?? undefined,
  status: row.status as JobApplication['status'],
  createdAt: row.created_at,
});

const dbToStage = (row: DbInterviewStage): InterviewStage => ({
  id: row.id,
  jobId: row.job_id,
  stageNumber: row.stage_number,
  type: row.type,
  dateTime: row.date_time,
  notes: row.notes ?? undefined,
  feedback: row.feedback ?? undefined,
  createdAt: row.created_at,
});

// ---------------------------------------------------------------------------
// Auth — now handled entirely by AuthContext / Supabase.
// These are kept as thin wrappers so existing call-sites don't break.
// ---------------------------------------------------------------------------

export const loginApi = async (
  email: string,
  password: string
): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
};

export const registerApi = async (
  email: string,
  password: string
): Promise<void> => {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
};

// ---------------------------------------------------------------------------
// Helper to get the current authenticated user's ID
// ---------------------------------------------------------------------------

const getUserId = async (): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// ---------------------------------------------------------------------------
// Jobs API
// ---------------------------------------------------------------------------

export const fetchJobsApi = async (): Promise<JobApplication[]> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DbJob[]).map(dbToJob);
};

export const createJobApi = async (
  job: JobApplication
): Promise<JobApplication> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      id: job.id,
      user_id: userId,
      title: job.title,
      company: job.company,
      level: job.level ?? null,
      notes: job.notes ?? null,
      url: job.url ?? null,
      interest: job.interest != null ? String(job.interest) : null,
      status: job.status ?? null,
      created_at: job.createdAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return dbToJob(data as DbJob);
};

export const updateJobApi = async (
  id: string,
  updates: Partial<JobApplication>
): Promise<JobApplication> => {
  const patch: Record<string, unknown> = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.company !== undefined) patch.company = updates.company;
  if (updates.level !== undefined) patch.level = updates.level;
  if (updates.notes !== undefined) patch.notes = updates.notes;
  if (updates.url !== undefined) patch.url = updates.url;
  if (updates.interest !== undefined)
    patch.interest = updates.interest != null ? String(updates.interest) : null;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.createdAt !== undefined) patch.created_at = updates.createdAt;

  const { data, error } = await supabase
    .from('jobs')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return dbToJob(data as DbJob);
};

export const deleteJobApi = async (id: string): Promise<void> => {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ---------------------------------------------------------------------------
// Interview Stages API
// ---------------------------------------------------------------------------

export const fetchInterviewStagesApi = async (
  jobId: string
): Promise<InterviewStage[]> => {
  const { data, error } = await supabase
    .from('interview_stages')
    .select('*')
    .eq('job_id', jobId)
    .order('stage_number', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbInterviewStage[]).map(dbToStage);
};

export const createInterviewStageApi = async (
  jobId: string,
  stage: InterviewStage
): Promise<InterviewStage> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('interview_stages')
    .insert({
      id: stage.id,
      job_id: jobId,
      user_id: userId,
      stage_number: stage.stageNumber,
      type: stage.type,
      date_time: stage.dateTime,
      notes: stage.notes ?? null,
      feedback: stage.feedback ?? null,
      created_at: stage.createdAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return dbToStage(data as DbInterviewStage);
};

export const updateInterviewStageApi = async (
  id: string,
  updates: Partial<InterviewStage>
): Promise<InterviewStage> => {
  const patch: Record<string, unknown> = {};
  if (updates.stageNumber !== undefined)
    patch.stage_number = updates.stageNumber;
  if (updates.type !== undefined) patch.type = updates.type;
  if (updates.dateTime !== undefined) patch.date_time = updates.dateTime;
  if (updates.notes !== undefined) patch.notes = updates.notes;
  if (updates.feedback !== undefined) patch.feedback = updates.feedback;

  const { data, error } = await supabase
    .from('interview_stages')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return dbToStage(data as DbInterviewStage);
};

export const deleteInterviewStageApi = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('interview_stages')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
};
