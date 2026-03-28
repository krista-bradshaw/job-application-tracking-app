import React, { useState, useContext } from 'react';
import AddIcon from '@mui/icons-material/Add';
import {
  Container,
  Box,
  Fab,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { MobileBottomNavigation } from '../components/MobileBottomNavigation';
import { JobModal } from '../components/JobModal';
import { SettingsModal } from '../components/SettingsModal';
import { RejectionOverlay } from '../components/RejectionOverlay';
import { InterviewDashboard } from './InterviewDashboard';
import { useJobs, useAddJob, useUpdateJob } from '../hooks/useJobs';
import type { JobApplication } from '../types';
import { ColorModeContext } from '../contexts/ColorModeContext';
import { useAuth } from '../contexts/AuthContext';
import { AppBar } from '../components/AppBar';
import { ApplicationsDashboard } from './ApplicationsDashboard';

export const Dashboard: React.FC = () => {
  const isAiEnabled = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: jobs = [], isLoading: isJobsLoading } = useJobs();
  const addJobMutation = useAddJob();
  const updateJobMutation = useUpdateJob();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  const [showRejection, setShowRejection] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'interviews'>(
    'applications'
  );
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState('');

  const colorMode = useContext(ColorModeContext);
  const { logout } = useAuth();

  const handleSaveJob = async (
    jobDetails: Omit<JobApplication, 'id' | 'createdAt'> & {
      createdAt?: string;
    }
  ) => {
    if (editingJob) {
      await updateJobMutation.mutateAsync({
        id: editingJob.id,
        updates: jobDetails,
      });
    } else {
      await addJobMutation.mutateAsync(jobDetails);
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
        pb: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 0,
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
        setIsModalOpen={setIsModalOpen}
      />

      <Container
        maxWidth="xl"
        sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}
      >
        {activeTab === 'applications' ? (
          <ApplicationsDashboard
            jobs={jobs}
            isLoading={isJobsLoading}
            setJobs={() => {}} // This prop will be removed in next step from ApplicationsDashboard
            setEditingJob={setEditingJob}
            setIsModalOpen={setIsModalOpen}
            setShowRejection={setShowRejection}
            isMobile={isMobile}
            searchText={searchText}
            setSearchText={setSearchText}
            onNavigateToInterviews={(id) => {
              setExpandedInterviewId(id);
              setActiveTab('interviews');
            }}
          />
        ) : (
          <InterviewDashboard
            jobs={jobs}
            expandedJobId={expandedInterviewId}
            setExpandedJobId={setExpandedInterviewId}
            onNavigateToApplications={(_, company) => {
              if (company) setSearchText(company);
              setActiveTab('applications');
            }}
          />
        )}
      </Container>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'applications' && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: isMobile
              ? 'calc(80px + env(safe-area-inset-bottom) + 16px)'
              : 32,
            right: 24,
            boxShadow: theme.shadows[4],
            zIndex: 1100,
          }}
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

      {isAiEnabled && isSettingsOpen && (
        <SettingsModal
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </Box>
  );
};
