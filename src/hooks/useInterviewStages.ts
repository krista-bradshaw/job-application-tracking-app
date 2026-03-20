import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInterviewStages,
  addInterviewStage,
  updateInterviewStage,
  deleteInterviewStage,
} from '../utils/storage';
import type { InterviewStage } from '../types';

export const INTERVIEW_STAGES_QUERY_KEY = ['interviewStages'];

export const useInterviewStages = (jobId: string | null) => {
  return useQuery({
    queryKey: [...INTERVIEW_STAGES_QUERY_KEY, jobId],
    queryFn: () => (jobId ? getInterviewStages(jobId) : Promise.resolve([])),
    enabled: !!jobId,
  });
};

export const useAddInterviewStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      stage,
    }: {
      jobId: string;
      stage: Omit<InterviewStage, 'id' | 'createdAt'>;
    }) => addInterviewStage(jobId, stage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...INTERVIEW_STAGES_QUERY_KEY, variables.jobId],
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); // Invalidate jobs as well since it might affect "active interviews" count
    },
  });
};

export const useUpdateInterviewStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InterviewStage>;
      jobId: string;
    }) => updateInterviewStage(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...INTERVIEW_STAGES_QUERY_KEY, variables.jobId],
      });
    },
  });
};

export const useDeleteInterviewStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; jobId: string }) =>
      deleteInterviewStage(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...INTERVIEW_STAGES_QUERY_KEY, variables.jobId],
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
