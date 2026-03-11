import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Fab, IconButton,
  CssBaseline, AppBar, Toolbar, useTheme, Pagination,
  Paper
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { JobTableView } from '../components/JobTableView';
import { JobModal } from '../components/JobModal';
import { SettingsModal } from '../components/SettingsModal';
import { RejectionOverlay } from '../components/RejectionOverlay';
import { getJobs, addJob, updateJob, deleteJob } from '../utils/storage';
import type { JobApplication } from '../utils/storage';
import { ColorModeContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const isAiEnabled = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [sortBy, setSortBy] = useState<string>('dateDesc');
  const [page, setPage] = useState(1);
  const [showRejection, setShowRejection] = useState(false);
  const ITEMS_PER_PAGE = 100;
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { logout } = useAuth();

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const handleSaveJob = async (jobDetails: Omit<JobApplication, 'id' | 'createdAt'> & { createdAt?: string }) => {
    if (editingJob) {
      const updated = await updateJob(editingJob.id, jobDetails);
      if (updated) {
        // Merge the update into the existing job to preserve all fields (e.g. createdAt)
        setJobs(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...updated } : j));
      }
    } else {
      const newJob = await addJob(jobDetails);
      setJobs(prev => [newJob, ...prev]);
    }
    setEditingJob(null);
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleEditClick = (job: JobApplication) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: JobApplication['status']) => {
    const prevJob = jobs.find(j => j.id === id);
    const updated = await updateJob(id, { status: newStatus });
    if (updated) {
      // Merge into the existing job so we don't lose fields like createdAt
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j));
    }

    // 🎉 Celebrate milestone status transitions
    const prev = prevJob?.status;
    if (prev === 'Applied' && newStatus === 'Interviewing') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#7c3aed', '#06b6d4', '#f59e0b'],
      });
    } else if (prev === 'Interviewing' && newStatus === 'Offer') {
      confetti({ particleCount: 150, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#f59e0b', '#ef4444', '#2563eb', '#7c3aed'] });
      confetti({ particleCount: 150, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#f59e0b', '#ef4444', '#2563eb', '#7c3aed'] });
    } else if (newStatus === 'Rejected') {
      setShowRejection(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing the editing job so the modal doesn't immediately change text while transitioning out
    setTimeout(() => setEditingJob(null), 200);
  };

  const handleSort = (column: string) => {
    setSortBy(prev => {
      // Toggle logic: if clicking same column, switch direction. Otherwise default to desc.
      if (prev === `${column}Desc`) return `${column}Asc`;
      if (prev === `${column}Asc`) return `${column}Desc`;
      return `${column}Desc`;
    });
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'dateDesc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'dateAsc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'titleAsc') return a.title.localeCompare(b.title);
    if (sortBy === 'titleDesc') return b.title.localeCompare(a.title);

    const getInterestVal = (interest?: string | number) => {
      if (interest === 'High') return 3;
      if (interest === 'Medium') return 2;
      if (interest === 'Low') return 1;
      return 0;
    };

    if (sortBy === 'interestDesc') return getInterestVal(b.interest) - getInterestVal(a.interest);
    if (sortBy === 'interestAsc') return getInterestVal(a.interest) - getInterestVal(b.interest);

    const getStatusVal = (status?: string) => {
      if (status === 'Offer') return 4;
      if (status === 'Interviewing') return 3;
      if (status === 'Applied') return 2;
      if (status === 'Rejected') return 1;
      return 0;
    };

    if (sortBy === 'statusDesc') return getStatusVal(b.status) - getStatusVal(a.status);
    if (sortBy === 'statusAsc') return getStatusVal(a.status) - getStatusVal(b.status);

    return 0;
  });

  const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = {
    total: jobs.length,
    interviewing: jobs.filter(j => j.status === 'Interviewing').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <CssBaseline />

      <AppBar position="static" elevation={0} color="inherit" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src="/logo.svg"
              alt="Job Tracker Logo"
              sx={{ width: 32, height: 32, mr: 2 }}
            />
            <Typography variant="h6" color="text.primary" fontWeight="bold">
              Job application tracker
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            {isAiEnabled && (
              <IconButton onClick={() => setIsSettingsOpen(true)} color="inherit" sx={{ mr: 1 }}>
                <SettingsIcon />
              </IconButton>
            )}
            <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ mr: 1 }}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={logout} color="inherit" title="Logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" mb={4} gap={2}>
          <Box mb={2}>
            <Typography variant="h4" component="h1" fontWeight="800" gutterBottom>
              My applications
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              You've tracked {jobs.length} application{jobs.length === 1 ? '' : 's'}. Keep going!
            </Typography>
          </Box>
        </Box>

        {jobs.length > 0 && (
          <Box mb={4}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
              <Box>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="primary.main" fontWeight="bold">Total applied</Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>{stats.total}</Typography>
                </Paper>
              </Box>
              <Box>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="warning.main" fontWeight="bold">Interviewing</Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>{stats.interviewing}</Typography>
                </Paper>
              </Box>
              <Box>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="success.main" fontWeight="bold">Offers</Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>{stats.offers}</Typography>
                </Paper>
              </Box>
              <Box>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Rejected</Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>{stats.rejected}</Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}

        {jobs.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <WorkOutlineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No applications tracked yet
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              Click the + button to add your first job application.
            </Typography>
          </Box>
        ) : (
          <Box>
            <JobTableView
              jobs={paginatedJobs}
              onDelete={handleDeleteJob}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
              sortBy={sortBy}
              onSort={handleSort}
            />

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={6} mb={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Box>
        )}
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <RejectionOverlay
        visible={showRejection}
        onDone={() => setShowRejection(false)}
      />

      <JobModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        initialData={editingJob}
      />

      {isAiEnabled && (
        <SettingsModal
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </Box>
  );
};
