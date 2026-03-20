import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, addJob, updateJob, deleteJob } from '../utils/storage';
import type { JobApplication } from '../types';

export const JOBS_QUERY_KEY = ['jobs'];

export const useJobs = () => {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: getJobs,
  });
};

export const useAddJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<JobApplication>;
    }) => updateJob(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
};
