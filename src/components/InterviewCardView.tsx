import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Collapse,
  Button,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { differenceInDays, format, isFuture, isPast } from 'date-fns';
import {
  type JobApplication,
  type InterviewStage,
  APPLICATION_STATUS,
} from '../types';

interface JobWithStages extends JobApplication {
  stages: InterviewStage[];
}

interface InterviewCardViewProps {
  job: JobWithStages;
  isMobile: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNavigateToApplications: (id: string, company: string) => void;
  onAddStage: () => void;
  onEditStage: (stage: InterviewStage) => void;
  onDeleteStage: (stageId: string) => void;
}

export const InterviewCardView: React.FC<InterviewCardViewProps> = ({
  job,
  isMobile,
  isExpanded,
  onToggleExpand,
  onNavigateToApplications,
  onAddStage,
  onEditStage,
  onDeleteStage,
}) => {
  const getAtAGlanceInfo = (job: JobWithStages) => {
    if (job.status !== APPLICATION_STATUS.INTERVIEWING) return null;
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

  const info = getAtAGlanceInfo(job);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        opacity: job.status === APPLICATION_STATUS.REJECTED ? 0.6 : 1,
        transition: 'opacity 0.2s',
        '&:hover': {
          opacity: 1,
        },
      }}
    >
      {/* Job Header */}
      <Box
        sx={{
          p: 1.5,
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        onClick={onToggleExpand}
      >
        {/* Top Section: Company, Title and Expand Toggle */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={0.5}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontSize: '0.7rem', fontWeight: 600 }}
            >
              {job.company || 'Unknown Company'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.95rem',
                fontWeight: 'bold',
                mt: 0,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {job.title}
            </Typography>
          </Box>
          <IconButton size="small" sx={{ p: 0.5, mt: -0.5 }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Tags Section */}
        <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
          {job.status !== APPLICATION_STATUS.INTERVIEWING && (
            <Chip
              label={job.status}
              size="small"
              color={
                job.status === APPLICATION_STATUS.REJECTED
                  ? 'error'
                  : job.status === 'Offer'
                    ? 'success'
                    : 'default'
              }
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
          <Chip
            label={`${job.stages.length} Stage${job.stages.length !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant={job.stages.length > 0 ? 'filled' : 'outlined'}
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
          {isMobile && info && (
            <Chip
              label={info.text}
              size="small"
              color={info.chipColor as 'primary' | 'warning' | 'info'}
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>

        {/* Footer Actions Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.5,
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            mx: -1.5,
            px: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <AddCircleOutlineIcon sx={{ fontSize: '1rem !important' }} />
              }
              onClick={(e) => {
                e.stopPropagation();
                onAddStage();
              }}
              sx={{
                height: 28,
                borderRadius: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                px: 1.5,
                textTransform: 'none',
              }}
            >
              Add Stage
            </Button>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            {!isMobile && info && (
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  borderRadius: 1,
                  textAlign: 'right',
                }}
              >
                <Box
                  component="span"
                  sx={{ color: info.color, fontWeight: 700 }}
                >
                  {info.text}
                </Box>
                {info?.daysAgoText && (
                  <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                    {info.daysAgoText}
                  </Box>
                )}
              </Typography>
            )}

            <Tooltip title="View Application" arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToApplications(job.id, job.company);
                }}
                sx={{
                  p: 0.5,
                  backgroundColor: 'rgba(37, 99, 235, 0.05)',
                  '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                }}
              >
                <WorkOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Expanded Stages View */}
      <Collapse in={isExpanded}>
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
                      {index < job.stages.length - 1 && <TimelineConnector />}
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
                              onClick={() => onEditStage(stage)}
                              sx={{ mr: 0.5 }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDeleteStage(stage.id)}
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
  );
};
