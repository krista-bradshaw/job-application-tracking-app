import React from 'react';
import {
  Box,
  Link,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import AutoDeleteOutlinedIcon from '@mui/icons-material/AutoDeleteOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LaunchIcon from '@mui/icons-material/Launch';
import { format, differenceInDays } from 'date-fns';
import type { JobApplication } from '../types';

interface JobTableViewProps {
  jobs: JobApplication[];
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
  onStatusChange: (id: string, newStatus: JobApplication['status']) => void;
  sortBy: string;
  onSort: (column: string) => void;
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
  Rejected: 'error.main',
  Expired: 'text.disabled',
};

export const JobTableView: React.FC<JobTableViewProps> = ({
  jobs,
  onDelete,
  onEdit,
  onStatusChange,
  sortBy,
  onSort,
}) => {
  const getSortDirection = (column: string): 'asc' | 'desc' | undefined => {
    if (sortBy === `${column}Asc`) return 'asc';
    if (sortBy === `${column}Desc`) return 'desc';
    return undefined;
  };

  return (
    <TableContainer sx={{ px: 0.5, mb: 1 }}>
      <Table
        size="small"
        sx={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}
      >
        <TableHead>
          <TableRow sx={{ '& th': { borderBottom: 'none', py: 1, px: 2 } }}>
            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>
              <TableSortLabel
                active={sortBy.startsWith('company')}
                direction={getSortDirection('company')}
                onClick={() => onSort('company')}
              >
                Company
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>
              <TableSortLabel
                active={sortBy.startsWith('title')}
                direction={getSortDirection('title')}
                onClick={() => onSort('title')}
              >
                Role
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
              <TableSortLabel
                active={sortBy.startsWith('status')}
                direction={getSortDirection('status')}
                onClick={() => onSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
              <TableSortLabel
                active={sortBy.startsWith('level')}
                direction={getSortDirection('level')}
                onClick={() => onSort('level')}
              >
                Level
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
              <TableSortLabel
                active={sortBy.startsWith('interest')}
                direction={getSortDirection('interest')}
                onClick={() => onSort('interest')}
              >
                Interest
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>
              <TableSortLabel
                active={sortBy.startsWith('date')}
                direction={getSortDirection('date')}
                onClick={() => onSort('date')}
              >
                Applied
              </TableSortLabel>
            </TableCell>
            <TableCell
              sx={{ fontWeight: 'bold', width: '8%', textAlign: 'right' }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              hover
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                transition: 'transform 0.1s, box-shadow 0.1s',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                },
                '& td': {
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.25,
                  px: 2,
                },
                '& td:first-of-type': {
                  borderLeft: '1px solid',
                  borderTopLeftRadius: 6,
                  borderBottomLeftRadius: 6,
                  borderColor: 'divider',
                },
                '& td:last-of-type': {
                  borderRight: '1px solid',
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  borderColor: 'divider',
                },
              }}
            >
              <TableCell>
                <Box fontWeight="500">{job.company || '—'}</Box>
              </TableCell>

              <TableCell>
                {job.url ? (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Link
                      href={job.url}
                      target="_blank"
                      rel="noopener"
                      underline="hover"
                      color="inherit"
                      sx={{ fontWeight: 600 }}
                    >
                      {job.title || '—'}
                    </Link>
                    <Link
                      href={job.url}
                      target="_blank"
                      rel="noopener"
                      color="inherit"
                      sx={{ display: 'flex', opacity: 0.5 }}
                    >
                      <LaunchIcon sx={{ fontSize: 14 }} />
                    </Link>
                  </Box>
                ) : (
                  <Box fontWeight="600">{job.title || '—'}</Box>
                )}
                {job.notes && (
                  <Tooltip title={job.notes} arrow placement="bottom-start">
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'text.disabled',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 200,
                      }}
                    >
                      {job.notes}
                    </Box>
                  </Tooltip>
                )}
              </TableCell>

              <TableCell>
                <FormControl
                  size="small"
                  variant="standard"
                  sx={{ minWidth: 100 }}
                >
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
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: statusColors[job.status || 'Applied'],
                    }}
                  >
                    <MenuItem value="Applied" sx={{ fontSize: '0.875rem' }}>
                      Applied
                    </MenuItem>
                    <MenuItem
                      value="Interviewing"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      Interviewing
                    </MenuItem>
                    <MenuItem value="Offer" sx={{ fontSize: '0.875rem' }}>
                      Offer
                    </MenuItem>
                    <MenuItem value="Rejected" sx={{ fontSize: '0.875rem' }}>
                      Rejected
                    </MenuItem>
                    <MenuItem value="Expired" sx={{ fontSize: '0.875rem' }}>
                      Expired
                    </MenuItem>
                  </Select>
                </FormControl>
              </TableCell>

              <TableCell>
                {job.level ? (
                  <Chip
                    label={job.level}
                    size="small"
                    color={levelColors[job.level] || 'default'}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                ) : (
                  '—'
                )}
              </TableCell>

              <TableCell>
                {job.interest !== undefined && String(job.interest) !== '' ? (
                  <Chip
                    label={`${job.interest}`}
                    size="small"
                    color={interestColors[String(job.interest)] || 'default'}
                    variant="filled"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                ) : (
                  '—'
                )}
              </TableCell>

              <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  {format(
                    new Date(job.createdAt.replace(/-/g, '/')),
                    'MMM d, yyyy'
                  )}
                  {job.status === 'Applied' &&
                    differenceInDays(
                      new Date(),
                      new Date(job.createdAt.replace(/-/g, '/'))
                    ) > 7 && (
                      <Tooltip
                        title={`It's been ${differenceInDays(new Date(), new Date(job.createdAt))} days since you applied. Consider following up!`}
                        placement="top"
                      >
                        <WarningAmberIcon
                          color="warning"
                          sx={{ fontSize: 18 }}
                        />
                      </Tooltip>
                    )}
                  {job.status === 'Expired' && (
                    <Tooltip
                      title={`It's been ${differenceInDays(new Date(), new Date(job.createdAt))} days since you applied. This application has expired!`}
                      placement="top"
                    >
                      <AutoDeleteOutlinedIcon
                        color="disabled"
                        sx={{ fontSize: 18 }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>

              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={0.5}>
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{ p: 0.5 }}
                    onClick={() => onEdit(job)}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ p: 0.5 }}
                    onClick={() => onDelete(job.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
