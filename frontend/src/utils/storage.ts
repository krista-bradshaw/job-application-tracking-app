import { v4 as uuidv4 } from 'uuid';
import { fetchJobsApi, createJobApi, updateJobApi, deleteJobApi } from './api';

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  level?: string;
  notes?: string;
  url?: string;
  interest?: string | number;
  status?: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  createdAt: string;
}

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

export const addJob = async (jobDetails: Omit<JobApplication, 'id' | 'createdAt'> & { createdAt?: string }): Promise<JobApplication> => {
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

export const updateJob = async (jobId: string, updatedDetails: Partial<JobApplication>): Promise<JobApplication | null> => {
  // The backend now returns the full updated job row so we can keep state in sync
  return await updateJobApi(jobId, updatedDetails);
};
