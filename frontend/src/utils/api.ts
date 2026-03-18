import type { JobApplication } from './storage';
import type { User } from '../contexts/AuthContext';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('job_tracker_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const loginApi = async (email: string, password: string): Promise<{ token: string, user: User }> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login failed');
  }
  return response.json();
};

export const registerApi = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Registration failed');
  }
};

export const fetchJobsApi = async (): Promise<JobApplication[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
};

export const createJobApi = async (job: JobApplication): Promise<JobApplication> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(job),
  });
  if (!response.ok) {
    throw new Error('Failed to create job');
  }
  return response.json();
};

export const updateJobApi = async (id: string, updates: Partial<JobApplication>): Promise<JobApplication> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update job');
  }
  return response.json();
};

export const deleteJobApi = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete job');
  }
};

// INTERVIEW STAGES API

export const fetchInterviewStagesApi = async (jobId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/interviews`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch interview stages');
  }
  return response.json();
};

export const createInterviewStageApi = async (jobId: string, stage: any): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/interviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(stage),
  });
  if (!response.ok) {
    throw new Error('Failed to create interview stage');
  }
  return response.json();
};

export const updateInterviewStageApi = async (id: string, updates: any): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update interview stage');
  }
  return response.json();
};

export const deleteInterviewStageApi = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete interview stage');
  }
};
