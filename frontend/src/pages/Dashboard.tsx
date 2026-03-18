import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, Fab, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { JobModal } from '../components/JobModal';
import { SettingsModal } from '../components/SettingsModal';
import { RejectionOverlay } from '../components/RejectionOverlay';
import { InterviewDashboard } from './InterviewDashboard';
import { getJobs, addJob, updateJob } from '../utils/storage';
import type { JobApplication } from '../utils/storage';
import { ColorModeContext } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { AppBar } from '../components/AppBar';
import { ApplicationsDashboard } from './ApplicationsDashboard';

export const Dashboard: React.FC = () => {
  const isAiEnabled = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  const [showRejection, setShowRejection] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'interviews'>('applications');

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingJob(null), 200);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <CssBaseline />

      <AppBar
        theme={theme}
        isMobile={isMobile}
        isAiEnabled={isAiEnabled}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsSettingsOpen={setIsSettingsOpen}
        colorMode={colorMode}
        logout={logout}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {
          activeTab === 'applications' ? (
            <ApplicationsDashboard
              jobs={jobs}
              setJobs={setJobs}
              setEditingJob={setEditingJob}
              setIsModalOpen={setIsModalOpen}
              setShowRejection={setShowRejection}
              isMobile={isMobile}
            />
          ) : (
            <InterviewDashboard jobs={jobs} />
          )}
      </Container>

      {activeTab === 'applications' && <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon />
      </Fab>}

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
