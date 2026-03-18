import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Fab, IconButton,
  CssBaseline, AppBar, Toolbar, useTheme, Pagination,
  Paper, useMediaQuery, Select, MenuItem, FormControl, InputLabel, TextField, InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AddIcon from '@mui/icons-material/Add';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { JobTableView } from '../components/JobTableView';
import { JobCardView } from '../components/JobCardView';
import { JobModal } from '../components/JobModal';
import { SettingsModal } from '../components/SettingsModal';
import { RejectionOverlay } from '../components/RejectionOverlay';
import { InterviewDashboard } from './InterviewDashboard';
import { getJobs, addJob, updateJob, deleteJob } from '../utils/storage';
import type { JobApplication } from '../utils/storage';
import { ColorModeContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const isAiEnabled = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [sortBy, setSortBy] = useState<string>('statusDesc');
  const [page, setPage] = useState(1);
  const [showRejection, setShowRejection] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'applications' | 'interviews'>('applications');
  const ITEMS_PER_PAGE = 100;

  const colorMode = useContext(ColorModeContext);
  const { logout } = useAuth();

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const handleSaveJob = async (jobDetails: Omit<JobApplication, 'id' | 'createdAt'> & { createdAt?: string }) => {
    if (editingJob) {
      const updated = await updateJob(editingJob.id, jobDetails);
      if (updated) {
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
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j));
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
      confetti({ particleCount: 150, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#f59e0b', '#ef4444', '#2563eb', '#7c3aed'] });
      confetti({ particleCount: 150, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#f59e0b', '#ef4444', '#2563eb', '#7c3aed'] });
    } else if (newStatus === 'Rejected') {
      setShowRejection(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingJob(null), 200);
  };

  const handleSort = (column: string) => {
    setSortBy(prev => {
      if (prev === `${column}Desc`) return `${column}Asc`;
      if (prev === `${column}Asc`) return `${column}Desc`;
      return `${column}Desc`;
    });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchText.toLowerCase()) ||
      job.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesLevel = levelFilter === 'All' || (job.level || '—') === levelFilter;

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
      const levels = ['Internship', 'Entry', 'Mid', 'Senior', 'Lead', 'Manager'];
      const idx = levels.indexOf(level || '');
      return idx === -1 ? -1 : idx;
    };

    let result = 0;
    if (sortBy === 'dateDesc') result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    else if (sortBy === 'dateAsc') result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortBy === 'titleAsc') result = a.title.localeCompare(b.title);
    else if (sortBy === 'titleDesc') result = b.title.localeCompare(a.title);
    else if (sortBy === 'interestDesc') result = getInterestVal(b.interest) - getInterestVal(a.interest);
    else if (sortBy === 'interestAsc') result = getInterestVal(a.interest) - getInterestVal(b.interest);
    else if (sortBy === 'statusDesc') result = getStatusVal(b.status) - getStatusVal(a.status);
    else if (sortBy === 'statusAsc') result = getStatusVal(a.status) - getStatusVal(b.status);
    else if (sortBy === 'companyAsc') result = a.company.localeCompare(b.company);
    else if (sortBy === 'companyDesc') result = b.company.localeCompare(a.company);
    else if (sortBy === 'levelAsc') result = getLevelVal(a.level) - getLevelVal(b.level);
    else if (sortBy === 'levelDesc') result = getLevelVal(b.level) - getLevelVal(a.level);

    // Tie-break by Interest (descending) if result is 0
    if (result === 0) {
      return getInterestVal(b.interest) - getInterestVal(a.interest);
    }
    return result;
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

      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          top: 0,
          zIndex: theme.zIndex.appBar,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src="/logo.svg"
              alt="Job Tracker Logo"
              sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 }, mr: { xs: 1, sm: 2 } }}
            />
            <Typography variant={isMobile ? "subtitle1" : "h6"} color="text.primary" fontWeight="bold">
              Job Tracker
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            {isAiEnabled && (
              <IconButton onClick={() => setIsSettingsOpen(true)} color="inherit" size={isMobile ? "small" : "medium"}>
                <SettingsIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            )}
            <IconButton onClick={colorMode.toggleColorMode} color="inherit" size={isMobile ? "small" : "medium"}>
              {theme.palette.mode === 'dark' ? <LightModeIcon fontSize={isMobile ? "small" : "medium"} /> : <DarkModeIcon fontSize={isMobile ? "small" : "medium"} />}
            </IconButton>
            <IconButton onClick={logout} color="inherit" title="Logout" size={isMobile ? "small" : "medium"}>
              <LogoutIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} component="h1" fontWeight="800" gutterBottom sx={{ mb: 0.5 }}>
              My applications
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {filteredJobs.length === jobs.length
                ? `You've tracked ${jobs.length} application${jobs.length === 1 ? '' : 's'}.`
                : `Showing ${filteredJobs.length} of ${jobs.length} applications.`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', backgroundColor: 'background.paper', borderRadius: 2, p: 0.5, border: '1px solid', borderColor: 'divider' }}>
            <Button
              variant={activeTab === 'applications' ? 'contained' : 'text'}
              disableElevation
              onClick={() => setActiveTab('applications')}
              sx={{ borderRadius: 1.5, px: 3, py: 0.5 }}
            >
              Applications
            </Button>
            <Button
              variant={activeTab === 'interviews' ? 'contained' : 'text'}
              disableElevation
              onClick={() => setActiveTab('interviews')}
              sx={{ borderRadius: 1.5, px: 3, py: 0.5 }}
            >
              Interviews
            </Button>
          </Box>
        </Box>

        {activeTab === 'applications' ? (
          <>
            {/* Summary Cards */}
            {jobs.length > 0 && (
              <Box
                display="grid"
                gap={2}
                mb={4}
                sx={{
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }
                }}
              >
                <Paper elevation={0} sx={{ flex: 1, minWidth: '150px', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'primary.main', backgroundColor: 'rgba(37, 99, 235, 0.05)' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">Total Applications</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, minWidth: '150px', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'warning.main', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.interviewing}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">Active Interviews</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, minWidth: '150px', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'success.main', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                  <Typography variant="h4" fontWeight="bold" color={'success.main'}>{stats.offers}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">Offers Received</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, minWidth: '150px', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'error.main', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                  <Typography variant="h4" fontWeight="bold" color={'error.main'}>{stats.rejected}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">Rejected</Typography>
                </Paper>
              </Box>
            )}

            {jobs.length > 0 && (
              <Box mb={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', md: 'center' }
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
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchText && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchText('')}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
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
                        <MenuItem value="Junior">Junior</MenuItem>
                        <MenuItem value="Mid">Mid</MenuItem>
                        <MenuItem value="Senior">Senior</MenuItem>
                        <MenuItem value="Lead">Lead</MenuItem>
                        <MenuItem value="—">Other</MenuItem>
                      </Select>
                    </FormControl>

                    {(searchText || statusFilter !== 'All' || levelFilter !== 'All') && (
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
                {isMobile && (
                  <Box mb={2} display="flex" justifyContent="flex-end">
                    <FormControl size="small" variant="outlined" sx={{ minWidth: 140 }}>
                      <InputLabel id="mobile-sort-label" sx={{ fontSize: '0.8rem' }}>Sort by</InputLabel>
                      <Select
                        labelId="mobile-sort-label"
                        value={sortBy}
                        label="Sort by"
                        onChange={(e) => setSortBy(e.target.value as string)}
                        sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}
                        startAdornment={<SortIcon sx={{ fontSize: 18, mr: 1, opacity: 0.7 }} />}
                      >
                        <MenuItem value="dateDesc">Newest first</MenuItem>
                        <MenuItem value="dateAsc">Oldest first</MenuItem>
                        <MenuItem value="titleAsc">Role (A-Z)</MenuItem>
                        <MenuItem value="titleDesc">Role (Z-A)</MenuItem>
                        <MenuItem value="interestDesc">Highest Interest</MenuItem>
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
                  />
                ) : (
                  <JobTableView
                    jobs={paginatedJobs}
                    onDelete={handleDeleteJob}
                    onEdit={handleEditClick}
                    onStatusChange={handleStatusChange}
                    sortBy={sortBy}
                    onSort={handleSort}
                  />
                )}

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3} mb={1}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                )}
              </Box>
            )}
          </>
        ) : (
          <InterviewDashboard jobs={jobs} />
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
