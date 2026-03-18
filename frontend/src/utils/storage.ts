import { v4 as uuidv4 } from 'uuid';
import {
  fetchJobsApi,
  createJobApi,
  updateJobApi,
  deleteJobApi,
  fetchInterviewStagesApi,
  createInterviewStageApi,
  updateInterviewStageApi,
  deleteInterviewStageApi,
} from './api';

import type { JobApplication, InterviewStage } from '../types';

export const getJobs = async (): Promise<JobApplication[]> => {
  try {
    return await fetchJobsApi();
  } catch (error) {
    console.error('Failed to fetch jobs', error);
    return [];
  }
};

const API_KEY_STORAGE_KEY = 'job_tracker_gemini_api_key';

export const getApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
};

export const saveApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const addJob = async (
  jobDetails: Omit<JobApplication, 'id' | 'createdAt'> & { createdAt?: string }
): Promise<JobApplication> => {
  const newJob: JobApplication = {
    id: uuidv4(),
    createdAt: jobDetails.createdAt || new Date().toISOString(),
    status: 'Applied',
    ...jobDetails,
  };

  return await createJobApi(newJob);
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await deleteJobApi(jobId);
};

export const updateJob = async (
  jobId: string,
  updatedDetails: Partial<JobApplication>
): Promise<JobApplication | null> => {
  // The backend now returns the full updated job row so we can keep state in sync
  return await updateJobApi(jobId, updatedDetails);
};

export const getInterviewStages = async (
  jobId: string
): Promise<InterviewStage[]> => {
  try {
    return await fetchInterviewStagesApi(jobId);
  } catch (error) {
    console.error('Failed to fetch interview stages', error);
    return [];
  }
};

export const addInterviewStage = async (
  jobId: string,
  stageDetails: Omit<InterviewStage, 'id' | 'jobId' | 'createdAt'>
): Promise<InterviewStage> => {
  const newStage: InterviewStage = {
    id: uuidv4(),
    jobId,
    createdAt: new Date().toISOString(),
    ...stageDetails,
  };
  return await createInterviewStageApi(jobId, newStage);
};

export const updateInterviewStage = async (
  id: string,
  updatedDetails: Partial<InterviewStage>
): Promise<InterviewStage | null> => {
  return await updateInterviewStageApi(id, updatedDetails);
};

export const deleteInterviewStage = async (id: string): Promise<void> => {
  await deleteInterviewStageApi(id);
};
