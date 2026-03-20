import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Skeleton,
} from '@mui/material';
import { isFuture, isPast } from 'date-fns';
import type { JobApplication, InterviewStage } from '../types';
import { getInterviewStages } from '../utils/storage';
import { SummaryCard } from '../components/SummaryCard';
import { useQueries } from '@tanstack/react-query';
import {
  useAddInterviewStage,
  useUpdateInterviewStage,
  useDeleteInterviewStage,
  INTERVIEW_STAGES_QUERY_KEY,
} from '../hooks/useInterviewStages';

import { InterviewCardView } from '../components/InterviewCardView';

const stageTypes = [
  'Talent screening',
  'Tech discussion',
  'Tech Test (take home)',
  'Tech Test (live)',
  'HR Screening',
  'Executive Screening',
  'Assessment Day',
];

interface InterviewDashboardProps {
  jobs: JobApplication[];
  expandedJobId: string | null;
  setExpandedJobId: (id: string | null) => void;
  onNavigateToApplications: (id: string, company: string) => void;
}

export const InterviewDashboard: React.FC<InterviewDashboardProps> = ({
  jobs,
  expandedJobId,
  setExpandedJobId,
  onNavigateToApplications,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const addStageMutation = useAddInterviewStage();
  const updateStageMutation = useUpdateInterviewStage();
  const deleteStageMutation = useDeleteInterviewStage();

  // Filter jobs that are currently interviewing or have had interviews
  const filteredJobs = jobs.filter(
    (job) =>
      job.status === 'Interviewing' ||
      job.status === 'Offer' ||
      job.status === 'Rejected'
  );

  const stageQueries = useQueries({
    queries: filteredJobs.map((job) => ({
      queryKey: [...INTERVIEW_STAGES_QUERY_KEY, job.id],
      queryFn: () => getInterviewStages(job.id),
    })),
  });

  const isLoading = stageQueries.some((query) => query.isLoading);

  const interviewJobs = filteredJobs
    .map((job, index) => ({
      ...job,
      stages: stageQueries[index].data || [],
    }))
    .filter((job) => job.status === 'Interviewing' || job.stages.length > 0)
    .sort((a, b) => {
      // Sorting logic remains the same
      if (a.status === 'Interviewing' && b.status !== 'Interviewing') return -1;
      if (b.status === 'Interviewing' && a.status !== 'Interviewing') return 1;

      const nextStageA = a.stages
        .map((s: InterviewStage) => new Date(s.dateTime))
        .filter((d: Date) => isFuture(d))
        .sort((d1: Date, d2: Date) => d1.getTime() - d2.getTime())[0];

      const nextStageB = b.stages
        .map((s: InterviewStage) => new Date(s.dateTime))
        .filter((d: Date) => isFuture(d))
        .sort((d1: Date, d2: Date) => d1.getTime() - d2.getTime())[0];

      if (nextStageA && nextStageB)
        return nextStageA.getTime() - nextStageB.getTime();
      if (nextStageA) return -1;
      if (nextStageB) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<InterviewStage | null>(null);

  // Form state
  const [stageNumber, setStageNumber] = useState<number>(1);
  const [type, setType] = useState<string>(stageTypes[0]);
  const [dateTime, setDateTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const toggleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleOpenModal = (jobId: string, stage?: InterviewStage) => {
    setCurrentJobId(jobId);
    if (stage) {
      setEditingStage(stage);
      setStageNumber(stage.stageNumber);
      setType(stage.type);
      setDateTime(stage.dateTime);
      setNotes(stage.notes || '');
      setFeedback(stage.feedback || '');
    } else {
      setEditingStage(null);
      const job = interviewJobs.find((j) => j.id === jobId);
      const nextStageNum = job ? job.stages.length + 1 : 1;
      setStageNumber(nextStageNum);
      setType(stageTypes[0]);

      // Set default datetime to next hour
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0);
      // Format to YYYY-MM-DDThh:mm for local datetime input
      setDateTime(
        new Date(nextHour.getTime() - nextHour.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      );
      setNotes('');
      setFeedback('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentJobId(null);
    setEditingStage(null);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJobId || !type || !dateTime) return;

    try {
      if (editingStage) {
        await updateStageMutation.mutateAsync({
          id: editingStage.id,
          updates: {
            stageNumber,
            type,
            dateTime,
            notes,
            feedback,
          },
          jobId: currentJobId,
        });
      } else {
        await addStageMutation.mutateAsync({
          jobId: currentJobId,
          stage: {
            stageNumber,
            type,
            dateTime,
            notes,
            feedback,
            jobId: currentJobId,
          },
        });
      }
      handleCloseModal();

      // Auto-expand the job if it isn't already
      if (expandedJobId !== currentJobId) {
        setExpandedJobId(currentJobId);
      }
    } catch (err) {
      console.error('Failed to save stage:', err);
    }
  };

  const handleDeleteStage = async (jobId: string, stageId: string) => {
    if (window.confirm('Are you sure you want to delete this stage?')) {
      await deleteStageMutation.mutateAsync({ id: stageId, jobId });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          display="grid"
          gap={2}
          mb={1}
          sx={{
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={80}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  if (interviewJobs.length === 0) {
    return (
      <Box
        textAlign="center"
        py={10}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No Active Interviews
        </Typography>
        <Typography variant="body2" color="text.disabled" mt={1}>
          Change an application's status to 'Interviewing' to start tracking its
          interview stages here.
        </Typography>
      </Box>
    );
  }

  const activeJobsCount = interviewJobs.filter(
    (j) => j.status === 'Interviewing'
  ).length;

  const upcomingInterviewsCount = interviewJobs.filter(
    (j) =>
      j.status === 'Interviewing' &&
      j.stages.some((s) => isFuture(new Date(s.dateTime)))
  ).length;

  const awaitingFeedbackCount = interviewJobs.filter((j) => {
    if (j.status !== 'Interviewing') return false;

    // If there is an upcoming stage scheduled, we aren't awaiting feedback
    const hasFuture = j.stages.some((s) => isFuture(new Date(s.dateTime)));
    if (hasFuture) return false;
    const pastStages = j.stages.filter((s) => isPast(new Date(s.dateTime)));
    if (pastStages.length === 0) return false;
    // Sort to get the most recent past stage
    const lastStage = pastStages.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    )[0];
    return !lastStage.feedback;
  }).length;

  const rejectedCount = interviewJobs.filter(
    (j) => j.status === 'Rejected'
  ).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Summary Cards */}
      <Box
        display="grid"
        gap={{ xs: 1, sm: 2 }}
        mb={1}
        sx={{
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        }}
      >
        <SummaryCard
          stat={activeJobsCount}
          label="Active interviews"
          color="primary.main"
          backgroundColor="rgba(37, 99, 235, 0.05)"
        />
        <SummaryCard
          stat={upcomingInterviewsCount}
          label="Upcoming stages"
          color="info.main"
          backgroundColor="rgba(2, 132, 199, 0.05)"
        />
        <SummaryCard
          stat={awaitingFeedbackCount}
          label="Awaiting feedback"
          color="warning.main"
          backgroundColor="rgba(245, 158, 11, 0.05)"
        />
        <SummaryCard
          stat={rejectedCount}
          label="Rejected"
          color="error.main"
          backgroundColor="rgba(239, 68, 68, 0.05)"
        />
      </Box>

      {interviewJobs.map((job) => (
        <InterviewCardView
          key={job.id}
          job={job}
          isMobile={isMobile}
          isExpanded={expandedJobId === job.id}
          onToggleExpand={() => toggleExpand(job.id)}
          onNavigateToApplications={onNavigateToApplications}
          onAddStage={() => handleOpenModal(job.id)}
          onEditStage={(stage) => handleOpenModal(job.id, stage)}
          onDeleteStage={(stageId) => handleDeleteStage(job.id, stageId)}
        />
      ))}

      {/* Add/Edit Stage Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSaveStage}>
          <DialogTitle
            sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}
          >
            {editingStage ? 'Edit Interview Stage' : 'Log Interview Stage'}
          </DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Box
              pt={2.5}
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2}
            >
              <TextField
                label="Stage"
                type="number"
                value={stageNumber}
                onChange={(e) => setStageNumber(parseInt(e.target.value) || 1)}
                required
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ width: { xs: '100%', sm: '120px' } }}
              />
              <FormControl fullWidth required>
                <InputLabel>Interview Type</InputLabel>
                <Select
                  value={type}
                  label="Interview Type"
                  onChange={(e) => setType(e.target.value)}
                >
                  {stageTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Date & Time"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Details / Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Who are you speaking with? What should you prepare?"
              fullWidth
            />

            <TextField
              label="Feedback (after interview)"
              multiline
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How did it go? Any specific questions they asked? (Can be filled out later)"
              fullWidth
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(16, 185, 129, 0.02)',
                },
                '& .MuiInputLabel-root.Mui-focused': { color: 'success.main' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                  { borderColor: 'success.main' },
              }}
            />
          </DialogContent>
          <DialogActions
            sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Button onClick={handleCloseModal} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Stage
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
