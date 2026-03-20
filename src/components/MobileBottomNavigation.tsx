import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';

interface MobileBottomNavigationProps {
  activeTab: 'applications' | 'interviews';
  setActiveTab: (tab: 'applications' | 'interviews') => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        backdropFilter: 'blur(10px)',
        background:
          theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={activeTab}
        onChange={(_event, newValue) => {
          setActiveTab(newValue);
        }}
        sx={{
          backgroundColor: 'transparent',
          borderTop: '1px solid',
          borderColor: 'divider',
          height: 64,
        }}
      >
        <BottomNavigationAction
          label="Applications"
          value="applications"
          icon={<WorkIcon />}
        />
        <BottomNavigationAction
          label="Interviews"
          value="interviews"
          icon={<EventIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};
