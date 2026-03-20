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
  Link,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import TimelineIcon from '@mui/icons-material/Timeline';
import { format } from 'date-fns';
import type { JobApplication } from '../types';

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
  onStatusChange: (id: string, newStatus: JobApplication['status']) => void;
  onNavigateToInterviews: (id: string) => void;
}

const levelColors: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  Internship: 'info',
  Entry: 'success',
  Mid: 'primary',
  Senior: 'secondary',
  Lead: 'warning',
  Manager: 'error',
};

const interestColors: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  Low: 'info',
  Medium: 'default',
  High: 'success',
};

const statusColors: Record<string, string> = {
  Applied: 'info.main',
  Interviewing: 'warning.main',
  Offer: 'success.main',
  Rejected: 'text.disabled',
  Expired: 'text.secondary',
};

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
                {(job.status === 'Interviewing' ||
                  job.status === 'Offer' ||
                  job.status === 'Rejected' ||
                  job.status === 'Expired') && (
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
                  color={levelColors[job.level] || 'default'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
              {job.interest && (
                <Chip
                  label={`${job.interest}`}
                  size="small"
                  color={interestColors[String(job.interest)] || 'default'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormControl size="small" variant="standard">
                <Select
                  disableUnderline
                  value={job.status || 'Applied'}
                  onChange={(e) =>
                    onStatusChange(
                      job.id,
                      e.target.value as JobApplication['status']
                    )
                  }
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: statusColors[job.status || 'Applied'],
                  }}
                >
                  <MenuItem value="Applied" sx={{ fontSize: '0.8rem' }}>
                    Applied
                  </MenuItem>
                  <MenuItem value="Interviewing" sx={{ fontSize: '0.8rem' }}>
                    Interviewing
                  </MenuItem>
                  <MenuItem value="Offer" sx={{ fontSize: '0.8rem' }}>
                    Offer
                  </MenuItem>
                  <MenuItem value="Rejected" sx={{ fontSize: '0.8rem' }}>
                    Rejected
                  </MenuItem>
                  <MenuItem value="Expired" sx={{ fontSize: '0.8rem' }}>
                    Expired
                  </MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {format(new Date(job.createdAt), 'MMM d')}
                </Typography>
                {job.url && (
                  <Link
                    href={job.url}
                    target="_blank"
                    rel="noopener"
                    color="inherit"
                    sx={{ display: 'flex', opacity: 0.6 }}
                  >
                    <LaunchIcon sx={{ fontSize: 16 }} />
                  </Link>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
