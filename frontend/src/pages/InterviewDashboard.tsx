import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Collapse,
  Button,
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { differenceInDays, format, isFuture, isPast } from 'date-fns';
import type { JobApplication, InterviewStage } from '../types';
import {
  getInterviewStages,
  addInterviewStage,
  updateInterviewStage,
  deleteInterviewStage,
} from '../utils/storage';

const stageTypes = [
  'Talent screening',
  'Tech discussion',
  'Tech Test (take home)',
  'Tech Test (live)',
  'HR Screening',
  'Executive Screening',
  'Assessment Day',
];

interface JobWithStages extends JobApplication {
  stages: InterviewStage[];
}

interface InterviewDashboardProps {
  jobs: JobApplication[];
}

export const InterviewDashboard: React.FC<InterviewDashboardProps> = ({
  jobs,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [interviewJobs, setInterviewJobs] = useState<JobWithStages[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchStages = async () => {
      // Filter jobs that are currently interviewing or have had interviews
      const filteredJobs = jobs.filter(
        (job) =>
          job.status === 'Interviewing' ||
          job.status === 'Offer' ||
          job.status === 'Rejected'
      );

      const jobsWithStagesPromises = filteredJobs.map(async (job) => {
        const stages = await getInterviewStages(job.id);
        return { ...job, stages };
      });

      const resolvedJobs = await Promise.all(jobsWithStagesPromises);

      // Keep jobs that are currently 'Interviewing' OR jobs that have at least one stage recorded
      const finalJobs = resolvedJobs
        .filter((job) => job.status === 'Interviewing' || job.stages.length > 0)
        .sort((a, b) => {
          // Sort by status first to keep active ones on top
          if (a.status === 'Interviewing' && b.status !== 'Interviewing')
            return -1;
          if (b.status === 'Interviewing' && a.status !== 'Interviewing')
            return 1;

          // Find next future stage for A
          const nextStageA = a.stages
            .map((s: InterviewStage) => new Date(s.dateTime))
            .filter((d: Date) => isFuture(d))
            .sort((d1: Date, d2: Date) => d1.getTime() - d2.getTime())[0];

          // Find next future stage for B
          const nextStageB = b.stages
            .map((s: InterviewStage) => new Date(s.dateTime))
            .filter((d: Date) => isFuture(d))
            .sort((d1: Date, d2: Date) => d1.getTime() - d2.getTime())[0];

          // Prioritize jobs with future stages, sorting by soonest first
          if (nextStageA && nextStageB) {
            return nextStageA.getTime() - nextStageB.getTime();
          } else if (nextStageA) {
            return -1;
          } else if (nextStageB) {
            return 1;
          }

          // Fallback to creation date (newest first) if no future stages
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

      setInterviewJobs(finalJobs);
    };

    fetchStages();
  }, [jobs]);

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
        const updated = await updateInterviewStage(editingStage.id, {
          stageNumber,
          type,
          dateTime,
          notes,
          feedback,
        });
        if (updated) {
          setInterviewJobs((prev) =>
            prev.map((job) => {
              if (job.id === currentJobId) {
                return {
                  ...job,
                  stages: job.stages
                    .map((s) => (s.id === updated.id ? updated : s))
                    .sort((a, b) => a.stageNumber - b.stageNumber),
                };
              }
              return job;
            })
          );
        }
      } else {
        const newStage = await addInterviewStage(currentJobId, {
          stageNumber,
          type,
          dateTime,
          notes,
          feedback,
        });
        setInterviewJobs((prev) =>
          prev.map((job) => {
            if (job.id === currentJobId) {
              return {
                ...job,
                stages: [...job.stages, newStage].sort(
                  (a, b) => a.stageNumber - b.stageNumber
                ),
              };
            }
            return job;
          })
        );
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
    await deleteInterviewStage(stageId);
    setInterviewJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            stages: job.stages.filter((s) => s.id !== stageId),
          };
        }
        return job;
      })
    );
  };

  const getAtAGlanceInfo = (job: JobWithStages) => {
    if (job.status !== 'Interviewing') return null;
    if (job.stages.length === 0)
      return {
        text: 'No stages scheduled',
        color: 'text.disabled',
        chipColor: 'primary',
      };

    // Sort stages chronologically to find the relevant one
    const sortedStages = [...job.stages].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    // Find the first future stage
    const nextStage = sortedStages.find((s) => isFuture(new Date(s.dateTime)));
    if (nextStage) {
      return {
        text: `Up next: ${nextStage.type} - ${format(new Date(nextStage.dateTime), 'MMM d, h:mm a')}`,
        color: 'info.main',
        icon: 'calendar',
        chipColor: 'info',
      };
    }

    // Find the most recent past stage
    const lastStage = [...sortedStages]
      .reverse()
      .find((s) => isPast(new Date(s.dateTime)));
    if (!lastStage) return null;

    const text = `Awaiting feedback after ${lastStage.type}`;
    const daysSinceLastStage = differenceInDays(
      new Date(),
      new Date(lastStage.dateTime)
    );
    const daysAgoText =
      daysSinceLastStage > 0 &&
      ` ${daysSinceLastStage} day${daysSinceLastStage > 1 ? 's' : ''} ago`;
    return {
      text,
      daysAgoText,
      color: 'warning.main',
      icon: 'pending',
      chipColor: 'warning',
    };
  };

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
        gap={2}
        mb={1}
        sx={{
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: '150px',
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            {activeJobsCount}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Active Interviews
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: '150px',
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: upcomingInterviewsCount > 0 ? 'info.main' : 'divider',
            backgroundColor:
              upcomingInterviewsCount > 0
                ? 'rgba(2, 132, 199, 0.05)'
                : 'transparent',
          }}
        >
          <Typography variant="h4" fontWeight="bold" color={'info.main'}>
            {upcomingInterviewsCount}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Upcoming Stages
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: '150px',
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: awaitingFeedbackCount > 0 ? 'warning.main' : 'divider',
            backgroundColor:
              awaitingFeedbackCount > 0
                ? 'rgba(245, 158, 11, 0.05)'
                : 'transparent',
          }}
        >
          <Typography variant="h4" fontWeight="bold" color={'warning.main'}>
            {awaitingFeedbackCount}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Awaiting Feedback
          </Typography>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: '150px',
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: rejectedCount > 0 ? 'error.main' : 'divider',
            backgroundColor:
              rejectedCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
          }}
        >
          <Typography variant="h4" fontWeight="bold" color={'error.main'}>
            {rejectedCount}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Rejected
          </Typography>
        </Paper>
      </Box>

      {interviewJobs.map((job) => (
        <Paper
          key={job.id}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            opacity: job.status === 'Rejected' ? 0.6 : 1,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          {/* Job Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={() => toggleExpand(job.id)}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {job.company || 'Unknown Company'}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: '1.05rem', fontWeight: 'bold' }}
              >
                {job.title}
              </Typography>
              <Box
                display="flex"
                gap={1}
                mt={0.5}
                alignItems="center"
                flexWrap="wrap"
              >
                {job.status !== 'Interviewing' && (
                  <Chip
                    label={job.status}
                    size="small"
                    color={
                      job.status === 'Rejected'
                        ? 'error'
                        : job.status === 'Offer'
                          ? 'success'
                          : 'default'
                    }
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                <Chip
                  label={`${job.stages.length} Stage${job.stages.length !== 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  variant={job.stages.length > 0 ? 'filled' : 'outlined'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                {/* Mobile At-A-Glance Info */}
                {isMobile &&
                  (() => {
                    const info = getAtAGlanceInfo(job);
                    if (info) {
                      return (
                        <Chip
                          label={info.text}
                          size="small"
                          color={
                            info.chipColor as 'primary' | 'warning' | 'info'
                          }
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      );
                    }
                  })()}
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              {/* At A Glance Info */}
              {(() => {
                const info = getAtAGlanceInfo(job);
                if (info) {
                  return (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        borderRadius: 1,
                        display: { xs: 'none', md: 'block' }, // Hide on mobile/tablet here to show it below
                        textAlign: 'right',
                      }}
                    >
                      <Box sx={{ color: info.color, fontWeight: 600 }}>
                        {info.text}
                      </Box>
                      {info?.daysAgoText && (
                        <Box sx={{ color: 'text.secondary' }}>
                          {info.daysAgoText}
                        </Box>
                      )}
                    </Typography>
                  );
                }
                return null;
              })()}

              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(job.id);
                  }}
                  sx={{ borderRadius: 2, minWidth: 'max-content' }}
                >
                  Add Stage
                </Button>
                <IconButton size="small">
                  {expandedJobId === job.id ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>
            </Box>
          </Box>
          {/* Expanded Stages View */}{' '}
          <Collapse in={expandedJobId === job.id}>
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              {job.stages.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={3}
                >
                  No interview stages recorded yet. Click "Add Stage" to begin
                  tracking.
                </Typography>
              ) : (
                <Timeline
                  sx={{
                    [`& .${timelineItemClasses.root}:before`]: {
                      flex: 0,
                      padding: 0,
                    },
                    p: 0,
                    m: 0,
                  }}
                >
                  {job.stages.map((stage, index) => {
                    const isPassed = new Date(stage.dateTime) < new Date();
                    return (
                      <TimelineItem key={stage.id}>
                        <TimelineSeparator>
                          <TimelineDot
                            color={isPassed ? 'primary' : 'grey'}
                            variant={isPassed ? 'filled' : 'outlined'}
                          />
                          {index < job.stages.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                            }}
                          >
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              mb={1}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="primary"
                                  fontWeight="bold"
                                >
                                  Stage {stage.stageNumber}
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  lineHeight={1.2}
                                >
                                  {stage.type}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {format(
                                    new Date(stage.dateTime),
                                    'EEEE, MMM d, yyyy · h:mm a'
                                  )}
                                </Typography>
                              </Box>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenModal(job.id, stage)}
                                  sx={{ mr: 0.5 }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteStage(job.id, stage.id)
                                  }
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            {stage.notes && (
                              <Box
                                mt={1.5}
                                p={1.5}
                                sx={{
                                  backgroundColor: 'action.hover',
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  gutterBottom
                                  fontWeight="bold"
                                >
                                  NOTES
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: 'pre-wrap' }}
                                >
                                  {stage.notes}
                                </Typography>
                              </Box>
                            )}

                            {stage.feedback && (
                              <Box
                                mt={1.5}
                                p={1.5}
                                sx={{
                                  backgroundColor: 'action.hover',
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  gutterBottom
                                  fontWeight="bold"
                                >
                                  FEEDBACK
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: 'pre-wrap' }}
                                >
                                  {stage.feedback}
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              )}
            </Box>
          </Collapse>
        </Paper>
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
              label="Feedback"
              multiline
              rows={2}
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
