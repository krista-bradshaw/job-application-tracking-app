import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton as MuiIconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import TimelineIcon from '@mui/icons-material/Timeline';
import { format } from 'date-fns';
import {
  type ApplicationStatus,
  type JobApplication,
  LEVEL_COLORS,
  INTEREST_COLORS,
  STATUS_COLORS,
  APPLICATION_STATUS,
} from '../types';

export const IconButton = ({
  icon,
  color,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onClick: () => void;
  ariaLabel: string;
}) => (
  <MuiIconButton
    size="small"
    color={color}
    onClick={onClick}
    sx={{ p: 0.5 }}
    aria-label={ariaLabel}
  >
    {icon}
  </MuiIconButton>
);

interface JobCardViewProps {
  jobs: JobApplication[];
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onNavigateToInterviews: (id: string) => void;
}

export const JobCardView: React.FC<JobCardViewProps> = ({
  jobs,
  onDelete,
  onEdit,
  onStatusChange,
  onNavigateToInterviews,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {jobs.map((job) => (
        <Card
          key={job.id}
          elevation={0}
          sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={0.5}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                >
                  {job.company || 'Unknown Company'}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontSize: '0.95rem', fontWeight: 'bold', mt: 0 }}
                >
                  {job.title}
                </Typography>
              </Box>
              <Box display="flex" gap={0}>
                <IconButton
                  color="primary"
                  onClick={() => onEdit(job)}
                  icon={<EditOutlinedIcon />}
                  ariaLabel="Edit"
                />
                {job.status === APPLICATION_STATUS.INTERVIEWING && (
                  <IconButton
                    color="info"
                    onClick={() => onNavigateToInterviews(job.id)}
                    icon={<TimelineIcon />}
                    ariaLabel="View Interviews"
                  />
                )}
                <IconButton
                  color="error"
                  onClick={() => onDelete(job.id)}
                  icon={<DeleteOutlineIcon />}
                  ariaLabel="Delete"
                />
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
              {job.level && (
                <Chip
                  label={job.level}
                  size="small"
                  variant="outlined"
                  color={LEVEL_COLORS[job.level] || 'default'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
              {job.interest && (
                <Chip
                  label={`${job.interest}`}
                  size="small"
                  color={INTEREST_COLORS[String(job.interest)] || 'default'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
            </Box>

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
              <FormControl size="small" variant="standard">
                <Select
                  disableUnderline
                  value={job.status || APPLICATION_STATUS.APPLIED}
                  onChange={(e) =>
                    onStatusChange(job.id, e.target.value as ApplicationStatus)
                  }
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color:
                      STATUS_COLORS[job.status || APPLICATION_STATUS.APPLIED],
                    '& .MuiSelect-select': { py: 0.5 },
                  }}
                >
                  {Object.keys(STATUS_COLORS).map((status) => (
                    <MenuItem
                      key={status}
                      value={status}
                      sx={{ fontSize: '0.85rem' }}
                    >
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                >
                  {format(new Date(job.createdAt), 'MMM d')}
                </Typography>
                {job.url && (
                  <MuiIconButton
                    size="small"
                    component="a"
                    href={job.url}
                    target="_blank"
                    rel="noopener"
                    sx={{
                      p: 0.5,
                      color: 'primary.main',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                    }}
                  >
                    <LaunchIcon sx={{ fontSize: 16 }} />
                  </MuiIconButton>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
