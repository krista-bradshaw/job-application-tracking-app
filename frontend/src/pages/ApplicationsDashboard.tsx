import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Pagination,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { JobTableView } from '../components/JobTableView';
import { JobCardView } from '../components/JobCardView';
import { updateJob, deleteJob } from '../utils/storage';
import type { JobApplication } from '../types';
import confetti from 'canvas-confetti';
import { SummaryCard } from '../components/SummaryCard';

interface ApplicationsDashboardProps {
  jobs: JobApplication[];
  setJobs: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  setEditingJob: React.Dispatch<React.SetStateAction<JobApplication | null>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRejection: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  onNavigateToInterviews: (id: string) => void;
}

const DEFAULT_ROWS_PER_PAGE = 9;

export const ApplicationsDashboard = ({
  jobs,
  setJobs,
  setEditingJob,
  setIsModalOpen,
  setShowRejection,
  isMobile,
  searchText,
  setSearchText,
  onNavigateToInterviews,
}: ApplicationsDashboardProps) => {
  const [sortBy, setSortBy] = useState<string>('statusDesc');
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('rowsPerPage');
    return saved ? parseInt(saved) : DEFAULT_ROWS_PER_PAGE;
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    localStorage.setItem('rowsPerPage', rowsPerPage.toString());
  }, [rowsPerPage]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [showOfferBanner, setShowOfferBanner] = useState(false);
  const [offerJob, setOfferJob] = useState<JobApplication | null>(null);

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  const handleEditClick = (job: JobApplication) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: JobApplication['status']
  ) => {
    const prevJob = jobs.find((j) => j.id === id);
    const updated = await updateJob(id, { status: newStatus });
    if (updated) {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...updated } : j))
      );
    }

    const prev = prevJob?.status;
    if (prev === 'Applied' && newStatus === 'Interviewing') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#7c3aed', '#06b6d4', '#f59e0b'],
      });
    } else if (prev === 'Interviewing' && newStatus === 'Offer') {
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#f59e0b', '#ef4444', '#2563eb', '#7c3aed'],
      });
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#f59e0b', '#ef4444', '#2563eb', '#7c3aed'],
      });
      setOfferJob(updated || prevJob || null);
      setShowOfferBanner(true);
    } else if (newStatus === 'Rejected') {
      setShowRejection(true);
    }
  };
  const handleSort = (column: string) => {
    setSortBy((prev) => {
      if (prev === `${column}Desc`) return `${column}Asc`;
      if (prev === `${column}Asc`) return `${column}Desc`;
      return `${column}Desc`;
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchText.toLowerCase()) ||
      job.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesLevel =
      levelFilter === 'All' || (job.level || '—') === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const getInterestVal = (interest?: string | number) => {
      if (interest === 'High') return 3;
      if (interest === 'Medium') return 2;
      if (interest === 'Low') return 1;
      return 0;
    };

    const getStatusVal = (status?: string) => {
      if (status === 'Offer') return 4;
      if (status === 'Interviewing') return 3;
      if (status === 'Applied') return 2;
      if (status === 'Rejected') return 1;
      return 0;
    };

    const getLevelVal = (level?: string) => {
      const levels = [
        'Internship',
        'Entry',
        'Mid',
        'Senior',
        'Lead',
        'Manager',
      ];
      const idx = levels.indexOf(level || '');
      return idx === -1 ? -1 : idx;
    };
    let result = 0;
    if (sortBy === 'dateDesc')
      result =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    else if (sortBy === 'dateAsc')
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortBy === 'titleAsc') result = a.title.localeCompare(b.title);
    else if (sortBy === 'titleDesc') result = b.title.localeCompare(a.title);
    else if (sortBy === 'interestDesc')
      result = getInterestVal(b.interest) - getInterestVal(a.interest);
    else if (sortBy === 'interestAsc')
      result = getInterestVal(a.interest) - getInterestVal(b.interest);
    else if (sortBy === 'statusDesc')
      result = getStatusVal(b.status) - getStatusVal(a.status);
    else if (sortBy === 'statusAsc')
      result = getStatusVal(a.status) - getStatusVal(b.status);
    else if (sortBy === 'companyAsc')
      result = a.company.localeCompare(b.company);
    else if (sortBy === 'companyDesc')
      result = b.company.localeCompare(a.company);
    else if (sortBy === 'levelAsc')
      result = getLevelVal(a.level) - getLevelVal(b.level);
    else if (sortBy === 'levelDesc')
      result = getLevelVal(b.level) - getLevelVal(a.level);

    // Tie-break by Interest (descending) if result is 0
    if (result === 0) {
      return getInterestVal(b.interest) - getInterestVal(a.interest);
    }
    return result;
  });

  const totalPages = Math.ceil(sortedJobs.length / rowsPerPage);
  const paginatedJobs = sortedJobs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const stats = {
    total: jobs.length,
    interviewing: jobs.filter((j) => j.status === 'Interviewing').length,
    waiting: jobs.filter((j) => j.status === 'Applied').length,
    rejected: jobs.filter((j) => j.status === 'Rejected').length,
    expired: jobs.filter((j) => j.status === 'Expired').length,
  };

  return (
    <>
      {/* Offer Celebration Banner */}
      {showOfferBanner && offerJob && (
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'slideDown 0.5s ease-out',
            '@keyframes slideDown': {
              '0%': { transform: 'translateY(-20px)', opacity: 0 },
              '100%': { transform: 'translateY(0)', opacity: 1 },
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 40 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5 }}>
                CONGRATULATIONS!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                You've received an offer from{' '}
                <strong>{offerJob.company}</strong> for the{' '}
                <strong>{offerJob.title}</strong> role!
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setShowOfferBanner(false)}
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <ClearIcon />
          </IconButton>
        </Paper>
      )}

      {/* Summary Cards */}
      {jobs.length > 0 && (
        <Box
          display="grid"
          gap={2}
          mb={3}
          sx={{
            gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(5, 1fr)' },
          }}
        >
          <SummaryCard
            stat={stats.total}
            label="Applied"
            color="primary.main"
            backgroundColor="rgba(37, 99, 235, 0.05)"
          />
          <SummaryCard
            stat={stats.waiting}
            label="Awaiting feedback"
            color="info.main"
            backgroundColor="rgba(2, 132, 199, 0.05)"
          />
          <SummaryCard
            stat={stats.interviewing}
            label="Active Interviews"
            color="warning.main"
            backgroundColor="rgba(245, 158, 11, 0.05)"
          />
          <SummaryCard
            stat={stats.rejected}
            label="Rejected"
            color="error.main"
            backgroundColor="rgba(239, 68, 68, 0.05)"
          />
          <SummaryCard
            stat={stats.expired}
            label="Expired (>3wks)"
            color="text.disabled"
            backgroundColor="rgba(0, 0, 0, 0.05)"
          />
        </Box>
      )}

      {jobs.length > 0 && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >
            <TextField
              size="small"
              placeholder="Search company or role..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: 'text.secondary' }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Interviewing">Interviewing</MenuItem>
                  <MenuItem value="Offer">Offer</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="level-filter-label">Level</InputLabel>
                <Select
                  labelId="level-filter-label"
                  value={levelFilter}
                  label="Level"
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <MenuItem value="All">All Levels</MenuItem>
                  <MenuItem value="Entry">Entry</MenuItem>
                  <MenuItem value="Mid">Mid</MenuItem>
                  <MenuItem value="Senior">Senior</MenuItem>
                  <MenuItem value="Lead">Lead</MenuItem>
                  <MenuItem value="—">Other</MenuItem>
                </Select>
              </FormControl>

              {(searchText ||
                statusFilter !== 'All' ||
                levelFilter !== 'All') && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchText('');
                    setStatusFilter('All');
                    setLevelFilter('All');
                  }}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {jobs.length === 0 ? (
        <Box
          textAlign="center"
          py={8}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <WorkOutlineIcon
            sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No applications tracked yet
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            Click the + button to add your first job application.
          </Typography>
        </Box>
      ) : (
        <Box>
          {isMobile && (
            <Box mb={2} display="flex" justifyContent="flex-end">
              <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: 140 }}
              >
                <InputLabel id="mobile-sort-label" sx={{ fontSize: '0.8rem' }}>
                  Sort by
                </InputLabel>
                <Select
                  labelId="mobile-sort-label"
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value as string)}
                  sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}
                  startAdornment={
                    <SortIcon sx={{ fontSize: 18, mr: 1, opacity: 0.7 }} />
                  }
                >
                  <MenuItem value="dateDesc">Newest first</MenuItem>
                  <MenuItem value="dateAsc">Oldest first</MenuItem>
                  <MenuItem value="titleAsc">Role (A-Z)</MenuItem>
                  <MenuItem value="titleDesc">Role (Z-A)</MenuItem>
                  <MenuItem value="interestDesc">Interest</MenuItem>
                  <MenuItem value="statusDesc">Status (Highest)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {isMobile ? (
            <JobCardView
              jobs={paginatedJobs}
              onDelete={handleDeleteJob}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
              onNavigateToInterviews={onNavigateToInterviews}
            />
          ) : (
            <JobTableView
              jobs={paginatedJobs}
              onDelete={handleDeleteJob}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
              sortBy={sortBy}
              onSort={handleSort}
              onNavigateToInterviews={onNavigateToInterviews}
            />
          )}

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={3}
            gap={2}
            flexWrap="wrap"
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Rows per page:
              </Typography>
              <Select
                size="small"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                sx={{ height: 32, fontSize: '0.75rem' }}
              >
                {[9, 30, 50, 100, 200].map((size) => (
                  <MenuItem
                    key={size}
                    value={size}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};
