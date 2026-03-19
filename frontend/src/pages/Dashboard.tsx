import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Box,
  Fab,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { JobModal } from '../components/JobModal';
import { SettingsModal } from '../components/SettingsModal';
import { RejectionOverlay } from '../components/RejectionOverlay';
import { InterviewDashboard } from './InterviewDashboard';
import { subDays, isBefore } from 'date-fns';
import { getJobs, addJob, updateJob } from '../utils/storage';
import type { JobApplication } from '../types';
import { ColorModeContext } from '../contexts/ColorModeContext';
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
  const [activeTab, setActiveTab] = useState<'applications' | 'interviews'>(
    'applications'
  );

  const colorMode = useContext(ColorModeContext);
  const { logout } = useAuth();

  useEffect(() => {
    getJobs().then(async (fetchedJobs) => {
      const threeWeeksAgo = subDays(new Date(), 21);
      
      const updatedJobs = await Promise.all(
        fetchedJobs.map(async (job) => {
          if (
            job.status === 'Applied' &&
            isBefore(new Date(job.createdAt.replace(/-/g, '/')), threeWeeksAgo)
          ) {
            const updated = await updateJob(job.id, { status: 'Expired' });
            return updated ? { ...job, ...updated } : job;
          }
          return job;
        })
      );
      setJobs(updatedJobs);
    });
  }, []);

  const handleSaveJob = async (
    jobDetails: Omit<JobApplication, 'id' | 'createdAt'> & {
      createdAt?: string;
    }
  ) => {
    if (editingJob) {
      const updated = await updateJob(editingJob.id, jobDetails);
      if (updated) {
        setJobs((prev) =>
          prev.map((j) => (j.id === editingJob.id ? { ...j, ...updated } : j))
        );
      }
    } else {
      const newJob = await addJob(jobDetails);
      setJobs((prev) => [newJob, ...prev]);
    }
    setEditingJob(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingJob(null), 200);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
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

      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}
      >
        {activeTab === 'applications' ? (
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

      {activeTab === 'applications' && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => setIsModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {showRejection && (
        <RejectionOverlay onDone={() => setShowRejection(false)} />
      )}

      <JobModal
        key="job-modal-root"
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        initialData={editingJob}
      />

      {isAiEnabled && (
        <SettingsModal
          key="settings-modal-root"
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </Box>
  );
};
